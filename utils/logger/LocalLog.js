/*
 * @Author: cen
 * @Date: 2026-04-01 15:45:44
 * @Description: 
 * @FilePath: /gl_tape/utils/logger/LocalLog.js
 * @LastEditTime: 2026-04-08 15:23:26
 * @LastEditors: cenchengwei@foreverht.com
 * 可以输入预定的版权声明、个性签名、空行等
 */
import LogCat from './LogCat'
import { LogLevel } from './constants'
import { getTime, withinSpliter, daysBetween } from './util'
class LocalLog {
  logger = null
  logListener = null
  constructor() {
    // #ifdef APP-PLUS
    this.logger = new LogCat()
    this.removeOverDays(90)
    // #endif
  }
  setLogListener (listener) {
    this.logListener = listener
  }
  _write (level, msg) {
    // #ifdef APP-PLUS
    this.logger.writeLog(level, msg)
    if (this.logListener) {
      try {
        this.logListener(level, msg)
      } catch (e) {
        console.error('LocalLog listener error', e)
      }
    }
    // #endif
  }
  debug (msg) {
    this._write(LogLevel.DEBUG, msg)
  }
  info (msg) {
    this._write(LogLevel.INFO, msg)
  }
  warn (msg) {
    this._write(LogLevel.WARN, msg)
  }
  error (msg) {
    this._write(LogLevel.ERROR, msg)
  }
  getFiles (beginDate, endDate) {
    const logFiles = this.logger.getLogFileList()
    if ((!beginDate && !endDate) || !logFiles.length) return logFiles
    beginDate = +withinSpliter(beginDate)
    endDate = +withinSpliter(endDate)
    // prettier-ignore
    const fileList = logFiles.reduce((list, { name, path }) => {
      const fileDate = +withinSpliter(name.split('.').shift())
      if (fileDate >= beginDate && fileDate <= endDate) {
        list.push(path)
      }
      return list
    }, []);
    // console.log('fileList', fileList)
    // this.logger.zip(fileList)
    return fileList
  }
  removeOverDays (day = 7) {
    this.logger._cleanOldLogs(day)
    //   const logFiles = this.logger.getLogFileList()
    //   if (!logFiles.length) return
    //   const today = getTime('YYYY-MM-DD')
    //   logFiles.forEach(({ name, path }) => {
    //     const fileDate = name.split('.').shift()
    //     if (daysBetween(fileDate, today) > day) {
    //       this.logger.removeLogFile(path)
    //     }
    //   })
  }
}
export default LocalLog
