/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-08 17:16:46
 * @LastEditors: cenchengwei@foreverht.com
 * @LastEditTime: 2026-04-08 15:29:20
 * @FilePath: /gl_tape/utils/utils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function convertDateTimeFormat(dateTimeStr, separator = '-') {
  const date = new Date(dateTimeStr)
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2) // 月份是从0开始的
  const day = ('0' + date.getDate()).slice(-2)
  const hours = ('0' + date.getHours()).slice(-2)
  const minutes = ('0' + date.getMinutes()).slice(-2)
  const seconds = ('0' + date.getSeconds()).slice(-2)

  return `${year}${separator}${month}${separator}${day} ${hours}:${minutes}:${seconds}`
}
export function deepClone(value) {
  // 排除原始类型的情况，函数时也满足此条件
  if (typeof value !== 'object' || value === null) {
    return value
  }
  // 克隆结果：1.数组 2.普通对象
  const result = Array.isArray(value) ? [] : {}
  // 设置克隆结果的原型链为 value 的原型链(即保持原型一致)
  Object.setPrototypeOf(result, Object.getPrototypeOf(value))
  // 浅层克隆
  for (const key in value) {
    // 排除原型上的属性
    if (value.hasOwnProperty(key)) {
      result[key] = deepClone(value[key]) // 针对这个对象的每一个属性值进行克隆，则达到深度克隆效果
    }
  }
  return result
}
//精确除法
function accDiv(arg1, arg2) {
  var t1 = 0,
    t2 = 0,
    r1,
    r2
  try {
    t1 = arg1.toString().split('.')[1].length
  } catch (e) {}
  try {
    t2 = arg2.toString().split('.')[1].length
  } catch (e) {}
  r1 = Number(arg1.toString().replace('.', ''))
  r2 = Number(arg2.toString().replace('.', ''))
  return (r1 / r2) * Math.pow(10, t2 - t1)
}
// 两数相减
function calcAdd(num1, num2) {
  var r1, r2, m
  try {
    r1 = num1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = num2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2))
  return (Math.round(num1 * m) + Math.round(num2 * m)) / m
}
function debounce(fn, timer) {
  var t = null
  return function () {
    if (t) {
      clearTimeout(t)
    }
    if (t == null) {
      fn.apply(this, arguments)
    }
    t = setTimeout(() => {
      t = null
    }, timer)
  }
}
// var throttle = function (fn, delay) {
//   var timer = null;
//   return function () {
//     var context = this,
//       args = arguments;
//     clearTimeout(timer);
//     timer = setTimeout(function () {
//       fn.apply(context, args);
//     }, delay);
//   };
// };
var throttle = function (func, limit) {
  let inThrottle
  return function () {
    const context = this
    const args = arguments
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(function () {
        inThrottle = false
      }, limit)
    }
  }
}
//检查是否有网络
var isNetWork = function () {
  return new Promise((resolve, reject) => {
    uni.getNetworkType({
      complete: function (res) {
        resolve(res.networkType !== 'none')
      }
    })
  })
}
var uuid = function (len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  var uuid = [],
    i
  radix = radix || chars.length

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    // rfc4122, version 4 form
    var r

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return uuid.join('')
}

/**
 * 获取文件系统根目录的完整路径
 * 这个函数使用 HTML5 的 plus.io.requestFileSystem API 在私有文档目录中请求文件系统访问权限
 * 当文件系统访问权限被授予后，使用 resolve 方法返回根目录的完整路径
 * 这个 Promise 风格的函数可以被其他代码使用，以异步方式获取文件系统的根路径
 * @returns {Promise<string>} 一个 Promise，当获取到文件系统根目录的完整路径时兑现，并返回根目录的路径作为字符串
 */
function getFilePath() {
  return new Promise(resolve => {
    plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function (fs) {
      resolve(fs.root.fullPath)
    })
  })
}
/** 比较版本号的大小
 **/
function compareVersions(version1, version2) {
  if (!version1 || !version2) return 0
  const v1 = version1.split('.').map(v => +v) // 转化成数字数组
  const v2 = version2.split('.').map(v => +v)
  const b1 = v1.every(v => !isNaN(v)) // 判断数组的每一项是否是数字
  const b2 = v2.every(v => !isNaN(v)) // 如果不是则返回错误信息
  if (!b1 || !b2) return '版本号错误，只能包含数字、.'
  const len = Math.max(v1.length, v2.length)
  for (let i = 0; i < len; i++) {
    const num1 = v1[i] || 0
    const num2 = v2[i] || 0
    if (num1 > num2) return 1 // 如果版本号1大于版本号2，则输出1
    if (num1 < num2) return -1 // 反之则输出 -1
  }
  // 如果版本号1 等于版本号2，则输出0
  return 0
}
async function getFileSaveFolderOnClient() {
  const rootPath = await getFilePath()
  return `file://${rootPath}uniapp_save/`
}
async function getAudioFilePath(path = '') {
  const rootPath = await getFilePath()
  return `file://${rootPath}${path}`
}
export function serializeIfObject(value) {
  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}
/**
 * 获取 Webview 实例的工具方法
 * @param {Object} webviewComponent - Vue 组件引用
 * @param {Object} vueContext - Vue 实例上下文
 */
