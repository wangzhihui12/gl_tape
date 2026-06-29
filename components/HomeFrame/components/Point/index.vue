<template>
  <view class="point-container">
    <view class="point-box">
      <view class="point-left">
        <view class="point-body">
          <view class="point-month">
            <view class="month-box">
              <view class="month-up" @click="jump('Course')">
                <view class="sprite-icon icon-points"></view>
                <view class="month-text">本月积分</view>
                <uni-icons type="right"></uni-icons>
              </view>
              <view class="month-num" @click="jump('Course')">{{ pointDetail.pointValue }}</view>
              <view class="month-up" @click="jump('Ranking', levelConfig)">
                <view class="sprite-icon icon-ranking"></view>
                <view class="month-text">本月排名</view>
                <uni-icons type="right"></uni-icons>
              </view>
              <view class="month-num" @click="jump('Ranking')">
                <template v-if="pointDetail.ranking">
                  {{ pointDetail.ranking }}
                  <text>/{{ pointDetail.total }}</text>
                </template>
                <template v-else>-</template>
              </view>
            </view>
          </view>
          <view class="point-up">
            <view class="card-box medal-card" @click="jump('LevelMedal', levelConfig)">
              <view class="card-top">
                <view class="sprite-icon icon-medal"></view>
                <view class="card-title">成长勋章</view>
              </view>
              <view class="card-content star-box">
                <view :class="{ 'card-item': true, grey: !myStar.includes(index + 1) }" v-for="(item, index) in starList" :key="index">
                  <image :src="myStar.includes(item.medalType) ? item.logo : item.logo_grey" />
                  <view class="card-text">{{ item.title }}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="card-box coupon-box" @click="jump('LevelPoint', { isHigh: true })">
          <view class="card-top">
            <view class="sprite-icon icon-certificate"></view>
            <view class="card-title">我的兑换券</view>
            <!-- <view class="card-wait">敬请期待</view> -->
            <view class="card-number">{{ couponCount || 0 }}</view>
            <view class="sprite-icon icon-coupon-arrow card-arrow"></view>
          </view>
          <view class="card-content">
            <template v-if="couponCount">
              <view class="coupon-card">
                <view v-for="item in couponList" :key="item.id" class="card-bg" :class="item.couponState == 2 ? 'claimed-bg' : 'unclaimed-bg'">
                  <view class="coupon-img">
                    <image mode="aspectFit" :src="item.couUrl || require('@/assets/images/point/default-coupon.webp')" alt="" />
                  </view>
                  <view class="coupon-right">
                    <view :class="['coupon-name', item.couponState == 1 ? 'unclaimed-name' : '']">{{ item.couponName }}</view>
                    <view :class="['coupon-price', item.couponState == 1 ? 'unclaimed-price' : '']">价值¥{{ item.lineationPrice }}</view>
                  </view>
                </view>
              </view>
            </template>
            <template v-else>
              <view class="empty-box">
                <image :src="require('@/assets/images/boutique/nothing.webp')" mode="heightFix" />
                <view class="empty-text">暂无可用卡券</view>
              </view>
            </template>
          </view>
        </view>
      </view>
      <view class="point-right">
        <view class="card-box rule-box" @click="jump('dayPoint')">
          <view class="card-top">
            <view class="sprite-icon icon-day-points"></view>
            <view class="card-title">每日积分</view>
            <view class="card-tips" @click.stop="jump('rulePoint')">
              <view class="sprite-icon icon-rule"></view>
              <text>积分规则</text>
            </view>
          </view>
          <view class="card-content day-rate">
            {{ pointDetail.done }}
            <text>/{{ pointDetail.todo ? pointDetail.done + pointDetail.todo : 0 }}</text>
          </view>
          <view class="process-box">
            <view class="process-inter" :style="{ width: (100 * pointDetail.done) / (pointDetail.done + pointDetail.todo) + '%' }"></view>
          </view>
        </view>
        <view class="point-record">
          <view class="record-title">积分记录</view>
          <template v-if="recordList.length">
            <view class="record-body">
              <view class="record-item" v-for="(i, index) in recordList" :key="index">
                <view class="record-item-left">
                  <view class="item-title">{{ i.pointTypeName }}</view>
                  <view class="item-time">{{ i.createdDate }}</view>
                </view>
                <view class="record-item-num">{{ i.pointValue > 0 ? '+' + i.pointValue : i.pointValue }}</view>
              </view>
            </view>
            <view class="record-more" @click="jump('Course')">查看更多</view>
          </template>
          <template v-else>
            <view class="empty-box">
              <image :src="require('@/assets/images/boutique/nothing.webp')" mode="heightFix" />
              <view class="empty-text">查看每日积分项，领取积分</view>
            </view>
            <view class="day-record" @click="jump('dayPoint')">每日积分</view>
          </template>
        </view>
      </view>
    </view>
    <view class="point-b"></view>
  </view>
