/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-28 20:57:12
 * @LastEditors: cenchengwei@foreverht.com
 * @LastEditTime: 2026-04-08 15:24:00
 * @FilePath: /gl_tape/utils/recordManager/RecordSaveService.js
 */
import Queue from '@/utils/Queue.js'
import { deepClone, serializeIfObject } from '@/utils/utils.js'
import { FileStatus } from '@/utils/common'
import dayjs from 'dayjs'
import store from '@/store'
import FileUploadManager from './FileUploadManager.js'

const UPLOAD_INTERVAL = 0.5 * 60 * 1000

/**
 * 接待记录保存服务
 * 
 * 职责：
 * 1. 管理接待记录的上传队列
 * 2. 处理文件上传结果
 * 3. 保存接待记录到服务器
 * 4. 清理本地文件和记录
 * 
 * 特点：
 * - 使用 FileUploadManager 处理文件上传
 * - 自动轮询上传队列
 * - 支持网络恢复后自动重试
 * - 黑名单机制防止死循环
 */
class RecordSaveService {
  static instance = null

  constructor() {
    this.interval = UPLOAD_INTERVAL
    this._pumpTimer = null
    this._pumpRunning = false
    this.snapshot = null
    this._currentKey = null
    this.updateResolve = null
    this._taskStartTime = null
    this._networkHandler = null
    this._blackList = new Set()

    // Bind methods to ensure 'this' context
    this.stopPolling = this.stopPolling.bind(this)
    this.startPolling = this.startPolling.bind(this)
    this.setInterval = this.setInterval.bind(this)
  }

  static getInstance() {
    if (!RecordSaveService.instance) {
      RecordSaveService.instance = new RecordSaveService()
    }
    return RecordSaveService.instance
  }

  async init() {
    try {
      // 监听网络状态变化
      this._networkHandler = res => {
        if (res.isConnected) {
          uni.$logger.local.info(`【接待记录保存服务】 == 网络已恢复，唤醒上传任务`)
          this.startPolling()
        }
      }
      uni.onNetworkStatusChange(this._networkHandler)
      
      uni.$logger.local.info('【接待记录保存服务】初始化成功')
    } catch (error) {
      this.reportError(`【接待记录保存服务】初始化失败 error:${error.message}`, error.message)
    }
  }

  /**
   * 处理文件上传结果
   * @param {Object} data - 上传结果数据
   */
  async handleUploadResult(data) {
    uni.$logger.local.info(`【接待记录保存服务】 == 文件上传回调!`)
    this.save(data)
  }

  /**
   * 生成任务唯一标识 Key
   */
  _getTaskKey(recordId, fileName) {
    return `${recordId || ''}_${fileName || ''}`
  }

  /**
   * 保存上传结果
   */
  async save(data) {
    try {
      const fileInfo = this.parseFileInfo(data)
      if (fileInfo?.error) {
        // uni.$logger.local.error(`【接待记录保存服务】 == 上传文件信息解析异常: ${fileInfo.error}`)
        // this.reportError(
        //   `【接待记录保存服务】 == 上传文件信息解析异常: ${fileInfo.error}`,
        //   fileInfo.data,
        //   fileInfo.recordId,
        //   fileInfo.filePath
        // )
        throw new Error(`上传文件信息解析异常: ${fileInfo.error}`)
      }

      uni.$logger.local.info(`【接待记录保存服务】 == 解析结果: recordId=${fileInfo.recordId}, status=${fileInfo.status}`)

      const callbackKey = this._getTaskKey(fileInfo.recordId, fileInfo.fileName)
      const isCurrentTask = this._currentKey && callbackKey === this._currentKey

      if (!isCurrentTask) {
        uni.$logger.local.warn(`【接待记录保存服务】 == 收到非当前任务回调: ${callbackKey} (当前: ${this._currentKey})，仅更新状态`)
      }

      const record = await uni.$dbRecord.getRecordById(fileInfo.recordId)
      if (!record) {
        throw new Error(`未找到记录: ${fileInfo.recordId}`)
      }

      const modifiedRecord = this._changeFilePathToServer(record, fileInfo)
      await this._saveOrUpdate(modifiedRecord)

      if (isCurrentTask) {
        uni.$logger.local.info('【接待记录保存服务】 == 本次任务完成,开启下一次上传任务!')
        this.endTask()
      }
    } catch (error) {
      if (this._currentKey) {
        this._addToBlackList(this._currentKey.split('_')[0], `Save failed: ${error.message}`)
      }
      this.reportError(`【接待记录保存服务】 == 保存记录(save)异常 error: ${error.message}`, error.message, data?.recordId, data?.filePath + data?.fileName)
      this.endTask()
    }
  }

