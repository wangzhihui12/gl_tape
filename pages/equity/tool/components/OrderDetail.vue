<template>
  <view class="order-detail">
    <view class="common-title">订单详情</view>
    <view
      v-if="orderInfo.orderCode"
      class="px-48 scroll-y"
      :key="viewKey"
    >
      <view class="top-tips flex align-center">
        <view class="sprite-icon icon-successIcon checkbox-filled"></view>
        <view>
          <view class="fs-34 fw-5">支付成功</view>
          <view class="fs-26 mt-12 cl-gray">订单支付成功，实付{{orderInfo.totalPrice}}元</view>
        </view>
        <view class="sprite-icon icon-topTipsRightIcon topTipsRightIcon"></view>
      </view>
      <view class="order-tips">
        <view class="order-tips-title">温馨提示</view>
        <view class="order-tips-item">1. 客户服务合同：手机端支持ocr快速出单，点下一步去提单或权益订单补录；</view>
        <view class="order-tips-item">2. 合同出单失败：若页面提示出单失败，请根据页面提示修改信息点重新提交即可。</view>
      </view>
      <!-- 工单信息 -->
      <view class="box-shell pt-32">
        <view class="box-shell-title">订单信息</view>
        <view class="order-info pt-16">
          <view
            v-for="(item, index) in orderObj"
            :key="index"
            class="flex align-center pt-16"
          >
            <view class="label">{{ item.label }}</view>
            <view class="value">
              <template v-if="item.type == 'project'">
                <template v-for="(subItem,ind) in (orderInfo.quotationGoodsInfoList || orderInfo.subOrderList)">
                  <view
                    class="goodsName"
                    :key="ind"
                  >{{subItem.goodsNameAlias||subItem.upgradeGoodsName||subItem.goodsName}} <text
                      class="goodsItem"
                      v-if="subItem.serviceItems||subItem.position"
                    >(包含{{subItem.serviceItems||subItem.position}})</text></view>
                </template>
              </template>
              <template v-else-if="item.type =='status'">
                <view class="status">已支付</view>
              </template>
              <template v-else>
                <template v-if="item.format">
                  {{ item.format(orderInfo) }}
                </template>
                <template v-else>
                  {{orderInfo[item.key] || '--'}}
                </template>
              </template>
            </view>
          </view>
        </view>
      </view>

      <view class="flex align-center footer-box justify-center">
        <view
          class="edit btn"
          @click="$emit('jump','OrderManagement')"
        >返回列表</view>
      </view>
    </view>
  </view>
