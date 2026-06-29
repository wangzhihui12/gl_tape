<template>
  <view class="order-popup">
    <popup :position="position" :animation="animation" ref="popup" @onConfirm="confirm" @onCancel="cancel" @onReset="reset" :showReset="popupType === 15" :hideFooter="componentObject[popupType] && componentObject[popupType].hideFooter" :popupStyle="(componentObject[popupType] && componentObject[popupType].popupStyle) || ''">
      <view class="popup-title flex">
        {{ title }}
        <view class="popup-close flex" @click="close">
          <uni-icons type="closeempty" size="16"></uni-icons>
        </view>
      </view>
      <template v-if="componentObject[popupType] && !componentObject[popupType].hideSearch">
        <view class="popup-search">
          <input class="input" type="text" :placeholder="(componentObject[popupType] && componentObject[popupType].placeholder) || '请输入'" placeholder-class="placeholder" v-model="componentObject[popupType].searchValue" confirm-type="search" @input="onSearchValueInput" @confirm="handleSearch" />
          <view class="clear flex" @click="clear">
            <uni-icons type="closeempty" size="16" v-if="componentObject[popupType] && componentObject[popupType].searchValue"></uni-icons>
          </view>
        </view>
      </template>
      <view v-if="componentObject[popupType]" :class="['popup-body', { 'hide-footer': componentObject[popupType].hideFooter }, { 'hide-search': componentObject[popupType].hideSearch }, { 'hide-footer-search': componentObject[popupType].hideFooter && componentObject[popupType].hideSearch }]">
        <scroll-view scroll-y :class="['popup-scroll-view', { show: componentObject[popupType].loadComplete }]">
          <component :is="componentObject[popupType].name" :params.sync="componentObject[popupType]" :data="data" :dataKey="dataKey" :isDefeatOrder="isDefeatOrder" :defaultTime="defaultTime" :positionTypeList="positionTypeList" ref="componentRef" @choose="chooseContent = $event" @openSkuPopup="openSkuPopup" @onComplete="componentObject[popupType].loadComplete = true" @confirm="confirm"></component>
          <template v-if="componentObject[popupType].noData">
            <view class="nothing flex">暂无数据</view>
          </template>
        </scroll-view>
        <image v-if="!componentObject[popupType].loadComplete" class="loading" src="../../assets/images/common/loadding.gif" />
      </view>
    </popup>
    <sku-popup ref="skuPopupRef" @onConfirm="skuConfirm"></sku-popup>
  </view>
</template>

<script type="text/ecmascript-6">
import Popup from '@/components/Popup.vue'
import config from './config'
import EmployeeList from './components/EmployeeList.vue'
import DiversionMerchant from './components/DiversionMerchant.vue'
import CarModelList from './components/CarModelList.vue'
import CouponList from './components/CouponList.vue'
import GoodsList from './components/GoodsList.vue'
import PackageList from './components/PackageList.vue'
import SkuGoodsList from './components/SkuGoodsList.vue'
import SkuPopup from './components/SkuPopup.vue'
import DateTime from './components/DateTime.vue'
import DateTimeChange from './components/DateTimeChange.vue'
import AgreementList from './components/AgreementList.vue'
import GoodsCategory from './components/GoodsCategory.vue'
import AgeRange from './components/AgeRange.vue'
import City from './components/City.vue'
import Seat from './components/Seat.vue'
import Customer from './components/Customer.vue'
import Options from './components/Options.vue'
import CarBrand from './components/CarBrand.vue'
import Gearbox from './components/Gearbox.vue'
import OrderTypePopup from './components/OrderTypePopup.vue'
import SceneList from './components/SceneList.vue'

