<template>
  <view class="customer-flow-box">
    <view class="customer-flow-title">门店客流情况</view>
    <view class="sprite-icon icon-customer-flow"></view>
    <view class="deliveries flex">
      累计交付数
      <view class="num">{{formattedNumber('cumulativeDeliveryCount')}}</view>
    </view>
    <view class="touchpoints flex">
      实际触客数
      <view class="num">{{formattedNumber('actualContactCount')}}</view>
    </view>
    <view class="touchpoint-rate">
      实际触客率
      <view :class="['num',{'rate-color':dataShow && pageData.contactRate}]">{{formattedNumber('contactRate', '%')}}</view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    pageData: {
      type: Object,
      default: () => { }
    },
     dataShow: {
      type: Boolean,
      default: true
    }
  },
  name: '',
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    formattedNumber (key, unit) {
      let { dataShow, pageData } = this,
        num = pageData[key]
      if (unit && num) num += unit
      if (!dataShow || !num) num = '--'
      return num
    }
  }
}
</script>

<style scoped lang='scss'>
.customer-flow-box {
  position: relative;
  height: toRpx(422);
  color: #333333;
  .customer-flow-title {
    font-size: toRpx(28);
    font-weight: 500;
    padding: toRpx(24) toRpx(32) 0;
  }
  .sprite-icon {
    position: absolute;
    top: 0;
    left: 0;
    zoom: 2;
  }
  .deliveries,
  .touchpoints,
  .touchpoint-rate {
    position: absolute;
    font-size: toRpx(20);
    box-sizing: border-box;
    flex-direction: column;
    .num {
      transition: all 0.15s;
    }
  }
  .deliveries,
  .touchpoints {
    color: #ffffff;
    width: toRpx(400);
    height: toRpx(128);
    left: toRpx(32);
    .num {
      font-size: toRpx(24);
      font-weight: 500;
    }
  }
  .deliveries {
    top: toRpx(108);
    padding-top: toRpx(54);
  }
  .touchpoints {
    top: toRpx(236);
    padding-top: toRpx(37);
  }
  .touchpoint-rate {
    top: toRpx(208);
    left: toRpx(424);
    .num {
      font-size: toRpx(28);
      font-weight: 700;
    }
    .rate-color {
      color: #4673ff;
    }
  }
}
</style>