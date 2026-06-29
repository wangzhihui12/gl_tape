<template>
  <view class="gl-cell">
    <view
      v-for="(items, boxIdx) in formList"
      :key="boxIdx"
      class="cell-box-block"
    >
      <view
        class="cell-box"
        v-if="items.some(i => !i.hidden)"
        :style="cellBoxStyle"
      >
        <template v-if="titleList.length">
          <view
            class="cell-title flex"
            v-if="titleList[boxIdx] && (titleList[boxIdx].name || titleList[boxIdx].addHtml)"
          >
            <template v-if="titleList[boxIdx].name">
              {{titleList[boxIdx].name}}
            </template>
            <template v-if="titleList[boxIdx].addHtml">
              <slot :name="titleList[boxIdx].addHtml" />
            </template>
            <template v-if="collapseControl">
              <view
                :class="['collapse-control',{down:!titleList[boxIdx].collapseAll}]"
                @click="collapseAll(boxIdx)"
              >
                <view class="sprite-icon icon-collapse-all"></view>
              </view>
            </template>
          </view>
        </template>
        <template v-for="(item, idx) in items">
          <view :key="idx">
            <view
              :class="['cell-row',{'cell-hide':collapseControl && !titleList[boxIdx].collapseAll}]"
              :key="idx"
              v-if="!item.hidden"
            >
              <view
                class="cell"
                @click="onCellClick(item)"
                :class="[item.noBorder ? '' : 'border', item.onlyLabel ? 'small-height' : '', item.class]"
              >
                <view :class="['cell-label', { 'only-label': item.onlyLabel }]">
                  <view
                    v-if="item.labellIcon"
                    :class="['sprite-icon', `icon-${item.labellIcon}`]"
                  ></view>
                  {{ item.label }}
                  <view
                    v-if="item.required"
                    class="required"
                  >*</view>
                  <template v-if="item.labelTips">
                    <view
                      class="label-tips"
                      @click.stop="onLabelTipsClick(item)"
                    >{{ item.labelTips }}</view>
                  </template>
                </view>
                <view class="cell-value">
                  <!-- 输入框 -->
                  <template v-if="item.type === 'input'">
                    <view class="input-box">
                      <input
                        class="input-value"
                        v-model="formData[item.value]"
                        :type="item.inputType || 'text'"
                        @blur="handleBlur($event, item)"
                        :placeholder="item.placeholder || '请输入'"
                        :maxlength="item.maxlength ? item.maxlength : -1"
                        placeholder-class="input-placeholder"
                        @input="item.inputType === 'number' && item.maxlength ? (formData[item.value] = String($event.target.value).slice(0, item.maxlength)) : null"
                        :disabled="item.readonly || item.disabled || false"
                      />
                      <view
                        v-if="item.valueIcon"
                        :class="['sprite-icon', `icon-${item.valueIcon}`]"
                        @click="onValueClick(item)"
                      ></view>
                    </view>
                  </template>
                  <!-- 下拉选择 -->
                  <template v-else-if="item.type === 'select'">
                    <view class="value">
                      <template v-if="!item.addHtml && formData[item.value] && formData[item.value]">
                        <template v-if="item.showText && userInfo && userInfo[item.showText]">
                          {{ userInfo[item.showText] }}
                          <text>｜</text>
                        </template>
                        {{ formData[item.value] }}
                      </template>
                      <template v-else>
                        <span class="placeholder">请选择</span>
                      </template>
                      <view class="sprite-icon icon-icon-select"></view>
                    </view>
                  </template>
                  <!-- 单选框 -->
                  <template v-else-if="item.type === 'radio'">
                    <radio-group
                      class="radio-group value"
                      @change="onRadioChange($event, item)"
                    >
                      <label
                        class="uni-list-cell uni-list-cell-pd"
                        v-for="radio in item.radioList"
                        :key="radio.value + item.value"
                      >
                        <radio
                          style="transform: scale(0.65) translateY(-3px)"
                          :value="radio.value"
                          :disabled="item.disabled || radio.disabled"
                          :checked="radio.value == item.current"
                        />
                        <view class="radio-name">{{ radio.name }}</view>
                      </label>
                    </radio-group>
                  </template>
                  <!-- 多行文本 -->
                  <template v-else-if="item.type === 'textarea'">
                    <textarea
                      class="textarea"
                      v-model="formData[item.value]"
                      :placeholder="item.placeholder || '请输入'"
                      placeholder-class="textarea-placeholder"
                      confirm-type="done"
                      auto-height
                      :maxlength="item.maxlength"
                    ></textarea>
                  </template>
                  <template v-else-if="item.type === 'single-calendar'">
                    <view
                      class="value"
                      @click="openCalendar(boxIdx,idx)"
                    >
                      <template v-if="!item.addHtml  && formData[item.value]">
                        {{ formData[item.value] }}
                      </template>
                      <template v-else>
                        <span class="placeholder">请选择</span>
                      </template>
                      <view class="sprite-icon icon-icon-select"></view>
                    </view>
                    <uni-calendar
                      :ref="`calendar-${boxIdx}-${idx}`"
                      :insert="false"
                      :clearDate="false"
                      :startDate="item.startDate || ''"
                      :endDate="item.endDate || ''"
                      :date="formData[item.value] || item.endDate"
                      showBottomBtn
                      @confirm="confirmCalendar($event,item.value )"
                    />
                  </template>
                  <template v-else-if="item.type === 'range-calendar'">
                    <view
                      class="value"
                      @click="openCalendar(boxIdx,idx)"
                    >
                      <template v-if="!item.addHtml  && formData[item.value]">
                        {{ formData[item.value] }}
                      </template>
                      <template v-else>
                        <span class="placeholder">请选择</span>
                      </template>
                      <view class="sprite-icon icon-icon-select"></view>
                    </view>
                    <uni-calendar
                      :ref="`calendar-${boxIdx}-${idx}`"
                      range
                      :insert="false"
                      :clearDate="false"
                      :startDate="item.startDate || ''"
                      :endDate="item.endDate || ''"
                      :rangeValue="formData[item.value]"
                      showBottomBtn
                      @confirm="confirmCalendar($event,item.value)"
                    />
                  </template>
                  <slot
                    v-else-if="item.cellHtml"
                    :name="item.cellHtml"
                  ></slot>

                  <template v-if="item.suffix">
                    <view class="suffix">{{item.suffix}}</view>
                  </template>
                </view>
              </view>
              <slot
                v-if="item.addHtml"
                :name="item.addHtml"
              ></slot>
            </view>
            <view
              v-if="item.rowHtml"
              :class="['row-html',{'cell-hide':collapseControl && !titleList[boxIdx].collapseAll}]"
            >
              <slot :name="item.rowHtml"></slot>
            </view>
          </view>
        </template>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  name: 'GlCell',
  props: {
    /**
     * noBorder：默认false：有下边框，true：无下边框
     * onlyLabel：判断是否只有label，默认false，主要是为了做样式区分
     * class：cell-break：不一行显示，主要用于文本域
     * required：是否为必填项，添加星号
     * value： 绑定的字段名称
     * key：如果绑定的字段名称为对象，则需要传入需要显示在页面上的属性名
     * type： 表单的类型 有：input、select、radio、textarea
     * placeholder： 占位符，input、textarea默认为[请输入]，select默认为[请选择]，
     * radioList： type为radio时传入
     * current： type为radio时传入，设置radio的默认值
     */
    formList: {
      type: Array,
      default: () => []
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    titleList: {
      type: Array,
      default: () => []
    },
    collapseControl: Boolean,
    cellBoxStyle: String,
    index: Number
  },
  data () {
    return {
      userInfo: {}
    }
  },
  mounted () {
    this.userInfo = uni.$storage.get('userInfo') || {}
  },
  methods: {
    onCellClick (item) {
      if (item.type === 'select') {
        this.$emit('handleCell', item, this.index)
      }
    },
    onRadioChange (e, item) {
      this.$emit('radioChange', e, item)
    },
    onValueClick (item) {
      this.$emit('handleValue', item)
    },
    handleBlur (e, item) {
      this.$emit('inputBlur', e, item, this.index)
    },
    collapseAll (index) {
      this.$emit('collapseAll', index)
    },
    confirmCalendar (e, key) {
      this.$emit('confirmCalendar', e, key, this.index)
    },
    openCalendar (index, ind) {
      let [calendar] = this.$refs[`calendar-${index}-${ind}`]
      if (calendar) calendar.open()
    },
    onLabelTipsClick (item) {
      this.$emit('handleLabelTips', item)
    }
  }
}
</script>

