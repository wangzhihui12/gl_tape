<template>
  <uni-popup
    ref="riskInformed"
    type="center"
    :is-mask-click="false"
    animation
    class="risk-popup"
  >
    <view class="box">
      <view
        class="icon-close-box flex"
        @click="close"
      >
        <uni-icons
          class="icon-close"
          type="closeempty"
          :size="16"
          color="#fff"
        ></uni-icons>
      </view>
      <image
        class="img"
        :src="popupImg"
      />
    </view>
  </uni-popup>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'RiskInformedBox',
  props: {
    popupImg: String
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.riskInformed.open();
    },
    close () {
      this.$refs.riskInformed.close();
    },
  }
}
</script>

<style scoped lang='scss'>
.risk-popup {
  z-index: 99 !important;
}
.box {
  width: toRpx(1862);
  height: toRpx(1176);
  background: #ffffff;
  border-radius: toRpx(48);
  position: relative;
  .icon-close-box {
    position: absolute;
    top: toRpx(32);
    right: toRpx(48);
    width: toRpx(48);
    height: toRpx(48);
    justify-content: center;
    border-radius: 100%;
    background: rgb(121, 123, 127);
    z-index: 2;
  }
  .img {
    width: 100%;
    height: 100%;
  }
}
</style>