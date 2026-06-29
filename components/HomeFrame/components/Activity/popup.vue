<!--针对弹窗穿透滚动，统一封装的popup-->
<template>
  <page-meta :page-style="'overflow:' + (show ? 'hidden' : 'visible')"></page-meta>
  <uni-popup :class="['customPopup', popupClass, noTitle ? 'noTitle' : '', size]" ref="publishPopup" :type="type" @change="change" :safe-area="safeArea" :is-mask-click="isMaskClick" :showClose="showClose">
    <!-- 顶部标题栏插槽 -->
    <slot name="header">
      <view class="popup-top-box flex align-center" v-if="showTitle">
        <view class="popup-top-box-title flex-1">{{ title }}</view>
        <view style="font-size: 0">{{ otherText }}</view>
        <view @click.stop="closePopup">
          <view class="sprite-icon icon-evaluationClose"></view>
        </view>
      </view>
    </slot>
    <!-- 主要内容插槽 -->
    <view class="content">
      <slot name="content"></slot>
    </view>

    <!-- 底部插槽 插槽有内容就优先自定义内容-->
    <slot name="footer">
      <view class="footer-box flex justify-center" v-if="isShowFooter">
        <view class="cancle-btn btn" v-if="isShowCancel" @click.stop="closePopup">{{ cancelText }}</view>
        <view class="sure-btn btn" :class="{ 'single-btn': isShowCancel }" @click.stop="confirm">{{ confirmText }}</view>
      </view>
    </slot>
  </uni-popup>
</template>

<script>
import { size } from 'lodash'

export default {
  name: 'GeneralPopup',
  props: {
    type: {
      type: String,
      default: 'bottom'
    },
    size: {
      type: String,
      default: 'small'
    },
    isMaskClick: {
      type: Boolean,
      default: false
    },
    safeArea: {
      type: Boolean,
      default: true
    },
    popupClass: {
      type: String,
      default: ''
    },
    showClose: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    isShowFooter: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    isShowCancel: {
      type: Boolean,
      default: true
    },
    autoClose: {
      type: Boolean,
      default: true
    },
    noTitle: {
      type: Boolean,
      default: false
    },
    otherText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    open() {
      this.$refs.publishPopup.open()
    },
    change(e) {
      this.show = e.show
    },
    closePopup() {
      this.$refs.publishPopup.close()
      this.$emit('close')
    },
    confirm() {
      if (this.autoClose) {
        this.$refs.publishPopup.close()
      }
      this.$emit('confirm')
    }
  }
}
</script>
<style scoped lang="scss">
.justify-between {
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  -webkit-justify-content: space-between;
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.uniui-closeempty {
  color: #1a1a1a;
  font-size: toRpx(24);
  font-weight: 600;
}
.single-btn {
  width: 100%;
}

.popup-top-box {
  padding: 0 toRpx(48);
  height: toRpx(112);
  width: 100%;

  background-color: transparent;
  color: #333333;
  font-size: toRpx(36);
  .popup-top-box-title {
    text-align: center;
  }
  .icon-close {
    text-align: end;
  }
}

.btn {
  width: toRpx(720);
  height: toRpx(76);
  border-radius: toRpx(48);
  opacity: 1;
  line-height: toRpx(80);
  text-align: center;
  color: rgba(26, 26, 26, 0.6);
  font-size: toRpx(32);
  font-weight: 500;
}
.cancle-btn {
  background: #f0f1f5;
  margin-right: toRpx(38);
}
.sure-btn {
  color: #fff;
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
}

::v-deep .customPopup.center.small {
  //   width: toRpx(690);
}
::v-deep .customPopup.center.medium .uni-popup__wrapper {
  width: 60vw;
  max-height: 80vh;
  min-height: 68vh;
  border-radius: toRpx(32);
  background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
  overflow: hidden;
}
::v-deep .customPopup.center.large {
  //   width: toRpx(990);
}
</style>
