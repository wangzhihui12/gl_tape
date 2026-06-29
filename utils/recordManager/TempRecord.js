/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-02 18:49:17
 * @LastEditors: limin
 * @LastEditTime: 2026-01-30 03:19:33
 * @FilePath: \gl_tape\utils\recordManager\TempRecord.js
 */
import utils from '../utils'
import { FileStatus } from '../common/constants'
import { RecordCacheManager, PathUtils, UploadService,RecordSaveService } from './index.js'
class TempRecord {
  timer = null
  timer_interval = 30 * 1000
  record = null
  path = ''
  newRecord = null
  onTempRecordNumberChanged = null
  _isDestroyed = false // 新增销毁标志位

  constructor(record, onTempRecordNumberChanged, attributesProvider) {
    this.newRecord = record
    // this.dbRecord = uni.$dbRecord // 延迟获取，避免初始化顺序问题
    this.onTempRecordNumberChanged = onTempRecordNumberChanged
    this.attributesProvider = attributesProvider
  }

  get dbRecord() {
    return uni.$dbRecord
  }

  /**
   * 获取全部临时记录
   * @returns {Array} 临时记录列表
   */
  async getRecords() {
    return this.dbRecord.getTempRecords()
  }

  /**
   * 根据 id 获取单条临时记录
   * @param {string} id - 临时记录的唯一标识
   * @returns {Object|null} 找到则返回记录，否则返回 null
   */
  getRecord(id) {
    return this.dbRecord.getRecordById(id)
  }

  /**
   * 添加一条临时记录并触发数量变化通知
   * @param {Object} [record=this.record] - 要添加的记录对象
   * @returns {Promise<void>}
   */
  async addRecord(record = this.record) {
    try {
      await this.dbRecord.addRecord(record)
      uni.$logger.local.info('〖接待记录Record〗 == 新增临时记录 id: ' + record.id)
      this.triggleRecordNumChanged()
    } catch (e) {
      uni.$logger.local.error('〖接待记录Record〗 == 新增临时记录失败: ' + e.message)
    }
  }

  /**
   * 更新临时记录（部分字段）
   * @param {Object} item - 需要更新的字段键值对
   * @param {Object} where - 更新条件（一般为 { id }）
   * @returns {Promise<void>}
   */
  updateRecord(item, where) {
    return this.dbRecord.updateRecord(item, where)
  }

  async __saveData(toUpdateData = {}, record) {
    try {
      if (!record) throw new Error('记录对象为空')
      uni.$logger.local.info('〖接待记录Record〗 == 开始持久化记录 ==' + JSON.stringify(record))
      // const { recordUrlList } = record

      // // 调用保存前钩子
      // await this.beforeSave(record)

      // const recordLongList = await this.analysisUrlList(recordUrlList)

      // // 从缓存恢复大字段数据
      // const restoredData = RecordCacheManager.consumeAll(record)
      // // 构造仅需更新的字段，避免全量更新导致性能浪费
      // const updateData = {
      //   ...toUpdateData, // 确保合并所有字段
      //   recordStatus: 1,
      //   recordUrlList: recordLongList,
      //   ...restoredData // 合并恢复的大字段数据
      // }
      uni.$logger.local.info('〖接待记录Record〗 == 更新文件，保存记录！')
      // 直接更新原记录，不再插入新记录
      await this.dbRecord.updateRecord(toUpdateData, { id: record.id })
      // 删除本地临时文件 (不再删除数据库记录，因为已经转正)
      await this.clearLocalRecord(record, false) // 传入 false 表示不删除数据库记录
      this.triggleRecordNumChanged()
      // 触发轮询开始事件，通知上传管理重新开始轮询
      // UploadService.startPolling()
      RecordSaveService.startPolling()
    } catch (error) {
      uni.$logger.local.info('〖接待记录Record〗 == 保存记录异常' + error.message)
    }
  }

  saveInternal(record) {
    if (!record || !record.id) return
    const { id, recordUrlList, tempFilePath, ...__record } = record
    return this.__save(record, __record)
  }

  async save(record = this.record) {
    await this.beforeSave(record)
    return this.__save(record, {})
  }

