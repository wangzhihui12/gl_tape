<template>
  <view class="daily-popup">
    <popup
      :position="position"
      :animation="animation"
      ref="popup"
      @onConfirm="confirm"
      @onCancel="cancel"
      @onReset="reset"
      :hideFooter="componentObject[popupType] && componentObject[popupType].hideFooter"
      :popupStyle="(componentObject[popupType] && componentObject[popupType].popupStyle) || ''"
    >
      <view class="popup-title flex">
        {{ title }}
        <view
          class="popup-close flex"
          @click="close"
        >
          <uni-icons
            type="closeempty"
            size="16"
          ></uni-icons>
        </view>
      </view>
      <template v-if="componentObject[popupType] && !componentObject[popupType].hideSearch">
        <view class="popup-search">
          <input
            class="input"
            type="text"
            :placeholder="(componentObject[popupType] && componentObject[popupType].placeholder) || '请输入'"
            placeholder-class="placeholder"
            v-model="componentObject[popupType].searchValue"
            confirm-type="search"
            @confirm="handleSearch"
          />
          <view
            class="clear flex"
            @click="clear"
          >
            <uni-icons
              type="closeempty"
              size="16"
              v-if="componentObject[popupType] && componentObject[popupType].searchValue"
            ></uni-icons>
          </view>
        </view>
      </template>
      <view
        v-if="componentObject[popupType]"
        :class="['popup-body', { 'hide-footer': componentObject[popupType].hideFooter }, { 'hide-search': componentObject[popupType].hideSearch }, { 'hide-footer-search': componentObject[popupType].hideFooter && componentObject[popupType].hideSearch }]"
      >
        <scroll-view
          scroll-y
          :class="['popup-scroll-view', { show: componentObject[popupType].loadComplete }]"
        >
          <component
            :is="componentObject[popupType].name"
            :params.sync="componentObject[popupType]"
            :data="data"
            :dataKey="dataKey"
            :reqParams="reqParams"
            ref="componentRef"
            @choose="chooseContent = $event"
            @onComplete="componentObject[popupType].loadComplete = true"
            @confirm="confirm"
          ></component>
          <template v-if="componentObject[popupType].noData">
            <view class="nothing flex">暂无数据</view>
          </template>
        </scroll-view>
        <image
          v-if="!componentObject[popupType].loadComplete"
          class="loading"
          :src="require('@/assets/images/common/loadding.gif')"
        />
      </view>
    </popup>

    <uni-calendar
      ref="calendar"
      :insert="false"
      :date="calendarData"
      @confirm="confirmCalendar"
      hideMask
      showBottomBtn
      clearDate
      :startDate="startDate"
      :endDate="endDate"
      :title="title"
    />
  </view>
</template>

<script type="text/ecmascript-6">
import Popup from '@/components/Popup.vue'
import config from './config'
import EmployeeList from './components/EmployeeList.vue'
import CarModelList from './components/CarModelList.vue'
import OrderList from './components/OrderList.vue'
import DateTime from './components/DateTime.vue'
import dayjs from 'dayjs';
import utils from '@/utils/utils'

export default {
  components: {
    Popup,
    EmployeeList,
    CarModelList,
    OrderList,
    DateTime,
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
    externalData: null,
    endDate: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: ''
    },
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
      data: null,
      dataKey: null,
      popupType: 0,
      itemIndex: null,
      calendarData: '',
      popupTitle: '',
      list: [],
      reqParams:{}
    }
  },

  watch: {
    externalData: {
      handler (val) {
        if (val && val.length && this.componentObject[this.popupType]) {
          this.componentObject[this.popupType].cacheData = val
        }
      },
      deep: true,
      immediate: true
    },
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
    open (data, popupType, index, list) {
      this.reqParams = {}
      this.popupTitle = data.label || ''
      this.data = utils.deepClone(data)
      this.dataKey = data.key
      this.popupType = popupType
      this.itemIndex = index
      if (data.reqParams) {
        let reqParamsFun = data.reqParamsFun || [],
          reqParams = utils.deepClone(data.reqParams)
        reqParamsFun.map(e => {
          let fun = eval(`(function(list) { return ${data.reqParams[e]}; })`)
          reqParams[e] = fun(list)
        })
        this.reqParams = reqParams
      }
      /**6 日历弹窗 */
      if (popupType == 6) {
        this.calendarData = data.value || dayjs().format('YYYY-MM-DD')
        this.$refs.calendar.open()
        return
      }
      // 等待当前 tick 的响应式 watcher（如 externalData → cacheData）执行完再初始化
      this.$nextTick(() => {
        this.$refs.popup.open()
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
        let { chooseContent, popupType, componentObject, itemIndex } = this
        if (popupType == 5) {
          chooseContent = this.componentRef().getResult()
        }
        if (chooseContent != null) {
          if (Array.isArray(chooseContent) && !chooseContent.length && componentObject[popupType].nullTips) throw componentObject[popupType].nullTips
          this.$emit('onConfirm', {
            chooseContent,
            popupType,
            itemIndex
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
    confirmCalendar ({ fulldate }) {
      let { popupType, itemIndex } = this
      this.$emit('onConfirm', {
        chooseContent: fulldate,
        popupType,
        itemIndex
      })
    },
  }
}
</script>

<style scoped lang="scss">
.daily-popup {
  position: relative;
  z-index: 1000;
}
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
