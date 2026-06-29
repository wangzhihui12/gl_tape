<template>
  <div class="button-module flex">
    <view class="common-btn" @click.stop="handleClick('details')">详情</view>
    <view v-if="!subStatus && status != 100 && status != '-1'" class="common-btn ml-24" @click.stop="handleClick('edit')">编辑</view>
    <view v-if="status == 20 && !subStatus" class="common-btn ml-24" @click.stop="handleClick('requote', 'app_evaluate_requote')">重新报价</view>
    <view v-if="status == 20 && !subStatus" class="common-btn blue-btn ml-24" @click.stop="handleClick('sign', 'app_evaluate_sign')">客户签约</view>
    <view v-if="subStatus == 1" class="common-btn gray-btn ml-24" @click.stop="handleClick('signing')">签约中</view>
    <view v-if="subStatus == 1 && status == 20" class="common-btn ml-24" @click.stop="handleClick('withdrawal', 'app_evaluate_withdrawal')">撤回合同</view>
    <view v-if="subStatus == 2 || subStatus == 3" class="common-btn gray-btn ml-24" @click.stop="handleClick('paying')">支付中</view>
    <view v-if="status == 30 && !subStatus" class="common-btn ml-24" @click.stop="handleClick('cancelSign', 'app_evaluate_cancel_sign')">取消签约</view>
    <view v-if="status == 31 && !subStatus" class="common-btn blue-btn ml-24" @click.stop="handleClick('signAgreement', 'app_evaluate_cancel_sign')">确认代保管</view>
    <view v-if="status == 30 && !subStatus && paymentType == 1" class="common-btn blue-btn ml-24" @click.stop="handleClick('payDeposit', 'app_evaluate_pay_deposit')">支付定金</view>
    <view v-if="(status == 30 && !subStatus && paymentType == 2 && previousStatus == '-1') || (status == 32 && !subStatus && paymentType == 2 && previousStatus == 31)" class="common-btn blue-btn ml-24" @click.stop="handleClick('payFull', 'app_evaluate_pay_full')">支付全款</view>

    <view v-if="status == 32 && !subStatus && paymentType == 1" class="common-btn blue-btn ml-24" @click.stop="handleClick('payFull', 'app_evaluate_pay_final')">支付尾款</view>
    <view v-if="(status == 30 && !subStatus && paymentType == 2 && previousStatus == 20) || (status == 40 && !subStatus && previousStatus == 30 && paymentType == 1)" class="common-btn blue-btn ml-24" @click.stop="handleClick('confirmDelivery', 'app_evaluate_confirm_delivery')">确认交车</view>
    <view v-if="status == '-1'" class="common-btn blue-btn ml-24" @click.stop="handleClick('reSubmit', 'app_evaluate_re_submit')">重新提交</view>
  </div>
</template>

<script>
import { throttle } from 'lodash'
export default {
  name: 'ButtonModule',
  props: {
    status: {
      type: Number,
      default: 10
    },
    subStatus: {
      type: Number,
      default: ''
    },
    paymentType: {
      type: Number,
      default: 1
    },
    previousStatus: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      localUrl: this.src
    }
  },
  methods: {
    handleClick: throttle(function (buttonType, eventCode) {
      this.$emit('button-click', {
        type: buttonType
      })
      if (eventCode)
        uni.$track.add({
          eventCode
        }) //点击埋点
    }, 1000)
  }
}
</script>

<style scoped lang="scss">
.button-module {
  .common-btn {
    border-radius: toRpx(64);
    background: #e9effe;
    color: #3b73ff;
    font-size: toRpx(28);
    font-weight: 400;
    padding: toRpx(12) toRpx(40);
  }
  .blue-btn {
    background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    color: #ffffff;
  }
  .gray-btn {
    background: #f0f1f5;
    color: #999ea8;
  }
}
</style>
