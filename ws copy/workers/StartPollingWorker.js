export default class StartPollingWorker {
  constructor() {}
  work(deviceId, data, ws) {
    const isForce = !!data.force
    uni.$emit(data.command, isForce)
    const msg = `启动轮询指令下发并执行成功!`
    ws.send({ code: 200, msg, data })
  }
}
