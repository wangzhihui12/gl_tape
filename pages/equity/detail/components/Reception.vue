<template>
  <view :class="['layout', { 'byd-layout': isByd }]">
    <wnCanvas
      saveImageType="3"
      canvasId="c-1"
      :drawStatus="penSwitch"
      custom
      @scale="$emit('scale',$event)"
    >
      <template slot="customContent">
        <view class="layout-content">
          <view class="title flex">
            {{title}}
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
                        />
                        <customer-autocomplete
                          :showType="i.inputType"
                          :searchValue="customerInfo[i.key]"
                          :show="focusIndex == index"
                          @choose="chooseCustomer"
                        />
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
            <image
              class="content-image"
              :src="contentUrl()"
            />
            <!-- <image
              class="content-bg"
              :src="receptionBg()"
            /> -->
          </view>
        </view>
      </template>
    </wnCanvas>
    <car-brands
      ref="carBrandListVisible"
      @select="handleSelect($event,'carBrandListVisible')"
      @close="resetFocusIndex"
    />
  </view>
</template>

<script type="text/ecmascript-6">
import CarBrands from '@/components/CarBrands.vue'
import CustomerAutocomplete from '@/components/CustomerAutocomplete.vue'
export default {
  components: { CarBrands, CustomerAutocomplete },
  props: {
    penSwitch: Boolean,
    show: Boolean,
    title: String,
    views: [Array, Object],
    aitoCarModelIds: Array,
    isByd: Boolean
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
          maxlength: 50
        },
        {
          placeholder: '车主电话',
          key: 'phoneNumber',
          type: 'input',
          inputType: 'tel',
          maxlength: 11
        },
        {
          placeholder: '品牌车型',
          key: 'carModel',
          type: 'select',
          popKey: 'carBrandListVisible'
        },
      ],
      customerInfo: {},
      focusIndex: -1,
    }
  },
  watch: {
    watchCustomerInfo: {
      immediate: true,
      handler (newval) {
        if (newval) this.customerInfo = newval
      }
    },
    show: {
      immediate: true,
      handler (n) {
        setTimeout(() => {
          if (n && !this.customerInfo.carModel && this.isAito) this.$refs.carBrandListVisible.autoSelect()
        }, 1e3)
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
    isAito () {
      //  1问界 
      return uni.$storage.get('userInfo').channelType == 1
    }
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
    resetFocusIndex () {
      this.focusIndex = -1
    },
    chooseCustomer (e) {
      this.customerInfo = {
        ...this.customerInfo,
        phoneNumber: e.ownerPhone,
        customerName: e.ownerName,
      }
      uni.$logger.local.info(`从客户档案选择：${JSON.stringify(e)}`)
      if (e.carModelId) {
        this.customerInfo.carModelId = e.carModelId
        this.customerInfo.carModel = e.brandModel
        this.customerInfo.carBrand = e.carBrand
        this.customerInfo.carBrandId = e.carBrandId
        this.customerInfo.oneCarBrand = e.oneCarBrand
        this.customerInfo.oneCarBrandId = e.oneCarBrandId
      }
      this.inputCustomer()
    },
    receptionBg () {
      let bgUrl = require('@/assets/images/common/home-bg.webp')
      return bgUrl
    },
    contentUrl () {
      let { views, customerInfo } = this
      return (views.detailUrl ? views.detailUrl : views[customerInfo.carModelId]) || require('@/assets/images/media/nothing.webp')
    }
  }
}
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;

  background-size: 100%;
  &-content {
    position: relative;
    height: 100%;
    margin: $margin;
  }
  .title {
    position: fixed;
    left: 0;
    top: toRpx(48);
    width: 100%;
    justify-content: center;
    z-index: 2;
    height: toRpx(96);
    align-items: center;
    font-weight: 500;
    font-size: toRpx(36);
    color: #1a1a1a;
  }
  .content {
    .form-box {
      height: toRpx(80);
      padding: 0 toRpx(110);
      z-index: 2;
      position: absolute;
      left: toRpx(64);
      top: toRpx(168);
      padding: 0;
      .form {
        display: flex;
        gap: 0 toRpx(28);
        height: 100%;
        &-item {
          width: toRpx(524);
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
          }
          .input,
          .select {
            width: 100%;
            height: 100%;
            border: none !important;
            outline: none;
            font-size: toRpx(28);
            color: #333333;
            border-radius: toRpx(16);
            box-sizing: border-box;
            line-height: toRpx(80);
            padding: 0 !important;
            &::placeholder {
              color: #999999;
            }
          }
          .placeholderStyle {
            color: #999999;
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
    &-image {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    &-bg {
      width: 100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
    }
  }
}
</style>
