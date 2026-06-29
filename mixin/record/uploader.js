import { getOssToken } from '@/utils/ossUploadFile/uploadFile.js'
import Queue from '@/utils/Queue.js'
import { Command } from '../../ws/constants'
import { isInteger, deepClone } from '@/utils/utils.js'
import { FileStatus } from '../../utils/common'
import { serializeIfObject } from '../../utils/utils'
import dayjs from 'dayjs'
const UPLOAD_INTERVAL = 0.5 * 60 * 1000
const TIME_OUT_TIME = 15 * 60 * 1000
export default {
  mounted() {
    this.init()
    this.on()
  },
  methods: {
    async init() {
      try {
        // 初始化 WebView
        this.wv = await this.initWebview()
        this.interval = UPLOAD_INTERVAL
        this._pumpTimer = null
        this._pumpRunning = false
        // 开始轮询
        this.startPolling()
      } catch (error) {
        this.reportError(`【上传管理Uploader】初始化失败 error:${error.message}`, error.message)
      }
    },
    /**
     * 订阅事件
     * 这个函数用于订阅事件
     * @returns {void} - 没有返回值
     */
    on() {
      // 订阅停止轮询事件
      uni.$on(Command.StopPolling, this.stopPolling)
      // 订阅开始轮询事件
      uni.$on(Command.StartPolling, this.startPolling)
      // 订阅设置轮询间隔事件
      uni.$on(Command.SetPollingInterval, this.setInterval)
      // 监听网络状态变化
      this._networkHandler = (res) => {
        if (res.isConnected) {
          uni.$logger.local.info(`【上传管理Uploader】 == 网络已恢复，唤醒上传任务`)
          this.startPolling()
        }
      }
      uni.onNetworkStatusChange(this._networkHandler)
    },
    /**
     * webview文件上传完成后执行的函数
     * @param {*} data
     */
    handlerMessage(data) {
      uni.$logger.local.info(`【上传管理Uploader】 == 文件上传回调!`)
      this.save(data)
    },
    /**
     * 生成任务唯一标识 Key
     */
    _getTaskKey(recordId, fileName) {
      return `${recordId || ''}_${fileName || ''}`
    },
    /**
     * 保存文件信息并更新记录
     * 这个函数用于保存文件信息并更新记录
     * @param {Object} data - 包含文件信息的对象
     * @returns {Promise<void>} - 一个 Promise，当文件信息保存并记录更新完成时解析，没有返回值
     * @throws {Error} 如果在保存或更新过程中出现错误，将抛出错误
     */
    async save(data) {
      try {
        const fileInfo = this.parseFileInfo(data)
        if (!fileInfo?.recordId) {
          // 仅记录警告，不抛出异常中断流程，由后续逻辑处理或忽略
          uni.$logger.local.warn(`【上传管理Uploader】 == 上传文件信息解析异常: recordId缺失, 本次任务结束`)
          // 结束当前任务，让流程继续
          this.endTask() 
          return
        }

        // 优化日志
        uni.$logger.local.info(`【上传管理Uploader】 == 解析结果: recordId=${fileInfo.recordId}, status=${fileInfo.status}`)
        
        // 竞态保护：判断回调是否属于当前任务
        const callbackKey = this._getTaskKey(fileInfo.recordId, fileInfo.fileName)
        const isCurrentTask = this._currentKey && callbackKey === this._currentKey
        
        if (!isCurrentTask) {
          uni.$logger.local.warn(`【上传管理Uploader】 == 收到非当前任务回调: ${callbackKey} (当前: ${this._currentKey})，仅更新状态`)
        }

        const record = await uni.$dbManager.getRecordById(fileInfo.recordId)
        if (!record) {
           throw new Error(`未找到记录: ${fileInfo.recordId}`)
        }

        const modifiedRecord = this._changeFilePathToServer(record, fileInfo)
        await this._saveOrUpdate(modifiedRecord)
        
        // 只有当前任务匹配时，才触发任务结束逻辑
        if (isCurrentTask) {
          uni.$logger.local.info('【上传管理Uploader】 == 本次任务完成,开启下一次上传任务!')
          this.endTask()
        }
      } catch (error) {
        this.reportError(`【上传管理Uploader】 == 保存记录(save)异常 error: ${error.message}`, error.message, data?.recordId, data?.filePath + data?.fileName)
        this.endTask() // 发生异常时也尝试结束任务，防止阻塞
      }
    },
    /**
     * 解析文件信息
     * 这个函数用于解析文件信息
     * @param {Object} data - 包含文件信息的对象
     * @returns {Object} - 解析后的文件信息对象
     */
    parseFileInfo(data) {
      try {
        const input = serializeIfObject(data)
        uni.$logger.local.info(`【上传管理Uploader】 == 开始文件信息解析-> ${input}`)
        if (!data) return null
        const { status } = data
        // 1. 处理无文件或文件不存在的特殊状态
        if ([FileStatus.NoFile, FileStatus.NotExist].includes(status)) {
          return this._parseNoFileStatus(data)
        }
        // 2. 处理正常上传回调
        return this._parseUploadedFile(data)
      } catch (error) {
        uni.$logger.local.error(`【上传管理Uploader】 == 解析文件信息异常: ${error.message}`)
        return null
      }
    },
    _parseNoFileStatus(data) {
      const { recordId, fileName, filePath, status } = data
      const clientPath = (filePath || '') + (fileName || '')
      if (!recordId) {
        this.reportError('【上传管理Uploader】 == 缺少记录ID', data)
        return null
      }
      return {
        recordId: String(recordId),
        clientPath,
        serverPath: null,
        fileName: String(fileName || ''),
        status: status == FileStatus.NotExist ? FileStatus.Completed : FileStatus.NoFile
      }
    },
    _parseUploadedFile(data) {
      const payload = data?.detail?.data?.[0]
      const { recordId, fileName, filePath } = payload || {}
      const clientPath = (filePath || '') + (fileName || '')
      // 1. 校验 payload 结构
      if (!payload || typeof payload !== 'object') {
        this._reportParseError('回调数据格式错误', data, data?.recordId, clientPath)
        return null
      }
      // 2. 校验 recordId
      if (!recordId) {
        this._reportParseError('文件上传回调,缺少recordId', data, undefined, clientPath)
        return null
      }
      // 3. 校验业务状态码和 OSS URL
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
    },
    _reportParseError(msg, data, recordId, filePath) {
      const fullMsg = `【上传管理Uploader】 == ${msg}`
      uni.$logger.local.error(fullMsg)
      this.reportError(fullMsg, data, recordId, filePath)
    },
    /**
     * 将文件路径更改为服务器路径
     * 这个函数用于将接待记录中的文件路径更新为服务器路径
     * @param {Object} record - 接待记录对象
     * @param {Object} fileInfo - 文件信息对象
     * @returns {Object} - 更新后的接待记录对象
     */
    _changeFilePathToServer(record, fileInfo) {
      try {
        const _record = deepClone(record)
        uni.$logger.local.info(`【上传管理Uploader】 == 开始更新文件路径, recordId: ${_record.id}`)

        // 场景1: 无文件状态 (NoFile)
        if (fileInfo.status === FileStatus.NoFile) {
          _record.status = FileStatus.NoFile
          _record.receptionEndTime = _record.receptionEndTime || record.receptionStartTime
          _record.recordUrlList = []
          uni.$logger.local.info(`【上传管理Uploader】 == 记录被标记为无文件状态`)
          return _record
        }

        // 场景2: 正常更新文件状态
        _record.recordUrlList = this.urlListFilter(_record.recordUrlList)
        const targetFile = _record.recordUrlList.find(item => this._isTargetFile(item, fileInfo))

        if (targetFile) {
          this._updateFileStatus(targetFile, fileInfo)
        } else {
          uni.$logger.local.warn(`【上传管理Uploader】 == 未找到匹配的文件记录: ${JSON.stringify(fileInfo)}`)
        }
        return _record
      } catch (error) {
        uni.$logger.error(`【上传管理Uploader】 == 修改文件路径失败: ${error.message}`)
        throw new Error('【上传管理Uploader】 == 修改文件路径失败!!')
      }
    },
    _isTargetFile(item, fileInfo) {
      // 匹配逻辑: 优先匹配绝对路径，其次匹配文件名后缀
      if (!this.isLegalFile(fileInfo.fileName)) return !this.isLegalFile(item.file)
      return item.file === fileInfo.clientPath || item.file.endsWith(fileInfo.fileName)
    },
    _updateFileStatus(targetFile, fileInfo) {
      targetFile.status = fileInfo.status
      // 仅当上传成功时，才回填服务器路径
      if (fileInfo.status === FileStatus.Uploaded) {
        targetFile.file = fileInfo.serverPath
        targetFile.filePathOnClient = fileInfo.clientPath
      }
      uni.$logger.local.info(`【上传管理Uploader】 == 文件状态已更新: ${fileInfo.fileName} -> ${fileInfo.status}`)
    },
    /**
     * 报告错误
     * 这个函数用于报告上传文件失败的错误
     * @param {string} recordId - 记录ID
     * @param {string} filePath - 文件路径
     * @param {Object} res - 响应对象
     * @param {string} message - 错误消息
     * @returns {void} - 没有返回值
     */
    async reportError(message, res, recordId, filePath) {
      try {
        const record = recordId ? await uni.$dbManager.getRecordById(recordId) : {}
        const userInfo = this.userInfo //uni.$storage.get('userInfo')
        const { customerName, phoneNumber, carModel, salesName } = record || {}
        const { name } = userInfo || {}
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        uni.$logger.error({
          msg: `${now}-${message},员工: ${name}, 客户: ${customerName}`,
          extra: {
            '手机号: ': phoneNumber,
            '员工: ': name,
            '姓名: ': customerName,
            '销售: ': salesName,
            '车型: ': carModel,
            '原因: ': serializeIfObject(res),
            '文件路径: ': filePath
          }
        })
      } catch (error) {
        uni.$logger.error(`【上传管理Uploader】 == 报告错误时发生异常: ${error.message}`)
      }
    },
    /**
     * 初始化 WebView 的异步函数
     * 这个函数返回一个 Promise，当初始化 WebView 完成时，它将解析为 WebView 对象。
     * 在页面初始化调用时，这个函数会延迟 1 秒，以确保 WebView 对象已经创建。
     *
     * @async
     * @returns {Promise<any>} 当初始化完成时，Promise 将解析为 WebView 对象。
     */
    async initWebview() {
      try {
        uni.$logger.local.warn('【上传管理Uploader】 == 初始化 WebView 开始...')
        const currentWebview = this.$parent?.$scope?.$getAppWebview()
        const wv = currentWebview?.children()?.[0]
        if (wv) {
          wv.setStyle({ top: '100%', height: 300 })
          uni.$logger.local.warn('【上传管理Uploader】 == 初始化 WebView 成功!')
          return wv
        }
        uni.$logger.local.warn('【上传管理Uploader】 == 初始化 WebView 失败!')
        return null
      } catch (error) {
        this.reportError(`初始化Webview失败 error:${error.message}`, error.message)
        return null
      }
    },
    /**
     * 入列操作
     * 这个函数异步执行，目的是获取记录的快照并将其扁平化，以形成一个队列
     * 通过调用 getRecordsSnapshotFlatten 获取快照数据
     * 当所有数据准备好后，创建一个新的 Queue 实例，并将扁平化后的数据作为参数传入
     * 这样，队列就被创建并且最初是满的，其中包含了已经获取到的记录快照
     *
     * @async
     * @returns {Promise<void>} 一个 Promise，当初始化队列完成时解析，没有返回值
     * @throws {Error} 如果获取快照失败或扁平化数据失败，将抛出错误
     */
    async enQueue() {
      try {
        const _snapshot = await this.getRecordsSnapshotFlatten()
        this.snapshot = new Queue(_snapshot)
        uni.$logger.local.warn(`【上传管理Uploader】 == 创建快照成功! ${JSON.stringify(this.snapshot.items)}  快照数:  ${this.snapshot.size} `)
      } catch (error) {
        this.reportError(`【上传管理Uploader】 == 获取快照失败 error:${error.message}`, error.message)
        if (!this.snapshot) {
          this.snapshot = new Queue([])
        }
      }
    },
    /**
     * 获取记录快照并展平数据
     * 此函数异步获取记录快照，然后使用flattenData函数将这些记录转换为一个文件对象列表
     * 每个文件对象都包含一个额外的recordId属性，用于指示它所属的记录
     *
     * @async
     * @returns {Promise<Array>} 一个Promise，当获取并处理完记录时，返回一个文件对象列表
     * @throws {Error} 如果在获取记录快照或展平数据的过程中出现错误，将抛出错误
     */
    async getRecordsSnapshotFlatten() {
      const _records = await uni.$dbManager.getRecords()
      const _snapshot = await this.flattenData(_records || [])
      return _snapshot
    },
    /**
     * 上传记录
     * 这个函数用于上传文件
     * @param {Object} record - 要上传的文件记录
     * @returns {Promise<void>} - 一个 Promise，当文件上传完成时解析，没有返回值
     * @throws {Error} 如果文件上传失败，将抛出错误
     */
    async uploadRecord(record) {
      // 如果文件状态是没有文件或者不存在，则直接保存记录
      uni.$logger.local.info(`【上传管理Uploader】 == 开始上传文件!! record: ${JSON.stringify(record)}`)
      if (record.status === FileStatus.NoFile || record.status === FileStatus.NotExist) {
        uni.$logger.local.info(`【上传管理Uploader】 == 记录中有未上传文件,或文件不存在, 直接保存记录!!`)
        this.save(record)
      } else {
        try {
          const { lsaccessKeySecret, securityToken, lsaccessKeyId } = await getOssToken()
          this._safeEvalUpload(lsaccessKeyId, lsaccessKeySecret, securityToken, record.fileName, record.filePath, record.recordId)
        } catch (error) {
          this.reportError(`上传文件时发生异常(uploadRecord): ${error.message}`, error.message)
          this.endTask()
          throw error
        }
      }
    },
    _safeEvalUpload(lsaccessKeyId, lsaccessKeySecret, securityToken, fileName, filePath, recordId) {
      if (!this.wv) {
        throw new Error('WebView is not initialized')
      }
      const args = [lsaccessKeyId, lsaccessKeySecret, securityToken, fileName, filePath, recordId].map(v => JSON.stringify(String(v || '')))
      const script = `msgFromUniapp(${args.join(',')})`
      this.wv.evalJS(script)
    },
    /**
     * 从客户端删除文件
     * 这个函数用于从客户端的本地存储中删除指定的文件
     * @param {string} filePathOnClient - 要删除的文件在客户端的路径
     * @returns {Promise<boolean>} - 一个 Promise，当文件删除成功时解析为 true，否则抛出错误
     */
    _removeFileOnClient(filePathOnClient) {
      return new Promise((resolve, reject) => {
        if (!filePathOnClient) {
          uni.$logger.local.info(`【上传管理Uploader】 == 要删除的文件为空`)
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
    },
    /**
     * 异步保存或更新接待记录
     * 这个函数用于保存或更新接待记录
     * @param {Object} data - 要保存或更新的接待记录数据
     * @throws {Error} 如果保存或更新接待记录失败，将抛出错误
     */
    async _saveOrUpdate(data) {
      uni.$logger.local.info(`【上传管理Uploader】 == 开始保存或更新接待记录!!`)
      try {
        const { status, ...record } = data
        const fileList = Array.isArray(record.recordUrlList) ? record.recordUrlList : []
        const isAllCompleted = status === FileStatus.NoFile || fileList.every(i => [FileStatus.Uploaded, FileStatus.Completed].includes(i.status))
        if (isAllCompleted) {
          await this._handleCompletedRecord(record, fileList)
        } else {
          await this._handleIncompleteRecord(record)
        }
      } catch (error) {
        this.reportError(`上传接待记录异常,error:${error.message}`, error.message, data?.id)
      }
    },
    /**
     * 处理已完成（所有文件上传完毕）的记录
     */
    async _handleCompletedRecord(record, fileList) {
      // 1. 整理文件路径
      const uploadedFiles = fileList.filter(file => file.status == FileStatus.Uploaded)
      const serverPaths = uploadedFiles.map(i => i.file)
      const localPaths = uploadedFiles.map(i => i.filePathOnClient)
      uni.$logger.local.info(`【上传管理Uploader】 == 本条接待所有文件已经上传和处理完毕!!`)
      // uni.$logger.local.info(`【上传管理Uploader】 == 已上传的文件: ${JSON.stringify(serverPaths)}`)
      // 2. 准备提交参数
      const params = { ...record, recordUrlList: serverPaths }
      if (!params.receptionEndTime) {
        params.receptionEndTime = await this._requestReceptionEndTime(serverPaths, params.receptionStartTime)
      }
      // 3. 提交到服务器
      uni.$logger.local.info(`【上传管理Uploader】 == 开始向服务器保存接待记录!!参数: ${JSON.stringify(params)}`)
      const res = await uni.$api.commonApi.saveRecCustomer(params)
      uni.$logger.local.warn(`【上传管理Uploader】 == 服务器返回结果: ${JSON.stringify(res)}`)
      // 4. 清理本地数据
      if (res) {
        uni.$logger.local.info(`【上传管理Uploader】 == 开始删除客户端的文件!!`)
        await this._removeRecordFiles(localPaths)
        await this._removeRecordById(record.id)
      }
    },
    /**
     * 处理未完成的记录（仅更新本地状态）
     */
    async _handleIncompleteRecord(record) {
      uni.$logger.local.info(`【上传管理Uploader】 == 记录中有未上传文件,开始更新记录!!`)
      await uni.$dbManager.updateRecord({ recordUrlList: record.recordUrlList }, { id: record.id })
    },
    /**
     * 向服务器请求接待结束时间
     * 这个函数用于向服务器请求接待结束时间
     * @param {Array} recordUrlList - 包含文件URL的数组
     * @param {string} receptionStartTime - 接待开始时间
     * @returns {Promise<string>} - 一个 Promise，成功时解析为接待结束时间
     */
    async _requestReceptionEndTime(recordUrlList, receptionStartTime) {
      if (!recordUrlList || recordUrlList.length === 0) return receptionStartTime
      try {
        // 记录日志，显示正在向服务器请求结束接待时间，包括文件URL列表和接待开始时间
        uni.$logger.local.info(`【上传管理Uploader】 == 向服务器获取结束接待时间: recordUrlList ->${serializeIfObject(recordUrlList)} receptionStartTime: -> ${receptionStartTime}`)
        // 调用 uni.$api.commonApi.searchRecordingEndTime 方法，向服务器发送请求，获取接待结束时间
        const endTime = await uni.$api.commonApi.searchRecordingEndTime({ recordUrlList, receptionStartTime: receptionStartTime.replace(/\//g, '-') })
        // 记录日志，显示服务器返回的接待结束时间
        uni.$logger.local.info(`【上传管理Uploader】 == 服务器返回结束接待时间: endTime ->${endTime}`)
        // 返回接待结束时间，将日期格式中的连字符替换为斜杠，以保持一致性
        return endTime.replace(/\-/g, '/')
      } catch (error) {
        // 如果请求失败，记录错误信息并抛出错误
        this.reportError(`【上传管理Uploader】 == 向服务器获取结束接待时间异常: error ->${error.message}`, error.message)
      }
    },
    /**
     * 删除指定id的接待记录
     * @param {string} recordId - 要删除的接待记录的id
     * @throws {Error} 如果删除接待记录失败，将抛出错误
     */
    async _removeRecordById(recordId) {
      try {
        await uni.$dbManager.removeRecord(recordId)
        uni.$logger.local.info(`【上传管理Uploader】 == 删除接待记录成功: recordId ->${recordId}`)
      } catch (error) {
        this.reportError(`【上传管理Uploader】 == 删除接待记录异常: error ->${error.message}`, { message: error.message, recordId })
      }
    },
    /**
     * 异步删除接待记录中的文件
     * @param {Array} fileArr - 要删除的文件数组
     * @throws {Error} 如果删除文件失败，将抛出错误
     */
    async _removeRecordFiles(fileArr) {
      try {
        while (fileArr.length > 0) {
          const file = fileArr.shift()
          await this._removeFileOnClient(file)
        }
        uni.$logger.local.info(`【上传管理Uploader】 == 删除接待文件完成!`)
      } catch (error) {
        this.reportError(`【上传管理Uploader】 == 删除接待文件异常: error ->${error.message}`, { message: error.message, fileArr })
      }
    },
    /**
     * 扁平化数据
     * 这个函数用于处理一个记录数组，检查每个记录的文件列表，并将文件信息扁平化
     * 如果文件不存在或状态为已上传或已完成，则跳过该文件
     * 如果文件存在，则将其状态设置为待上传，并将其添加到结果数组中
     * 如果在处理文件过程中发生错误，则记录错误信息并继续处理下一个文件
     *
     * @param {Array} records - 要处理的记录数组
     * @returns {Promise<Array>} - 返回一个 Promise，当所有记录处理完成时解析为包含所有处理后记录的数组
     */
    async flattenData(records) {
      const result = []
      try {
        for (const cur of records) {
          const recordUrlList = this.urlListFilter(cur.recordUrlList)
          if (recordUrlList.length == 0) {
            // 如果记录中没有文件，则将其状态设置为 NoFile，并添加到结果数组中
            result.push({ status: FileStatus.NoFile, recordId: cur.id })
            this.reportError('【上传管理Uploader】 == 记录中不存在接待语音文件', { record: cur }, cur.id) //记录中不存在接待语音文件
            continue
          }
          // 处理每个记录的文件列表
          for (const file of recordUrlList) {
            try {
              // 如果文件状态为已上传或已完成，则跳过该文件
              if (file.status === FileStatus.Uploaded || file.status === FileStatus.Completed) continue
              const aFullPath = file.file.split('/')
              const fileName = aFullPath.pop()
              const filePath = aFullPath.join('/') + '/'
              const file2Up = { ...file, recordId: cur.id, fileName, filePath }
              // 检查文件是否存在
              const fileExists = await this.checkFileExists(file.file)
              if (!fileExists) {
                // 如果文件不存在，则将其状态设置为 NotExist，并记录错误信息
                this.reportError('【上传管理Uploader】 == 记录中有语音文件地址,但是文件不存在', { record: cur, file }, cur.id, file.file) //记录中语音文件不存在
                file2Up.status = FileStatus.NotExist
              }
              result.push(file2Up)
            } catch (error) {
              // 如果在处理文件过程中发生错误，则记录错误信息并继续处理下一个文件
              this.reportError(`【上传管理Uploader】 == 解析处理文件异常 error: ${error.message}`, { record: cur, file })
              continue
            }
          }
        }
        return result
      } catch (error) {
        // throw new Error(`【上传管理Uploader】 == 处理文件列表异常: ${error.message}`)
        uni.$logger.local.error(`【上传管理Uploader】 == 处理文件列表异常: ${error.message}`)
        return result
      }
    },
    urlListFilter(urlList) {
      if (!Array.isArray(urlList)) {
        urlList = []
      }
      const __list = urlList.filter(item => item?.file)
      return __list
    },
    /**
     * 检查文件是否存在
     * 这个函数用于检查指定文件路径是否存在
     * 如果文件路径为空，则返回 false
     * 如果文件路径不为空，则使用 uni.getFileInfo 方法获取文件信息
     * 如果获取成功，则返回 true
     * 如果获取失败，则返回 false
     */
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
    },
    isLegalFile(file) {
      return file && String(file).toLowerCase().endsWith('.mp3')
    },
    waitting(ms = this.interval) {
      uni.$logger.local.info(ms + 'ms后开始下一轮尝试!')
      this._scheduleNext(ms)
    },
    /**
     * 开始处理任务
     * 这个函数用于将一个任务加入到操作队列中，并在任务完成后进行轮询
     * @param {Object} record - 要处理的记录对象
     * @returns {void} - 此函数不返回任何值
     */
    async beginTask(record) {
      // 直接执行任务
      // const label = 'TaskKey: '+this._getTaskKey(record?.recordId, record?.fileName)
      // this.operationQueue.enqueue(() => this.task(record), label).finally(() => this._scheduleNext(0))
      await this.task(record)
    },
    /**
     * 处理单个记录的任务
     * 这个函数用于处理单个记录的上传任务
     * @param {Object} record - 要处理的记录对象
     * @returns {Promise} - 当任务完成时解析的 Promise
     */
    task(record) {
      return new Promise(resolve => {
        // 启动看门狗
        const timeoutId = this._startWatchdog()

        this.updateResolve = () => {
          clearTimeout(timeoutId) // 清除定时器
          resolve()
        }
        
        this._taskStartTime = Date.now() // 记录任务开始时间
        this._currentKey = this._getTaskKey(record.recordId, record.fileName)
        this.uploadRecord(record).catch(err => {
          uni.$logger.local.error(`【上传管理Uploader】 == 任务执行异常: ${err.message}`)
          // 确保异常也能结束任务，释放锁
          this.endTask()
        })
      })
    },
    /**
     * 启动任务看门狗
     * 防止任务执行时间过长导致死锁
     * @returns {number} 定时器ID
     */
    _startWatchdog() {
      const TIMEOUT_THRESHOLD = 5 * 60 * 1000 // 5分钟
      return setTimeout(() => {
        if (this.updateResolve) {
          uni.$logger.local.error('【上传管理Uploader】 == 看门狗检测到任务卡死超过5分钟，强制结束当前任务！')
          this.endTask()
        }
      }, TIMEOUT_THRESHOLD)
    },
    /**
     * 结束任务
     * 这个函数用于结束当前的任务
     * 调用 resolve 方法来解决 Promise，标记任务完成
     * @returns {void} - 此函数不返回任何值
     */
    endTask() {
      this.updateResolve && this.updateResolve()
      this.updateResolve = null
      this._taskStartTime = null
    },
    /**
     * 停止文件上传轮询并清除队列
     * 这个方法会停止正在进行的轮询，并清除所有待处理的操作和快照数据
     * 释放所有资源，确保没有任何后台任务在运行
     */
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
      uni.$logger.local.info(`【上传管理Uploader】 == 停止文件上传轮询并清除队列`)
    },
    /**
     * 设置轮询的时间间隔
     * 这个方法用于设置文件上传轮询的时间间隔
     * 如果 interval 不是整数，则会记录错误信息并返回
     * 如果 isForce 为 true，则会强制重启轮询
     * @param {number} interval - 轮询的时间间隔（秒）
     * @param {boolean} [isForce=false] - 是否强制重启轮询
     */
    setInterval(interval, isForce = false) {
      // if (!isInteger(interval)) {
      //   const error = `【上传管理Uploader】 == 参数错误!interval 必需为数字!  interval -> ${interval} `
      //   uni.$logger.local.error(error)
      //   return
      // }
      // this.interval = interval
      // if (isForce) {
      //   this.startPolling(isForce)
      // }
      // uni.$logger.local.info(`【上传管理Uploader】 == 轮询间隔已设置为 ${interval} 秒`)
    },
    /**
     * 启动文件上传轮询
     * 这个方法用于启动文件上传轮询
     * 如果 timer 已经存在且 isForce 为 false，则不会强制重启轮询
     * 如果 isForce 为 true，则会强制重启轮询
     * @param {boolean} [isForce=false] - 是否强制重启轮询
     */
    async startPolling(isForce = false) {
      if (this._pumpRunning || this.updateResolve) {
        if (!isForce) {
          uni.$logger.local.info(`【上传管理Uploader】 == 非强制模式下,不强制重启轮询`)
          return
        } else {
          uni.$logger.local.info(`【上传管理Uploader】 == 强制模式下,立即完成promise,强制重启轮询`)
          this.canclePromises()
        }
      }
      setTimeout(async () => {
        // 清除之前的定时器，防止双重调度
        if (this._pumpTimer) {
          clearTimeout(this._pumpTimer)
          this._pumpTimer = null
        }
        await this.enQueue()
        this._scheduleNext(0)
      }, 0)
      uni.$logger.local.info(`【上传管理Uploader】 =========开始轮询========`)
    },
    /**
     * 清除 timer
     */
    canclePromises() {
      // this.timeoutManager?.cancelAllTasks() // 已移除
      this.endTask()
    },
    async _schedulerPump() {
      if (this._pumpRunning) return
      this._pumpRunning = true
      try {
        // 1. 检查 WebView 是否就绪 (懒加载重试)
        if (!this.wv) {
          uni.$logger.local.warn('【上传管理Uploader】 == WebView未就绪，尝试重新初始化...')
          this.wv = await this.initWebview()
          if (!this.wv) {
            uni.$logger.local.warn('【上传管理Uploader】 == WebView 初始化失败，稍后重试')
            this.waitting() // 不再 await，直接调度下次重试
            return
          }
        }
        
        // 2. 检查是否满足停止条件
        const stopReason = await this._checkStopConditions()
        if (stopReason) {
          uni.$logger.local.info(`【上传管理Uploader】 == ${stopReason}, 停止轮询`)
          return
        }

        // 3. 执行任务
        const record = this.snapshot.dequeue()
        await this.beginTask(record) // 等待任务执行完成
        
        // 成功执行后，重置重试计数器
        this._retryCount = 0
        
        // 4. 任务完成后，立即调度下一个（不需要等待 interval）
        this._scheduleNext(0)
        
      } catch (error) {
        this.reportError(`【上传管理Uploader】 == 异常,error->${error.message}`)
        
        // 指数退避策略
        this._retryCount = (this._retryCount || 0) + 1
        const maxDelay = 15 * 60 * 1000 // 最大延迟 15分钟
        const delay = Math.min(this.interval * Math.pow(2, this._retryCount - 1), maxDelay)
        
        uni.$logger.local.warn(`【上传管理Uploader】 == 发生异常，第 ${this._retryCount} 次重试，将在 ${delay}ms 后执行`)
        this.waitting(delay) 
      } finally {
        this._pumpRunning = false
      }
    },
    /**
     * 检查是否满足停止轮询的条件
     * 如果满足，返回停止原因（字符串），否则返回 null
     */
    async _checkStopConditions() {
      // 1. 检查是否在后台
      if (this.$store.getters.isInBackgound) {
        return 'APP在后台运行,不进行文件上传'
      }
      // 2. 检查网络状态
      const isOnline = await uni.$isNetWork()
      if (!isOnline) {
        return '网络异常,等待网络恢复'
      }
      // 3. 检查当前是否已有任务在执行
      if (this.updateResolve) {
        return '任务正在执行中'
      }
      // 4. 检查队列是否为空
      if (!this.snapshot || this.snapshot.size === 0) {
        await this.enQueue()
      }
      // 再次检查队列
      if (!this.snapshot || this.snapshot.size === 0) {
        return '队列为空,等待新任务唤醒'
      }
      return null
    },
    _scheduleNext(ms = 0) {
      if(this.snapshot === null) return
      if (this._pumpTimer) {
        clearTimeout(this._pumpTimer)
        this._pumpTimer = null
      }
      this._pumpTimer = setTimeout(
        () => {
          // this._checkTaskTimeout() // 已在 task 内部实现
          this._schedulerPump()
        },
        Math.max(0, ms)
      )
    },
    /**
     * 看门狗：检查当前任务是否超时
     * 防止异常情况下任务永久卡死导致队列阻塞
     */
    _checkTaskTimeout() {
      // 已在 task 内部实现，保留此方法为空或直接移除
    },
    off() {
      // 取消监听停止轮询事件
      uni.$off(Command.StopPolling, this.stopPolling)
      // 取消监听开始轮询事件
      uni.$off(Command.StartPolling, this.startPolling)
      // 取消监听设置轮询间隔事件
      uni.$off(Command.SetPollingInterval, this.setInterval)
      // 取消网络监听
      if (this._networkHandler) {
        uni.offNetworkStatusChange(this._networkHandler)
        this._networkHandler = null
      }
    }
  },
  /**
   * 组件销毁前执行的生命周期函数
   * 这个函数会在组件销毁前被调用，用于执行一些清理工作
   * 包括停止文件上传轮询、清除 WebView 组件、取消事件监听以及记录日志
   */
  beforeDestroy() {
    // 停止文件上传轮询并清除队列
    this.stopPolling()
    this.wv = null
    this.off()
    // 记录组件销毁前的日志信息
    uni.$logger.local.info(`【上传管理Uploader】 == 组件销毁前执行的生命周期函数`)
  }
}