import { serializeIfObject } from '@/utils/utils.js'
export default class RecordsWorker {
  constructor() {}
  async work(deviceId, data, ws) {
    try {
      const records = await uni.$dbRecord.getCompletedRecords()
      const msg = `记录获取成功 records -> ${JSON.stringify(records)}`
      uni.$logger.local.info(msg)
      ws.send({ code: 200, msg: '获取记录成功', data:records })
    } catch (error) {
      const msg = `获取记录失败 error -> ${error.message}`
      uni.$logger.local.error(msg)
      ws.send({ error: msg })
    }
  }
}
