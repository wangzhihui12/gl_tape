/*
 * @Descripttion: 通用任务队列类实现了串行执行、超时控制、异常隔离等功能
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-14 12:03:27
 * @LastEditors: limin
 * @LastEditTime: 2026-01-22 15:45:20
 * @FilePath: \gl_tape\utils\TaskQueue.js
 */
export default class TaskQueue {
  constructor(name = 'TaskQueue') {
    this.name = name
    this.queue = Promise.resolve()
  }

  /**
   * 将任务加入队列
   * @param {Function} task - 返回 Promise 的任务函数
   * @param {number} timeout - 超时时间(ms)，默认 20000
   * @returns {Promise}
   */
  enqueue(task, timeout = 20000) {
    const taskWithTimeout = () => this._withTimeout(task, timeout)
    
    // 将任务追加到队列末尾
    const next = this.queue.then(taskWithTimeout).catch(err => {
      // 队列自身的错误不应中断后续任务，但这里的 err 已经被 taskWithTimeout 内部捕获并处理了
      // 这里再次抛出是为了让调用者能捕获到错误
      throw err
    })

    // 更新队列指针，确保队列始终指向最新的 Promise，且永远是 resolved 状态（catch 了错误）
    // 这样后续任务不会因为前一个任务失败而无法执行
    this.queue = next.catch(() => {})
    
    return next
  }

  /**
   * 带超时控制的任务执行器
   * @private
   */
  _withTimeout(task, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const error = new Error(`${this.name}操作超时(${timeout}ms)`)
        uni.$logger.local.error(error.message)
        reject(error)
      }, timeout)

      // 使用 Promise.resolve().then(task) 确保即使 task() 同步抛错也能被捕获并进入 finally
      Promise.resolve().then(task)
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId))
    })
  }
}