<!-- evaluationCard.vue -->
<template>
  <view class="card-box" v-if="carInfo.evalOrderNo">
    <view class="flex align-center justify-between mb-24">
      <view class="status-box">
        <text class="label">工单编号</text>
        <text class="value ml-12">{{ carInfo.evalOrderNo }}</text>
      </view>
      <view :class="['status', statusClass(carInfo.status)]">{{ statusMap[carInfo.status].name }}</view>
    </view>
    <view class="car-info-box flex align-start">
      <image :src="carInfo.coverImage" alt="" />
      <view class="ml-32 flex-1">
        <view class="flex align-center car-type-name mb-16">
          {{ carInfo.carSeriesName + ' ' + carInfo.carTypeName }}
          <view class="common-label ml-20">{{ carInfo.previousOwnerName }} {{ carInfo.previousOwnerPhone }}</view>
        </view>
        <view class="flex mb-20">
          <view class="car-number mr-12">{{ carInfo.licensePlate }}</view>
          <view class="car-number mr-12">{{ carInfo.registrationDateStr }}</view>
          <view class="car-number mr-12">{{ carInfo.mileageStr }}</view>
          <view class="car-number mr-12">{{ carInfo.transferCountStr }}</view>
          <view class="car-number">{{ vehicleCategoryMap[carInfo.vehicleCategory] }}</view>
        </view>
        <view class="info-row flex mb-30">
          <view class="info-item flex align-center">
            <text class="common-label flex-shrink-0">销售顾问</text>
            <view class="common-value text-ellipsis ml-16">{{ carInfo.sellerMerchantName }} | {{ carInfo.sellerName }}</view>
          </view>
          <view class="info-item flex align-center">
            <text class="common-label flex-shrink-0">转化人员</text>
            <view class="common-value text-ellipsis ml-16">{{ carInfo.conversionMerchantName }} | {{ carInfo.conversionName }}</view>
          </view>
          <view class="info-item flex align-center">
            <text class="common-label flex-shrink-0">工单时间</text>
            <view class="common-value text-ellipsis ml-16">{{ carInfo.evalOrderTime }}</view>
          </view>
          <view class="info-item flex align-center" v-if="(carInfo.status != 10 && carInfo.status != 20 && carInfo.status != -1) || (carInfo.previousStatus != 10 && carInfo.status == -1)">
            <text class="common-label flex-shrink-0">签约时间</text>
            <view class="common-value text-ellipsis ml-16">{{ carInfo.signingSaleDate }}</view>
          </view>
        </view>
        <view class="flex justify-between align-center">
          <view class="flex">
            <text class="common-label">评估价格</text>
            <view class="price ml-16" :class="{ 'text-blue': carInfo.evalPriceDisplay && carInfo.status != 10 }">
              {{ carInfo.status == 10 || (carInfo.previousStatus == 10 && carInfo.status == -1) ? '评估中' : carInfo.evalPriceDisplay }}
              <text v-if="carInfo.paymentType == 1 && carInfo.status != 10" class="text-gray ml-16">(定金: {{ carInfo.depositPrice }}元 | 尾款: {{ carInfo.finalPrice }}元)</text>
              <text v-if="carInfo.paymentType == 2 && carInfo.status != 10" class="text-gray ml-16">(全款: {{ carInfo.evalPrice }}元 )</text>
            </view>
          </view>
          <ButtonModule @button-click="$emit('button-click', { ...$event, ...carInfo })" :status="carInfo.status" :subStatus="carInfo.subStatus" :paymentType="carInfo.paymentType" :previousStatus="carInfo.previousStatus"></ButtonModule>
        </view>

        <view v-if="carInfo.status == -1">
          <view class="text-ellipsis tips px-20 justify-between">
            <view class="flex-1 flex align-center">
              <view class="sprite-icon icon-study-tips"></view>
              <view class="text-ellipsis">驳回原因：{{ carInfo.rejectReason || '-' }}</view>
            </view>
            <view class="flex-1 flex align-center" v-if="carInfo.previousStatus == 10 && carInfo.status == -1">
              <view class="sprite-icon icon-feedbackIcon"></view>
              <view class="text-ellipsis">驳回意见：{{ carInfo.rejectSuggestion || '-' }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import ButtonModule from './ButtonModule.vue'
import { statusMap, vehicleCategoryMap } from '../evaluationFormMap.js'

export default {
  components: {
    ButtonModule
  },
  props: {
    carInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      statusMap,
      vehicleCategoryMap
    }
  },
  methods: {
    statusClass(status) {
      return status > 0 ? `status-${status}` : 'status-0'
    }
  }
}
</script>
<style scoped lang="scss">
.card-box {
  border-radius: toRpx(24);
  padding: toRpx(24) toRpx(40);
  background: #ffffff;
  box-shadow: 0 toRpx(6) toRpx(24) 0 #2a61eb1a;
  margin: 0 toRpx(50);
  &:first-child {
    margin-top: toRpx(40);
  }
  &:last-child {
    margin-bottom: toRpx(40);
  }

  .status-box {
    .label {
      color: #999ea8;
      font-size: toRpx(24);
      font-weight: 400;
    }
    .value {
      color: #666666;
      font-size: toRpx(24);
      font-weight: 400;
    }
  }
  .status {
    border-radius: toRpx(4);
    background: #fef4e8;
    padding: 0 toRpx(20);
    font-size: toRpx(24);
    font-weight: 500;
    height: toRpx(44);
    line-height: toRpx(44);
  }
  // 状态颜色
  .status-10 {
    color: #f59619;
    background: #fef4e8;
  }
  .status-20 {
    color: #6a56f0;
    background: #f0eefd;
  }
  .status-30 {
    color: #2cca74;
    background: #e9f9f1;
  }
  .status-31 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-32 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-40 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-50 {
    color: #5842eb;
    background: #eeecfd;
  }
  .status-100 {
    color: #2cca74;
    background: #e9f9f1;
  }
  // 驳回
  .status-0 {
    color: #eb4e4e;
    background: #fdeded;
  }
  .car-info-box {
    uni-image {
      width: toRpx(240);
      height: toRpx(180);
      border-radius: toRpx(12);
    }
    .car-type-name {
      color: #292d33;
      font-size: toRpx(30);
      font-weight: 500;
    }
    .car-number {
      color: #9398a3;
      font-size: toRpx(22);
      border-radius: toRpx(4);
      opacity: 1;
      border: toRpx(2) solid #e8ecf0;
      padding: toRpx(6) toRpx(12);
    }
    .common-label {
      color: #999ea8;
      font-size: toRpx(24);
      font-weight: 400;
    }
    .common-value {
      color: #666666;
      font-size: toRpx(24);
      font-weight: 400;
    }
    .text-ellipsis {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      word-break: break-all;
      flex: 1;
    }
    .info-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: toRpx(16) toRpx(24);

      .info-item {
        min-width: 0;
      }

      .flex-shrink-0 {
        flex-shrink: 0;
      }
    }
    .price {
      color: #666666;
      font-size: toRpx(32);
      font-weight: 400;
    }
    .text-blue {
      color: #3b73ff;
      font-size: toRpx(32);
      font-weight: 700;
    }
    .text-gray {
      color: #999ea8;
      font-size: toRpx(24);
      font-weight: 400;
    }
    .tips {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: toRpx(28);
      width: 100%;
      height: toRpx(56);
      border-radius: toRpx(16);
      opacity: 1;
      background: #fef5ea;
      margin-top: toRpx(16);
      color: #ff9d0a;
      &-text {
        margin-top: toRpx(4);
      }

      .icon-study-tips {
        margin-right: toRpx(8);
      }
      .icon-feedbackIcon {
        margin-right: toRpx(8);
      }
      .waitinputorder-btn {
        width: toRpx(136);
        height: toRpx(50);
        border-radius: toRpx(48);
        opacity: 1;
        background: #ffffff;
        color: #4673ff;
        font-size: toRpx(24);
        font-weight: 500;
        text-align: center;
        line-height: toRpx(50);
      }
    }
  }
}
</style>
