<!--
 * @Description: 发券弹窗
 * @Author: huyue
 * @Date: 2024-09-06 10:11:03
 * @LastEditors: huyue
 * @LastEditTime: 2024-09-23 17:35:59
-->
<template>
  <view>
    <MessageBox
      ref="couponPopup"
      type="center"
      :is-mask-click="false"
      animation
      :isFooter="false"
      :title="title"
      :popupW="1200"
      :maxHeight="896"
    >
      <view
        name="content"
        class="content"
      >
        <view
          class="form"
          v-if="customerType != 0"
        >
          <view
            v-for="(i, index) in formObject"
            class="form-item"
            :key="index"
          >
            <view :class="['label',{required:i.required}]">{{ i.label }}</view>
            <view :class="['value', { error: showError(i.key) && i.required },{disabled: pageParams.received}]">
              <template v-if="i.addHtml">
                <view
                  :class="['select',  `${pageParams.carInfo[i.key]? '' : 'placeholder'}`]"
                  @click="showPopup(i.popKey)"
                  :key="selectKey"
                >
                  {{ pageParams.carInfo[i.key] || i.placeholder }}
                  <uni-icons
                    class="arrow"
                    type="down"
                    :size="16"
                  ></uni-icons>
                </view>
              </template>
              <template v-else>
                <template v-if="i.type == 'input'">
                  <input
                    :type="i.inputType"
                    :maxlength="i.maxlength"
                    v-model="customerInfo[i.key]"
                    class="input"
                    :placeholder="i.placeholder"
                    :disabled="pageParams.received"
                    @input="inputCustomer"
                    placeholder-style="color:#c9c9c9;"
                  />
                </template>
                <template v-else-if="i.type == 'select'">
                  <view
                    :class="['select',  `${customerInfo[i.key]? '' : 'placeholder'}`]"
                    @click="showPopup(i.popKey)"
                    :key="selectKey"
                  >
                    {{ customerInfo[i.key] || i.placeholder }}
                    <uni-icons
                      class="arrow"
                      type="down"
                      :size="16"
                    ></uni-icons>
                  </view>
                </template>
                <template v-else>
                  <view class="text">{{ customerInfo[i.key] }}</view>
                </template>
              </template>
            </view>
          </view>
        </view>
        <view
          class="customer-info"
          v-else
        >
          <view class="customer-title">当前客户信息</view>
          <view class="line"></view>
          <view class="customer-list">
            <view
              class="customer-item"
              v-for="(j, idx) in formObject"
              :key="idx"
            >
              <view class="label">{{ j.label }}</view>
              <view class="value-text">
                <template v-if="j.addHtml">
                  {{ pageParams.carInfo[j.key] || '--'}}
                </template>
                <template v-else>
                  {{ customerInfo[j.key] || '--'}}
                </template>
              </view>
            </view>
          </view>
        </view>
        <view class="qr-code">
          <view class="qr-code-box">
            <template v-if="customerType == 1">
              <template v-if="pageParams.received">
                <view class="ok">
                  <view class="ok-status"></view>
                  <!-- <image
                    class="ok-status"
                    src="@/assets/images/boutique/ok-status.webp"
                  /> -->
                  <view>客户领券成功</view>
                </view>
              </template>
              <template v-else>
                <image
                  v-if="pageParams.QRURL"
                  class="qr-code-img"
                  :src="pageParams.QRURL"
                />
                <view
                  v-else
                  class="no-data"
                >
                  <view class="no-data-img"></view>
                  <!-- <image
                    src="@/assets/images/boutique/no-data.webp"
                    class="no-data-img"
                  /> -->
                  <view>填写客户信息后点击</view>
                  <view>「生成专属二维码」生成券码</view>
                </view>
              </template>
            </template>
            <template v-else>
              <image
                class="qr-code-img"
                :src="pageParams.customerQr"
              />
            </template>
          </view>
          <view
            class="ok-tips"
            v-if="customerType == 1 && pageParams.received"
          >
            <view>车主已领取该礼券</view>
            <view>请前往客户邀约列表查看</view>
          </view>
          <view
            class="ok-tips"
            v-if="customerType == 0"
          >
            <view>{{tips}}</view>
          </view>
        </view>
      </view>
      <view
        name="footer"
        v-if="customerType == 1"
      >
        <view
          class="footer-btn"
          @click="createCoupon"
          :class="{disabled: !isCheck || pageParams.received}"
        >生成专属二维码</view>
      </view>
    </MessageBox>
    <car-brands
      :linkage="false"
      ref="carBrandListVisible"
      @select="handleSelect($event, 'carBrandListVisible')"
    />
    <employee
      ref="employeeBoxVisible"
      @select="handleSelect($event,'employeeBoxVisible')"
      title="交付人员"
      @close="resetFocusIndex"
    />
    <MessageBox
      ref="couponBoxVisible"
      position="bottom"
      :isFooter="false"
      title="请选择礼券类型"
      :maxHeight="1000"
      @close="resetFocusIndex"
    >
      <view class="select-box">
        <view
          class="select-item"
          :class="{ checked: pageParams.couponId == item.id }"
          @click="chooseCoupon(item)"
          v-for="(item, index) in couponList"
          :key="index"
        >
          {{ item.couponTypeName }}
        </view>
      </view>
    </MessageBox>
  </view>
