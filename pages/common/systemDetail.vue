<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">{{ systemInfo.title }}</view>
    </view>
    <view class="weekly-tips">
      <scroll-view scroll-y class="outstanding-tip-list">
        <view class="outstanding-tip-item">
          <view class="tip-header">
            <view class="tip-rank">{{ systemInfo.subtitle || '' }}</view>
            <view class="tip-time">{{ systemInfo.time }}</view>
          </view>
          <view class="tip-content">
            <rich-text :nodes="systemInfo.content"></rich-text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script>
import systemTrack from '../../mixin/systemTrack';
export default {
  name: 'SystemDetial',
  data() {
    return {
      classCountList: [],
      countFlag: false,
      systemInfo: {},
      type: 'view',
      content: '<p><img src=\"https://qcimg01.glsx.com.cn/group1/M00/0A/6B/wKgD3mfuUHiAIvUfAAKVSmxdFVE298.jpg\" style=\"max-width:100%;\" contenteditable=\"false\"/></p>'
    }
  },
  mixins: [systemTrack],
  methods: {
    // 返回
    back() {
      // this.showPage('MessageList')
      uni.$emit('pageBack');
      uni.navigateBack({
        delta: 1,
        animationType: 'pop-out',
        animationDuration: 100
      })
    },
  }
}
</script>

<style scoped lang="scss">
.detail-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  box-sizing: border-box;
  padding-top: toRpx(160);
}

.nav-bar {
  position: fixed;
  width: 100%;
  height: toRpx(96);
  left: 0;
  top: toRpx(48);
  z-index: 999;
  pointer-events: none;

  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .title {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 700;
    font-size: toRpx(32);
    color: #1a1a1a;
  }
}

.weekly-tips {
  position: relative;
  margin: 0 toRpx(64) toRpx(80);
  background-color: rgba(255, 255, 255, 0.35);
  border: toRpx(4) solid #fff;
  border-radius: toRpx(16);
  height: calc(100% - #{toRpx(80)});

  .outstanding-tip-list {
    height: 100%;
    background-color: #fff;
    border-radius: toRpx(16);
  }

  .outstanding-tip-item {
    width: 100%;
    padding: toRpx(24) toRpx(32);
    border-radius: toRpx(16);
    background-color: #fff;
    height: 100%;
    .tip-header {
      // display: flex;
      // align-items: center;

      .tip-rank {
        color: #333;
        font-size: toRpx(32);
        font-weight: 500;
        line-height: toRpx(44);
        margin-right: toRpx(24);
      }

      .tip-time {
        color: rgba(102, 102, 102, 0.6);
        font-size: toRpx(28);
        line-height: toRpx(44);
      }

      .tip-tags {
        border-radius: toRpx(4);
        background: rgba(255, 157, 10, 0.1);
        padding: toRpx(8) toRpx(24);
        color: #ff9d0a;
        font-size: toRpx(24);
        font-weight: 500;
        margin-left: toRpx(24);
      }
    }

    .tip-content {
      padding: toRpx(17) 0;
      color: #666;
      font-size: toRpx(28);
      line-height: toRpx(48);
    }
  }
}
</style>