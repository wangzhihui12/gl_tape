/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-09-03 14:22:52
 * @LastEditors: limin
 * @LastEditTime: 2026-01-22 16:21:17
 * @FilePath: \gl_tape\utils\logger\RemoteLog.js
 */
import sentryInit from '@/utils/sentryConfig/sentryInit'
import { LogLevel , RemoteExtraDataKey} from './constants'
class RemoteLog {
  sentry = null
  constructor(user) {
    this.sentry = sentryInit()
    this.sentry.setUser(user)
  }
  debug(info) {
    this.send(LogLevel.DEBUG, info)
  }
  info(info) {
    this.send(LogLevel.INFO, info)
  }
  warn(info) {
    this.send(LogLevel.WARN, info)
  }
  error(info) {
    this.send(LogLevel.ERROR, info)
  }
  send(level, { extra = {}, msg, tag = { key: '', value: '' } }) {
    this.sentry.withScope(scope => {
      // 1. 设置 Tag
      if (tag && tag.key) {
        scope.setTag(tag.key, tag.value)
      }

      // 2. 自动补充环境信息到 Extra
      const systemInfo = uni.getSystemInfoSync()
      const enhancedExtra = {
        ...extra,
        device_brand: systemInfo.brand,
        device_model: systemInfo.model,
        os_name: systemInfo.osName, // uni-app x 支持，或用 platform
        os_version: systemInfo.osVersion,
        uni_platform: systemInfo.uniPlatform,
        app_version: systemInfo.appVersion,
        network_type: 'unknown' // 可选：尝试获取网络状态
      }
      
      // 尝试获取网络状态（如果允许异步）
      // uni.getNetworkType({ success: (res) => enhancedExtra.network_type = res.networkType })

      scope.setExtra(RemoteExtraDataKey, enhancedExtra)
      
      // 3. 设置级别
      scope.setLevel(level)

      // 4. 上报 (区分 Error 对象和普通消息)
      // 如果 msg 本身就是 Error 对象，直接上报以保留堆栈信息
      // 如果是字符串，则包装成 Error
      if (msg instanceof Error) {
        this.sentry.captureException(msg)
      } else {
        // 将字符串消息作为 Error 的 message，这样在 Sentry 面板中更直观
        const error = new Error(String(msg))
        // 可以手动尝试附加调用栈（虽然 new Error 已经有了）
        this.sentry.captureException(error)
      }
    })
  }
}
export default RemoteLog
