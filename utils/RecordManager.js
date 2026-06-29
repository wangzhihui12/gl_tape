/*
 * @Descripttion:  
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-07-01 09:40:48
 * @LastEditors: limin
 * @LastEditTime: 2025-01-06 09:37:09
 * @FilePath: \gl_tape\utils\RecordManager.js
 */
import { storageApi } from './cache'
import utils from './utils'
/**
 * 记录管理器类
 * 用于管理记录列表
 */
class RecordManager {
  /**
   * RecordManager 类的构造函数
   * 用于初始化 RecordManager 实例
   */
  constructor() {
    // storageApi.removeRecords('preRecord')
    // this.fileSaveFolderOnClient = utils.getFileSaveFolderOnClient();
  }
  // 单例模式
  static instance = null
  // 读写锁
  locker = false
  /**
   * 获取 RecordManager 的单例实例
   * 如果 instance 不存在，则创建一个新实例并赋值给 instance
   * @return {RecordManager} RecordManager 的单例实例
   */
  static getInstance() {
    if (!RecordManager.instance) {
      RecordManager.instance = new RecordManager()
    }
    return RecordManager.instance
  }
  /**
   * 异步获取锁
   * 如果锁已被占用，则在一段时间后重新尝试获取锁
   * 如果成功获取锁，将返回一个 Promise，该 Promise 包含一个解锁函数。
   * @return {Promise} 一个 Promise，在锁可用时兑现，并返回一个解锁函数
   */
  async lock() {
    return new Promise(resolve => {
      if (this.locker) {
        setTimeout(() => {
          this.lock()
        }, 100)
      } else {
        this.locker = true
        resolve(this.unlock.bind(this))
      }
    })
  }
  /**
   * 释放本地存储的读写锁
   */
  unlock() {
    this.locker = false
  }

  /**
   * 将一条新记录添加到当前对象的记录列表中
   *
   * @param {Object} record - 要添加的新记录对象
   * @returns {Array} - 包含新记录的更新后的记录列表
   */
  async addRecord(record, key) {
    const records = this.getRecords(key) || []
    records.push(record)
    this.setRecords(records, key)
    return records
  }
  /**
   * 移除一个ID对应的记录
   *
   * @param {number} id - 要移除的记录的ID
   * @returns {Array} - 移除记录后的更新后的记录列表
   */
  async removeRecord(id, key) {
    let records = this.getRecords(key)
    records = records.filter(i => i.id !== id)
    this.setRecords(records, key)
    return records
  }
  /**
   * 获取并移除当前对象记录列表中的最后一条记录
   *
   * @returns {Object} - 被移除的最后一条记录对象，如果记录列表为空，则返回 undefined
   */
  getRecord(key) {
    const records = this.getRecords(key)
    return records.pop()
  }
  /**
   * 根据给定的 ID 获取一条记录
   *
   * @param {number} id - 要获取的记录的 ID
   * @returns {Object} - 具有给定 ID 的记录对象，如果没有找到符合条件的记录，则返回 undefined
   *
   */
  getRecordById(id, key) {
    const records = this.getRecords(key)
    return records.find(i => i.id === id)
  }
  /**
   * 获取记录列表
   *
   * @returns {Array} - 从 storageApi 获取的记录列表
   */
  getRecords(key) {
    return storageApi.getRecords(key) || []
  }
  /**
   * 设置记录列表
   *
   * @param {Array} records - 要设置的记录列表
   * @returns {void} - 此函数不返回任何值
   */
  setRecords(records, key) {
    storageApi.setRecords(records, key)
  }
  /**
   * 更新记录数组中的记录
   * 这个函数用于更新给定记录数组中的特定记录
   * 它接受一个参数 record，该参数是要更新的记录对象
   *
   * @param {Object} record - 要更新的记录对象，必须包含一个唯一的 id 属性
   * @throws {Error} 如果记录数组中找不到具有给定 id 的记录，将抛出错误
   */
  updateRecord(record, key) {
    const records = this.getRecords(key) 
    const index = records.findIndex(i => i.id === record.id)
    if (index !== -1) {
      records[index] = record
      this.setRecords(records, key)
    }
  }
  /**
   * 兼容模式的异步处理函数
   * 这个函数用于处理在兼容模式下的文件路径转换和记录属性的修正
   * 它首先获取一个锁，以确保在操作过程中数据的一致性
   * 然后，它获取客户端文件保存文件夹的路径，并检查是否获取成功
   * 接着，它获取所有的记录，并对每个记录执行以下操作：
   *  - 检查记录的 recordUrlList 是否存在且不为空，对于每个 URL，判断其是否以 'file://' 开头
   *    - 如果不是，使用路径中的文件名构建一个新的客户端文件路径，并替换掉原来的 URL
   *  - 如果记录没有 id 属性，随机生成一个 UUID 并设置为记录的 id
   *
   * 在处理过程中，如果发生任何错误，它将抛出该错误
   * 无论成功或失败，最终都会执行 finally 块中的代码。这里首先释放记录锁，然后调用 polling 方法，可能是为了继续下一次文件上传。
   *
   * @async
   * @throws {Error} 如果获取记录失败或发生任何其他错误，将抛出错误
   */
  async compatible() {
    const unlock = await this.lock()
    let path = await utils.getFileSaveFolderOnClient()
    try {
      let records = this.getRecords()
      if (typeof records === 'string') {
        records = JSON.parse(records)
      }
      records.forEach(i => {
        if (i.recordUrlList && i.recordUrlList.length) {
          i.recordUrlList.forEach(async j => {
            if (!j.file.startsWith('file://') && !j.file.startsWith('http')) {
              const fileName = j.file.split('/').pop()
              j.file = path + fileName
            }
          })
        }
        if (!i.id) {
          i.id = utils.uuid()
        }
      })
      this.setRecords(records)
    } catch (e) {
      throw e
    } finally {
      unlock()
    }
  }

  /**
   * 清除所有记录
   *
   * @returns {void} - 此函数不返回任何值
   */
  clearRecords() {
    storageApi.removeRecords()
  }
}
export default RecordManager
