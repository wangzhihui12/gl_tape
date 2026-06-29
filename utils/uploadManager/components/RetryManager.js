/*
 * @Author: AI Assistant
 * @Date: 2025-01-28
 * @Description: 重试管理器 - 处理上传失败的自动重试逻辑
 * @Feature: oss-upload-refactor
 */

/**
 * 重试管理器
 * 
 * 功能：
 * 1. 执行带重试逻辑的异步函数
 * 2. 支持指数退避策略
 * 3. 支持自定义重试条件
 * 4. 支持重试回调
 * 
 * 设计原则：
 * - 通用性：可用于任何异步函数的重试
 * - 灵活性：支持自定义重试策略和条件
 */
class RetryManager {
  /**
   * 执行带重试逻辑的函数
   * 
   * @param {Function} fn - 要执行的异步函数
   * @param {Object} options - 重试选项
   * @param {number} [options.maxRetries=3] - 最大重试次数
   * @param {Function|number} [options.retryDelay] - 重试延迟（毫秒）或延迟计算函数
   * @param {Function} [options.shouldRetry] - 判断是否应该重试的函数
   * @param {Function} [options.onRetry] - 重试时的回调函数
   * @returns {Promise} 函数执行结果
   * @throws {Error} 所有重试都失败后抛出最后一次的错误
   * 
   * @example
   * // 基本用法
   * await retryManager.executeWithRetry(
   *   () => uploadFile(file),
   *   { maxRetries: 3 }
   * )
   * 
   * @example
   * // 自定义重试策略
   * await retryManager.executeWithRetry(
   *   () => uploadFile(file),
   *   {
   *     maxRetries: 3,
   *     retryDelay: (attempt) => Math.pow(2, attempt) * 1000, // 指数退避
   *     shouldRetry: (error) => !error.message.includes('cancelled'),
   *     onRetry: (attempt, error) => console.log(`Retry ${attempt}: ${error.message}`)
   *   }
   * )
   */
  async executeWithRetry(fn, options = {}) {
    const {
      maxRetries = 3,
      retryDelay = (attempt) => attempt * 1000,
      shouldRetry = () => true,
      onRetry = () => {}
    } = options

    let lastError
    
    // 尝试执行函数（初次 + 重试）
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 执行函数
        const result = await fn()
        
        // 成功，返回结果
        if (attempt > 0) {
          uni.$logger?.local?.info(`[RetryManager] Success after ${attempt} retries`)
        }
        return result
        
      } catch (error) {
        lastError = error
        
        // 判断是否应该重试
        const isLastAttempt = attempt >= maxRetries
        const canRetry = shouldRetry(error)
        
        if (!isLastAttempt && canRetry) {
          // 计算延迟时间
          const delay = typeof retryDelay === 'function' 
            ? retryDelay(attempt) 
            : retryDelay
          
          // 调用重试回调
          onRetry(attempt + 1, error)
          
          uni.$logger?.local?.warn(`[RetryManager] Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`)
          
          // 等待后重试
          await this.sleep(delay)
        } else {
          // 不再重试，跳出循环
          if (isLastAttempt) {
            uni.$logger?.local?.error(`[RetryManager] All ${maxRetries} retries exhausted`)
          } else {
            uni.$logger?.local?.error(`[RetryManager] Retry skipped: ${error.message}`)
          }
          break
        }
      }
    }

    // 所有重试都失败，抛出最后一次的错误
    throw lastError
  }

  /**
   * 延迟执行
   * 
   * @param {number} ms - 延迟时间（毫秒）
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 创建指数退避延迟函数
   * 
   * @param {number} baseDelay - 基础延迟时间（毫秒）
   * @param {number} maxDelay - 最大延迟时间（毫秒）
   * @returns {Function} 延迟计算函数
   * 
   * @example
   * const retryDelay = RetryManager.createExponentialBackoff(1000, 10000)
   * // attempt 0: 1000ms
   * // attempt 1: 2000ms
   * // attempt 2: 4000ms
   * // attempt 3: 8000ms
   * // attempt 4: 10000ms (capped)
   */
  static createExponentialBackoff(baseDelay = 1000, maxDelay = 60000) {
    return (attempt) => {
      const delay = baseDelay * Math.pow(2, attempt)
      return Math.min(delay, maxDelay)
    }
  }

  /**
   * 创建线性延迟函数
   * 
   * @param {number} baseDelay - 基础延迟时间（毫秒）
   * @returns {Function} 延迟计算函数
   * 
   * @example
   * const retryDelay = RetryManager.createLinearBackoff(1000)
   * // attempt 0: 1000ms
   * // attempt 1: 2000ms
   * // attempt 2: 3000ms
   */
  static createLinearBackoff(baseDelay = 1000) {
    return (attempt) => baseDelay * (attempt + 1)
  }

  /**
   * 创建固定延迟函数
   * 
   * @param {number} delay - 固定延迟时间（毫秒）
   * @returns {Function} 延迟计算函数
   * 
   * @example
   * const retryDelay = RetryManager.createFixedDelay(2000)
   * // 每次重试都延迟 2000ms
   */
  static createFixedDelay(delay = 1000) {
    return () => delay
  }
}

// 导出管理器类
export default RetryManager
