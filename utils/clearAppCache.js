const clearAppCache = () => {
    // #ifdef APP-PLUS
    try {
      const currentVersion = plus.runtime.version;
      const lastVersion = uni.$storage.get('storageVersion')
      const webview = plus.webview.currentWebview();

      uni.$logger.local.info(`=== 版本检查开始 ===`)
      uni.$logger.local.info(`当前版本(currentVersion): ${currentVersion}`)
      uni.$logger.local.info(`存储版本(lastVersion): ${lastVersion}`)
      uni.$logger.local.info(`版本是否一致: ${lastVersion === currentVersion}`)

      if (lastVersion && lastVersion !== currentVersion) {
        uni.$logger.local.info(`检测到版本变化: ${lastVersion} -> ${currentVersion}`)

        if (webview) {
          uni.$logger.local.info('清除webview缓存');
          webview.clear();
        }
        uni.clearStorage(); // 清除本地存储
        uni.showLoading({
          title: '检测到新版本，正在重启...',
          mask: true
        })

        uni.$logger.local.info('清除应用缓存');
        plus.cache.clear()

        // 在重启前设置新版本号
        uni.$storage.set('storageVersion', currentVersion)
        uni.$logger.local.info(`已更新存储版本为: ${currentVersion}`)
        uni.$logger.local.info('3秒后重启应用');
        setTimeout(() => {
          plus.runtime.restart();
        }, 3e3);
      } else {
        uni.$logger.local.info('版本未变化，无需更新')
        // 只在首次安装或版本一致时设置
        if (!lastVersion) {
          uni.$storage.set('storageVersion', currentVersion)
          uni.$logger.local.info(`首次安装，设置版本为: ${currentVersion}`)
        }
      }
    } catch (error) {
      uni.$logger.local.error('setAPPVersion error:', error);
    }
    // #endif
  }
export default {
  clearAppCache
}