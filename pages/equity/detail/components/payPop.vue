<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-04-07 14:54:28
 * @LastEditors: huyue
 * @LastEditTime: 2024-04-11 17:12:16
-->
<template>
  <uni-popup
    ref="popup"
    type="bottom"
    :mask-click="false"
    border-radius="16px 16px 0 0"
  >
    <view class="popup-wrapper">
      <view class="popup-box">
        <view class="payment-title">{{title}}
          <view
            class="close flex"
            @click="close"
          >
            <uni-icons
              type="closeempty"
              :size="18"
              color="#1A1A1A"
            ></uni-icons>
          </view>
        </view>
        <view class="popup-content">
          <view class="tab-list">
            <view
              :class="['tab-item', { active: payActive === item.type }, {  single :paymentType.length == 1}]"
              v-for="item in paymentType"
              :key="item.type"
              @click="handleSwitchTab(item)"
            >{{ item.name }}</view>
          </view>
          <view class="payment-content">
            <template v-if="payInfo && payInfo.paymentType">
              <view
                v-show="payActive === 1"
                class="qr-code-content"
              >
                <image
                  class="qr-code-img"
                  :src="payInfo.storePaymentQrcodeUrl"
                  mode="scaleToFill"
                />
                <!-- <image
                  class="qr-code-img"
                  src="https://glsk-oss.oss-cn-shenzhen.aliyuncs.com/quality/11.png"
                  mode="scaleToFill"
                /> -->
                <view class="qr-code-info">扫码付款,支持多渠道付款</view>
              </view>
            </template>
            <template v-if="accountInfo && accountInfo.paymentType">

              <view
                v-show="payActive === 2"
                class="corporate-content"
              >
                <image
                  class="bank-logo"
                  :src="accountInfo.bankUrl"
                  mode="scaleToFill"
                />
                <view class="bank-info">
                  <view
                    class="bank-item"
                    v-for="item in accountList"
                    :key="item.field"
                  >
                    <text class="bank-label">{{ item.label }}：</text>
                    <view class="bank-value">{{ accountInfo[item.field] }}</view>
                  </view>
                </view>
              </view>
            </template>
          </view>
        </view>
        <view
          class="payment-done"
          @click="done()"
        >已支付，去上传付款凭证</view>
      </view>
    </view>
  </uni-popup>
</template>
<script>
const ACCOUT_LIST = [
  {
    label: "公司名称",
    field: "companyName",
  },
  {
    label: "基本账户",
    field: "basicAccount",
  },
  {
    label: "支行账号",
    field: "subBranchAccount",
  },
  {
    label: "一般账户",
    field: "generalAccount",
  },
  {
    label: "支付账户",
    field: "paymentAccount",
  },
];
export default {
  name: "payPop",
  props: {
  },
  data () {
    return {
      payActive: 1,
      paymentType: [],
      accountList: ACCOUT_LIST,
      title: '',
      accountInfo: {},
      payInfo: {}
    };
  },
  computed: {
    watchPayInfo () {
      return this.$store.state.user.paymentType
    },
  },
  watch: {
    watchPayInfo: {
      immediate: true,
      handler (newval) {
        this.paymentType = newval
        if (newval.length) {
          this.payInfo = newval.find(i => i.paymentType == 1) || {}
          this.accountInfo = newval.find(i => i.paymentType == 2) || {}
          this.handleSwitchTab(newval[0], false)
        }
      }
    },
  },
  methods: {
    // 切换tab
    handleSwitchTab (item, isClick = true) {
      this.payActive = item.type;
      this.title = item.title
      if (isClick) uni.$logger.local.info(`付款方式：${item.title}`)
    },
    // 显示弹窗
    show () {
      // this.payActive = 1
      // 通过组件定义的ref调用uni-popup方法 ,如果传入参数 ，type 属性将失效 ，仅支持 ['top','left','bottom','right','center']
      this.$refs.popup.open("bottom");
     if(this.title) uni.$logger.local.info(`付款方式：${this.title}`)
    },
    close () {
      this.$refs.popup.close();
    },
    // 已支付
    done () {
      // uni.navigateBack({
      //   delta: 1,
      // });
      // this.stopAudio();
      // uni.navigateTo({
      //   url: `/pages/equity/informationEntry`,
      // });
      this.$emit('jumpPay')
      this.close();
    },
  },
};
</script>
<style scoped lang="scss">
.popup-box {
  position: relative;
  margin-top: toRpx(286);
  background-color: #f8f9f9;
  height: toRpx(1160);
  padding-bottom: toRpx(30);
  .payment-title {
    position: relative;
    width: 100%;
    height: toRpx(96);
    padding: toRpx(24) 0 toRpx(26);
    text-align: center;
    border-bottom: toRpx(2) solid #e8e8e8;
    .close {
      position: absolute;
      right: 0;
      top: 0;
      width: toRpx(96);
      height: toRpx(96);
      justify-content: center;
    }
  }
}
.popup-content {
  .tab-list {
    display: flex;
    justify-content: center;
    margin-top: toRpx(40);
    .tab-item {
      width: toRpx(320);
      padding: toRpx(24) 0;
      text-align: center;
      background-color: #fff;
      color: #666;
      &.active {
        background-color: #2c66f7;
        color: #fff;
      }
      &:first-child {
        border-radius: toRpx(200) 0 0 toRpx(200);
      }
      &:last-child {
        border-radius: 0 toRpx(48) toRpx(48) 0;
      }
    }
    .single {
      border-radius: toRpx(48) !important;
    }
  }
  .payment-content {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: toRpx(40);
    .qr-code-content {
      width: toRpx(538);
      background-color: #fff;
      border-radius: toRpx(24);
      text-align: center;
      padding: toRpx(59) 0 toRpx(67);
      .qr-code-img {
        width: toRpx(420);
        height: toRpx(420);
      }
      .qr-code-info {
        margin-top: toRpx(40);
        font-weight: 500;
        font-size: toRpx(32);
        color: #1a1a1a;
      }
    }
    .corporate-content {
      width: toRpx(1080);
      background-color: #fff;
      border-radius: toRpx(24);
      .bank-logo {
        width: 100%;
        height: toRpx(136);
      }
      .bank-info {
        font-weight: 500;
        font-size: toRpx(32);
        padding: toRpx(27) toRpx(80) toRpx(39);
        .bank-item {
          display: flex;
          align-items: center;
          margin-bottom: toRpx(16);
          &:last-child {
            margin-bottom: 0;
          }
          .bank-label {
            color: #6c6c70;
            // line-height: 94rpx;
          }
          .bank-value {
            box-sizing: border-box;
            background-color: #f8f9f9;
            border-radius: toRpx(8);
            width: toRpx(740);
            height: toRpx(80);
            line-height: toRpx(80);
            padding-left: toRpx(24);
            font-weight: 500;
            font-size: toRpx(32);
            color: #1a1a1a;
            letter-spacing: 0;
          }
        }
      }
    }
  }
}
.payment-done {
  position: absolute;
  bottom: toRpx(30);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - #{toRpx(240)});
  height: toRpx(80);
  font-weight: 500;
  font-size: toRpx(32);
  color: #ffffff;
  text-align: center;
  line-height: toRpx(80);
  background-color: #2c66f7;
  border-radius: toRpx(40);
}
</style>
