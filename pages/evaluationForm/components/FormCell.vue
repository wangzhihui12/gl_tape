<template>
  <view class="form-container formCell">
    <view
      class="form-item flex align-center justify-between"
      :class="{
        'full-width': field.fullWidth,
        'form-item-textarea': field.type === 'textarea',
        'form-item-switchInput': field.type === 'switchInput'
      }"
      v-for="field in formFields"
      :key="field.key"
      @click.stop="handleCell(field)"
    >
      <view class="from-label" v-if="field.type !== 'pdf' && field.type !== 'switchInput'">
        {{ field.label }}
        <text class="requiredLabel" v-if="field.required || isSwitchInputRequired(field)">*</text>
      </view>
      <template v-if="field.type === 'input'">
        <input class="formInput" :class="{ formInputDisabled: field.disabled, autolabel: field.placeholder == '自动计算' }" :min="field.min" :max="field.max" v-if="field.targetObj" :type="field.inputType || 'text'" :disabled="field.disabled" :placeholder="field.placeholder || '请输入'" :maxlength="field.maxlength || 100" v-model="formData[field.targetObj][field.targetKey]" :pattern="field.pattern || ''" @input="e => handleInput(e, field)" @blur="e => handleBlur(e, field)" />
        <input class="formInput" :class="{ formInputDisabled: field.disabled, autolabel: field.placeholder == '自动计算' }" :min="field.min" :max="field.max" v-else :type="field.inputType || 'text'" :disabled="field.disabled" :placeholder="field.placeholder || '请输入'" v-model="formData[field.targetKey]" :maxlength="field.maxlength || 100" :pattern="field.pattern || ''" @input="e => handleInput(e, field)" @blur="e => handleBlur(e, field)" />
        <view v-if="field.isScan" class="flex align-center scanBtn justify-center" @click.stop="scan('vinOcr')">
          <view class="sprite-icon icon-scanIconX"></view>
        </view>
        <view v-if="field.isLocation" class="flex align-center scanBtn justify-center" @click.stop="location">
          <view class="sprite-icon icon-location"></view>
        </view>
        <text v-if="field.isCell" class="ml-12 cellLabel" :class="{ disabled: field.disabled }">{{ field.cell }}</text>
      </template>
      <template v-if="field.type === 'select'">
        <view class="flex align-center from-value">
          <template v-if="field.targetObj ? formData[field.targetObj][field.targetKey] : formData[field.targetKey]">
            <view v-if="!field.isCar && !field.isCity && !field.isCarCity">
              <template v-if="field.showText && userInfo && userInfo[field.showText]">
                {{ userInfo[field.showText] }}
                <text>｜</text>
              </template>
              {{ field.targetObj ? formData[field.targetObj][field.targetNameKey] : formData[field.targetNameKey] }}
            </view>
            <view v-else-if="field.isCar">
              {{ formData.carBaseReqDTO.carSeriesName + ' ' + formData.carBaseReqDTO.carTypeName }}
            </view>
            <view v-else-if="field.isCity">
              {{ formData.carBaseReqDTO.registrationProvinceName + ' ' + formData.carBaseReqDTO.registrationCityName }}
            </view>
            <view v-else-if="field.isCarCity">
              {{ formData.carBaseReqDTO.carProvinceName + ' ' + formData.carBaseReqDTO.carCityName }}
            </view>
          </template>
          <template v-else>
            <span class="placeholder">请选择</span>
          </template>
          <view class="sprite-icon icon-icon-select"></view>
        </view>
      </template>
      <template v-if="field.type === 'calendar'">
        <view class="flex align-center from-value">
          <template v-if="field.targetObj ? formData[field.targetObj][field.targetKey] : formData[field.targetKey]">
            {{ field.targetObj ? formData[field.targetObj][field.targetKey] : formData[field.targetKey] }}
          </template>
          <template v-else>
            <span class="placeholder">请选择</span>
          </template>
          <view class="sprite-icon icon-icon-select"></view>
        </view>
      </template>
      <template v-if="field.type === 'radio'">
        <radio-group class="radio-group flex align-center" @change="e => radioChange(e, field)">
          <label class="uni-list-cell uni-list-cell-pd align-center flex ml-48" v-for="item in field.radioList" :key="item.value">
            <radio style="transform: scale(0.7)" :value="item.value" :checked="getRadioChecked(item.value, field)" />
            <view class="radio-name">{{ item.name }}</view>
          </label>
        </radio-group>
      </template>
      <template v-if="field.type === 'pricek'">
        <picker @change="e => bindPickerChange(e, field)" range-key="name" :value="getPickerValue(field)" :range="field.fieldPickerArray">
          <view class="flex align-center from-value">
            <template v-if="field.targetObj ? formData[field.targetObj][field.targetNameKey] : formData[field.targetKey]">
              {{ field.targetObj ? formData[field.targetObj][field.targetNameKey] : formData[field.targetNameKey] }}
            </template>
            <template v-else>
              <span class="placeholder">请选择</span>
            </template>
            <view class="sprite-icon icon-icon-select"></view>
          </view>
        </picker>
      </template>
      <view v-if="field.type === 'switchInput'" class="switch-input" @click.stop="">
        <view class="switch-input__header flex align-center justify-between">
          <view class="from-label">
            {{ field.label }}
            <text class="requiredLabel" v-if="field.required || isSwitchInputRequired(field)">*</text>
          </view>
          <switch :checked="Number(formData[field.switchKey]) === 1" color="#4673FF" @change="e => handleSwitchChange(e, field)" />
        </view>
        <view v-if="Number(formData[field.switchKey]) === 1" class="switch-input__body">
          <input
            class="switch-input__input"
            type="text"
            :placeholder="field.placeholder || '请输入'"
            v-model="formData[field.remarkKey]"
            :maxlength="field.maxlength || 100"
            @blur="e => handleBlur(e, { ...field, targetKey: field.remarkKey })"
          />
        </view>
      </view>
      <template v-if="field.type === 'textarea'">
        <textarea v-if="field.targetObj" :placeholder="'请输入 (' + (field.maxlength || 100) + '字以内)'" v-model="formData[field.targetObj][field.targetKey]" :maxlength="field.maxlength || 100" />
        <textarea v-else :placeholder="'请输入 (' + (field.maxlength || 100) + '字以内)'" v-model="formData[field.targetKey]" :maxlength="field.maxlength || 100" />
      </template>
      <template v-if="field.type === 'pdf'">
        <view class="flex-1">
          <view class="flex flex-1 align-center justify-between">
            <view class="from-label">
              {{ field.label }}
              <text class="requiredLabel" v-if="field.required">*</text>
            </view>
            <view class="flex align-center from-value">
              <template>
                <span class="placeholder">点击编辑</span>
              </template>
              <view class="sprite-icon icon-icon-select"></view>
            </view>
          </view>
          <view class="pdf-box flex align-center justify-between" v-if="field.isShowPreview">
            <view class="flex align-center">
              <view class="sprite-icon icon-pdf"></view>
              <text>二手车补充协议</text>
            </view>
            <view class="flex align-center">
              <view class="btn" @click.stop="previewPdf(field)">预览</view>
              <view class="btn" @click.stop="deletePdf(field)">删除</view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>
