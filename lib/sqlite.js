import TaskQueue from '../utils/TaskQueue'
import { PathUtils } from '../utils/recordManager/index'
class SQLite {
  static _queues = {} // 静态队列字典，key为数据库名，value为 TaskQueue 实例

  constructor(name, version, description, size) {
    this.name = name
    this.version = version || '1.0'
    this.description = description || 'SQLite DB'
    this.size = size || 50 * 1024 * 1024 // 50MB
    this.db = null
    //注意：
    this.dbPath = `_doc/${name}.db` // 存储数据库的完整路径
    this.dbPath = `_doc/${name}.db` // 存储数据库的完整路径
    // 初始化该数据库的队列（如果不存在）
    if (!SQLite._queues[name]) {
      SQLite._queues[name] = new TaskQueue(`SQLite:${name}`)
    }
  }

  _enqueue(task) {
    // 使用共享的队列实例
    const queueInstance = SQLite._queues[this.name]
    return queueInstance.enqueue(task)
  }

  async init() {
    // 如果已经有路径，直接使用
    // if (this.dbPath) {
      uni.$logger?.local?.info(`[SQLite] 使用已有路径: ${this.dbPath}`)
      return this.openDatabase()
    // }
    // 获取当前文档目录路径
    // const rootPath = await PathUtils.getFilePath()
    // this.dbPath = `${rootPath}${this.name}.db`
    // uni.$logger?.local?.info(`[SQLite] 数据库路径已确定: ${this.dbPath}`)
    // return this.openDatabase()
  }

