<template>
  <view :class="['layout',{'byd-layout':isByd}]">
    <wnCanvas
      :canvasId="`c-${madiaId}`"
      :drawStatus="penSwitch"
      custom
      @scale="$emit('scale',$event)"
      :scaleSwitch="false"
    >
      <template slot="customContent">
        <view class="layout-content">
          <view class="title">
            <view class="text">{{title}}</view>
          </view>
          <view class="content">
            <view
              class="form-box"
              :key="watchStatus"
            >
              <view class="form">
                <template v-for="(i, index) in formObject">
                  <view
                    :class="['form-item' ,{active:focusIndex == index}]"
                    :key="index"
                  >
                    <view class="form-item-box">
                      <template v-if="i.type == 'input'">
                        <input
                          :type="i.inputType"
                          :maxlength="i.maxlength"
                          v-model="customerInfo[i.key]"
                          class="input"
                          @input="inputCustomer"
                          :placeholder="i.placeholder"
                          @focus="focusIndex = index"
                          @blur="resetFocusIndex"
                          :data-key="i.key"
                        />
                        <customer-autocomplete
                          :showType="i.inputType"
                          :searchValue="customerInfo[i.key]"
                          :show="focusIndex == index"
                          @choose="chooseCustomer"
                          v-if="i.hasCustomerAutocomplete"
                        />
                        <template v-if="i.unit">
                          <view class="unit">{{i.unit}}</view>
                        </template>
                      </template>
                      <template v-else>
                        <view
                          :class="['select flex',{placeholderStyle:!customerInfo[i.key]}]"
                          @click="showPopup(i.popKey,index)"
                        >
                          <view class="value text-hide">{{customerInfo[i.key] ||i.placeholder}}</view>
                          <uni-icons
                            class="arrow"
                            type="right"
                            :size="16"
                          ></uni-icons>
                        </view>
                      </template>
                    </view>
                  </view>
                </template>
              </view>
            </view>
          </view>
          <insurance-table
            :isPreview="isPreview"
            :show="show"
          />
        </view>
      </template>
    </wnCanvas>
    <car-brands
      ref="carBrandListVisible"
      @select="handleSelect($event,'carBrandListVisible')"
      @close="resetFocusIndex"
    />
    <carBuyers
      ref="carBuyersVisible"
      @select="handleSelect($event,'carBuyersVisible')"
      @close="resetFocusIndex"
    />
  </view>
</template>