</template>

<script type="text/ecmascript-6">
import Employee from '@/components/Employee.vue'
import qrcode from '@/utils/qrcode.js'
import CarBrands from '@/components/CarBrands.vue'

const phoneRex = /^[1]([3-9])[0-9]{9}$/;
import dayjs from 'dayjs'
const formObject_boutique = [{
  label: "车主姓名",
  key: "customerName",
  type: "input",
  inputType: "text",
  maxlength: 20,
  placeholder: '请输入车主姓名',
  required: true
},
{
  label: "车主电话",
  key: "phoneNumber",
  type: "input",
  inputType: "tel",
  maxlength: 11,
  placeholder: '请输入车主电话',
  required: true
},
{
  label: "品牌车型",
  type: "select",
  popKey: "carBrandListVisible",
  placeholder: '请选择车型',
  addHtml: 'carbrand',
  key: 'name',
  required: true
},
{
  label: "交付专员",
  key: "staffName",
  type: "select",
  popKey: "employeeBoxVisible",
  placeholder: '请选择交付专员',
  required: true
},
{
  label: "礼券类型",
  key: "couponTypeName",
  type: "select",
  popKey: "couponBoxVisible",
  placeholder: '请选择礼券类型',
  required: true
}]
export default {
  name: 'CouponPop',
  props: {
    carInfo: {
      type: Object,
      default: () => ({})
    },
    show: Boolean,
    title: String,
    tips: String
  },
  components: { Employee, CarBrands },
  watch: {
    watchCustomerInfo: {
      immediate: true,
      handler (newval) {
        this.customerInfo = Object.assign(this.customerInfo, newval)
        if (newval.carModel) {
          this.pageParams.carInfo = {
            carChildsBrandId: newval.carBrandId,
            carChildsBrandName: newval.carBrand,
            carBrandId: newval.oneCarBrandId,
            carBrand: newval.oneCarBrand,
            id: newval.carModelId,
            name: newval.carModel
          }
        }
        try {
          // 监听完成接待修改数据，同步修改生成优惠券按钮状态
          const { customerName, phoneNumber, staffName } = this.customerInfo
          this.isCheck = customerName && phoneNumber && staffName
        } catch (error) {
          this.isCheck = false
        }
        this.pageParams.showDetail = false
        this.$forceUpdate()
      }
    },
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.close()
        this.closeAllPopup()
        this.pageParams.QRURL = ''
        this.pageParams.received = false
        if (this.couponList.length) {
          let item = this.couponList.find(e => e.couponType == 1),
            item2 = this.couponList.find(e => e.couponType == 18)
          if (item) this.chooseCoupon(item) //默认填入类型为「太阳膜」类型
          else if (item2) this.chooseCoupon(item2) //次选填入「精品」类型
          else this.chooseCoupon(this.couponList[0]) // 无此两种类型情况默认带入任意类型礼券
        }
      }
    },
    show () {
      this.closeAllPopup()
    },
    carInfo: {
      handler (newval) {
        console.log(newval, '===')
        this.pageParams.carInfo = {
          carChildsBrandId: newval.carChildsBrandId,
          carChildsBrandName: newval.carChildsBrandName,
          carBrandId: newval.carBrandId,
          carBrand: newval.carBrand,
          id: newval.id,
          name: newval.name
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    watchCustomerInfo () {
      return this.$store.state.user.customerInfo
    },
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    shopMerchantId () {
      const { shopMerchantId } = uni.$storage.get('userInfo')
      return shopMerchantId
    },
  },
  data () {
    return {
      formObject: formObject_boutique,
      customerInfo: {},
      couponList: [],
      pageParams: {
        qrTimer: null,
        received: false,
        couponId: '',
        carInfo: {},
        QRURL: '',
        showDetail: false,
        clickFlag: false,
        customerCouponId: '',
        customerQr: ''
      },
      isCheck: false,
      customerType: 1,
      selectKey: Date.now()
    }
  },
  mounted () {

  },
  methods: {
    init () {
      this.findCouponList()
    },
    async findCouponList () {
      const userInfo = uni.$storage.get("userInfo"),
        { shopMerchantId } = userInfo,
        { list } = await uni.$api.boutiqueApi.findCouponList({
          merchantIdList: [shopMerchantId]
        }),
        arr = []
      if (list && list.length) {
        let couponTypeList = Array.from(new Set([...list.map((e) => e.couponType)]))
        couponTypeList.map((i) => {
          let item = []
          list.map((e) => {
            if (i == e.couponType) item.push(e)
          })
          if (item.length) arr.push(item.sort(function (a, b) {
            return b.createdDate - a.createdDate
          })[0])
        })
        let item = arr.find(e => e.couponType == 1),
          item2 = arr.find(e => e.couponType == 18)
        if (!this.pageParams.couponId) {
          if (item) this.chooseCoupon(item) //默认填入类型为「太阳膜」类型
          else if (item2) this.chooseCoupon(item2) //次选填入「精品」类型
          else this.chooseCoupon(arr[0]) // 无此两种类型情况默认带入任意类型礼券
        }
      }
      this.couponList = arr
    },
    inputCustomer () {
      this.$store.dispatch('setCustomerInfo', this.customerInfo)
      const { customerName, phoneNumber, staffName } = this.customerInfo
      this.isCheck = customerName && phoneNumber && staffName
    },
    chooseCoupon (item) {
      this.pageParams.couponId = item.id
      this.customerInfo.couponTypeName = item.couponTypeName
      this.$store.dispatch('setCustomerInfo', this.customerInfo)
      this.$refs.couponBoxVisible.close()
    },
    showError (key) {
      let flag = !this.customerInfo[key]
      if (key == 'phoneNumber' && this.customerInfo[key]) flag = !phoneRex.test(this.customerInfo[key])
      return this.errorTip && flag
    },
    showPopup (e) {
      let { pageParams } = this
      if (pageParams.received) return
      this.$refs[e].open();
      this.$emit('hideTool')
    },
    open (customerType, customerInfo) {
      this.pageParams.customerQr = ''
      this.$refs.couponPopup.open()
      this.customerType = customerType
      if (customerInfo.customerCouponId) {
        try {
          uni.showLoading({
            mask: true
          })
          let scene = ''
          if (customerInfo.inviteRecordId) {
            scene = `url=/tabDate/pages/detail/detail&id=${customerInfo.inviteRecordId}`
          } else {
            let params = encodeURIComponent(`couponId=${customerInfo.customerCouponId}`)
            scene = `url=/tabWorkOrder/pages/createOrder/createOrder&scene=${params}`
          }
          scene = `${scene}&sceneType=1&shopMerchantId=${this.shopMerchantId}`
          uni.$api.commonApi.createQrcode({
            scene,
            path: '/pages/loading/loading',
            appId: 'wx570d9331f9ace0bd'
          }).then(({ data, code, message }) => {
            uni.hideLoading()
            if (code == 0) {
              if (data) {
                this.pageParams.customerCouponId = customerInfo.customerCouponId
                this.pageParams.customerQr = data

                if (customerInfo.inviteRecordId) this.customerInfo = customerInfo
                console.log(customerInfo)
              } else throw '生成小程序码失败，请重试！'
            } else throw message

          })
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: error,
            icon: 'none'
          })
        }
      }
      this.init()
      try {
        const { customerName, phoneNumber, carModel, staffName } = this.customerInfo
        this.isCheck = customerName && phoneNumber && staffName
      } catch (error) {
        this.isCheck = false
      }
    },
    close () {
      this.$refs.couponPopup?.close()
    },
    handleSelect (item, popkey) {
      console.log(item, popkey)
      this.$refs[popkey].close();
      if (popkey == "employeeBoxVisible") {
        this.customerInfo.salesUuid = item.uuid;
        this.customerInfo.staffName = item.staffName;
        this.$store.dispatch("setCustomerInfo", this.customerInfo);
      } else {
        this.$refs.carBrandListVisible.close();
        this.pageParams.carInfo = {
          carChildsBrandId: item.carChildsBrandId,
          carChildsBrandName: item.carChildsBrandName,
          carBrandId: item.carBrandId,
          carBrand: item.carBrand,
          id: item.id,
          name: item.name
        }
      }
      this.selectKey = Date.now()
      const { customerName, phoneNumber, staffName } = this.customerInfo
      this.isCheck = customerName && phoneNumber && staffName
    },
    resetFocusIndex () {
      this.focusIndex = -1
    },
    async validate () {
      let flag = true
      try {
        const { customerName, phoneNumber, carModel, staffName } = this.customerInfo,
          { couponId } = this.pageParams
        // 检查车主姓名
        if (!customerName || !phoneNumber || !staffName) throw '请输入客户信息'
        if (phoneNumber && !phoneRex.test(phoneNumber)) throw '请输入正确的车主电话'
        if (!couponId) throw '请选择礼券类型'
      } catch (error) {
        this.pageParams.clickFlag = false
        uni.hideLoading()
        uni.showToast({
          title: error,
          icon: 'none',
        })
        flag = false
      }
      return flag
    },
    async createCoupon () {
      if (this.pageParams.received) return
      if (!this.isCheck) return // 按钮置灰的情况
      try {
        const { pageParams: { clickFlag, couponId, carInfo }, customerInfo } = this, {
          shopMerchantId } = uni.$storage.get("userInfo"),
          validateStatus = await this.validate(),
          checkCouponAmount = await this.checkCouponAmount(couponId, [shopMerchantId])
        if (!validateStatus) return
        if (clickFlag) return
        if (!checkCouponAmount.length) throw '该门店礼券已使用完，请联系管理员配置。'
        this.pageParams.clickFlag = true
        uni.showLoading({
          mask: true
        })
        let { staffName, salesUuid } = customerInfo,
          scene = `id=${couponId}&userId=${salesUuid}&employName=${staffName}&merchantId=${shopMerchantId}&customerName=${customerInfo.customerName}&customerPhone=${customerInfo.phoneNumber}`,
          params = {
            path: '/packageShopmall/packageMine/pages/boutique/gift/gift',
            appId: 'wxe10067a63c1856ac',
          }
        if (carInfo.name) {
          scene += `&carChildsBrandId=${carInfo.carChildsBrandId}&carChildsBrandName=${carInfo.carChildsBrandName}&carBrandId=${carInfo.carBrandId}&carBrand=${carInfo.carBrand}&carSeriesId=${carInfo.id}&carSeriesName=${carInfo.name}`
        }
        params.scene = scene
        let {
          code,
          data,
          message
        } = await uni.$api.commonApi.createQrcode(params)
        if (code == 0) {
          if (data) {
            this.pageParams.QRURL = data
            clearInterval(this.pageParams.qrTimer)
            this.pageParams.qrTimer = null
            this.checkCustomerReceivedStatus(dayjs().format("YYYY-MM-DD HH:mm:ss"))
            uni.hideLoading()
            this.pageParams.clickFlag = false
          }
          else throw '生成小程序码失败，请重试！'
        } else throw message
      } catch (error) {
        uni.hideLoading()
        if (error) {
          this.pageParams.clickFlag = false
          this.couponErrorTips = error
        }
      }
    },
    async checkCouponAmount (merchantCouponId, merchantIdList) {
      const { list } = await uni.$api.boutiqueApi.findCouponList({
        merchantCouponId,
        merchantIdList
      })
      return list || []
    },
    checkCustomerReceivedStatus (receiveCouponStartTime) {
      if (this.pageParams.qrTimer) return
      try {
        this.pageParams.received = false
        this.pageParams.qrTimer = setInterval(async () => {
          const { pageParams: { couponId ,carInfo }, customerInfo } = this,
            res = await uni.$api.boutiqueApi.findCustomerReceivedStatus({
              merchantCouponId: couponId,
              customerPhone: customerInfo.phoneNumber,
              receiveCouponStartTime
            })
          if (res && res.total) {
            this.pageParams.received = true
            this.isCheck = false
            this.$emit('reception', {
              item: {
                customerName: customerInfo.customerName,
                carSeriesName: carInfo.name,
                customerPhone: customerInfo.phoneNumber,
                userId: customerInfo.salesUuid,
                employeeName: customerInfo.staffName,
                receiveCouponDate: Date.now(),
                customerCouponId: res.list[0].id,
              }
            })
          }
        }, 2e3)
      } catch (error) {
        if (error) uni.showToast({
          title: error,
          icon: "none",
        });
      }
    },
    closeAllPopup () {
      this.$refs.employeeBoxVisible?.close()
      this.$refs.couponBoxVisible?.close()
    },
  }
}
</script>

