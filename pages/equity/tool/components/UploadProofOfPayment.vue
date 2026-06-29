<template>
  <view class="upload-proof-of-payment">
    <view class="common-title flex">
      <view
        class="back"
        @click="$emit('back')"
      >
        <uni-icons
          type="left"
          size="20"
          color="#000"
        ></uni-icons>
      </view>
      上传付款凭证
    </view>
    <view class="px-48">
      <view class="box-shell">
        <view class="flex align-center justify-between box-flow">
          <view class="box-label">
            交易流水号
            <text class="required">*</text>
          </view>
          <input
            v-model="outTradeNo"
            type="text"
            @input="outTradeNoInput"
            class="uni-input"
            maxlength="150"
            placeholder="请输入"
          />
        </view>
        <view class="payment">
          <view class="payment-label">
            付款凭证
            <text class="required">*</text>
          </view>
          <view class="upload-box">
            <template v-if="payVoucherList.length < 9">
              <view
                class="upload-item"
                @click.stop="selectImg"
              ></view>
            </template>
            <view
              v-for="(item, index) in payVoucherList"
              :key="index"
              class="previewImageList"
            >
              <image :src="item" mode="aspectFill" @click="previewMedia(index)"></image>
              <view
                class="close-box"
                @click="deleteImg(index)"
              >
                <uni-icons
                  class="icon-close"
                  type="closeempty"
                  color="#ffffff"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view
      class="uploadBtn"
      @click.stop="confirm"
    >确定提交</view>
  </view>
</template>
<script>
import { uploadFile } from '@/utils/ossUploadFile/uploadFile.js'
import { debounce } from 'lodash'
import permision from '@/js_sdk/wa-permission/permission.js'

export default {
  name: 'UploadProofOfPayment',
  props: {
  },
  data () {
    return {
      payVoucherList: [],
      outTradeNo: ''
    }
  },
  mounted () {
  },
  methods: {
    async selectImg () {
      // #ifdef APP-PLUS
      const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
      const camera = await permision.requestAndroidPermission('android.permission.CAMERA')
      const isOnline = await uni.$isNetWork()
      if (photoLibrary != 1) throw '您的设备不支持相册功能或未授权访问，请前往设置中开启相册权限'
      if (camera != 1) throw '您的设备不支持摄像头功能或未授权访问，请前往设置中开启摄像头权限'
      if (!isOnline) throw '当前无网络连接，请连接网络后重试'
      // #endif
      let _this = this
      uni.chooseImage({
        count: 1, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: function (res) {
          console.log(res)
          _this.upLoad(res)
        }
      })
    },
    outTradeNoInput (e) {
      const filteredValue = e.detail.value.replace(/[\u4E00-\u9FA5]/g, '')
      this.$nextTick(() => {
        this.$set(this, 'outTradeNo', filteredValue)
      })
    },
    // 上传付款凭证
    async upLoad (event) {
      console.log(event)
      let _this = this
      const { tempFilePaths } = event
      let url = await uploadFile(tempFilePaths[0])
      this.payVoucherList.push(url)
    },
    confirm: debounce(function (e) {
      let { outTradeNo, payVoucherList } = this
      if (payVoucherList.length && outTradeNo) {
        this.$emit('confirm', {
          payVoucherList,
          outTradeNo
        })
      } else {
        uni.showToast({ title: '交易流水号或付款凭证不能为空！', icon: 'none' })
      }
    }, 300),
    deleteImg (index) {
      this.payVoucherList.splice(index, 1)
    },
    previewMedia(current){
      const {payVoucherList} = this
      uni.previewImage({
        current,
        urls: payVoucherList
      })
    }
  }
}
</script>
<style scoped lang="scss">
.px-48 {
  padding: 0 toRpx(48);
}
.back {
  height: toRpx(40);
}
.upload-proof-of-payment {
  width: 100%;
  height: 100%;
  position: relative;
  .box-shell {
    width: 100%;
    border-radius: toRpx(16);
    background: #ffffff;
    padding: toRpx(24) toRpx(32);
    // margin-top: toRpx(16);
    .box-flow {
      border-bottom: toRpx(2) solid #f7f7f6;
      padding-bottom: toRpx(28);
      .box-label {
        font-weight: 400;
        font-size: toRpx(28);
        color: #333333;
      }
      .required {
        color: #f00;
        margin-left: toRpx(8);
      }
      .uni-input {
        text-align: right;
        width: 80%;
        .uni-input-placeholder {
          font-size: toRpx(28);
          font-weight: 400;
        }
      }
    }
    .payment {
      .payment-label {
        font-weight: 400;
        font-size: toRpx(28);
        color: #333333;
        margin-top: toRpx(32);
        margin-bottom: toRpx(24);
        .required {
          color: #f00;
          margin-left: toRpx(8);
        }
      }
      .upload-box {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: toRpx(20);
        .upload-item {
          width: 100%;
          height: toRpx(240) !important;
          border-radius: toRpx(12);
          background: url('@/assets/images/boutique/uploadImage.webp') no-repeat;
          background-size: 100% 100%;
        }
        .previewImageList {
          position: relative;
          height: toRpx(240) !important;
          image {
            width: 100% !important;
            height: 100% !important;
            border-radius: toRpx(12);
          }
          .close-box {
            width: toRpx(36);
            height: toRpx(36);
            position: absolute;
            top: toMinusRpx(12);
            right: toMinusRpx(12);
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            text-align: center;
            line-height: toRpx(40);
          }
          .icon-close {
            font-size: toRpx(12);
          }
        }
      }
    }
  }
  .uploadBtn {
    width: 80%;
    height: toRpx(80);
    border-radius: toRpx(48);
    background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    color: #ffffff;
    font-size: toRpx(28);
    font-weight: 500;
    position: absolute;
    bottom: toRpx(20);
    margin: 0 auto;
    left: 0;
    right: 0;
    text-align: center;
    line-height: toRpx(80);
  }
}
</style>
