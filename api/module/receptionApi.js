

import http from '../request/http'
module.exports = {
  /**
   *  查询对话内容
   */
  findConversationDetailByBatchIdNew(data){
    return http.post({
      method: 'dj.pad.api.reception.findConversationDetailByBatchIdNew',
      projectName: 'pad',
      ...data
    })
  },
  /**查询质检列表|侧边栏 */
  findCheckResultByBatchId (data) {
    return http.post({
      method: 'dj.pad.api.reception.findCheckResultByBatchId',
      projectName: 'pad',
      ...data
    })
  },
  /**话术标签 */
  findRecordingTagByBatchId(data) {
    return http.post({
      method: 'dj.pad.api.reception.findRecordingTagByBatchId',
      projectName: 'pad',
      ...data
    })
  },
  getShortUrl(data){
    return http.post({
      method: 'dj.api.car.boutique.inspection.batch.file.short.url',
      projectName: 'boutique',
      ...data
    })
  },

  /**业绩看板 */
  getMerchantPerformance(data){
    return http.post({
      method: 'dj.api.car.boutique.inspection.findMerchantPerformance',
      projectName: 'boutique',
      ...data
    })
  },
}


