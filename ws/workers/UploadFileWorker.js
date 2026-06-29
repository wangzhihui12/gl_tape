import { uploadFile } from '@/utils/ossUploadFile/uploadFile.js'

export default class UploadFileWorker {
  constructor() {}

  async work(deviceId, data, ws) {
    const { filePath } = data
    if (!filePath) {
      ws.send({ error: '文件路径不能为空', requestData: data })
      return
    }

    try {
      uni.$logger.info(`[UploadFileWorker] 开始上传文件: ${filePath}`)
      const url = await uploadFile(filePath)
      uni.$logger.info(`[UploadFileWorker] 上传成功: ${url}`)
      
      ws.send({
        code: 200,
        msg: '上传成功',
        data: {
          url,
          filePath
        },
        requestData: data
      })
    } catch (error) {
      const msg = `上传失败: ${error.message || error}`
      uni.$logger.error(`[UploadFileWorker] ${msg}`)
      ws.send({
        code: 500,
        error: msg,
        requestData: data
      })
    }
  }
}
