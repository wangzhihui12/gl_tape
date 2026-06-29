/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2026-01-13 16:30:09
 * @LastEditors: limin
 * @LastEditTime: 2026-01-29 16:07:00
 * @FilePath: \gl_tape\utils\recordManager\UploadService.js
 */

import { getOssToken } from '@/utils/ossUploadFile/uploadFile.js'
import Queue from '@/utils/Queue.js'
import { Command } from '@/ws/constants'
import { isInteger, deepClone, serializeIfObject, getWebviewInstance } from '@/utils/utils.js'
import { FileStatus } from '@/utils/common'
import dayjs from 'dayjs'
// import { decryptAES } from '@/lib/aes.js'
import store from '@/store'
import { USE_NATIVE_RECORDER } from './strategies'

const UPLOAD_INTERVAL = 0.5 * 60 * 1000

class UploadService {
  constructor() {
    this.wv = null
    this.interval = UPLOAD_INTERVAL
    this._pumpTimer = null
    this._pumpRunning = false
    this.snapshot = null
    this._retryCount = 0
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
    if (!UploadService.instance) {
      UploadService.instance = new UploadService()
    }
    return UploadService.instance
  }

  async init() {
    try {
      // 监听网络状态变化
      this._networkHandler = res => {
        if (res.isConnected) {
          uni.$logger.local.info(`【上传服务】 == 网络已恢复，唤醒上传任务`)
          this.startPolling()
        }
      }
      uni.onNetworkStatusChange(this._networkHandler)
    } catch (error) {
      this.reportError(`【上传服务】初始化失败 error:${error.message}`, error.message)
    }
  }

  /**
   * 内部方法：设置并激活 Webview
   * @param {Object} wv - 原生 Webview 对象
   * @param {Object} refInfo - 引用信息 { component, context }
   * @returns {boolean} 是否设置成功
   */
  _setupWebview(wv, refInfo) {
    if (wv) {
      if (typeof wv.setStyle === 'function') {
        wv.setStyle({ top: '-1000px', left: '-1000px', width: '10px', height: '10px' })
      }
      this.wv = wv
      if (refInfo) {
        this._webviewRef = refInfo
      }
      return true
    }
    return false
  }

  /**
   * 设置 Webview 实例（由 UI 组件注入）
   * @param {Object} webviewComponent - Vue 组件引用 ($refs.uploaderWebview)
   * @param {Object} vueContext - Vue 实例上下文 (this)
   */
  async setWebviewContext(webviewComponent, vueContext) {
    // #ifdef APP-PLUS
    // 尝试获取实例，带有重试机制 (封装在 getWebviewInstance 中)
    const wv = await getWebviewInstance(webviewComponent, vueContext)

    // 保存引用以便后续轮询中自动恢复
    const refInfo = { component: webviewComponent, context: vueContext }

    if (this._setupWebview(wv, refInfo)) {
      uni.$logger.local.info('【上传服务】Webview Context 已注入')
      // Webview 就绪，正式启动轮询
      if (!this._pumpRunning) {
        this.startPolling()
      }
    } else {
      // 即使第一次没成功，也保存引用，以便后续自动恢复
      this._webviewRef = refInfo
      uni.$logger.local.warn('【上传服务】Webview 初始化未就绪，将在轮询中自动恢复')
    }
    // #endif
  }

  /**
   * webview文件上传完成后执行的函数
   * @param {*} data
   */
  handlerMessage(data) {
    uni.$logger.local.info(`【上传服务】 == 文件上传回调!`)
    // 这里的 data 结构需要适配 parseFileInfo
    // 原来的 data 来自 @message 事件，结构是 { detail: { data: [payload] } }
    // 我们在 _setupWebview 中构造了相同的结构
    this.save(data)
  }

  /**
   * 生成任务唯一标识 Key
   */
  _getTaskKey(recordId, fileName) {
    return `${recordId || ''}_${fileName || ''}`
  }

  async save(data) {
    try {
      const fileInfo = this.parseFileInfo(data)
      if (!fileInfo?.recordId) {
        uni.$logger.local.error(`【上传服务】 == 上传文件信息解析异常`)
        throw new Error('上传文件信息解析异常，强制结束当前任务')
      }

      uni.$logger.local.info(`【上传服务】 == 解析结果: recordId=${fileInfo.recordId}, status=${fileInfo.status}`)

      const callbackKey = this._getTaskKey(fileInfo.recordId, fileInfo.fileName)
      const isCurrentTask = this._currentKey && callbackKey === this._currentKey

      if (!isCurrentTask) {
        uni.$logger.local.warn(`【上传服务】 == 收到非当前任务回调: ${callbackKey} (当前: ${this._currentKey})，仅更新状态`)
      }

      const record = await uni.$dbRecord.getRecordById(fileInfo.recordId)
      if (!record) {
        throw new Error(`未找到记录: ${fileInfo.recordId}`)
      }

      const modifiedRecord = this._changeFilePathToServer(record, fileInfo)
      await this._saveOrUpdate(modifiedRecord)

      if (isCurrentTask) {
        uni.$logger.local.info('【上传服务】 == 本次任务完成,开启下一次上传任务!')
        this.endTask()
      }
    } catch (error) {
      if (this._currentKey) {
        this._addToBlackList(this._currentKey.split('_')[0], `Save failed: ${error.message}`)
      }
      this.reportError(`【上传服务】 == 保存记录(save)异常 error: ${error.message}`, error.message, data?.recordId, data?.filePath + data?.fileName)
      this.endTask()
    }
  }

