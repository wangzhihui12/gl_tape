/*
 * @Description: WebView 策略调试工具
 * @Usage: 在上传前调用 debugWebViewStrategy() 查看详细状态
 */

import { getUploadManager } from '@/utils/uploadManager/UploadManager.js'

/**
 * 调试 WebView 策略状态
 * 
 * 在上传前调用此方法，查看 WebView 策略的详细状态
 */
export function debugWebViewStrategy() {
  console.log('========== WebView 策略调试信息 ==========')
  
  const uploadManager = getUploadManager()
  
  // 1. 检查 UploadManager
  if (!uploadManager) {
    console.error('❌ UploadManager 未初始化')
    return
  }
  console.log('✅ UploadManager 已初始化')
  
  // 2. 检查文件大小阈值
  const threshold = uploadManager.getFileSizeThreshold()
  const thresholdMB = (threshold / 1024 / 1024).toFixed(2)
  console.log(`📏 文件大小阈值: ${thresholdMB} MB`)
  console.log(`   - < ${thresholdMB} MB: 优先使用 UniApp`)
  console.log(`   - >= ${thresholdMB} MB: 优先使用 WebView`)
  
  // 3. 检查 WebView 策略
  const webviewStrategy = uploadManager.strategySelector.getStrategy(STRATEGY_NAMES.WEBVIEW)
  if (!webviewStrategy) {
    console.error('❌ WebView 策略未注册')
    return
  }
  console.log('✅ WebView 策略已注册')
  
  // 4. 检查 WebView 支持
  const isSupported = webviewStrategy.isSupported()
  console.log(`${isSupported ? '✅' : '❌'} WebView 支持: ${isSupported}`)
  
  // 5. 检查 WebView 就绪
  const isReady = webviewStrategy.isReady()
  console.log(`${isReady ? '✅' : '❌'} WebView 就绪: ${isReady}`)
  
  if (!isReady) {
    console.warn('⚠️ WebView 未就绪，可能原因：')
    console.warn('   1. WebView 未初始化')
    console.warn('   2. 未收到 webview_ready 信号')
    console.warn('   3. WebView 加载失败')
  }
  
  // 6. 检查 UniApp 策略
  const uniappStrategy = uploadManager.strategySelector.getStrategy(STRATEGY_NAMES.UNIAPP)
  if (uniappStrategy) {
    const uniappSupported = uniappStrategy.isSupported()
    const uniappReady = uniappStrategy.isReady()
    console.log(`${uniappSupported ? '✅' : '❌'} UniApp 支持: ${uniappSupported}`)
    console.log(`${uniappReady ? '✅' : '❌'} UniApp 就绪: ${uniappReady}`)
  }
  
  // 7. 检查所有可用策略
  const supportedStrategies = uploadManager.getSupportedStrategies()
  console.log(`📋 支持的策略: [${supportedStrategies.join(', ')}]`)
  
  // 8. 模拟策略选择
  console.log('\n========== 模拟策略选择 ==========')
  
  // 小文件
  const smallFileSize = 10 * 1024 * 1024 // 10MB
  const smallFilePriority = uploadManager._getStrategyPriorityByFileSize(smallFileSize)
  console.log(`📄 小文件 (10 MB):`)
  console.log(`   策略优先级: [${smallFilePriority.join(', ')}]`)
  
  // 大文件
  const largeFileSize = 100 * 1024 * 1024 // 100MB
  const largeFilePriority = uploadManager._getStrategyPriorityByFileSize(largeFileSize)
  console.log(`📄 大文件 (100 MB):`)
  console.log(`   策略优先级: [${largeFilePriority.join(', ')}]`)
  
  // 9. 预测上传策略
  console.log('\n========== 预测上传策略 ==========')
  
  function predictStrategy(fileSize) {
    const priority = uploadManager._getStrategyPriorityByFileSize(fileSize)
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2)
    
    console.log(`📄 文件大小: ${fileSizeMB} MB`)
    console.log(`   策略优先级: [${priority.join(', ')}]`)
    
    for (const strategyName of priority) {
      const strategy = uploadManager.strategySelector.getStrategy(strategyName)
      if (strategy && strategy.isSupported() && strategy.isReady()) {
        console.log(`   ✅ 将使用: ${strategyName}`)
        return strategyName
      } else {
        const reason = !strategy ? '未注册' : !strategy.isSupported() ? '不支持' : '未就绪'
        console.log(`   ❌ ${strategyName}: ${reason}`)
      }
    }
    
    console.log('   ❌ 无可用策略')
    return null
  }
  
  // 测试不同文件大小
  predictStrategy(10 * 1024 * 1024) // 10MB
  console.log('')
  predictStrategy(100 * 1024 * 1024) // 100MB
  
  console.log('\n========== 调试信息结束 ==========')
}

/**
 * 强制启用 WebView 测试模式
 */
export function forceEnableWebView() {
  console.log('🔥 强制启用 WebView 测试模式')
  
  const uploadManager = getUploadManager()
  if (!uploadManager) {
    console.error('❌ UploadManager 未初始化')
    return false
  }
  
  // 设置阈值为 0
  uploadManager.setFileSizeThreshold(0)
  console.log('✅ 阈值已设置为 0 MB')
  console.log('✅ 所有文件都将优先使用 WebView 策略')
  
  // 再次检查
  debugWebViewStrategy()
  
  return true
}

/**
 * 等待 WebView 就绪
 * 
 * @param {number} timeout - 超时时间（毫秒）
 * @param {number} interval - 检查间隔（毫秒）
 * @returns {Promise<boolean>} 是否就绪
 */
export function waitForWebViewReady(timeout = 10000, interval = 500) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    
    const check = () => {
      const uploadManager = getUploadManager()
      const webviewStrategy = uploadManager?.strategySelector?.getStrategy(STRATEGY_NAMES.WEBVIEW)
      
      if (webviewStrategy && webviewStrategy.isReady()) {
        console.log('✅ WebView 已就绪')
        resolve(true)
        return
      }
      
      const elapsed = Date.now() - startTime
      if (elapsed >= timeout) {
        console.error(`❌ WebView 未就绪（超时 ${timeout}ms）`)
        resolve(false)
        return
      }
      
      console.log(`⏳ 等待 WebView 就绪... (${elapsed}ms / ${timeout}ms)`)
      setTimeout(check, interval)
    }
    
    check()
  })
}

export default {
  debugWebViewStrategy,
  forceEnableWebView,
  waitForWebViewReady
}
