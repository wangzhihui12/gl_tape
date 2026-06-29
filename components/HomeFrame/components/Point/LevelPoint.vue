<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-08 11:30:30
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-01 13:38:06
-->
<template>
  <view class="point-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view v-if="isHigh" class="title"><text>我的兑换券</text></view>
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
      <view class="data-container">
        <view :class="['type-box']">
          <view class="tab-item" v-for="(i, index) in typeList" :key="index" @click="changeType(index, 'firstIndex')">
            <view :class="['sprite-icon', firstIndex == index ? `icon-${firstClass[index]} active` : '', firstLeft[index]]"></view>
            <view class="text" :class="[firstIndex == index ? `active` : '']">
              {{ i.tabName }}
              <template>{{ i.num() }}</template>
              <!-- <template>({{ preRecordFailList.length }})</template> -->
              <div class="dot" :style="{ right: '86rpx' }" v-if="i.dot && i.dot()"></div>
            </view>
          </view>
        </view>
        <view class="tabs-bottom"></view>
        <scroll-view :class="['record-list', list.length != 0 ? 'scroll-list' : '']" scroll-y @scrolltolower="pageonReachBottom" :scroll-top="scrollTop">
          <template v-if="list.length">
            <view class="coupon-list">
              <template v-for="item in list">
                <view :class="['coupon-bg', `${TYPE_LIST[item.couponState]}-bg`]">
                  <image v-if="item.couponState == 2" class="claimed-left" :src="require('@/assets/images/point/claimed-left.png')" alt="" />
                  <view class="coupon-img">
                    <image class="img" mode="aspectFill" :src="item.couUrl || require('@/assets/images/point/default-coupon.webp')" alt="" />
                  </view>
                  <view class="coupon-info">
                    <view :class="['coupon-name', { 'gray-name': item.couponState == 3 }]">{{ item.couponName }}</view>
                    <view :class="['coupon-price', { 'gray-text': item.couponState == 3 }]">官方价：¥{{ item.lineationPrice }}</view>
                    <view :class="['coupon-time', { 'gray-text': item.couponState == 3 }]">有效期：{{ item.couponDeadline }}</view>
                  </view>
                  <view @click="openCoupon(item)" :class="['coupon-btn', item.couponState == 2 ? 'blue' : item.couponState == 3 ? 'gray gray-name' : 'red']">
                    {{ item.couponState == 2 ? '查看券码' : item.couponState == 3 ? '已过期' : '使用领取' }}
                  </view>
                </view>
              </template>
            </view>
          </template>
          <template v-else>
            <view class="nothing flex">
              <image class="icon" src="../../../../assets/images/home/nothing.webp" />
              暂无兑换券
            </view>
          </template>
          <template v-if="nothing">
            <view class="end-text">-已经到底了-</view>
          </template>
        </scroll-view>
      </view>
    </view>
    <!-- 弹窗 -->
    <view class="coupon-pop" v-if="showCouponPon">
      <view class="pop-box">
        <view class="coupon-card">
          <view :class="['coupon-header', couponDetailInfo.couponState == 2 ? 'detail-header' : '']">
            <view class="header-img">
              <image :src="couponDetailInfo.couUrl || require('@/assets/images/point/default-coupon.webp')" alt="" />
            </view>
            <view class="coupon-base-info">
              <h3>{{ couponDetailInfo.couponName }}</h3>
              <p>官方价：¥{{ couponDetailInfo.lineationPrice }}</p>
              <p>有效期：{{ couponDetailInfo.couponDeadline }}</p>
            </view>
          </view>
          <view class="coupon-line"></view>
          <view class="coupon-body">
            <view class="coupon-qr" v-if="couponDetailInfo.couponState == 2">
              <view class="coupon-tips">
                <view class="sprite-icon icon-icon-instructions"></view>
                <view>请截屏发送至手机或手机拍摄保存，按「使用须知」使用卡券</view>
              </view>
              <view class="coupon-qrcode">
                <template v-if="couponDetailInfo.cardType == 0 || couponDetailInfo.cardType == 1 || couponDetailInfo.cardType == 2">
                  <image class="qr-img" :src="couponDetailInfo.qrCodeUrl" alt="" />
                </template>
                <!-- <template v-if="couponDetailInfo.cardType == 1">
                  <image class="qr-1-img" :src="couponDetailInfo.barCodeUrl" alt="" />
                </template>
                <template v-else-if="couponDetailInfo.cardType == 2">
                  <view class="qr-2-box">
                    <image class="qr-img" :src="couponDetailInfo.qrCodeUrl" alt="" />
                    <view class="qr-line"></view>
                    <image class="qr-2-img" :src="couponDetailInfo.barCodeUrl" alt="" />
                  </view>
                </template> -->
                <template v-else-if="couponDetailInfo.cardType == 3">
                  <view class="redeem-code">
                    <view class="redeem-item">
                      <view class="redeem-name">卡券URL：</view>
                      <view class="redeem-value">{{ couponDetailInfo.couponCardUrl || '' }}</view>
                    </view>
                  </view>
                </template>
                <template v-else-if="couponDetailInfo.cardType == 4">
                  <view class="redeem-code">
                    <view class="redeem-item">
                      <view class="redeem-name">密码：</view>
                      <view class="redeem-value">{{ couponDetailInfo.couponPassword }}</view>
                    </view>
                  </view>
                </template>
                <template v-else-if="couponDetailInfo.cardType == 5">
                  <view class="redeem-code">
                    <view class="redeem-item">
                      <view class="redeem-name">卡号：</view>
                      <view class="redeem-value">{{ couponDetailInfo.cardNo }}</view>
                    </view>
                    <view class="redeem-item">
                      <view class="redeem-name">密码：</view>
                      <view class="redeem-value">{{ couponDetailInfo.couponPassword }}</view>
                    </view>
                  </view>
                </template>
                <!-- <template v-else>
                  <image class="qr-img" :src="couponDetailInfo.qrCodeUrl" alt="" />
                </template> -->
              </view>
            </view>
            <view class="store-info" v-if="storeAddress">
              <view class="sprite-icon icon-icon-store"></view>
              <p class="store-label">附近门店</p>
              <p class="store-address">{{ storeAddress }}</p>
              <view class="copy-btn" @click="copyText">
                <view class="sprite-icon icon-icon-copy copy"></view>
                复制
              </view>
            </view>
            <view :class="['usage-notice', couponDetailInfo.couponState == 2 ? 'claimed-usage' : '']">
              <view :class="[couponDetailInfo.couponState == 2 ? 'claimed-notice' : '']">
                <view class="notice-title">
                  <view class="sprite-icon icon-icon-notice"></view>
                  <view class="m-l-8">使用须知</view>
                </view>
                <view class="ol li" v-html="couponDetailInfo.apiUseExplain"></view>
                <!-- <ol>
                  <li :class="[couponDetailInfo.couponState == 2 ? '':'first-li']">本产品有效期为购买后24小时内，请于24小时内到店使用。</li>
                  <li>如有质量问题，请于购买后24小时内联系客服，过期作废，非质量问题无法退换货，不同意勿拍。</li>
                  <li>到店出示本券由门店扫描验证即可兑换。星巴克全国指定直营门店可用（臻选店，机场店，火车站等交通枢纽和景区门店除外）。</li>
                  <li>请在本产品使用后再确认收货，一旦收货无法提供售后服务。如有售后，请妥善保管好您的星巴克小票以备使用。</li>
                </ol> -->
              </view>
            </view>
            <view class="coupon-footer" v-if="couponDetailInfo.couponState == 1">
              <button class="claim-button" @click="handleUse">领取使用</button>
            </view>
          </view>
        </view>
        <view class="close-box" @click="closePop">
          <view class="close-btn">×</view>
        </view>
      </view>
    </view>
    <!-- 确认弹窗 -->
    <view class="dailog-panel" v-if="show">
      <view class="dailog-box">
        <view class="dailog-close" @click="show = false"><uni-icons type="closeempty" size="20"></uni-icons></view>
        <view class="dailog-logo">
          <image src="../../../../assets/images/point/tips.webp"></image>
        </view>
        <view class="dailog-title">领取提醒</view>
        <view class="dailog-content">
          <view>
            卡券领取后需要在
            <view class="highlight">「24小时」</view>
            内按使用须知使用，
          </view>
          <view>如24小时内未使用则将失效，请合理规划使用时间进行领取。</view>
          <view>请确认是否领取卡券？</view>
        </view>

        <view class="dailog-footer">
          <template>
            <view class="dailog-btn disabled" @click="handleNo">暂不领取</view>
            <view class="dailog-btn" @click="handleConfirm">确认领取</view>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import point from '@/mixin/point'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, pointTrack],
  data() {
    return {
      pageName: '积分兑换券',
      eventCode: 'app_point_coupon',
      isHigh: false,
      typeList: [
        { tabName: '全部', num: () => '' },
        { tabName: '未领取', num: () => '' },
        { tabName: '已领取', num: () => '' },
        { tabName: '已过期', num: () => '' }
      ],
      firstIndex: 0,
      firstLeft: ['first', 'second', 'three'],
      firstClass: ['first-nav', 'second-nav', 'second-nav'],
      list: [],
      showCouponPon: false,
      show: false,
      couponDetailInfo: {},
      nothing: false,
      scrollTop: 0,
      TYPE_LIST: {
        1: 'unclaimed', // 未领取
        2: 'claimed', // 已领取
        3: 'expired' // 已过期
      },
      total: 0,
      pageNum: 1,
      pageSize: 12,
      storeAddress: ''
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
    this.init()
  },
  methods: {
    init() {
      console.log('init')
      this.getGrantRecord()
    },
    getLocation(brandName) {
      const _this = this
      uni.getLocation({
        type: 'wgs84',
        success: res => {
          console.log(res, '====') // 打印位置信息
          // 处理位置数据
          const params = {
            brandName,
            lat: res.latitude,
            lng: res.longitude
            // lat: 22.587424,
            // lng: 113.991215
          }
          uni.$api.pointApi.searchStoreAddress(params).then(res => {
            console.log(res, '======')
            _this.storeAddress = res
          })
        },
        fail: err => {
          console.error('获取位置失败', err)
          if (err.errMsg.includes('auth deny')) {
            uni.showModal({
              title: '提示',
              content: '需要授权位置信息才能获取附近门店地址，请在设置中开启',
              success: res => {
                if (res.confirm) {
                  uni.openSetting({
                    success: settingRes => {
                      if (settingRes.authSetting['scope.userLocation']) {
                        console.log('用户已授权位置信息')
                        uni.getLocation({
                          type: 'wgs84',
                          success: res => {
                            console.log('获取位置成功', res)
                          },
                          fail: err => {
                            console.error('获取位置失败', err)
                          }
                        })
                      } else {
                        console.log('用户未授权位置信息')
                      }
                    }
                  })
                }
              }
            })
          } else if (err.errMsg.includes('fail authorize no app permission')) {
            uni.showModal({
              title: '提示',
              content: '请在设置中开启定位服务',
              success: res => {
                if (res.confirm) {
                  uni.openSetting({
                    success: settingRes => {
                      console.log('用户已打开设置', settingRes)
                    }
                  })
                }
              }
            })
          }
        }
      })
    },
    /** 接口调用 uni.$api.pointApi*/
    // 优惠券个数
    statisticsCount() {
      const params = {
        staffPhone: uni.$storage.get('userInfo').phone
      }
      uni.$api.pointApi.statisticsCount(params).then(res => {
        console.log(res, '-----', this.firstIndex)
        this.typeList[1].num = () => `(${res[0]})`
        this.typeList[2].num = () => `(${res[1]})`
        this.typeList[3].num = () => `(${res[2]})`
      })
    },
    async getGrantRecord(couponState) {
      try {
        uni.showLoading({
          mask: true
        })
        console.log('查询优惠券列表')
        const { pageNum, pageSize } = this
        const params = {
          staffPhone: uni.$storage.get('userInfo').phone,
          pageNum,
          pageSize
        }
        if (couponState) params.couponState = couponState
        console.log(params, 'chaxun')
        const res = await uni.$api.pointApi.getGrantRecord(params)
        console.log(res, '========================', pageNum)
        if (pageNum == 1) {
          this.list = res.list
        } else {
          this.list = this.list.concat(res.list)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
        this.statisticsCount()
      } catch (error) {
        uni.showToast({
          title: 'error'
        })
      }
    },
    changeType(index, name) {
      console.log(index, name)
      if (this[name] == index) return // 点击同一个
      this.direction = ''
      this.nothing = false
      this.scrollTop = 1
      this.pageNum = 1
      setTimeout(() => {
        this.scrollTop = 0
      }, 100)
      if (this[name] < index) {
        this.direction = 'right'
      } else {
        this.direction = 'left'
      }
      this[name] = index
      this.getGrantRecord(this.firstIndex)
    },
    //下拉分页
    pageonReachBottom() {
      console.log('到底了')
      let { pageNum, total, nothing, pageSize } = this
      if (!nothing) nothing = 'nothing'
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1
        this.getGrantRecord(this.firstIndex)
      } else this.nothing = true
    },
    openCoupon(row) {
      console.log(row)
      const { couponState } = row
      this.couponDetailInfo = row
      switch (couponState) {
        case 1:
          // 使用优惠券
          this.showCouponPon = true
          // this.couponDetailInfo = row
          this.getLocation(row.brandName)
          break
        case 2:
          this.showCouponPon = true
          // this.couponDetailInfo = row
          this.getLocation(row.brandName)
          break
        default:
          return
      }
    },
    closePop() {
      this.showCouponPon = false
      this.storeAddress = ''
    },
    // 领取使用按钮
    handleUse() {
      this.show = true
      this.showCouponPon = false
    },
    // 暂不领取
    handleNo() {
      this.show = false
      this.showCouponPon = true
    },
    // 确认领取
    handleConfirm() {
      console.log('确认领取')
      const { id } = this.couponDetailInfo
      const params = { id }
      uni.$api.pointApi.receiveCoupon(params).then(res => {
        console.log(res)
        this.couponDetailInfo = res
        this.show = false
        this.showCouponPon = true
        this.pageNum = 1
        this.getGrantRecord(this.firstIndex)
      })
    },
    // 复制
    copyText() {
      uni.setClipboardData({
        data: this.storeAddress,
        success: function () {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
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

  .data-container {
    background: #ffffff;
    border-radius: toRpx(48);
    margin-top: toRpx(48);
    // height: 82vh;
    height: calc(100vh - #{toRpx(250)});
    // margin-right: toRpx(66);
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    border: toRpx(2) solid #fff;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;

    .type-box {
      position: relative;
      display: flex;
      width: 100%;
      background-color: #eef4fe;
      height: toRpx(176);
      line-height: toRpx(128);
      border-radius: toRpx(48) toRpx(48) 0 0;
      z-index: 0;

      .tab-item {
        width: toRpx(400);
        text-align: center;
        font-weight: 500;
        font-size: toRpx(40);
        color: #1f2133;

        .first {
          left: 0;
        }

        .second {
          left: toRpx(352);
        }

        .three {
          left: toRpx(756);
        }

        .text {
          position: relative;
          text-align: center;
          width: toRpx(400);

          .dot {
            width: toRpx(16);
            height: toRpx(16);
            background: #f24724;
            position: absolute;
            top: toRpx(40);
            border-radius: 50%;
            right: toRpx(86);
          }
        }

        .active {
          position: absolute;
          top: 0;
          z-index: -1;
          font-weight: 700;
          font-size: toRpx(40);
          color: #2c66f7;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: toRpx(48);
            height: toRpx(8);
            background-color: #2c66f7;
            border-radius: toRpx(16);
          }
        }
      }
    }
  }

  .record-list {
    position: relative;
    z-index: 4;

    &.scroll-list {
      height: calc(100% - #{toRpx(170)});
    }

    .coupon-list {
      display: flex;
      flex-wrap: wrap;
      gap: toRpx(48) toRpx(80);
      padding-left: toRpx(80);
    }

    .expired-bg {
      background: url('../../../../assets/images/point/expired-bg.webp') no-repeat;
    }

    .unclaimed-bg {
      background: url('../../../../assets/images/point/unclaimed-bg.webp') no-repeat;
    }

    .claimed-bg {
      background: url('../../../../assets/images/point/claimed-bg.webp') no-repeat;
    }

    .coupon-bg {
      position: relative;
      width: toRpx(452);
      height: toRpx(536);
      background-size: 100%;

      .claimed-left {
        width: toRpx(126);
        height: toRpx(40);
        position: absolute;
        left: 0;
        top: 0;
      }

      .coupon-img {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
        width: toRpx(240);
        height: toRpx(152);
        margin: toRpx(40) auto;
        border-radius: toRpx(32);

        .img {
          width: toRpx(240);
          height: toRpx(152);
          border-radius: toRpx(32);
        }
      }

      .coupon-info {
        margin-top: toRpx(68);
        padding: toRpx(0) toRpx(40);

        .coupon-name {
          // width: toRpx(372);
          font-weight: 500;
          font-size: toRpx(28);
          color: #181a1f;
          line-height: toRpx(48);
          margin-bottom: toRpx(8);
          overflow: hidden;
          /* 超出部分隐藏 */
          white-space: nowrap;
          /* 文本不换行 */
          text-overflow: ellipsis;
          /* 超出部分显示省略号 */
        }

        .coupon-price,
        .coupon-time {
          font-size: toRpx(24);
          color: #808291;
          line-height: toRpx(40);
        }
      }

      .coupon-btn {
        margin: toRpx(32) toRpx(96);
        width: toRpx(260);
        height: toRpx(72);
        font-weight: 500;
        font-size: toRpx(28);
        color: #ffffff;
        box-shadow: inset 0 0 toRpx(32) 0 #ffffff59;
        border-radius: toRpx(16);
        text-align: center;
        line-height: toRpx(78);
      }

      .gray-name {
        color: #808291;
      }

      .gray-text {
        color: #a2a2a8;
      }

      .red {
        background-image: linear-gradient(180deg, #ff8243 0%, #fe4152 46%, #fe5496 100%);
      }

      .blue {
        background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      }

      .gray {
        background: #dcdce0;
      }
    }
  }

  .tabs-bottom {
    background: #fff;
    height: toRpx(48);
    position: relative;
    border-radius: 24px 24px 0 0;
    position: absolute;
    width: 100%;
    top: toRpx(128);
  }

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
            list-style: none;
            /* 移除默认的列表样式 */
            font-size: 26rpx;
            color: #333333;
            line-height: 46rpx;

            &::before {
              content: '•';
              /* 使用Unicode字符作为点 */
              color: #a2a2a8;
              /* 设置点的颜色 */
              margin-right: 12rpx;
              /* 设置点与文字的间距 */
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
            width: toRpx(424);
            height: toRpx(96);
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
              width: toRpx(424);
              height: toRpx(96);
              z-index: -1;
            }

            .coupon-title {
              font-size: toRpx(28);
              color: #5c3537;

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
          line-height: toRpx(60);

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

.nothing {
  width: 100%;
  flex-direction: column;
  margin-top: toRpx(112);
  font-size: toRpx(28);
  color: #999999;

  .icon {
    width: toRpx(678);
    height: toRpx(284);
    margin-bottom: toRpx(24);
  }
}

// 弹窗
.coupon-pop {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 11;
  height: 100vh;

  .pop-box {
    position: relative;
    width: toRpx(1040);
    // height: toRpx(1036);
    // background-color: #fff;
    border-radius: toRpx(64);

    .coupon-card {
      // background-color: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .coupon-header {
      display: flex;
      align-items: center;
      padding: toRpx(28) toRpx(80) toRpx(52);
      height: toRpx(292);
      background-image: linear-gradient(104deg, #fff2d0 0%, #fff7e3 31%, #fce5e6 85%, #fbdce7 100%);
      -webkit-mask: radial-gradient(circle at 12px 12px, transparent 12px, red 12px) -12px -12px;
      -webkit-mask-position: -12px -24px;
      border-radius: toRpx(64);

      &.detail-header {
        background-image: linear-gradient(104deg, #dbebff 0%, #f1f5fd 39%, #e2f2fe 82%, #d1f0ff 100%);
      }

      .header-img {
        width: toRpx(200);
        height: toRpx(200);
        background: #ffffff;
        border-radius: toRpx(24);

        image {
          width: toRpx(200);
          height: toRpx(200);
          border-radius: toRpx(24);
        }
      }

      h3 {
        margin: 0;
        font-size: toRpx(36);
        margin-bottom: toRpx(56);
      }

      p {
        margin-top: toRpx(5);
        color: #808291;
      }

      .coupon-base-info {
        margin-left: toRpx(40);
      }
    }

    .coupon-line {
      margin-top: toRpx(-24);
      height: toRpx(50);
      background-color: #fff;
      -webkit-mask: radial-gradient(circle at 12px 12px, transparent 12px, red 12px) 12px 12px;
      -webkit-mask-position: -12px -12px;
    }

    .coupon-body {
      margin-top: toRpx(-24);
      background-color: #fff;
      padding: toRpx(24) toRpx(80);
      border-radius: 0 0 toRpx(64) toRpx(64);

      .coupon-qr {
        text-align: center;

        .coupon-tips {
          display: flex;
          align-items: center;
          color: #ef6f2c;
          font-size: toRpx(28);
          padding-left: toRpx(36);
        }

        .coupon-qrcode {
          width: 100%;

          .qr-img {
            width: toRpx(500);
            height: toRpx(500);
            margin: toRpx(20) 0;
          }

          .qr-1-img {
            width: toRpx(640);
            height: toRpx(192);
            margin: toRpx(80) 0;
          }

          .qr-2-box {
            display: flex;
            margin: toRpx(80) 0;
            justify-content: space-evenly;
            // padding: 0 toRpx(60);
            padding-left: toRpx(168);
            align-items: center;

            .qr-img {
              width: toRpx(320);
              height: toRpx(320);
              margin: 0;
            }

            .qr-line {
              width: toRpx(6);
              height: toRpx(288);
              border-right: toRpx(6) dashed #e4e7eb;
              box-sizing: border-box;
              margin-left: toRpx(60);
              margin-right: toRpx(-50);
            }

            .qr-2-img {
              height: toRpx(96);
              width: toRpx(320);
              rotate: 90deg;
            }
          }

          .redeem-code {
            padding: 0 toRpx(40);
            margin: toRpx(48) 0 toRpx(80);

            .redeem-item {
              display: flex;
              flex-direction: column;
              text-align: left;
              margin-bottom: toRpx(40);

              .redeem-name {
                font-size: toRpx(28);
                color: #808291;
              }

              .redeem-value {
                font-size: toRpx(40);
                color: #181a1f;
                margin-top: toRpx(16);
                word-wrap: break-word;
                word-break: break-all;
              }
            }
          }
        }

        // .coupon-qrcode {
        //   width: 100%;
        //   // width: toRpx(544);
        //   height: toRpx(322);
        //   margin: toRpx(56) 0;
        // }
      }
    }

    .store-info {
      display: flex;
      align-items: center;
      margin-bottom: toRpx(24);
      background: url(../../../../assets/images/point/coupon-address.png) no-repeat;
      // background-size:  100% auto;
      // background-image: linear-gradient(90deg, #ffffff99 0%, #ffffffeb 23%, #F5F7FA 100%);
      border-radius: toRpx(16);
      padding: toRpx(16) toRpx(32);

      .copy-btn {
        display: flex;
        align-items: center;
        margin-left: auto;
        color: #808291;

        .copy {
          margin-right: toRpx(8);
        }
      }

      .store-label {
        margin-left: toRpx(8);
        font-weight: 500;
        font-size: toRpx(28);
        color: #020305;
        line-height: toRpx(40);
      }

      .store-address {
        margin-left: toRpx(32);
        font-size: toRpx(28);
        color: #1f1f1f;
        width: calc(100% - #{toRpx(300)});
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .icon-store {
      display: inline-block;
      width: 20px;
      height: 20px;
      background-color: #ffcc00;
      border-radius: 50%;
      margin-right: 10px;
    }

    .store-info p {
      margin: 0;
    }

    .notice-title {
      display: flex;
      align-items: center;
      font-size: toRpx(28);
      color: #020305;
      font-weight: 500;
      margin-bottom: toRpx(16);
      padding: 0 toRpx(26);
    }

    .usage-notice {
      background-color: #f5f7fa;
      padding: toRpx(24) toRpx(6);
      border-radius: toRpx(24);

      &.claimed-usage {
        margin-bottom: toRpx(56);
      }
    }

    .claimed-notice {
    }

    .usage-notice {
      .m-l-8 {
        margin-left: toRpx(8);
      }
    }

    .usage-notice .ol {
      padding: 0 toRpx(34);
      font-size: toRpx(26);
      max-height: toRpx(212);
      overflow-y: auto;

      .first-li {
        color: #ef6f2c;
      }
    }

    .usage-notice .li {
      margin-bottom: toRpx(10);
      color: #808291;
    }

    .coupon-footer {
      display: flex;
      justify-content: center;
      padding: toRpx(48) 0 toRpx(40);
    }

    .claim-button {
      background-image: linear-gradient(107deg, #fd8442 0%, #fe3d3e 51%, #fe5495 100%);
      box-shadow: 0 toRpx(24) toRpx(20) toRpx(-16) #ff2e5580;
      border-radius: toRpx(24);
      color: #fff;
      border: none;
      padding: toRpx(18) toRpx(116);
      font-weight: 500;
      font-size: toRpx(40);
    }

    .close-box {
      position: absolute;
      right: toRpx(-160);
      top: 0;
      width: toRpx(74);
      height: toRpx(74);
      border: 1px solid #fff;
      border-radius: 50%;
      color: #fff;
      text-align: center;
      box-sizing: content-box;

      .close-btn {
        font-weight: 100;
        font-size: toRpx(70);
        line-height: toRpx(80);
      }
    }
  }
}

// 领取弹窗样式
.dailog-panel {
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 11;

  .dailog-box {
    position: fixed;
    left: 50%;
    top: 50%;
    width: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    background-image: linear-gradient(179deg, #d6e9ff 12%, #ffffff 100%);
    /* 顶部渐变和底部白色 */
    background-size:
      100% 110rpx,
      100% calc(100% - 110rpx);
    /* 分别设置渐变和白色的背景大小 */
    background-repeat: no-repeat, no-repeat;
    /* 确保背景不重复 */
    background-position: top, bottom;
    /* 分别设置渐变和白色的位置 */
    border-radius: 48rpx;

    .dailog-close {
      text-align: right;
      margin-right: 48rpx;
      margin-top: 48rpx;

      .uni-icons {
        color: #808291 !important;
        font-size: 40rpx;
      }
    }

    .dailog-logo {
      text-align: center;

      image {
        width: 228rpx;
        height: 228rpx;
      }
    }

    .dailog-title {
      font-size: 40rpx;
      color: #1a1a1a;
      text-align: center;
      margin-top: 40rpx;
    }

    .dailog-content {
      font-size: 32rpx;
      color: #808291;
      text-align: center;
      line-height: 46rpx;
      margin-top: 16rpx;
      padding: 0 64rpx;

      .highlight {
        display: inline-block;
        color: #2c66f7;
      }
    }

    .dailog-footer {
      display: flex;
      justify-content: center;
      margin: 80rpx 0 70rpx;
    }

    .dailog-btn {
      width: 400rpx;
      height: 96rpx;
      background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      box-shadow: inset 0 0 32rpx 0 #ffffff80;
      border-radius: 16rpx;
      text-align: center;
      font-size: 36rpx;
      color: #ffffff;
      line-height: 96rpx;

      &.disabled {
        background-color: #f0f1f5;
        background-image: none;
        color: #1a1a1a;
        margin-right: 48rpx;
      }
    }
  }
}

.end-text {
  color: #999;
  text-align: center;
  padding: toRpx(50) 0;
  font-size: toRpx(24);
}
</style>
