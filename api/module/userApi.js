import http from '../request/http'

module.exports = {
  /**获取短信 */
  getSmsCode(data = {}) {
    data.projectName = 'boutique'
    return http.fetch('dj.api.smartcarlife.sms.get.code', data)
  },
  /**手机验证码登录 */
  smsLogin(data = {}) {
    data.projectName = 'boutique'
    data.source = 'MINIAPP'
    data.productCode = 'PC00c2'
    return http.fetch('dj.api.smartcarlife.sms.applogin', data)
  },
  /**免登 */
  autoLogin(data = {}) {
    data.projectName = 'boutique'
    return http.fetch('dj.api.smartcarlife.sms.noSignIn.login', data)
  },
  // 获取园区店下的4s店
  getSceneMerchantRefStoreList(data) {
    data.projectName = 'boutique'
    return http.post({
      method: 'dj.api.scenemerchantref.query4SRefByYqShopByLogin',
      ...data
    })
  },
  /**获取帐号列表 */
  getListSelectAccount(data = {}) {
    data.projectName = 'boutique'
    return http.fetch('dj.api.smartcarlife.workWechat.listSelectAccount', data)
  },
  /**选择帐号登陆 */
  selectAccountLogin(data) {
    data.projectName = 'boutique'
    return http.post({
      method: 'dj.api.smartcarlife.workWechat.selectAccountLogin',
      ...data
    })
  },
  // 选择4s店和场景
  selectMerchantScene(data) {
    data.projectName = 'boutique'
    return http.post({
      method: 'dj.api.smartcarlife.selectMerchantScene',
      ...data
    })
  },
  // 获取园区店开通的场景入口
  getYqMerchantSceneConfigAPI(data) {
    data.projectName = 'boutique'
    return http.post({
      method: 'dj.api.smartcarlife.select.openScene.info',
      ...data
    })
  },
  /**退出*/
  logout(data = {}) {
    data.projectName = 'boutique'
    return http.fetch('dj.api.smartcarlife.logout', data)
  },

  /**
   *  查询门店品牌 "渠道标识channelType 1.问界 2.比亚迪 3.其他"
   */
  getMerchantBrand(data = {}) {
    data.projectName = 'boutique'
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.findMerchantBrand',
      ...data
    })
  },
  /**
   *  查询门店保险权益
   */
  getMerchantInsuranceList(data = {}) {
    data.projectName = 'boutique'
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.findMerchantItem',
      ...data
    })
  },

  /**
   *  员工隐私密码验证
   */
  verifyStaffPassword(data = {}) {
    data.projectName = 'boutique'
    return http.post({
      method: 'dj.api.smartcarlife.staff.private.password.verify',
      ...data
    })
  }
}
