import { storageApi } from '@/utils/cache'
export default {
  mounted() {
    // this.mergeRecord()
    this.clearPrevFile()
  },
  methods: {
    deleteDirectory(dirPath) {
      const _this = this
      plus.io.resolveLocalFileSystemURL(
        dirPath,
        function (entry) {
          if (entry.isDirectory) {
            const directoryReader = entry.createReader()
            directoryReader.readEntries(
              function (entries) {
                if (entries.length === 0) {
                  // 如果目录为空，直接删除
                  entry.remove(
                    function () {
                      console.log('目录删除成功：', dirPath)
                      uni.$logger.local.info(`目录删除成功： ->${dirPath}`)
                    },
                    function (e) {
                      console.log('目录删除失败：', e.message)
                      uni.$logger.local.info(`目录删除失败： ->${dirPath} ->${e.message}`)
                    }
                  )
                } else {
                  // 递归删除子文件和子目录
                  let deleteCount = 0
                  const totalEntries = entries.length

                  function processNextEntry() {
                    if (deleteCount >= totalEntries) {
                      // 所有条目处理完毕，尝试删除当前目录
                      entry.remove(
                        function () {
                          console.log('目录删除成功：', dirPath)
                          uni.$logger.local.info(`目录删除成功： ->${dirPath}`)
                        },
                        function (e) {
                          console.log('目录删除失败：', e.message)
                          uni.$logger.local.info(`目录删除失败： ->${dirPath} ->${e.message}`)
                        }
                      )
                      return
                    }

                    const entry = entries[deleteCount]
                    entry.getMetadata(
                      function (metadata) {
                        if (entry.isFile) {
                          // 删除文件
                          entry.remove(
                            function () {
                              console.log('文件删除成功：', entry.fullPath)
                              uni.$logger.local.info(`文件删除成功： ->${entry.fullPath}`)
                              deleteCount++
                              processNextEntry() // 处理下一个条目
                            },
                            function (e) {
                              console.log('文件删除失败：', e.message)
                              uni.$logger.local.info(`文件删除失败： ->${entry.fullPath} ->${e.message}`)
                              deleteCount++
                              processNextEntry() // 处理下一个条目
                            }
                          )
                        } else if (entry.isDirectory) {
                          // 递归删除子目录
                          _this.deleteDirectory(entry.fullPath)
                          deleteCount++
                          processNextEntry() // 处理下一个条目
                        }
                      },
                      function (e) {
                        console.log('获取元数据失败：', e.message)
                        deleteCount++
                        processNextEntry() // 处理下一个条目
                      }
                    )
                  }

                  // 开始处理第一个条目
                  processNextEntry()
                }
              },
              function (e) {
                console.log('读取目录内容失败：', e.message)
                uni.$logger.local.info(`读取目录内容失败： ->${e.message}`)
              }
            )
          } else {
            console.log('路径不是目录：', dirPath)
            uni.$logger.local.info(`路径不是目录： ->${dirPath}`)
          }
        },
        function (e) {
          console.log('无法访问目录：', e.message)
          uni.$logger.local.info(`无法访问目录： ->${dirPath}`)
        }
      )
    },
    clearPrevFile() {
      let version = plus.runtime.version
      let clearVersion = uni.$storage.get('clearVersion')

      if (clearVersion != version) {
        const wwwPath = plus.io.convertLocalFileSystemURL('doc')
        // const filesPath = wwwPath.replace(/apps.+/, 'apps/')
        // console.log(filesPath)
        const filesPath = wwwPath.replace(/gltap.+/, 'gltap/')
        this.getDirectoryContents(filesPath)
      }
      setTimeout(() => {
        uni.$storage.set('clearVersion', version)
      }, 5000)
    },
    getDirectoryContents(dirPath) {
      // 解析目录路径
      const _this = this
      const excludeFile = ['databases']
      plus.io.resolveLocalFileSystemURL(
        dirPath,
        function (entry) {
          // 创建 DirectoryReader
          const directoryReader = entry.createReader()

          // 读取目录内容
          directoryReader.readEntries(
            function (entries) {
              console.log('目录内容读取成功：')
              _this.directoryList = entries
              entries.forEach(function (entry) {
                console.log('文件路径：', entry.fullPath)
                if (!excludeFile.includes(entry.name)) {
                  _this.deleteDirectory(entry.fullPath)
                }
              })
            },
            function (e) {
              console.log('读取目录内容失败：', e.message)
            }
          )
        },
        function (e) {
          console.log('无法访问目录：', e.message)
        }
      )
    },
    async mergeRecord() {
      try {
        const tempRecords = storageApi.getRecords('preRecordList') || []
        uni.$logger.local.info(`获取待合并记录${JSON.stringify(tempRecords)}`)
        for (let i = 0; i < tempRecords.length; i++) {
          tempRecords[i].recordUrlList.forEach(record => {
            record.file = record.file.split('/').pop()
          })
          uni.$logger.local.info(`合并记录${JSON.stringify(tempRecords[i])}`)
          this.record.addRecord(tempRecords[i])
        }
        storageApi.removeRecords('preRecordList')
      } catch (error) {
        uni.$logger.error(`【合并异常】 ${JSON.stringify(error?.message)}`)
      }
    }
  }
}
