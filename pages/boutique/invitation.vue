<template>
  <view class="layout">
    <view class="bg"></view>
    <wnCanvas
      :canvasId="`c-${madiaId}`"
      :drawStatus="penSwitch"
      custom
      :scaleSwitch="false"
      ref="invitationCanvas"
    >
      <template slot="customContent">
        <view class="layout-content">
          <view class="box">
            <view class="input-box">
              <input
                type="text"
                class="input"
                v-model="customerNameOrPhone"
                maxlength="11"
                @blur="input($event)"
                @focus="focus"
              />
              <view
                class="input-tips"
                v-if="!isSearch"
              >搜索客户姓名/电话<uni-icons
                  type="search"
                  class="icon"
                  color="#999"
                  size="20"
                ></uni-icons></view>
              <uni-icons
                v-if="isSearch"
                type="closeempty"
                class="close"
                color="#999"
                @click="handleClear"
                size="20"
              ></uni-icons>
            </view>
            <scroll-view
              class="record-box"
              scroll-y
              @scrolltolower="pageonReachBottom"
            >
              <view class="list">
                <template v-if="flag">
                  <template v-if="list.length">
                    <template v-for="item in list">
                      <view
                        class="item"
                        :key="item.id"
                        @click="reception(item)"
                      >
                        <view
                          class="detail-btn flex"
                          @click.stop="openDetail(item)"
                        >
                          查看
                          <div class="sprite-icon icon-detail-btn"></div>
                        </view>
                        <view class="top flex">
                          <view class="name">
                            {{ item.customerName }}
                          </view>
                          <view :class="['status flex', 'status_' + formatInvite(item)]">{{ inviteStatus[formatInvite(item)] }}</view>
                        </view>
                        <template v-for="(k, ind) in itemObject">
                          <view
                            class="info flex"
                            :key="ind"
                          >
                            <view class="label">{{ k.label }}</view>
                            <view class="value">{{
                              k.formatter ? k.formatter(item[k.key]):
                        k.format
                          ? formatTime(item[k.key], k.key)
                          : item[k.key] || "-"
                      }}</view>
                          </view>
                        </template>
                      </view>
                    </template>
                  </template>
                  <template v-else>
                    <view class="nothing flex">
                      <image
                        class="icon"
                        src="../../assets/images/home/nothing.webp"
                      />
                      暂无数据
                    </view>
                  </template>
                </template>
              </view>
              <template v-if="nothing">
                <view class="end-text">-已经到底了-</view>
              </template>
            </scroll-view>
          </view>
        </view>
      </template>
    </wnCanvas>
    <MessageBox
      ref="receptionTips"
      content="是否接待当前客户，确定接待直接进入\n「车型加装选购页」"
      cancelBtnText="取消"
      confirmBtnText="确定接待"
      @confirm="jumpPage"
    ></MessageBox>

    <coupon-pop
      ref="couponPopup"
      @hideTool="$emit('hideTool')"
      title="客户邀约详情"
      tips="微信扫码进入客户邀约详情"
    />
  </view>
