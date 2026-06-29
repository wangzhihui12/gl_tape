<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-08 11:30:30
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-01 13:33:26
-->
<template>
  <view class="point-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="month-box">
        <view class="month-tabs">
          <view class="tab-prev" v-if="month <= currentMonth && month > 1" @click="prevTab">
            <view class="tab-icon">
              <uni-icons type="left" size="16"></uni-icons>
            </view>
          </view>
          <view class="tab-mid">{{ month == currentMonth ? '本' : (month + '').padStart(2, '0') }}月</view>
          <view class="tab-next" v-if="month != currentMonth" @click="nextTab">
            <view class="tab-icon">
              <uni-icons type="right" size="16"></uni-icons>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="point-body">
      <view class="body-top">
        <image v-if="statistics.levelCode" :src="levelImg[statistics.levelCode - 1]" class="level-image" />
        <view class="sprite-icon icon-day-points" v-else></view>
        <view class="level-desc">
          <view class="level-name">{{ month == currentMonth ? '本' : (month + '').padStart(2, '0') }}月积分{{ statistics.levelName ? `：${statistics.levelName}` : '' }}</view>
          <view class="level-num">第 {{ statistics.ranking }} 名</view>
        </view>
        <view class="level-score">{{ statistics.pointValue }}</view>
      </view>
      <view class="point-detail">
        <view class="point-item" v-for="(item, index) in pointList" :key="index">
          <view class="item-header" v-if="item">
            <view class="point-class" v-if="item.pointClassificationName">{{ item.pointClassificationName }}</view>
            <view class="class-score">{{ item.score }}积分</view>
          </view>
          <view class="desc-wrap" v-if="item && item.list && item.list.length">
            <view class="item-body" v-for="(l, i) in item.list" :key="i">
              <view class="item-left">
                <view class="item-title">{{ l.pointTypeName }}</view>
                <view class="item-time">{{ l.createdDate }}</view>
              </view>
              <view class="item-num">{{ l.pointValue > 0 ? '+' + l.pointValue : l.pointValue }}</view>
            </view>
          </view>
          <view class="empty-box" v-else>
            <image :src="require('@/assets/images/boutique/nothing.webp')" mode="heightFix" />
            <view class="empty-text">暂无积分记录</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import point from '@/mixin/point'
import utils from '@/utils/utils'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, pointTrack],
  data() {
    return {
      pageName: '本月积分',
      eventCode: 'app_point_month',
      pointClassification: ['C001', 'C003', 'C002'],
      pointClassName: ['培训类', '行为类', '学习类'],
      statistics: {},
      levelImg: [require('@/assets/images/point/bronze.png'), require('@/assets/images/point/silver.png'), require('@/assets/images/point/gold.png'), require('@/assets/images/point/masonry.png')],
      detail: [],
      currentIndex: 0,
      pointList: []
    }
  },
  mounted() {},
  methods: {
    getDetail(countDate) {
      uni.$api.pointApi.getPoint({ countDate }).then(res => {
        this.statistics = res || {}
      })
      for (let i = 0; i < this.pointClassification.length; i++) {
        this.getList(countDate, i)
      }
    },
    getList(countDate, i) {
      uni.$api.pointApi.pointRecordList({ countDate, pointClassification: this.pointClassification[i] }).then(res => {
        const pointClassificationName = this.pointClassName[i]
        const score = res.reduce((a, b) => {
          console.log(a, b.pointValue, utils.calcAdd(a, b.pointValue))
          return utils.calcAdd(a, b.pointValue)
        }, 0)
        console.log(score)
        this.$set(this.pointList, i, { list: res, pointClassificationName, score })
      })
    },
    updateDetail(countDate) {
      this.getDetail(countDate)
    }
  }
}
</script>
<style scoped lang="scss">
.point-box {
  position: relative;
}
.nav-bar {
  width: 100%;
  height: 96rpx;
  margin-top: 48rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }
  .month-box {
    flex: 1;
    .month-tabs {
      display: flex;
      justify-content: center;
      align-items: center;
      .tab-mid {
        font-size: 32rpx;
        color: #1a1a1a;
        margin: 0 120rpx;
      }
    }
    .tab-prev,
    .tab-next {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48rpx;
      border-radius: 50%;
      height: 48rpx;
      background: #ffffff;
      .tab-icon {
        margin-left: -4rpx;
        margin-top: 4rpx;
      }
    }
    .tab-next {
      .tab-icon {
        margin-left: 2rpx;
      }
    }
  }
}
.point-body {
  background-image: linear-gradient(180deg, #ffffff59 0%, #ffffff00 100%);
  border-radius: 32rpx;
  width: calc(100vw - 128rpx);
  margin: 0 64rpx;
  height: calc(100vh - 100rpx);
  .body-top {
    display: flex;
    align-items: center;
    margin-left: 80rpx;
    height: 162rpx;
    .level-image {
      width: 136rpx;
      height: 162.6rpx;
    }
    .level-desc {
      margin-left: 40rpx;
      .level-name {
        font-size: 36rpx;
        color: #1a1a1a;
        line-height: 60rpx;
        font-weight: 700;
      }
      .level-num {
        font-size: 24rpx;
        color: #808291;
      }
    }
    .level-score {
      font-weight: 700;
      font-size: 80rpx;
      color: #4673ff;
      margin-left: 64rpx;
    }
  }
  .point-detail {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 68rpx;
    margin: 32rpx;
    .point-item {
      background: #ffffff73;
      box-shadow: inset 0 0 16rpx 0 #ffffff;
      border-radius: 32rpx;
      height: calc(100vh - 420rpx);
      overflow: hidden;
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height: 56rpx;
        margin-bottom: 26rpx;
        background: rgba($color: #fff, $alpha: 0.6);
        padding: 24rpx 48rpx;
        .point-class {
          font-size: 36rpx;
          color: #1a1a1a;
        }
        .class-score {
          font-size: 32rpx;
          color: #181a1f;
        }
      }
      .desc-wrap {
        height: calc(100% - 152rpx);
        overflow-y: auto;
        padding: 0 48rpx;
      }
      .empty-box {
        text-align: center;
        margin-top: 160rpx;
        image {
          height: 224rpx;
        }
        .empty-text {
          font-size: 28rpx;
          color: #808291;
          line-height: 40rpx;
          text-align: center;
        }
      }
      .item-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2rpx solid #edf3ff;
        padding: 20rpx 0;
        .item-left {
          .item-title {
            font-size: 26rpx;
            line-height: 40rpx;
            color: #181a1f;
          }
          .item-time {
            font-size: 24rpx;
            color: #808291;
            line-height: 40rpx;
          }
        }
        .item-num {
          font-size: 32rpx;
          color: #181a1f;
        }
      }
    }
  }
}
</style>
