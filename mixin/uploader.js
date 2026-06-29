import { getOssToken } from '@/utils/ossUploadFile/uploadFile.js'
import { storageApi } from '@/utils/cache'
import Queue from '@/utils/Queue.js'
import OperationQueue from '@/utils/OperationQueue.js'
import { Command } from '../ws/constants'
import { isInteger, deepClone } from '@/utils/utils.js'
import { FileStatus } from '../utils/common'
import { serializeIfObject } from '../utils/utils'
import dayjs from 'dayjs'
import TimeoutManager from '@/utils/TimeoutManager.js'
export default {
  onLoad() {},
  data() {
    return {
      // WebView 实例
      wv: null,
      // 上传文件快照
      snapshot: null,
      // 轮询间隔（秒）
      interval: 60 * 5,
      operationQueue: null, // 添加操作队列
      updateResolve: null
    }
  },
  mounted() {
    this.mergeRecord()
    this.init()
    this.subscribe()
    // uni.$dbManager.updateRecord({"recordUrlList": [
    //     {
    //         "status": 4,
    //         "file": "file:///storage/emulated/0/Android/data/io.dcloud.HBuilder/apps/HBuilder/doc/uniapp_save/5727_17321755265103.mp3"
    //     },
    //     {
    //         "status": 5,
    //         "file": "http://glsk-oss.oss-cn-shenzhen.aliyuncs.com/quality/5727_17321755265894.mp3",
    //         "filePathOnClient": "file:///storage/emulated/0/Android/data/io.dcloud.HBuilder/apps/HBuilder/doc/uniapp_save/5727_17321755265894.mp3"
    //     }
    // ],salesName:'王欣伟'},{id:'14B558C5-284E-4567-878B-6B1511C8B790'}).then(res => {
    //   console.log(111,res)
    //   uni.$dbManager.getRecordById('14B558C5-284E-4567-878B-6B1511C8B790').then(res => {
    //     console.log(222,res)
    //   })
    // })
    // uni.$dbManager.removeRecord(null).then(res => {
    //   console.log(111,res)
    // uni.$dbManager.drop().then(res => {
    //       console.log(222,res)
    //     })
    // })
  },
  methods: {
    async init() {
      await this.checkDB()
      // 初始化 WebView
      this.wv = await this.initWebview()
      // 初始化操作队列
      this.operationQueue = new OperationQueue()
      this.timeoutManager = new TimeoutManager()
      // 开始轮询
      this.startPolling()
      // uni.$logger.local.error({ extra : { key: 'data', value: {'abc':123,'sss':456,'GDF':888}  }, msg:'test', tag : { key: 'tag', value: 'tagtest' } })
      // uni.$logger.local.getFiles('20240905','2024-09/05')
      // uni.$logger.local.removeOverDays(1)
    },
    /**
     * 订阅事件
     * 这个函数用于订阅事件
     * @returns {void} - 没有返回值
     */
    subscribe() {
      // 订阅停止轮询事件
      uni.$on(Command.StopPolling, this.stopPolling)
      // 订阅开始轮询事件
      uni.$on(Command.StartPolling, this.startPolling)
      // 订阅设置轮询间隔事件
      uni.$on(Command.SetPollingInterval, this.setInterval)
    },
    /**
     * webview文件上传完成后执行的函数
     * @param {*} data
     */
    handlerMessage(data) {
      this.save(data)
    },
    /**
     * 缓存中待上传记录与待提交记录，插入数据库记录中
     * @param {*} data
     */
    async mergeRecord() {
      const records = uni.$recordManager.getRecords() || []
      const tempRecords = storageApi.getRecords('preRecordList') || []
      for (let i = 0; i < records.length; i++) {
        await uni.$dbManager.addRecord(records[i])
        uni.$recordManager.removeRecord(records[i].id)
      }
      for (let i = 0; i < tempRecords.length; i++) {
        await uni.$dbTempRecord.addRecord(tempRecords[i])
      }
      storageApi.setRecords('preRecordList', [])
    },
    async checkDB() {
      try {
        const isSuccess = uni.$dbManager.init()
        if (!isSuccess) {
          this.toLogin()
          return
        }
      } catch (error) {
        uni.$logger.error(`初始化数据库失败:${error.message}`)
        this.toLogin()
      }
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
        if (!fileInfo || !fileInfo.recordId) {
          uni.$logger.local.error(`未解析出文件信息或者没有记录ID`)
          return
        }
        const record = await uni.$dbManager.getRecordById(fileInfo.recordId)
        const modifiedRecord = this._changeFilePathToServer(record, fileInfo)
        await this._saveOrUpdate(modifiedRecord)
      } catch (error) {
        this.reportError(`保存记录(save)异常 error: ${error.message}`, error.message, data?.recordId, data?.filePath + data?.fileName)
      } finally {
        uni.$logger.local.info('本次任务完成,开启下一次上传任务!')
        this.endTask()
      }
    },
    /**
     * 解析文件信息
     * 这个函数用于解析文件信息
     * @param {Object} data - 包含文件信息的对象
     * @returns {Object} - 解析后的文件信息对象
     */
    parseFileInfo(data) {
      // 如果是无文件状态，直接返回基础信息
      if ([FileStatus.NoFile, FileStatus.NotExist].includes(data.status)) {
        let { recordId, filePath, fileName, status } = data
        status = status == FileStatus.NotExist ? FileStatus.Completed : FileStatus.NoFile
        return { recordId, clientPath: filePath + fileName, serverPath: null, fileName, status }
      }
      // 获取上传结果，如果失败直接返回 null
      const { recordId, fileName, filePath, code, data: fileData } = data.detail.data[0]
      if (code !== 0) {
        this.reportError('解析上传文件信息异常', data, recordId, filePath + fileName)
        return null
      }
      // 返回成功上传的文件信息
      return { recordId, fileName, clientPath: filePath + fileName, serverPath: fileData.oss.res.requestUrls[0].split('?')[0], status: FileStatus.Uploaded }
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
        // record = Array.isArray(record) ? record[0] : record // sqlite 返回数组
        // 深度克隆记录对象，以避免修改原始数据
        const _record = deepClone(record)
        uni.$logger.local.info(`开始将接待记录的文件路径改成服务器路径!! record.recordUrlList-> ${JSON.stringify(_record.recordUrlList)}`)
        // 如果是无文件状态，直接返回基础信息
        if (fileInfo.status === FileStatus.NoFile) {
          _record.status = FileStatus.NoFile
          // 如果接待结束时间不存在，则设置为接待开始时间
          _record.receptionEndTime = _record.receptionEndTime || record.receptionStartTime
          uni.$logger.local.info(`当前记录没有接待语音文件,已将状态设置为无文件状态: ${JSON.stringify(_record)}`)
          return _record
        }
        // console.log(_record)
        // 正常文件上传和文件丢失的记录执行此逻辑
        _record.recordUrlList.forEach(item => {
          if (item.file === fileInfo.clientPath || item.file.endsWith(fileInfo.fileName)) {
            let info2Update = {
              status: fileInfo.status
            }
            if (info2Update.status === FileStatus.Uploaded) {
              // 正常文件上传的数据才更新服务器文件和本地文件路径 后面删除本地文件的时候 现过滤出正常上传的文件然后再获取到对应的文件删除
              Object.assign(info2Update, {
                file: fileInfo.serverPath,
                filePathOnClient: fileInfo.clientPath
              })
            }
            Object.assign(item, info2Update)
            uni.$logger.local.info(`修改文件路径完成!!`)
          }
        })
        uni.$logger.local.info(`替换完成!! record.recordUrlList-> ${JSON.stringify(_record.recordUrlList)}`)
        return _record
      } catch (error) {
        uni.$logger.error(`修改文件路径失败!! error-> ${error.message}`)
        throw new Error('修改文件路径失败!!')
      }
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
        const record = await uni.$dbManager.getRecordById(recordId)
        const userInfo = uni.$storage.get('userInfo')
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
        uni.$logger.error(`报告错误时发生异常: ${error.message}`)
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
      const MAX_RETRIES = 500 // 最多尝试500次，每次间隔100ms，总共50秒
      const INTERVAL = 100
      try {
        const currentWebview = this.$parent.$scope.$getAppWebview()
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          const wv = currentWebview.children()[0]
          if (wv) {
            wv.setStyle({ top: '100%', height: 300 })
            return wv
          }
          await new Promise(resolve => setTimeout(resolve, INTERVAL))
        }
        throw new Error('WebView initialization timeout')
      } catch (error) {
        this.reportError(`初始化Webview失败 error:${error.message}`, error.message)
        // this.toLogin()
        throw error
      }
    },
    toLogin() {
      uni.hideLoading()
      uni.showModal({
        title: '错误',
        content: '初始化失败,请重新登录系统',
        showCancel: false,
        success(res) {
          uni.reLaunch({
            url: '/pages/common/login'
          })
        }
      })
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
        uni.$logger.local.info('创建快照成功! 文件个数:' + this.snapshot.size)
      } catch (error) {
        uni.$logger.error
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
      const _snapshot = this.flattenData(_records || [])
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
      uni.$logger.local.info(`开始上传文件!! record: ${JSON.stringify(record)}`)
      if (record.status === FileStatus.NoFile || record.status === FileStatus.NotExist) {
        uni.$logger.local.info(`记录中有未上传文件,或文件不存在, 直接保存记录!!`)
        this.save(record)
      } else {
        try {
          const { lsaccessKeySecret, securityToken, lsaccessKeyId } = await getOssToken()
          uni.$logger.local.info(`获取Token成功!!', lsaccessKeySecret: ${lsaccessKeySecret}`)
          // 通过WebView的evalJS方法，将密钥和ID等信息传递给WebView中的JavaScript代码 执行文件上传
          this.wv.evalJS(`msgFromUniapp('${lsaccessKeyId}','${lsaccessKeySecret}','${securityToken}','${record.fileName}','${record.filePath}','${record.recordId}')`)
        } catch (error) {
          this.reportError(`上传文件时发生异常(uploadRecord): ${error.message}`, error.message)
          throw error
        }
      }
    },
    /**
     * 从客户端删除文件
     * 这个函数用于从客户端的本地存储中删除指定的文件
     * @param {string} filePathOnClient - 要删除的文件在客户端的路径
     * @returns {Promise<boolean>} - 一个 Promise，当文件删除成功时解析为 true，否则抛出错误
     */
    _removeFileOnClient(filePathOnClient) {
      uni.$logger.local.info(`开始删除客户端的文件!! 路径-> ${filePathOnClient}`)
      return new Promise((resolve, reject) => {
        if (!filePathOnClient) {
          uni.$logger.local.info(`要删除的文件为空`)
          resolve(true)
          return
        }
        uni.removeSavedFile({
          filePath: filePathOnClient,
          complete: function (res) {
            uni.$logger.local.info(`${filePathOnClient}->code:${res.code} msg:${res.errMsg}`)
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
      uni.$logger.local.info(`开始保存或更新接待记录!! record-> ${JSON.stringify(data)}`)
      try {
        const { status, ...record } = data
        const fileList = record.recordUrlList || []
        // 判断接待记录的状态，如果是没有文件或者所有文件都已经上传或完成
        if (status === FileStatus.NoFile || fileList.every(i => [FileStatus.Uploaded, FileStatus.Completed].includes(i.status))) {
          // 过滤出状态为已上传的文件，提取其文件路径 并更新记录的 recordUrlList
          const updatedFile = fileList.filter(file => file.status == FileStatus.Uploaded)
          const pathArr = updatedFile.map(i => i.file)
          // 过滤出存在本地文件路径的文件，提取其本地文件路径 以便记录保存完成后 删除
          const originalFileArr = updatedFile.map(i => i.filePathOnClient) //正常上传的文件才删除本地文件
          uni.$logger.local.info(`本条接待所有文件已经上传和处理完毕!! 已上传的文件: ${JSON.stringify(pathArr)} 本地文件: ${JSON.stringify(originalFileArr)}`)
          const params = Object.assign(record, { recordUrlList: pathArr })
          // 如果接待结束时间不存在，则向服务器请求接待结束时间
          if (!params.receptionEndTime) {
            params.receptionEndTime = await this._requestReceptionEndTime(pathArr, params.receptionStartTime)
          }
          uni.$logger.local.info(`开始向服务器保存接待记录!!参数: ${JSON.stringify(params)}`)
          //向服务器发送请求，保存接待记录
          const res = await uni.$api.commonApi.saveRecCustomer(params)
          uni.$logger.local.info(`服务器返回结果: ${JSON.stringify(res)}`)
          // 如果服务器返回结果成功
          if (res) {
            // 移除本地文件
            await this._removeRecordFiles(originalFileArr)
            // 从记录管理器中移除记录
            await this._removeRecordById(record.id)
          }
        } else {
          // 如果记录中还有未处理文件，记录日志并更新记录
          uni.$logger.local.info(`记录中有未上传文件,开始更新记录!!`)
          // 更新接待记录
          await uni.$dbManager.updateRecord(record)
        }
      } catch (error) {
        // 如果保存或更新接待记录失败，记录错误信息并抛出错误
        this.reportError(`上传接待记录异常,error:${error.message}`, error.message, data.id, data.filePath + data.fileName)
      }
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
        uni.$logger.local.info(`向服务器获取结束接待时间: recordUrlList ->${serializeIfObject(recordUrlList)} receptionStartTime: -> ${receptionStartTime}`)
        // 调用 uni.$api.commonApi.searchRecordingEndTime 方法，向服务器发送请求，获取接待结束时间
        const endTime = await uni.$api.commonApi.searchRecordingEndTime({ recordUrlList, receptionStartTime: receptionStartTime.replace(/\//g, '-') })
        // 记录日志，显示服务器返回的接待结束时间
        uni.$logger.local.info(`服务器返回结束接待时间: endTime ->${endTime}`)
        // 返回接待结束时间，将日期格式中的连字符替换为斜杠，以保持一致性
        return endTime.replace(/\-/g, '/')
      } catch (error) {
        // 如果请求失败，记录错误信息并抛出错误
        this.reportError(`向服务器获取结束接待时间异常: error ->${error.message}`, error.message)
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
        uni.$logger.local.info(`删除接待记录成功: recordId ->${recordId}`)
      } catch (error) {
        this.reportError(`删除接待记录异常: error ->${error.message}`, { message: error.message, recordId })
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
        uni.$logger.local.info(`删除接待文件完成!`)
      } catch (error) {
        this.reportError(`删除接待文件异常: error ->${error.message}`, { message: error.message, fileArr })
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
      for (const cur of records) {
        // 确保 recordUrlList 是一个数组
        cur.recordUrlList = cur.recordUrlList || []
        if (cur.recordUrlList.length == 0) {
          // 如果记录中没有文件，则将其状态设置为 NoFile，并添加到结果数组中
          result.push(Object.assign({ status: FileStatus.NoFile, recordId: cur.id }, cur))
          this.reportError('记录中不存在接待语音文件', { record: cur }, cur.id) //记录中不存在接待语音文件
          continue
        }
        // 处理每个记录的文件列表
        for (const file of cur.recordUrlList) {
          try {
            // 如果文件状态为已上传或已完成，则跳过该文件
            if (!file.status || file.status == FileStatus.Uploaded || file.status == FileStatus.Completed) continue
            const aFullPath = file.file.split('/')
            const fileName = aFullPath.pop()
            const filePath = aFullPath.join('/') + '/'
            const file2Up = { ...file, recordId: cur.id, fileName, filePath }
            // 检查文件是否存在
            const fileExists = await this.checkFileExists(file.file)
            if (!fileExists) {
              // 如果文件不存在，则将其状态设置为 NotExist，并记录错误信息
              this.reportError('记录中有语音文件地址,但是文件不存在', { record: cur, file }, cur.id, file.file) //记录中语音文件不存在
              file2Up.status = FileStatus.NotExist
            }
            result.push(file2Up)
          } catch (error) {
            // 如果在处理文件过程中发生错误，则记录错误信息并继续处理下一个文件
            this.reportError(`解析处理文件异常 error: ${error.message}`, { record: cur, file })
            continue
          }
        }
      }
      return result
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
        if (!filePath) {
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
    /**
     * 轮询函数
     * 这个函数会检查网络连接状态，如果网络在线，则执行上传操作
     * 如果网络不在线，则记录错误信息并在指定的时间间隔后重试
     */
    async polling() {
      try {
        // 如果快照对象不存在，则立即返回 轮询会停止
        if (this.snapshot === null) return console.log('stooooooooooooop')
        // 检查网络是否在线
        const isOnline = await uni.$isNetWork()
        // 如果网络在线，则执行上传操作
        if (isOnline) {
          await this.upload()
        } else {
          this.onerror('网络异常,稍后再试')
        }
      } catch (error) {
        this.onerror(`异常,error->${error.message}`)
      }
    },
    async onerror(message) {
      this.reportError(message)
      await this.wait() //添加等待 解决异常情况下,无间隔死循环
      this.polling()
    },
    async wait(time = 15 * 60 * 1000) {
      const msg = await this.timeoutManager.addTimeout(this.interval, time)
      if (msg === 'abort') this.snapshot = null
    },
    /**
     * 执行上传操作
     * 这个函数用于执行上传操作
     * 首先，获取当前记录的快照
     * 然后，调用 flattenData 方法将快照扁平化
     * 最后，调用 uploadRecord 方法上传记录
     */
    async upload() {
      if (this.snapshot.size == 0) {
        await this.enQueue()
        await this.wait()
        this.polling()
      } else {
        let record = this.snapshot.dequeue()
        this.beginTask(record)
      }
    },
    /**
     * 开始处理任务
     * 这个函数用于将一个任务加入到操作队列中，并在任务完成后进行轮询
     * @param {Object} record - 要处理的记录对象
     * @returns {void} - 此函数不返回任何值
     */
    async beginTask(record) {
      // 将任务函数加入到操作队列中，并在任务完成后调用 polling 函数进行下一轮轮询
      this.operationQueue.enqueue(() => this.task(record), `文件ID:${record.recordId}`).finally(this.polling)
    },
    /**
     * 处理单个记录的任务
     * 这个函数用于处理单个记录的上传任务
     * @param {Object} record - 要处理的记录对象
     * @returns {Promise} - 当任务完成时解析的 Promise
     */
    task(record) {
      return new Promise(resolve => {
        this.updateResolve = resolve
        this.uploadRecord(record)
      })
    },
    /**
     * 结束任务
     * 这个函数用于结束当前的任务
     * 调用 resolve 方法来解决 Promise，标记任务完成
     * @returns {void} - 此函数不返回任何值
     */
    endTask() {
      this.updateResolve && this.updateResolve(), (this.updateResolve = null)
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
      if (this.operationQueue) {
        this.operationQueue.clear() // 取消所有待处理的操作
      }
      this.canclePromises()
      uni.$logger.local.info(`停止文件上传轮询并清除队列`)
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
      if (!isInteger(interval)) {
        const error = `参数错误!interval 必需为数字!  interval -> ${interval} `
        uni.$logger.local.error(error)
        return
      }
      this.interval = interval
      if (isForce) {
        this.startPolling(isForce)
      }
      uni.$logger.local.info(`轮询间隔已设置为 ${interval} 秒`)
    },
    /**
     * 启动文件上传轮询
     * 这个方法用于启动文件上传轮询
     * 如果 timer 已经存在且 isForce 为 false，则不会强制重启轮询
     * 如果 isForce 为 true，则会强制重启轮询
     * @param {boolean} [isForce=false] - 是否强制重启轮询
     */
    async startPolling(isForce = false) {
      if (this.timeoutManager.isProcessing || this.updateResolve) {
        if (!isForce) {
          uni.$logger.local.info(`非强制模式下,不强制重启轮询`)
          return
        } else {
          uni.$logger.local.info(`强制模式下,立即完成promise,强制重启轮询`)
          this.canclePromises()
        }
      }
      setTimeout(async () => {
        await this.enQueue()
        this.polling()
      }, 0)
      // setTimeout(() => {
      //   this.startPolling(true)
      // }, 1000)
      uni.$logger.local.info(`=========开始轮询========`)
    },
    /**
     * 清除 timer
     */
    canclePromises() {
      this.timeoutManager.cancelAllTasks()
      this.endTask()
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
    // 如果存在 WebView 实例，重置为 null
    if (this.wv) {
      this.wv = null
    }
    // 取消监听停止轮询事件
    uni.$off(Command.StopPolling, this.stopPolling)
    // 取消监听开始轮询事件
    uni.$off(Command.StartPolling, this.startPolling)
    // 取消监听设置轮询间隔事件
    uni.$off(Command.SetPollingInterval, this.setInterval)
    // 记录组件销毁前的日志信息
    uni.$logger.local.info(`组件销毁前执行的生命周期函数`)
  }
}
