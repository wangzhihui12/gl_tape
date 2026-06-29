<!--针对弹窗穿透滚动，统一封装的popup-->
<template>
  <page-meta :page-style="'overflow:' + (show ? 'hidden' : 'visible')"></page-meta>
  <uni-popup :class="popupClass" ref="publishPopup" :type="type" @change="change" :is-mask-click="isMaskClick" :safe-area="safeArea" :showClose="showClose">
    <!-- 顶部标题栏插槽 -->
    <slot name="header">
      <view class="popup-top-box flex align-center" v-if="showTitle">
        <text class="popup-top-box-title">{{ title }}</text>
        <view  @click.stop="closePopup">
          <uni-icons class="icon-close" type="closeempty"></uni-icons>
        </view>
      </view>
    </slot>
    <!-- 主要内容插槽 -->
    <slot name="content"></slot>
    <!-- 底部插槽 插槽有内容就优先自定义内容-->
    <slot name="footer">
      <view class="footer-box flex justify-center" v-if="isShowFooter">
        <view class="cancle-btn btn" @click.stop="closePopup">{{ cancelText }}</view>
        <view class="sure-btn btn" @click.stop="confirm">{{ confirmText }}</view>
      </view>
    </slot>
  </uni-popup>
</template>

<script>
export default {
  name: 'PublishPopup',
  props: {
    type: {
      type: String,
      default: 'bottom'
    },
    isMaskClick: {
      type: Boolean,
      default: true
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
    }
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    open() {
      this.$nextTick(() => {
        console.log(this.$refs)
        if (this.$refs.publishPopup) {
          this.$refs.publishPopup.open()
        }
      })
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
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
        this.$refs.publishPopup.close()
        this.resolve()
      }
      this.$emit('confirm')
    }
  }
}
</script>
<style scoped lang="scss">
.popup-top-box {
  color: #333333;
  font-size: toRpx(36);
  font-weight: 500;
  text-align: center;
  padding: toRpx(32);
  .popup-top-box-title {
    flex: 1;
  }
  .icon-close {
    text-align: end;
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
.footer-box {
  width: 100%;
  height: toRpx(164);
  background-color: #fff;
  position: absolute;
  border-radius: 0 0 toRpx(42) toRpx(42);
  bottom: 0;
  .btn {
    width: 40%;
    height: toRpx(80);
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
  }
  .sure-btn {
    color: #fff;
    background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    margin-left: toRpx(32);
  }
}
</style>
