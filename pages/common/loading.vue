<template>
</template>

<script type='text/ecmascript-6'>
export default {
  name: '',
  data () {
    return {
    }
  },
  mounted () {
    uni.showLoading({
        mask: true
      })
    let userInfo = uni.$storage.get('userInfo')
    if (userInfo && userInfo.sceneType != undefined && userInfo.sceneType != null) {
      uni.$api.userApi.getListSelectAccount().then(res => {
        uni.hideLoading()
        setTimeout(() => {
          if (res.code == 0) {
            let url = {
              1: '/pages/boutique/index',
              0: '/pages/equity/index',
              7: '/pages/usedCar/index'
            }[userInfo.sceneType]
            uni.reLaunch({
              url
            })
          }
          else this.toLogin()
        }, 500)
      }).catch(() => [
        this.toLogin()
      ])
    } else this.toLogin()
  },
  methods: {
    toLogin () {
      uni.hideLoading()
      uni.$storage.rm("userInfo")
      uni.reLaunch({
        url: '/pages/common/login'
      })
    }
  }
}
</script>

<style scoped lang='scss'>
</style>