  /**
   * 将当前临时记录持久化到正式记录表，并清理本地数据
   * - 开始前会停止轮询
   * - 会对过长的录音列表进行截断
   * @param {Object} [record=this.record] - 要保存的记录
   * @returns {Promise<void>}
   */
  async __save(record, toUpdateData) {
    try {
      const { recordUrlList } = record
      // 从缓存恢复大字段数据
      const restoredData = RecordCacheManager.consumeAll(record)
      const recordLongList = await this.analysisUrlList(recordUrlList)
      const updateData = {
        ...toUpdateData,
        recordStatus: 1,
        recordUrlList: recordLongList,
        ...restoredData // 合并恢复的大字段数据
      }
      return this.__saveData(updateData, record)
    } catch (error) {
      uni.$logger.local.info('〖接待记录Record〗 == 保存记录异常' + error.message)
    }
  }

  /**
   * 将已保存的文件列表映射为上传列表（统一拼接基础保存路径）
   * @param {Array} recordUrlList - 已保存文件路径列表（形如 { file }）
   * @returns {Promise<Array>} 规范化后的上传列表（形如 { status, file }）
   */
  async analysisUrlList(recordUrlList) {
    if (!recordUrlList?.length) return []
    try {
      const basePath = await PathUtils.getBasePath()
      const list = []
      for (const item of recordUrlList) {
        const filePath = item?.file
        if (typeof filePath === 'string' && filePath.length > 0) {
          const baseName = filePath.split('/').pop()
          list.push({
            status: FileStatus.Waiting,
            file: PathUtils.join(basePath, baseName)
          })
        } else {
          uni.$logger.local.warn('〖接待记录Record〗 == 有文件为空路径,舍弃!! ==')
        }
      }
      return list
    } catch (error) {
      uni.$logger.local.info('〖接待记录Record〗 == 解析接待文件列表异常' + error.message)
      throw new Error(error.message)
    }
  }
  /**
   * 删除一条临时记录并触发数量变化通知
   * @param {string} id - 临时记录 id
   * @returns {Promise<void>}
   */
  async removeRecord(id) {
    await this.dbRecord.removeRecord(id)
    uni.$logger.local.info('〖接待记录Record〗 == 删除临时记录 id: ' + id)
    this.triggleRecordNumChanged()
  }

  /**
   * 更新当前内存中的记录并同步到数据库（值未变则跳过）
   * @param {Object} items - 包含多个字段的对象 { key: value, ... }
   * @returns {Promise<void>|undefined} 值未变化时返回 undefined
   */
  async __update(items) {
    if (!this.record || !items || typeof items !== 'object') return
    const updates = Object.fromEntries(Object.entries(items).filter(([k, v]) => !utils.nullValues.includes(v) && this.record[k] !== v))
    if (Object.keys(updates).length) {
      Object.assign(this.record, updates)
      return this.updateRecord(updates, { id: this.record.id })
    }
  }

  /**
   * 彻底删除一条接待记录
   * @param {Object} record - 要删除的记录对象
   * @returns {Promise<void>}
   */
  async deleteRecord(record) {
    if (!record) return
    uni.$logger.local.warn('〖接待记录Record〗 == 开始彻底删除记录 id: ' + record.id)
    if (record.recordUrlList?.length) {
      await this.clearSavedFiles(record)
    }
    await this.clearLocalRecord(record, true)
    uni.$logger.local.warn('〖接待记录Record〗 == 记录彻底删除完成')
  }

  async clearLocalRecord(record = this.record, removeDbRecord = true) {
    const { id, tempFilePath } = record || {}
    uni.$logger.local.info('〖接待记录Record〗 == 删除临时文件' + tempFilePath)
    await this.removeFile(tempFilePath)
    if (id && removeDbRecord) {
      await this.removeRecord(id)
    }
    RecordCacheManager.clearAll(id)
    this.record = null
    this.path = ''
    uni.$logger.local.info('〖接待记录Record〗 == 置空接待记录')
  }

