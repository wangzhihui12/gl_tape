<template>
  <view class="order">
    <view :class="['order-box', { hide: showUpload }]">
      <view class="common-title">修改客户信息</view>
      <view class="box">
        <scroll-view class="scroll-view" scroll-y="true">
          <view class="box-content">
            <view class="flex tips align-center justify-between" v-if="showTips">
              <view class="flex align-center">
                <view class="sprite-icon icon-equityTip"></view>
                客户信息仅支持修改以下部分
              </view>
              <view class="sprite-icon icon-equityClose" @click="showTips = false"></view>
            </view>
            <GlCell :formList="formList" :formData="orderObj" @radioChange="radioChange" @inputBlur="inputBlur" @handleCell="handleCell" :titleList="titleList"></GlCell>
          </view>
          <view class="btns flex">
            <view class="btn save" @click="back">放弃</view>
            <view @click="submit" class="btn">提交修改</view>
          </view>
        </scroll-view>
      </view>
    </view>
    <!-- 弹窗 -->
    <!-- <order-popup ref="orderPopup" :data="orderObj" :dataKey="valueKey" @onConfirm="onConfirm" :externalData="externalData" :popupType="popupType" :popupTitle="popupTitle" /> -->
    <template v-if="showUpload">
      <view class="upload-box">
        <upload-proof-of-payment @back="showUpload = false" @confirm="uploadConfirm" />
      </view>
    </template>
    <NoticePopup ref="notice" title="重要提示" text="当前页面暂未保存，是否确认退出" type="warning"></NoticePopup>
  </view>
</template>

