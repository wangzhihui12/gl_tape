<template>
  <uni-popup ref="popup" type="right" :mask-click="maskClick" @change="change">
    <view class="right-popup-container" :style="{ width: width }">
      <!-- Header -->
      <view class="popup-header">
        <text class="popup-title">{{ title }}</text>
        <uni-icons class="close-icon" type="closeempty" size="20" color="#999EA8" @click="close" />
      </view>
      
      <!-- Content -->
      <scroll-view scroll-y class="popup-body">
        <slot></slot>
      </scroll-view>
      
      <!-- Footer -->
      <view class="popup-footer" v-if="$slots.footer || showFooter">
        <slot name="footer">
          <view class="footer-btns">
            <button class="btn cancel" :class="{ 'disabled': cancelDisabled }" :disabled="cancelDisabled" @click="close">取消</button>
            <button class="btn confirm" :class="{ 'disabled': confirmDisabled }" :disabled="confirmDisabled" @click="confirm">确定</button>
          </view>
        </slot>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'RightPopup',
  props: {
    title: {
      type: String,
      default: '标题'
    },
    width: {
      type: String,
      default: '1400rpx'
    },
    maskClick: {
      type: Boolean,
      default: false
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    cancelDisabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    open() {
      this.$refs.popup.open()
    },
    close() {
      this.$refs.popup.close()
    },
    change(e) {
      this.$emit('change', e)
    },
    confirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.right-popup-container {
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 48rpx 0 0 48rpx;
}

.popup-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  height: 152rpx;
  // border-bottom: 1rpx solid #eee;
  background: url('@/assets/images/common/right-header.webp') no-repeat center center;
  background-size: 100% 100%;
  border-radius: 48rpx 0 0 0;
  
  .popup-title {
    font-size: 40rpx;
    font-weight: 500;
    color: #292D33;
    text-align: center;
    width: 100%;
  }
  .close-icon {
    position: absolute;
    right: 64rpx;
    top: 50%;
    transform: translateY(-50%);
  }
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  // padding: 16rpx 64rpx;
  box-sizing: border-box;
}

.popup-footer {
  height: 144rpx;
  padding: 24rpx 40rpx;
  // border-top: 1rpx solid #eee;
  border-radius: 0 0 0 48rpx;
  background-color: #fff;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  
  .footer-btns {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    
    .btn {
      flex: 1;
      font-size: 28rpx;
      font-weight: 500;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      margin: 0;
      
      &.cancel {
        background: #3b73ff1a;
        color: #4673FF;
        &::after { border: none; }
        
        &.disabled {
          background: #f5f5f5;
          color: #cccccc;
        }
      }
      
      &.confirm {
        background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
        color: #fff;
        &::after { border: none; }
        
        &.disabled {
          background: linear-gradient(0deg, rgba(44, 102, 247, 0.5) 0%, rgba(72, 166, 255, 0.5) 100%);
          color: #ffffff;
        }
      }
    }
  }
}
</style>
