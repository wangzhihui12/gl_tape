<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-08 11:30:30
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-08 15:14:37
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
      <view class="point-detail">
        <view class="point-item" v-for="(item, index) in pointList" :key="index">
          <view class="item-header">
            <image :src="item.src" />
          </view>
          <view class="item-body" :style="item.style">
            <view class="item-logo" v-if="item.ranking > 3">{{ item.ranking }}</view>
            <view class="item-image" v-else>
              <image :src="require(`@/assets/images/point/${index == 0 ? 'crown_' : 'prize_'}${item.ranking || 1}.png`)" />
            </view>
            <view class="item-name">{{ item.staffName }}</view>
            <view v-if="item.badgeList && item.badgeList.length" :class="{ 'item-prize': index == 0, 'item-medal': index != 0 }">
              <image :src="index == 0 ? pointImg[item.badgeList[0].growthType - 1] : starImg[index - 1]" />
            </view>
            <view class="item-num">{{ item.pointValue }}</view>
          </view>
          <view class="desc-wrap">
            <view class="item-body" v-for="(l, i) in item.list" :key="i">
              <view class="item-logo" v-if="l.ranking > 3">{{ l.ranking }}</view>
              <view class="item-image" v-else>
                <image :src="require(`@/assets/images/point/${index == 0 ? 'crown_' : 'prize_'}${l.ranking || 0}.png`)" />
              </view>
              <view class="item-name">{{ l.staffName }}</view>
              <view v-if="l.badgeList && l.badgeList.length" :class="{ 'item-prize': index == 0, 'item-medal': index != 0 }">
                <image :src="index == 0 ? pointImg[l.badgeList[0].growthType - 1] : starImg[index - 1]" />
              </view>
              <view class="item-num">{{ l.pointValue }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
const POINT_LIST = [
  {
    id: 0,
    title: '积分排行',
    src: require('@/assets/images/point/point_bg.png'),
    style: 'background: #fef2cb99;',
    isCrown: true
  },
  {
    id: 1,
    title: '学习之星',
    src: require('@/assets/images/point/study_bg.png'),
    style: 'background-image: linear-gradient(270deg, #c2d8fc59 0%, #d1e9ff59 100%);'
  },
  {
    id: 2,
    title: '全勤之星',
    src: require('@/assets/images/point/diligent_bg.webp'),
    style: 'background-image: linear-gradient(270deg, #c2d8fc59 0%, #d1e9ff59 100%);'
  },
  {
    id: 3,
    title: '平板接待精英',
    src: require('@/assets/images/point/ipad_bg.png'),
    style: 'background-image: linear-gradient(270deg, #c2d8fc59 0%, #d1e9ff59 100%);'
  }
]
import point from '@/mixin/point'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, pointTrack],
  data() {
    return {
      pageName: '本月排名',
      eventCode: 'app_point_rank',
      selectItem: {},
      detail: [],
      currentIndex: 0,
      pointImg: [require('@/assets/images/point/bronze_ranking.png'), require('@/assets/images/point/silver_ranking.png'), require('@/assets/images/point/masonry_ranking.png')],
      starImg: [require('@/assets/images/point/study_star.png'), require('@/assets/images/point/time_star.png'), require('@/assets/images/point/elite_star.png')],
      pointList: []
    }
  },
  props: {
    transfer: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    getLevelConfig(countDate) {
      let i = 0
      this.pointList = []
      POINT_LIST.forEach(item => {
        if (item.title == '积分排行') {
          this.pointList.push(item)
          this.getList(countDate, item.id, i)
          i++
        } else if (this.transfer.levelConfig.find(i => i.levelName == item.title)) {
          this.pointList.push(item)
          this.getList(countDate, item.id, i)
          i++
        }
      })
    },
    getDetail(countDate) {
      this.getLevelConfig(countDate)
    },
    updateDetail(countDate) {
      this.getDetail(countDate)
    },
    getList(countDate, rankingType, index) {
      const params = {
        countDate
      }
      if (rankingType != 0) params.rankingType = rankingType
      uni.$api.pointApi.pointMonthRanking(params).then(res => {
        const userInfo = uni.$storage.get('userInfo')
        let myInfo = res.find(i => i.staffPhone == userInfo.phone)
        this.$set(this.pointList, index, { ...this.pointList[index], list: res, ...myInfo })
      })
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
  border-radius: 32rpx;
  width: calc(100vw - 128rpx);
  margin: 0 64rpx;
  height: calc(100vh - 100rpx);

  .body-top {
    display: flex;
    align-items: center;
    margin-left: 80rpx;

    .level-image {
      width: 120rpx;
      height: 120rpx;
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
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    overflow-x: auto;
    gap: 48rpx;

    .point-item {
      width: 688rpx;
      background: #ffffff73;
      box-shadow: inset 0 0 16rpx 0 #ffffff;
      border-radius: 32rpx;
      height: calc(100vh - 200rpx);

      .item-header {
        image {
          width: 688rpx;
          height: 128rpx;
        }
      }

      .item-body {
        height: 128rpx;
        border-radius: 24rpx;
        margin: 0 24rpx;
        display: flex;
        align-items: center;
        padding: 0 32rpx;

        .item-logo {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          background: #ffffff;
          border: 2rpx solid #ffffff;
          line-height: 76rpx;
          font-size: 34rpx;
          color: #a0a1ad;
          text-align: center;
          box-sizing: border-box;
        }

        .item-image {
          width: 80rpx;
          box-sizing: border-box;
          height: 80rpx;
          border-radius: 50%;
          background: #ffffff;
          border: 2rpx solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;

          image {
            width: 56rpx;
            height: 56rpx;
          }
        }

        .item-name {
          font-size: 30rpx;
          color: #181a1f;
          margin-left: 20rpx;
        }

        .item-prize {
          flex: 1;
          text-align: right;
          margin-right: 48rpx;

          image {
            width: 148rpx;
            height: 56rpx;
          }
        }

        .item-medal {
          margin-left: 16rpx;

          image {
            width: 48rpx;
            height: 48rpx;
          }
        }

        .item-num {
          font-size: 32rpx;
          color: #181a1f;
          margin-left: auto;
        }
      }

      .desc-wrap {
        height: calc(100% - 292rpx);
        overflow-y: auto;
      }
    }
  }
}
</style>