  /**
   * 打开数据库
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      uni.$logger?.local?.info(`[SQLite] 尝试打开数据库: path=${this.dbPath}`)
      const isOpen = this.isOpen()
      if (isOpen) {
        uni.$logger?.local?.info(`[SQLite] 数据库已打开，跳过重复打开`)
        resolve(true)
        return
      }
      plus.sqlite.openDatabase({
        name: this.name,
        path: this.dbPath,
        success: e => {
          uni.$logger?.local?.info(`[SQLite] ✅ 数据库打开成功`)
          resolve(e)
        },
        fail: e => {
          // 处理 -1402 错误 (Same Name Already Open)，视为成功
          if (e.code === -1402) {
            uni.$logger?.local?.warn(`[SQLite] ⚠️ 数据库已打开 (Code -1402), 视为成功: ${this.name}`)
            resolve(e)
            return
          }
          uni.$logger?.local?.error(`[SQLite] ❌ 数据库打开失败: ${JSON.stringify(e)}`)
          reject(e)
        }
      })
    })
  }

  selectSql(sql) {
    return this._enqueue(
      () =>
        new Promise((resolve, reject) => {
          uni.$logger.local.warn(`执行SQL语句: ${sql}`)
          plus.sqlite.selectSql({
            name: this.name,
            sql,
            success: result => {
              // 处理查询结果，尝试还原数组或对象字符串
              const processedRows = result.map(row =>
                Object.fromEntries(
                  Object.entries(row).map(([key, value]) => {
                    // 优化：仅当 value 是字符串且以 { 或 [ 开头时才尝试解析
                    // 避免将普通数字字符串(如 "123")误解析为 Number 导致精度丢失
                    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                      try {
                        return [key, JSON.parse(value)]
                      } catch {
                        return [key, value]
                      }
                    }
                    return [key, value]
                  })
                )
              )
              resolve(processedRows)
            },
            fail: reject
          })
        })
    )
  }

  executeSql(sql) {
    return this._enqueue(
      () =>
        new Promise((resolve, reject) => {
          uni.$logger.local.warn(`执行SQL语句: ${sql}`)
          plus.sqlite.executeSql({
            name: this.name,
            sql,
            success: resolve,
            fail: reject
          })
        })
    )
  }
  async isTableExists(tableName) {
    const sql = `SELECT COUNT(*) as isTable FROM sqlite_master WHERE type='table' and name='${tableName}'`
    try {
      const result = await this.selectSql(sql)
      return result[0].isTable ? true : false
    } catch (error) {
      console.error('检查表是否存在出错: ', error)
      throw error
    }
  }
  // 创建新表示例
  createTable(tableName, columns) {
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`
    return this.executeSql(sql)
  }

  // 查询示例
  select(tabName, where, order) {
    let sql = `SELECT * FROM ${tabName}`
    if (where) {
      const dataKeys = Object.keys(where)
      const conditions = dataKeys.map(key => `${key}=${JSON.stringify(where[key])}`).join(' AND ')
      sql += ` WHERE ${conditions}`
    }
    if (order) {
      const orderKey = Object.keys(order)[0] // 获取排序字段
      const orderType = order[orderKey] // 获取排序类型
      sql += ` ORDER BY ${orderKey} ${orderType}`
    }
    return this.selectSql(sql)
  }

  // 插入示例
  insert(tabName, keyValues) {
    const keys = Object.keys(keyValues)
    const keyStr = keys.join(', ')
    const valStr = keys
      .map(key => {
        const value = keyValues[key]
        // 使用公共方法进行格式化
        return `${this.formatValue(value)}`
      })
      .join(', ')
    const sql = `INSERT INTO ${tabName} (${keyStr}) VALUES (${valStr})`
    return this.executeSql(sql)
  }

  // 更新示例
  update(tabName, setData, where) {
    const dataKeys = Object.keys(setData)
    const setStr = dataKeys
      .map(key => {
        const value = setData[key]
        return `${key} = ${this.formatValue(value)}`
      })
      .join(', ')

    const whereKeys = Object.keys(where)
    const whereStr = whereKeys
      .map(key => {
        const value = where[key]
        return `${key} = ${this.formatValue(value)}`
      })
      .join(' AND ')

    const sql = `UPDATE ${tabName} SET ${setStr} WHERE ${whereStr}`
    return this.executeSql(sql)
  }

  // 删除示例
  delete(tabName, where) {
    const whereKeys = Object.keys(where)
    const whereStr = whereKeys
      .map(key => {
        const value = where[key]
        return `${key} = ${this.formatValue(value)}`
      })
      .join(' AND ')
    const sql = `DELETE FROM ${tabName} WHERE ${whereStr}`
    return this.executeSql(sql)
  }
  isOpen() {
    let isopen = plus.sqlite.isOpenDatabase({
      name: this.name,
      path: this.dbPath
    })
    return isopen
  }
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('数据库连接已关闭')
    }
  }
  drop(tabName) {
    const sql = `DROP TABLE IF EXISTS ${tabName}`
    return this.executeSql(sql)
  }
  formatValue(value) {
    let strVal = ''
    if (typeof value === 'object' && value !== null) {
      strVal = JSON.stringify(value)
    } else {
      strVal = String(value)
    }
    // SQL 中转义单引号的方法是将 ' 替换为 ''
    return `'${strVal.replace(/'/g, "''")}'`
  }

  /**
   * 检查指定字段是否存在于表中
   * @param {string} tableName - 表名
   * @param {string} columnName - 要检查的字段名
   * @returns {Promise<boolean>} - 字段存在返回true，否则返回false
   */
  async isColumnExists(tableName, columnName) {
    try {
      const columnInfo = await this.selectSql(`PRAGMA table_info(${tableName})`)
      return columnInfo.some(col => col.name === columnName)
    } catch (error) {
      console.error(`检查字段是否存在失败 error - >  ${error.message}`)
      throw new Error(error.message)
    }
  }

  /**
   * 批量添加字段到表中
   * @param {string} tableName - 表名
   * @param {Array<{name: string, definition: string}>} columns - 要添加的字段数组
   * @returns {Promise<void>}
   */
  async addColumns(tableName, columns) {
    try {
      for (const column of columns) {
        const { name, definition = 'TEXT DEFAULT ""' } = column
        await this.executeSql(`ALTER TABLE ${tableName} ADD COLUMN ${name} ${definition}`)
      }
    } catch (error) {
      console.error(`批量添加列失败 error - >  ${error.message}`)
      throw new Error(error.message)
    }
  }
}
export default SQLite
// 使用示例
/* const db = new SQLite('mydb', '1.0', 'Test DB', 1 * 1024 * 1024);
  db.init().then(() => {
    // 进行数据库操作
  }).catch(error => {
    console.error('数据库初始化失败: ', error);
  });*/
