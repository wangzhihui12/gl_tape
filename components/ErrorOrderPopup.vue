<!-- 异常订单 -->
<template>
    <view v-if="show" class="error-order-popup-mask" @click="handleMaskClick">
      <view 
        class="error-order-popup-content" 
       
        @click.stop
      >
        <!-- 顶部图片 -->
        <image 
          v-if="topImage" 
          class="top-image" 
          :src="topImage"
          :style="topImageStyle"
        />
  
        <view v-if="closeButton" @click.stop="closePopup">
          <view class="sprite-icon icon-evaluationClose"></view>
        </view>
        
        <!-- 标题 -->
        <view v-if="title" class="popup-title">{{ title }}</view>
        
        <!-- 内容区域 - 默认插槽 -->
        <view class="popup-body">
          <slot></slot>
        </view>
        
        <!-- 底部按钮插槽 -->
        <slot name="footer"></slot>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    name: 'ErrorOrderPopup',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      width: {
        type: [Number, String],
        default: 848
      },
      height: {
        type: [Number, String],
        default: 1054
      },
      title: {
        type: String,
        default: ''
      },
      topImage: {
        type: String,
        default: ''
      },
      topImageWidth: {
        type: [Number, String],
        default: 848
      },
      topImageHeight: {
        type: [Number, String],
        default: 248
      },
      maskClosable: {
        type: Boolean,
        default: false
      },
      closeButton: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      contentStyle() {
        return {
          width: this.formatSize(this.width),
          minHeight: this.formatSize(this.height)
        }
      },
      topImageStyle() {
        return {
          width: this.formatSize(this.topImageWidth),
          height: this.formatSize(this.topImageHeight)
        }
      }
    },
    methods: {
      formatSize(size) {
        return typeof size === 'number' ? `${size}rpx` : size
      },
      handleMaskClick() {
        if (this.maskClosable) {
          this.close()
        }
      },
      close() {
        this.$emit('update:show', false)
        this.$emit('close')
      },
      closePopup() {
        this.close()
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .error-order-popup-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .error-order-popup-content {
    background: #FFFFFF;
    border-radius: toRpx(48);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    max-height: toRpx(740);
    overflow-y: auto;
  }
  .sprite-icon {
    top: toRpx(48);
    right: toRpx(48);
    position: absolute;
  }
  .top-image {
    width: 100%;
    display: block;
    margin-bottom: toRpx(48);
    flex-shrink: 0;
    border-radius: toRpx(20) toRpx(20) 0 0;
  }
  
  .popup-title {
    font-size: toRpx(40);
    font-weight: 500;
    letter-spacing: 0;
    line-height: toRpx(46.88);
    color: rgba(51, 51, 51, 1);
    text-align: center;
    margin-bottom: toRpx(48);
    padding: 0 toRpx(32);
  }
  
  .popup-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 toRpx(32);
  }
  </style>
  
  