  /**
   * 解析文件信息
   */
  parseFileInfo(data) {
    // 1. 尝试从回调结构中提取 payload
    const payload = data?.detail?.data?.[0]

    // CASE 1: 上传回调
    if (payload) {
      const { data: d, ...o } = payload
      const input = serializeIfObject(o)
      uni.$logger.local.warn(`【接待记录保存服务】 == 开始文件信息解析-> ${input}`)
      return this._parseUploadedFile(data)
    }

    // CASE 2: 直接调用 (data 是 record 对象)
    if (data && (data.status === FileStatus.NoFile || data.status === FileStatus.NotExist)) {
      return this._parseNoFileStatus(data)
    }
    return { error: '【接待记录保存服务】 == 未知文件状态', data, filePath: (data.filePath || '') + (data.fileName || '') }
  }

  _parseNoFileStatus(data) {
    const { recordId, fileName, filePath, status } = data
    const clientPath = (filePath || '') + (fileName || '')
    if (!recordId) {
      return { error: '【接待记录保存服务】 == 缺少记录ID', data, filePath: clientPath }
    }
    return {
      recordId: String(recordId),
      clientPath,
      serverPath: null,
      fileName: String(fileName || ''),
      status: status == FileStatus.NotExist ? FileStatus.Completed : FileStatus.NoFile
    }
  }

  _parseUploadedFile(data) {
    const payload = data?.detail?.data?.[0]
    const { recordId, fileName, filePath } = payload || {}
    const clientPath = (filePath || '') + (fileName || '')

    if (!payload || typeof payload !== 'object') {
      return { error: '回调数据格式错误', data, recordId: data?.recordId, filePath: clientPath }
    }
    if (!recordId) {
      return { error: '文件上传回调,缺少recordId', data, filePath: clientPath }
    }
    const { code, message, data: fileData } = payload
    const serverUrl = fileData?.oss?.res?.requestUrls?.[0]
    if (code !== 0 || !serverUrl) {
      return { error: `解析异常: code->${code} message->${message}`, data, recordId, filePath: clientPath }
    }
    return {
      recordId,
      fileName,
      clientPath,
      serverPath: String(serverUrl).split('?')[0],
      status: FileStatus.Uploaded
    }
  }

  _reportParseError(msg, data, recordId, filePath) {
    const fullMsg = `【接待记录保存服务】 == ${msg}`
    uni.$logger.local.error(fullMsg)
    this.reportError(fullMsg, data, recordId, filePath)
  }

  _changeFilePathToServer(record, fileInfo) {
    const _record = deepClone(record)
    uni.$logger.local.info(`【接待记录保存服务】 == 开始更新文件路径, recordId: ${_record.id}`)

    if (fileInfo.status === FileStatus.NoFile) {
      _record.status = FileStatus.NoFile
      _record.receptionEndTime = _record.receptionEndTime || record.receptionStartTime
      _record.recordUrlList = []
      uni.$logger.local.info(`【接待记录保存服务】 == 记录被标记为无文件状态`)
      return _record
    }

    _record.recordUrlList = this.urlListFilter(_record.recordUrlList)
    const targetFile = _record.recordUrlList.find(item => this._isTargetFile(item, fileInfo))

    if (targetFile) {
      this._updateFileStatus(targetFile, fileInfo)
    } else {
      uni.$logger.local.warn(`【接待记录保存服务】 == 未找到匹配的文件记录: ${JSON.stringify(fileInfo)}`)
    }
    return _record
  }

  _isTargetFile(item, fileInfo) {
    if (!this.isLegalFile(fileInfo.fileName)) return !this.isLegalFile(item.file)
    return item.file === fileInfo.clientPath || item.file.endsWith(fileInfo.fileName)
  }

