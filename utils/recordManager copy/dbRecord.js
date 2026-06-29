/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-02 18:34:39
 * @LastEditors: limin
 * @LastEditTime: 2025-01-06 09:36:04
 * @FilePath: \gl_tape\utils\recordManager\dbRecord.js
 */
import DBManager from '../DBManager.js'
class DBRecord {
  table_columns = [
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
    'tempFilePath TEXT',
    'carBrand TEXT',
    'carBrandId INTEGER',
    'oneCarBrand TEXT',
    'oneCarBrandId INTEGER'
  ]
  table_name = 'temp_records'
  constructor() {
    this.db = new DBManager(this.table_name, this.table_columns)
    return this.db
  }
}
export default DBRecord
