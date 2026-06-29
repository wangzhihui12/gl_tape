import { getTime } from './util'
import { serializeIfObject } from '../utils'
import TaskQueue from '../TaskQueue'
class LogCat {
  main = plus.android.runtimeMainActivity()
  File = plus.android.importClass('java.io.File')
  Environment = plus.android.importClass('android.os.Environment')
  BufferedWriter = plus.android.importClass('java.io.BufferedWriter')
  FileOutputStream = plus.android.importClass('java.io.FileOutputStream')
  OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter')
  // BufferedReader = plus.android.importClass('java.io.BufferedReader')
  // FileInputStream = plus.android.importClass('java.io.FileInputStream')
  // InputStreamReader = plus.android.importClass('java.io.InputStreamReader')
  LogPath = ''
  // 日志写入队列，确保串行写入
  taskQueue = new TaskQueue('LogCat')
  
  // 记录上一次检查清理的日期，用于跨天触发清理
  lastCleanDate = ''
  
  // 流复用相关变量
  currentWriter = null // 当前 BufferedWriter
  currentFos = null // 当前 FileOutputStream
  currentLogFile = '' // 当前打开的日志文件路径
  closeTimer = null // 自动关闭流的定时器
  constructor(folderName = '_zyzs_log') {
    try {
      let file = null
      if (this.Environment.MEDIA_MOUNTED || !this.Environment.isExternalStorageRemovable()) {
        file = this.main.getExternalFilesDir(null)
      }
      if (file) {
        this.LogPath = file.getPath() + folderName
      } else {
        this.LogPath = this.main.getFilesDir().getPath() + folderName
      }
      
      // 初始化日志目录对象，避免每次写入都 new
      this.logDirFile = new this.File(this.LogPath)
      
      // 启动自动清理（清理7天前的日志）this.lastCleanDate = getTime('YYYY-MM-DD')
    } catch (e) {
      console.error('LogCat init error:', e)
      this.LogPath = ''
    }
    console.log('日志文件存放路径->', this.LogPath)
  }
  writeLog(tag, messages) {
    // 将写入任务加入队列
    this.taskQueue.enqueue(() => {
      return new Promise((resolve) => {
        // 延迟一小段时间执行，避免阻塞 UI 渲染
        setTimeout(() => {
          this._doWriteLog(tag, messages)
          resolve()
        }, 0)
      })
    })
  }
  // 真正的写入逻辑（私有方法）
  _doWriteLog(tag, messages) {
    // 如果路径初始化失败，直接放弃写入，避免报错
    if (!this.LogPath) return
    let msg = ''
    try {
      if (messages instanceof Error) {
        msg = messages.stack || messages.message
      } else if (messages === undefined) {
        msg = 'undefined'
      } else {
        msg = serializeIfObject(messages)
      }
    } catch (e) {
      msg = String(messages)
    }
    let date = getTime('YYYY-MM-DD')
    
    // 检查跨天：如果当前日期与上次清理日期不同，触发一次清理
    if (this.lastCleanDate && date !== this.lastCleanDate) {
      this.lastCleanDate = date
    }
    let datetime = getTime()
    //文件名
    let fileName = this.LogPath + '/' + date + '.txt'
    //写入的内容
    let content = `${datetime} [${tag}] : ${msg}\n`
    
    // 使用对应的 console 方法输出
    const logFunc = console[tag] || console.log
    logFunc(content.replace(/\n/g, ''))
    
    // 移除重复的目录检查，仅在必要时（如目录被意外删除）才尝试重建
    // let path = new this.File(this.LogPath)
    // if (!path.exists()) {
    //   path.mkdirs() 
    // }
    
    // 双重保险：虽然构造函数里创建了，但防止运行时目录被误删
    if (this.logDirFile && !this.logDirFile.exists()) {
       this.logDirFile.mkdirs()
    }
    try {
      // 1. 如果当前没有流，或者文件名变了（跨天），则重新打开
      if (!this.currentWriter || this.currentLogFile !== fileName) {
        this._closeStream() // 关闭旧流
        
        this.currentFos = new this.FileOutputStream(fileName, true)
        this.currentWriter = new this.BufferedWriter(new this.OutputStreamWriter(this.currentFos))
        this.currentLogFile = fileName
      }
      
      // 2. 写入内容
      this.currentWriter.append(content)
      
      // 3. 刷新缓冲区，确保内容真正写入磁盘（虽然有性能损耗，但防止崩溃丢日志）
      // 也可以选择积累一定量再 flush，这里为了安全选择每次 flush
      this.currentWriter.flush()
      // 4. 重置自动关闭定时器 (5秒后无操作自动关闭)
      if (this.closeTimer) {
        clearTimeout(this.closeTimer)
      }
      this.closeTimer = setTimeout(() => {
        this._closeStream()
      }, 5000)
    } catch (e) {
      console.log('日志写入失败:', e)
      // 发生异常时尝试关闭流，以便下次重试
      this._closeStream()
    }
  }
  // 关闭当前流
  _closeStream() {
    try {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer)
        this.closeTimer = null
      }
      
      if (this.currentWriter != null) {
        this.currentWriter.close()
        this.currentWriter = null
      }
      // BufferedWriter 关闭时会自动关闭底层的 FileOutputStream，
      // 但为了保险起见，如果 writer 创建失败导致 fos 悬空，这里单独检查一下
      if (this.currentFos != null) {
        // 如果 writer 已经关闭了 fos，再次关闭也不会报错
        this.currentFos.close() 
        this.currentFos = null
      }
      this.currentLogFile = ''
    } catch (e) {
      console.log('关闭日志流失败:', e)
    }
  }
  // 自动清理旧日志
  _cleanOldLogs(daysToKeep) {
    // 放入队列异步执行，不影响启动速度
    this.taskQueue.enqueue(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const list = this.getLogFileList()
            const now = new Date().getTime()
            const oneDay = 24 * 60 * 60 * 1000
            
            list.forEach(file => {
              // 文件名格式：YYYY-MM-DD.txt
              const match = file.name.match(/^(\d{4}-\d{2}-\d{2})\.txt$/)
              if (match) {
                const fileDate = new Date(match[1]).getTime()
                // 如果文件日期早于 (当前时间 - 保留天数)，则删除
                if (now - fileDate > daysToKeep * oneDay) {
                   this.removeLogFile(file.path)
                }
              }
            })
          } catch (e) {
            console.error('清理旧日志失败:', e)
          } finally {
            resolve()
          }
        }, 1000) // 延迟1秒执行，避开App启动高峰
      })
    })
  }
  // 删除日志
  removeLogFile(fileName) {
    try {
      let file = new this.File(fileName)
      if (file.exists()) {
        file.delete()
        console.log('删除------' + fileName)
      }
    } catch (e) {
      console.error('删除日志失败:', e)
    }
  }
  // 获取所有日志文件列表
  getLogFileList() {
    try {
      if (!this.LogPath) return []
      let file = new this.File(this.LogPath)
      if (!file.exists()) return []
      let tempList = file.listFiles()
      if (!tempList || tempList.length === 0) return []
      
      // 注意：Java数组在NativeJS中可能没有map方法，建议使用循环
      const list = []
      for (let i = 0; i < tempList.length; i++) {
        const f = tempList[i]
        list.push({
          name: f.getName(),
          path: f.getPath()
        })
      }
      return list
    } catch (e) {
      console.error('获取日志列表失败:', e)
      return []
    }
  }
}
export default LogCat