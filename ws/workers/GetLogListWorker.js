import { serializeIfObject } from '@/utils/utils.js'
export default class GetLogListWorker {
  constructor() {}
  work(deviceId, data, ws) {
    try {
      const beginDate = data.beginDate
      const endDate = data.endDate
      const LogList = uni.$logger.local.getFiles(beginDate, endDate)
      uni.$logger.local.info(`获取日志列表成功! beginDate ->${beginDate} endDate-> ${endDate} res->${serializeIfObject(LogList)}`)
      ws.send({ LogList })
    } catch (error) {
      uni.$logger.local.error(`获取日志列表失败! beginDate ->${beginDate} endDate-> ${endDate} error->${serializeIfObject(error.message)}`)
    }
  }
}
