<template>
  <view>
    <view
      class="update-modal"
      v-if="show"
    >
      <view class="update-box">
        <image
          class="bg"
          :src="bg"
        />
        <view class="content">
          <view class="title">新版本升级 V.{{versionData.version}}</view>
          <template v-for="(i,index) in versionData.textList">
            <view
              class="content-item"
              :key="index"
            >
              {{i}}
            </view>
          </template>
        </view>
        <view
          class="btn"
          @click="toMarket"
        >立即更新</view>
      </view>
      
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'updateBox',
  data () {
    return {
      show: false,
      versionData: {},
      bg: require('@/assets/images/common/update-bg.webp')
    }
  },
  computed: {
    watchUpdateStatus () {
      return this.$store.state.update.status
    },
  },
  watch: {
    watchUpdateStatus: {
      immediate: true,
      handler (newval) {
        this.versionData = uni.$storage.get("mock_data")
        if (newval) this.show = true
      }
    },
  },
  mounted () {
  },
  methods: {
    toMarket () {
      let { appUrl } = this.versionData
      if (!appUrl) appUrl = 'market://details?id=io.dcloud.hellouniapp'
      plus.runtime.openURL(appUrl)
    }
  }
}
</script>

<style scoped lang='scss'>
.update-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999999999;
  background: #00000066;
  .update-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: toRpx(800);
    height: toRpx(752);
    background: #ffffff;
    border-radius: toRpx(32);
    box-sizing: border-box;
    padding-top: toRpx(288);
    .bg {
      width: toRpx(800);
      height: toRpx(400);
      position: absolute;
      left: 0;
      top: toMinusRpx(84);
    }
    .content {
      position: relative;
      z-index: 2;
      width: toRpx(640);
      height: toRpx(288);
      overflow-y: scroll;
      margin: 0 auto toRpx(32);
      .title {
        text-align: center;
        font-weight: 500;
        font-size: toRpx(32);
        margin-bottom: toRpx(24);
      }
      &-item {
        color: #5a5e66;
        font-size: toRpx(28);
      }
    }
    .btn {
      width: toRpx(608);
      height: toRpx(80);
      background-image: linear-gradient(270deg, #2c66f7 0%, #48a6ff 100%);
      border-radius: toRpx(98);
      text-align: center;
      line-height: toRpx(80);
      font-weight: 500;
      font-size: toRpx(32);
      color: #ffffff;
      margin: 0 auto;
    }
  }
}
</style>