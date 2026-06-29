import { isInteger } from '@/utils/utils.js'
export default class RemoveLogWorker {
  constructor() {}
  work(deviceId, data, ws) {
    //参数可以不传,默认7天
    const days = data.days
    if (!isInteger(days) || days==0) {
      const error = `RemoveLogWorker -> 删除日志: 参数错误!days 必需为数字!  days -> ${days} `
      ws.send({ error, data })
      uni.$logger.local.error(error)
      return
    }
    uni.$logger.local.removeOverDays(days)
    const msg = `删除${days}天前的日志成功!`
    uni.$logger.local.info(msg)
    ws.send({ code: 200, msg: msg, data })
  }
}
