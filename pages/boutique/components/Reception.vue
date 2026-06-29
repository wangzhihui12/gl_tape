<template>
  <view class="layout">
    <wnCanvas
      :canvasId="`c-${madiaId}`"
      :drawStatus="penSwitch"
      custom
      :scaleSwitch="false"
      ref="receptionCanvas"
    >
      <template slot="customContent">
        <view class="layout-content">
          <view class="select-box flex">
            <view
              class="select flex"
              @click.stop="showSelect"
            >
              {{currentCarString}}
              <view
                class="sprite-icon icon-arrow-bottom"
                v-if="carList.length > 1 && !change_disabled"
              ></view>
            </view>
            <view
              class="pop-box"
              v-show="isSelect"
            >
              <template v-for="(i,index) in carList">
                <view
                  :key="i.carModelId"
                  :class="['type-item flex',{active:i.carModelId == currentCarId},{'has-line':showLine(i,index)},{'is-first':index == 0}]"
                  @click="changeCar(i)"
                >{{i.carModelName}}</view>
              </template>
            </view>
          </view>
          <view
            class="risk-informed flex"
            @click="$refs.riskInformedPop.open()"
          >
            风险告知
            <view class="sprite-icon icon-info_shield"></view>
          </view>
          <view
            class="content-box flex"
            v-show="tabIndex == 0"
          >
            <template v-if="currentItem && currentItem.modelDisplayPicurl">
              <view
                class="left-content"
                :key="updateViewKey"
                @click="showPicture(currentItem)"
              >
                <image
                  :src="currentItem.modelDisplayPicurl"
                  class="poster"
                />
                <view
                  class="tips"
                  v-if="currentItem.detailPicurl"
                >* 点击图片查看详情 &gt;</view>
              </view>
            </template>
            <view class="right-content">
              <view :class="['sku-box',isPreview ? 'preview' : '']">
                <sku-box
                  :currentCar="currentCarId"
                  :defaultTabId="tabId"
                  :show="show && tabIndex == 0"
                  @changePreView="changePreView"
                  ref="sku"
                />
              </view>
              <view
                class="coupon-btn flex"
                v-if="!isPreview"
                @click="couponPopupRef.open(customerType, customerInfo)"
              >{{couponText}}</view>
            </view>
          </view>
          <optional-table
            v-show="tabIndex == 1"
            :currentCar="currentCarId"
            :show="show && tabIndex == 1"
          ></optional-table>
          <template v-if="hasOptionals">
            <view class="tabs-box flex">
              <template v-for="(i,index) in tabs">
                <view
                  :class="['tab flex',{active:index==tabIndex}]"
                  :key="index"
                  @click="changeTab(index)"
                >{{i}}</view>
              </template>
              <view :class="['block',{'block-right':tabIndex == 1}]"></view>
            </view>
          </template>
        </view>
      </template>
    </wnCanvas>
    <car-brands
      ref="carBrandRef"
      @select="handleSelect"
    />
    <coupon-pop
      :carInfo="carInfo"
      ref="couponPopup"
      @reception="reception"
      :show="show"
      @hideTool="$emit('hideTool')"
      tips="微信扫码进入客户录单页"
      :title="customerType == 1 ?'为客户发券' : '客户小程序码'"
    />
    <risk-informed-box
      ref="riskInformedPop"
      :popupImg="popupImg"
    />
  </view>
</template>

