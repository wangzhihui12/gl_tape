<template>
  <view class="order">
    <view :class="['order-box']">
      <view class="common-title">客户签字</view>
      <view class="box">
        <scroll-view class="scroll-view" scroll-y="true">
          <view class="box-content">
            <view class="box-shell pt-32">
              <view class="descTextTitle">尊敬的客户，您好！</view>
              <view class="h3 descText">本人自愿在门店购买保险。门店已就新车投保项目及服务进行了说明，本人完全理解相关项目的服务流程及细则。</view>
            </view>
            <view class="box-shell">
              <view class="tips descText">请在确认以上信息后，在下方的签字区内签字确认，感谢您的配合！</view>
              <view class="title descTextTitle">签字处</view>
              <view class="sign-box">
                <l-signature disableScroll ref="signatureRef" :penColor="penColor" :penSize="penSize" :openSmooth="openSmooth" @touchstart="onSignatureTouch"></l-signature>
                <view v-if="showPlaceHoder" class="placehoder">签字区</view>
                <!-- <view @click="fullScreen" class="full_icon flex_scb sprite-icon icon-fullScreen">
                </view> -->
                <view @click.stop="onClick('clear')" class="delete_icon flex_scb sprite-icon icon-sign_del"></view>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="btns flex">
          <view class="btn save" @click="back">稍后处理</view>
          <view @click="submit" class="btn">已完成</view>
        </view>
      </view>
    </view>
    <NoticePopup ref="notice" title="重要提示" text="当前页面暂未保存，是否确认退出" type="warning"></NoticePopup>
  </view>
</template>

<script>
import utils from '@/utils/utils'
import { UpdateOrderInfo, popupTypeEnum, payTypeList, titleList } from '../contant'
import NoticePopup from '@/components/NoticePopup.vue'
import { uploadFile } from '@/utils/ossUploadFile/uploadFile.js'
import { interceptionMixin } from '@/mixin/index'
export default {
  name: 'SignName',
  mixins: [interceptionMixin],
  components: {
    NoticePopup
  },
  props: {
    transmissionOfData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      showUpload: false,
      showTips: true,
      titleList,
      formList: utils.deepClone(UpdateOrderInfo),
      valueKey: '',
      externalData: [],
      popupType: 0,
      baseConfigData: {},
      landscape: false,
      requiredList: [], // 录单设置的必填项
      orderObj: {
        owner: '',
        phone: '',
        salesType: '0',
        carVin: '',
        certificateNo: '',
        notes: ''
      },
      title: 'Hello',
      penColor: 'red',
      penSize: 5,
      url: '',
      openSmooth: false,
      showPlaceHoder: true
    }
  },
  computed: {
    userInfo() {
      return uni.$storage.get('userInfo') || {}
    }
  },
  watch: {
    transmissionOfData: {
      handler(newVal, oldVal) {
        if (newVal) {
          console.log(newVal, 'newVal')
        } else {
          console.log(oldVal, 'oldVal')
        }
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      console.log('initData', this.transmissionOfData)
    },

    // 提交
    async submit() {
      if (await this.checkDailyReport()) return
      this.$refs.signatureRef.canvasToTempFilePath({
        success: async res => {
          // 是否为空画板 无签名
          console.log(res.isEmpty)
          // 生成图片的临时路径
          // H5 生成的是base64
          uni.showLoading({
            title: '上传中...',
            mask: true
          })
          console.log(res, 'res')
          let url = await uploadFile(res.tempFilePath)
          uni.hideLoading()
          let params = {
            orderId: this.transmissionOfData.paramsData.orderId,
            customerNameUrl: url
          }
          console.log(params, 'params')
          uni.showLoading({
            title: '提交中...',
            mask: true
          })
          uni.$api.equityApi
            .updateCustomerNameUrlAPI(params)
            .then(result => {
              uni.hideLoading()
              console.log(result)
              setTimeout(() => {
                this.$emit('jump', 'EquityManagement', {})
              }, 500)
            })
            .catch(err => {
              uni.hideLoading()
            })
        },
        fail: err => {
          uni.hideLoading()
        }
      })
    },
    back() {
      // 配置弹窗按钮
      this.$refs.notice.buttonsList = [
        {
          text: '确认退出',
          type: 'default',
          callback: () => {
            this.transmissionOfData = null
            this.$refs.notice.close()
            this.$emit('jump', 'EquityManagement', {})
          }
        },
        {
          text: '继续编辑',
          type: 'primary',
          callback: () => {
            this.$refs.notice.close()
          }
        }
      ]
      // 打开弹窗
      this.$refs.notice.open()
    },
    onClick(type) {
      if (type == 'openSmooth') {
        this.openSmooth = !this.openSmooth
        return
      }
      if (this.$refs.signatureRef) this.$refs.signatureRef[type]()
    },
    fullScreen() {
      this.landscape = !this.landscape
    },
    onSignatureTouch(val) {
      console.log(val, 'val')
      //   this.showPlaceHoder = val
      //   this.$refs.signatureRef.isEmpty
    }
  }
}
</script>

<style scoped lang="scss">
.order {
  height: 100%;
  position: relative;
  &-box {
    visibility: visible;
    height: 100%;
  }
  .hide {
    opacity: 0;
    visibility: hidden;
  }
  .upload-box {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}

.box {
  height: calc(100% - #{toRpx(120)});

  .scroll-view {
    // height: calc(100% - #{toRpx(148)});
  }
}

.box-content {
  padding: 0 toRpx(48);
}

.box-shell {
  width: 100%;
  border-radius: toRpx(16);
  background: #ffffff;
  padding: toRpx(32);
  margin-top: toRpx(16);
}

.btns {
  position: absolute;
  bottom: 0;
  width: 100%;
  left: 0;
  padding: 24rpx 128rpx;
  gap: 32rpx;
  .save {
    background: #3b73ff1a;
    color: #4673ff;
    font-size: 28rpx;
    font-weight: 500;
  }
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: toRpx(1130);
  height: toRpx(80);
  color: #fff;
  border-radius: toRpx(48);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
}

.h3 {
  text-indent: 2em;
}

.descTextTitle {
  font-weight: 500;
  font-size: toRpx(34);
  color: #333333;
  line-height: toRpx(48);
  margin-bottom: toRpx(20);
}

.descText {
  font-size: toRpx(28);
  color: #333333;
}
.title {
  margin-top: toRpx(32);
  margin-bottom: toRpx(24);
}
.sign-box {
  position: relative;
  width: 100%;
  height: toRpx(600);
  border-radius: toRpx(12);
  background: #f4f5f7;
  // 全屏样式
  &.landscape {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    border-radius: 0;
    z-index: 999999;
    background: #f4f5f7;
  }
}
.full_icon {
  position: absolute;
  right: toRpx(26);
  // top: var(--fontSize16);
  top: toRpx(26);
  z-index: 10000;
  transition: all 0.3s ease;
}

.delete_icon {
  position: absolute;
  right: toRpx(26);
  // top: var(--fontSize16);
  bottom: toRpx(26);
  z-index: 10000;
}

.placehoder {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: toRpx(32);
  font-weight: 500;
  color: #dfdfdf;
}
</style>
