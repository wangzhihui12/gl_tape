<template>
  <view :class="['fixed-page',{'show-box':show}]">
    <view :class="['customer-info-box',backClass]">
      <view class="nav-bar">
        <view
          class="back"
          @click="back"
        >
          <uni-icons
            type="left"
            :size="20"
            color="#000"
          ></uni-icons>
        </view>
        客户档案
      </view>
      <view class="form-box flex">
        <template v-for="(i,index) in customerForm">
          <view
            class="form-item flex"
            :key="index"
          >
            <view class="label flex">
              <view
                class="required"
                v-if="i.required"
              >*</view>{{i.label}}
            </view>
            <template v-if="i.type == 'input'">
              <input
                :type="i.inputType"
                :maxlength="i.maxlength"
                v-model="customerInfo[i.valueKey]"
                :class="['input',{error:i.error}]"
                placeholder="请选择"
                placeholder-style="color:rgba(51, 51, 51, 0.2);"
                confirm-type="done"
              />
            </template>
            <template v-else-if="i.type == 'date'">
              <picker
                mode="date"
                fields="day"
                :start="startDate"
                :end="endDate"
                @change="bindDateChange"
                :value="customerInfo[i.valueKey]"
              >
                <view :class="['select flex',{placeholderStyle:!customerInfo[i.valueKey]}]">
                  <view class="value text-hide">{{customerInfo[i.valueKey] ||'请选择'}}</view>
                  <uni-icons
                    class="arrow"
                    type="right"
                    :size="16"
                  ></uni-icons>
                </view>
              </picker>
            </template>
            <template v-else>
              <view
                :class="['select flex',{placeholderStyle:!customerInfo[i.valueKey]}]"
                @click="showPopup(i.popKey)"
              >
                <view class="value text-hide">{{customerInfo[i.valueKey] ||'请选择'}}</view>
                <uni-icons
                  class="arrow"
                  type="right"
                  :size="16"
                ></uni-icons>
              </view>
            </template>
          </view>
        </template>
      </view>
      <view class="btns flex">
        <view
          class="btn cancel"
          @click="back"
        >取消</view>
        <view
          :class="['btn',{disabled:check}]"
          @click="submit"
        >提交</view>

      </view>
    </view>

    <view class="popup">
      <car-brands
        ref="carBrandVisible"
        @select="handleSelect($event,'carBrandVisible')"
        :echoData="customerInfo"
        carBrandKey="carBrand"
        carModelKey="brandModel"
        customBoolean
      />
      <customer-tags
        ref="customerTagstVisible"
        @select="handleSelect($event,'customerTagstVisible')"
        :chooseList="tagsList"
      ></customer-tags>
      <reception-sence
        ref="receptionSceneVisible"
        @select="handleSelect($event,'receptionSceneVisible')"
        :customerInfo="customerInfo"
      ></reception-sence>
    </view>
    <uni-popup
      ref="successRef"
      type="message"
    >
      <uni-popup-message
        type="success"
        message="数据保存成功"
        :duration="1500"
      ></uni-popup-message>
    </uni-popup>
  </view>
</template>

<script type='text/ecmascript-6'>
import CarBrands from '@/components/CarBrands.vue'
import dayjs from 'dayjs'
import CustomerTags from './CustomerTags.vue'
import ReceptionSence from './ReceptionSence.vue'
const phoneRex = /^[1]([3-9])[0-9]{9}$/,
  default_customerForm = [{
    label: '车主姓名',
    valueKey: 'ownerName',
    key: 'ownerName',
    type: 'input',
    inputType: 'text',
    required: true,
    maxlength: 50
  },
  {
    label: '车主电话',
    valueKey: 'ownerPhone',
    key: 'ownerPhone',
    type: 'input',
    inputType: 'tel',
    required: true,
    maxlength: 11,
    error: false
  },
  {
    label: '品牌车型',
    valueKey: 'brandModel',
    key: 'brandModel',
    type: 'select',
    required: true,
    popKey: 'carBrandVisible'
  },
  {
    label: '接待场景',
    valueKey: 'receptionSceneName',
    key: 'receptionScene',
    type: 'select',
    required: true,
    popKey: 'receptionSceneVisible'
  },
  {
    label: '到店日期',
    valueKey: 'arrivalDate',
    key: 'arrivalDate',
    type: 'date',
    required: true,
  },
  {
    label: '客户标签',
    valueKey: 'customerTagName',
    key: 'customerTagName',
    type: 'select',
    required: true,
    popKey: 'customerTagstVisible'
  }]
