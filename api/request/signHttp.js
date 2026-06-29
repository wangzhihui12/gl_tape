import { Request } from 'glsk-toolkit'
module.exports = {
  gscPost: (url, data, _config = {}) => {
    return new Promise((resolve, reject) => {
      uni.getNetworkType({
        success(res) {
          if (['none'].includes(res.networkType)) {
            uni.hideLoading()
            uni.showToast({
              title: '网络异常',
              icon: 'none'
            })
            return
          }
          if (!uni.$signHttp) uni.$signHttp = new Request(uni.signHttpConfig)
          resolve(uni.$signHttp.post(url, data, _config))
        }
      })
    })
  }
}