</template>

<script type="text/ecmascript-6">
const START_LIST = [{ title: '学习之星', medalType: 1, logo: require('@/assets/images/point/study_star.png'), logo_grey: require('@/assets/images/point/study_grey.png'), },
{ title: '全勤之星', medalType: 2, logo: require('@/assets/images/point/time_star.png'), logo_grey: require('@/assets/images/point/time_grey.png'), },
{ title: '平板接待精英', medalType: 4, logo: require('@/assets/images/point/elite_star.png'), logo_grey: require('@/assets/images/point/elite_grey.png'), }]
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [pointTrack],
  name: '',
  data() {
    return {
      pageName: '积分首页',
      eventCode:'app_point_home',
      level: 1,
      month: '',
      date: '',
      pointDetail: {},
      levelList: [
        {
          title: '青铜级萌新',
          titleStyle: 'background: linear-gradient(129deg, #88696B 13%, #665253 91%);color: transparent; background-clip: text;-webkit-background-clip: text; ',
          subTitleStyle: 'color: #995737;background-image: linear-gradient(94deg, #ffffff3d 2%, #ffffff66 51%, #ffffff1f 99%);',
          style: 'background-image: linear-gradient(138deg, #F5E7DE 0%, #F1DBCF 20%, #F1DACD 39%, #EACEC0 40%, #EACDBF 70%, #F3DBD0 100%);',
          logo: require('@/assets/images/point/bronze.png'),
        },
        {
          title: '白银级熟手',
          titleStyle: 'background: linear-gradient(129deg, #4A668F 13%, #333B43 91%);color: transparent; background-clip: text;webkit-background-clip: text;',
          subTitleStyle: 'color: #556985;background-image: linear-gradient(94deg, #ffffff3d 2%, #ffffff66 51%, #ffffff1f 99%);',
          style: 'background-image: linear-gradient(138deg, #EDF0F5 0%, #E0E7EF 25%, #E4EAF2 39%, #DDE4ED 40%, #CCD7E6 74%, #D8E1ED 100%);',
          logo: require('@/assets/images/point/silver.png'),
        },
        {
          title: '黄金级能手',
          titleStyle: 'background: linear-gradient(129deg, #B17813 13%, #794308 91%);color: transparent; background-clip: text;webkit-background-clip: text;',
          subTitleStyle: 'color: #855A1B;background-image: linear-gradient(94deg, #ffffff3d 2%, #ffffff66 51%, #ffffff1f 99%);',
          style: 'background-image: linear-gradient(138deg, #F7EFD7 0%, #F1E3C0 25%, #F1E4C1 39%, #EAD6A8 40%, #EAD6A6 74%, #F0E3C0 100%);',
          logo: require('@/assets/images/point/gold.png'),
        },
        {
          title: '钻石级专家',
          titleStyle: 'background: linear-gradient(111deg, #E7E8FD 11%, #C7CDF2 53%, #F4D8E8 100%);color: transparent; background-clip: text;webkit-background-clip: text;',
          subTitleStyle: 'color: #E7E8FD;background-image: linear-gradient(94deg, #ffffff3d 2%, #ffffff66 51%, #ffffff1f 99%);',
          style: 'background-image: linear-gradient(138deg, #7162B6 0%, #433C94 25%, #313279 39%, #272A5B 40%, #2F356B 74%, #363E7A 100%);',
          logo: require('@/assets/images/point/masonry.png'),
        }
      ],
      starList: [],

        myStar: [],
      recordList: [{ title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }, { title: '签到', time: '2021-09-09', num: 10 }],
      couponList: [
        // {
        //   id: 1,
        //   couponName: '星巴克中杯全国通兑券星巴克中杯全国通兑券',
        //   lineationPrice: 45,
        //   isclaimed: true,
        //   couponState: 1
        // },
        // {
        //   id: 2,
        //   couponName: '星巴克中杯全国通兑券',
        //   lineationPrice: 45,
        //   isclaimed: false,
        //   couponState: 2
        // },
        // {
        //   id: 3,
        //   couponName: '星巴克中杯全国通兑券星巴克中杯全国通兑券',
        //   lineationPrice: 45,
        //   isclaimed: false,
        //   couponState: 2
        // }
      ],
      couponCount: 0,
      levelConfig: ''
    }
  },
  inject: ['showPage'],
  mounted() {
    const year = new Date().getFullYear()
    this.month = ((new Date().getMonth() + 1) + '').padStart(2, '0')
    this.date = `${year}-${this.month}`
    this.getPoint()
    this.getRecordList()
    this.getLevelConfig()
  },
  methods: {
    getLevelConfig() {
      uni.$api.pointApi.searchLevelConfig({
        pageSize: 10,
        currentPage: 1,
        openState: true,
        levelType: 2
      }).then(res => {
        this.levelConfig = res.list
        START_LIST.forEach(item => {
          if (this.levelConfig.find(i => i.levelName == item.title)) {
            this.starList.push(item)
          }
        })
      })
    },
    getRecordList() {
      uni.$api.pointApi.pointRecordList({ countDate: this.date }).then(res => {
        this.recordList = res
      })
    },
    getPoint() {
      const year = new Date().getFullYear()
      const month = new Date().getMonth() + 1
      uni.$api.pointApi.getPoint({ countDate: this.date }).then(res => {
        this.pointDetail = res || {}
        const myStar = res.badgeList.map(i => i.medalType)
        this.myStar = myStar
        this.level = res.levelCode;
        this.couponCount = res.couponCount
        this.couponList = res.useCouponList
      })
    },
    jump(name, val) {
      this.showPage(name, {
        levelConfig: this.levelConfig
      })
      this.leavePage()
    }
  }
}
</script>

