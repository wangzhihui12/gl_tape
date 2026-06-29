<template>
  <uni-popup
    ref="packageDetailPopupRef"
    type="center"
    :is-mask-click="false"
    animation
    class="center-popup"
  >
    <view class="box">
      <view class="title flex">
        <view class="text">套餐详情</view>
        <view
          class="icon-close-box flex"
          @click="close"
        >
          <uni-icons
            class="icon-close"
            type="closeempty"
            :size="20"
            color="#1A1A1A"
          ></uni-icons>
        </view>
      </view>
      <view class="content">
        <slot />
      </view>
    </view>
  </uni-popup>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'PackageDetailPopup',
  props: {
  },
  data () {
    return {

    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.packageDetailPopupRef.open();
    },
    close () {
      this.$refs.packageDetailPopupRef.close();
      this.$emit('cancel')
    },
  }
}
</script>

<style scoped lang='scss'>
.center-popup {
  z-index: 99 !important;
}
.box {
  width: toRpx(1400);
  max-height: 80vh;
  min-height: 32vh;
  background: #ffffff;
  border-radius: toRpx(48);
  overflow: auto;
  .title {
    width: 100%;
    height: toRpx(160);
    background-color: #fff;
    background-image: url('@/assets/images/boutique/customer-type-bg.webp');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    position: sticky;
    top: 0;
    z-index: 2;
    .text {
      font-weight: 500;
      font-size: toRpx(40);
      color: #1a1a1a;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .icon-close-box {
      height: 100%;
      margin-left: auto;
      padding: 0 toRpx(48);
      font-weight: 700;
    }
  }
  .content {
    width: 100%;
    // height: toRpx(768);
  }
}
</style>