/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-11-20 15:05:41
 * @LastEditors: limin
 * @LastEditTime: 2025-01-06 09:36:48
 * @FilePath: \gl_tape\utils\OperationQueue.js
 */
class OperationQueue {
  constructor(options = {}) {
    this.queue = []
    this.processing = false
    this.maxQueueSize = options.maxQueueSize || 1000
    this.operationTimeout = options.operationTimeout || 5 * 60 * 1000 // 5分钟超时
  }

  async enqueue(operation, context = '') {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Queue capacity exceeded')
    }
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        context,
        resolve,
        reject,
        timestamp: Date.now()
      })
      uni.$logger.local.info(`【操作入列】  [${context}], 当前队列长度: ${this.queue.length}`)
      this.processQueue().catch(error => {
        uni.$logger.local.error(`【操作队列】 队列处理发生错误: ${error.message}`)
      })
    })
  }

  async processQueue() {
    if (this.processing) return
    this.processing = true
    try {
      while (this.queue.length > 0) {
        const { operation, context, resolve, reject, timestamp } = this.queue[0] // 使用peek而不是shift
        uni.$logger.local.info(`【操作队列】 开始处理操作 [${context}], 等待时间: ${Date.now() - timestamp}ms`)
        try {
          // 添加超时处理
          const result = await Promise.race([
            operation(),
            new Promise(resolve => setTimeout(() => resolve('Operation timeout'), this.operationTimeout))
          ])
          resolve(result)
          uni.$logger.local.info(`【操作完成】 [${context}],耗时: ${Date.now() - timestamp}ms`)
        } catch (error) {
          uni.$logger.local.error(`【操作失败】 [${context}]: ${error.message}`)
          reject(error)
        } finally {
          this.queue.shift() // 确保任务一定会被移除
          uni.$logger.local.info(`【操作出列】 [${context}], 当前队列长度: ${this.queue.length}`)
        }
        // 添加任务间隔，避免过度占用CPU
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    } finally {
      this.processing = false
    }
  }

  // 新增：清空队列方法
  clear() {
    const rejectedItems = this.queue.splice(0, this.queue.length)
    rejectedItems.forEach(item => {
      item.reject(new Error('Queue was cleared'))
    })
    uni.$logger.local.warn(`【操作队列】 队列已清空，丢弃了 ${rejectedItems.length} 个任务`)
  }

  // 新增：获取队列状态
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      oldestTaskAge: this.queue[0] ? Date.now() - this.queue[0].timestamp : 0
    }
  }
}
export default OperationQueue
