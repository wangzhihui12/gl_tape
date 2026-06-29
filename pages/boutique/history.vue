<template>
  <view class="layout">
    <view class="bg"></view>
    <wnCanvas
      :canvasId="`c-${madiaId}`"
      :drawStatus="penSwitch"
      custom
      :scaleSwitch="false"
      ref="historyCanvas"
    >
      <template slot="customContent">
        <view class="layout-content">
          <view class="box">
            <view class="data-tabs-box">
              <view class="data-tabs">
                <template v-for="(item, index) in dateList">
                  <view
                    :class="['tab flex', { active: groupIndex == item.id }]"
                    :key="index"
                    @click="changeIndex(item.id)"
                  >{{ item.text }}</view>
                </template>
                <view :class="['active-btn', `active-btn-${groupIndex - 1}`]"></view>
              </view>
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
                        @click="handleLook(item.goodsList)"
                      >
                        <image
                          class="image-box"
                          v-if="item.payVouchers.length"
                          :src="item.payVouchers[0].payVoucher"
                        />
                        <image
                          v-else
                          class="image-box photo"
                          src="../../assets/images/boutique/photos.png"
                        />
                        <view class="gradient-overlay"></view>
                        <view class="box-desc">
                          <view class="name">
                            {{ item.customerName.substring(0, 1) + "*" || "-" }}
                          </view>
                          <view class="goods-name flex">
                            <view class="goods-label">{{
                        item.goodsList.length
                          ? item.goodsList[0].goodsName
                          : "-"
                      }}</view>
                            x {{ item.goodsList.length }}件
                            <image
                              class="image-look"
                              src="../../assets/images/boutique/look.png"
                            />
                          </view>
                          <template v-for="(k, ind) in itemObject">
                            <view
                              class="info flex"
                              :key="ind"
                            >
                              <view class="label">{{ k.label }}</view>
                              <view :class="['value text-hide',{bold: k.isBold}]">{{
                          k.format
                            ? formatTime(item[k.key])
                            : item[k.key] || "-"
                        }}</view>
                            </view>
                          </template>
                          <view class="info flex">
                            <view class="label">支付方式</view>
                            <view class="value">
                              <image
                                class="image-pay"
                                :src="
                            require(`@/assets/images/boutique/pay_${item.payType > 5 ? 5 : item.payType}.png`)
                          "
                              />
                            </view>
                          </view>
                          <view class="info flex">
                            <view class="label">实收金额</view>
                            <view class="value bold">¥ <text>{{ item.totalPrice.toFixed(2) }}</text></view>
                          </view>
                        </view>
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
      ref="historyRef"
      title="订单商品"
      :popupW="1120"
      :isFooter="false"
    >
      <view class="popup-body">
        <view class="tabel-box-header">
          <view class="tr">
            <view class="th">商品名称</view>
            <view class="th">部位</view>
            <view class="th">件数</view>
          </view>
        </view>
        <view class="tabel-container">
          <table
            class="tabel-box"
            cellspacing="0"
            border="0"
            cellpadding="0"
          >
            <tr
              v-for="i in goodsList"
              :key="i.id"
            >
              <td>{{ i.goodsName }}</td>
              <td>{{ i.goodsPositionName || "-" }}</td>
              <td>{{ i.number }}</td>
            </tr>
          </table>
        </view>
      </view>
    </MessageBox>
  </view>
