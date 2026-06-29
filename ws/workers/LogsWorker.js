import config from '@/config.js'
import { serializeIfObject,deepClone } from '@/utils/utils.js'
export default class LogsWorker {
  logFile = null
  constructor() {
    this.logFile = uni.$logger.local.logger
    this.isUploading = false
    this.files = []
  }
  getLogFileList() {
    return this.logFile.getLogFileList()
  }
  upload(deviceId, data) {
    if (this.isUploading) {
      const msg = `日志上传中,请稍后再试!`
      uni.$logger.local.info(msg)
      this.ws.send(msg)
      return
    }
    this.isUploading = true
    const files =  this.getLogFileList()
    this.files = JSON.stringify(files)
    if (files?.length) {
      files.sort((a, b) => a.name.localeCompare(b.name))
      this.process(files, deviceId)
    }
  }
  async process(files, deviceId) {
    if (files.length > 0) {
      const file = files.shift()
      await this.post(file, deviceId)
      setTimeout(() => this.process(files, deviceId), 500)
    } else {
      this.ws.send({ code: 200, msg: `日志上传完成 logs -> ${this.files}`})
      this.isUploading = false
      this.files=[]
    }
  }
  post({ name, path }, deviceId) {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${config.HTTP_SERVER}/${config.FILE_UPLOAD_URL}`,
        filePath: path,
        name: 'file',
        header: {
          'Content-Type': 'multipart/form-data'
        },
        formData: {
          deviceId,
          type: 'log'
        },
        success: res => {
          uni.$logger.local.info(`文件上传成功! res->${serializeIfObject(res)} filePath->${path}`)
          resolve()
        },
        fail: res => {
          uni.$logger.local.error(`文件上传失败! res->${serializeIfObject(res)} filePath->${path} .`)
          resolve()
        }
      })
    })
  }
  work(deviceId, data, ws) {
    this.ws = ws
    this.upload(deviceId, data)
  }
}
