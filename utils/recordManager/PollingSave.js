/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-02 18:49:17
 * @LastEditors: limin
 * @LastEditTime: 2026-01-15 19:20:33
 */
import utils from '../utils'
import helpler from './helpler'
import PathUtils from './PathUtils'
import { FileStatus } from '../common/constants'
import UploadService from './UploadService.js'
import TempRecord from './TempRecord'

class PollingSave extends TempRecord {
  constructor(record, onTempRecordNumberChanged, attributesProvider) {
    super(record, onTempRecordNumberChanged, attributesProvider)
  }

  /**
   * 添加新的接待记录
   * - 创建内存中的记录对象
   * - 同步写入临时记录数据库
   * - 启动音频处理流程
   * @returns {Promise<void>}
   */
  async add() {
    // 调用基类通用流程（创建记录+入库）
    await super.add([])
    // 添加音频资源
    await this.addAudio()
  }

  /**
   * 添加音频
   * @param {Object} isUpdate - 是否更新音频
   * @returns {void}
   */
  async addAudio() {
    this.clearLoopTimer()

    // 0. 记录旧路径到实例属性，供底层查找时排除
    this._excludePath = this.record?.tempFilePath || ''

    // 1. 处理旧录音，并获取清理任务 (只更新内存，不更新数据库)
    let cleanupTask
    try {
      cleanupTask = await this.processPreviousAudio()
      if (this.record) this.record.tempFilePath = ''

      // 2. 获取新录音并统一提交数据库更新
      await this.addNewAudioAndUpdate()
    } catch (e) {
      uni.$logger.local.error('〖接待记录Record〗 == addAudio 流程异常: ' + e.message)
    } finally {
      // 4. 启动轮询
      this.startSaveAudioLoop()

      // 5. 执行错峰清理
      if (cleanupTask) await cleanupTask()
      this._excludePath = ''
    }
  }

  /**
   * 处理上一个临时文件
   * 1. 持久化保存上一个临时文件并更新本地路径到数据库
   * 2. 返回一个执行删除操作的函数（闭包），无旧文件时返回 null
   */
  async processPreviousAudio() {
    try {
      // uni.$logger.local.info('〖接待记录Record〗 == 保存上一个临时文件！')
      // 直接调用原子保存方法，只更新内存，不涉及数据库操作
      await this.saveTempFile()

      const oldPath = this.record?.tempFilePath

      // 返回清理闭包，封装删除逻辑
      return oldPath ? () => this.removeOldTempAudio(oldPath) : null
    } catch (e) {
      uni.$logger.local.error('〖接待记录Record〗 == 处理上一个录音失败' + e)
      return null
    }
  }

  /**
   * 添加新录音并同步更新数据库
   * - 在内存中成功添加临时路径后，调用 `updatePath` 持久化到临时表
   * @returns {Promise<void>}
   */
  async addNewAudioAndUpdate() {
    await this.addNewAudio()
    // 只要有记录对象，就强制更新一次数据库，确保：
    // 1. 如果有新文件，更新 tempFilePath 和 recordUrlList
    // 2. 如果没新文件（添加失败），也要把可能存在的旧文件归档变更持久化
    if (this.record) {
      await this.updatePath()
      // uni.$logger.local.info('〖接待记录Record〗 == 同步数据库路径成功 id: ' + this.record.id)
    }
  }

  /**
   * 读取最新的录音临时文件并尝试保存
   * - 支持重试机制
   * - 成功后更新内存状态与录音列表
   * @returns {Promise<void>}
   */
  async addNewAudio() {
    try {
      // 直接使用实例属性 _excludePath
      const lastAudio = await this.getLastAudioWithRetry(10, 100)
      if (!lastAudio) {
        uni.$logger.local.warn('〖接待记录Record〗 == 未找到录音文件，跳过添加')
        return
      }
      // uni.$logger.local.info('〖接待记录Record〗 == 添加一个新的录音' + lastAudio)
      const savedPath = await this.saveFilePath(lastAudio)
      if (savedPath && this.record) {
        this.record.tempFilePath = lastAudio
        const last = this.record.recordUrlList[this.record.recordUrlList.length - 1]
        if (last && last.file === savedPath) {
          uni.$logger.local.warn('〖接待记录Record〗 == 录音未变化，跳过添加 -> ' + savedPath)
        } else {
          this.record.recordUrlList.push({ file: savedPath })
          // uni.$logger.local.info('〖接待记录Record〗 == 添加新录音成功:' + savedPath)
        }
      }
    } catch (e) {
      uni.$logger.error(`〖接待记录Record〗 == 添加一个新的录音失败'  ${e.message} ${JSON.stringify(e)}`)
    }
  }