  _updateFileStatus(targetFile, fileInfo) {
    targetFile.status = fileInfo.status
    if (fileInfo.status === FileStatus.Uploaded) {
      targetFile.file = fileInfo.serverPath
      targetFile.filePathOnClient = fileInfo.clientPath
    }
    uni.$logger.local.info(`【接待记录保存服务】 == 文件状态已更新: ${fileInfo.fileName} -> ${fileInfo.status}`)
  }

  async reportError(message, res, recordId, filePath) {
    try {
      const record = recordId ? await uni.$dbRecord.getRecordById(recordId) : {}
      const userInfo = uni.$storage.get('userInfo') || {}
      const { customerName, customerPhone, carType } = record || {}
      const { user: { userName } = {} } = userInfo
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
      uni.$logger.error({
        msg: `${now}-${message},员工: ${userName}, 客户: ${customerName}`,
        extra: {
          '员工: ': userName,
          '客户姓名: ': customerName,
          '客户手机号: ': customerPhone,
          '车型: ': carType,
          '原因: ': serializeIfObject(res),
          '文件路径: ': filePath
        }
      })
    } catch (error) {
      uni.$logger.error(`【接待记录保存服务】 == 报告错误时发生异常: ${error.message}`)
    }
  }

  async enQueue() {
    try {
      const _snapshot = await this.getRecordsSnapshotFlatten()
      this.snapshot = new Queue(_snapshot)
      uni.$logger.local.warn(`【接待记录保存服务】 == 创建快照成功! ${JSON.stringify(this.snapshot.items)}  快照数:  ${this.snapshot.size} `)
    } catch (error) {
      this.reportError(`【接待记录保存服务】 == 获取快照失败 error:${error.message}`, error.message)
      if (!this.snapshot) {
        this.snapshot = new Queue([])
      }
    }
  }

  async getRecordsSnapshotFlatten() {
    await uni.$dbReady
    let _records = await uni.$dbRecord.getCompletedRecords()
    return await this.flattenData(_records || [])
  }

  /**
   * 上传文件记录
   * 使用 FileUploadManager 处理文件上传
   */
  async uploadRecord(record) {
    uni.$logger.local.info(`【接待记录保存服务】 == 开始上传文件!! record: ${JSON.stringify(record)}`)
    
    try {
      // 使用 FileUploadManager 上传文件
      await FileUploadManager.uploadRecord(record, (result) => {
        // 处理上传结果
        this.handleUploadResult(result)
      })
    } catch (error) {
      uni.$logger.local.error(`【接待记录保存服务】 == 上传失败: ${error.message}`)
      
      // 构造错误结果
      const errorResult = {
        detail: {
          data: [{
            code: -1,
            message: error.message,
            recordId: record.recordId,
            fileName: record.fileName,
            filePath: record.filePath
          }]
        }
      }
      
      this.handleUploadResult(errorResult)
    }
  }

  _removeFileOnClient(filePathOnClient) {
    return new Promise((resolve, reject) => {
      if (!filePathOnClient) {
        uni.$logger.local.info(`【接待记录保存服务】 == 要删除的文件为空`)
        resolve(true)
        return
      }
      uni.removeSavedFile({
        filePath: filePathOnClient,
        complete: function (res) {
          uni.$logger.local.info(`删除 ${filePathOnClient}-> ${res.errMsg}`)
          resolve(res)
        }
      })
    })
  }

  async _saveOrUpdate(data) {
    uni.$logger.local.info(`【接待记录保存服务】 == 开始保存或更新接待记录!!`)
    const { status, tempFilePath, recordStatus, ...record } = data
    const fileList = Array.isArray(record.recordUrlList) ? record.recordUrlList : []
    const isAllCompleted = status === FileStatus.NoFile || fileList.every(i => [FileStatus.Uploaded, FileStatus.Completed].includes(i.status))
    if (isAllCompleted) {
      await this._handleCompletedRecord(record, fileList)
    } else {
      await this._handleIncompleteRecord(record)
    }
  }