<script type='text/ecmascript-6'>
import SkuBox from './SkuBox.vue'
import CarBrands from '@/components/CarBrands.vue'
import CouponPop from './CouponPop.vue'
import RiskInformedBox from './RiskInformedBox.vue'
import OptionalTable from './OptionalTable.vue'
export default {
  name: 'Reception',
  components: { SkuBox, CarBrands, CouponPop, RiskInformedBox, OptionalTable },
  props: {
    customerType: Number,
    show: Boolean,
    tabId: Number,
    propCarId: [Number, String],
    type: String,
    popupImg: String,
    madiaId: Number,
    penSwitch: Boolean,
  },
  data () {
    return {
      currentCarString: '',
      customerInfo: {},
      updateViewKey: Date.now(),
      carInfo: {},
      currentImgUrl: '',
      currentItem: null,
      tabs: ['加装', '选装'],
      tabIndex: 0,
      isSelect: false,
      currentCarId: ''
    }
  },
  watch: {
    watchCustomerInfo: {
      immediate: true,
      handler (newval) {
        this.customerInfo = newval
      }
    },
    propCarId: {
      immediate: true,
      handler (newval) {
        this.currentCarId = newval
        this.currentCarString = this.carList.find(e => e.carModelId == newval)?.carModelName || ''
      }
    },
    currentCarId: {
      immediate: true,
      handler (newval) {
        if (!this.hasOptionals && this.tabIndex == 1) this.tabIndex = 0
        if (this.show && newval && !this.isPreview && this.customerType == 1) {
          uni.showLoading({
            mask: true
          })
          let item = this.carList.find(e => e.carModelId == newval)
          this.$refs.carBrandRef.selectCar(item, true, newval)
        }
      }
    },
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.tabIndex = 0
        this.currentItem = null
        this.closeAllPopup()
      }
    },
    show: {
      immediate: true,
      handler (newval) {
        if (newval) {
          this.isSelect = false
          if (newval && this.currentItem && this.tabIndex == 0) this.changePreView(this.currentItem, false, false)
        }
      }
    }

  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus;
    },
    watchCustomerInfo () {
      return this.$store.state.user.customerInfo
    },
    isPreview () {
      return this.type == 'preview'
    },
    couponText () {
      return this.customerType == 0 ? '查看客户券码' : '为客户发券'
    },
    couponPopupRef () {
      return this.$refs.couponPopup
    },
    change_disabled () {
      return this.customerType == 0 || this.$refs?.couponPopup?.pageParams.QRURL
    },
    receptionTrack () {
      return this.$store.state.user.receptionTrack
    },
    boutiqueMediaConfig () {
      return this.$store.state.user.boutiqueMediaConfig
    },
    hasOptionals () {
      let flag = false
      if (this.show) flag = this.boutiqueMediaConfig[this.currentCarId].optionals && this.boutiqueMediaConfig[this.currentCarId].optionals.length
      return flag
    },
    carList () {
      return this.$store.state.user.boutiqueCarList
    }
  },

  methods: {
    changeCar (item) {
      if (this.change_disabled || this.currentCarId == item.carModelId) return uni.hideLoading()
      this.currentCarString = item.carModelName
      this.currentCarId = item.carModelId
      this.isSelect = false
      this.updateViewKey = Date.now()
      this.clearCanvas()
    },
    changePreView (e, leave = true, clearBoard = true) {
      let { currentItem } = this,
        { id, carModelName, name, materialType } = e,
        key = `${carModelName}_${id}`,
        value = this.receptionTrack[key]
      if (currentItem && leave) this.previewLeave(currentItem)
      this.currentItem = e
      this.updateViewKey = Date.now()
      if (this.isPreview) return
      if (clearBoard) this.clearCanvas()
      if (value) {
        value.openCount += 1
        value.entryTime = Date.now()
      } else {
        value = {
          openCount: 1,
          materialName: name,
          materialId: id,
          stayDuration: 0,
          entryTime: Date.now(),
          materialType
        }
      }
      this.$store.dispatch("setReceptionTrack", { key, value })
    },
    handleSelect (item) {
      this.customerInfo.carModel = item.name || ''
      this.customerInfo.carModelId = item.id || ''
      Object.assign(this.customerInfo, {
        carBrand: item.carChildsBrandName || '',
        carBrandId: item.carChildsBrandId || '',
        oneCarBrand: item.carBrand || '',
        oneCarBrandId: item.carBrandId || ''
      })
      this.$store.dispatch('setCustomerInfo', this.customerInfo)
      this.carInfo = item
      uni.hideLoading()
    },
    showPicture (off = true) {
      let { detailPicurl } = this.currentItem
      this.currentImgUrl = off ? detailPicurl : ''
    },
    reception (e) {
      this.clearCustomerReceivedTimer()
      this.$emit('reception', e)
    },
    clearCustomerReceivedTimer () {
      if (this.couponPopupRef?.pageParams?.qrTimer) {
        clearInterval(this.couponPopupRef.pageParams.qrTimer)
        this.couponPopupRef.pageParams.qrTimer = null
      }
    },
    closeAllPopup () {
      this.$refs.riskInformedPop?.close()
      this.$refs.couponPopup?.close()
    },
    previewLeave (currentItem) {
      if (this.isPreview) return
      let key = `${currentItem.carModelName}_${currentItem.id}`,
        value = this.receptionTrack[key]
      value.stayDuration += Number(Date.now() - value.entryTime)
      this.$store.dispatch("setReceptionTrack", { key, value })
    },
    clearSkuState () {
      this.$refs.sku.requested = false
    },
    clearCanvas () {
      this.$refs.receptionCanvas.clearBoard()
    },
    changeTab (index) {
      if (this.tabIndex == index) return
      this.tabIndex = index
      if (index == 1) this.previewLeave(this.currentItem)
      else this.$refs.sku.changeCar(this.currentCarId)
      this.clearCanvas()
    },
    showSelect () {
      if (this.carList.length == 1 || this.change_disabled) return
      this.isSelect = !this.isSelect
    },
    showLine (item, index) {
      let result = true,
        { carList } = this
      if (index != 0 && item.id == carList[index - 1].id) result = false
      return result
    }
  }
}
</script>

