/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-11-22 20:45:05
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2024-12-06 09:42:35
 * @FilePath: \gl-tape\ws\workers\RemoveRecordWorker.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { serializeIfObject } from '@/utils/utils.js'
export default class RemoveRecordWorker {
  constructor() {}
  async work(deviceId, data, ws) {
    const recordId = data.id
    if (!recordId) {
      const msg = `删除接待记录,缺少记录id`
      uni.$logger.local.info(msg)
      ws.send({ error: msg })
      return
    }
    try {
      const record = await uni.$dbRecord.getRecordById(recordId)
      if (!record) {
        const msg = `记录不存在 id -> ${recordId}`
        uni.$logger.local.info(msg)
        ws.send({ error: msg })
        return
      }
      await uni.$dbRecord.removeRecord(recordId)
      const msg = `记录删除成功 id -> ${recordId}`
      uni.$logger.local.info(msg)
      ws.send({ code: 200, msg })
    } catch (error) {
      const msg = `记录删除异常 id -> ${recordId} error -> ${serializeIfObject(error.message)}`
      uni.$logger.local.error(msg)
      ws.send({ error: error, recordId })
    }
  }
}
