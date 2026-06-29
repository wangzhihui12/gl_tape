<template>
  <uni-popup
    ref="centerPopupRef"
    type="center"
    :is-mask-click="false"
    animation
    class="center-popup"
  >
    <view class="box">
      <view class="title flex">
        <view class="text">车架号复核</view>
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
      <view class="content flex">
        <view class="tips">请核对车架号是否正确，如信息有误后期将无法申请补偿服务！</view>
        <view class="input-box flex">
          <view class="input">
            <view class="label">车架号</view>
            <input type="text" maxlength="17" v-model="obj.vin" />
          </view>
          <view class="edit"></view>
        </view>
        <view class="footer-box">

        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'CenterPopup',
  props: {
    list: Array,
    title: String,
    tag: String,
    id: [Number, String],
    isLine: Boolean
  },
  data () {
    return {

    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.centerPopupRef.open();
    },
    close () {
      this.$refs.centerPopupRef.close();
      this.$emit('cancel')
    },
    choose: uni.$throttle(function (index) {
      this.$emit('choose', index)
      this.$refs.centerPopupRef.close();
    }, 200)

  }
}
</script>

<style scoped lang='scss'>
.center-popup {
  z-index: 99 !important;
}
.box {
  width: 848rpx;
  height: 608rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
  .title {
    width: 100%;
    height: toRpx(160);
    // background: url('@/assets/images/boutique/customer-type-bg.webp') no-repeat;
    background-size: 100% 100%;
    position: relative;
    .text {
      font-weight: 500;
      font-size: toRpx(40);
      color: #1a1a1a;
      position: absolute;
      left: 64rpx;
      top: 50%;
      transform: translateY(-50%);
    }
    .icon-close-box {
      height: 100%;
      margin-left: auto;
      padding: 0 toRpx(48);
      font-weight: 700;
    }
  }
  .content {
    padding: 0 toRpx(64);
    width: 100%;
    .tips {
      color: #666666;
      font-size: 32rpx;
      line-height: 48rpx;
    }
    .input-box {
      margin: 48rpx 0 16rpx;
    }
  }
}
</style>