</template>
<script type="text/ecmascript-6">
import dayjs from 'dayjs'
import Record from "@/mixin/record";
export default {
  name: '',
  mixins: [Record],
  props: {
    show: Boolean,
    madiaId: Number,
    penSwitch: Boolean,
  },
  data () {
    return {
      groupIndex: 1,
      goodsList: [],
      name: '',
      dateList: [
        { text: '车窗膜', id: 1 },
        { text: '其他精品', id: 2 }
      ],
      itemObject: [
        { label: '车架号', key: 'standNo' },
        { label: '工单号', key: 'orderCode' },
        { label: '交易流水号', key: 'outTradeNo' },
        { label: '订单时间', key: 'orderTime', format: true },
        { label: '销售顾问', key: 'employeeName' }
      ],
    }
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
  },
  watch: {
    show: {
      handler (newValue) {
        if (newValue) this.changeIndex(1, true)
      },
      immediate: true
    },
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.closeAllPopup()
      }
    },

  },
  methods: {
    closeAllPopup () {
      this.$refs.historyRef?.close()
    },
    formatTime (val, key) {
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
    handleLook (data) {
      this.$refs.historyRef.open()
      this.goodsList = data
    },
    changeIndex (index, isStart = false) {
      if (this.groupIndex == index && !isStart) return
      this.flag = false
      this.nothing = false
      this.total = 0
      this.list = []
      this.pageNum = 1
      this.groupIndex = index
      this.getRecordList()
      if (!isStart) this.$refs.historyCanvas.clearBoard()
    },
    getRecordList () {
      const { pageNum, pageSize, groupIndex } = this,
        userInfo = uni.$storage.get("userInfo"),
        { shopMerchantId } = userInfo;
      this.getList('historyDealOrderPage', {
        merchantIds: [shopMerchantId],
        sceneTypes: [1],
        pageNum,
        pageSize,
        goodsTypeGroup: groupIndex
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
  width: 100%;
  height: 100%;
  background-image: linear-gradient(180deg, #f1f5ff 0%, #f3f6ff 100%);
  overflow: hidden;
  &-content {
    margin: $margin;
    height: 100%;
    position: relative;
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
    .data-tabs-box {
      position: relative;
      top: 0;

      .data-tabs {
        display: flex;
        justify-content: space-between;
        width: toRpx(784);
        height: toRpx(70);
        border-radius: toRpx(370);
        margin: 0 auto;
        position: relative;

        &::after {
          position: absolute;
          z-index: -2;
          background: #ffffffb3;
          width: 100%;
          height: 100%;
          border-radius: toRpx(370);
          left: 0;
          top: 0;
          content: '';
        }

        .tab {
          width: 50%;
          height: toRpx(70);
          justify-content: center;
          font-weight: 500;
          font-size: toRpx(32);
          color: #333333;
        }

        .active {
          color: #ffffff;
        }

        .active-btn {
          position: absolute;
          width: 50%;
          height: toRpx(70);
          background: #3b73ff;
          border-radius: toRpx(360);
          top: 0;
          z-index: -1;
          transition: all 0.15s;
        }

        .active-btn-0 {
          left: 0;
        }

        .active-btn-1 {
          left: 50%;
        }
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
        border-radius: toRpx(32);
        height: toRpx(450);
        box-sizing: border-box;
        position: relative;
        box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
        z-index: 11;
        .status {
          position: absolute;
          top: toRpx(24);
          right: toRpx(32);
          width: toRpx(88);
          height: toRpx(44);
          background: #fdece9;
          color: #f24724;
          border-radius: toRpx(4);
          font-weight: 500;
          font-size: toRpx(24);
          justify-content: center;
        }

        .deal {
          background: #eaf9f1;
          color: #35c376;
        }

        .name {
          font-weight: 500;
          font-size: toRpx(32);
          color: #292d33;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 70%;
        }

        .goods-name {
          font-weight: 500;
          font-size: toRpx(32);
          color: #2c66f7;
          margin-top: toRpx(16);
          .image-look {
            width: toRpx(40);
            height: toRpx(40);
            margin-left: toRpx(10);
          }
          .goods-label {
            max-width: calc(100% - #{toRpx(180)});
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-right: toRpx(10);
          }
        }
        .image-box {
          width: toRpx(350);
          height: 100%;
          position: absolute;
          top: 0;
          //   opacity: 0.5;
          right: 0;
          background-size: 100% 100%;
          border-radius: toRpx(32);
          z-index: -1;
          &.photo {
            width: toRpx(250);
          }
        }
        .box-desc {
          padding: toRpx(24) toRpx(32);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 11;
        }
        .gradient-overlay {
          z-index: -1;
          position: absolute;
          top: 0;
          right: 0;
          width: toRpx(350);
          height: 100%;
          background: linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
        }
        .info {
          margin-top: toRpx(16);
          font-size: toRpx(24);
          color: #999ea8;
          .label {
            width: toRpx(160);
            flex-shrink: 0;
          }
          .value {
            margin-left: toRpx(20);
            color: #666666;
            .image-pay {
              width: toRpx(32);
              height: toRpx(32);
              vertical-align: middle;
            }
            &.bold {
              color: #22ac38;
              text {
                font-size: toRpx(32);
              }
            }
          }
        }
      }
    }
  }
}
.popup-body {
  .tabel-box-header {
    width: 100%;
    margin-top: toRpx(50);
    .tr {
      display: flex;
      align-items: center;
      .th {
        border: toRpx(1) solid #fff;
        color: #333333;
        font-weight: 500;
        height: toRpx(96);
        line-height: toRpx(96);
        background: #edf2ff;
        text-align: left;
        padding-left: toRpx(30);
        &:first-child {
          width: 60%;
          border-radius: toRpx(16) 0 0 toRpx(16);
        }
        &:nth-child(2) {
          width: 20%;
        }
        &:nth-child(3) {
          width: 20%;
          border-radius: 0 toRpx(16) toRpx(16) 0;
        }
      }
    }
  }
  .tabel-container {
    max-height: 50vh;
    overflow: auto;
  }
  .tabel-box {
    margin-top: toRpx(8);
    width: 100%;
    border-radius: toRpx(16);
    overflow: hidden;
    tr {
      border: toRpx(1) solid #fff;
      border-radius: toRpx(16);
      &:first-child {
        margin-bottom: toRpx(10);
      }
      td,
      th {
        border: toRpx(1) solid #fff;
        color: #333333;
        font-weight: 500;
        height: toRpx(96);
        background: #edf2ff;
        text-align: left;
        padding-left: toRpx(30);

        border: toRpx(1) solid #fff;
        &:first-child {
          width: 60%;
        }
        &:nth-child(2) {
          width: 20%;
        }
        &:nth-child(3) {
          width: 20%;
        }
      }
      th {
        border-bottom: toRpx(20) solid #fff;
      }
      td {
        height: toRpx(96);
        background: #f7f7f7;
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
