<template>
  <view class="step-1">
    <view class="item flex">
      <view class="sprite-icon icon-delivery-step-1"></view>
      <view class="info">
        客户到店确认
        <view class="des">等待客户到店后操作</view>
      </view>

      <view
        class="btn flex"
        @click="confirmArrive"
      >确认到店</view>
    </view>
    <view class="tips">
      <view class="title flex">
        <view class="icon">
          <uni-icons
            type="info"
            :size="16"
            color="#F59619"
          ></uni-icons>

        </view>交付要点
      </view>
      <view class="text">核实车款： 引导客户现场完成尾款支付，并确认款项到账。</view>
      <view class="text">核验人车： 核对客户身份信息，并与客户共同确认车辆信息及实际车况。</view>
      <view class="text">交接资料： 清点并交付车辆登记证、行驶证、车钥匙等重要物品。</view>
      <view class="text">签署确认： 引导客户签署《车辆交付确认书》，完成交付流程。 </view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    step: [String, Number],
    detail: {
      type: Object,
      default: () => {
        return {}
      }
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
    async confirmArrive () {
      try {
        uni.$track.add({
          eventCode: 'app_delivery_arrive_shop'
        })
        uni.showLoading({ title: '确定中...', mask: true })
        const { step, detail } = this,
          { deliveryOrderId } = detail,
          { data: { code, msg } } = await uni.$api.usedCarApi.confirmArrive({
            deliveryOrderId
          })
        uni.hideLoading()
        if (code == 0) {
          this.$emit('comfirm', step)
          this.$emit('refreshLog')
        }
        else throw msg
      } catch (error) {
        uni.hideLoading()
        if (error) this.$emit('openError', error)
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.step-1 {
  margin: 0 toRpx(48);
  .item {
    height: toRpx(144);
    border-radius: toRpx(16);
    background: #ffffff;
    margin-bottom: toRpx(24);
    box-sizing: border-box;
    padding: 0 toRpx(32);
    .sprite-icon {
      zoom: 2;
    }
    .info {
      margin-left: toRpx(24);
      color: #333333;
      font-size: toRpx(28);
      font-weight: 500;
      line-height: toRpx(40);
      .des {
        color: #666666;
        font-size: toRpx(26);
        font-weight: 400;
        line-height: toRpx(36);
        margin-top: toRpx(4);
      }
    }
    .btn {
      margin-left: auto;
      width: toRpx(192);
      height: toRpx(64);
      border-radius: toRpx(48);
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
      font-size: toRpx(28);
      font-weight: 500;
      justify-content: center;
    }
  }
  .tips {
    height: toRpx(272);
    border-radius: toRpx(16);
    background: #fef4e8;
    box-sizing: border-box;
    padding: toRpx(24) toRpx(32) toRpx(24) toRpx(72);
    color: #f59619;
    font-size: toRpx(26);
    line-height: toRpx(44);
    .title {
      font-weight: 500;
      line-height: toRpx(36);
      margin-bottom: toRpx(12);
      position: relative;
    }
    .icon {
      position: absolute;
      right: calc(100% + #{toRpx(8)});
      top: 50%;
      transform: translateY(-50%) rotate(180deg);
      width: toRpx(32);
      height: toRpx(32);
    }
  }
}
</style>