export default {
  props: {
    customerId: [Number, String],
    show: Boolean
  },
  name: 'CustomerInfo',
  components: { CarBrands, CustomerTags, ReceptionSence },
  watch: {
    show: {
      immediate: true,
      handler (newval) {
        if (!newval) return
        const { sceneType } = uni.$storage.get("userInfo");
        default_customerForm[0].maxlength = sceneType == 1 ? 20 : 50
        this.$store.dispatch("clearCustomerInfo");
        this.$store.dispatch("clearHistory")
        this.customerForm = JSON.parse(JSON.stringify(default_customerForm))
        this.customerInfo = {
          ownerName: '',
          ownerPhone: '',
          brandModel: '',
          receptionScene: '',
          arrivalDate: '',
          customerTagName: '',
          receptionSceneName: ''
        }
        if (this.customerId) this.findVisitsInfo()
      }
    }

  },
  computed: {
    check () {
      let { customerForm, customerInfo } = this,
        result = false
      try {
        customerForm.map(e => {
          if (e.required && !customerInfo[e.key]) throw true
        })
      } catch (error) {
        result = error
      }
      return result
    },
    tagsList () {
      let list = [],
        { customerInfo, customerTag } = this,
        names = customerInfo.customerTagName ? customerInfo.customerTagName.split('｜') : [],
        isd = customerTag ? customerTag.split(',') : []
      names.map((e, index) => {
        list.push({
          labelName: e,
          labelId: isd[index]
        })
      })
      return list
    }
  },
  data () {
    return {
      customerForm: [],
      customerInfo: {},
      startDate: '',
      endDate: '',
      customerTag: '',
      backClass: ''
    }
  },
  mounted () {
    this.startDate = dayjs(dayjs().subtract(7, 'day')).format("YYYY-MM-DD")
    this.endDate = dayjs(dayjs().add(30, 'day')).format("YYYY-MM-DD")
  },
  methods: {
    async findVisitsInfo () {
      const res = await uni.$api.customerApi.findVisitsInfo({
        id: this.customerId
      })
      if (res.customerTag) this.customerTag = res.customerTag
      res.customerTagName = res.customerTagName.replace(/,/g, '｜')
      res.arrivalDate = dayjs(res.arrivalDate).format("YYYY-MM-DD")
      this.customerInfo = res
    },
    back () {
      this.backClass = 'backClass'
      setTimeout(() => {
        this.backClass = ''
        this.$emit('update:show', false)
      }, 300)
    },
    showPopup (e) {
      this.$refs[e].open()
    },
    handleSelect (item, popkey) {
      this.$refs[popkey].close()
      if (popkey == 'carBrandVisible') {
        this.$refs.carBrandVisible.close()
        // this.customerInfo.brandModel = item.name
        // this.customerInfo.carBrand = item.carChildsBrandName
        Object.assign(this.customerInfo, {
          brandModel: item.name,
          carModelId: item.id,
          carBrand: item.carChildsBrandName,
          carBrandId: item.carChildsBrandId,
          oneCarBrand: item.carBrand,
          oneCarBrandId: item.carBrandId
        })
      } else if (popkey == 'customerTagstVisible') {
        let names = [],
          ids = []
        item.map(i => {
          names.push(i.labelName)
          ids.push(i.labelId)
        })
        this.customerInfo.customerTagName = names.join('｜')
        this.customerTag = ids.join(',')
      } else {
        this.customerInfo.receptionSceneName = item.receptionSceneName
        this.customerInfo.receptionScene = item.id
      }
    },
    bindDateChange (e) {
      this.customerInfo.arrivalDate = e.detail.value
    },
    async submit () {
      if (this.check) return
      try {
        this.customerForm.map(e => {
          e.error = false
        })
        let { customerInfo, customerForm, customerTag } = this,
          { shopMerchantId, sceneType } = uni.$storage.get("userInfo"),
          targetApi = customerInfo.id ? 'updateVisitsInfo' : 'saveVisitsInfo',
          params = {
            customerTag,
            merchantId: shopMerchantId,
            bussinessScene: sceneType == 0 ? 1 : 2 // 1.延保 2.轻改
          }
        if (!phoneRex.test(customerInfo.ownerPhone)) throw 'ownerPhone'
        customerForm.map(e => {
          params[e.key] = customerInfo[e.key]
        })
        if (customerInfo.id) params.id = customerInfo.id
        Object.assign(params, {
          carModelId: customerInfo.carModelId,
          carBrand: customerInfo.carBrand,
          carBrandId: customerInfo.carBrandId,
          oneCarBrand: customerInfo.oneCarBrand,
          oneCarBrandId: customerInfo.oneCarBrandId
        })
        params.customerTagName = params.customerTagName.replace(/｜/g, ',')
        uni.showLoading({
          mask: true
        })
        const res = await uni.$api.customerApi[targetApi](params),
          _this = this
        if (res) {
          /**1：成功,2：重复 */
          if (res == '1') {
            this.$refs.successRef.open()
            setTimeout(() => {
              uni.hideLoading()
              this.back()
              this.$emit('refresh')
            }, 1e3)
          } else {
            uni.showModal({
              content: '存在与该手机号相同的接待记录，系统将自动归类到已接待',
              showCancel: false,
              confirmText: '确认',
              confirmColor: '#347BFF',
              success (res) {
                if (res.confirm) {
                  _this.back()
                  _this.$emit('refresh')
                }
              }
            })
            uni.hideLoading()
          }
        } else {
          uni.hideLoading()
        }

      } catch (error) {
        let index = this.customerForm.findIndex(e => e.key == error)
        this.customerForm[index].error = true
        this.clickFlag = false
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.fixed-page {
  display: none;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9;
  .customer-info-box {
    position: absolute;
    top: toRpx(80);
    left: toRpx(240);
    width: 87.04%;
    height: toRpx(1376);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    border-radius: toRpx(48);
    backdrop-filter: blur(toRpx(8));
    pointer-events: auto;
    animation: left-in 0.25s forwards;
    .nav-bar {
      width: 100%;
      top: 0;
      height: toRpx(96);
      z-index: 9;
      text-align: center;
      font-weight: 700;
      font-size: toRpx(32);
      color: #1a1a1a;
      line-height: toRpx(96);
      position: relative;
      margin-top: toRpx(16);
      .back {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        aspect-ratio: 1/1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .form-box {
      flex-wrap: wrap;
      padding: toRpx(32) toRpx(40);
      justify-content: space-between;
      .form-item {
        width: toRpx(934);
        height: toRpx(80);
        margin-bottom: toRpx(48);

        font-size: toRpx(28);
      }
      .label {
        width: toRpx(192);
        color: #292d33;
        justify-content: center;
        .required {
          color: #f24724;
          font-size: toRpx(28);
        }
      }
      .input,
      .select {
        width: toRpx(738);
        height: toRpx(76);
        background: #ffffff;
        border-radius: toRpx(16);
        border: toRpx(2) solid transparent !important;
        outline: none;
        color: #333333;
        border-radius: toRpx(16);
        box-sizing: border-box;
        line-height: toRpx(76);
        padding: 0 toRpx(32) !important;
        box-sizing: border-box;
        font-size: toRpx(28);
        &::placeholder {
          color: #33333333;
        }
        .value {
          max-width: toRpx(598);
        }
      }
      .placeholderStyle {
        color: #33333333;
      }
      .arrow {
        color: #999 !important;
        margin-left: auto;
        flex-shrink: 0;
      }
      .error {
        border: toRpx(2) solid #f24724 !important;
      }
    }
    .btns {
      justify-content: center;
      gap: 0 toRpx(34);
      .btn {
        width: toRpx(718);
        height: toRpx(80);
        background-image: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
        border-radius: toRpx(48);
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 500;
        font-size: toRpx(32);
        color: #ffffff;
      }
      .cancel {
        background: #dae9ff;
        color: #2c66f7;
      }
      .disabled {
        background-image: linear-gradient(0deg, #2c66f799 0%, #48a6ff99 100%);
      }
    }
  }
  .backClass {
    animation: left-out 0.25s forwards;
  }
  .popup {
    pointer-events: auto;
  }
}

.show-box {
  display: block;
}
</style>