<template>
  <uni-popup
    ref="centerPopupRef"
    type="center"
    :is-mask-click="false"
    animation
    class="center-popup"
  >
    <view :class="['box',{line:isLine}]">
      <view class="title flex">
        <view class="text">{{title}}</view>
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
        <template v-for="(i,index) in list">
          <view
            class="item flex"
            :key="index"
            @click="choose(index)"
          >
            <template v-if="tag && i.id == id">
              <view class="tag flex">{{tag}}</view>
            </template>
            <view
              :class="['sprite-icon',i.icon]"
              :style="{zoom: i.zoom || 1}"
            ></view>
            <view class="item-text">
              <view class="item-title">{{i.title}}</view>
              <text class="item-describe">{{i.describe}}</text>
            </view>
          </view>
        </template>

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
  width: toRpx(1400);
  // height: toRpx(928);
  max-height: 80vh;
  min-height: 32vh;
  background: #ffffff;
  border-radius: toRpx(48);
  .title {
    width: 100%;
    height: toRpx(160);
    background: url('@/assets/images/boutique/customer-type-bg.webp') no-repeat;
    background-size: 100% 100%;
    position: relative;
    .text {
      font-weight: 500;
      font-size: toRpx(40);
      color: #1a1a1a;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .icon-close-box {
      height: 100%;
      margin-left: auto;
      padding: 0 toRpx(48);
      font-weight: 700;
    }
  }
  .content {
    padding: toRpx(16) toRpx(80) toRpx(72);
    width: 100%;
    height: toRpx(768);
    // height: calc(100% - #{toRpx(160)});
    gap: 0 toRpx(64);
    .item {
      width: calc(50% - #{toRpx(32)});
      height: 100%;
      
      background: #ffffff;
      box-shadow: 0 toRpx(12) toRpx(24) 0 #2c66f726;
      border-radius: toRpx(48);
      flex-direction: column;
      box-sizing: border-box;
      // padding-top: toRpx(92);
      justify-content: center;
      position: relative;
      overflow: hidden;
      &-text {
        text-align: center;
      }
      .tag {
        position: absolute;
        width: toRpx(192);
        height: toRpx(72);
        border-radius: 0 0 toRpx(48) 0;
        background: #4673ff1a;
        left: 0;
        top: 0;
        color: #4673ff;
        font-size: toRpx(28);
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
.line {
  height: auto;
  .content {
    flex-wrap: wrap;
    gap: 40rpx;
    padding: 16rpx 64rpx 64rpx;
    height: auto;
    .item {
      width: 100%;
      flex-direction: row;
      height: 192rpx;
      justify-content: flex-start;
      border-radius: 24rpx;
      .tag {
        right: 0;
        left: inherit;
        border-radius: 0 0 0 32rpx;
      }
      &-text {
        text-align: left;
      }
      &-title {
        font-size: 36rpx;
        text-align: left;
        padding: 0 0 12rpx 0;
      }
      &-describe {
        font-size: 28rpx;
        color: #999ea8;
      }
      .sprite-icon {
        margin: 0 32rpx 0 40rpx;
      }
    }
  }
}
</style>