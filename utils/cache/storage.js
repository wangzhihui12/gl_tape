/**
 * 微信小程序标准版：统一封装的 storage 操作类
 */

import { DEFAULT_GET_STORAGEKEY, STORAGE_OBJECTKEY } from './constantData'
class Storage {
  types = {
    1: 'get', // get
    2: 'set', // set
    3: 'rm' // rm
  }
  envVersion = {
    develop: '开发版',
    trial: '体验版',
    release: '正式版'
  }
  // defaultGetStorageKey = DEFAULT_GET_STORAGEKEY
  /** 构造函数 */
  constructor() {
  }

  /**
   *
   * @param {*} key | 要操作的键值
   * @param {*} type | 类型，是 get set rm
   * @param {*} emptyFlag | 是否判断为空情况，默认判断 true，false 为不判断
   */
  checkKeyType (key, type, emptyFlag = true) {
    if (typeof key != 'string') {
      throw new Error(`Storage ${this.types[type]} func: key must be string`)
      return false
    }
    if (emptyFlag) {
      let tmpKey = key.TrimStr()
      if (tmpKey == '') {
        throw new Error(`Storage ${this.types[type]} func: key can not be empty`)
        return false
      }
      // if STORAGE_OBJECTKEY[key]
      return tmpKey
    }
    return key
  }

  /**
   *
   * @param {*} key | 要操作的键值
   * @param {*} syncFlag | 同步状态，默认 false (异步)，true 为同步
   */
  get = (key, syncFlag = true) => {
    // 有值默认取key值
    if (key) {
      // 判断值是否是指定的对象值
      let tmpKey = this.checkKeyType(key, 1)
      let isObjectKey = STORAGE_OBJECTKEY[tmpKey]
      // console.log(key)
      // console.log(isObjectKey)
      if (isObjectKey) {
        return this.getObjectKeyValue(isObjectKey)
      } else {
        throw new Error(`Storage ${this.types[1]} ${key}: key must be register`)
      }
    } else {
      return this.getObjectKeyValue(DEFAULT_GET_STORAGEKEY)
    }
  }

  /**
   *
   * @param {*} 空key返回默认定义数组的值
   */
  getObjectKeyValue (key) {
    // ObjectList
    if (typeof key == 'string') {
      key = this.addEvnToKey(key)
      let res = uni.getStorageSync(key)
      if (res) {
        return JSON.parse(res)
      } else {
        // reject(errMsg)
        return ''
      }
    } else {
      let Obj = {}
      key.forEach(key => {
        let defaultKey = this.addEvnToKey(key)
        let res = uni.getStorageSync(defaultKey)
        Obj[key] = res ? JSON.parse(res) : ''
      })
      return Obj
    }
  }
  /**
   *
   * @param {*} key | 要操作的键值
   * @param {*} data | 要存储的值，会转换为 JSON 串进行存储
   * @param {*} syncFlag | 同步状态，默认为同步 false (异步)，true 为同步
   */
  set = (key, data, syncFlag = true) => {
    let tmpKey = this.checkKeyType(key, 2)
    if (tmpKey) {
      tmpKey = this.addEvnToKey(tmpKey)
      const sucMsg = 'Storage set: set data successfully'
      const errMsg = 'Storage set: failed to set data'
      return new Promise((resolve, reject) => {
        let tmpData = JSON.stringify(data)
        if (syncFlag) {
          try {
            uni.setStorageSync(tmpKey, tmpData)
            resolve(sucMsg)
          } catch (err) {
            console.log(err)
            reject(errMsg)
          }
        } else {
          uni.setStorage({
            data: tmpData,
            key: tmpKey,
            success: () => {
              resolve(sucMsg)
            },
            fail: err => {
              console.log(err)
              reject(errMsg)
            }
          })
        }
        // const storageInfo = uni.getStorageInfoSync();
        // console.log(`Used storage size: ${storageInfo.currentSize} bytes`);
      })
    }
  }

  /**
   *
   * @param {*} key | 要操作的键值，为空则清空所有，有值则清空指定的值
   * @param {*} syncFlag | 同步状态，默认 false (异步)，true 为同步
   */
  rm = (key = '', syncFlag = false) => {
    let tmpKey = this.checkKeyType(key, 3, false)
    tmpKey = tmpKey.TrimStr()
    const sucMsg = 'Storage rm: rm data successfully'
    const errMsg = 'Storage rm: failed to rm data'
    return new Promise((resolve, reject) => {
      if (tmpKey == '') {
        if (syncFlag) {
          try {
            uni.clearStorageSync()
            resolve(sucMsg)
          } catch (err) {
            console.log(err)
            reject(errMsg)
          }
        } else {
          uni.clearStorage({
            success: res => {
              resolve(sucMsg)
            },
            fail: err => {
              console.log(err)
              reject(errMsg)
            }
          })
        }
      } else {
        tmpKey = this.addEvnToKey(tmpKey)
        if (syncFlag) {
          try {
            uni.removeStorageSync(tmpKey)
            resolve(sucMsg)
          } catch (err) {
            console.log(err)
            reject(errMsg)
          }
        } else {
          uni.removeStorage({
            key: tmpKey,
            success: () => {
              resolve(sucMsg)
            },
            fail: err => {
              console.log(err)
              reject(errMsg)
            }
          })
        }
      }
    })
  }

  /**
   * @description: key 拼接小程序环境变量
   * @param {*} key | 要操作的键值，
   * @returns {String} 拼接后的值
   */
  addEvnToKey = key => {
    return `release_${key}`
  }
}
/** 去除前导空格和后导空格 */
String.prototype.TrimStr = function () {
  return this.replace(/(^\s*)|(\s*$)/g, '')
}

export default Storage