  async _handleCompletedRecord(record, fileList) {
    // 1. 整理文件路径
    const uploadedFiles = fileList.filter(file => file.status == FileStatus.Uploaded)
    const serverPaths = uploadedFiles.map(i => i.file)
    const localPaths = uploadedFiles.map(i => i.filePathOnClient)

    uni.$logger.local.warn(`【接待记录保存服务】 == 本条接待所有文件已经上传和处理完毕!!`)
    // uni.$logger.local.info(`【接待记录保存服务】 == 已上传的文件: ${JSON.stringify(serverPaths)}`)
    // 2. 准备提交参数
    const params = { ...record, recordUrlList: serverPaths }
    if (!params.receptionEndTime) {
      params.receptionEndTime = await this._requestReceptionEndTime(serverPaths, params.receptionStartTime)
    }
    // 3. 提交到服务器
    uni.$logger.local.info(`【接待记录保存服务】 == 开始向服务器保存接待记录!!参数: ${JSON.stringify(params)}`)
    const res = await uni.$api.commonApi.saveRecCustomer(params)
    uni.$logger.local.warn(`【接待记录保存服务】 == 服务器返回结果: ${JSON.stringify(res)}`)
    // 4. 清理本地数据
    if (res) {
      uni.$logger.local.info(`【上传服务】 == 开始删除客户端的文件!!`)
      await this._removeRecordFiles(localPaths)
      await this._removeRecordById(record.id)
    }
  }

