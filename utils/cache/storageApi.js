/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-04-16 09:55:40
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2024-10-31 11:09:20
 * @FilePath: \gl-tape\utils\cache\storageApi.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { STORAGE_OBJECTKEY } from './constantData'
// console.log(storage)
/** */
// 实例化对象存储
import Storage from './storage'
const storage = new Storage()
// console.log(storage)
/** */
export function getSessionId() {
  return storage.get('sessionId')
}
export function setSessionId(sessionId) {
  storage.set('sessionId', sessionId)
}
export function getUserInfo() {
  return storage.get('userInfo')
}
export function setUserInfo(data) {
  console.log(data)
  storage.set('userInfo', data)
}
export function removeSystemStorage() {
  // storage.rm('srcm_shopmall_user_info')
  // storage.rm('scrm_shopmall_sessionId')
  // storage.rm('guest_no')
  // storage.rm('equity_info')
  // storage.rm('packageList')
  // storage.rm('isVIP')
  // storage.rm('bizjiaUrl')
  // storage.rm('vip_card_info')
}
export function setStorageSync(key, data) {
  storage.set(key, JSON.stringify(data))
}
export function getStorageSync(key) {
  return storage.get(key) || null
  //  JSON.parse(data)
}

/**设置标题栏 */
export function setNavigationBarTitleText(title) {
  storage.set('app_title', title)
}

/**获取app标题 */
export function getNavigationBarTitleText() {
  return storage.get('app_title')
}

/** 存储设备信息 */
export function setSystem_info(that) {
  let info = storage.get('system_info')
  !info &&
    wx.getSystemInfo({
      success(res) {
        // console.log(res)
        storage.set('system_info', res)
      }
    })
}

export function getRecords(record = 'recordList') {
  return storage.get(STORAGE_OBJECTKEY[record])
}
export function setRecords(data, record = 'recordList') {
  storage.set(STORAGE_OBJECTKEY[record], data)
}
export function removeRecords(record = 'recordList') {
  storage.rm(STORAGE_OBJECTKEY[record])
}
export default {
  getSessionId,
  setSessionId,
  getUserInfo,
  setUserInfo,
  removeSystemStorage,
  setStorageSync,
  getStorageSync,
  setNavigationBarTitleText,
  getNavigationBarTitleText,
  setSystem_info,
  getRecords,
  setRecords,
  removeRecords
}
