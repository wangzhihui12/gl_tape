export default class StopPollingWorker {
  constructor() {}
  work(deviceId, data, ws) {
    uni.$emit(data.command)
    const msg = `终止轮询指令下发并执行成功!`
    ws.send({ code: 200, msg, data })
  }
}
