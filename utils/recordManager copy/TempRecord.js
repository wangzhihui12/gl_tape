/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-02 18:49:17
 * @LastEditors: limin
 * @LastEditTime: 2025-08-12 10:23:15
 * @FilePath: \gl_tape\utils\recordManager\TempRecord.js
 */
import utils from '../utils'
import helpler from './helpler'
import { FileStatus } from '../common/constants'
class TempRecord {
  timer = null
  timer_interval = 30 * 1000
  record = null
  path = ''
  newRecord = null
  onTempRecordNumberChanged = null
  constructor(record, onTempRecordNumberChanged) {
    this.newRecord = record
    this.recordManager = uni.$dbTempRecord
    this.dbManager = uni.$dbManager
    this.onTempRecordNumberChanged = onTempRecordNumberChanged
  }
  getRecords() {
    return this.recordManager.getRecords()
  }
  getRecord(id) {
    return this.recordManager.getRecordById(id)
  }
  async addRecord(record = this.record) {
    await this.recordManager.addRecord(record)
    this.triggleRecordNumChanged()
  }
  updateRecord(item, where) {
    return this.recordManager.updateRecord(item, where)
  }
  async removeRecord(id) {
    await this.recordManager.removeRecord(id)
    this.triggleRecordNumChanged()
  }
  async __update(key, value) {
    if (this.record[key] === value) return
    this.record[key] = value
    return this.updateRecord({ [key]: value }, { id: this.record.id })
  }
  async getFilePath() {
    if (!this.path) {
      this.path = await utils.getFileSaveFolderOnClient()
    }
    return this.path
  }
  async save(record = this.record) {
    try {
      if (!record) throw new Error('记录对象为空')
      uni.$logger.local.info('〖接待记录Record〗 == 开始持久化记录 ==' + JSON.stringify(record))
      this.clearLoopTimer()
      await this.saveTempFile(record)
      const { recordUrlList, tempFilePath, ...__record } = record
      const recordLongList = await this.__analysisUrlList(recordUrlList)
      const { maxUploadNum = 10 } = uni.$storage.get('mock_data')
      if (recordLongList.length > maxUploadNum) {
        const userInfo = uni.$storage.get('userInfo')
        const { customerName, phoneNumber, carModel, salesName } = record || {}
        const { name } = userInfo || {}
        uni.$logger.error({
          msg: `员工: ${name}, 客户: ${customerName}`,
          extra: {
            '手机号: ': phoneNumber,
            '姓名: ': customerName,
            '销售: ': salesName,
            '车型: ': carModel,
            '原因: ': '录音文件过长，数量' + recordLongList.length
          }
        })
      }
      __record.recordUrlList = recordLongList.slice(0, maxUploadNum)
      uni.$logger.local.info('〖接待记录Record〗 == 更新文件，保存记录！')
      await this.dbManager.addRecord(__record)
      await this.clearLocalRecord(record)
    } catch (error) {
      uni.$logger.local.info('〖接待记录Record〗 == 保存记录异常' + error.message)
    }
  }
  async clearLocalRecord(record = this.record) {
    const { id, tempFilePath } = record
    uni.$logger.local.info('〖接待记录Record〗 == 删除临时文件' + tempFilePath)
    await this.removeFile(tempFilePath)
    await this.removeRecord(id)
    record = null
    uni.$logger.local.info('〖接待记录Record〗 == 置空接待记录')
  }
  /**
   * 清除已保存的录音文件
   * @param {Object} options - 配置参数
   * @param {Array} options.recordUrlList - 录音文件列表，默认为当前记录的recordUrlList
   */
  clearSavedFiles({ recordUrlList = [] } = this.record) {
    // 遍历录音文件列表并删除每个文件
    recordUrlList.forEach(item => {
      this.removeFile(item.file)
    })
  }
  async __analysisUrlList(recordUrlList) {
    if (!recordUrlList?.length) return []
    try {
      const __path = await this.getFilePath()
      const __list = recordUrlList.reduce((arr, item) => {
        if (item?.file) {
          arr.push({
            status: FileStatus.Waiting,
            file: __path + item.file.replace(/.+\/(\d+\.mp3)/, '$1')
          })
        } else {
          uni.$logger.local.warn('〖接待记录Record〗 == 有文件为空路径,舍弃!! ==')
        }
        return arr
      }, [])
      return __list
    } catch (error) {
      uni.$logger.local.info('〖接待记录Record〗 == 解析接待文件列表异常' + error.message)
      throw new Error(error.message)
    }
  }
  /**
   * 添加新的接待记录
   */
  async add() {
    // 创建一个新的记录对象
    this.record = this.__createNewRecord()
    // 异步添加新创建的记录对象
    await this.addRecord(this.record)
    // 添加音频资源
    this.addAudio()
  }
  __createNewRecord() {
    return {
      id: utils.uuid(),
      ...this.newRecord,
      receptionStartTime: this.getTimeNow(),
      receptionEndTime: '',
      recordUrlList: []
    }
  }

