<template>
  <view :class="['item flex', { 'textarea-item': formItem.type == 'textarea' }, { 'readonly': readonly }]">
    <view class="item-label flex">
      {{ item.label }}
      <text class="required" v-if="item.required">*</text>
    </view>
    <view :class="['item-content flex', { 'disabled': disabled }]">
      <template v-if="item.disabled || disabled || readonly">
        <view :class="['select flex']">
          <text class="text-hide">{{ item.value }}</text>
        </view>
      </template>
      <template v-else>
        <template v-if="item.type == 'input'">
          <input :placeholder="item.placeholder || '请输入'" :value="item.value" class="input"
            :maxlength="rules.maxLength || -1" placeholder-class="placeholderStyle" @input="input" /></template>
        <template v-else-if="item.type == 'phoneInput'">
          <input :placeholder="item.placeholder || '请输入'" :value="item.value" class="input" :maxlength="11"
            placeholder-class="placeholderStyle" type="tel" @input="input" />
        </template>
        <template v-else-if="item.type == 'textarea'">
          <textarea :placeholder="textareaPlaceholder" :value="item.value" class="textarea"
            :maxlength="rules.maxLength || -1" placeholder-class="placeholderStyle" @input="input" />
        </template>
        <template v-else-if="item.type == 'select' || item.type == 'multipleSelect'">
          <template v-if="item.optionsKey">
            <view :class="['select flex', { 'placeholderStyle': !item.value }]" @click="select">
              <text class="text-hide">{{ item.value || item.placeholder || '请选择' }}</text>
              <view class="sprite-icon icon-icon-select"></view>
            </view>
          </template>
          <template v-else>
            <picker class="picker" mode="selector" @change="select" :range="item.options" range-key="label">
              <view :class="['select flex', { 'placeholderStyle': !item.value }]" @click="select"><text
                  class="text-hide">{{ item.value || item.placeholder || '请选择' }}</text>
                <view class="sprite-icon icon-icon-select"></view>
              </view>
            </picker>
          </template>

        </template>
        <template v-else-if="['date', 'datetime'].includes(item.type)">
          <view :class="['select flex', { 'placeholderStyle': !item.value }]" @click="select">{{ item.value ||
            item.placeholder || '请选择' }}
            <view class="sprite-icon icon-date-time"></view>
          </view>
        </template>
        <template v-else-if="item.type == 'radio'">
          <radio-group class="radio-group" @change="$emit('onSelect', $event.detail.value)">
            <radio class="radio" v-for="(i, r_index) in item.options" :key="r_index" :value="i.value"
              :checked="i.value == item.value">{{ i.label }}</radio>
          </radio-group>
        </template>
        <template v-else-if="item.type == 'numberInput'">
          <input :placeholder="item.placeholder || '请输入'" v-model="item.value" class="input"
            :maxlength="rules.maxLength || 10" placeholder-class="placeholderStyle"
            :type="rules.integer ? 'number' : 'digit'" @input="numberInput" @blur="numberBlur" :key="numberViewKey" />
        </template>
        <template v-else-if="item.type == 'carBrandSelect'">
          <view :class="['select flex', { 'placeholderStyle': !item.value }]" @click="select"><text class="text-hide">{{
            item.value || item.placeholder || '请选择' }}</text>
            <view class="sprite-icon icon-icon-select"></view>
          </view>
        </template>
      </template>
      <template v-if="item.prefixComponent">
        <view :class="[`sprite-icon icon-${item.prefixComponent}Icon`]" @click="clickPrefix"></view>
      </template>
      <template v-if="item.unit">
        <view class="unit">{{ item.unit }}</view>
      </template>
    </view>

  </view>
</template>

<script type='text/ecmascript-6'>
import dayjs from 'dayjs';
import utils from '@/utils/utils'
import permision from '@/js_sdk/wa-permission/permission.js'

