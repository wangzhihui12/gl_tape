import { serializeIfObject } from '@/utils/utils.js'
export default class MessageWorker {
  constructor() {}
  work(deviceId, data) {
    uni.$logger.local.info(`收到WebSocket 消息: deviceId->${deviceId}, data->${serializeIfObject(data)}`)
    // console.log(`收到WebSocket 消息: deviceId->${deviceId}, data->${typeof data ==='[object Object]'?JSON.stringify(data):data}`)
  }
}