  /**
   * 清除已保存的录音文件
   * @param {Object} options - 配置参数
   * @param {Array} options.recordUrlList - 录音文件列表，默认为当前记录的recordUrlList
   */
  async clearSavedFiles({ recordUrlList = [] } = this.record) {
    for (const item of recordUrlList) {
      uni.$logger.local.info('〖接待记录Record〗 == 清除已保存文件 -> ' + item.file)
      await this.removeFile(item.file)
    }
  }
  /**
   * 缓存物料点数据
   * @param {Array} list
   */
  cacheMaterialPoints(list) {
    if (this.record && this.record.id) {
      RecordCacheManager.set(this.record.id, 'MATERIAL_POINTS', list)
    }
  }

  /**
   * 删除文件（持久化路径使用 `uni.removeSavedFile`）
   * @param {string} filePath - 要删除的文件路径（可能为 `_doc/...` 或其他）
   * @returns {Promise<void>}
   */
  async removeFile(filePath) {
    if (!filePath) return
    let file = filePath
    // 若非 file:// 开头的绝对路径，则补全为本地存储目录下的绝对路径
    if (!filePath.startsWith('file://')) {
      // 优化：使用 getBasePath() 利用缓存，减少 Native Bridge 调用
      const saveDir = await PathUtils.getBasePath()
      // 仅保留文件名，防止 _doc/ 等相对路径前缀干扰
      file = PathUtils.join(saveDir, filePath.split('/').pop())
    }
    return new Promise(resolve => {
      try {
        uni.removeSavedFile({ filePath: file, complete: resolve })
      } catch (e) {
        resolve()
      }
    })
  }

  /**
   * 停止保存轮询并清理定时器句柄
   * @returns {void}
   */
  clearLoopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  async destroy() {
    this._isDestroyed = true
    this.clearLoopTimer()
    uni.$logger.local.info('〖接待记录Record〗 == TempRecord 实例已销毁')
  }

  /**
   * 获取当前内存中的接待记录对象
   * @returns {Object|null} 当前记录，可能为空
   */
  get currentRecord() {
    return this.record
  }

  /**
   * 设置接待结束时间为当前时间并同步到数据库
   * @returns {Promise<void>}
   */
  setReceptionEndTime() {
    return this.__update({ receptionEndTime: this.getTimeNow() })
  }

  /**
   * 获取当前时间字符串（格式化）
   * @returns {string} 形如 `YYYY/MM/DD HH:mm:ss`
   */
  getTimeNow() {
    return utils.convertDateTimeFormat(new Date(), '/')
  }

  /**
   * 标记记录为错误结束原因
   * @returns {Promise<void>}
   */
  withError() {
    return this.__update({ endReasonType: 1 })
  }

  /**
   * 批量更新当前记录的多个预填字段
   * @param {Object} items - 需要更新的键值对
   * @returns {Promise<Object>} 返回更新后的记录对象
   */
  async updatePreRecords(items) {
    await this.__update(items)
    return this.record
  }

  /**
   * 通用添加记录流程
   * - 创建内存中的记录对象
   * - 同步写入临时记录数据库
   * @param {Array} initialUrlList - 初始文件列表
   * @returns {Promise<void>}
   */
  async add(initialUrlList = []) {
    this.record = this.__createNewRecord(initialUrlList)
    await this.addRecord(this.record)
  }

  /**
   * 构造一条新的接待记录的初始对象
   * @param {Array} initialUrlList - 初始的文件列表
   * @returns {Object} 新记录对象
   */
  __createNewRecord(initialUrlList = []) {
    const dynamicAttributes = this.attributesProvider ? this.attributesProvider() : {}
    return {
      id: utils.uuid(),
      ...this.newRecord,
      ...dynamicAttributes,
      receptionStartTime: this.getTimeNow(),
      receptionEndTime: '',
      recordUrlList: initialUrlList,
      recordStatus: 0
    }
  }

  /**
   * 保存前的钩子函数 (子类可覆盖)
   * @param {Object} record
   * @returns {Promise<void>}
   */
  async beforeSave(record) {
    // 默认不做任何事
  }

  /**
   * 触发临时记录数量变化通知
   * @returns {Promise<void>|void}
   */
  async triggleRecordNumChanged() {
    if (this.onTempRecordNumberChanged) {
      this.onTempRecordNumberChanged()
    }
  }
}

export default TempRecord
