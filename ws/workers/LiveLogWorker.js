/*
 * @Author: cen
 * @Date: 2026-04-08 11:12:21
 * @Description: 
 * @FilePath: /gl_tape/ws/workers/LiveLogWorker.js
 * @LastEditTime: 2026-04-08 15:25:05
 * @LastEditors: cenchengwei@foreverht.com
 * 可以输入预定的版权声明、个性签名、空行等
 */
import { serializeIfObject } from '@/utils/utils.js'

export default class LiveLogWorker {
  constructor() {}

  work(deviceId, data, ws) {
    const { action } = data // 'start' | 'stop'
    if (action === 'start') {
      uni.$logger.local.info('[LiveLogWorker] 开启实时日志流')
      
      // 设置监听器
      uni.$logger.setLogListener((level, info) => {
        // 防止死循环：这里发送 WS 消息，如果 WS 发送失败导致 logger.error，会再次触发监听器
        // 简单处理：只发送非 WS 相关的日志，或者信任 WS 库不会在 send 时狂打日志
        // 这里直接发送
        try {
          // 构造日志消息对象
          const logMsg = {
            command: 'liveLog', // 确保加上 command 字段，方便后端识别
            type: 'liveLog',
            level,
            info: typeof info === 'object' ? serializeIfObject(info) : info,
            timestamp: Date.now()
          }
          ws.send({ code: 200, msg: logMsg })
        } catch (e) {
          // 忽略发送错误，避免死循环
          console.error('Live log send failed', e)
        }
      })

      ws.send({ code: 200, msg: '实时日志已开启' })

    } else if (action === 'stop') {
      uni.$logger.setLogListener(null)
      uni.$logger.info('[LiveLogWorker] 关闭实时日志流')
      ws.send({ code: 200, msg: '实时日志已关闭' })
    } else {
      ws.send({ error: '未知动作: ' + action })
    }
  }
}
