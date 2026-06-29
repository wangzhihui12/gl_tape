<template>
  <uni-popup
    ref="learnPopup"
    type="center"
    :is-mask-click="false"
  >
    <view class="learn-box">
      <view class="sprite-icon icon-learn-bg"></view>
      <view class="learn-content">
        <view class="learn-title">退出提醒</view>
        <text class="learn-text">{{content}}</text>
      </view>
      <view class="learn-footer flex">
        <view
          class="learn-btn learn-confirm"
          @click="confirm"
        >确认退出</view>
        <view
          class="learn-btn learn-cancel"
          @click="cancel"
        >继续学习</view>
      </view>
    </view>
  </uni-popup>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    content: {
      type: String,
      default: ''
    }
  },

  name: '',
  data () {
    return {
    }
  },
  computed: {
    learnRef () {
      return this.$refs.learnPopup
    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.learnRef.open()
    },
    cancel () {
      this.close()
      this.$emit('cancel')
    },
    close () {
      this.learnRef.close()
    },
    confirm () {
      this.close()
      this.$emit('confirm')
    }
  }
}
</script>

<style scoped lang='scss'>
.learn-box {
  width: toRpx(848);
  height: toRpx(648);
  border-radius: toRpx(48);
  background: #ffffff;
  position: relative;
  overflow: hidden;
  .sprite-icon{
    position: absolute;
    top: 0;
    left: 0;
    zoom: 2;
  }
  .learn-content {
    padding: toRpx(296) toRpx(64) toRpx(32);
    text-align: center;
    .learn-title {
      color: #333333;
      font-size: toRpx(40);
      font-weight: 500;
      margin-bottom: toRpx(16);
    }
    .learn-text {
      color: #666666;
      font-size: toRpx(32);
    }
  }
  .learn-footer {
    height: toRpx(160);
    padding: 0 toRpx(64);
    justify-content: space-between;
    .learn-btn {
      width: toRpx(344);
      height: toRpx(80);
      border-radius: toRpx(64);
      background: #f0f1f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1a1a1a;
      font-size: toRpx(28);
    }
    .learn-cancel {
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #fff;
    }
  }
}
</style>