<style scoped lang="scss">
.coupon-popup {
  z-index: 99 !important;
}
.footer-btn {
  width: toRpx(518);
  height: toRpx(96);
  background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
  box-shadow: inset 0 0 toRpx(32) 0 #ffffff80;
  border-radius: toRpx(16);
  font-weight: 500;
  font-size: toRpx(36);
  color: #ffffff;
  line-height: toRpx(96);
  text-align: center;
  margin: 0 auto;
  margin-top: toRpx(70);
}
.content {
  display: inline-flex;
  margin-top: toRpx(18);
  .qr-code {
    margin-top: toRpx(62);
    width: toRpx(400);
    margin-left: toRpx(64);
    &-box {
      height: toRpx(400);
      border-radius: toRpx(23);
      background-color: #f9f9f9;
    }
    &-img {
      width: toRpx(400);
      height: toRpx(400);
    }
  }
}
.form {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: toRpx(32) 0;
  padding-top: toRpx(30);
  &-item {
    display: flex;
    align-items: center;
    color: #6c6c70;
    font-size: toRpx(30);
    box-sizing: border-box;
    margin: 0 auto;
    .label {
      position: relative;
      margin-left: auto;
      flex-shrink: 0;
      width: toRpx(124);
    }
    .required {
      &::before {
        content: '*';
        color: #ff0000;
        position: absolute;
        left: toMinusRpx(20);
        top: 50%;
        transform: translate(0, -50%);
      }
    }
    .value {
      width: toRpx(468);
      height: toRpx(80);
      border: toRpx(2) solid #e8e8ea;
      background: #ffffff;
      margin-left: toRpx(32);
      box-sizing: border-box;
      padding: 0 toRpx(40);
      border-radius: toRpx(8);
      .text {
        line-height: toRpx(80);
      }
      &.error {
        border: toRpx(2) solid #f24724;
        border-radius: toRpx(8);
      }
      .input,
      .select {
        width: 100%;
        height: 100%;
        border: none !important;
        outline: none;
        padding: 0 !important;
        font-size: toRpx(30);
        &::placeholder {
          color: #c9c9c9;
        }
      }
      .select {
        display: flex;
        align-items: center;
        .arrow {
          margin-left: auto;
        }
      }
      /deep/ .placeholder {
        font-size: toRpx(30);
        color: #c9c9c9;
      }
    }
    .disabled {
      background: #f4f4f4;
      .select {
        .arrow {
          display: none;
        }
      }
    }
  }
}
.select-box {
  margin: toRpx(40) 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: toRpx(32);
  overflow-y: scroll;
  max-height: 50vh;
  padding-bottom: toRpx(60);
  .select-item {
    text-align: center;
    height: toRpx(68);
    line-height: toRpx(68);
    opacity: 1;
    border: toRpx(2) solid #dce0e6;
    color: #292d33;
    font-size: toRpx(28);
    border-radius: toRpx(8);
    &.checked {
      border: toRpx(2) solid #292d33;
    }
  }
}
.no-data {
  width: 100%;
  height: 100%;
  font-size: toRpx(24);
  color: #999999;
  line-height: toRpx(36);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  &-img {
    width: 100%;
    height: toRpx(138);
    background-image: url('@/assets/images/boutique/no-data.webp');
    background-size: 100%;
  }
}
.disabled {
  filter: opacity(0.5);
}
.ok {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-weight: 500;
  font-size: toRpx(28);
  color: #333333;
  width: 100%;
  height: 100%;
  &-status {
    width: toRpx(96);
    height: toRpx(96);
    margin-bottom: toRpx(16);
    background-image: url('@/assets/images/boutique/ok-status.webp');
    background-size: 100%;
  }
}
.ok-tips {
  font-size: toRpx(28);
  color: #999999;
  text-align: center;
  line-height: toRpx(36);
  margin-top: toRpx(32);
}
.customer-info {
  flex: 1;
  padding-top: toRpx(30);
  background-color: #f9f9f9;
  border-radius: toRpx(16);
  padding: toRpx(48);
  margin-top: toRpx(30);
  margin-bottom: toRpx(56);
  .customer-title {
    font-size: toRpx(30);
    color: #333333;
    letter-spacing: 0;
    line-height: toRpx(44);
    height: toRpx(44);
  }
  .line {
    width: 100%;
    height: toRpx(2);
    background-color: #e0e0e0;
    margin: toRpx(32) 0;
  }
  .customer-list {
    display: flex;
    flex-wrap: wrap;
    gap: toRpx(32) 0;
  }
  .customer-item {
    width: 100%;
    display: flex;
    align-items: center;
    .label {
      width: toRpx(185);
      text-align: right;
      margin-right: toRpx(32);
      font-size: toRpx(28);
      color: #6c6c70;
      line-height: toRpx(44);
    }
    .value-text {
      flex: 1;
      font-size: toRpx(30);
      color: #333333;
      line-height: toRpx(44);
    }
  }
}
</style>
