<template>
  <view
    class="equity-goods-box"
    :key="viewKey"
  >
    <template v-if="goodInfoList && goodInfoList.length">
      <template v-for="(item,index) in goodInfoList">
        <view
          class="goods-item"
          :key="index"
        >
          <view class="goods-head">
            <view class="goods-name">{{item.goodName}}</view>
            <view class="goods-pervice">包含{{item.items}}</view>
          </view>
          <view class="goods-list">
            <template v-if="item.printType == 2">
              <!-- itemsCode标识：YB0001-延保-6大件，YB0002-延保-3电，YB0003-延保-油车 -->
              <template v-if="item.itemsCode == 'YB0003'">
                <GlCell
                  :formList="[formatFormList(item, oilProFormList)]"
                  :formData="item"
                  :cellBoxStyle="cellBoxStyle"
                  @inputBlur="inputBlur"
                  @handleCell="handleCell"
                  @confirmCalendar="confirmCalendar"
                  :index="index"
                >
                  <template #warranty>
                    <view class="warranty flex">
                      <input
                        type="number"
                        class="warranty-input"
                        placeholder="请输入"
                        placeholder-class="placeholder"
                        maxlength="140"
                        v-model="item.warrantyPeriod"
                      >
                      <view class="warranty-suffix">年或</view>
                      <input
                        type="digit"
                        class="warranty-input"
                        placeholder="请输入"
                        placeholder-class="placeholder"
                        maxlength="140"
                        v-model="item.warrantyKm"
                      >
                      <view class="warranty-suffix">万公里</view>
                    </view>
                  </template>
                </GlCell>
              </template>
              <template v-if="item.itemsCode == 'YB0001' || item.itemsCode == 'YB0002'">
                <GlCell
                  :formList="[formatFormList(item,energyProFormList)]"
                  :formData="item"
                  :cellBoxStyle="cellBoxStyle"
                  @inputBlur="inputBlur"
                  @handleCell="handleCell"
                  @confirmCalendar="confirmCalendar"
                  :index="index"
                >
                  <template #warranty>
                    <view class="warranty flex">
                      <input
                        type="number"
                        class="warranty-input"
                        placeholder="请输入"
                        placeholder-class="placeholder"
                        maxlength="140"
                        v-model="item.warrantyPeriod"
                      >
                      <view class="warranty-suffix">年或</view>
                      <input
                        type="digit"
                        class="warranty-input"
                        placeholder="请输入"
                        placeholder-class="placeholder"
                        maxlength="140"
                        v-model="item.warrantyKm"
                      >
                      <view class="warranty-suffix">万公里</view>
                    </view>
                  </template>
                </GlCell>
              </template>
              <template v-if="item.itemsCode != 'YB0001' && item.itemsCode != 'YB0002' && item.itemsCode != 'YB0003'">
                <GlCell
                  :formList="[formatFormList(item,extendServiceFormList)]"
                  :formData="item"
                  :cellBoxStyle="cellBoxStyle"
                  @inputBlur="inputBlur"
                  @handleCell="handleCell"
                  @confirmCalendar="confirmCalendar"
                  :index="index"
                >
                  <template #displacementPower>
                    <view class="displacement-power flex">
                      <view class="switch-box flex">
                        <template v-for="(s,sindex) in displacementPowerSwitch">
                          <view
                            :class="['switch-item flex',{'switch-active':item.displacementPowerFlag == s.value}]"
                            :key="sindex"
                            @click="changeDisplacementPower(index, s.value)"
                          >{{s.label}}</view>
                        </template>
                      </view>
                      <view class="warranty flex">
                        <input
                          type="digit"
                          class="warranty-input"
                          placeholder="请输入"
                          placeholder-class="placeholder"
                          maxlength="140"
                          v-model="item.displacementPowerValue"
                        >
                        <view class="warranty-suffix">{{item.displacementPowerFlag == 0 ? 'L' : 'KW'}}</view>
                      </view>
                    </view>
                  </template>
                </GlCell>
              </template>
            </template>
            <template v-else>
              <GlCell
                :formList="[formatFormList(item, equityProFormList)]"
                :formData="item"
                :cellBoxStyle="cellBoxStyle"
                @inputBlur="inputBlur"
                @handleCell="handleCell"
                @confirmCalendar="confirmCalendar"
                :index="index"
              >
              </GlCell>
            </template>
          </view>
        </view>
      </template>
    </template>
    <order-popup
      ref="orderPopup"
      :data="currentData"
      @onConfirm="onConfirm"
      :popupType="popupType"
    />
  </view>
</template>

