<template>
  <uni-popup
    ref="partsRef"
    type="center"
    :mask-click="false"
    border-radius="16px 16px 0 0"
  >
    <view class="pop-wrapper">
      <view class="screen-container">
        <image
          class="screen-image"
          :src="screenInfo.url"
        />
        <view class="feature-container">
          <view class="feature-title">{{screenInfo.title}}</view>
          <view class="feature-description">{{screenInfo.detail}}</view>
        </view>
      </view>
      <view class="notice-container">
        <view class="notice-title">注意事项：</view>{{screenInfo.tips}}
      </view>
    </view>
    <view class="sprite-icon icon-icon-close icon-close" @click="close"></view>
    <!-- <image
      @click="close"
      class="icon-close"
      src="https://img01.glsx.com.cn/weapp/resource/app-tape/media/guarantee/icon-close.webp"
    /> -->
  </uni-popup>
</template>
  
<script>
export default {
  name: 'PartsPop',
  props: {
    screenList: Array,
  },
  data() {
    return {
      screenInfo: {}
    }
  },
  methods: {
    show(name) {
      this.screenInfo = this.screenList.find(item => item.name === name)
      this.$refs.partsRef.open("center");
    },
    close() {
      this.$refs.partsRef.close();
      this.$emit('close')
    }
  }
}
</script>
<style scoped lang="scss">
.pop-wrapper {
  position: relative;
  background-color: #FFF;
  border-radius: toRpx(40);
  width: toRpx(1400);
  height: toRpx(928);
  .screen-container {
    width: 100%;
    height: toRpx(784);
    position: relative;
    .feature-container {
      position: absolute;
      bottom: toRpx(48);
      left: toRpx(64);
      color: #fff;
      .feature-title {
        font-weight: 500;
        font-size: toRpx(40);
        line-height: toRpx(56);
      }
      .feature-description {
        font-size: toRpx(28);
        margin-top: toRpx(8);
        color: rgba(255, 255, 255, 0.7);
        line-height: toRpx(40);
      }
    }
  }
  .screen-image {
    width: 100%;
    height: 100%;
  }
  .notice-container {
    display: flex;
    background-color: #fff;
    padding: toRpx(48) toRpx(68) toRpx(56);
    font-size: toRpx(26);
    color: #141414;
    border-radius: 0 0 toRpx(40) toRpx(40);
    line-height: toRpx(40);
    .notice-title {
      color: #666666;
    }
  }
}
.icon-close {
  position: absolute;
  top: toRpx(40);
  right: toRpx(16);
  // bottom: -140rpx;
  // left: 50%;
  transform: translateX(-50%);
}
</style>