  /**
   * 添加音频
   * @param {Object} isUpdate - 是否更新音频
   * @returns {void}
   */
  // Update the record with the new information
  async addAudio() {
    this.clearLoopTimer()
    uni.$logger.local.info('〖接待记录Record〗 == 保存上一个临时文件！')
    //保存上一个临时文件
    await this.saveLastAudio()
    //删除上一个临时文件
    await this.removeOldTempAudio()
    //等待1秒
    await helpler.sleep(1000)
    //新增一个录音
    await this.addNewAudio()
    //更新临时录音文件
    await this.updatePath()
    //开启轮询保存临时录音文件
    this.startSaveAudioLoop()
  }

  async addNewAudio() {
    const lastAudio = await helpler.getLatestAudioFilePath()
    uni.$logger.local.info('〖接待记录Record〗 == 添加一个新的录音' + lastAudio)
    this.record.tempFilePath = lastAudio
    const __path = await this.saveFilePath(lastAudio)
    this.record.recordUrlList.push({ file: __path })
  }

  removeOldTempAudio() {
    const { tempFilePath } = this.record
    uni.$logger.local.info('〖接待记录Record〗 == 删除上一个临时文件 -> ' + tempFilePath)
    return this.removeFile(tempFilePath)
  }

  updatePath() {
    const { id, tempFilePath, recordUrlList } = this.record
    return this.updateRecord({ tempFilePath, recordUrlList }, { id })
  }
  /**
   * 保存文件
   * @param {Object} record - 接待记录对象
   * @returns  - 返回保存后的文件路径
   */
  async saveTempFile(record = this.record) {
    const { tempFilePath, recordUrlList } = record
    const lastIndex = recordUrlList.length - 1
    if (lastIndex < 0 || !tempFilePath) return
    const { file } = recordUrlList[lastIndex]
    const saveResultPath = await this.saveFilePath(tempFilePath)
    if (saveResultPath) {
      uni.$logger.local.info('〖接待记录Record〗 == 删除上一次保存的文件 ' + file)
      await this.removeFile(file)
      record.recordUrlList[lastIndex].file = saveResultPath
    }
    return saveResultPath
  }
  async saveFilePath(tempFilePath) {
    uni.$logger.local.info('〖接待记录Record〗 == 开始保存临时录音 tempFilePath-> ' + tempFilePath)
    if (!tempFilePath) return
    const saveResult = await uni.saveFile({
      tempFilePath
    })
    let saveResultPath = saveResult[1]?.savedFilePath
    uni.$logger.local.info('〖接待记录Record〗 == 保存后的文件路径 saveResultPath ->' + saveResultPath)
    return saveResultPath
  }
  removeFile(filePath) {
    if (!filePath) return
    return new Promise(resolve => {
      uni.removeSavedFile({
        filePath,
        complete: resolve
      })
    })
  }
  async saveLastAudio() {
    const __path = await this.saveTempFile()
    __path && this.updateUrlList()
  }

  updateUrlList() {
    const { id, recordUrlList } = this.record
    return this.updateRecord({ recordUrlList }, { id })
  }
  startSaveAudioLoop() {
    this.clearLoopTimer()
    this.timer = setInterval(this.saveLastAudio.bind(this), this.timer_interval)
  }
  clearLoopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  get currentRecord() {
    return this.record
  }
  setReceptionEndTime() {
    return this.__update('receptionEndTime', this.getTimeNow())
  }
  getTimeNow() {
    return utils.convertDateTimeFormat(new Date(), '/')
  }
  withError() {
    return this.__update('endReasonType', 1)
  }
  async updatePreRecords(items) {
    if (items) {
      Object.keys(items).forEach(async key => await this.__update(key, items[key]))
    }
    return this.record
  }
  async triggleRecordNumChanged() {
    if (this.onTempRecordNumberChanged) {
      this.onTempRecordNumberChanged()
    }
  }
}
export default TempRecord
