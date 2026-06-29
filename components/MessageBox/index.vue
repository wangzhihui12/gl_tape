<template>
  <uni-popup
    ref="tips"
    :type="position"
    :is-mask-click="false"
    :animation="animation"
  >
    <view
      class="tips-wrapper"
      :style="{ width: popupW + 'rpx', minHeight: popupH + 'rpx',maxHeight: maxHeight + 'rpx' }"
    >
      <view class="tips-content">
        <view
          class="icon-close-box flex"
          @click="close"
        >
          <uni-icons
            class="icon-close"
            type="closeempty"
            :size="18"
            color="#1A1A1A"
          ></uni-icons>
        </view>
        <view class="tips-title">
          <template v-if="back">
            <view
              class="sprite-icon icon-back"
              @click="close"
            ></view>
          </template>
          {{ title }}
        </view>
        <text
          class="tips-text"
          v-if="content"
        >{{ content }}</text>
        <slot></slot>
      </view>
      <view
        class="tips-footer"
        v-if="isFooter"
      >
        <view
          v-if="showCancelBtn"
          class="tips-btn close"
          @click="cancel()"
        >{{
          cancelBtnText
        }}</view>
        <view
          class="tips-btn preview"
          @click="confirm()"
        >{{
          confirmBtnText
        }}</view>
      </view>
      <template v-else>
        <slot name="footer"></slot>
      </template>
    </view>
  </uni-popup>
</template>
<script>
export default {
  name: "MessageBox",
  data () {
    return {};
  },
  props: {
    animation: {
      type: Boolean,
      default: true
    },
    isAutoClose: {
      type: Boolean,
      default: true,
    },
    position: {
      type: String,
      default: "center",
    },
    popupW: {
      type: Number,
    },
    popupH: {
      type: Number,
      default: 372,
    },
    isFooter: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "提示",
    },
    content: {
      type: String,
      default: "",
    },
    confirmBtnText: {
      type: String,
      default: "确定",
    },
    cancelBtnText: {
      type: String,
      default: "取消",
    },
    maxHeight: Number,
    back: Boolean,
    showCancelBtn: {
      type: Boolean,
      default: true,
    }
  },
  methods: {
    close () {
      this.$refs.tips.close();
      this.$emit("close");
    },
    open () {
      this.$refs.tips.open();
    },
    cancel () {
      if (this.isAutoClose) this.$refs.tips.close();
      this.$emit("cancel");
    },
    confirm () {
      if (this.isAutoClose) this.$refs.tips.close();
      this.$emit("confirm");
    },
  },
};
</script>
<style scoped lang="scss">
.tips-wrapper {
  background: #ffffff;
  border-radius: toRpx(20);
  height: 100%;
  .tips-content {
    padding: toRpx(48);
    box-sizing: border-box;
    height: calc(100% - #{toRpx(100)});
    position: relative;
    .icon-close-box {
      position: absolute;
      right: 0;
      top: 0;
      width: toRpx(120);
      height: toRpx(120);
      justify-content: center;
      z-index: 2;
    }
    .tips-title {
      position: relative;
      width: 100%;
      font-weight: 500;
      font-size: toRpx(36);
      color: #292d33;
      text-align: center;
      .icon-back {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
  .tips-text {
    display: block;
    font-size: toRpx(30);
    color: #5a5e66;
    letter-spacing: toRpx(1);
    text-align: center;
    line-height: toRpx(40);
    margin-top: toRpx(48);
  }
  .tips-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: toRpx(100);
    border-top: 1px solid #e8e8e8;

    .close {
      color: #6c6c70;
    }
    .preview {
      color: #2c66f7;
    }
  }
  .tips-btn {
    width: 50%;
    text-align: center;
    font-size: toRpx(32);
    text-align: center;
    line-height: toRpx(44);
    font-weight: 500;
  }
}
</style>
