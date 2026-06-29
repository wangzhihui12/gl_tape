<template>
  <RightPopup ref="rightPopup" :title="title[popType]" :showFooter="true" @confirm="confirm" :confirmDisabled="confirmDisabled">
    <view class="popup-content">
      <view class="appeal-desc">
        <view class="sprite-icon icon-icon-appeal"></view>规定申诉时间为<view class="blod-text">每月{{appealStartTime}}号-每月{{appealEndTime}}号</view>
        ，支持提交修订异议处理，总部流转审批，请在规定时间内完成，逾期不再受理。
      </view>

      <view class="form-item flex-item line" v-if="formItem[popType]">
        <view class="label">{{formItem[popType][0].label}}</view>
        <view class="value"><text class="blue-text">{{ count }}</text> {{formItem[popType][0].unit}}</view>
      </view>

      <view class="form-item" v-if="formItem[popType]">
        <view class="label m-b">{{formItem[popType][1].label}}</view>
        <view class="input-box">
          <input type="number" v-model="formData.modifyCount" :maxlength="formItem[popType][1].maxlength" placeholder="请输入" placeholder-class="placeholder" @input="onInput" />
          <text class="suffix">{{formItem[popType][1].unit}}</text>
        </view>
      </view>

      <view class="form-item">
        <view class="label m-b">上传截图说明</view>
        <view class="upload-container">
          <view class="upload-btn" v-if="formData.images.length < 9" @click="chooseImage">
            <uni-icons type="plusempty" size="30" color="#347BFF"></uni-icons>
            <text class="count">{{ formData.images.length }}/9</text>
          </view>
          <view class="image-item" v-for="(item, index) in formData.images" :key="index">
            <image :src="item.fileUrl" mode="aspectFill" @click="previewImage(index)"></image>
            <view class="delete-btn" @click.stop="deleteImage(index)">
              <uni-icons type="closeempty" size="12" color="#fff"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="label m-b">备注说明</view>
        <view class="textarea-box">
          <textarea v-model="formData.remark" placeholder="请输入（500字以内）" placeholder-class="placeholder"
            maxlength="500"></textarea>
        </view>
      </view>

      <view class="form-item">
        <view class="label m-b">其他异常问题留言</view>
        <view class="textarea-box">
          <textarea v-model="formData.otherAbnormalMessage" placeholder="请输入（500字以内）" placeholder-class="placeholder"
            maxlength="500"></textarea>
        </view>
      </view>
    </view>
  </RightPopup>
</template>

<script>
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    // 每次触发输入，清除之前的计时器
    if (timer) clearTimeout(timer);
    // 重置计时器，延迟执行目标函数
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}
import dayjs from 'dayjs'
import { uploadFile } from '@/utils/ossUpload.js'
import RightPopup from '../../components/RightPopup.vue'
import { title, formItem } from './contant.js'
import permision from '@/js_sdk/wa-permission/permission.js'
const MAX_IMAGE_SIZE = 9 * 1024 * 1024, // 图片最大10MB
  MAX_IMG_COUNT = 9 // 最大图片数量