<style scoped lang="scss">
.gl-cell {
  .cell-box-block {
    &:first-child {
      .cell-box {
        margin-top: 0;
      }
    }
  }
}
.cell-box {
  background-color: #fff;
  border-radius: toRpx(16);
  overflow: hidden;
  margin-top: toRpx(18);
}
.cell-title {
  min-height: 72rpx;
  padding: 0 32rpx;
  color: #777;
  font-size: 24rpx;
  .collapse-control {
    margin-left: auto;
    width: 48rpx;
    height: 48rpx;
    transition: all 0.15s;
    .sprite-icon {
      zoom: 2;
    }
  }
  .down {
    transform: rotate(180deg);
  }
}
.cell-row {
  padding-left: toRpx(32);
  transition: all 0.15s;
}
.cell-hide {
  height: 0;
}
.cell {
  display: flex;
  align-items: center;
  padding-right: toRpx(32);
  height: toRpx(96);

  &.small-height {
    height: toRpx(72);
  }

  &.cell-break {
    flex-direction: column;
    align-items: normal;
    height: auto;
  }

  &.border {
    border-bottom: toRpx(2) solid #f7f7f6;
  }
}

.cell-label {
  color: #333;
  font-size: toRpx(28);
  display: flex;
  align-items: center;
  .label-tips {
    margin-left: 8rpx;
    color: #4673ff;
    font-size: 24rpx;
    font-weight: 400;
  }
  .sprite-icon {
    margin-right: toRpx(8);
  }

  .required {
    display: inline-block;
    margin-left: toRpx(8);
    color: #f24724;
  }

  &.only-label {
    font-size: toRpx(24);
    color: #777;
  }
}