<script type="text/ecmascript-6">
import CarBrands from '@/components/CarBrands.vue'
import InsuranceTable from './components/InsuranceTable.vue'
import carBuyers from './components/carBuyers.vue'
import CustomerAutocomplete from '@/components/CustomerAutocomplete.vue'
export default {
  components: { CarBrands, InsuranceTable, CustomerAutocomplete, carBuyers },
  props: {
    penSwitch: Boolean,
    show: Boolean,
    title: String,
    isPreview: Boolean,
    isByd: Boolean,
    madiaId: Number
  },
  name: 'Reception',
  data () {
    return {
      formObject: [
        {
          placeholder: '车主姓名',
          key: 'customerName',
          type: 'input',
          inputType: 'text',
          maxlength: 50,
          hasCustomerAutocomplete: true
        },
        {
          placeholder: '车主电话',
          key: 'phoneNumber',
          type: 'input',
          inputType: 'tel',
          maxlength: 11,
          hasCustomerAutocomplete: true
        },
        {
          placeholder: '品牌车型',
          key: 'carModel',
          type: 'select',
          popKey: 'carBrandListVisible',
        },
        {
          placeholder: '新车开票价',
          key: 'newCarFare',
          type: 'input',
          inputType: 'digit',
          maxlength: 10,
          unit: '元',
        },
        {
          placeholder: '购车方式',
          key: 'carBuyers',
          type: 'select',
          popKey: 'carBuyersVisible',
        }
      ],
      customerInfo: {},
      focusIndex: -1,
      insuranceList: []
    }
  },
  watch: {
    watchCustomerInfo: {
      immediate: true,
      handler (newval) {
        if (newval) this.customerInfo = newval
      }
    },
  },
  computed: {
    watchCustomerInfo () {
      return this.$store.state.user.customerInfo
    },
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
  },
  methods: {
    inputCustomer () {
      this.$store.dispatch('setCustomerInfo', this.customerInfo)
    },
    handleSelect (item, popkey) {
      this.$refs[popkey].close()
      if (popkey == 'employeeBoxVisible') {
        this.customerInfo.salesUuid = item.uuid
        this.customerInfo.staffName = item.staffName
      } else if (popkey == 'carBuyersVisible') {
        this.customerInfo.carBuyers = item.name
        this.customerInfo.carPurchaseMethod = item.id
      } else {
        this.$refs.carBrandListVisible.close()
        this.customerInfo.carModel = item.name
        this.customerInfo.carModelId = item.id
      }
      this.resetFocusIndex()
      this.$store.dispatch('setCustomerInfo', this.customerInfo)
    },
    showPopup (e, index) {
      this.focusIndex = index
      this.$refs[e].open()
    },
    closeAllPopup () {
      this.$refs.carBrandListVisible.close()
      this.resetFocusIndex()
    },
    resetFocusIndex (e) {
      this.focusIndex = -1
      if (e?.currentTarget && e?.target) {
        const { key } = e.currentTarget.dataset
        if (e.target.value.length == 0) return
        if (key == 'newCarFare') {
          let value = Number(e.target.value) >= 9999999 ? 9999999 : e.target.value
          // 判断是否为整数
          if (!Number.isInteger(value)) value = String(value).replace(/(\d*\.?\d{0,2})\d*/, '$1')
          value = Number(String(value).replace(/^0+/, ''))
          this.customerInfo[key] = Number(value).toFixed(2) ? Number(value).toFixed(2) >= 0 ? value : '' : ''
          this.inputCustomer()
        }
      }
    },
    chooseCustomer (e) {
      this.customerInfo = {
        ...this.customerInfo,
        phoneNumber: e.ownerPhone,
        customerName: e.ownerName,
        carModel: e.brandModel
      }
      this.inputCustomer()
    }
  }
}
</script>

<style scoped lang="scss">
.layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/media/insurance-bg.webp');
  background-size: 100%;
  &-content {
    height: 100%;
    margin: $margin;
    position: relative;
  }
  .title {
    padding: toRpx(120) 0 toRpx(48) toRpx(128);
    .text {
      line-height: toRpx(80);
      font-weight: 500;
      font-size: toRpx(56);
      color: #333333;
    }
  }
  .content {
    .form-box {
      height: toRpx(80);
      padding: 0 toRpx(128);
      .form {
        display: flex;
        gap: 0 toRpx(28);
        height: 100%;
        &-item {
          width: toRpx(368);
          height: 100%;
          position: relative;

          &-box {
            position: relative;
            width: 100%;
            height: 100%;
            background: #ffffff;
            border: toRpx(3) solid #a8c1ff;
            border-radius: toRpx(16);
            box-sizing: border-box;
            padding: 0 toRpx(24);
            z-index: 2;
            display: flex;
            align-items: center;
            .unit {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              right: toRpx(24);
              font-weight: 300;
              font-size: toRpx(28);
              color: #292d33;
              line-height: toRpx(36);
            }
          }
          .input,
          .select {
            width: 100%;
            height: toRpx(60);
            border: none !important;
            outline: none;
            font-size: toRpx(28);
            color: #333333;
            border-radius: toRpx(16);
            box-sizing: border-box;
            padding: 0 !important;
            display: flex;
            align-items: center;
            &::placeholder {
              color: #999999;
            }
          }
          .placeholderStyle {
            color: #999999;
            line-height: toRpx(80);
          }
          .arrow {
            color: #999 !important;
            margin-left: auto;
            flex-shrink: 0;
          }
        }
        .active {
          &::after {
            position: absolute;
            left: toMinusRpx(2);
            top: toMinusRpx(2);
            width: calc(100% + #{toRpx(4)});
            height: calc(100% + #{toRpx(4)});
            content: '';
            background-image: linear-gradient(#2f6af7, #75bcff);
            box-shadow: 0 0 0 toRpx(8) #2c66f71a;
            border-radius: toRpx(16);
          }
        }
      }
    }
  }
}
.byd-layout {
  background-image: url('@/assets/images/media/byd-insurance-bg.webp') !important;
  .title {
    padding: toRpx(120) toRpx(128) toRpx(48);
    .text {
      text-align: center;
    }
  }
}
</style>
