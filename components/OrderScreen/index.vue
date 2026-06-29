<template>
  <popup
    ref="popup"
    @onConfirm="confirm"
    @onCancel="clear"
    cancelText="清除"
  >
    <view class="popup-title flex">
      {{ popupTitle }}
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
    <view
      class="popup-body"
      :key="viewKey"
    >
      <scroll-view
        scroll-y
        :class="['popup-scroll-view',{'popup-show':loadComplete}]"
      >
        <template v-for="(i, index) in screenList">
          <view
            class="item-box"
            :key="index"
          >
            <view class="title flex">
              {{i.title}}
              <template v-if="i.suffix">
                （{{userInfo[i.suffix]}}）
              </template>
              <template v-if="i.hasToggle">
                <view
                  class="toggle-btn"
                  @click="i.toggle = !i.toggle"
                >{{i.toggle ? '收起' : '展开'}}</view>
              </template>
            </view>
            <view :class="['box',{'fold':i.hasToggle},{'show':i.toggle}]">
              <component
                :ref="`${i.componentName}_${index}`"
                :is="i.componentName"
                :params.sync="i.params"
                @choose="choose"
                :data="chooseContent"
                @onComplete="onComplete"
              />
            </view>
          </view>
        </template>
      </scroll-view>
      <image
        v-if="!loadComplete"
        class="loading"
        src="../../assets/images/common/loadding.gif"
      />
    </view>

  </popup>
</template>

<script type='text/ecmascript-6'>
import Popup from '@/components/Popup.vue'
import config from './config'
import EmployeeList from './components/EmployeeList.vue'
import TimeList from './components/TimeList.vue'
import OrderStatusList from './components/OrderStatusList.vue'
import PayList from './components/PayList.vue'
import CourseOptionList from './components/CourseOptionList.vue'
import ErrorOrderList from './components/ErrorOrderList.vue'
import SceneList from './components/SceneList.vue'
export default {
  components: {
    Popup,
    EmployeeList,
    TimeList,
    OrderStatusList,
    PayList,
    CourseOptionList,
    ErrorOrderList,
    SceneList
  },
  name: 'OrderScreen',
  props: {
    configData: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: '工单筛选'
    }
  },

  data () {
    return {
      screenList: this.configData ? this.configData.screenList : config.screenList,
      chooseContent: {},
      viewKey: Date.now(),
      onCompleteNum: 0
    }
  },
  provide () {
    return {
      userInfo: this.userInfo,

    }
  },
  computed: {
    popupTitle() {
      return this.title
    },
    userInfo () {
      return uni.$storage.get("userInfo")
    },
    loadComplete () {
      return this.onCompleteNum == this.screenList.length
    }

  },
  mounted () {
  },
  methods: {
    open (data) {
      this.$refs.popup.open()
    },
    clear () {
      this.chooseContent = {}
      this.viewKey = Date.now()
    },
    close () {
      this.$refs.popup.close()
    },
    choose (i) {
      let { key, value, keys, currentIdKey, currentId } = i,
        { chooseContent } = this
      if (keys) {
        if (currentIdKey) chooseContent[currentIdKey] = currentId || ''
        keys.map(e => {
          if (value[e]) chooseContent[e] = value[e]
          else delete chooseContent[e]
        })
      } else {
        if (value) chooseContent[key] = value
        else delete chooseContent[key]
      }
    },
    confirm () {
      let chooseContent = JSON.parse(JSON.stringify(this.chooseContent))
      delete chooseContent.payTimeId
      delete chooseContent.orderTimeId
      Object.keys(chooseContent).map(e => {
        if (e == 'placeOrderStartDateStr' || e == 'installUpgradeBeginTimeStr') chooseContent[e] = `${chooseContent[e]} 00:00:00`
        if (e == 'placeOrderEndDateStr' || e == 'installUpgradeEndTimeStr') chooseContent[e] = `${chooseContent[e]} 23:59:59`
      })
      this.$emit('onConfirm', chooseContent)
      this.close()
    },
    onComplete () {
      if (this.onCompleteNum == this.screenList.length) return
      this.onCompleteNum += 1
    }
  }
}
</script>

<style scoped lang='scss'>
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
  .popup-tips {
    color: #999ea8;
    font-size: toRpx(28);
    padding-left: toRpx(48);
  }
  .popup-body {
    height: calc(100% - #{toRpx(312)});
    position: relative;
    .popup-scroll-view {
      opacity: 0;
      height: 100%;
      padding-top: toRpx(8);
      .item-box {
        margin-bottom: toRpx(32);
        .title {
          color: #888888;
          font-size: toRpx(28);
          height: toRpx(40);
          background: #f5f7fa;
          padding-left: toRpx(48);
          margin-bottom: toRpx(16);
          line-height: toRpx(40);
          .toggle-btn {
            margin-left: auto;
            padding: 0 toRpx(48);
            color: #4673ff;
            font-size: toRpx(24);
          }
        }
        .box {
          overflow: hidden;
        }
        .fold {
          height: toRpx(72);
        }
        .show {
          height: auto !important;
        }
      }
    }
    .popup-show {
      opacity: 1;
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
}
</style>