<style scoped lang='scss'>
.layout {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  &-content {
    height: 100%;
    margin: $margin;
    position: relative;
  }
  .risk-informed {
    position: absolute;
    right: toRpx(24);
    top: toRpx(72);
    font-weight: 500;
    font-size: toRpx(32);
    color: #333333;
    line-height: toRpx(48);
    z-index: 2;
    .sprite-icon {
      margin-left: toRpx(8);
    }
  }
  .select-box {
    padding-top: toRpx(66);
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    justify-content: center;
    z-index: 2;
    .select {
      color: #333333;
      font-size: toRpx(36);
      font-weight: 500;
      line-height: toRpx(44);
    }
    .pop-box {
      width: toRpx(272);
      border-radius: toRpx(16);
      background: #ffffff;
      box-shadow: 0 0 toRpx(16) 0 #99999933;
      position: absolute;
      top: toRpx(122);
      left: 50%;
      transform: translateX(-50%);
      padding: toRpx(12) 0;
      animation: show-view-opacity 0.15s forwards;
      .type-item {
        padding: 0 toRpx(24);
        margin: toRpx(8) 0;
        height: toRpx(56);
        color: #292d33;
        font-size: toRpx(28);
        position: relative;
        &:first-child {
          margin-top: 0;
        }
        &:last-child {
          margin-bottom: 0;
        }
        &.active {
          background-color: #ecf1ff;
        }
      }
      .has-line {
        margin-top: toRpx(18);
        &::after {
          content: '';
          width: calc(100% - #{toRpx(48)});
          height: toRpx(2);
          background: #f5f5f5;
          position: absolute;
          left: 50%;
          top: toMinusRpx(10);
          transform: translateX(-50%);
        }
      }
      .is-first {
        &::after {
          display: none;
        }
      }
    }
  }
  .content-box {
    height: 100%;
    padding: toRpx(144) 0 toRpx(64) toRpx(64);
    animation: show-view-opacity 0.15s forwards;
    .left-content {
      width: toRpx(1328);
      height: 100%;
      position: relative;
      .poster {
        width: 100%;
        height: 100%;
      }
      .tips {
        position: absolute;
        right: toRpx(32);
        bottom: toRpx(32);
        animation: tips-show 0.15s forwards;
        font-size: toRpx(24);
        color: #999999;
        line-height: toRpx(36);
      }
      @keyframes tips-show {
        0% {
          transform: scale(0.1);
        }
        100% {
          transform: scale(1);
        }
      }
      .default {
        width: 100%;
        height: toRpx(664);
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    .right-content {
      width: calc(100% - #{toRpx(1362)});
      height: 100%;
      display: flex;
      flex-direction: column;
      margin-left: auto;
      .sku-box {
        height: calc(100% - #{toRpx(116)});
      }
      .preview {
        height: 100%;
      }
      .coupon-btn {
        margin-top: auto;
        width: calc(100% - #{toRpx(64)});
        height: toRpx(96);
        background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
        box-shadow: inset 0 0 toRpx(32) 0 #ffffff;
        border-radius: toRpx(16);
        font-weight: 500;
        font-size: toRpx(36);
        color: #ffffff;
        justify-content: center;
      }
    }
  }
  .tabs-box {
    position: absolute;
    top: toRpx(156);
    left: toRpx(80);
    width: toRpx(212);
    height: toRpx(64);
    background: #f2f2f2;
    border-radius: toRpx(40);
    box-sizing: border-box;
    border: toRpx(2) solid #f2f2f2;
    .tab {
      width: 50%;
      height: 100%;
      justify-content: center;
      font-size: toRpx(28);
      color: #666666;
      line-height: toRpx(44);
      position: relative;
      z-index: 2;
      transition: all 0.15s;
    }
    .active {
      font-weight: 500;
      color: #ffffff;
    }
    .block {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 50%;
      height: 100%;
      background: #333333;
      border-radius: toRpx(40);
      transition: all 0.15s;
    }
    .block-right {
      left: 50%;
    }
  }
}
</style>