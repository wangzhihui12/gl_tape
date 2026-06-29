export default class TempRecordsWorker {
  constructor() {}
  async work(deviceId, data, ws) {
    try {
      const tempRecords = await uni.$dbRecord.getTempRecords()
      const msg = `记录获取待提交记录成功 temp records -> ${JSON.stringify(tempRecords)}`
      uni.$logger.local.info(msg)
      ws.send({ code: 200,msg: '获取待提交记录成功', data:tempRecords })
    } catch (error) {
      const msg = `获取待提交记录失败 error -> ${error.message}`
      uni.$logger.local.error(msg)
      ws.send({ error: msg })
    }
  }
}