<script type='text/ecmascript-6'>
import { energyProFormList, equityProFormList, extendServiceFormList, oilProFormList, displacementPowerSwitch } from './contant.js'
import GlCell from '@/components/Form/GlCell.vue'
import dayjs from 'dayjs'
import utils from '@/utils/utils'
import OrderPopup from '@/components/OrderPopup/index.vue'
const popupTypeEnum = {
  24: {
    options: true,
    key: 'vehicleNature',
    targetIdKey: 'vehicleNature',
    targetNameKey: 'vehicleNatureName',
  },
  26: {
    key: 'gearbox',
    value: 'gearbox'
  }
}
export default {
  name: 'EquityGoods',
  props: {
    externalData: null,
  },
  components: {
    GlCell,
    OrderPopup
  },
  watch: {
    externalData: {
      handler (val) {
        if (!this.goodInfoList.length) this.goodInfoList = val.goodInfoList || []
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      endDate: dayjs().format('YYYY-MM-DD'),
      displacementPowerSwitch,
      energyProFormList,
      equityProFormList,
      extendServiceFormList,
      oilProFormList,
      cellBoxStyle: 'background: #f5f7fa;',
      goodInfoList: [],
      viewKey: Date.now(),
      currentData: {},
      popupType: 0,
      popupIndex: 0
    }
  },
  mounted () {
  },
  methods: {
    inputBlur (e, item, index) {
      let { inputLimit, value: keyValue } = item,
        value = this.goodInfoList[index][keyValue]
      if (inputLimit) {
        let { minVal, maxVal } = inputLimit
        if (maxVal) {
          value = value >= maxVal ? maxVal : value
        }
        if (minVal) {
          value = value <= minVal ? minVal : value
        }
        if (inputLimit.type == 'digit') {
          let [number, decimal] = value.toString().split('.')
          if (decimal != undefined) {
            decimal = decimal.substring(0, inputLimit.decimalDigit || 2)
            number += `.${decimal}`
            value = number
          }
        }
      }
      this.updateFormValue(index, keyValue, value)
    },
    confirmCalendar (e, key, index) {
      this.updateFormValue(index, key, e.fulldate)
    },
    formatFormList (formData, formList) {
      let data = utils.deepClone(formList)
      data.map(item => {
        if (!item.hidden && item.isShowObj && formData) {
          const index = item.isShowObj.list?.findIndex(i => i == formData[item.isShowObj.attr])
          if (index == -1) item.hidden = true
        }
      })
      return data
    },
    isShowFn (formData, targetItem) {
      var flag = false
      if (targetItem.isShowObj && formData) {
        const index = targetItem.isShowObj.list.findIndex(i => i == formData[targetItem.isShowObj.attr])
        console.log(index, '---')
        if (index == 0) flag = true
      } else {
        flag = false
      }
      return flag
    },
    updateFormValue (index, key, value) {
      this.goodInfoList[index][key] = value
      this.viewKey = Date.now()

    },
    changeDisplacementPower (index, value) {
      this.goodInfoList[index].displacementPowerFlag = value
      this.viewKey = Date.now()
    },
    onConfirm (val) {
      const { chooseContent, popupType } = val,
        { popupIndex } = this,
        _typeValue = popupTypeEnum[popupType]
      if (_typeValue.options) {
        this.$set(this.goodInfoList[popupIndex], _typeValue.targetIdKey, chooseContent[_typeValue.sourceIdKey || 'optionId'])
        this.$set(this.goodInfoList[popupIndex], _typeValue.targetNameKey, chooseContent[_typeValue.sourceNameKey || 'optionLabel'])
        return
      }
      this.$set(this.goodInfoList[popupIndex], _typeValue.value, chooseContent)
      this.viewKey = Date.now()
    },
    handleCell (val, index) {
      this.currentData = this.goodInfoList[index]
      this.popupIndex = index
      this.popupType = Object.keys(popupTypeEnum).find(key => popupTypeEnum[key].key === val.key) * 1
      this.$refs.orderPopup.open()
    }
  }
}
</script>

<style scoped lang='scss'>
.equity-goods-box {
  padding: 0 toRpx(32);
  .goods-item {
    margin-bottom: toRpx(8);
    .goods-head {
      padding: toRpx(16) 0;
      .goods-name {
        color: #333333;
        font-size: toRpx(28);
        line-height: toRpx(40);
      }
      .goods-pervice {
        color: #999999;
        font-size: toRpx(26);
        line-height: toRpx(36);
      }
    }
    .goods-list {
      background: #f5f7fa;
      border-radius: toRpx(16);
    }
  }
  .displacement-power {
    width: 100%;
    box-sizing: border-box;
    padding: 0 toRpx(32);
    .switch-box {
      width: toRpx(208);
      height: toRpx(52);
      border-radius: toRpx(64);
      background: #ffffff;
      box-sizing: border-box;
      padding: 0 toRpx(4);
      .switch-item {
        width: 50%;
        height: toRpx(44);
        border-radius: toRpx(40);
        color: #333333;
        font-size: toRpx(26);
        justify-content: center;
        transition: all 0.15s;
      }
      .switch-active {
        background: #333333;
        color: #fff;
      }
    }
  }
  .warranty {
    margin-left: auto;
    &-input {
      width: toRpx(84);
      font-size: toRpx(28);
      margin-left: toRpx(16);
    }
    &-suffix {
      margin-left: toRpx(16);
    }
    .placeholder {
      color: #999999;
      font-size: toRpx(28);
      line-height: toRpx(28);
    }
  }
}
</style>