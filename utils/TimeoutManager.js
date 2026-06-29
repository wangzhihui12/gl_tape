/*
 * @Descripttion:    轮询管理器
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-12-06 10:13:02
 * @LastEditors: limin
 * @LastEditTime: 2025-01-08 10:27:45
 * @FilePath: \gl_tape\utils\TimeoutManager.js
 */
class TimeoutManager {
  waitTime = 5 * 60 * 1000
  outTime = 15 * 60 * 1000
  constructor() {
    this.tasks = []
  }
  addTimeout(waitTime, outTime = this.outTime) {
    this.tasks = []
    const timeout = new Promise(resolve => {
      this.tasks.push(resolve)
      setTimeout(resolve, outTime, 'timeout')
    })
    const promises = [this.delay(waitTime), timeout]
    return Promise.race(promises)
  }

  cancelAllTasks() {
    while (this.tasks.length) {
      const abort = this.tasks.shift()
      abort('abort')
    }
    uni.$logger.local.info('强制取消轮询.')
  }

  get isProcessing() {
    return this.tasks.length > 0
  }

  delay(interval = this.waitTime) {
    return new Promise(resolve => {
      this.tasks.push(resolve)
      setTimeout(resolve, interval)
      uni.$logger.local.info(interval + 'ms后开始下一轮上传!')
    })
  }
}
export default TimeoutManager