export default {
  components: {
    Popup,
    EmployeeList,
    DiversionMerchant,
    CarModelList,
    CouponList,
    GoodsList,
    PackageList,
    SkuGoodsList,
    SkuPopup,
    DateTime,
    AgreementList,
    DateTimeChange,
    GoodsCategory,
    AgeRange,
    City,
    Seat,
    Customer,
    Options,
    CarBrand,
    Gearbox,
    OrderTypePopup,
    SceneList
  },
  name: '',
  props: {
    animation: {
      type: Boolean,
      default: true
    },

    maskClick: {
      type: Boolean,
      default: false
    },
    popupType: {
      type: [Number, String],
      default: 0
    },
    data: [Object, Array],
    externalData: null,
    dataKey: String,
    isDefeatOrder: {
      type: Boolean,
      default: false
    },
    defaultTime: String,
    popupTitle: String
  },

  provide () {
    return {
      userInfo: this.userInfo,
      baseConfigData: this.baseConfigData,
      sceneType: this.sceneType
    }
  },
  data () {
    return {
      position: 'bottom',
      chooseContent: null,
      componentObject: JSON.parse(JSON.stringify(config.componentConfig)),
      positionTypeList: []
    }
  },

  watch: {
    popupType: {
      handler (val) {
        if (val == 11 || val == 12) this.position = 'right'
        else this.position = 'bottom'
      },
      deep: true,
      immediate: true
    },
    externalData: {
      handler (val) {
        if (val && val.length && this.componentObject[this.popupType]) {
          this.componentObject[this.popupType].cacheData = val
        }
      },
      deep: true,
      immediate: true
    },
    isDefeatOrder: {
      async handler (val) {
        if (val) {
          this.positionTypeList = await uni.$api.popupApi.getPositionList()
        }
      },
      immediate: true
    }
  },
  computed: {
    title () {
      return this.popupTitle || config.componentConfig[this.popupType].title
    },
    userInfo () {
      return uni.$storage.get("userInfo")
    },
    baseConfigData () {
      return this.$store.state.boutique.baseConfigData
    },
    sceneType () {
      const { sceneType } = uni.$storage.get('userInfo')
      return sceneType
    },
  },
  mounted () {
  },
  methods: {
    componentRef () {
      return this.$refs.componentRef
    },
    // 场景切换后清空依赖 sceneType 的弹窗缓存，下次打开时强制重新请求
    clearCacheByTypes (types) {
      (types || []).forEach(type => {
        if (this.componentObject[type]) {
          this.componentObject[type].cacheData = []
        }
      })
    },
    open () {
      this.$refs.popup.open()
      // 等待当前 tick 的响应式 watcher（如 externalData → cacheData）执行完再初始化
      this.$nextTick(() => {
        this.initPopupData()
      })
    },
    cancel () {
      this.$refs.popup.close()
      this.$emit('cancel')
    },
    close () {
      this.$refs.popup.close()
      this.$emit('close')
    },
    initPopupData () {
      this.chooseContent = null
      if (!this.componentObject[this.popupType]) {
        console.error(`Popup type ${this.popupType} not found in config`)
        return
      }
      let componentRef = this.componentRef()
      if (!componentRef) setTimeout(this.initPopupData, .1e3)
      else componentRef.getList && componentRef.getList(this.componentObject[this.popupType].searchValue || '')
    },
    handleSearch () {
      if (!this.componentObject[this.popupType]) {
        console.error(`Popup type ${this.popupType} not found in config`)
        return
      }
      let componentRef = this.componentRef()
      if (!componentRef) uni.showToast({
        title: '请稍后再试',
        icon: 'none'
      })
      else componentRef.handleSearch(this.componentObject[this.popupType].searchValue || '')
    },
    confirm (autoClose) {
      try {
        let { chooseContent, popupType, componentObject } = this
        if (popupType == 13) {
          chooseContent = this.componentRef().getResult()
        }
        if (popupType == 15) {
          this.$emit('onConfirm', {
            chooseContent,
            popupType
          })
          if (!autoClose) this.$refs.popup.close()
          return
        }
        if (chooseContent != null) {
          if (Array.isArray(chooseContent) && !chooseContent.length && componentObject[popupType].nullTips) throw componentObject[popupType].nullTips
          this.$emit('onConfirm', {
            chooseContent,
            popupType
          })
          if (!autoClose) this.$refs.popup.close()
        } else {
          if (componentObject[popupType].nullTips) throw componentObject[popupType].nullTips
        }
      } catch (error) {
        if (error) uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    openSkuPopup (data, chooseList) {
      if (chooseList.length) this.confirm()
      else this.$refs.popup.close()
      this.$refs.skuPopupRef.open(data)
    },
    skuConfirm (e) {
      this.$emit('onConfirm', {
        chooseContent: [e],
        popupType: 12
      }, true)
    },
    onSearchValueInput (e) {
      const filtered = (e.detail.value || '').replace(
        /(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|(\ud83e[\udd00-\uddff])|[\u2600-\u26FF]|[\u2700-\u27BF]|[\uFE0F]/gi,
        ''
      )
      this.$nextTick(() => {
        this.$set(this.componentObject[this.popupType], 'searchValue', filtered)
      })
    },
    clear () {
      this.componentObject[this.popupType].searchValue = ''
      this.handleSearch()
    },
    reset () {
      let componentRef = this.componentRef()
      if (!componentRef) uni.showToast({
        title: '请稍后再试',
        icon: 'none'
      })
      else componentRef.reset()
      this.chooseContent = null
    },
  }
}
</script>

<style scoped lang="scss">
.popup-box {
  border-radius: toRpx(32) toRpx(32) 0 0;
  background: #ffffff;
  height: 70vh;
  .popup-title {
    height: toRpx(104);
    justify-content: center;
    position: relative;
    color: #333333;
    font-size: toRpx(36);
    font-weight: 500;
    .popup-close {
      position: absolute;
      height: 100%;
      top: 0;
      right: 0;
      padding: 0 toRpx(48);
      font-weight: 400;
      color: #1a1a1a;
    }
  }
  .popup-search {
    height: toRpx(80);
    border-radius: toRpx(40);
    background: #f5f7fa;
    margin: 0 toRpx(48);
    position: relative;
    .input {
      height: 100%;
      width: 100%;
      text-align: center;
      color: #333;
      font-size: toRpx(32);
    }
    .placeholder {
      height: 100%;
      color: #999ea8;
      font-family: uniicons;
      display: flex;
      align-items: center;
      justify-content: center;
      &::after {
        display: block;
        content: '\e654';
        margin-left: toRpx(8);
        height: 100%;
        display: flex;
        align-items: center;
        font-size: toRpx(36);
      }
    }
    .clear {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      padding: 0 toRpx(48);
    }
  }
  .popup-body {
    height: calc(100% - #{toRpx(392)});
    position: relative;
    .popup-scroll-view {
      height: 100%;
      padding-top: toRpx(32);
      opacity: 0;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: toRpx(64);
      height: toRpx(64);
    }
    .show {
      opacity: 1;
    }
  }
  .hide-search {
    height: calc(100% - #{toRpx(280)});
    .popup-scroll-view {
      padding-top: 0;
    }
  }
  .hide-footer {
    height: calc(100% - #{toRpx(184)});
  }
  .hide-footer-search {
    height: calc(100% - #{toRpx(104)});
    .popup-scroll-view {
      padding-top: 0;
    }
  }
  .popup-footer {
    padding: toRpx(64) 0;
    justify-content: center;
    gap: 0 toRpx(32);
    .popup-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: toRpx(720);
      height: toRpx(80);
      border-radius: toRpx(64);
      background: #f0f1f5;
      color: #333333;
      font-size: toRpx(32);
      font-weight: 500;
    }
    .popup-confirm {
      color: #fff;
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    }
  }
  .nothing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    justify-content: center;
  }
}
.car-popup {
  .popup-box {
    height: 90vh;
  }
}
.right-box {
  width: 46vw;
  height: 100vh;
  border-radius: toRpx(32) 0 0 toRpx(32);
  .popup-footer {
    margin: 0 toRpx(48);
  }
}
</style>
