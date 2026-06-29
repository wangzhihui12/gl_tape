/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-14 16:49:00
 * @LastEditors: limin
 * @LastEditTime: 2025-01-20 17:31:12
 * @FilePath: \gl_tape\ws\workers\AddRecordWorker.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { RecordDto } from '@/utils/recordManager/index'
export default class AddRecordWorker {
  constructor() {}
  async work(deviceId, data, ws) {
    try {
      const record = data.data
      if (!record) {
        throw new Error(`数据格式错误，请提供 record 数据`)
      }
      const keys = Object.keys(record)
      const dto = new RecordDto({})
      const existKeys = ['id', 'recordUrlList']
      keys.forEach(key => {
        if (!existKeys.includes(key) && !dto.hasOwnProperty(key)) {
          throw new Error(`数据格式错误，表中没有 ${key} 字段`)
        }
      })
      record.recordStatus = 1
      await uni.$dbRecord.addRecord(record)
      const msg = `写入待上传记录成功 temp record -> ${JSON.stringify(record)}`
      uni.$logger.local.info(msg)
      ws.send({ code: 200,msg: '写入待上传记录成功', data: record })
    } catch (error) {
      const msg = `写入待上传记录失败 error -> ${error.message}`
      uni.$logger.local.error(msg)
      ws.send({ error: msg })
    }
  }
}
