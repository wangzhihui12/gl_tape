<template>
  <uni-popup
    ref="coursePopupRef"
    type="center"
    :is-mask-click="false"
    animation
    class="center-popup"
  >
    <view :class="['box', popType]">
      <view class="title flex">
        <view :class="['sprite-icon', `icon-defeat-${popType}`]"></view>
        <view class="text">{{title}}</view>
        <view
          class="icon-close-box flex"
          @click="close"
        >
          <uni-icons
            class="icon-close"
            type="closeempty"
            :size="16"
            color="#1A1A1A"
          ></uni-icons>
        </view>
      </view>
      <view class="content">
        <slot name="content"></slot>
      </view>
    </view>
  </uni-popup>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'CenterPopup',
  props: {
    title: String,
    popType: String,
  },
  data () {
    return {

    }
  },
  mounted () {
  },
  methods: {
    open () {
      this.$refs.coursePopupRef.open();
    },
    close () {
      this.$refs.coursePopupRef.close();
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
  width: toRpx(1456);
  height: toRpx(840);
  background: #ffffff;
  border-radius: toRpx(48);
  &.summary {
    width: toRpx(848);
    height: toRpx(400);
  }
  .title {
    width: 100%;
    height: toRpx(128);
    padding-left: toRpx(48);
    background: linear-gradient(180deg, #e6f0ff 0%, #e6f0ff00 100%);
    position: relative;
    border-radius: toRpx(48) toRpx(48) 0 0;
    .text {
      font-weight: 500;
      font-size: toRpx(40);
      color: #1a1a1a;
      margin-left: toRpx(24);
      // position: absolute;
      // left: 50%;
      // top: 50%;
      // transform: translate(-50%, -50%);
    }
    .icon-close-box {
      height: 100%;
      margin-left: auto;
      padding: 0 toRpx(48);
    }
  }
  .content {
    padding: toRpx(16) toRpx(80) toRpx(72);
    width: 100%;
    height: calc(100% - #{toRpx(160)});
    gap: 0 toRpx(64);
    .item {
      width: calc(50% - #{toRpx(32)});
      height: 100%;
      background: #ffffff;
      box-shadow: 0 toRpx(12) toRpx(24) 0 #2c66f726;
      border-radius: toRpx(48);
      flex-direction: column;
      box-sizing: border-box;
      padding-top: toRpx(92);
      position: relative;
      overflow: hidden;
      .tag {
        position: absolute;
        width: 192rpx;
        height: 72rpx;
        border-radius: 0 0 toRpx(48) 0;
        background: #4673ff1a;
        left: 0;
        top: 0;
        color: #4673ff;
        font-size: 28rpx;
        justify-content: center;
      }
      &-title {
        font-weight: 500;
        font-size: toRpx(40);
        color: #1a1a1a;
        padding: toRpx(32) 0 toRpx(16);
      }
      &-describe {
        font-size: toRpx(32);
        color: #808291;
        text-align: center;
      }
      &:first-child {
        &::before,
        &::after {
          background: #f7f5ff;
        }
      }
    }
  }
}
</style>