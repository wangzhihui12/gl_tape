import sign from './sign.js'
import { secretKey, pathEnum, domain, djDomain, merchantDomain, djSecretKey } from '../../env'

const HOST = {
  scrm: domain,
  dj: djDomain,
  merchant: merchantDomain,
  ip: 'http://192.168.1.96:8292'
}

/** 接口 message 转可展示的 Toast 文案（非字符串、过长在部分端上会导致不弹提示） */
function normalizeApiToastMessage(message) {
  if (message == null || message === '') return '系统异常'
  let text
  if (typeof message === 'string') {
    text = message
  } else {
    try {
      text = JSON.stringify(message)
    } catch (e) {
      return '系统异常'
    }
  }
  const max = 42
  return text.length > max ? text.slice(0, max) + '…' : text
}

class Request {
  get(params, returnAll = false, hostType) {
    return this.request('GET', params, returnAll, hostType)
  }
  post(params, returnAll = false, hostType, timeout) {
    return this.request('POST', params, returnAll, hostType, timeout)
  }
  fetch(method, data, returnAll = true, hostType) {
    return this.post(
      {
        method,
        ...data
      },
      returnAll,
      hostType
    )
  }
  request(RequestMethods, params, returnAll, hostType = 'dj', timeout) {
    return new Promise((resolve, reject) => {
      let _this = this
      uni.getNetworkType({
        success(res) {
          if (res.networkType == 'none') {
            uni.hideLoading()
            uni.showToast({
              title: '网络异常',
              icon: 'none'
            })
            uni.$logger.locale.error('网络异常')
            reject('网络异常')
            return
          }
          let header =
            RequestMethods === 'POST'
              ? {
                  'content-type': 'application/x-www-form-urlencoded'
                }
              : {
                  'Cache-Control': 'no-cache'
                }
          let projectName = params.projectName
          if (!projectName) projectName = _this.getRopProject(params.method)
          const path = pathEnum[projectName]
          params = _this.getData(params, hostType)
          uni.request({
            url: `${HOST[hostType]}${path}router?method=${params.method}`,
            data: params,
            method: RequestMethods,
            header,
            dataType: 'json',
            responseType: 'text',
            timeout: timeout || 60000,
            success(response) {
              // /**业务代码 */
              // let { data, statusCode } = response
              // if (!data || statusCode != 200) {
              //   uni.hideLoading()
              //   let errMsg = ''
              //   if (!data) errMsg = '获取数据失败，请重试。'
              //   else errMsg = '服务器暂时不可用，请稍后再次尝试。'
              //   return reject(errMsg)
              // }
              // let { code, message } = data
              // if (returnAll) {
              //   resolve(data)
              //   return
              // }
              // if (code == 20 || code == 21) {
              //   console.log(params.method)
              //   const pages = getCurrentPages(),
              //     currentPage = pages[pages.length - 1]
              //   uni.hideLoading()
              //   if (currentPage.route != 'pages/common/login')
              //     uni.reLaunch({
              //       url: '/pages/common/login'
              //     })
              // } else {
              //   if (code == '0') {
              //     resolve(data.data)
              //   } else {
              //     uni.hideLoading()
              //     uni.showToast({
              //       title: message || '系统异常',
              //       icon: 'none'
              //     })
              //   }
              // }
                try {
                /**业务代码 */
                let { data, statusCode } = response
                if (!data || statusCode != 200) {
                  uni.hideLoading()
                  let errMsg = ''
                  if (!data) errMsg = '获取数据失败，请重试。'
                  else errMsg = '服务器暂时不可用，请稍后再次尝试。'
                  uni.$logger.error(`${params.method}接口异常：${errMsg}`)
                  return reject(errMsg)
                }
                let { code, message, msg, errId } = data
                if (message == null || message === '') message = msg
                if (returnAll) {
                  resolve(data)
                  return
                }
                if (code == 20 || code == 21) {
                  uni.$logger.local.info(`触发系统登出-> ${params.method}：${message || '系统异常'} code:${code}`)
                  const pages = getCurrentPages(),
                    currentPage = pages[pages.length - 1]
                  uni.hideLoading()
                  if (currentPage.route != 'pages/common/login')
                    uni.reLaunch({
                      url: '/pages/common/login'
                    })
                } else {
                  if (code == '0') {
                    const errIdStr = errId != null && errId !== '' ? String(errId) : ''
                    if (errIdStr && errIdStr !== '0') {
                      uni.hideLoading()
                      const toastTitle = normalizeApiToastMessage(message)
                      setTimeout(() => {
                        uni.showToast({
                          title: toastTitle,
                          icon: 'none',
                          duration: 3000
                        })
                      }, 0)
                      uni.$logger.error(`${params.method}接口异常(errId)：${toastTitle}`)
                      reject(toastTitle)
                      return
                    }
                    resolve(data.data)
                  } else {
                    uni.hideLoading()
                    const toastTitle = normalizeApiToastMessage(message)
                    // 先提示再记日志：避免 RemoteLog/Sentry 同步异常时用户看不到 Toast
                    setTimeout(() => {
                      uni.showToast({
                        title: toastTitle,
                        icon: 'none',
                        duration: 3000
                      })
                    }, 0)
                    uni.$logger.error(`${params.method}接口异常：${toastTitle}`)
                    reject(toastTitle)
                  }
                }
              } catch (error) {
                uni.$logger.error(`${params.method}处理异常：${error.message}`)
                reject(error)
              }
            },
            fail(error) {
              uni.hideLoading()
              const raw =
                typeof error == 'string'
                  ? error
                  : error.errMsg
                    ? error.errMsg
                    : error.message
                      ? error.message
                      : JSON.stringify(error) || '系统异常'
              const toastTitle = normalizeApiToastMessage(raw)
              setTimeout(() => {
                uni.showToast({
                  title: toastTitle,
                  icon: 'none',
                  duration: 3000
                })
              }, 0)
              uni.$logger.error(`${params.method}接口异常：${toastTitle}`)
              reject(error)
            },
            complete() {
              uni.stopPullDownRefresh()
            }
          })
        }
      })
    })
  }
  getData(params, hostType = 'scrm') {
    let projectName = params.projectName
    if (!projectName) projectName = this.getRopProject(params.method)
    else delete params.projectName
    let appKey = '48e5e13229b82c1b4e6e8c96151f0637'
    let secret = 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b'
    if (secretKey[projectName]) {
      appKey = secretKey[projectName].appKey
      secret = secretKey[projectName].secret
    }
    if (hostType == 'dj') {
      appKey = djSecretKey.appKey
      secret = djSecretKey.secret
    }
    let { sessionId } = uni.$storage.get()
    let noSignAttr = []
    if (!params.sessionId && sessionId) params.sessionId = sessionId
    if (params.delSessionId) {
      delete params.sessionId
      delete params.delSessionId
    }
    if (params.noSignAttr) {
      noSignAttr = params.noSignAttr
      delete params.noSignAttr
    }
    params.v = '1.0.0'
    params.format = 'json'
    params.locale = 'zh_CN'
    params.source = 'app'
    params.appKey = appKey
    return sign(params, secret, noSignAttr)
  }
  getRopProject(method) {
    const projectName = method.split('.')[2]
    return projectName
  }
  uni_request({ url, method = 'GET', data = {}, header = {}, dataType = 'json', responseType = 'text' }) {
    return new Promise(resolve => {
      uni.request({
        url,
        data,
        method,
        header,
        dataType,
        responseType,
        success(response) {
          resolve(response.data)
        }
      })
    })
  }
}
export default new Request()