</template>
<script>
import utils from '@/utils/utils'
import dayjs from 'dayjs'
import { index } from '@/env'
export default {
  name: 'OrderDetail',
  components: {
  },
  props: {
    transmissionOfData: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    transmissionOfData: {
      async handler (newVal) {
        console.log(newVal)
        if (newVal) this.getOrderDetail(newVal.payId)
      },
      immediate: true
    }
  },
  data () {
    return {
      orderInfo: {},
      viewKey: Date.now(),
      orderObj: Object.freeze([
        {
          label: '订单编号',
          key: 'orderCode'
        },
        {
          label: '订单时间',
          format: (val) => {
            return val.orderTime ? dayjs(val.orderTime).format('YYYY年MM月DD日 HH:mm:ss') : '--'
          }
        },
        {
          label: '应付金额',
          format: (val) => {
            return val.totalPrice ? `${val.totalPrice}元` : '--'
          }
        },
        {
          label: '实付金额',
          format: (val) => {
            return val.totalPrice ? `${val.totalPrice}元` : '--'
          }
        },
        {
          label: '订单状态',
          type: 'status'
        },
        {
          label: '客户姓名',
          key: 'customerName',
          format: (val) => {
            return val.customer.customerName || '--'
          }
        },
        {
          label: '车架号',
          key: 'standNo',
          format: (val) => {
            return val.customer.standNo || '--'
          }
        },
        {
          label: '支付时间',
          key: 'paySuccessDate',
          format: (val) => {
            return dayjs(val.paySuccessDate || new Date()).format('YYYY年MM月DD日 HH:mm:ss')
          }
        },
        {
          label: '增值车损',
          type: 'project'
        },
      ])
    }
  },
  async mounted () { },
  methods: {
    async getOrderDetail (payId) {
      const data = await uni.$api.equityApi.getOrderDetail({ orderCode: payId })
      // this.orderInfo.total_price = data.totalPrice
      this.orderInfo = data
      this.viewKey = Date.now()
    },
  }
}
</script>
<style scope lang="scss">
.order-detail {
  position: relative;
  height: 100%;
  .order-tips {
    padding: 24rpx 32rpx;
    font-size: 26rpx;
    border-radius: 0 0 toRpx(16) toRpx(16);
    background: #fff;
    &-title {
      color: #999999;
      line-height: 36rpx;
    }
    &-item {
      margin-top: 12rpx;
      color: #666666;
    }
  }
  // Popup样式
  ::v-deep .tipsPopup .uni-popup__wrapper {
    width: toRpx(848);
    height: toRpx(744);
    border-radius: toRpx(42);
    background: rgb(255, 255, 255) !important;
    .tipsPopupBg {
      border-radius: toRpx(42) toRpx(42) 0 0;
      width: 100%;
      height: toRpx(244);
    }
    .title {
      color: #333333;
      font-size: toRpx(40);
      font-weight: 500;
      text-align: center;
      margin-top: toRpx(48);
    }
    .tipsConent {
      text-align: center;
      color: #666666;
      font-size: toRpx(32);
      font-weight: 400;
      padding: toRpx(16) toRpx(64);
      line-height: toRpx(48);
      text {
        color: #347bff;
      }
    }
    .isExistTips-btn-box {
      display: flex;
      justify-content: center;
      position: absolute;
      border-radius: 0 0 toRpx(42) toRpx(42);
      bottom: toRpx(40);
      width: 100%;
      .btn {
        height: toRpx(80);
        border-radius: toRpx(48);
        opacity: 1;
        line-height: toRpx(80);
        text-align: center;
        color: rgba(26, 26, 26, 0.6);
        font-size: toRpx(32);
        font-weight: 500;
        margin: auto toRpx(64);
      }

      .sure-btn {
        color: #fff;
        background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      }
    }
  }
  ::v-deep .warrantyPopup .uni-popup__wrapper {
    width: 36%;
    height: toRpx(808);
    border-radius: toRpx(32);
    background: #fff !important;
    .popup-top-box {
      padding: toRpx(48) toRpx(64);
      border-radius: toRpx(32);
      font-size: toRpx(40);
      font-weight: 500;
      text-align: left;
      background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%) !important;
    }
    .warranty-content {
      padding: toRpx(0) toRpx(64);
      .name {
        color: #666666;
        font-size: toRpx(32);
        font-weight: 400;
        margin-bottom: toRpx(48);
      }
      .label {
        color: #333333;
        font-size: toRpx(32);
        font-weight: 400;
        margin-bottom: toRpx(24);
      }
      .warranty-input {
        border-radius: 12px;
        background: #f4f5f7;
        height: toRpx(216);
        width: 100%;
        margin-bottom: toRpx(24);
        padding: toRpx(32) toRpx(32) toRpx(32) toRpx(32);
        .uni-textarea-placeholder {
          color: #999999;
          font-size: toRpx(32);
          font-weight: 400;
        }
      }
      .tips {
        color: #666666;
        font-size: toRpx(28);
        font-weight: 400;
      }
    }
  }
  ::v-deep .calendarPopup .uni-popup__wrapper {
    width: 100%;
    height: 62vh;
    .calendar {
      width: 100%;
      height: calc(100% - #{toRpx(164)});
    }
  }
  .scroll-y {
    height: calc(100% - #{toRpx(248)});
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      background: transparent;
    }
  }
  .construction-flag-y {
    height: calc(100% - #{toRpx(182)});
  }
  .px-48 {
    padding: 0 toRpx(48);
  }
  .pt-6 {
    padding-top: toRpx(6);
  }
  .pt-8 {
    padding-top: toRpx(8);
  }
  .pt-16 {
    padding-top: toRpx(16);
  }
  .pt-20 {
    padding-top: toRpx(20);
  }
  .pt-12 {
    padding-top: toRpx(12);
  }
  .mb-12 {
    margin-bottom: toRpx(12);
  }
  .fs-14 {
    font-size: toRpx(14);
  }
  .fs-32 {
    font-size: toRpx(32);
  }
  .fs-26 {
    font-size: toRpx(26);
  }
  .fs-34 {
    font-size: toRpx(34);
  }
  .fw-5 {
    font-weight: 500;
  }
  .fw-7 {
    font-weight: 700;
  }
  .fs-13 {
    font-size: toRpx(13);
  }
  .ml-12 {
    margin-left: toRpx(12);
  }
  .mr-8 {
    margin-right: toRpx(8);
  }
  .mt-12 {
    margin-top: toRpx(12);
  }
  .mt-20 {
    margin-top: toRpx(20);
  }
  .my-16 {
    margin: toRpx(16) 0;
  }
  .py-8 {
    padding: toRpx(8) 0;
  }
  .py-16 {
    padding: toRpx(16) 0;
  }
  .pt-32 {
    padding-top: toRpx(32) !important;
  }
  .mb-20 {
    margin-bottom: toRpx(20);
  }
  .cl-gray {
    color: #666666;
  }
  .flex-1 {
    flex: 1;
  }
  .date-box {
    display: flex;
    align-items: center;
    position: relative;
  }

  .date-box-label {
    font-weight: 400;
    font-size: toRpx(28);
    color: #333333;
  }

  .date-box-value {
    font-weight: 500;
    font-size: toRpx(40);
    color: #333333;
  }

  .required {
    color: #f00;
    margin-left: toRpx(8);
  }
  .handlerBtn {
    color: #4673ff;
    font-size: toRpx(26);
    font-weight: 400;
    margin-left: toRpx(8);
  }
  .customize-btn {
    color: #4673ff;
    font-size: toRpx(26);
    font-weight: 400;
    margin-left: toRpx(16);
  }
  .copy-btn {
    display: flex;
    align-items: center;
    color: #808291;
    .copy {
      margin-right: toRpx(8);
      margin-left: toRpx(20);
    }
  }
  .top-tips {
    width: 100%;
    height: toRpx(152);
    border-radius: toRpx(16) toRpx(16) 0 0;
    background: linear-gradient(136.3deg, #fdffff 0%, #ebfff6 46%, #f4fffc 100%);
    color: #333333;
    padding: 0 toRpx(32);
    position: relative;
    .checkbox-filled {
      margin-right: toRpx(24);
    }
    .topTipsRightIcon {
      position: absolute !important;
      bottom: 0;
      right: toRpx(16);
    }
  }
  .box-shell {
    width: 100%;
    border-radius: toRpx(16);
    background: #ffffff;
    padding: toRpx(24) toRpx(32);
    margin-top: toRpx(16);
    &-title {
      font-size: toRpx(28);
      color: #333333;
      font-weight: 400;
    }
    .meal-box {
      border-radius: toRpx(24);
      border: toRpx(2) solid #dce0e6;
      padding: toRpx(24) toRpx(32);
      box-sizing: border-box;
      margin-top: toRpx(16);
      .meal-hd {
        color: #333333;
        font-size: toRpx(32);
        font-weight: 400;
        margin-bottom: toRpx(20);
        .price {
          font-weight: 500;
        }
      }
      .meal-bd {
        background: #f6f7fa;
        border-radius: toRpx(16);
        padding: 0 toRpx(32);
        box-sizing: border-box;
        .meal-bd-head {
          border-bottom: toRpx(2) solid #dce0e6;
          padding: toRpx(24) 0;
          .name {
            color: #333333;
            font-size: toRpx(28);
            font-weight: 400;
          }
          .meal-bd-bottom {
            color: #999999;
            font-size: toRpx(24);
            font-weight: 400;
            margin-left: toRpx(8);
          }
          .price {
            color: #333333;
            font-size: toRpx(28);
            font-weight: 400;
          }
        }
        .meal-bd-box:last-child .meal-bd-head {
          border-bottom: none;
        }
      }
    }
    .good-list {
      margin-top: toRpx(16);
      .good {
        color: #333333;
        font-size: toRpx(28);
        border-radius: toRpx(24);
        background: #f5f7fa;
        padding: toRpx(30) toRpx(24) toRpx(24) toRpx(24);
        margin-bottom: toRpx(16);
        .good-name {
          font-weight: 400;
          flex: 4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .good-price {
          font-weight: 500;
          flex: 1;
          text-align: right;
        }
        .good-alias {
          font-size: toRpx(24);
          font-weight: 400;
        }
        .good-sku {
          color: #999999;
          font-size: toRpx(24);
          font-weight: 400;
        }
        .good-count {
          color: #999999;
          font-size: toRpx(24);
          font-weight: 400;
        }
      }
    }
    .coupon-name {
      color: #292d33;
      font-size: toRpx(24);
      font-weight: 400;
      margin-left: toRpx(8);
    }
    .good-total-lable {
      color: #757980;
      font-size: toRpx(28);
      font-weight: 400;
    }
    .good-total-value {
      color: #4673ff;
      font-size: toRpx(40);
      font-weight: 700;
    }

    .order-info {
      .value .value-item text {
        margin: 0 toRpx(6);
      }
      .label {
        width: toRpx(156);
        color: #999999;
        font-size: toRpx(26);
        font-weight: 400;
      }
      .value {
        color: #222222;
        font-size: toRpx(26);
        font-weight: 400;
        .goodsItem {
          color: #999999;
          font-size: 26rpx;
        }
        .status {
          color: #2cca74;
        }
      }
      .image-box {
        .value {
        }
        .image {
          width: toRpx(106);
          height: toRpx(112);
          margin-right: toRpx(16);
          image {
            width: 100%;
            height: 100%;
            border-radius: toRpx(8);
          }
        }
      }
    }

    .warranty-list {
      .value .value-item text {
        margin: 0 toRpx(6);
      }
      .label {
        width: toRpx(156);
        color: #999999;
        font-size: toRpx(26);
        font-weight: 400;
      }
      .value {
        color: #222222;
        font-size: toRpx(26);
        font-weight: 400;
      }
      .codeImg-box {
        .barCode {
          color: #292d33;
          font-size: toRpx(28);
          font-weight: 400;
        }
        .barCodeImg {
          width: toRpx(600);
          height: toRpx(158);
        }
      }
      .edit-warranty {
        color: #347bff;
        font-size: toRpx(28);
        font-weight: 400;
      }
    }
    .warranty-tips {
      margin-bottom: toRpx(12);
    }
    .customerService {
      width: toRpx(320);
      height: toRpx(320);
    }
  }

  .footer-box {
    position: absolute;
    bottom: toRpx(24);
    width: 100%;
    left: 0;
    .btn {
      width: 80%;
      height: toRpx(80);
      border-radius: toRpx(48);
      font-size: toRpx(28);
      font-weight: 500;
      line-height: toRpx(80);
      text-align: center;
    }
    .confirm {
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
      margin-left: toRpx(32);
    }
    .edit {
      background: #3b73ff1a;
      color: #4673ff;
    }
  }
}
</style>
