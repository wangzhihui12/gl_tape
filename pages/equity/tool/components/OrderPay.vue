<template>
  <PublishPopup
    ref="payPopup"
    popupClass="payPopup"
    type="center"
    :isShowFooter="false"
  >
    <template #header>
      <view class="popup-top">
        <view class="popup-top-box flex align-center">
          <text class="popup-top-box-title">工单确认码</text>
          <view @click.stop="closePopup">
            <uni-icons
              @click.stop="closePopup"
              class="icon-close"
              type="closeempty"
            ></uni-icons>
          </view>
        </view>
      </view>
    </template>
    <template #content>
      <template v-if="orderInfo.payId">
        <view class="pos-popup">
          <template v-if="wxqrcode || posQrCode">
            <view class="price">¥{{ orderInfo.total_price }}</view>
            <image
              class="qrcode"
              :src="orderInfo.payType == 1 ? wxqrcode : posQrCode"
            ></image>
            <view class="level-1-tips">{{ orderInfo.payType == 1 ? '请让客户打开微信扫描上方付款码进行支付' : '请使用POS机扫描此码，再向客户收款' }}</view>
            <view class="level-2-tips">超过24小时未支付将关闭此订单</view>
          </template>
          <template v-else>
            <view class="loading-box">
              <image
                class="loading"
                :src="loadingIcon"
              />
            </view>

          </template>
        </view>
      </template>
    </template>
  </PublishPopup>
</template>

<script type='text/ecmascript-6'>
import PublishPopup from '@/components/PublishPopup.vue'
import qrcode from '@/utils/qrcode'
const loadingIcon = require('@/assets/images/common/loadding.gif')
export default {
  components: {
    PublishPopup
  },
  name: '',
  data () {
    return {
      loadingIcon,
      orderInfo: {},
      wxqrcode: '',
      posQrCode: '',
      zyVoucherStatus: 0,
      time: null,
      show: true
    }
  },
  computed: {
  },
  mounted () {
  },
  methods: {
    open (id) {
      uni.showLoading({
        mask: true
      })
      this.show = true
      this.orderInfo = {}
      this.wxqrcode = ''
      this.posQrCode = ''
      this.getQuotationInfoById(id)
    },
    async getQuotationInfoById (id) {
      const data = await uni.$api.equityApi.getQuotationInfoById({ id })
      this.orderInfo = data
      const params = {
        goodsIds: data?.vdQuotationGoodsList?.map(v => v.goodsId),
        merchantId: data.merchantId4s
      }
      const res = await uni.$api.equityApi.checkZyPayFlag(params)
      this.zyVoucherStatus = res ? 1 : 0
      if (data.payType == 1) this.createWxQrcode()
      if (data.payType == 3) this.createQrCodeImg()
      this.getOrderDetail()
      this.$refs.payPopup.open()
    },
    async getOrderDetail () {
      uni.hideLoading()
      if (!this.show || !this.$refs.payPopup) return
      const { payId } = this.orderInfo
      if (payId) {
        const data = await uni.$api.equityApi.getOrderDetail({ orderCode: payId })
        console.log(data, '----')
        this.orderInfo.total_price = data.finalPrice
        let { payOrder, status } = data
        if (payOrder?.payStatus == 2 || status == 4) {
          this.closePopup()
          uni.showToast({
            title: '支付成功',
            icon: 'none',
            mask: true
          })
          setTimeout(() => {
            this.$emit('jumpSuccess', { payId })
          }, 1.5e3)
        }
      }
      setTimeout(() => this.getOrderDetail(), 5e3)
    },
    // 生成小程序码
    createWxQrcode () {
      let { zyVoucherStatus, orderInfo } = this,
        { sessionId } = uni.$storage.get()
      let oParams = {}
      oParams.appId = orderInfo.paymentChannel.wechatAppId
      oParams.qrcodeType = 'QR_WXA_UNLIMIT'
      oParams.path = 'packagesPayment/pages/payment/index'
      oParams.scene = `orderCode=${orderInfo.payId}&workWxSessionId=${sessionId}&zyVoucherStatus=${zyVoucherStatus}`
      oParams.channelType = 1
      // B端小程序调用接口生成领券码时，传参userId用uuid,类型由int变string
      uni.$api.boutiqueApi.createQrcodeImage(oParams).then(data => {
        this.wxqrcode = data
      })
    },
    async createQrCodeImg () {
      const { payId } = this.orderInfo,
        data = await uni.$api.equityApi.getPosQr({
          orderCode: payId,
          payType: 3,
          payeeType: 0
        })
      let size = 0
      try {
        const info = uni.getSystemInfoSync()
        let scale = info.windowWidth / 750 //不同屏幕下QRcode的适配比例；设计稿是750宽
        let width = 300 * scale
        size = width
      } catch (e) {
        size = 150
      }
      this.posQrCode = qrcode.createQrCodeImg(data.outTradeNo, {
        size: parseInt(size)
      })
    },
    closePopup () {
      this.show = false
      this.$refs.payPopup.closePopup()
      this.$emit('closePopup')
    }

  }

}
</script>

<style scoped lang='scss'>
::v-deep .payPopup .uni-popup__wrapper {
  width: 60%;
  border-radius: toRpx(48);
  background: #ffffff !important;
  .popup-top {
    border-radius: toRpx(48) toRpx(48) 0 0;
    background: url('@/assets/images/boutique/payTipsBc.webp') no-repeat;
    background-size: 100% 100%;
    margin-bottom: toRpx(16);
    .popup-top-box {
      color: #333333;
      font-size: toRpx(36);
      font-weight: 500;
      text-align: center;
      padding: toRpx(32);
      .popup-top-box-title {
        flex: 1;
      }
      .icon-close {
        text-align: end;
      }
    }
  }
  .pos-popup {
    text-align: center;
    box-shadow: 0 toRpx(12) toRpx(24) 0 #2c66f726;
    width: 90%;
    border-radius: toRpx(48);
    background: #ffffff;
    margin: 0 auto toRpx(63) auto;
    padding: toRpx(63) 0;
    transition: all 0.15s;
    .qrcode {
      width: toRpx(320);
      height: toRpx(320);
      margin-bottom: toRpx(32);
    }
    .price {
      color: #4673ff;
      font-size: toRpx(56);
      font-weight: 700;
      margin-bottom: toRpx(32);
    }
    .level-1-tips {
      color: #1a1a1a;
      font-size: toRpx(40);
      font-weight: 500;
      margin-bottom: toRpx(16);
    }
    .level-2-tips {
      color: #808291;
      font-size: toRpx(32);
      font-weight: 400;
    }
  }
}
.loading-box{
  position: relative;
  width: 100%;
  height: 574rpx;
  .loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: toRpx(128);
  height: toRpx(128);
}
}

</style>