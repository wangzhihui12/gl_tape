import { isInteger } from '@/utils/utils.js'
export default class SetPollingIntervalWorker {
  constructor() {}
  work(deviceId, data, ws) {
    const interval = data.interval
    const isForce = !!data.force
    if (!isInteger(interval)) {
      const error = `SetPollingIntervalWorker -> 设置轮询时间间隔: 参数错误!interval 必需为数字!  interval -> ${interval} `
      ws.send({ error, data })
      uni.$logger.local.error(error)
      return
    }
    uni.$emit(data.command, interval,isForce)
    ws.send({ code: 200, msg: `设置轮询间隔时间成功!当前间隔时间为 -> ${interval} s`, data })
  }
}
