/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-03 18:53:43
 * @LastEditors: limin
 * @LastEditTime: 2026-02-10 11:04:43
 * @FilePath: \gl_tape\init.js
 */
import { DBRecord } from './utils/recordManager/index'
// import RecordManager from '@/utils/RecordManager'
import DBManager from '@/utils/DBManager'
import utils from './utils/utils'
import logger from './utils/logger'
import { Storage } from './utils/cache/index'
import api from './api/index'
import Track from './utils/Track'
import { signSecretKey, pathEnum, domain, djDomain, evaluationDomain, merchantDomain } from './env'
const HOST = {
  scrm: domain,
  dj: djDomain,
  eva: evaluationDomain,
  merchant: merchantDomain,
  ip: 'http://192.168.1.221:5003'
}
uni.$api = api
// uni.$lock = false
uni.$storage = new Storage()
uni.$throttle = utils.throttle
uni.$isNetWork = utils.isNetWork
uni.$logger = logger
// uni.$recordManager = RecordManager.getInstance()
// uni.$dbTempRecord = new DBRecord()
// uni.$dbManager = new DBManager()
uni.$track = new Track()
console.log('init.js', HOST['eva'])
uni.signHttpConfig = {
  baseURL: `${HOST['eva']}${pathEnum.evaluation}`,
  timeout: 300000,
  appId: signSecretKey.appKey,
  appSecret: signSecretKey.secret,
  session: {
    requiresSession: true,
    sessionParamName: 'sessionId',
    sessionId: _ => uni.$storage?.get('sessionId')
  },
  sentry: {
    enable: true, // 是否启用Sentry错误上报
    dsn: 'https://cce6491788ff4b8899d8f912e6982a96@sentry.glsx.com.cn/42'
  },
  response: {
    code_key: 'code',
    code_success_value: '0',
    data_key: 'data',
    errId: 'code',
    errId_logout_value: '21'
  },
  events: {
    response: (responseData, config) => {
      console.log('response事件触发', responseData, config)
    },
    timeout: 30000,
    response: {
      code_key: 'code',
      code_success_value: '0',
      data_key: 'data',
      errId: 'errId',
      errId_logout_value: '21'
    },
    request: (request, config) => {
      console.log('request事件触发', request, config)
    },
    error: (error, config) => {
      console.log('error事件触发', error, config)
      if (error && error.errMsg == 'request:fail') {
        return uni.showToast({
          title: '网络异常',
          icon: 'none',
        })
      }
      uni.showToast({
        title: error.msg || '业务异常',
        icon: 'none',
      })
    },
    logout: config => {
      console.log('logout事件触发', config)
      const pages = getCurrentPages(),
        currentPage = pages[pages.length - 1]
      uni.hideLoading()
      if (currentPage.route != 'pages/common/login')
        uni.reLaunch({
          url: '/pages/common/login'
        })
    }
  }
}

// !(async _ => {
//   await uni.$dbManager.init()
//   await uni.$dbTempRecord.init()
// })()
if (!uni.$dbRecord) {
  uni.$dbRecord = new DBRecord()
}
// 导出数据库初始化 Promise，供其他模块等待
if (!uni.$dbReady) {
  uni.$dbReady = (async _ => {
    try {
      await uni.$dbRecord.init()
      // await uni.$dbTempRecord.init() // 已废弃
      uni.$logger.local.info('数据库初始化完成')
      return true
    } catch (e) {
      uni.$logger.local.error('数据库初始化失败: ' + e.message)
      return false
    }
  })()
}
