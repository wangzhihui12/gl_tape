<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-08 11:30:30
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-01 13:36:41
-->
<template>
  <view class="point-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view v-if="isHigh" class="title"><text>兑换券介绍</text></view>
      <view class="month-box" v-else>
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
      <view class="level-box">
        <view class="level-logo">
          <view class="sprite-icon icon-medal"></view>
          <view class="level-title">成长勋章</view>
        </view>
        <view class="level-desc">
          <view class="level-item" :style="badgeList.includes(item.medalType) || isHigh ? item.style : ''" v-for="(item, index) in couponList" :key="index">
            <view class="star-logo"><image :src="badgeList.includes(item.medalType) || isHigh ? item.logo : item.logo_grey"></image></view>
            <view :class="{ 'star-name': true, grey: !badgeList.includes(item.medalType) && !isHigh }">{{ item.levelName }}</view>
            <view :class="{ 'star-desc': true, grey: !badgeList.includes(item.medalType) && !isHigh }">{{ item.levelDesc }}</view>
            <view class="star-coupon" v-if="item.couponName">
              <view class="coupon-box">
                <image :src="require('@/assets/images/point/coupon_bg.png')" v-if="badgeList.includes(item.medalType) || isHigh"></image>
                <image :src="require('@/assets/images/point/coupon_grey.png')" v-else></image>
                <view :class="{ 'coupon-title': true, grey: !badgeList.includes(item.medalType) && !isHigh }">{{ item.couponName }}</view>
                <view :class="{ 'coupon-num': true, grey: !badgeList.includes(item.medalType) && !isHigh }">{{ item.couponCount }}张</view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="level-box">
        <view class="level-logo">
          <view class="sprite-icon icon-level"></view>
          <view class="level-title">积分奖励</view>
        </view>
        <view class="table-box">
          <table class="score-table">
            <tr class="th">
              <th v-for="(item, index) in tabelTh" :key="index" :style="{ width: item.width + 'vw' }">{{ item.title }}</th>
            </tr>
            <tr class="tr">
              <td v-for="(item, index) in tabelTr" :key="index">
                <!-- <ul v-if="item.list">
                    <li v-for="(l, i) in item.list">{{ l }}</li>
                  </ul> -->
                <view v-html="getHtml(item.content || item.otherRewards)"></view>
              </td>
            </tr>
          </table>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
