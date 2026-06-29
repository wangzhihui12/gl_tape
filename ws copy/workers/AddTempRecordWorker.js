import { RecordDto } from '@/utils/recordManager/index'
export default class AddTempRecordWorker {
  constructor() {}
  async work(deviceId, data, ws) {
    try {
      const record = data.data
      if (!record) {
        throw new Error(`数据格式错误，请提供 record 数据`)
      }
      const keys = Object.keys(record)
      const dto = new RecordDto({})
      const existKeys = ['id', 'recordUrlList','tempFilePath']
      keys.forEach(key => {
        if (!existKeys.includes(key) && !dto.hasOwnProperty(key)) {
          throw new Error(`数据格式错误，表中没有 ${key} 字段`)
        }
      })
      await uni.$dbTempRecord.addRecord(record)
      const msg = `写入待提交记录成功 temp record -> ${JSON.stringify(record)}`
      uni.$logger.local.info(msg)
      ws.send({ code: 200,msg: '写入待提交记录成功', data:record })
    } catch (error) {
      const msg = `写入待提交记录失败 error -> ${error.message}`
      uni.$logger.local.error(msg)
      ws.send({ error: msg })
    }
  }
}