export default {
  name: 'AttendanceRecord',
  components: {
    RightPopup
  },
  props: {
    month: {
      type: String,
      default: ''
    },
    currentCount: {
      type: [Number, String],
      default: 0
    },
    popType: {
      type: String,
      default: 'attendance'
    },
    lastRecord: {
      type: Object,
      default: () => {}
    },
    appealStartTime: {
      type: String,
      default: ''
    },
    appealEndTime: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      title,
      formItem,
      formData: {
        modifyCount: '',
        images: [],
        remark: '',
        otherAbnormalMessage: ''
      },
      confirmDisabled: true,
      count: ''
    }
  },
  watch: {
    formData: {
      handler(val) {
        const hasData = val.modifyCount || val.images.length > 0 || val.remark || val.otherAbnormalMessage
        this.confirmDisabled = !hasData
      },
      deep: true
    },
    lastRecord: {
      handler(val) {
        console.log(val)
        if (!val) return
        
        const { appealType, actualAttendanceDays, applyActualAttendanceDays, padRecordNum, applyPadRecordNum, remark, otherAbnormalMessage, attachmentList, shopCount } = val
        const typeMap = {
          1: { count: actualAttendanceDays, modify: applyActualAttendanceDays },
          2: { count: padRecordNum, modify: applyPadRecordNum }
        }
        const currentType = typeMap[appealType]
        if (currentType) {
          // this.count = currentType.count
          if (currentType.modify) this.formData.modifyCount = currentType.modify
        }
        if (remark) this.formData.remark = remark
        if (otherAbnormalMessage) this.formData.otherAbnormalMessage = otherAbnormalMessage
        if (attachmentList) this.formData.images = attachmentList
        if (shopCount) this.formData.shopCount = shopCount
        console.log(this.formData, '==')
      },
      deep: true
    },
    currentCount: {
      handler(val) {
        this.count = val
      },
      deep: true
    }
  },
  methods: {
    onInput: debounce(function(e) {
      let value = e.detail.value
      if (this.popType === 'record') {
        // Integer only
        value = value.replace(/[^\d]/g, '')
      } else if (this.popType === 'attendance') {
        // Decimal with 2 places
        value = value.replace(/[^\d.]/g, '') // Remove non-digits/dots
          .replace(/^\./g, '') // No starting dot
          .replace(/\.{2,}/g, '.') // No multiple dots
          .replace('.', '$#$').replace(/\./g, '').replace('$#$', '.') // Only one dot
          .replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // Max 2 decimal places
        this.checkLastNaturalDay(value)
        
      }
      this.$nextTick(() => {
        this.formData.modifyCount = value
      })
    }),
    // 与上个自然日校验
    checkLastNaturalDay(value) {
      const prevMonth = dayjs().subtract(1, 'month')
      const daysInMonth = prevMonth.daysInMonth()
      
      if (parseFloat(value) > daysInMonth) {
        uni.showToast({
          title: `申诉天数需在${daysInMonth}天以内`,
          icon: 'none'
        })
        return false
      } else return true
    },
    open() {
      this.$nextTick(() => {
        console.log(this.$refs.rightPopup, '==')
        this.$refs.rightPopup.open()
      })
      // Reset form when opening
      this.formData = {
        modifyCount: '',
        images: [],
        remark: '',
        otherAbnormalMessage: ''
      }
    },
    close() {
      this.$refs.rightPopup.close()
    },
    async chooseImage() {
      const { images } = this.formData,
        _this = this
      try {
        // #ifdef APP-PLUS
        const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
        const camera = await permision.requestAndroidPermission('android.permission.CAMERA')
        const isOnline = await uni.$isNetWork()
        if (photoLibrary != 1) throw '您的设备不支持相册功能或未授权访问，请前往设置中开启相册权限'
        if (camera != 1) throw '您的设备不支持摄像头功能或未授权访问，请前往设置中开启摄像头权限'
        if (!isOnline) throw '当前无网络连接，请连接网络后重试'
        // #endif
        uni.chooseImage({
          count: MAX_IMG_COUNT - images.length,
          async success(res) {
            for (const file of res.tempFiles) {
              if (file.size > MAX_IMAGE_SIZE) {
                return uni.showToast({
                  title: '图片上传最大9MB',
                  icon: 'none'
                })
              }
            }
            uni.showLoading({ title: '上传中...', mask: true })
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              _this.formData.images.push({
                fileUrl: url,
                fileName: res.tempFiles[i].name || `image_${Date.now()}_${i}.png`
              })
            }
            if (_this.formData.images.length >= res.tempFilePaths.length) uni.hideLoading()
          },
          fail(err) {
            console.log(err)
            uni.hideLoading()
            if (err.errMsg.indexOf('cancel') === -1) {
              return uni.showToast({
                title: '图片上传失败',
                icon: 'none'
              })
            }


          },
        })
      } catch (error) {
        console.log(error)
        uni.hideLoading()
        return uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    deleteImage(index) {
      this.formData.images.splice(index, 1)
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.formData.images.map(item => item.fileUrl),
        current: index
      })
    },
    async confirm() {
      const { modifyCount, remark, images, otherAbnormalMessage, shopCount} = this.formData, {count} = this
      // 校验申诉天数是否在上个月自然日天数内
      if (this.popType == 'attendance' && modifyCount && !this.checkLastNaturalDay(modifyCount)) return
      const { sceneType, shopMerchantId } = uni.$storage.get('userInfo')
      const params = {
        appealMonth: this.month,
        sceneType,
        merchantId: shopMerchantId,
      }
      if (remark) params.remark = remark
      if (images.length > 0) params.attachmentList = images
      if (otherAbnormalMessage) params.otherAbnormalMessage = otherAbnormalMessage
      if (this.popType == 'record') {
        params.appealType = 2
        params.padRecordNum = count
        params.shopCount = shopCount
        if (modifyCount) params.applyPadRecordNum = modifyCount
      } else if (this.popType == 'attendance') {
        params.appealType = 1
        params.actualAttendanceDays = count
        if (modifyCount) params.applyActualAttendanceDays = modifyCount
      }
      console.log(params, 'params')
      const res = await uni.$api.commonApi.addWageAppeal(params)
      console.log(res, '=res')
      if (res) uni.showToast({
        title: '申诉成功',
        icon: 'success'
      })
      this.$emit('confirm', {
        month: this.month,
        ...this.formData
      })
      this.close()
    }
  }
}
</script>

