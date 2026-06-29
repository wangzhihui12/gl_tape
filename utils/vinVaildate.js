import api from '@/api/index.js'

// 有效字符：大写 A-H/J-N/P-Z、0-9（排除 I、O、Q）
const VALID_VIN_REG = /^[A-HJ-NPR-Z0-9]{17}$/
const ERROR_MSG = '请输入 17 位有效字符（支持大写 A-H/J-N/P-Z、0-9）'

// 防抖相关变量
let debounceTimer = null
let pendingResolve = null
let pendingReject = null
let pendingVin = null
const DEBOUNCE_DELAY = 500 // 防抖延迟时间（毫秒）

/**
 * 车架号校验（统一处理版本）
 * @param {string} vin - 车架号
 * @returns {Promise<Object>} 返回校验结果 { success: boolean, message: string, data?: any, vin?: string }
 */
export function validateVin(vin) {
	console.log("工具调用",vin);
  return new Promise((resolve, reject) => {
    const upperVin = vin ? vin.toUpperCase() : ''
    
    // 格式校验失败
    if (!upperVin || upperVin.length !== 17 || !VALID_VIN_REG.test(upperVin)) {
      uni.showToast({
        title: ERROR_MSG,
        icon: 'none'
      })
      reject({ 
        success: false, 
        message: ERROR_MSG 
      })
      return
    }

    // 保存当前调用的 resolve 和 reject
    pendingResolve = resolve
    pendingReject = reject
    pendingVin = upperVin

    // 清除之前的定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // 设置防抖定时器
    debounceTimer = setTimeout(() => {
      // 执行接口调用
      const currentVin = pendingVin
      const currentResolve = pendingResolve
      const currentReject = pendingReject
      
      // 清空待处理变量
      pendingVin = null
      pendingResolve = null
      pendingReject = null
      debounceTimer = null

      // 调用后端接口校验
      api.commonApi.checkVinValidate({ vin: currentVin })
        .then(res => {
		console.log("checkVinValidate接口校验",res);
          let { valid,message } = res
          if (valid) {
            // 校验成功但有提示信息
            if (message) {
              uni.showToast({
                title: message,
                icon: 'none'
              })
            }
            currentResolve({ 
              success: true, 
              message: message || '校验成功',
              data: res,
              vin: currentVin 
            })
          } else {
            // 接口返回失败
            const errorMsg = message || '车架号校验失败'
            uni.showToast({
              title: errorMsg,
              icon: 'none'
            })
            currentResolve({ 
              success: false, 
              message: errorMsg,
              data: res 
            })
          }
        })
        .catch(err => {
          const errorMsg = err.message || '车架号校验异常'
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          })
          currentReject({ 
            success: false, 
            message: errorMsg 
          })
        })
    }, DEBOUNCE_DELAY)
  })
}

/**
 * 实时输入处理：自动转大写
 */
export function formatVinInput(value) {
  return value ? value.toUpperCase() : ''
}

