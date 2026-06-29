/**
 * OSS 图片处理参数
 * 用于上传图片返回地址及详情/编辑回显时的图片展示
 */
const IMAGE_OSS_PROCESS = 'x-oss-process=image/format,jpg/quality,q_100'

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.m4v', '.3gp', '.mkv', '.webm']
const VIDEO_OSS_SNAPSHOT = 'x-oss-process=video/snapshot'

/**
 * 判断 URL 是否为视频
 * @param {string} url - 媒体 URL
 * @returns {boolean}
 */
function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (url.includes(VIDEO_OSS_SNAPSHOT)) return true
  const urlLower = url.toLowerCase()
  const pathPart = urlLower.split('?')[0].split('#')[0]
  return VIDEO_EXTENSIONS.some(ext => pathPart.endsWith(ext))
}

/**
 * 为图片 URL 追加 OSS 处理参数（视频不处理）
 * @param {string} url - 原始 URL
 * @returns {string} 带处理参数的 URL
 */
function appendImageOssProcess(url) {
  if (!url || typeof url !== 'string') return url || ''
  if (isVideoUrl(url)) return url
  if (url.includes(IMAGE_OSS_PROCESS)) return url
  const separator = url.includes('?') ? '&' : '?'
  return url + separator + IMAGE_OSS_PROCESS
}

/**
 * 获取图片展示 URL：图片追加 OSS 参数，视频原样返回
 * 用于详情/编辑回显时，多图片分割后的每个 URL 展示
 * @param {string} url - 媒体 URL
 * @param {boolean} [isImageType] - 已知为图片类型时可传 true，跳过视频判断
 * @returns {string}
 */
function getImageDisplayUrl(url, isImageType = false) {
  if (!url || typeof url !== 'string') return url || ''
  if (isImageType) return appendImageOssProcess(url)
  if (isVideoUrl(url)) return url
  return appendImageOssProcess(url)
}

module.exports = {
  IMAGE_OSS_PROCESS,
  isVideoUrl,
  appendImageOssProcess,
  getImageDisplayUrl
}