export function isInteger(obj) {
  return typeof obj === 'number' && obj % 1 === 0
}
export function singleton(className) {
  let ins = null
  const proxy = new Proxy(className, {
    construct(target, args) {
      if (!ins) {
        ins = Reflect.construct(target, args)
      }
      return ins
    }
  })
  proxy.prototype.constructor = proxy
  return proxy
}
const getViewInfo = (name, callBack, isComponents) => {
  const query = !isComponents ? uni.createSelectorQuery() : uni.createSelectorQuery().in(isComponents)
  let that = this
  query
    .select(name)
    .boundingClientRect(data => callBack(data))
    .exec()
}

/**num：要转换的数值，fixed：精确几位小数 */
const decimal = (num, fixed) => {
  const pow = Math.pow(10, fixed)
  return Math.round(num * pow) / pow
}

/** 向上取整，保留 fixed 位小数（默认2位），用于商品价格、总价等 */
const ceilDecimal = (num, fixed = 2) => {
  const n = Number(num)
  if (isNaN(n) || n === 0) return 0
  const pow = Math.pow(10, fixed)
  // 先乘 pow 再减极小量后 ceil，避免 1.01 等已整步长的数被浮点误差多进一位成 1.02
  const tolerance = 1e-10
  return Math.ceil((n * pow) - tolerance) / pow
}

const setPrice = price => {
  let [num, decimal] = price.toString().split('.')
  if (!decimal) decimal = '00'
  return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + `.${decimal}`
}
const showNoAccess = () => {
  // wx.showToast('您的账号无法完成此操作')
  uni.showToast({
    title: '您的账号无法完成此操作',
    icon: 'error'
  })
}
/**设置粘贴板内容 */
const setCopyData = (data, callBack) => {
  console.log(data, 'setCopyData')
  uni.setClipboardData({
    data: data,
    success(res) {
      console.log(res, 'setCopyData')
      if (callBack && typeof callBack === 'function') callBack(res)
    }
  })
}

/** 刷新工单管理 预约管理数据 */
const refreshPageData = notRefreshOrder => {
  if (!notRefreshOrder) getApp().globalData.orderListRefresh = true
  getApp().globalData.dateListRefresh = true
  getApp().globalDataorderListDateListScreenRefresh = true
}

// val：判断的值，unit单位
const filterValue = (val, unit = '') => {
  if (val === null || val === undefined) {
    return '-'
  }
  return `${val}${unit}`
}

/**
 *
 * 检测VIN码
 */
function validateVIN(vin) {
  if (vin.length !== 17) return false
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
  const charMap = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    P: 7,
    R: 9,
    S: 2,
    T: 3,
    U: 4,
    V: 5,
    W: 6,
    X: 7,
    Y: 8,
    Z: 9
  }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const char = vin[i].toUpperCase()
    const value = charMap[char] || parseInt(char, 10)
    sum += value * weights[i]
  }
  const checkDigit = sum % 11 === 10 ? 'X' : (sum % 11).toString()
  return checkDigit === vin[8]
}

const nullValues = [undefined,'undefined',null,'null']

export default {
  compareVersions,
  convertDateTimeFormat,
  deepClone,
  accDiv,
  debounce,
  throttle,
  isNetWork,
  uuid,
  getFilePath,
  getFileSaveFolderOnClient,
  serializeIfObject,
  getAudioFilePath,
  calcAdd,
  getViewInfo,
  setPrice,
  decimal,
  ceilDecimal,
  showNoAccess,
  setCopyData,
  refreshPageData,
  filterValue,
  validateVIN,
  nullValues,
  isInteger,
  getWebviewInstance
}
/**
 * 获取 Webview 实例 (增强版)
 * @param {Object} component - Vue 组件引用
 * @param {Object} context - Vue 上下文
 */
export function getWebviewInstance(component, context) {
  return new Promise((resolve) => {
    // 1. 尝试直接获取
    if (component && typeof component.$getAppWebview === 'function') {
      const wv = component.$getAppWebview()
      if (wv) {
        resolve(wv)
        return
      }
    }

    // 2. 尝试通过页面查找 (解决组件未挂载完全时的获取问题)
    const tryFind = () => {
       try {
           let pageWebview = null
           if (context && context.$scope && typeof context.$scope.$getAppWebview === 'function') {
               pageWebview = context.$scope.$getAppWebview()
           } else if (context && context.$parent && context.$parent.$scope && typeof context.$parent.$scope.$getAppWebview === 'function') {
               pageWebview = context.$parent.$scope.$getAppWebview()
           }

           if (pageWebview && typeof pageWebview.children === 'function') {
               const children = pageWebview.children()
               for (let i = 0; i < children.length; i++) {
                   const child = children[i]
                   const url = child.getURL ? child.getURL() : ''
                   if (url && url.indexOf('hybrid/html/index.html') > -1) {
                       return child
                   }
               }
           }
       } catch (e) {
           console.warn('getWebviewInstance error:', e)
       }
       return null
    }

    const wv = tryFind()
    if (wv) {
      resolve(wv)
      return
    }

    // 3. 异步重试 (处理渲染延迟)
    let retries = 0
    const timer = setInterval(() => {
      retries++
      const wv = tryFind()
      if (wv) {
        clearInterval(timer)
        resolve(wv)
      } else if (retries >= 10) {
        clearInterval(timer)
        resolve(null)
      }
    }, 200)
  })
}