  parseFileInfo(data) {
    try {
      // 1. 尝试从 Webview 回调结构中提取 payload
      const payload = data?.detail?.data?.[0]

      // CASE 1: Webview 回调
      if (payload) {
        const { data: d, ...o } = payload
        const input = serializeIfObject(o)
        uni.$logger.local.warn(`【上传服务】 == 开始文件信息解析-> ${input}`)
        return this._parseUploadedFile(data)
      }

      // CASE 2: 直接调用 (data 是 record 对象)
      // 检查是否包含特定状态 (NoFile / NotExist)
      if (data && (data.status === FileStatus.NoFile || data.status === FileStatus.NotExist)) {
        return this._parseNoFileStatus(data)
      }

      return null
    } catch (error) {
      uni.$logger.local.error(`【上传服务】 == 解析文件信息异常: ${error.message}`)
      return null
    }
  }

  _parseNoFileStatus(data) {
    const { recordId, fileName, filePath, status } = data
    const clientPath = (filePath || '') + (fileName || '')
    if (!recordId) {
      this.reportError('【上传服务】 == 缺少记录ID', data)
      return null
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
      this._reportParseError('回调数据格式错误', data, data?.recordId, clientPath)
      return null
    }

    if (!recordId) {
      this._reportParseError('文件上传回调,缺少recordId', data, undefined, clientPath)
      return null
    }

    const { code, message, data: fileData } = payload
    const serverUrl = fileData?.oss?.res?.requestUrls?.[0]
    if (code !== 0 || !serverUrl) {
      this._reportParseError(`解析异常: code->${code} message->${message}`, data, recordId, clientPath)
      return null
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
    const fullMsg = `【上传服务】 == ${msg}`
    uni.$logger.local.error(fullMsg)
    this.reportError(fullMsg, data, recordId, filePath)
  }

  _changeFilePathToServer(record, fileInfo) {
    const _record = deepClone(record)
    uni.$logger.local.info(`【上传服务】 == 开始更新文件路径, recordId: ${_record.id}`)

    if (fileInfo.status === FileStatus.NoFile) {
      _record.status = FileStatus.NoFile
      _record.receptionEndTime = _record.receptionEndTime || record.receptionStartTime
      _record.recordUrlList = []
      uni.$logger.local.info(`【上传服务】 == 记录被标记为无文件状态`)
      return _record
    }

    _record.recordUrlList = this.urlListFilter(_record.recordUrlList)
    const targetFile = _record.recordUrlList.find(item => this._isTargetFile(item, fileInfo))

    if (targetFile) {
      this._updateFileStatus(targetFile, fileInfo)
    } else {
      uni.$logger.local.warn(`【上传服务】 == 未找到匹配的文件记录: ${JSON.stringify(fileInfo)}`)
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
    uni.$logger.local.info(`【上传服务】 == 文件状态已更新: ${fileInfo.fileName} -> ${fileInfo.status}`)
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
      uni.$logger.error(`【上传服务】 == 报告错误时发生异常: ${error.message}`)
    }
  }

  async enQueue() {
    try {
      const _snapshot = await this.getRecordsSnapshotFlatten()
      this.snapshot = new Queue(_snapshot)
      uni.$logger.local.warn(`【上传服务】 == 创建快照成功! ${JSON.stringify(this.snapshot.items)}  快照数:  ${this.snapshot.size} `)
    } catch (error) {
      this.reportError(`【上传服务】 == 获取快照失败 error:${error.message}`, error.message)
      if (!this.snapshot) {
        this.snapshot = new Queue([])
      }
    }
  }

  async getRecordsSnapshotFlatten() {
    await uni.$dbReady // 双重保险
    let _records = await uni.$dbRecord.getCompletedRecords()
    return await this.flattenData(_records || [])
  }

  async uploadRecord(record) {
    // 如果文件状态是没有文件或者不存在，则直接保存记录
    uni.$logger.local.info(`【上传服务】 == 开始上传文件!! record: ${JSON.stringify(record)}`)
    if (record.status === FileStatus.NoFile || record.status === FileStatus.NotExist) {
      uni.$logger.local.info(`【上传服务】 == 记录中有未上传文件,或文件不存在, 直接保存记录!!`)
      await this.save(record)
    } else {
      const { lsaccessKeySecret, securityToken, lsaccessKeyId } = await getOssToken()
      this._safeEvalUpload(lsaccessKeyId, lsaccessKeySecret, securityToken, record.fileName, record.filePath, record.recordId)
    }
  }

  _safeEvalUpload(lsaccessKeyId, lsaccessKeySecret, securityToken, fileName, filePath, recordId, options = {}) {
    if (!this.wv) {
      throw new Error('【上传服务】 == WebView 未就绪，无法执行上传脚本')
    }
    const args = [lsaccessKeyId, lsaccessKeySecret, securityToken, fileName, filePath, recordId].map(v => JSON.stringify(String(v || '')))
    // 处理 options 对象，确保它是 JSON 字符串
    const optionsStr = JSON.stringify(options || {})
    args.push(optionsStr)
    const script = `msgFromUniapp(${args.join(',')})`
    this.wv.evalJS(script)
  }

  _removeFileOnClient(filePathOnClient) {
    return new Promise((resolve, reject) => {
      if (!filePathOnClient) {
        uni.$logger.local.info(`【上传服务】 == 要删除的文件为空`)
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
    uni.$logger.local.info(`【上传服务】 == 开始保存或更新接待记录!!`)
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
    uni.$logger.local.info(`【上传服务】 == 本条接待所有文件已经上传和处理完毕!!`)
    // uni.$logger.local.info(`【上传服务】 == 已上传的文件: ${JSON.stringify(serverPaths)}`)
    // 2. 准备提交参数
    const params = { ...record, recordUrlList: serverPaths }
    if (!params.receptionEndTime) {
      params.receptionEndTime = await this._requestReceptionEndTime(serverPaths, params.receptionStartTime)
    }
    // 3. 提交到服务器
    uni.$logger.local.info(`【上传服务】 == 开始向服务器保存接待记录!!参数: ${JSON.stringify(params)}`)
    const res = await uni.$api.commonApi.saveRecCustomer(params)
    uni.$logger.local.warn(`【上传服务】 == 服务器返回结果: ${JSON.stringify(res)}`)
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
    uni.$logger.local.info(`【上传服务】 == 记录中有未上传文件,开始更新记录!!`)
    await uni.$dbRecord.updateRecord({ recordUrlList: record.recordUrlList }, { id: record.id })
  }

  async _removeRecordById(recordId) {
    try {
      await uni.$dbRecord.removeRecord(recordId)
      uni.$logger.local.info(`【上传服务】 == 删除接待记录成功: recordId ->${recordId}`)
    } catch (error) {
      this.reportError(`【上传服务】 == 删除接待记录异常: error ->${error.message}`, { message: error.message, recordId })
    }
  }

  async _removeRecordFiles(fileArr) {
    try {
      while (fileArr.length > 0) {
        const file = fileArr.shift()
        await this._removeFileOnClient(file)
      }
      uni.$logger.local.info(`【上传服务】 == 删除接待文件完成!`)
    } catch (error) {
      this.reportError(`【上传服务】 == 删除接待文件异常: error ->${error.message}`, { message: error.message, fileArr })
    }
  }

  /**
   * 将任务添加到黑名单
   * @param {string} key - 任务 Key (recordId_fileName 或 recordId)
   * @param {string} reason - 原因
   */
  _addToBlackList(key, reason = 'unknown') {
    if (!key) return
    if (!this._blackList.has(key)) {
      this._blackList.add(key)
      uni.$logger.local.warn(`【上传服务】 == 加入黑名单 [${key}]: ${reason}`)
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
        // 1. 记录级别的黑名单检查 (针对空文件等整条记录的问题)
        if (this._isInBlackList(cur.id)) {
          continue
        }
        const recordUrlList = this.urlListFilter(cur.recordUrlList)
        if (recordUrlList.length == 0) {
          result.push({ status: FileStatus.NoFile, recordId: cur.id })
          // 仅在第一次遇到时上报错误
          // 注意：不要加入黑名单，因为 NoFile 状态也是需要提交到服务器的（作为无录音记录）
          // 如果加入黑名单，下一次轮询就会跳过它，导致永远无法触发 _handleCompletedRecord
          this.reportError('【上传服务】 == 记录中不存在接待语音文件', { record: cur }, cur.id)
          // this._addToBlackList(cur.id, 'No audio files found')
          continue
        }
        for (const file of recordUrlList) {
          try {
            if (file.status === FileStatus.Uploaded || file.status === FileStatus.Completed) continue
            const aFullPath = file.file.split('/')
            const fileName = aFullPath.pop()
            const filePath = aFullPath.join('/') + '/'

            // 2. 文件任务级别的黑名单检查
            // const taskKey = this._getTaskKey(cur.id, fileName)
            // if (this._isInBlackList(taskKey)) {
            //   continue
            // }

            const file2Up = { ...file, recordId: cur.id, fileName, filePath }
            const fileExists = await this.checkFileExists(file.file)
            if (!fileExists) {
              this.reportError('【上传服务】 == 记录中有语音文件地址,但是文件不存在', { record: cur, file }, cur.id, file.file)
              file2Up.status = FileStatus.NotExist
              // 文件不存在，加入黑名单
              // this._addToBlackList(taskKey, 'File not exist on disk')
            }
            result.push(file2Up)
          } catch (error) {
            this.reportError(`【上传服务】 == 解析处理文件异常 error: ${error.message}`, { record: cur, file })
            // 解析异常，尝试加入黑名单避免死循环
            // const errorKey = this._getTaskKey(cur.id, file?.file)
            this._addToBlackList(cur.id, `Parse error: ${error.message}`)
            continue
          }
        }
      }
      return result
    } catch (error) {
      uni.$logger.local.error(`【上传服务】 == 处理文件列表异常: ${error.message}`)
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
        if (this._isInBlackList(this._currentKey)) {
          uni.$logger.local.warn(`【上传服务】 == 任务在黑名单中，跳过: ${taskKey}`)
          this.endTask()
          return
        }
        await this.uploadRecord(record)
      } catch (error) {
        const message = `上传文件时发生异常(uploadRecord): ${error.message}`
        this._addToBlackList(record.recordId, message)
        this.reportError(message, error.message)
        this.endTask()
      }
    })
  }

  _startWatchdog() {
    const TIMEOUT_THRESHOLD = 10 * 60 * 1000
    return setTimeout(() => {
      if (this.updateResolve) {
        uni.$logger.local.error('【上传服务】 == 看门狗检测到任务卡死超过10分钟，强制结束当前任务！')
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
    uni.$logger.local.info(`【上传服务】 == 停止文件上传轮询并清除队列`)
  }

  setInterval(interval, isForce = false) {
    // 保留接口，暂不实现动态调整
  }

  async startPolling(isForce = false) {
    // 确保数据库已初始化
    await uni.$dbReady

    // 每次启动新一轮轮询时，清空黑名单，允许重试之前的失败任务
    this._blackList.clear()

    if (this._pumpRunning || this.updateResolve) {
      if (!isForce) {
        uni.$logger.local.info(`【上传服务】 == 非强制模式下,不强制重启轮询`)
        return
      } else {
        uni.$logger.local.info(`【上传服务】 == 强制模式下,立即完成promise,强制重启轮询`)
        this.canclePromises()
      }
    }
    // 防止重复启动的定时器
    if (this._pumpTimer) {
      clearTimeout(this._pumpTimer)
      this._pumpTimer = null
    }
    this._pumpTimer = setTimeout(() => {
      this._schedulerPump()
    }, 0)
    uni.$logger.local.info(`【上传服务】 =========开启上传服务========`)
  }

  canclePromises() {
    this.endTask()
  }

  /**
   * 尝试恢复 Webview 实例
   * @returns {Promise<boolean>} 是否恢复成功
   */
  async _tryRecoverWebview() {
    // 尝试自动恢复
    if (this._webviewRef && this._webviewRef.component) {
      const wv = await getWebviewInstance(this._webviewRef.component, this._webviewRef.context)
      if (this._setupWebview(wv)) {
        uni.$logger.local.info('【上传服务】 == WebView 自动恢复成功!')
        return true
      }
    }
    return false
  }

  async _schedulerPump() {
    if (this._pumpRunning) return
    this._pumpRunning = true
    try {
      const stopReason = await this._checkStopConditions()
      if (stopReason) {
        uni.$logger.local.info(`【上传服务】 == ${stopReason}, 暂停上传服务 ,等待唤醒`)
        return
      }
      const record = this.snapshot.dequeue()
      await this.beginTask(record)

      this._scheduleNext(0)
    } catch (error) {
      this.reportError(`【上传服务】 == 异常,error->${error.message}`)
      this._retryCount = (this._retryCount || 0) + 1
      const maxDelay = 15 * 60 * 1000
      const delay = Math.min(this.interval * Math.pow(2, this._retryCount - 1), maxDelay)

      uni.$logger.local.warn(`【上传服务】 == 发生异常，第 ${this._retryCount} 次重试，将在 ${delay}ms 后执行`)
      this.waitting(delay)
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

    if (!this.wv) {
      const isReady = await this._tryRecoverWebview()
      if (!isReady) {
        return 'Webview未就绪'
      }
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

export default UploadService.getInstance()
