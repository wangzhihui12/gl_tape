import { serializeIfObject } from '@/utils/utils.js'

export default class FileExplorerWorker {
  constructor() {}

  work(deviceId, data, ws) {
    const { path } = data
    // 默认路径：_doc/ (应用私有文档目录)
    const targetPath = path || '_doc/'

    uni.$logger.local.info(`[FileExplorerWorker] 浏览目录: ${targetPath}`)

    // 检查是否在 App 环境
    // #ifndef APP-PLUS
    ws.send({ error: '文件浏览仅支持 App 环境' })
    return
    // #endif

    // #ifdef APP-PLUS
    plus.io.resolveLocalFileSystemURL(
      targetPath,
      (entry) => {
        if (entry.isDirectory) {
          // 如果是目录，读取目录内容
          const directoryReader = entry.createReader()
          directoryReader.readEntries(
            (entries) => {
              const fileList = entries.map((itm) => ({
                name: itm.name,
                fullPath: itm.fullPath,
                isFile: itm.isFile,
                isDirectory: itm.isDirectory,
                // 注意：getMetadata 需要异步获取，这里为了简单只返回基本信息
                // 如果需要大小和时间，需要遍历调用 getMetadata，会比较慢
              }))
              
              // 排序：目录在前，文件在后
              fileList.sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1
                if (!a.isDirectory && b.isDirectory) return 1
                return a.name.localeCompare(b.name)
              })

              ws.send({
                code: 200,
                msg: '获取目录成功',
                data: {
                  currentPath: entry.fullPath,
                  files: fileList
                }
              })
            },
            (e) => {
              const msg = `读取目录失败: ${e.message}`
              uni.$logger.local.error(msg)
              ws.send({ error: msg })
            }
          )
        } else {
          // 如果是文件，获取文件信息
          entry.getMetadata(
            (metadata) => {
              ws.send({
                code: 200,
                msg: '获取文件信息成功',
                data: {
                  isFile: true,
                  name: entry.name,
                  fullPath: entry.fullPath,
                  size: metadata.size,
                  modificationTime: metadata.modificationTime,
                  directory: false
                }
              })
            },
            (e) => {
              const msg = `获取文件信息失败: ${e.message}`
              uni.$logger.local.error(msg)
              ws.send({ error: msg })
            }
          )
        }
      },
      (e) => {
        const msg = `路径解析失败: ${targetPath}, error: ${e.message}`
        uni.$logger.local.error(msg)
        ws.send({ error: msg })
      }
    )
    // #endif
  }
}
