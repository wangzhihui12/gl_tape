/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-11-22 08:18:23
 * @LastEditors: limin
 * @LastEditTime: 2026-01-13 19:02:14
 * @FilePath: \gl_tape\utils\recordManager\DBManager.js
 */
import { SQLite } from '../../lib'
/**
 * 记录管理器类
 * 用于管理记录列表
 */
class DBManager {
  db = null
  db_name = 'zyzs'
  db_version = '1.0'
  db_table_name = 'records'
  db_description = 'zyzs db'
  db_size = 50 * 1024 * 1024
  sqlite = null
  isTableExists = false
  constructor(table_name, table_columns) {
    this.table_name = table_name || this.db_table_name
    this.table_columns = table_columns
    this.db = new SQLite(this.db_name, this.db_version, this.db_description, this.db_size)
  }
  async init() {
    try {
      const isOpen = await this.db.isOpen()
      if (!isOpen) {
        await this.db.init()
      }
      const isTableExists = await this.db.isTableExists(this.table_name)
      uni.$logger.warn(`数据库是否存在isTableExists: ${isTableExists}`)
      if (!isTableExists) {
        await this.db.createTable(this.table_name, this.table_columns)
      }
      // else {  //如果存在 判断需要新增的字段是否存在 不存在则添加
      //   const isColumnExists = await this.db.isColumnExists(this.table_name, 'carBrand')
      //   console.log(isColumnExists, 'isColumnExists')
      //   uni.$logger.info(`字段是否存在isColumnExists: ${isColumnExists}`)
      //   if (!isColumnExists) {
      //     await this.db.addColumns(this.table_name, [
      //       { name: 'carBrand', definition: 'TEXT DEFAULT ""' },
      //       { name: 'carBrandId', definition: 'INTEGER DEFAULT 0' },
      //       { name: 'oneCarBrand', definition: 'TEXT DEFAULT ""' },
      //       { name: 'oneCarBrandId', definition: 'INTEGER DEFAULT 0' }
      //     ])
      //   }
      // }
      return true
    } catch (error) {
      uni.$logger.error(`初始化数据库失败 error - >  ${error.message}`)
      throw new Error(error.message)
    }
  }
  async openDB() {}
  /**
   * 将一条新记录添加到当前对象的记录列表中
   *
   * @param {Object} record - 要添加的新记录对象
   * @returns {Array} - 包含新记录的更新后的记录列表
   */
  async addRecord(record) {
    await this.db.insert(this.table_name, record)
  }
  /**
   * 移除一个ID对应的记录
   *
   * @param {number} id - 要移除的记录的ID
   * @returns {Array} - 移除记录后的更新后的记录列表
   */
  async removeRecord(id) {
    return this.db.delete(this.table_name, { id })
  }
  /**
   * 根据给定的 ID 获取一条记录
   *
   * @param {number} id - 要获取的记录的 ID
   * @returns {Object} - 具有给定 ID 的记录对象，如果没有找到符合条件的记录，则返回 undefined
   *
   */
  async getRecordById(id) {
    const records = await this.db.select(this.table_name, { id })
    return Array.isArray(records) ? records[0] : records // sqlite 返回数组
  }
  /**
   * 根据条件获取记录列表
   * @param {Object} where - 查询条件
   * @returns {Array} - 记录列表
   */
  async getRecordsByWhere(where) {
    return this.db.select(this.table_name, where)
  }
  /**
   * 获取记录列表
   *
   * @returns {Array} - 从 storageApi 获取的记录列表
   */
  async getRecords() {
    return this.db.select(this.table_name)
  }
  /**
   * 设置记录列表
   *
   * @param {Array} records - 要设置的记录列表
   * @returns {void} - 此函数不返回任何值
   */
  async setRecords(records) {
    return records.forEach(async record => {
      this.addRecord(record)
    })
  }
  /**
   * 更新记录数组中的记录
   * 这个函数用于更新给定记录数组中的特定记录
   * 它接受一个参数 record，该参数是要更新的记录对象
   *
   * @param {Object} record - 要更新的记录对象，必须包含一个唯一的 id 属性
   * @throws {Error} 如果记录数组中找不到具有给定 id 的记录，将抛出错误
   */
  async updateRecord(setData, where) {
    const { id, ...record } = setData
    if (!where) {
      where = { id }
    }
    return this.db.update(this.table_name, record, where)
  }
  async isOpen() {
    return this.db.isOpen()
  }
  async isTableExists() {
    return this.db.isTableExists(this.table_name)
  }
  /**
   * 清除所有记录
   *
   * @returns {void} - 此函数不返回任何值
   */
  async clearRecords() {
    this.db.delete(this.table_name)
  }
  async drop() {
    this.db.drop(this.table_name)
  }
}
export default DBManager
