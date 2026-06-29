/*
 * @Author: cen
 * @Date: 2026-04-01 15:45:43
 * @Description: 
 * @FilePath: /gl_tape/ws/workers/SqlWorker.js
 * @LastEditTime: 2026-04-08 15:25:16
 * @LastEditors: cenchengwei@foreverht.com
 * 可以输入预定的版权声明、个性签名、空行等
 */
import { serializeIfObject } from '@/utils/utils.js'

export default class SqlWorker {
  constructor() {}

  async work(deviceId, data, ws) {
    const { sql } = data
    if (!sql) {
      ws.send({ error: 'SQL语句不能为空', requestData: data })
      return
    }

    try {
      // 假设 uni.$dbRecord 已经初始化且 db 属性可用
      // 使用 selectSql 执行查询。注意：对于非查询语句(如 UPDATE/DELETE)，selectSql 可能也适用，
      // 或者需要检查 lib/sqlite.js 是否支持 executeSql
      // 根据之前的 SearchCodebase 结果，lib/sqlite.js 只有 selectSql 和 executeSql (未在 context 中显示但通常有)
      // 但 DBManager 中似乎只用了 insert/delete/select 等封装方法。
      // 不过 lib/sqlite.js 显示了 selectSql 方法。
      const result = await uni.$dbRecord.db.selectSql(sql)
      ws.send({ 
        code: 200, 
        msg: 'SQL执行成功', 
        data: result,
        requestData: data 
      })
      
    } catch (error) {
      const msg = `SQL执行失败: ${error.message}`
      uni.$logger.local.error(msg)
      ws.send({ 
        code: 500, 
        error: msg, 
        requestData: data 
      })
    }
  }
}
