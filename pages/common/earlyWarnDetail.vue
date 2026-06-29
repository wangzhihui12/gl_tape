<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">话术违规预警</view>
    </view>
    <view class="weekly-tips">
      <scroll-view scroll-y class="outstanding-tip-list">
        <view class="outstanding-tip-item">
          <view class="tip-header">
            <view class="tip-time">{{ warningInfo.time }}</view>
            <view class="tip-tags">{{ warningInfo.warningTag }}</view>
          </view>
          <view class="tip-content warning-content">{{ warningInfo.warningContent }}
            <view class="tips">你在以上的接待记录中，存在过度承诺现象，这极易引发客户纠纷，损害公司信誉。请严格依据公司政策与产品实际情况介绍，切勿做出无法兑现的承诺。因本次违规已扣除本月行为类-行为异常积分，后续将加强监管，违规者将严肃处理。
              当购车者车辆出现问题，依据商家“任何小毛病都免费修”的承诺前往维修，却发现不在质保范围内需自费维修时，会产生经济上的落差与困扰。这不仅增加维修成本，还可能因与商家的售后纠纷，耗费大量时间与精力去沟通协调。</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'EarlyWarnDetail',
  data() {
    return {
      warningInfo: {}
    }
  },
  onLoad(options) {
    const { row } = options
    const _row = JSON.parse(row)
    this.warningInfo = _row
    this.updateStatus()
  },
  methods: {
    // 返回
    back() {
      uni.$emit('pageList', this.warningInfo.id);
      uni.navigateBack({
        delta: 1,
        animationType: 'pop-out',
        animationDuration: 100
      })
    },
    async updateStatus() {
      const idList = [this.warningInfo.id]
      const res = await uni.$api.commonApi.updateMessageStatus({
        idList
      })
    }
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
    padding: toRpx(24) 0;
  }

  .outstanding-tip-item {
    width: 100%;
    padding: 0 toRpx(32);
    border-radius: toRpx(16);
    background-color: #fff;
    height: 100%;
    .tip-header {
      display: flex;
      align-items: center;

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
      color: #333;
      font-size: toRpx(28);
      line-height: toRpx(48);
      &.warning-content {
        white-space: pre-line;
      }
      .tips {
        color: #666;
        margin-top: toRpx(16);
      }
    }
  }
}
</style>