.cell-break .cell-label {
  height: toRpx(96);
  line-height: toRpx(96);
}

.cell-break .cell-value {
  width: 100%;
  margin-left: 0;
}

.cell-value {
  position: relative;
  flex: 1;
  height: 100%;
  margin-left: toRpx(20);
  overflow: hidden;
  font-size: toRpx(28);
  display: flex;
  align-items: center;
  .suffix {
    flex-shrink: 0;
    margin-left: 16rpx;
  }
  uni-input {
    font-size: toRpx(28);
  }

  .uni-input-placeholder {
    color: #999;
  }

  .value {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    width: 100%;
    word-break: break-all;
    .sprite-icon {
      margin-bottom: toRpx(2);
    }
  }

  .input-box {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    width: 100%;

    .sprite-icon {
      margin-left: toRpx(8);
    }
    .input-placeholder {
      color: #999ea8 !important;
      font-size: toRpx(28) !important;
    }
  }

  .input-value {
    height: 100%;
    text-align: right;
    width: 100%;
    border: none;
    padding: 0;
    background-color: transparent;
  }
  .input-bottom {
    min-height: toRpx(100);
    line-height: toRpx(56);
    font-size: toRpx(38);
    padding: toRpx(32);
  }

  .placeholder {
    color: #999;
    font-size: toRpx(28);
    line-height: toRpx(32);
  }

  .uni-list-cell {
    margin-left: toRpx(48);
    font-size: toRpx(24);
  }

  .radio-name {
    display: inline-block;
  }

  .textarea {
    width: 100%;
    border-radius: toRpx(16);
    border: toRpx(2) solid #eff0f2;
    background: #f4f5f7;
    padding: toRpx(24);
    margin-bottom: toRpx(32);
  }

  .textarea-placeholder {
    line-height: normal;
    font-size: toRpx(28);
  }
}
</style>