  /**
   * 向服务器请求接待结束时间
   * 这个函数用于向服务器请求接待结束时间
   * @param {Array} recordUrlList - 包含文件URL的数组
   * @param {string} receptionStartTime - 接待开始时间
   * @returns {Promise<string>} - 一个 Promise，成功时解析为接待结束时间
   */
  async _requestReceptionEndTime(recordUrlList, receptionStartTime) {
    if (!recordUrlList || recordUrlList.length === 0) return receptionStartTime
    // 记录日志，显示正在向服务器请求结束接待时间，包括文件URL列表和接待开始时间
    uni.$logger.local.info(`【上传服务】 == 向服务器获取结束接待时间: recordUrlList ->${serializeIfObject(recordUrlList)} receptionStartTime: -> ${receptionStartTime}`)
    // 调用 uni.$api.commonApi.searchRecordingEndTime 方法，向服务器发送请求，获取接待结束时间
    const endTime = await uni.$api.commonApi.searchRecordingEndTime({ recordUrlList, receptionStartTime: receptionStartTime.replace(/\//g, '-') })
    // 记录日志，显示服务器返回的接待结束时间
    uni.$logger.local.info(`【上传服务】 == 服务器返回结束接待时间: endTime ->${endTime}`)
    // 返回接待结束时间，将日期格式中的连字符替换为斜杠，以保持一致性
    return endTime.replace(/\-/g, '/')
  }

  async _handleIncompleteRecord(record) {
    uni.$logger.local.info(`【接待记录保存服务】 == 记录中有未上传文件,开始更新记录!!`)
    await uni.$dbRecord.updateRecord({ recordUrlList: record.recordUrlList }, { id: record.id })
  }

  async _removeRecordById(recordId) {
    try {
      await uni.$dbRecord.removeRecord(recordId)
      uni.$logger.local.info(`【接待记录保存服务】 == 删除接待记录成功: recordId ->${recordId}`)
    } catch (error) {
      this.reportError(`【接待记录保存服务】 == 删除接待记录异常: error ->${error.message}`, { message: error.message, recordId })
    }
  }

  async _removeRecordFiles(fileArr) {
    try {
      while (fileArr.length > 0) {
        const file = fileArr.shift()
        await this._removeFileOnClient(file)
      }
      uni.$logger.local.info(`【接待记录保存服务】 == 删除接待文件完成!`)
    } catch (error) {
      this.reportError(`【接待记录保存服务】 == 删除接待文件异常: error ->${error.message}`, { message: error.message, fileArr })
    }
  }

  /**
   * 将任务添加到黑名单
   */
  _addToBlackList(key, reason = 'unknown') {
    if (!key) return
    if (!this._blackList.has(key)) {
      this._blackList.add(key)
      uni.$logger.local.warn(`【接待记录保存服务】 == 加入黑名单 [${key}]: ${reason}`)
    }
  }

  /**
   * 检查是否在黑名单中
   */
  _isInBlackList(key) {
    return key && this._blackList.has(key)
  }

  async flattenData(records) {
    const result = []
    try {
      for (const cur of records) {
        const recordUrlList = this.urlListFilter(cur.recordUrlList)
         // 1. 记录级别的黑名单检查 (针对空文件等整条记录的问题)
        if (this._isInBlackList(cur.id)) {
          continue
        }
        if (recordUrlList.length == 0) {
          result.push({ status: FileStatus.NoFile, recordId: cur.id })
          this.reportError('【接待记录保存服务】 == 记录中不存在接待语音文件', { record: cur }, cur.id)
          continue
        }
        for (const file of recordUrlList) {
          try {
            if (file.status === FileStatus.Uploaded || file.status === FileStatus.Completed) continue
            const aFullPath = file.file.split('/')
            const fileName = aFullPath.pop()
            const filePath = aFullPath.join('/') + '/'
            const file2Up = { ...file, recordId: cur.id, fileName, filePath }
            const fileExists = await this.checkFileExists(file.file)
            if (!fileExists) {
              this.reportError('【接待记录保存服务】 == 记录中有语音文件地址,但是文件不存在', { record: cur, file }, cur.id, file.file)
              file2Up.status = FileStatus.NotExist
            }
            result.push(file2Up)
          } catch (error) {
            this.reportError(`【接待记录保存服务】 == 解析处理文件异常 error: ${error.message}`, { record: cur, file })
            this._addToBlackList(cur.id, `Parse error: ${error.message}`)
            continue
          }
        }
      }
      return result
    } catch (error) {
      uni.$logger.local.error(`【接待记录保存服务】 == 处理文件列表异常: ${error.message}`)
      return result
    }
  }

  urlListFilter(urlList) {
    if (!Array.isArray(urlList)) {
      urlList = []
    }
    const __list = urlList.filter(item => item?.file)
    return __list
  }

  async checkFileExists(filePath) {
    return new Promise(resolve => {
      if (!filePath || !this.isLegalFile(filePath)) {
        resolve(false)
        return
      }
      uni.getFileInfo({
        filePath: filePath,
        success: function (info) {
          resolve(true)
        },
        fail: function (error) {
          resolve(false)
        }
      })
    })
  }

  isLegalFile(file) {
    return file && String(file).toLowerCase().endsWith('.mp3')
  }

  waitting(ms = this.interval) {
    uni.$logger.local.info(ms + 'ms后开始下一轮尝试!')
    this._scheduleNext(ms)
  }

  async beginTask(record) {
    await this.task(record)
  }

  task(record) {
    return new Promise(async resolve => {
      const timeoutId = this._startWatchdog()
      this.updateResolve = () => {
        clearTimeout(timeoutId)
        resolve()
      }
      this._taskStartTime = Date.now()
      this._currentKey = this._getTaskKey(record.recordId, record.fileName)
      try {
        if (this._isInBlackList(record.recordId)) {
          uni.$logger.local.warn(`【接待记录保存服务】 == 任务在黑名单中，跳过: ${this._currentKey}`)
          this.endTask()
          return
        }
        await this.uploadRecord(record)
      } catch (error) {
        this._addToBlackList(record.recordId, `上传文件时发生异常(uploadRecord): ${error.message}`)
        this.reportError(`上传文件时发生异常(uploadRecord): ${error.message}`, error.message)
        this.endTask()
      }
    })
  }

  _startWatchdog() {
    const TIMEOUT_THRESHOLD = 10 * 60 * 1000
    return setTimeout(() => {
      if (this.updateResolve) {
        uni.$logger.local.error('【接待记录保存服务】 == 看门狗检测到任务卡死超过10分钟，强制结束当前任务！')
        this.endTask()
      }
    }, TIMEOUT_THRESHOLD)
  }

  endTask() {
    this.updateResolve && this.updateResolve()
    this.updateResolve = null
    this._taskStartTime = null
  }

  stopPolling() {
    if (this.snapshot) {
      this.snapshot.clear()
      this.snapshot = null
    }
    if (this._pumpTimer) {
      clearTimeout(this._pumpTimer)
      this._pumpTimer = null
    }
    this.canclePromises()
    uni.$logger.local.info(`【接待记录保存服务】 == 停止文件上传轮询并清除队列`)
  }

  setInterval(interval, isForce = false) {
    // 保留接口，暂不实现动态调整
  }

  async startPolling(isForce = false) {
    await uni.$dbReady
    await this._ensureInitialized()
    this._blackList.clear()
    if (this._pumpRunning || this.updateResolve) {
      if (!isForce) {
        uni.$logger.local.info(`【接待记录保存服务】 == 非强制模式下,不强制重启轮询`)
        return
      } else {
        uni.$logger.local.info(`【接待记录保存服务】 == 强制模式下,立即完成promise,强制重启轮询`)
        this.canclePromises()
      }
    }
    if (this._pumpTimer) {
      clearTimeout(this._pumpTimer)
      this._pumpTimer = null
    }
    this._pumpTimer = setTimeout(() => {
      this._schedulerPump()
    }, 0)
    uni.$logger.local.info(`【接待记录保存服务】 =========开启上传服务========`)
  }

  /**
   * 确保已初始化
   * 使用 Promise 等待 FileUploadManager 被初始化（由 HomeFrame 负责初始化）
   * @private
   */
  async _ensureInitialized() {
    // 如果已经初始化，直接返回
    if (FileUploadManager.uploadManager) {
      return
    }
    // 等待 FileUploadManager 被初始化（由 HomeFrame.mounted 负责）
    await FileUploadManager.waitForInit()
    // 等待策略就绪
    await FileUploadManager.uploadManager.ready()
  }

  canclePromises() {
    this.endTask()
  }

  async _schedulerPump() {
    if (this._pumpRunning) return
    this._pumpRunning = true
    let record = null
    try {
      const stopReason = await this._checkStopConditions()
      if (stopReason) {
        uni.$logger.local.info(`【接待记录保存服务】 == ${stopReason}, 暂停上传服务 ,等待唤醒`)
        return
      }

      // 从队列取出任务
      record = this.snapshot.dequeue()
      
      // 执行任务
      await this.beginTask(record)

      // 成功：立即处理下一个任务
      this._scheduleNext(0)
    } catch (error) {
      this.reportError(`【接待记录保存服务】 == 异常,error->${error.message}`, error.message, record?.recordId)
      // 如果任务已经 dequeue，将其加入黑名单防止死循环
      if (record?.recordId) {
        this._addToBlackList(record.recordId, `Scheduler error: ${error.message}`)
      }
      // 发生异常，等待后继续处理下一个任务
      uni.$logger.local.warn(`【接待记录保存服务】 == 发生异常，将在 ${this.interval}ms 后继续处理下一个任务`)
      this.waitting(this.interval)
    } finally {
      this._pumpRunning = false
    }
  }

  async _checkStopConditions() {
    let isInBackgound = false
    try {
      if (store && store.getters) {
        isInBackgound = store.getters.isInBackgound
      }
    } catch (e) {}

    if (isInBackgound) {
      return 'APP在后台运行,不进行文件上传'
    }

    const isOnline = await uni.$isNetWork()
    if (!isOnline) {
      return '网络异常,等待网络恢复'
    }

    if (this.updateResolve) {
      return '任务正在执行中'
    }

    if (!this.snapshot || this.snapshot.size === 0) {
      await this.enQueue()
    }

    if (!this.snapshot || this.snapshot.size === 0) {
      return '队列为空'
    }
    return null
  }

  _scheduleNext(ms = 0) {
    if (this.snapshot === null) return
    if (this._pumpTimer) {
      clearTimeout(this._pumpTimer)
      this._pumpTimer = null
    }
    this._pumpTimer = setTimeout(
      () => {
        this._schedulerPump()
      },
      Math.max(0, ms)
    )
  }

  off() {
    if (this._networkHandler) {
      uni.offNetworkStatusChange(this._networkHandler)
      this._networkHandler = null
    }
  }
}

export default RecordSaveService.getInstance()