  /**
   * 停止保存轮询并清理定时器句柄
   * @returns {void}
   */
  clearLoopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * 重试读取最近一次录音临时文件路径
   * @param {number} [maxRetries=10] - 最大重试次数 (降低到10次)
   * @param {number} [baseDelay=100] - 基础等待毫秒数 (指数退避)
   * @returns {Promise<string>} 找到则返回路径，否则返回空字符串
   */
  async getLastAudioWithRetry(maxRetries = 10, baseDelay = 100) {
    let lastAudio = ''
    // 使用实例属性作为排除路径，默认为空
    const excludePath = this._excludePath || ''

    for (let i = 0; i < maxRetries; i++) {
      // 如果实例已销毁，立即中断重试
      if (this._isDestroyed) {
        uni.$logger.local.warn('〖接待记录Record〗 == 实例已销毁，终止寻找录音文件')
        return ''
      }

      // 传入 excludePath 让底层去过滤
      const currentAudio = await helpler.getLatestAudioFilePath(excludePath)

      // 只要找到文件，就一定是有效的（excludePath 已经在底层被排除）
      if (currentAudio && currentAudio !== excludePath) {
        lastAudio = currentAudio
        break
      }

      // if (i % 3 === 0) {
      //   uni.$logger.local.info(`〖接待记录Record〗 == 正在寻找新录音文件 (排除: ${excludePath})...`)
      // }

      // 指数退避：每次等待时间增加，避免频繁轮询
      // 100ms, 150ms, 225ms... 上限 500ms
      const delay = Math.min(baseDelay * Math.pow(1.5, i), 500)
      await helpler.sleep(delay)
    }
    if (!lastAudio) {
      uni.$logger.local.warn(`〖接待记录Record〗 == 重试 ${maxRetries} 次后仍未找到新录音文件`)
    }
    return lastAudio
  }

  /**
   * 删除指定路径的临时录音文件
   * @param {string} path - 要删除的文件路径
   * @returns {Promise<void>}
   */
  async removeOldTempAudio(path) {
    if (!path) return
    // uni.$logger.local.info('〖接待记录Record〗 == 删除临时文件 -> ' + path)
    await this.removeFile(path)
  }

  /**
   * 将当前内存中的临时路径与录音列表同步到数据库临时表
   * @returns {Promise<void>}
   */
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
    if (!record) {
      uni.$logger.local.warn('〖接待记录Record〗 == saveTempFile 记录为空，跳过')
      return
    }
    let { tempFilePath, recordUrlList } = record
    if (!tempFilePath || recordUrlList.length === 0) {
      if (!this.timer) {
        uni.$logger.local.info('〖接待记录Record〗 == 无可保存的临时录音，当前未在轮询中，跳过自动补录')
        return
      }
      uni.$logger.local.warn('〖接待记录Record〗 == 无可保存的临时录音，轮询中尝试添加新录音')
      await this.addNewAudioAndUpdate()
      return
    }
    const lastIndex = recordUrlList.length - 1
    if (lastIndex < 0 || !tempFilePath) return
    const { file } = recordUrlList[lastIndex]
    const saveResultPath = await this.saveFilePath(tempFilePath)
    if (saveResultPath) {
      // uni.$logger.local.info('〖接待记录Record〗 == 删除上一次保存的文件 ' + file)
      await this.removeFile(file)
      record.recordUrlList[lastIndex].file = saveResultPath
    }
    return saveResultPath
  }

  /**
   * 将临时文件保存到持久化目录（兼容不同返回结构）
   * @param {string} tempFilePath - 临时文件路径
   * @returns {Promise<string|undefined>} 保存成功返回持久化路径，失败返回 undefined
   */
  async saveFilePath(tempFilePath) {
    // uni.$logger.local.info('〖接待记录Record〗 == 开始保存临时录音 tempFilePath-> ' + tempFilePath)
    if (!tempFilePath) return
    try {
      const saveResult = await uni.saveFile({
        tempFilePath
      })
      // 兼容 uni.saveFile 可能返回数组 [err, res] 或直接返回对象的情况
      let saveResultPath = ''
      if (Array.isArray(saveResult)) {
        saveResultPath = saveResult[1]?.savedFilePath
      } else {
        saveResultPath = saveResult?.savedFilePath
      }
      if (!saveResultPath) {
        uni.$logger.local.error('〖接待记录Record〗 == 保存文件失败，路径为空')
        return
      }
      // 减少日志输出，仅在调试需要时开启
      // uni.$logger.local.info('〖接待记录Record〗 == 保存后的文件路径 saveResultPath ->' + saveResultPath)
      return saveResultPath
    } catch (e) {
      uni.$logger.local.error('〖接待记录Record〗 == 保存文件异常: ' + e.message)
      return
    }
  }

  /**
   * 在轮询中保存最后一个临时录音并更新列表
   * @returns {Promise<void>}
   */
  async saveLastAudio() {
    if (this._isDestroyed) return // 双重保险
    try {
      const __path = await this.saveTempFile()
      __path && this.updateUrlList()
    } catch (e) {
      uni.$logger.local.error('〖接待记录Record〗 == 轮询保存异常: ' + e.message)
    }
  }

  /**
   * 将当前内存的 `recordUrlList` 写回数据库
   * @returns {Promise<void>}
   */
  updateUrlList() {
    const { id, recordUrlList } = this.record
    return this.updateRecord({ recordUrlList }, { id })
  }

  /**
   * 启动保存临时录音的轮询
   * - 若已启动则跳过
   * @returns {void}
   */
  startSaveAudioLoop() {
    if (this.timer) {
      uni.$logger.local.info('〖接待记录Record〗 == 轮询已启动，跳过')
      return
    }
    if (this._isDestroyed) {
      uni.$logger.local.warn('〖接待记录Record〗 == 组件已销毁，忽略 startSaveAudioLoop')
      return
    }
    uni.$logger.local.info('〖接待记录Record〗 == 启动轮询 ' + this.timer_interval + 'ms')
    this.timer = setInterval(this.saveLastAudio.bind(this), this.timer_interval)
  }

  async beforeSave(record) {
    this.clearLoopTimer()
    await this.saveTempFile(record)
  }
}

export default PollingSave