<style scoped lang="scss">
.point-b {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;
  top: 0;
  left: 0;
  visibility: hidden;
}

.point-box {
  display: flex;
  height: calc(100vh - #{toRpx(230)});
  padding-top: toRpx(30);

  .card-box {
    width: toRpx(618);
    height: toRpx(400);
    box-sizing: border-box;
    padding: toRpx(48);
    background: #ffffffcc;
    border: toRpx(4) solid #ffffff;
    box-shadow: inset 0toRpx (4) toRpx(8) 0 #ffffff80;
    border-radius: toRpx(48);

    &.level-card {
      height: toRpx(408);
    }

    &.medal-card {
      height: toRpx(750);
      margin-bottom: 0;
    }

    &.rule-box {
      background-image: url('../../../../assets//images/point/rule_bg.webp');
      background-size: 100% 100%;
      border: none;
      height: toRpx(424);
      background-color: transparent;
      box-shadow: none;
      padding: toRpx(76) toRpx(64) toRpx(48);
    }

    &.coupon-box {
      // background-image: url('../../../../assets//images/point/ticket_bg.png');
      // background-size: 100% 100%;
      // border: none;
      // background-color: transparent;
      // box-shadow: none;
      height: calc(100vh - #{toRpx(1118)});

      .card-title {
        font-size: toRpx(36);
        color: #1a1a1a !important;
      }

      .card-number {
        font-weight: 600;
        font-size: toRpx(80);
        color: #fa9d23;
        margin-left: auto;
      }

      .card-arrow {
        margin-left: toRpx(24);
      }

      .empty-box {
        text-align: center;

        image {
          height: toRpx(208);
        }

        .empty-text {
          font-size: toRpx(26);
          color: #808291;
        }
      }

      .card-wait {
        width: toRpx(144);
        height: toRpx(48);
        background: #ffffff59;
        border-radius: toRpx(24);
        font-size: toRpx(24);
        color: #c17d1e;
        line-height: toRpx(52);
        text-align: center;
        margin-left: auto;
      }
    }

    .card-top {
      display: flex;
      line-height: toRpx(64);
      align-items: center;

      .card-logo {
        width: toRpx(64);
        height: toRpx(64);
      }

      .card-title {
        font-size: toRpx(36);
        color: #1a1a1a;
        margin-left: toRpx(32);
      }

      .card-tips {
        margin-left: auto;
        width: toRpx(176);
        height: toRpx(56);
        background: #ffffff;
        box-shadow:
          inset 0toRpx (4) 0 0 #dde3eb,
          inset 0 0 0 0 #ffffff,
          inset 0 -4rpx 0 0 #f0f2f5;
        border-radius: toRpx(28);
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          font-size: toRpx(24);
          color: #808291;
          margin-left: toRpx(12);
          margin-top: 4rpx;
        }
      }
    }

    .level-empty {
      text-align: center;
      margin-top: toRpx(20);

      image {
        height: toRpx(168);
      }

      .empty-text {
        font-size: 26rpx;
        color: #808291;
      }
    }

    .card-content {
      .coupon-card {
        margin-top: toRpx(48);
        display: flex;

        .card-bg {
          display: flex;
          align-items: center;
          width: toRpx(356);
          height: toRpx(188);
          margin-right: toRpx(40);
          padding: toRpx(32) toRpx(24);
        }

        .claimed-bg {
          background: url(../../../../assets//images/boutique/coupon-1.png) no-repeat;
          background-size: 100% 100%;
        }

        .unclaimed-bg {
          background: url(../../../../assets//images/boutique/coupon-2.png) no-repeat;
          background-size: 100% 100%;
        }

        .coupon-img {
          background-color: #fff;
          width: toRpx(88);
          height: toRpx(112);
          border-radius: toRpx(16);

          image {
            width: toRpx(88);
            height: toRpx(112);
            border-radius: toRpx(16);
          }
        }

        .coupon-right {
          margin-left: toRpx(24);

          .coupon-name {
            width: toRpx(196);
            font-size: toRpx(28);
            color: #181a1f;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;

            &.unclaimed-name {
              color: #5c3537;
            }
          }

          .coupon-price {
            margin-top: toRpx(16);
            font-size: toRpx(26);
            color: #4d9cfb;

            &.unclaimed-price {
              color: #db832c;
            }
          }
        }
      }

      &.day-rate {
        font-size: toRpx(80);
        color: #4673ff;
        font-weight: 600;
        margin-left: toRpx(80);

        text {
          font-size: toRpx(64);
        }
      }

      &.level-box {
        position: relative;
        border-radius: toRpx(24);
        width: toRpx(552);
        height: toRpx(192);
        padding: toRpx(48) toRpx(64);
        box-sizing: border-box;

        .level-logo {
          position: absolute;
          top: toRpx(0);
          right: toRpx(30);

          image {
            width: toRpx(120);
            height: toRpx(144);
          }
        }

        .level-name {
          font-size: toRpx(32);
          font-weight: 600;
        }

        .level-month {
          width: toRpx(130);
          height: toRpx(40);
          border-radius: toRpx(20);
          font-size: toRpx(24);
          line-height: toRpx(40);
          margin-top: toRpx(20);
          text-align: center;
          background-image: linear-gradient(94deg, #ffffff4d 2%, #ffffff80 51%, #ffffff26 99%);
        }
      }

      &.star-box {
        .card-item {
          background: #fffbf0;
          border-radius: 24rpx;
          height: toRpx(172);
          width: 100%;
          display: flex;
          align-items: center;
          padding-left: 20%;
          font-size: toRpx(28);
          color: #181a1f;
          margin-top: 24rpx;

          &.grey {
            background: #f7f7f7;
            color: #a2a2a8;
          }

          image {
            width: toRpx(128);
            height: toRpx(128);
            margin-right: toRpx(32);
          }
        }
      }
    }

    .process-box {
      height: toRpx(16);
      width: 100%;
      position: relative;
      background: #dfe9f7;
      border-radius: toRpx(8);
      margin-top: toRpx(44);

      .process-inter {
        height: toRpx(16);
        background-image: linear-gradient(90deg, #bcaffb 3%, #7aabff 95%);
        border-radius: toRpx(8);
      }
    }
  }

  .point-left {
    width: toRpx(1344);
    height: 100%;
    background: rgba(101, 171, 250, 0.12);
    border-radius: toRpx(80);
    padding: toRpx(32);

    .point-body {
      display: flex;

      .point-month {
        width: toRpx(618);

        .month-box {
          background: url(../../../../assets//images/point/point-bg.webp);
          background-size: 100% 100%;
          border: toRpx(2) solid #ffffff;
          height: 100%;
          box-shadow:
            8rpx 8rpx 32rpx 0 #5b92e680,
            inset 0 -12rpx 16rpx 0 #bce7ff;
          border-radius: toRpx(56);
          padding: toRpx(72);

          .month-up {
            display: flex;
            align-items: center;
            margin-top: toRpx(126);

            &:first-child {
              margin-top: toRpx(60);
            }

            .month-logo {
              width: toRpx(64);
              height: toRpx(64);
              background: #fff;
            }

            .month-text {
              font-size: toRpx(36);
              color: #ffffff;
              margin-left: toRpx(32);
            }

            .uni-icons {
              color: #ffffff !important;
              font-size: toRpx(24);
              margin-left: toRpx(20);
            }
          }

          .month-num {
            font-size: toRpx(80);
            color: #ffffff;
            line-height: toRpx(120);
            margin-left: toRpx(90);
            font-weight: 600;

            text {
              font-size: toRpx(64);
            }
          }
        }
      }

      .point-up {
        margin-left: toRpx(48);

        .card-box {
          &:first-child {
            // margin-bottom: toRpx(48);
          }
        }

        .card-top {
          padding: 0 toRpx(16);
        }
      }
    }

    .coupon-box {
      margin-top: toRpx(48);
      width: 100%;
      padding: toRpx(48) toRpx(64);

      .card-tips {
        margin-left: auto;
        color: #a2a2a8;
      }
    }
  }

  .point-right {
    flex: 1;
    margin: toRpx(0) toRpx(60) toRpx(0) toRpx(30);

    .card-box {
      width: auto;
    }

    .point-record {
      background: rgba(255, 255, 255, 0.8);
      border: toRpx(4) solid #ffffff;
      box-shadow: inset 0 toRpx(4) toRpx(8) 0 rgba(255, 255, 255, 0.5);
      border-radius: toRpx(48);
      margin: toRpx(35) toRpx(10) 0;
      height: calc(100% - #{toRpx(458)});
      padding: toRpx(40);
      box-sizing: border-box;

      .empty-box {
        text-align: center;

        image {
          height: toRpx(224);
          margin-top: toRpx(128);
        }

        .empty-text {
          font-size: toRpx(26);
          color: #808291;
          line-height: toRpx(106);
        }
      }

      .day-record {
        width: 296rpx;
        height: 88rpx;
        background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
        border-radius: 20rpx;
        text-align: center;
        line-height: 88rpx;
        font-size: 30rpx;
        color: #ffffff;
        margin: 120rpx auto 0;
      }

      .record-title {
        font-size: toRpx(32);
        color: #1a1a1a;
        text-align: center;
      }

      .record-body {
        height: calc(100% - #{toRpx(140)});
        overflow-y: hidden;
        margin: toRpx(20) 0;

        .record-item {
          margin-bottom: toRpx(40);
          display: flex;
          justify-content: space-between;
          align-items: center;

          &-left {
            .item-title {
              font-size: toRpx(26);
              line-height: toRpx(40);
              color: #181a1f;
            }

            .item-time {
              font-size: toRpx(24);
              color: #808291;
              line-height: toRpx(40);
            }
          }

          &-num {
            font-size: toRpx(32);
            color: #181a1f;
          }
        }
      }

      .record-more {
        width: toRpx(144);
        height: toRpx(48);
        background: rgba(216, 216, 216, 0);
        border: toRpx(2) solid #afb6cc;
        border-radius: toRpx(24);
        margin: 0 auto;
        font-size: toRpx(24);
        color: #808291;
        text-align: center;
        line-height: toRpx(44);
        margin-top: toRpx(8);
      }
    }
  }
}
</style>
