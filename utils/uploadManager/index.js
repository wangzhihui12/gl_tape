/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 15:40:13
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 01:47:38
 * @FilePath: \simgle_app\utils\uploadManager\index.js
 */

import UploadManager, { getUploadManager } from './UploadManager.js'
import WebViewStrategy from './strategies/WebViewStrategy.js'
import UniAppStrategy from './strategies/UniAppStrategy.js'
import UploadStrategy from './strategies/UploadStrategy.js'
import { STRATEGY_NAMES, FILE_SIZE_THRESHOLD, UPLOAD_STATUS, WEBVIEW_MESSAGE_TYPE, DEFAULT_CONFIG } from './constants.js'

// 导出主要类和函数
export {
  UploadManager,
  getUploadManager,
  WebViewStrategy,
  UniAppStrategy,
  UploadStrategy,
  STRATEGY_NAMES,
  FILE_SIZE_THRESHOLD,
  UPLOAD_STATUS,
  WEBVIEW_MESSAGE_TYPE,
  DEFAULT_CONFIG
}

// 默认导出单例获取函数
export default getUploadManager