<script>
export default {
  name: 'FormCell',
  props: {
    formFields: {
      type: Array,
      default: () => []
    },
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      userInfo: {},
      current: 0,
      index: 0,
      info: {
        lunar: true,
        range: true,
        insert: false,
        selected: []
      }
    }
  },
  computed: {},
  methods: {
    isSwitchInputRequired(field) {
      return field.type === 'switchInput' && Number(this.formData[field.switchKey]) === 1
    },
    handleSwitchChange(e, field) {
      const switchValue = e.detail.value ? 1 : 0
      this.$set(this.formData, field.switchKey, switchValue)
      if (switchValue === 0 && field.clearRemarkOnSwitchOff !== false) {
        this.$set(this.formData, field.remarkKey, '')
      }
      this.$emit('switchChange', switchValue, field)
    },
    handleCell(field) {
      if (field.type === 'switchInput') {
        return
      }
      this.$emit('handleCell', field)
    },
    radioChange(e, field) {
      const value = e.detail.value
      this.$emit('radioChange', value, field)
    },
    bindPickerChange(e, field) {
      console.log('picker发送选择改变，携带值为', e)
      const index = e.detail.value
      field.index = index
      this.$emit('pickerChange', index, field)
    },
    updateFormData(data) {
      this.$emit('update:formData', data)
    },
    handleInput(e, field) {
      console.log('e', e)
      const value = e.target?._value || e.target?.value

      if (field.key === 'vin' || field.key === 'engineNumber' || field.key === 'idCard') {
        let filteredValue = value.replace(/[^A-Za-z0-9]/g, '')
        console.log('filteredValue', filteredValue)
        console.log('value', value)
        console.log(filteredValue !== value)
        if (filteredValue !== value) {
          if (field.targetObj) {
            this.formData[field.targetObj][field.targetKey] = filteredValue
            // this.$set(this.formData[field.targetObj], field.targetKey, filteredValue)
          } else {
            this.formData[field.targetKey] = filteredValue
            // this.$set(this.formData, field.targetKey, filteredValue)
          }
        } else {
          filteredValue = value
        }
      }
      if (field.key === 'keyCount' || field.key === 'transferCount') {
        // 过滤掉所有非数字字符
        const filteredValue = value.replace(/[^0-9]/g, '')
        // 限制只能输入一位数字
        const singleDigitValue = filteredValue.slice(0, 1)
        if (singleDigitValue !== value) {
          value = singleDigitValue
          if (field.targetObj) {
            this.formData[field.targetObj][field.targetKey] = value
          } else {
            this.formData[field.targetKey] = value
          }
          this.$emit('formDataChange', this.formData)
          return
        }
      }
      if (field.key === 'depositPrice') {
        // 过滤掉所有非数字字符
        const filteredValue = value.replace(/[^\d]/g, '')
        console.log('filteredValue', filteredValue)
        // 确保是正整数（大于0）
        const positiveIntValue = filteredValue && parseInt(filteredValue, 10) >= 1 ? filteredValue : ''
        console.log('positiveIntValue', positiveIntValue)
        if (positiveIntValue !== value) {
          if (field.targetObj) {
            this.formData[field.targetObj][field.targetKey] = positiveIntValue
          } else {
            this.formData[field.targetKey] = positiveIntValue
          }
          this.$emit('formDataChange', this.formData)
          return
        }
      }

      // 如果有正则验证规则，执行验证
      if (field.pattern) {
        const reg = new RegExp(field.pattern)
        if (!reg.test(value) && value !== '') {
          // 验证失败，阻止输入
          if (field.targetObj) {
            // 回滚到原始值
            this.$emit('inputInvalid', field, this.formData[field.targetObj][field.targetKey])
          } else {
            this.$emit('inputInvalid', field, this.formData[field.targetKey])
          }
          return
        }
      }
      // 验证通过，触发输入事件
      this.$emit('inputChange', e, field)
    },
    getRadioChecked(value, field) {
      if (field.targetObj && this.formData[field.targetObj] && this.formData[field.targetObj][field.targetKey] !== undefined) {
        return this.formData[field.targetObj][field.targetKey] === value
      } else if (this.formData[field.targetKey] !== undefined) {
        return this.formData[field.targetKey] === value
      }
      return false
    },
    handleBlur(e, field) {
      console.log('handleBlur', e, field)
      let value = e.target?._value?.trim() || e.target?.value?.trim()
      if (field.key === 'depositPrice') {
        // 过滤掉所有非数字字符
        const filteredValue = value.replace(/[^\d]/g, '')
        console.log('filteredValue', filteredValue)
        // 确保是正整数（大于0）
        const positiveIntValue = filteredValue && parseInt(filteredValue, 10) >= 1 ? filteredValue : ''
        console.log('positiveIntValue', positiveIntValue)
        if (positiveIntValue !== value) {
          if (field.targetObj) {
            this.formData[field.targetObj][field.targetKey] = positiveIntValue
          } else {
            this.formData[field.targetKey] = positiveIntValue
          }

          return
        }
      }
      if (field.targetObj) {
        if (this.formData[field.targetObj]) {
          this.formData[field.targetObj][field.targetKey] = value
          this.$emit('blurChange', value, field)
        }
      } else {
        this.formData[field.targetKey] = value
        this.$emit('blurChange', value, field)
      }
    },
    getPickerValue(field) {
      if (field.index !== undefined) {
        return field.index
      }
      if (field.fieldPickerArray && field.fieldPickerArray.length > 0) {
        const currentValue = field.targetObj ? this.formData[field.targetObj][field.targetKey] : this.formData[field.targetKey]
        if (currentValue) {
          const index = field.fieldPickerArray.findIndex(item => item.value === currentValue || item.name === currentValue)
          return index >= 0 ? index : 0
        }
      }

      return 0
    },
    scan(type) {
      this.$emit('scan', type)
    },
    location() {
      this.$emit('location')
    },
    previewPdf(field) {
      this.$emit('previewPdf', field)
    },
    deletePdf(field) {
      this.$emit('deletePdf', field)
    }
  },
  watch: {
    formData: {
      deep: true,
      handler(newData) {
        this.$emit('formDataChange', newData)
      }
    }
  },
  mounted() {
    // 组件挂载时的初始化逻辑
    this.userInfo = uni.$storage.get('userInfo') || {}
    console.log('userInfo', this.userInfo)
  }
}
</script>
<style scoped lang="scss">
.formCell {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: toRpx(24);
  max-height: 100%;
  overflow-y: auto;
  padding-right: toRpx(8);
  align-items: start;
  .form-item {
    border-radius: toRpx(24);
    background: #ffffff;
    padding: toRpx(28) toRpx(32);
    box-sizing: border-box;
  }

  .form-item.full-width {
    grid-column: 1 / -1;
    height: auto;
    uni-textarea {
      height: toRpx(192);
    }
  }

  .from-label {
    color: #333333;
    font-size: toRpx(28);
    font-weight: 400;
    display: flex;
    align-items: flex-start;
    width: toRpx(240);
  }
  .from-value {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    .sprite-icon {
      margin-bottom: toRpx(2);
    }
  }
  .placeholder {
    color: #999;
    font-size: toRpx(28);
    line-height: toRpx(32);
  }
  .radio-name {
    display: inline-block;
    color: #333333;
    font-size: toRpx(28);
  }
  .formInput {
    border: 0;
    flex: 1;
    height: toRpx(40);
    font-size: toRpx(28);
    color: #333333;
    padding: 0;
    text-align: right;
    outline: none;
  }
  .formInput:disabled {
    color: #999999;
  }
  .formInputDisabled {
    color: #999999;
  }
  .autolabel {
    color: #cccccc;
  }
  .cellLabel {
    color: #333333;
    font-size: toRpx(28);
  }
  .cellLabel.disabled {
    color: #999999;
    font-size: toRpx(28);
    font-weight: 400;
  }
  .form-item-textarea {
    flex-direction: column;
    align-items: start;
    textarea {
      margin-top: toRpx(22);
      border-radius: toRpx(16);
      border: toRpx(2) solid #eff0f2;
      background: #f4f5f7;
      padding: toRpx(24);
      width: 100%;
      color: #333333;
      font-size: toRpx(28);
      line-height: toRpx(44);
      .textarea-placeholder {
        color: #999999;
        font-size: toRpx(28);
        font-weight: 400;
      }
    }
  }

  .requiredLabel {
    color: #f24724;
    font-size: toRpx(28);
    font-weight: 400;
    margin-left: toRpx(8);
  }
  .pdf-box {
    padding: toRpx(20) toRpx(24);
    box-sizing: border-box;
    height: toRpx(80);
    border-radius: toRpx(8);
    background: #f4f5f7;
    margin-top: toRpx(36);
    color: #333333;
    font-size: toRpx(28);
    font-weight: 400;
    .sprite-icon {
      margin-right: toRpx(16);
    }
    .btn {
      color: #4673ff;
      margin-left: toRpx(32);
    }
  }
  .scanBtn {
    margin-left: toRpx(16);
  }
  .switch-input {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: toRpx(16);
  }

  .switch-input__header {
    width: 100%;
  }

  .switch-input__body {
    border-radius: toRpx(16);
    border: toRpx(2) solid #eff0f2;
    background: #f4f5f7;
    padding: toRpx(18) toRpx(24);
    box-sizing: border-box;
  }

  .switch-input__input {
    width: 100%;
    height: toRpx(44);
    font-size: toRpx(28);
    color: #333333;
    padding: 0;
    text-align: left;
    outline: none;
    border: 0;
    background: transparent;
  }

  switch {
    transform: scale(0.85);
  }

  .form-item-switchInput {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: toRpx(16);
  }
}
</style>
