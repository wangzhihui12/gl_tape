<template>
  <uni-popup ref="popup" :type="position" :is-mask-click="maskClick" :animation="animation">
    <view :class="['popup-box', { 'right-box': position == 'right' }]" :style="popupStyle">
      <slot></slot>
      <template v-if="!hideFooter">
        <view class="popup-footer flex" v-if="showReset">
          <view class="popup-btn-three popup-cancel" @click="cancel">{{ cancelText }}</view>
          <view class="popup-btn-three popup-reset" @click="reset">{{ resetText }}</view>
          <view class="popup-btn-three popup-confirm" @click="confirm">{{ confirmText }}</view>
        </view>
        <view class="popup-footer flex" v-else>
          <view class="popup-btn popup-cancel" @click="cancel">{{ cancelText }}</view>
          <view class="popup-btn popup-confirm" @click="confirm">{{ confirmText }}</view>
        </view>
      </template>
    </view>
  </uni-popup>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'Popup',
  props: {
    animation: {
      type: Boolean,
      default: true
    },

    maskClick: {
      type: Boolean,
      default: false
    },
    position:{
      type: String,
      default: 'bottom'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    resetText: {
      type: String,
      default: '重置'
    },
    confirmText:{
      type: String,
      default: '确定'
    },
    showReset: {
      type: Boolean,
      default: false
    },
    popupStyle: {
      type: String,
      default: ''
    },
    hideFooter:Boolean

  },

  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.popup.open()
    },
    cancel () {
      this.$emit('onCancel')
    },
    close () {
      this.$refs.popup.close()
      this.$emit('close')
    },
    confirm () {
      this.$emit('onConfirm')
    },
    reset () {
      this.$emit('onReset')
    },
  }
}
</script>

<style scoped lang="scss">
.popup-box {
  border-radius: 32rpx 32rpx 0 0;
  background: #ffffff;
  height: 70vh;
  .popup-footer {
    padding: 64rpx 0;
    justify-content: center;
    gap: 0 32rpx;
    .popup-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 720rpx;
      height: 80rpx;
      border-radius: 64rpx;
      background: #f0f1f5;
      color: #333333;
      font-size: 32rpx;
      font-weight: 500;
    }
    .popup-btn-three {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 470rpx;
      height: 80rpx;
      border-radius: 64rpx;
      background: #f0f1f5;
      color: #333333;
      font-size: 32rpx;
      font-weight: 500;
    }
    .popup-confirm {
      color: #fff;
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    }
    .popup-reset {
      background: #e9effe;
      color: #2c66f7;
    }
  }
}
.right-box {
  width: 46vw;
  height: 100vh;
  border-radius: 32rpx 0 0 32rpx;
  .popup-footer {
    margin: 0 48rpx;
  }
}
</style>
