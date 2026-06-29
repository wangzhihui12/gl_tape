/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-11-22 20:45:05
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-22 15:33:03
 * @FilePath: \gl_tape\ws\workers\StorageWorker.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { constData } from '../../utils/cache'
import { serializeIfObject } from '@/utils/utils.js'
export default class StorageWorker {
  constructor() {}
  async work(deviceId, data, ws) {
    let key = data.key
    if (!constData.STORAGE_OBJECTKEY[key]) {
      uni.$logger.local.error(`不存在的 Storage Key->${key}. data->${serializeIfObject(data)}`)
      return
    }
    let value = uni.$storage.get(key)
    if (key == 'recordList') {
      value = await uni.$dbManager.getRecords()
    }
    const msg = `获取本地缓存!  key->${key} value->${serializeIfObject(value)}`
    uni.$logger.local.info(msg)
    ws.send({ [key]: value })
  }
}
