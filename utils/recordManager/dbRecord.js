/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-02 18:34:39
 * @LastEditors: limin
 * @LastEditTime: 2026-01-22 15:58:34
 * @FilePath: \gl_tape\utils\recordManager\dbRecord.js
 */
import DBManager from './DBManager.js'
class DBRecord extends DBManager {
  constructor() {
    const table_name = 'records'
    const table_columns = [
      `id TEXT PRIMARY KEY`,
      `staffUuid TEXT`,
      `staffName TEXT`,
      `serviceMerchantId INTEGER`,
      'carModel TEXT',
      'endReasonType INTEGER',
      'customerName TEXT',
      'phoneNumber TEXT',
      'appCode TEXT',
      'loginPhone TEXT',
      'salesName TEXT',
      'salesUuid TEXT',
      'receptionStatus INTEGER',
      'receptionStartTime TEXT',
      'receptionEndTime TEXT',
      'receptionCustomerPaySourceList TEXT',
      'merchantId INTEGER',
      'merchantName TEXT',
      'bussinessType INTEGER',
      'channelType INTEGER',
      'receptionCustomerMaterialPointList TEXT',
      'recordUrlList TEXT',
      'carBrand TEXT',
      'carBrandId INTEGER',
      'oneCarBrand TEXT',
      'oneCarBrandId INTEGER',
      'tempFilePath TEXT',
      'recordStatus INTEGER DEFAULT 1' // 0: recording, 1: completed
    ]
    super(table_name, table_columns)
    this._initPromise = null
  }

   async init() {
    if (this._initPromise) return this._initPromise
    this._initPromise = (async () => {
      try {
        await super.init()
        await this.ensureColumns()
        await this.migrateTempRecords()
        return true
      } catch (e) {
        uni.$logger.local.error('DBRecord: init failed ' + e.message)
        throw e
      }
    })()
    return this._initPromise
  }

  /**
   * 确保表字段存在（用于版本升级）
   */
  async ensureColumns() {
    try {
      // 优化：只查询一次表结构
      const columnInfo = await this.db.selectSql(`PRAGMA table_info(${this.table_name})`)
      const existingColumns = columnInfo.map(col => col.name)
      const columnsToAdd = this.table_columns.reduce((acc, colDef) => {
        const [name, ...def] = colDef.trim().split(/\s+/)
        if (name && !existingColumns.includes(name)) {
          acc.push({ name, definition: def.join(' ') })
        }
        return acc
      }, [])

      if (columnsToAdd.length > 0) {
        await this.db.addColumns(this.table_name, columnsToAdd)
        uni.$logger.local.info(`DBRecord: Added columns ${columnsToAdd.map(c => c.name).join(', ')}`)
      }
    } catch (e) {
      uni.$logger.local.error('DBRecord: ensureColumns failed ' + e.message)
    }
  }

  /**
   * 将旧的临时表数据迁移到正式表
   */
  async migrateTempRecords() {
    const tempTableName = 'temp_records'
    try {
      const exists = await this.db.isTableExists(tempTableName)
      if (!exists) return

      uni.$logger.local.warn('DBRecord: Found temp_records table, starting migration...')

      // 获取所有临时记录
      const tempRecords = await this.db.selectSql(`SELECT * FROM ${tempTableName}`)

      if (tempRecords && tempRecords.length > 0) {
        for (const record of tempRecords) {
          if (!record.id) continue

          // 标记为进行中
          record.recordStatus = 0

          // 检查是否已存在
          const existing = await this.getRecordById(record.id)
          if (existing) {
            // 如果存在，说明正式表已有记录，temp_records 中的是残留数据，直接跳过
            uni.$logger.local.warn(`DBRecord: Temp record ${record.id} already exists in records, skipping migration.`)
          } else {
            // 如果不存在，插入它
            await this.addRecord(record)
            uni.$logger.local.info(`DBRecord: Migrated temp record ${record.id}`)
          }
        }
      }
      // 迁移完成后删除旧表
      await this.db.drop(tempTableName)
      uni.$logger.local.warn('DBRecord: Migration completed, temp_records table dropped.')

    } catch (e) {
      uni.$logger.local.error('DBRecord: Migration failed ' + e.message)
    }
  }

  /**
   * 获取已完成的接待记录 (recordStatus = 1)
   */
  async getCompletedRecords() {
    return this.getRecordsByWhere({ recordStatus: 1 })
  }

  /**
   * 获取进行中/临时的接待记录 (recordStatus = 0)
   */
  async getTempRecords() {
    return this.getRecordsByWhere({ recordStatus: 0 })
  }
}
export default DBRecord
