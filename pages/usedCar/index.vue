<template>
  <view>
    <home-frame
      ref="home"
      :loadComplete="loadComplete"
      :swiperNoDataObject="swiperNoDataObject"
      :checkRecordAudio="false"
    >
    </home-frame>
  </view>
</template>
<script>
import HomeFrame from '@/components/HomeFrame/index.vue'
export default {
  components: { HomeFrame },
  data () {
    return {
      loadComplete: true,
      requested: false,
      swiperNoDataObject: Object.freeze({
        icon: require('@/assets/images/home/swiper-nodata.webp'),
        text: '暂无数据'
      })
    }
  },
  computed: {
  },
  onBackPress (options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      uni.navigateBack()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  async onLoad () {
    uni.hideLoading()
  },
  async onShow () {
    const userInfo = uni.$storage.get('userInfo')
    if (!userInfo.shopMerchantId || !userInfo.shopMerchantName) {
      uni.$storage.rm('userInfo')
      uni.$storage.rm('sessionId')
      uni.reLaunch({
        url: '/pages/common/login'
      })
      return
    }
    // this.$refs.home.updateApp()
    this.$refs.home?.updateApp()
    this.init()
  },
  methods: {
    init () {
      // this.$refs.home.$refs.leftBox.getMessageInfo()
      this.$refs.home?.$refs?.leftBox?.getMessageInfo()
    },
  }
}
</script>
<style scoped lang="scss">
.webview-container {
  width: toRpx(100);
  height: toRpx(100);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform: translateY(300%);
}
</style>
