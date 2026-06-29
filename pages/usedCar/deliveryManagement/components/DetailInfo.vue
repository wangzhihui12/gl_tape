<template>
  <view class="detail-info-box">
    <template v-if="detail.id">
      <view class="pay-info box">
        <view class="title">财务信息</view>
        <view class="item">
          <view class="label">付款状态</view>
          <view :class="['value await',{'success':detail.paymentStatus == 1}]">{{PAYMENT_STATUS[detail.paymentStatus]}}</view>
        </view>
        <template v-if="detail.paymentStatus != 1">
          <view class="tips">
            <view class="icon">
              <uni-icons
                type="info"
                :size="16"
                color="#F59619"
              ></uni-icons>
            </view>
            中拍人现场看车后支付，请门店人员确认客户完成车款支付。
          </view>
        </template>
      </view>
      <view class="car-info box">
        <view class="title">车辆与客户信息</view>
        <template v-for="(i,index) in carInfo">
          <view
            class="item-box"
            :key="index"
          >
            <view class="item">
              <view class="label">{{i.label}}</view>
              <view class="value">{{detail[i.key] || '-'}}</view>
            </view>
            <template v-if="i.hasLine">
              <view class="line"></view>
            </template>
          </view>
        </template>
        <template v-if="detail.paymentStatus != 1">
          <view class="tips">
            <view class="icon">
              <uni-icons
                type="info"
                :size="16"
                color="#F59619"
              ></uni-icons>
            </view>
            交付专员需确认交付车辆信息，与买家信息无误后才可交付。
          </view>
        </template>
      </view>
      <view class="log-info box">
        <view class="title">操作日志</view>
        <view class="log-box">
          <template v-for="(i,index) in logList">
            <view
              class="log-item"
              :key="index"
            >
              <view class="log-title">{{OP_TYPE[i.opType]}}</view>
              <view class="item">
                <view class="label">操作人</view>
                <view class="value">{{i.opUserName}}</view>
              </view>
              <view class="item">
                <view class="label">时间</view>
                <view class="value">{{i.createdDate}}</view>
              </view>
              <view class="item-mark">
                <view :class="['circle',{first:index == 0}]"></view>
                <template v-if="index != logList.length - 1">
                  <view class="mark-line"></view>
                </template>
              </view>
            </view>
          </template>
        </view>
      </view>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
import { PAYMENT_STATUS, OP_TYPE } from '../contant'

export default {
  name: '',
  props: {
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      OP_TYPE,
      PAYMENT_STATUS,
      logList: [],
      carInfo: Object.freeze([
        {
          label: '车型名称',
          key: 'vehicleTitle'
        },
        {
          label: '车牌号',
          key: 'licensePlate'
        },
        {
          label: '车架号',
          key: 'vin'
        },
        {
          label: '当前位置',
          key: 'currentLocation',
          hasLine: true
        },
        {
          label: '客户姓名',
          key: 'buyerName'
        },
        {
          label: '联系方式',
          key: 'buyerContact'
        },
        {
          label: '提车地址',
          key: 'pickupAddress'
        },
        {
          label: '成交时间',
          key: 'transactionTime',
          hasLine: true
        },
        {
          label: '保管人姓名',
          key: 'custodianName'
        },
        {
          label: '车辆保管人电话',
          key: 'custodianPhone'
        },
        {
          label: '交付专员',
          key: 'handlerName'
        },
        {
          label: '交付专员电话',
          key: 'handlerPhone',
        },

      ])
    }
  },
  watch: {
    detail: {
      handler (val) {
        if (val.deliveryOrderId) this.getDeliveryOrderOpLog()
      },
      deep: true
    }
  },
  mounted () {
  },
  methods: {
    async getDeliveryOrderOpLog () {
      const { deliveryOrderId } = this.detail,
        data = await uni.$api.usedCarApi.getDeliveryOrderOpLog({
          deliveryOrderId
        })
      this.logList = data
      console.log(data)
    },
  }
}
</script>

<style scoped lang='scss'>
.detail-info-box {
  padding: toRpx(48);
  .box {
    border-radius: toRpx(16);
    background: #ffffff;
    margin-bottom: toRpx(24);
    box-sizing: border-box;
    padding: 0 toRpx(24) toRpx(24);
    .tips {
      margin-top: toRpx(28);
      border-radius: toRpx(16);
      background: #fef4e8;
      box-sizing: border-box;
      padding: toRpx(16) toRpx(16) toRpx(16) toRpx(56);
      color: #f59619;
      font-size: toRpx(26);
      line-height: toRpx(36);
      position: relative;
      .icon {
        position: absolute;
        top: toRpx(16);
        left: toRpx(16);
        transform: rotate(180deg);
        width: toRpx(32);
        height: toRpx(32);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .item {
      margin-top: toRpx(28);
      line-height: toRpx(40);
      display: flex;
      font-size: toRpx(28);
      .label {
        color: #999999;
        width: toRpx(208);
      }
      .value {
        width: calc(100% - #{toRpx(208)});
        color: #333333;
      }
      .await {
        color: #f59619;
      }
      .success {
        color: #2cca74;
      }
    }
    .line {
      margin-top: toRpx(28);
      width: 100%;
      height: toRpx(2);
      background: #f7f7f6;
    }
    .title {
      padding-top: toRpx(24);
      color: #333333;
      font-size: toRpx(32);
      font-weight: 500;
      line-height: toRpx(48);
    }
  }
  .log-info {
    margin-bottom: 0;
    .log-box {
      padding-top: toRpx(32);
      .log-item {
        min-height: toRpx(188);
        position: relative;
        padding-left: toRpx(60);
        .item {
          margin-top: toRpx(16);
          .label {
            width: toRpx(168);
          }
          .value {
            width: calc(100% - #{toRpx(168)});
            word-break: break-all;
          }
        }
        .item-mark {
          position: absolute;
          top: 0;
          left: 0;
          width: toRpx(32);
          .mark-line {
            height: toRpx(180);
            width: toRpx(2);
            background: #d6e4ff;
            position: absolute;
            top: toRpx(8);
            left: 50%;
            transform: translateX(-50%);
          }
          .circle {
            position: relative;
            width: toRpx(20);
            height: toRpx(20);
            background: #8eb2fb;
            border-radius: 100%;
            margin: toRpx(8) auto 0;
            z-index: 2;
          }
          .first {
            width: toRpx(32);
            height: toRpx(32);
            background: #d6e4ff;
            position: relative;
            &::before,
            &::after {
              content: '';
              position: absolute;
              border-radius: 100%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            &::before {
              width: toRpx(20);
              height: toRpx(20);
              background: #2c66f7;
            }
            &::after {
              width: toRpx(10);
              height: toRpx(10);
              background: #fff;
            }
          }
        }
      }
      .log-title {
        color: #333333;
        font-size: toRpx(32);
        font-weight: 500;
        line-height: toRpx(44);
      }
    }
  }
}
</style>