</template>
<script type="text/ecmascript-6">
import dayjs from 'dayjs'
import Record from "@/mixin/record";
import CouponPop from './components/CouponPop.vue'
export default {
  components: { CouponPop },
  mixins: [Record],
  props: {
    show: Boolean,
    madiaId: Number,
    penSwitch: Boolean,
  },
  data () {
    return {
      customerNameOrPhone: '',
      isSearch: false,
      list: [],
      inviteStatus: { 1: '待预约', 2: '已预约', 3: '取消预约', 4: '已施工', 5: '超时未到店', 6: '已撤销', 7: '已支付' },
      itemObject: [
        { label: '客户电话', key: 'customerPhone', format: true },
        { label: '客户车型', key: 'carSeriesName' },
        { label: '礼券名称', key: 'couponName' },
        { label: '领券时间', key: 'receiveCouponDate', format: true },
        { label: '销售顾问', key: 'employeeName' },
        {
          label: '流量有效性', key: 'trafficEffectiveness', formatter: (val) => {
            return {
              1: '有效客户',
              2: '无效客户'
            }[val] || '-'
          }
        },
      ],
      chooseItem: {}
    }
  },
  computed: {
    couponPopupRef () {
      return this.$refs.couponPopup
    },
  },
  watch: {
    show: {
      handler (val) {
        if (val) {
          this.flag = false
          this.list = []
          this.init()
        }
        this.$refs.receptionTips?.close()
      },
      immediate: true
    }

  },
  methods: {
    init () {
      this.customerNameOrPhone = '';
      setTimeout(() => {
        this.isSearch = false
        this.pageNum = 1
        this.flag = false
        this.getRecordList()
      }, 300)

    },
    //已预约的并且预约时间小于当前时间的，显示超时未到店，否则显示已预约
    formatInvite (val) {
      if (val.inviteStatus == 2 && new Date().getTime() > new Date(val.inviteDate).getTime()) {
        return 5
      }
      return val.inviteStatus
    },
    formatTime (val, key) {
      if (key == 'customerPhone') {
        return val.slice(0, 3) + " " + val.slice(3, 7) + " " + val.slice(7)
      }
      return dayjs(val).format("YYYY-MM-DD HH:mm:ss")
    },
    //下拉分页
    pageonReachBottom () {
      let { pageNum, total, nothing, pageSize } = this
      if (!nothing) nothing = 'nothing'
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1
        this.getRecordList()
      } else this.nothing = true
    },
    input (e) {
      this.customerNameOrPhone = e.detail.value
      if (this.customerNameOrPhone == '')
        this.isSearch = false
      this.pageNum = 1
      this.flag = false
      this.getRecordList()
      this.clearCanvas()
    },
    focus () {
      this.isSearch = true
    },
    handleClear () {
      this.init()
      this.clearCanvas()
    },
    getRecordList () {
      const { pageNum, pageSize, customerNameOrPhone } = this,
        userInfo = uni.$storage.get("userInfo"),
        { shopMerchantId } = userInfo;
      this.getList('customerInviteRecordPage', {
        merchantIds: [shopMerchantId],
        pageNum,
        pageSize,
        customerNameOrPhone,
      })
    },
    reception (item) {
      this.chooseItem = item
      this.$refs.receptionTips.open()
    },
    jumpPage: uni.$throttle(function () {
      this.$emit('reception', {
        item: this.chooseItem
      })
    }, 200),
    clearCanvas () {
      this.$refs.invitationCanvas.clearBoard()
    },
    openDetail (e) {
      this.couponPopupRef.open(0, {
        ...e,
        phoneNumber: e.customerPhone,
        carModel: e.carSeriesName,
        staffName: e.employeeName
      })
    }
  },
}
</script>
<style scoped lang="scss">
.layout {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(180deg, #f2f6ff 0%, #f7f9ff 100%);
  overflow: hidden;
  &-content {
    position: relative;
    height: 100%;
    margin: $margin;
  }
  .bg {
    width: 100%;
    height: toRpx(800);
    position: absolute;
    left: 0;
    background-image: url('../../assets/images/boutique/record-bg.webp');
    background-size: 100% 100%;
    top: 0;
  }
  .nav-bar {
    position: fixed;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    z-index: 9;
    display: flex;
    align-items: center;
    .back {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-title {
      font-weight: 700;
      font-size: toRpx(32);
      color: #1a1a1a;
      text-align: center;
      line-height: 100%;
      flex: 1;
    }
  }
  .box {
    padding-top: toRpx(154);
    .input-box {
      position: relative;
      margin: 0 toRpx(64);
      .input {
        padding-left: toRpx(30);
        height: toRpx(80);
        background: #ffffff;
        border: toRpx(3) solid #a8c1ff;
        border-radius: toRpx(16);
        width: 100%;
        line-height: toRpx(80);
        text-align: center;
      }
      .input-tips {
        color: #999999;
        position: absolute;
        left: 0;
        top: 0;
        height: toRpx(80);
        width: 100%;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        .icon {
          margin-left: toRpx(12);
        }
      }
      .close {
        position: absolute;
        right: 0;
        top: 0;
        width: toRpx(120);
        height: toRpx(80);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .record-box {
      height: calc(100vh - #{toRpx(224)});
      padding-top: toRpx(48);
    }
    .end-text {
      color: #999;
      text-align: center;
      padding: toRpx(50) 0;
      font-size: toRpx(24);
    }
    .list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: toRpx(48);
      margin: 0 toRpx(64);
      .item {
        background: #ffffff;
        border-radius: toRpx(16);
        box-sizing: border-box;
        padding: toRpx(24) toRpx(32);
        position: relative;
        width: 100%;
        overflow: hidden;
        .detail-btn {
          position: absolute;
          top: toRpx(24);
          right: toRpx(32);
          color: #2c66f7;
          font-size: toRpx(28);
          font-weight: 500;
          line-height: toRpx(44);
          .sprite-icon {
            margin-left: toRpx(8);
          }
        }
        .status {
          flex-shrink: 0;
          padding: toRpx(6) toRpx(16);
          border-radius: toRpx(4);
          font-weight: 500;
          font-size: toRpx(24);
          justify-content: center;
          background: #fdece9;
          color: #f24724;
          margin-left: toRpx(16);
          &.status_1 {
            background: #fff5e6;
            color: #ff9d0a;
          }
          &.status_2,
          &.status_7 {
            background: #eaf9f1;
            color: #35c376;
          }
          &.status_3 {
            background: #eeeeee;
            color: #999999;
          }
          &.status_5 {
            background: #fdece9;
            color: #f24724;
          }
        }
        .deal {
          background: #eaf9f1;
          color: #35c376;
        }
        .top {
          width: calc(100% - #{toRpx(124)});
        }
        .name {
          font-weight: 500;
          font-size: toRpx(32);
          color: #292d33;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .goods-name {
          font-weight: 500;
          font-size: toRpx(32);
          color: #2c66f7;
          margin-top: toRpx(16);
        }
        .info {
          margin-top: toRpx(16);
          font-size: toRpx(24);
          color: #999ea8;
          .value {
            margin-left: auto;
            color: #666666;
          }
        }
      }
    }
  }
}
.nothing {
  width: 100vw;
  flex-direction: column;
  margin-top: toRpx(112);
  font-size: toRpx(28);
  color: #999999;
  .icon {
    width: toRpx(676);
    height: toRpx(284);
    margin-bottom: toRpx(24);
  }
}
</style>
