

import http from '../request/http'
module.exports = {
  /**查询所有业务场景 */
  getSceneMarketMaterialMenu (data = {}) {
    return http.post({
      method: 'dj.api.carboutique.material.scenemarket.findAllLevel',
      projectName: 'boutique',
      ...data
    })
  },  /**根据场景查询素材列表 */
  getSceneMarketMaterialList (data = {}) {
    return http.post({
      method: 'dj.api.carboutique.material.scenemarket.findByOneCode',
      projectName: 'boutique',
      ...data
    })
  },
  /**获取智能体 */
  getAiagent (data = {}) {
    return http.post({
      method: 'dj.pad.api.aiagent.get.special.agent',
      projectName: 'pad',
      ...data
    })
  }

  
}