export default {
  name: 'FormItem',
  props: {
    formItem: {
      type: Object,
      default: () => { }
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    formItem: {
      handler(newVal) {
        if (!this.item) this.item = newVal
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    textareaPlaceholder() {
      let { rules } = this
      return rules.maxLength ? `请输入（${rules.maxLength}字以内）` : '请输入'
    },
    popupType() {
      let { item } = this,
        popupType = {
          multipleSelect: 2,
          carBrandSelect: 3,
          datetime: 5,
          date: 6
        }[item.type] || 0
      return popupType
    },
  },
  data() {
    return {
      item: null,
      numberViewKey: Date.now()
    }
  },
  mounted() {
  },
  methods: {

    input(e) {
      this.$emit('onInput', e.detail.value)
    },
    select(e) {
      let { item, popupType } = this
      if (item.optionsKey || ['date', 'datetime', 'carBrandSelect'].includes(item.type)) {
        if (item.optionsKey == 'storeStaffList' && item.type == 'select') popupType = 1
        if (item.optionsKey == 'orderList') popupType = 4

        this.$emit('openSelect', item, popupType)
      } else {
        this.$emit('onSelect', item.options[e.detail.value].value)
      }
    },
    async clickPrefix() {
      let { item } = this
      if (item.prefixComponent == 'scan') {
        try {
          // #ifdef APP-PLUS
          const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
          const camera = await permision.requestAndroidPermission('android.permission.CAMERA')
          const isOnline = await uni.$isNetWork()
          if (photoLibrary != 1) throw '您的设备不支持相册功能或未授权访问，请前往设置中开启相册权限'
          if (camera != 1) throw '您的设备不支持摄像头功能或未授权访问，请前往设置中开启摄像头权限'
          if (!isOnline) throw '当前无网络连接，请连接网络后重试'
          // #endif
          let that = this
          uni.chooseImage({
            count: 1, //默认9
            sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            success: async function (res) {
              console.log(res)
              // 将图片转换为base64
              const tempFilePath = res.tempFilePaths[0]
              try {
                uni.showLoading({
                  title: '正在识别...',
                  mask: true
                })
                const base64 = await that.getBase64FromImagePath(tempFilePath)
                that.orcRecogintion(base64)
              } catch (error) {
                uni.hideLoading()
                console.error('转换base64失败:', error)
                uni.showToast({
                  title: '图片转换失败',
                  icon: 'none'
                })

              }
            }
          })
        } catch (error) {
          uni.hideLoading()
          return uni.showToast({
            title: error,
            icon: 'none'
          })
        }
      }
    },
    getBase64FromImagePath(imagePath) {
      return new Promise((resolve, reject) => {
        // APP 平台使用 plus.io 来读取文件
        plus.io.resolveLocalFileSystemURL(imagePath, (entry) => {
          entry.file((file) => {
            const reader = new plus.io.FileReader()
            reader.onloadend = (e) => {
              const base64 = e.target.result
              let prefix = 'data:image/png;base64,'
              if (imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')) {
                prefix = 'data:image/jpeg;base64,'
              } else if (imagePath.toLowerCase().endsWith('.gif')) {
                prefix = 'data:image/gif;base64,'
              }
              resolve(prefix + base64.split(',')[1]) // 去掉 data URL 前缀，因为我们自己添加
            }
            reader.onerror = (err) => {
              reject(err)
            }
            reader.readAsDataURL(file)
          }, (err) => {
            reject(err)
          })
        }, (err) => {
          reject(err)
        })
      })
    },
    async orcRecogintion(imgBase64) {
      /**
       * type 3 : standNo 车架号
       */
      const res = await uni.$api.commonApi.orcRecognition({ type: 3, imgBase64 })
      uni.hideLoading()
      if (res.vin) this.$emit('onScanSuccess', res.vin)
      else uni.showToast({ title: '识别失败', icon: 'none' })
    },
    numberInput(e) {
      let { rules } = this,
        val = e.detail.value,
        precision = rules.precision || 2,
        min = rules.min || 0,
        max = rules.max || 9999999999
      if (rules.integer) {
        // 只保留数字
        let filtered = (val || '').replace(/\D/g, '');

        // 去除前导零(但保留单独的0)
        if (filtered.length > 1) {
          filtered = filtered.replace(/^0+/, '');
        }

        // 转换为数字进行范围检查
        const numValue = parseInt(filtered, 10);

        // 如果超出最大值，限制为最大值
        if (!isNaN(numValue) && numValue > max) {
          filtered = String(max);
        }
        // 如果超出最小值，限制为最小值
        if (!isNaN(numValue) && numValue < min) {
          filtered = String(min);
        }
        this.$set(this.item, 'value', filtered)
        this.$emit('onInput', filtered)
        this.$nextTick(() => {
          this.$forceUpdate()
        })
      }
      if (rules.decimal) {
        // 只保留数字和小数点
        let filtered = (val || '').replace(/[^\d.]/g, '');

        // 确保只有一个小数点
        const parts = filtered.split('.');
        if (parts.length > 2) {
          filtered = parts[0] + '.' + parts.slice(1).join('');
        }

        // 重新分割,确保处理正确
        const newParts = filtered.split('.');

        // 去除整数部分的前导零(但保留单独的0或小数点前的0)
        if (newParts[0].length > 1) {
          newParts[0] = newParts[0].replace(/^0+/, '');
        }

        // 限制小数位数
        if (newParts.length === 2 && newParts[1].length > precision) {
          newParts[1] = newParts[1].substring(0, precision);
        }

        // 重新组合
        filtered = newParts.join('.');

        // 转换为数字进行范围检查
        const numValue = parseFloat(filtered);
        // 如果超出最大值，限制为最大值
        if (!isNaN(numValue)) {
          if (numValue < min) {
            filtered = String(min);
          } else if (numValue > max) {
            filtered = String(max);
          }
        }
        this.$set(this.item, 'value', filtered)
        this.$emit('onInput', filtered)

      }
    },
    numberBlur() {
      this.numberViewKey = Date.now()
    }
  }
}
</script>

<style scoped lang='scss'>
.item {
  width: 100%;
  height: 96rpx;
  padding: 0 32rpx;
  border-radius: 16rpx;
  background: #fff;

  &-label {
    color: #333333;
    font-size: 28rpx;
    font-weight: 400;
    line-height: 40rpx;
    flex-shrink: 0;
    padding-right: 8rpx;

    .required {
      color: #f24724;
    }
  }

  &-content {
    flex: 1;
    max-width: 70%;
    margin-left: auto;

    .input,
    .radio-group {
      text-align: right;

      .radio {
        margin-left: 28rpx;

        ::v-deep .uni-radio-input {
          width: 28rpx;
          height: 28rpx;

          &:before {
            font-size: 20rpx;
          }
        }
      }
    }

    .sprite-icon,
    .unit {
      flex-shrink: 0;
      margin-left: 8rpx;
    }
  }

  .input,
  .textarea,
  .select,
  .picker,
  .radio-group {
    width: 100%;
    font-size: 28rpx;
    border: none;

    &::placeholder {
      color: #999999;
    }
  }

  .select {
    width: 100%;
    justify-content: flex-end;
  }

  .placeholderStyle {
    color: #999999;
  }
}

.textarea-item {
  height: 312rpx;
  flex-direction: column;
  padding-bottom: 40rpx;
  box-sizing: border-box;

  .item-label,
  .item-content,
  .textarea {
    width: 100%;
  }

  .textarea {
    height: 100%;
  }

  .item-label {
    height: 80rpx;
  }

  .item-content {
    max-width: 100%;
    height: 192rpx;
    border-radius: 16rpx;
    border: 2rpx solid #eff0f2;
    background: #f4f5f7;
    padding: 24rpx;
    box-sizing: border-box;
    .select{
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

.readonly {
  opacity: .5;
}
</style>