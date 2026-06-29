/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2025-01-02 18:49:17
 * @LastEditors: limin
 * @LastEditTime: 2026-01-21 10:52:09
 */
import TempRecord from './TempRecord'

class NativeSave extends TempRecord {
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
  async add(audio) {
    uni.$logger.local.info('〖NativeSave〗 == add called with: ' + audio?.fileName)
    // 创建一个新的记录对象
    const recordUrlList = audio && audio.fileName ? [{ file: audio.fileName }] : []
    // 调用基类通用流程
    await super.add(recordUrlList)
  }
}

export default NativeSave
