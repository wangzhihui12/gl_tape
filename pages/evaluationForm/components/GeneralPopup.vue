<!--针对弹窗穿透滚动，统一封装的popup-->
<template>
  <page-meta :page-style="'overflow:' + (show ? 'hidden' : 'visible')"></page-meta>
  <uni-popup :class="['customPopup', popupClass, noTitle ? 'noTitle' : '']" ref="publishPopup" :type="type" @change="change" :safe-area="safeArea" :is-mask-click="isMaskClick" :showClose="showClose">
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
export default {
  name: 'GeneralPopup',
  props: {
    type: {
      type: String,
      default: 'bottom'
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
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject

        this.$refs.publishPopup.open()
      })
    },
    change(e) {
      this.show = e.show
    },
    closePopup() {
      this.$refs.publishPopup.close()
      if (this.reject) {
        this.reject(null)
      }
      this.$emit('close')
    },
    confirm() {
      if (this.resolve) {
        if (this.autoClose) {
          this.$refs.publishPopup.close()
        }

        this.resolve()
      }
      this.$emit('confirm')
    }
  }
}
</script>
<style scoped lang="scss">
// 大弹窗
::v-deep .customPopup .uni-popup__wrapper.bottom {
  overflow: hidden;
  border-radius: toRpx(32) toRpx(32) 0 0;
  .popup-top-box {
    padding: 0 toRpx(48);
    height: toRpx(112);
    width: 100%;

    background-color: #fff;
    color: #333333;
    font-size: toRpx(36);
    .popup-top-box-title {
      text-align: center;
    }
    .icon-close {
      text-align: end;
    }
  }
  .footer-box {
    width: 100%;
    height: toRpx(164);
    background-color: #fff;
    .btn {
      width: toRpx(720);
    }
  }
}
//小弹窗
::v-deep .customPopup .uni-popup__wrapper.center {
  width: toRpx(848);
  border-radius: toRpx(36);
  background-color: #fff !important;
  padding: 0 0 toRpx(48);
  overflow: hidden;

  .content {
    min-height: 32vh;
    max-height: 80vh;
    overflow-y: auto;
    padding: 0 toRpx(64) toRpx(64);
    box-sizing: border-box;
    background-color: #fff;
    .uni-input-placeholder {
      color: #999999;
    }
  }
  .popup-top-box {
    color: #1a1a1a;
    font-size: toRpx(40);
    font-weight: 500;
    text-align: center;
    width: 100%;
    height: toRpx(136);
    padding: 0 toRpx(64);
    box-sizing: border-box;
    background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
    .popup-top-box-title {
      text-align: center;
    }
    .icon-close {
      text-align: end;
    }
  }
  .footer-box {
    width: 100%;
    margin-top: toRpx(16);
    padding: 0 toRpx(64);
    border-radius: toRpx(42);
  }
}
::v-deep .noTitle .uni-popup__wrapper.center {
  padding: 0;
  .content {
    padding: 0;
  }
  .footer-box {
    padding: 0 toRpx(64);
  }
}

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
</style>