const GROUP_LIST = [
  { title: '学习之星', style: 'background: #FFFAED;', medalType: 1, logo: require('@/assets/images/point/study_star.png'), logo_grey: require('@/assets/images/point/study_grey.png'), content: '月度学习类积分排名前10名' },
  { title: '全勤之星', style: 'background: #FFFAED;', medalType: 2, logo: require('@/assets/images/point/time_star.png'), logo_grey: require('@/assets/images/point/time_grey.png'), content: '当月全勤准时打卡，不包含请假特批' },
  { title: '平板接待精英', style: 'background: #FFFAED;', medalType: 3, logo: require('@/assets/images/point/elite_star.png'), logo_grey: require('@/assets/images/point/elite_grey.png'), content: '平板接待月度无扣分记录' }
]
import point from '@/mixin/point'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, pointTrack],
  data() {
    return {
      pageName: '成长勋章',
      eventCode: 'app_point_level',
      selectItem: {},
      detail: [],
      isHigh: false,
      currentIndex: 0,
      levelIndex: 100,
      groupList: [],
      couponList: [],
      badgeList: [],
      tabelTh: [{ title: '积分区间', width: 8 }],
      tabelTr: [{ content: '奖惩规则（每月）' }]
    }
  },
  props: {
    transfer: {
      type: Object,
      default: () => {}
    }
  },
  mounted() {
    const { isHigh } = this.transfer || {}
    this.isHigh = isHigh
    console.log(this.transfer)
    this.getLevelConfig()
  },
  methods: {
    getLevelConfig() {
      GROUP_LIST.forEach(item => {
        if (this.transfer.levelConfig.find(i => i.levelName == item.title)) {
          this.groupList.push(item)
        }
      })
    },
    getHtml(val) {
      if (val) return val.replace(/\n/g, '<br/>')
    },
    getDetail(countDate) {
      this.getRule(1)
      this.getRule(2)
      this.getBadgeList(countDate)
      this.getCouponList(countDate)
    },
    getCouponList(date) {
      let [year, month] = date.split('-')
      month = month.padStart(2, '0')
      const countDate = `${year}-${month}`
      uni.$api.pointApi.getPoint({ countDate }).then(res => {
        const badgeList = res.badgeList || []
        this.couponList = this.groupList.map(item => {
          const findData = badgeList.find(i => i.medalType == item.medalType)
          return { ...item, ...findData }
        })
      })
    },
    getBadgeList(countDate) {
      uni.$api.pointApi.badgeList({ countDate }).then(res => {
        this.badgeList = res.map(item => item.medalType)
      })
    },
    getRule(levelType) {
      uni.$api.pointApi.rewardRule({ levelType }).then(res => {
        if (levelType == 2) {
          this.groupList = this.groupList.map(item => {
            const findData = res.find(i => i.medalType == item.medalType)
            return { ...item, ...findData }
          })
        }
        if (levelType == 1) {
          const th = res.map(item => {
            return { title: item.levelName, width: Math.floor(93 / res.length) }
          })
          this.tabelTh = [...this.tabelTh, ...th]
          this.tabelTr = [...this.tabelTr, ...res]
        }
      })
    },
    updateDetail(countDate) {
      this.getBadgeList(countDate)
      this.getCouponList(countDate)
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
  height: toRpx(96);
  margin-top: toRpx(48);
  margin-bottom: toRpx(12);
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
  .title {
    font-weight: 700;
    font-size: toRpx(32);
    color: #1a1a1a;
    flex: 1;
    text-align: center;
    text {
      margin-left: -96rpx;
    }
  }
  .month-box {
    flex: 1;
    .month-tabs {
      display: flex;
      justify-content: center;
      align-items: center;
      .tab-mid {
        font-size: toRpx(32);
        color: #1a1a1a;
        margin: 0 toRpx(120);
      }
    }
    .tab-prev,
    .tab-next {
      display: flex;
      align-items: center;
      justify-content: center;
      width: toRpx(48);
      border-radius: 50%;
      height: toRpx(48);
      background: #ffffff;
    }
  }
}
.point-body {
  padding: 0 toRpx(64);
  margin-top: toRpx(30);
  .table-box {
    height: 100%;
    background: #ffffffe6;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    border-radius: toRpx(40);
    margin-left: toRpx(32);
    width: calc(100vw - #{toRpx(200)});
    padding: toRpx(56) toRpx(48);
  }
  .score-table {
    border-collapse: separate;
    /* 防止边框合并 */
    border-spacing: 0;
    border: none;
    .th {
      position: sticky;
      top: 0;
    }
    /* 单元格之间没有间距 */
    tr {
      border: none;
      text-align: center;
      &.line {
        td {
          border-top: 16rpx solid rgba($color: #fff, $alpha: 0.9);
        }
      }
      th {
        border: 4rpx solid #fff;
        /* 所有单元格都有边框 */
        padding: 8px;
        border-top: none;
        /* 除了首行外，所有行的上方无边框 */
        background: #edf2ff;
        height: 88rpx;
        font-size: 26rpx;
        color: #333333;
        &:first-child {
          border-left: none;
          border-radius: 16rpx 0 0 16rpx;
        }
        &:last-child {
          border-radius: 0 16rpx 16rpx 0;
        }
      }
      td {
        border: 4rpx solid #fff;
        /* 所有单元格都有边框 */
        border-top: none;
        /* 除了首行外，所有行的上方无边框 */
        background: #f7f8fa;
        height: 88rpx;
        font-size: 26rpx;
        color: #333333;
        text-align: left;
        padding: 20rpx 40rpx;
        text {
          color: #c8c8cc;
        }
        ul {
          width: 100%;
          padding: 0;
          li {
            list-style: none; /* 移除默认的列表样式 */
            font-size: 26rpx;
            color: #333333;
            line-height: 46rpx;
            &::before {
              content: '•'; /* 使用Unicode字符作为点 */
              color: #a2a2a8; /* 设置点的颜色 */
              margin-right: 12rpx; /* 设置点与文字的间距 */
            }
          }
        }
        &.line {
          border-bottom: 16rpx solid #fff;
        }
        &:first-child {
          border-left: none;
        }
        &:last-child {
          border-right: none;
        }
      }
    }
  }
  .level-box {
    height: calc(50vh - #{toRpx(136)});
    display: flex;
    &:first-child {
      margin-bottom: toRpx(48);
    }
    .level-logo {
      .sprite-icon {
        transform: scale(0.8);
      }
      .level-title {
        font-weight: 600;
        font-size: toRpx(36);
        color: #333333;
        letter-spacing: 0;
        line-height: toRpx(44);
        width: toRpx(64);
        text-align: center;
        margin-top: toRpx(16);
      }
    }
    .level-desc {
      height: 100%;
      background: #ffffffe6;
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(40);
      margin-left: toRpx(32);
      width: calc(100vw - #{toRpx(200)});
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: toRpx(64);
      padding: toRpx(56) toRpx(48);
      .level-item {
        background: #f7f7f7;
        border-radius: toRpx(36);
        position: relative;
        .my-level {
          position: absolute;
          width: toRpx(154);
          height: toRpx(56);
          top: -4rpx;
          left: -4rpx;
        }
        .item-name {
          font-size: toRpx(40);
          color: #a2a2a8;
          position: absolute;
          left: toRpx(32);
          top: toRpx(80);
          font-weight: 600;
        }
        .star-logo {
          margin-top: toRpx(44);
          text-align: center;
          image {
            width: toRpx(168);
            height: toRpx(168);
          }
        }
        .star-coupon {
          position: absolute;
          bottom: toRpx(38);
          left: toRpx(0);
          display: flex;
          justify-content: center;
          width: 100%;
          .coupon-box {
            width: toRpx(504);
            height: toRpx(112);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 toRpx(32);
            z-index: 0;
            image {
              position: absolute;
              left: 0;
              top: 0;
              width: toRpx(504);
              height: toRpx(112);
              z-index: -1;
            }
            .coupon-title {
              font-size: toRpx(28);
              color: #5c3537;
              width: toRpx(260);
              &.grey {
                color: #fdfdff;
              }
            }
            .coupon-num {
              font-size: toRpx(28);
              color: #db832c;
              &.grey {
                color: #fdfdff;
              }
            }
          }
        }
        .star-name {
          text-align: center;
          font-size: toRpx(40);
          line-height: toRpx(60);
          margin-top: toRpx(4);
          color: #292d33;
          font-weight: 600;
          &.grey {
            color: #a2a2a8;
          }
        }
        .star-desc {
          font-size: toRpx(24);
          color: #181a1f;
          text-align: center;
          height: toRpx(60);
          margin-top: toRpx(12);
          &.grey {
            color: #a2a2a8;
          }
        }
        .item-logo {
          position: absolute;
          top: toRpx(0);
          right: toRpx(32);
          image {
            width: toRpx(184);
          }
        }
        .item-desc {
          padding-left: toRpx(40);
          font-size: toRpx(24);
          &.grey {
            color: #a2a2a8;
          }
        }
        .item-footer {
          position: absolute;
          left: 0;
          bottom: toRpx(26);
          width: 100%;
        }
        .item-detail {
          width: calc(100% - #{toRpx(48)});
          box-sizing: border-box;
          border-radius: toRpx(16);
          max-height: calc(100% - #{toRpx(320)});
          overflow-y: auto;
          margin: toRpx(16) toRpx(24);
          padding: toRpx(12) toRpx(0);
          color: #a2a2a8;
          .item-coupon {
            position: relative;
            font-size: toRpx(24);
            line-height: toRpx(36);
            margin-left: -20rpx;
          }
        }
      }
    }
  }
}
</style>
