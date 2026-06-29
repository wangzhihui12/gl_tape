import md5 from '../../lib/md5.js'

/**
 * 生成签名，与Java的sign方法对应
 * @param {Object} paramValues - 参数对象
 * @param {string} secret - 密钥
 * @returns {string} 32位MD5签名
 */
export function sign(paramValues, secret) {
  const sb = []
  const paramNames = Object.keys(paramValues)

  // 对参数名进行排序
  paramNames.sort()

  // 构建签名字符串：secret + paramName1 + paramValue1 + paramName2 + paramValue2 + ... + secret
  sb.push(secret)
  for (const paramName of paramNames) {
    sb.push(paramName)
    sb.push(paramValues[paramName])
  }
  sb.push(secret)

  // 生成32位MD5签名
  return md5(sb.join(''))
}

/**
 * 生成16位MD5签名
 * @param {string} str - 要签名的字符串
 * @returns {string} 16位MD5签名
 */
export function md516(str) {
  return md5(str).substring(8, 24)
}

/**
 * 生成32位MD5签名
 * @param {string} str - 要签名的字符串
 * @returns {string} 32位MD5签名
 */
export function md532(str) {
  return md5(str)
}