<script>
import utils from '@/utils/utils'
// import OrderPopup from '@/components/OrderPopup/index.vue'
import GlCell from '../../../../components/Form/GlCell.vue'
import { UpdateOrderInfo, popupTypeEnum, payTypeList, titleList } from '../contant'
import { interceptionMixin } from '@/mixin/index'
import NoticePopup from '@/components/NoticePopup.vue'
import { validateVin, formatVinInput } from '@/utils/vinVaildate'
export default {
  name: 'CreateOrder',
  mixins: [interceptionMixin],
  components: {
    GlCell,
    // OrderPopup,
    // UploadProofOfPayment,
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
      requiredList: [],
      validateState: true, // 录单设置的必填项
      orderObj: {
        owner: '',
        phone: '',
        salesType: '0',
        carVin: '',
        certificateNo: '',
        notes: ''
      }
    }
  },
  computed: {
    showPayTips() {
      return this.orderObj.payee == 0 && this.orderObj.payType == 7
    },
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
    this.baseConfigData = uni.$storage.get('mock_data') || {}
    this.initData()
  },
  methods: {
    initData() {
      console.log('initData', this.transmissionOfData)
      const { paramsData } = this.transmissionOfData
      this.getQuotationInfoById(paramsData.id)
      // 埋点
      //   uni.$track.add({ eventCode: 'app_create_order' })
    },
    async getQuotationInfoById(id) {
      const data = await uni.$api.equityApi.getQuotationInfoById({ id })
      console.log(data, 'data')
      //   this.orderInfo = data
      this.orderObj.id = id
      this.orderObj.ownerId = data.owner.id
      this.orderObj.carVin = data.owner.carVin
      this.orderObj.owner = data.owner.owner
      this.orderObj.phone = data.owner.phone
      this.orderObj.salesType = data.owner.salesType.toString()
      this.orderObj.certificateNo = data.owner.certificateNo
      this.orderObj.notes = data.notes
      this.updateFormSelection()
    },
    // 输入框失去焦点事件
    inputBlur(e, val) {
      console.log(e, val, val.value === 'carVin')
      if (val.value === 'carVin') {
        validateVin(this.orderObj.carVin).then(result => {
          console.log('validateVin', result)
          let { valid } = result.data
          this.validateState = valid
          // 校验成功，所有提示已在公共方法中处理
          console.log('车架号校验成功:', result)
          this.orderObj.carVin = formatVinInput(this.orderObj.carVin)
        })
      } else {
        this.orderObj[val.value] = this.orderObj[val.value]
      }
    },
    // 校验必填等规则
    checkRequired() {
      try {
        const phoneRex = /^[1]([3-9])[0-9]{9}$/,
          requiredArr = [],
          onlyLabelItem = [],
          { orderObj } = this

        this.formList.forEach(group => {
          group.forEach(item => {
            if (item.required === true && item.hidden !== true) {
              if (item.isArray) onlyLabelItem.push(item)
              else requiredArr.push(item)
            }
          })
        })
        // 遍历requiredArr，检查orderObj中是否有对应的值
        for (let i = 0; i < requiredArr.length; i++) {
          const item = requiredArr[i]
          // 兼容嵌套customer对象的情况
          let value = orderObj[item.value]
          if (value === undefined || value === null || value === '') throw `${item.label}不能为空`
          // 如果是customerPhone，添加phoneRex校验
          if (item.value === 'phone' && !phoneRex.test(value)) throw `请输入正确的${item.label}`
        }
        // if (orderObj.carVin) {
        //   const vinRex = /^(?=.*[A-Za-z])[A-Za-z0-9]{17}$/
        //   if (!vinRex.test(orderObj.carVin)) throw '请输入正确的车架号'
        // }
        if (orderObj.certificateNo && orderObj.certificateNo.length != 18) throw '请输入正确的18位证件号'
        return true
      } catch (error) {
        if (error)
          uni.showToast({
            title: error,
            icon: 'none'
          })
        return false
      }
    },
    // 提交
    async submit() {
      if (!this.checkRequired() || (await this.checkDailyReport())) return
      if (this.orderObj.carVin) {
        // 前置判断
        if (this.orderObj.carVin.length !== 17) {
          uni.showToast({ title: '请输入 17 位有效字符（支持大写 A-H/J-N/P-Z、0-9）', icon: 'none' })
          return false
        }
        // 根据接口校验结果判断
        if (this.orderObj.carVin.length === 17 && !this.validateState) {
          uni.showToast({ title: '车架号校验不匹配，请核对后重新输入', icon: 'none' })
          return false
        }
      }
      let params = {
        id: this.orderObj.id,
        notes: this.orderObj.notes || '',
        owner: {
          id: this.orderObj.ownerId,
          owner: this.orderObj.owner,
          phone: this.orderObj.phone,
          carVin: this.orderObj.carVin || '',
          certificateNo: this.orderObj.certificateNo || '',
          salesType: this.orderObj.salesType || 0
        }
      }
      console.log(params, 'params')
      uni.showLoading({
        title: '提交中...',
        mask: true
      })
      uni.$api.equityApi
        .updateCustomerInfo(params)
        .then(result => {
          uni.hideLoading()
          console.log(result)
          this.$emit('jump', 'OrderManagement', {})
        })
        .catch(err => {
          uni.hideLoading()
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
            this.$emit('jump', 'OrderManagement', {})
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
    radioChange(val) {
      console.log(val)
      this.orderObj.salesType = val.detail.value.toString()
    },
    updateFormSelection() {
      this.formList.forEach(group => {
        group.forEach(item => {
          if (item.value === 'salesType') {
            item.current = this.orderObj.salesType
            console.log('更新salesType字段:', item.current)
          }
        })
      })
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
  padding-bottom: toRpx(24);

  .scroll-view {
    height: 100%;
  }
}

.box-content {
  padding: 0 toRpx(48);
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: toRpx(24) toRpx(32) toRpx(24) 0;
  font-size: toRpx(28);
  border-bottom: toRpx(2) solid #f7f7f6;

  &-left {
    color: #333;
    font-weight: 500;
  }

  &-right {
    color: #f24724;
    font-weight: 500;
  }
}

.pay-tips {
  padding: toRpx(24) toRpx(24) toRpx(24) 0;
  font-size: toRpx(24);
  color: #999;
}
.tips {
  height: toRpx(72);
  border-radius: toRpx(16);
  background: #e0e8ff;
  color: #2c66f7;
  font-size: toRpx(28);
  font-weight: 400;
  padding: toRpx(0) toRpx(34);
  margin-bottom: toRpx(16);
  .icon-equityTip {
    margin-right: toRpx(14);
  }
}
.btns {
  position: absolute;
  width: 100%;
  bottom: 0;
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
::v-deep .cell-value .textarea {
  // margin-bottom: 0;
  height: toRpx(192) !important;
}
.customer-title {
  .customer-file {
    margin-left: 20rpx;
    color: #347bff;
    font-size: 24rpx;
    .sprite-icon {
      margin-right: 4rpx;
    }
  }
}
</style>
