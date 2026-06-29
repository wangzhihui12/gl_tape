/*
 * @Author: cen
 * @Date: 2026-04-01 15:45:44
 * @Description: 
 * @FilePath: /gl_tape/utils/logger/index.js
 * @LastEditTime: 2026-04-08 15:29:42
 * @LastEditors: cenchengwei@foreverht.com
 * 可以输入预定的版权声明、个性签名、空行等
 */
// import { index } from './env'
import RemoteLog from './RemoteLog'
import LocalLog from './LocalLog'
import { LogLevel } from './constants'
import { storageApi } from '../cache'
import { getIp } from './util'
class Logger {
  remote = null
  local = null
  fields = []
  logListener = null
  constructor(fields = []) {
    this.fields = fields
    this.init()
  }
   init() {
    const user =  this.getUserInfo()
    this.remote = new RemoteLog(user)
    this.local = new LocalLog()
  }
  setLogListener(listener) {
    this.logListener = listener
    if (this.local) {
      this.local.setLogListener(listener)
    }
  }
  debug(info) {
    this.write(LogLevel.DEBUG, info)
  }
  info(info) {
    this.write(LogLevel.INFO, info)
  }
  warn(info) {
    this.write(LogLevel.WARN, info)
  }
  error(info) {
    this.write(LogLevel.ERROR, info)
  }
  write(level, info) {
    this.remote[level](info)
    this.local[level](info)
    // console.log("🚀 ~ Logger ~ write ~ level:", this.logListener)
    // if (this.logListener) {
    //   try {
    //     this.logListener(level, info)
    //   } catch (e) {
    //     console.error('Log listener error', e)
    //   }
    // }
  }
   getUserInfo() {
    const userInfo = storageApi.getUserInfo()
    // const ip = await getIp()
    const user = this.fields.reduce((pre, cur) => {
      pre[cur] = userInfo[cur]
      return pre
    }, {})
    user.name = userInfo.name
    user.merchantName = userInfo.merchantName
    // user.ip = ip
    return user
  }
}
export default new Logger()