<style scoped lang="scss">
.popup-content {
  padding: toRpx(16) toRpx(64);
}

.appeal-desc {
  border-radius: toRpx(8);
  font-size: toRpx(24);
  line-height: 1.5;
  margin-bottom: toRpx(56);
  display: inline-block;
  display: block;

  .blod-text {
    font-weight: 700;
    display: inline;
  }

  .sprite-icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: toRpx(8);
  }
}

.form-item {
  margin-bottom: toRpx(32);

  &.flex-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &.line {
    border-bottom: toRpx(1) solid #EFF0F2;
    padding-bottom: toRpx(32);
  }

  .label {
    font-size: toRpx(28);
    font-weight: 500;
    color: #333;

    &.m-b {
      margin-bottom: toRpx(16);
    }
  }

  .value {
    font-size: toRpx(28);
    color: #333;

    .blue-text {
      color: #2A82E4;
      margin-right: toRpx(8);
    }
  }

  .input-box {
    background: #F5F6F8;
    border-radius: toRpx(16);
    height: toRpx(80);
    display: flex;
    align-items: center;
    padding: 0 toRpx(24);

    input {
      flex: 1;
      font-size: toRpx(28);
      color: #333;
    }

    .suffix {
      font-size: toRpx(28);
      color: #333;
      margin-left: toRpx(16);
    }
  }

  .textarea-box {
    background: #F5F6F8;
    border-radius: toRpx(8);
    padding: toRpx(24);

    textarea {
      width: 100%;
      height: toRpx(192);
      font-size: toRpx(28);
      color: #333;
      line-height: 1.5;
    }
  }
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: toRpx(20);

  .image-item {
    width: toRpx(160);
    height: toRpx(160);
    border-radius: toRpx(16);
    position: relative;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }

    .delete-btn {
      position: absolute;
      top: 0;
      right: 0;
      width: toRpx(40);
      height: toRpx(40);
      background: rgba(0, 0, 0, 0.5);
      // border-bottom-left-radius: 8rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .upload-btn {
    width: toRpx(160);
    height: toRpx(160);
    background: #F5F8FF;
    border-radius: toRpx(8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .count {
      font-size: toRpx(24);
      color: #999;
      margin-top: toRpx(8);
    }
  }
}

.placeholder {
  color: #999;
}
</style>
