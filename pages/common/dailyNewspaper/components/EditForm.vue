<template>
  <view class="form-popup">
    <uni-popup ref="popup" type="right" :is-mask-click="false" animation>
      <view class="box">
        <view class="popup-title flex">
          第{{ c_index + 1 }}行
          <view class="popup-close flex" @click="close">
            <uni-icons type="closeempty" size="16"></uni-icons>
          </view>
        </view>
        <view class="popup-content">
          <view class="form-box">
            <template v-for="(item, ind) in data">
              <FormItem class="form-item" :key="ind" :formItem="item" :rules="rules(item)" v-if="itemShow(item)"
                @onSelect="onSelect($event, ind)" @onInput="onInput($event, ind)"
                @openSelect="openSelect(...arguments, ind)" @onScanSuccess="onScanSuccess($event, ind)" />
            </template>
          </view>
        </view>
        <view class="popup-footer flex">
          <view class="del flex" @click="del">
            <view class="sprite-icon icon-blue-delete"></view>
          </view>
          <view class="popup-btn popup-cancel" @click="close">{{ cancelText }}</view>
          <view class="popup-btn popup-confirm" @click="confirm">{{ confirmText }}</view>
        </view>
      </view>
    </uni-popup>

    <DailyPopup ref="dailyPopup" @onConfirm="onPopupConfirm" :startDate="startDate" :endDate="endDate" />
  </view>
</template>

<script type='text/ecmascript-6'>
import Popup from '@/components/Popup.vue'
import FormItem from './FormItem.vue'
import utils from '@/utils/utils'
import DailyPopup from './DailyPopup/index.vue'
import dayjs from 'dayjs'
export default {
  components: { Popup, FormItem, DailyPopup },
  name: 'EditForm',
  props: {
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    }
  },
  data() {
    return {
      carBrandData: [],
      data: {},
      c_index: 0,
      index: 0,
      parent: {},
      currentItem: {}
    }
  },
  computed: {
    startDate() {
      let childrenRules = this.parent.childrenRules,
        item = this.currentItem
      if (childrenRules && item.key) {
        let rules = childrenRules[item.key]
        return rules?.minDate ? dayjs(eval(rules.minDate)).format('YYYY-MM-DD') : '2020-01-01'
      }
    },
    endDate() {
      let childrenRules = this.parent.childrenRules,
        item = this.currentItem
      if (childrenRules && item.key) {
        let rules = childrenRules[item.key]
        return rules?.maxDate ? dayjs(eval(rules.maxDate)).format('YYYY-MM-DD') : '2099-12-31'
      }
    },
  },
  mounted() {
  },
  methods: {
    rules(item) {
      let rules = this.parent.childrenRules
      if (rules) {
        return rules[item.key] || null
      } else return null
    },
    /**
     * 
     * @param data 表单数据
     * @param c_index 子菜单index
     * @param index 父级index
     * @param parent 父级数据
     */
    open(data, c_index, index, parent) {
      this.data = utils.deepClone(data) || {}
      this.c_index = c_index || 0
      this.index = index || 0
      this.parent = utils.deepClone(parent) || {}
      this.$refs.popup.open()
    },
    del() {
      this.$emit('onDel', this.c_index, this.index)
      this.close()
    },
    cancel() {
      this.$emit('onCancel')
    },
    close() {
      this.data = {}
      this.c_index = 0
      this.index = 0
      this.parent = {}
      this.$refs.popup.close()
    },
    confirm() {
      this.$emit('onConfirm', utils.deepClone(this.data), this.c_index, this.index)
      this.close()
    },
    itemShow(item) {
      let { parent } = this,
        childrenShowRules = parent.childrenShowRules || null
      if (childrenShowRules) {
        if (Object.keys(childrenShowRules).includes(item.key)) {
          let { keys, result } = childrenShowRules[item.key],
            { data } = this,
            params = keys.map((i, index) => `val${index + 1}`),
            // 将 new Function 改为 eval 方式
            func = eval(`(function(${params.join(',')}) { return ${result}; })`),
            value = []
          keys.map(key => {
            let item = data.find(i => i.key == key)
            if (item) value.push(item.value || null)
          })
          let show = func(...value)
          item.show = show
          if (!item.show && item.value) item.value = null
          return show
        } else {
          item.show = true
          return true
        }
      } else {
        item.show = true
        return true
      }
    },
    onInput(val, index) {
      this.$set(this.data[index], 'value', val)
    },
    onSelect(val, index) {
      this.$set(this.data[index], 'value', val)
    },
    openSelect(item, type, index) {
      let list = this.data || []
      this.currentItem = item
      this.$refs.dailyPopup.open(item, type, index, list)
    },
    onScanSuccess(val, index) {
      this.$set(this.data[index], 'value', val)
    },
    onPopupConfirm({
      chooseContent,
      popupType,
      itemIndex
    }) {
      /** 根据 popupType 处理数据 
       * 5: 日期时间选择
       * 6: 日历
      */
      if (popupType == 6 || popupType == 5) {
        this.$set(this.data[itemIndex], 'value', chooseContent)
      } else if (popupType == 3) {
        const { vehicleBrandName, vehicleSubBrandName, vehicleSeriesName, vehicleShapeName } = chooseContent
        this.$set(this.data[itemIndex], 'value', `${vehicleBrandName}-${vehicleSubBrandName}-${vehicleSeriesName}-${vehicleShapeName}`)
        this.$set(this.data[itemIndex], this.data[itemIndex].key, chooseContent)
      } else if (popupType == 4) {

        this.$set(this.data[itemIndex], 'value', chooseContent.orderCode)
        let completeFun = this.data[itemIndex].completeFun
        if (completeFun) {
          let { keys, resultKeys } = completeFun
          keys.map((key, index) => {
            let ind = this.data.findIndex(i => i.key == key),
              val = chooseContent[resultKeys[index]]
            this.$set(this.data[ind], 'value', val != null ? val : '-')
          })
        }

      } else {
        this.$set(this.data[itemIndex], 'value', chooseContent.staffName)
        this.$set(this.data[itemIndex], this.data[itemIndex].key, chooseContent.uuid)
      }
      let clearkeys = this.data[itemIndex].clearkeys
      if (clearkeys) {
        clearkeys.map(key => {
          let ind = this.data.findIndex(i => i.key == key)
          this.$set(this.data[ind], 'value', null)
        })
      }

    }

  }
}
</script>

<style scoped lang='scss'>
.box {
  width: 46vw;
  height: 100vh;
  border-radius: 32rpx 0 0 32rpx;
  background-color: #fff;

  .popup-title {
    height: 112rpx;
    position: relative;
    justify-content: center;
    color: #333333;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 48rpx;

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

  .popup-content {
    height: calc(100vh - 272rpx);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 16rpx 0;

    .form-box {
      margin: 0 48rpx;
      padding: 32rpx;
      border-radius: 24rpx;
      background: #94c2ff33;

      .form-item {
        margin-bottom: 16rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .popup-footer {
    padding: 16rpx 0 64rpx 0;
    justify-content: center;
    gap: 0 32rpx;
    margin: 0 48rpx;

    .del {
      border-radius: 64rpx;
      background: #2c66f71a;
      padding: 20rpx 32rpx;
    }

    .popup-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 412rpx;
      height: 80rpx;
      border-radius: 64rpx;
      background: #f0f1f5;
      color: #333333;
      font-size: 32rpx;
      font-weight: 500;
    }

    .popup-confirm {
      color: #fff;
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    }
  }
}
</style>