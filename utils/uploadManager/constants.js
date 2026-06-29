/*
 * @Descripttion: 上传管理器常量定义
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-30
 */

/**
 * 上传策略名称常量
 * 
 * 统一管理所有策略名称，避免硬编码导致的不一致问题
 */
export const STRATEGY_NAMES = Object.freeze({
  /**
   * WebView 策略
   * 使用 WebView 加载 H5 页面，调用 aliyun-oss-sdk 上传
   */
  WEBVIEW: '[webview.oss.sdk]',
  
  /**
   * UniApp 策略
   * 使用 uni.uploadFile API 进行表单上传
   */
  UNIAPP: '[uniapp.uni.uploadFile]',
  
  /**
   * 无策略
   */
  NONE: 'none'
})

/**
 * 文件大小阈值（字节）
 */
export const FILE_SIZE_THRESHOLD = Object.freeze({
  /**
   * 小文件阈值：50MB
   * 小于此大小使用 UniAppStrategy（表单上传）
   * 大于等于此大小使用 WebViewStrategy（OSS SDK 分片上传）
   */
  SMALL_FILE: 50 * 1024 * 1024 // 50MB
})

/**
 * 上传状态常量
 */
export const UPLOAD_STATUS = Object.freeze({
  /**
   * 等待中
   */
  PENDING: 'pending',
  
  /**
   * 上传中
   */
  UPLOADING: 'uploading',
  
  /**
   * 上传成功
   */
  SUCCESS: 'success',
  
  /**
   * 上传失败
   */
  FAILED: 'failed',
  
  /**
   * 已取消
   */
  CANCELLED: 'cancelled'
})

/**
 * WebView 消息类型
 */
export const WEBVIEW_MESSAGE_TYPE = Object.freeze({
  /**
   * WebView 就绪信号
   */
  READY: 'webview_ready',
  
  /**
   * 上传进度
   */
  PROGRESS: 'upload_progress',
  
  /**
   * 上传成功
   */
  SUCCESS: 'upload_success',
  
  /**
   * 上传失败
   */
  ERROR: 'upload_error'
})

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = Object.freeze({
  /**
   * 默认文件大小阈值
   */
  FILE_SIZE_THRESHOLD: FILE_SIZE_THRESHOLD.SMALL_FILE,
  
  /**
   * 默认超时时间（毫秒）
   */
  TIMEOUT: 10 * 60 * 1000, // 10 分钟
  
  /**
   * 默认重试次数
   */
  MAX_RETRIES: 3,
  
  /**
   * 默认分片大小（字节）
   */
  CHUNK_SIZE: 5 * 1024 * 1024 // 5MB
})
