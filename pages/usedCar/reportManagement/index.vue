<template>
  <page-component title="报告管理">
    <view class="content">
      <view class="search-box flex">
        <view :class="['form-item form-item-input', { active: focusIndex == 0 }]">
          <view class="form-item-box flex">
            <input :maxlength="20" v-model="searchText" class="input" placeholder="请输入车架号" @focus="focusIndex = 0" @blur="resetFocusIndex" placeholder-class="placeholder" />
            <view class="sprite-icon icon-vinScan" @click.stop="scan('vinOcr')"></view>
          </view>
        </view>
        <view class="btn search" @click="search">查询</view>
        <view class="btn reset" @click="reset">重置</view>
      </view>
      <view class="list-box">
        <type-tab-component :typeList="typeList" :isShowCount="true" :tabIndex="tabIndex" @tabClick="tabBarClick"></type-tab-component>
        <z-paging ref="paging" :fixed="false" paging-class="scroll-view" :class="tabIndex == 0 ? 'no-br' : ''" :loading-full-fixed="false" :auto-show-system-loading="true" :show-scrollbar="false" v-model="list" @query="getCheckReportPageList" :default-page-size="12">
          <template #empty>
            <view class="nothing flex">
              <image class="noDataImg" :src="noData" />
              <view>暂无报告管理</view>
            </view>
          </template>
          <view class="item-list">
            <view v-for="(i, index) in list" :key="index" :class="['item']" @click="toDetail(i)">
              <view class="flex align-center justify-between mb-28">
                <view class="flex align-center">
                  <view class="sprite-icon" :class="i.reportType === 0 ? 'icon-accident' : 'icon-weibao'"></view>
                  <view class="reportTypeName">{{ i.reportType === 0 ? '事故报告' : '维保报告' }}</view>
                </view>

                <view class="reportStatus" :class="['reportStatus' + i.status]">{{ ORDER_STATUS[i.status] }}</view>
              </view>
              <view class="cell flex align-center mb-28">
                <view class="label">车架号</view>
                <view class="value">{{ i.vin }}</view>
              </view>
              <view class="cell flex align-center mb-28">
                <view class="label">报告时间</view>
                <view class="value">{{ formatTime(i.acquireTime) }}</view>
              </view>
            </view>
          </view>
        </z-paging>
      </view>
      <view class="addBtn" @click.stop="openShowPopup">
        <view class="addBtn-icon">
          <view class="sprite-icon icon-addReport"></view>
          <view>新增报告</view>
        </view>
      </view>
    </view>
    <PublishPopup ref="publishPopup" type="center" :isShowFooter="false" :showTitle="false">
      <template #content>
        <view class="popup-content">
          <view class="popup-top-box flex align-center">
            <view class="popup-top-box-title">新增报告</view>
            <view class="popup-top-box-close" @click.stop="closePublishPopup">
              <view class="sprite-icon icon-evaluationClose"></view>
            </view>
          </view>
          <view class="flex popup-content-item">
            <view class="popup-content-left flex-shrink-0">
              <view class="flex align-center grayLabel">
                <view class="sprite-icon icon-accidentIcon"></view>
                报告类型
              </view>
              <view>
                <view class="flex align-start mb-28 tabItem" :class="{ active0: addParams.reportType === 0 }" @click="changeReportType(0)">
                  <view class="sprite-icon icon-accident"></view>
                  <view>
                    <view class="title">事故报告</view>
                    <view class="desc">含出险，理赔记录</view>
                  </view>
                </view>
                <view class="flex align-start tabItem" :class="{ active1: addParams.reportType === 1 }" @click="changeReportType(1)">
                  <view class="sprite-icon icon-weibao"></view>
                  <view>
                    <view class="title">维保报告</view>
                    <view class="desc">含维修、保养记录</view>
                  </view>
                </view>
              </view>
            </view>
            <view class="popup-content-right flex-1">
              <view class="flex align-center grayLabel">
                <view class="sprite-icon icon-carInfo"></view>
                车辆资料
              </view>
              <view class="upload-box box">
                <view class="title">
                  车架号(VIN)
                  <view class="required">*</view>
                </view>
                <view class="flex vinInput justify-between">
                  <input :maxlength="17" :value="addParams.vin" @input="e => (addParams.vin = e.detail.value)" class="input flex-1" placeholder="请输入17位VIN" placeholder-class="placeholder" @blur="vinBlur" />
                  <view class="sprite-icon icon-vinScan" @click.stop="scan('vinOcr', 'addParams')"></view>
                </view>
              </view>
              <view class="upload-box box">
                <view class="title">
                  行驶证照片
                  <view class="required">*</view>
                </view>
                <view class="img-list flex">
                  <template v-if="imgList.length < 1">
                    <view class="img-item upload flex align-center justify-center" @click="chooseImage">
                      <view class="sprite-icon icon-uploadIcon"></view>
                      <view class="sprite-icon icon-takePhotoIcon"></view>
                    </view>
                  </template>
                  <template v-for="(i, index) in imgList">
                    <view class="img-item" :key="index">
                      <image :src="i" class="img" mode="aspectFill" @click="previewMedia(i, 1)" />
                      <view class="del flex">
                        <uni-icons type="closeempty" :size="10" color="#fff" @click="delImage(index)"></uni-icons>
                      </view>
                    </view>
                  </template>
                </view>
              </view>
              <view class="flex align-center justify-between mt-108">
                <checkbox-group @change="checkboxChange">
                  <label class="flex">
                    <checkbox value="cb" :checked="isConfirmChecked" activeBackgroundColor="#4673FF" iconColor="#fff" style="transform: scale(0.6)" />
                    <text class="checkboxLabel">确认信息真实有效</text>
                  </label>
                </checkbox-group>
                <view :class="['btn flex justify-center', { disabled: !canSubmit }]" @click="comfirm">提交申请</view>
              </view>
            </view>
          </view>
        </view>
      </template>
    </PublishPopup>
  </page-component>
</template>

<script>
import TypeTabComponent from '../../evaluationForm/components/TypeTabComponent.vue'
import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
import { ORDER_STATUS, PAYMENT_STATUS } from './contant'
import dayjs from 'dayjs'
import { uploadFile } from '@/utils/ossUpload.js'
import PublishPopup from '@/components/PublishPopup.vue'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
import { validateVin, formatVinInput } from '@/utils/vinVaildate'
import permision from '@/js_sdk/wa-permission/permission.js'
export default {
  mixins: [ZPMixin],
  components: {
    TypeTabComponent,
    PublishPopup
  },

  name: '',
  data() {
    return {
      validateState: true,
      endDate: dayjs().format('YYYY-MM-DD'),
      ORDER_STATUS,
      PAYMENT_STATUS,
      noData: require('@/assets/images/evaluationForm/noData.webp'),
      typeList: [
        { tabName: '全部', count: 0, keyNum: 'count', key: '' },
        { tabName: '事故报告', count: 0, keyNum: 'count', key: '0' },
        { tabName: '维保报告', count: 0, keyNum: 'count', key: '1' }
      ],
      tabIndex: 0,
      list: [],
      searchText: '',
      focusIndex: -1,
      rangeValue: {},
      createdDate: {
        createdStartDate: '',
        createdEndDate: ''
      },
      imgList: [],
      addParams: {
        reportType: 0,
        vin: '',
        licenseUrl: ''
      },
      isConfirmChecked: false
    }
  },
  computed: {
    canSubmit() {
      // 检查车架号、行驶证照片、确认信息复选框是否都已填写
      return this.addParams.vin && this.imgList.length > 0 && this.isConfirmChecked
    },
    createdTime() {
      const { createdStartDate, createdEndDate } = this.createdDate
      let str = ''
      if (createdStartDate && createdEndDate) str = `${dayjs(createdStartDate).format('YYYY-MM-DD')}至${dayjs(createdEndDate).format('YYYY-MM-DD')}`
      return str
    }
  },
  mounted() {
    uni.$track.add({
      eventCode: 'app_delivery_management'
    })
    this.search()
  },
  onShow() {},
  methods: {
    async checkReportNumCount() {
      const { typeList, tabIndex, searchText } = this,
        {
          data: { code, data, msg }
        } = await uni.$api.usedCarApi.checkReportNumCount({
          t: {
            vin: searchText
          }
        })
      this.typeList[0].count = data.allCount || 0
      this.typeList[1].count = data.accidentCount || 0
      this.typeList[2].count = data.maintainCount || 0
    },
    async getCheckReportPageList(currentPage, pageSize) {
      const { typeList, tabIndex, searchText } = this,
        {
          data: { code, data, msg }
        } = await uni.$api.usedCarApi.getCheckReportPageList({
          t: {
            vin: searchText,
            reportType: typeList[tabIndex].key
          },
          currentPage,
          pageSize
        })
      // 处理数据，将 Date 对象转换为字符串，避免 toJSON 错误
      const records = (data.records || []).map(item => {
        // 创建新对象，确保所有 Date 对象都被转换
        const newItem = {}
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const value = item[key]
            // 检查是否是 Date 对象
            if (value instanceof Date || (value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Date]')) {
              // 转换为字符串
              try {
                newItem[key] = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              } catch (error) {
                newItem[key] = String(value)
              }
            } else {
              // 其他值直接复制
              newItem[key] = value
            }
          }
        }
        return newItem
      })
      this.$refs.paging.complete(records)
    },
    tabBarClick(index) {
      if (this.tabIndex == index) return
      this.tabIndex = index
      this.search()
    },
    search() {
      this.checkReportNumCount()
      this.$refs.paging?.reload()
    },
    reset() {
      this.searchText = ''
      this.tabIndex = 0
      this.search()
    },
    resetFocusIndex() {
      this.focusIndex = -1
    },
    async scan(type, key) {
      // #ifdef APP-PLUS
      const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
      const camera = await permision.requestAndroidPermission('android.permission.CAMERA')
      const isOnline = await uni.$isNetWork()
      if (photoLibrary != 1) {
        uni.showToast({ title: '您的设备不支持相册功能或未授权访问，请前往设置中开启相册权限', icon: 'none' })
        return
      }
      if (camera != 1) {
        uni.showToast({ title: '您的设备不支持摄像头功能或未授权访问，请前往设置中开启摄像头权限', icon: 'none' })
        return
      }
      if (!isOnline) {
        uni.showToast({ title: '当前无网络连接，请连接网络后重试', icon: 'none' })
        return
      }
      // #endif
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择'],
        success: res => {
          if (res.tapIndex === 0) {
            // 拍照
            this.takePhoto(type, key)
          } else if (res.tapIndex === 1) {
            // 从相册选择图片
            this.chooseImageFromAlbum(type, key)
          }
        },
        fail: err => {
          console.log('选择操作失败', err)
        }
      })
    },
    vinOcr(imageUrl, targetField) {
      uni.showLoading({
        title: '识别中',
        mask: true
      })
      uni.$api.evaluationApi
        .vinOcr({
          imageUrl
        })
        .then(res => {
          console.log('res:', res)
          if (res.data.code == 0) {
            if (res.data.data.status == 1) {
              // 根据targetField设置不同的字段
              if (targetField === 'addParams') {
                uni.showLoading({
                  title: '校验中',
                  mask: true
                })
                this.addParams.vin = res.data.data.vin
                validateVin(this.addParams.vin)
                  .then(result => {
                    console.log('validateVin', result)
                    let { valid } = result.data
                    this.validateState = valid
                    uni.hideLoading()
                    // 校验成功，所有提示已在公共方法中处理
                    console.log('车架号校验成功:', result)
                  })
                  .catch(err => {
                    uni.hideLoading()
                    console.log('validateVinErr', result)
                  })
              } else {
                this.searchText = res.data.data.vin
              }
              uni.showToast({ title: '车架号识别完成并已自动填写到输入框中', icon: 'none' })
              uni.hideLoading()
            } else {
              uni.showToast({ title: res.data.data.errorMessage, icon: 'none' })
              uni.hideLoading()
            }
          } else {
            uni.hideLoading()
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            })
          }
        })
    },
    // 拍照
    takePhoto(type, key) {
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['camera'],
        success: async res => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePaths[0],
            success: function () {
              console.log('图片保存成功')
            }
          })
          try {
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
            for (const file of res.tempFiles) {
              if (file.size > MAX_IMAGE_SIZE) {
                uni.showToast({ title: '图片上传最大10MB', icon: 'none' })
                return
              }
            }
            // 上传所有选择的图片
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              console.log('上传图片成功', url)
              if (type === 'addParams') {
                this.addParams[key] = url
                // 如果是行驶证照片，同时添加到imgList中显示
                if (key === 'licenseUrl') {
                  this.imgList = [url]
                }
              } else {
                // 如果是vinOcr，传递key参数（targetField）
                if (type === 'vinOcr') {
                  this[type](url, key)
                } else {
                  this[type](url)
                }
              }
            }
          } catch (error) {
            console.log('上传图片失败', error)
            uni.showToast({ title: '上传图片失败', icon: 'none' })
          }
        },
        fail: err => {
          console.log('拍照失败', err)
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '拍照失败', icon: 'none' })
          }
        }
      })
    },

    // 从相册选择图片
    chooseImageFromAlbum(type, key) {
      uni.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: ['album'],
        success: async res => {
          try {
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
            for (const file of res.tempFiles) {
              if (file.size > MAX_IMAGE_SIZE) {
                uni.showToast({ title: '图片上传最大10MB', icon: 'none' })
                return
              }
            }
            // 上传所有选择的图片
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              console.log('上传图片成功', url)
              if (type === 'addParams') {
                this.addParams[key] = url
                // 如果是行驶证照片，同时添加到imgList中显示
                if (key === 'licenseUrl') {
                  this.imgList = [url]
                }
              } else {
                // 如果是vinOcr，传递key参数（targetField）
                if (type === 'vinOcr') {
                  this[type](url, key)
                } else {
                  this[type](url)
                }
              }
            }
          } catch (error) {
            console.log('上传图片失败', error)
            uni.showToast({ title: '上传图片失败', icon: 'none' })
          }
        },
        fail: err => {
          console.log('选择图片失败', err)
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '选择图片失败', icon: 'none' })
          }
        }
      })
    },
    openShowPopup() {
      this.isConfirmChecked = false
      this.imgList = []
      this.addParams = {
        reportType: 0,
        vin: '',
        licenseUrl: ''
      }
      this.$refs.publishPopup.open()
    },
    closePublishPopup() {
      this.$refs.publishPopup.closePopup()
    },
    delImage(index) {
      this.imgList.splice(index, 1)
      // 如果删除的是最后一张图片，清空licenseUrl
      if (this.imgList.length === 0) {
        this.addParams.licenseUrl = ''
      }
    },
    chooseImage() {
      this.scan('addParams', 'licenseUrl')
    },
    checkboxChange(e) {
      this.isConfirmChecked = e.detail.value.includes('cb')
    },
    changeReportType(type) {
      // 切换报告类型时清空车辆资料
      if (this.addParams.reportType !== type) {
        this.addParams.reportType = type
        this.addParams.vin = ''
        this.addParams.licenseUrl = ''
        this.imgList = []
        this.isConfirmChecked = false
      }
    },
    vinBlur(value) {
      console.log(value.detail.value)
      const upperValue = formatVinInput(value.detail.value)
      console.log('upperValue', upperValue)
      // 直接更新值，使用 :value 绑定时会立即反映到视图
      this.addParams.vin = upperValue

      uni.showLoading({
        title: '校验中',
        mask: true
      })
      // VIN车架号动态校验：车架号字段，动态转换为大写
      validateVin(upperValue)
        .then(result => {
          console.log('validateVin', result)
          let { valid } = result.data
          this.validateState = valid
          uni.hideLoading()
          // 校验成功，所有提示已在公共方法中处理
          console.log('车架号校验成功:', result)
        })
        .catch(err => {
          uni.hideLoading()
          console.log('validateVinErr', err)
        })
    },
    comfirm() {
      // 如果按钮是disabled状态，不执行提交
      if (!this.canSubmit) {
        return
      }
      // VIN车架号-动态校验
      const carVin = this.addParams.vin
      console.log('validateState', this.validateState)
      if (carVin) {
        // 前置判断
        if (carVin.length !== 17) {
          uni.showToast({ title: '请输入 17 位有效字符（支持大写 A-H/J-N/P-Z、0-9）', icon: 'none' })
          return false
        }
        // 根据接口校验结果判断
        if (carVin.length === 17 && !this.validateState) {
          uni.showToast({ title: '车架号校验不匹配，请核对后重新输入', icon: 'none' })
          return false
        }
      }
      uni.showLoading({
        title: '提交中',
        mask: true
      })
      uni.$api.usedCarApi
        .checkReportCreate({
          ...this.addParams
        })
        .then(res => {
          console.log('res', res)
          uni.hideLoading()
          if (res.data.code == 0) {
            uni.showToast({ title: '提交成功', icon: 'none' })
            setTimeout(() => {
              this.closePublishPopup()
              this.search()
            }, 500)
          } else {
            uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
          }
        })
        .catch(err => {
          uni.hideLoading()
          uni.showToast({ title: err.message || '请求失败', icon: 'none' })
        })
    },
    toDetail(i) {
      if (i.status === 1) {
        const reportUrl = i.reportUrl
        const reportImageUrl = encodeURIComponent(i.reportImageUrl || '')
        const url = `/pages/evaluationForm/components/pdfPreView?fileUrl=${reportUrl}&fileUrltype=html&Signature=false&showSaveBtn=1&reportImageUrl=${reportImageUrl}`
        uni.navigateTo({
          url: `${url}`
        })
      }
    },
    formatTime(time) {
      if (!time && time !== 0) return '-'
      try {
        // 检查是否是 Date 对象（包括序列化后的情况）
        const isDate = time instanceof Date || Object.prototype.toString.call(time) === '[object Date]' || (typeof time === 'object' && time !== null && typeof time.getTime === 'function')

        if (isDate) {
          return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
        }

        // 如果是字符串或数字，尝试解析后格式化
        if (typeof time === 'string' || typeof time === 'number') {
          const parsed = dayjs(time)
          if (parsed.isValid()) {
            return parsed.format('YYYY-MM-DD HH:mm:ss')
          }
        }

        // 如果无法解析，返回字符串形式
        return String(time || '-')
      } catch (error) {
        console.error('格式化时间失败:', error, time)
        // 如果格式化失败，返回字符串形式或 '-'
        return typeof time === 'string' ? time : '-'
      }
    },
    previewMedia(current) {
      const { imgList } = this
      // uni.previewImage({
      //   current,
      //   urls: imgList
      // })
      const url = `/pages/boutique/preview?tabName=预览&sourceType=1&detailUrl=${imgList[0]}`
      uni.navigateTo({
        url: `${url}`
      })
    }
  }
}
</script>

<style scoped lang="scss">
.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: toRpx(144) toRpx(64) toRpx(48);
  box-sizing: border-box;

  .search-box {
    margin: toRpx(8) 0 toRpx(32);
    height: toRpx(72);
    gap: toRpx(12);

    .form-item {
      width: toRpx(424);
      height: 100%;
      position: relative;

      &-box {
        width: 100%;
        height: 100%;
        border-radius: toRpx(12);
        border: toRpx(3) solid #a8c1ff;
        background: #ffffff;
        box-sizing: border-box;
        padding: 0 toRpx(20);
        position: relative;
        z-index: 2;

        .input,
        .calendar {
          width: 100%;
          height: 100%;
          border: none !important;
          outline: none;
          font-size: toRpx(26);
          color: #292d33;
          box-sizing: border-box;
          line-height: toRpx(72);
          padding: 0 !important;
        }

        .placeholder {
          color: #999ea8;
        }

        .clear {
          position: absolute;
          top: toRpx(16);
          right: toRpx(16);
          width: toRpx(36);
          height: toRpx(36);
          background: #f0f1f5;
          border-radius: 100%;
          justify-content: center;
        }
      }
    }

    .form-item-input {
      width: toRpx(452);
      margin: 0 toRpx(12);
    }

    .active {
      position: relative;

      &::after {
        position: absolute;
        left: toMinusRpx(2);
        top: toMinusRpx(2);
        width: calc(100% + #{toRpx(4)});
        height: calc(100% + #{toRpx(4)});
        content: '';
        background-image: linear-gradient(#2f6af7, #75bcff);
        box-shadow: 0 0 0 toRpx(8) #2c66f71a;
        border-radius: toRpx(16);
      }
    }

    .btn {
      width: toRpx(120);
      height: toRpx(72);
      border-radius: toRpx(12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #292d33;
      font-size: toRpx(28);
    }

    .search {
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #fff;
    }

    .reset {
      background: #f0f1f5;
    }

    .icon-vinScan {
      flex-shrink: 0;
    }
  }

  .list-box {
    height: calc(100% - #{toRpx(112)});
    border-radius: toRpx(32);
    overflow: hidden;
    background: #ffffff59;
    backdrop-filter: blur(toRpx(16));
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;

    .scroll-view {
      position: relative;
      z-index: 2;
      height: calc(100% - #{toRpx(96)});
      padding-top: toRpx(2);
      background: #fff;
      border-radius: toRpx(32);

      .nothing {
        color: #808291;
        font-size: toRpx(28);
        flex-direction: column;
        justify-content: center;

        .noDataImg {
          width: toRpx(480);
          height: toRpx(240);
          margin-bottom: toRpx(16);
        }
      }

      .item-list {
        display: flex;
        flex-wrap: wrap;
        gap: toRpx(28);
        padding: toRpx(40) toRpx(48) 0 toRpx(48);
      }

      .item {
        width: calc((100% - #{toRpx(56)}) / 3);
        height: toRpx(232);
        border-radius: toRpx(24);
        box-shadow: 0 toRpx(6) toRpx(24) 0 #2a61eb1a;
        position: relative;
        padding: toRpx(28);

        .reportTypeName {
          color: #292d33;
          font-size: toRpx(30);
          font-weight: 500;
          margin-left: toRpx(16);
        }
        .reportStatus {
          padding: toRpx(4) toRpx(16);
          border-radius: toRpx(8);
        }

        .reportStatus0 {
          background: #fef4e8;
          color: #f59619;
          font-size: toRpx(24);
          font-weight: 500;
        }

        .reportStatus1 {
          background: #e9f9f1;
          color: #2cca74;
          font-size: toRpx(24);
          font-weight: 500;
        }

        .reportStatus2 {
          background: #fdeded;
          color: #eb4e4e;
          font-size: toRpx(24);
          font-weight: 500;
        }
        .cell {
          .label {
            color: #999ea8;
            font-size: toRpx(28);
            margin-right: toRpx(16);
            width: toRpx(128);
          }
          .value {
            color: #666666;
            font-size: toRpx(28);
          }
        }
      }

      .block {
        width: 100%;
        height: toRpx(40);
      }
    }

    .no-br {
      border-radius: 0 toRpx(32) toRpx(32) toRpx(32);
    }
  }
  .addBtn {
    width: toRpx(144);
    height: toRpx(144);
    border-radius: toRpx(24);
    background: linear-gradient(180deg, rgb(247, 248, 250) 0%, rgb(255, 255, 255) 100%);
    border: toRpx(4) solid #ffffff;
    box-shadow: 0 toRpx(6) toRpx(24) 0 #2a61eb1a;
    position: fixed;
    bottom: toRpx(348);
    right: toRpx(144);
    .addBtn-icon {
      color: #4673ff;
      font-size: toRpx(24);
      font-weight: 500;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      border-radius: toRpx(24);
      background: linear-gradient(180deg, rgba(70, 115, 255, 0.1) 0%, rgba(70, 115, 255, 0) 100%);
      .icon-addReport {
        margin-bottom: toRpx(12);
      }
    }
  }
}

.popup-content {
  width: toRpx(1400);
  height: toRpx(888);
  border-radius: toRpx(48);
  opacity: 1;
  background: #ffffff;
  overflow: hidden;
  .popup-top-box {
    width: toRpx(1400);
    opacity: 1;
    padding: toRpx(48) toRpx(64);
    background: url('@/assets/images/common/reportbg.webp') no-repeat center center;
    background-size: 100% 100%;
    .popup-top-box-title {
      flex: 1;
      text-align: center;
      color: #292d33;
      font-size: toRpx(40);
      font-weight: 500;
    }
  }
  .popup-content-item {
    padding: toRpx(16) toRpx(64) toRpx(48) toRpx(64);
    box-sizing: border-box;
    align-items: start;
  }
  .grayLabel {
    color: #999ea8;
    font-size: toRpx(24);
    font-weight: 400;
    margin-bottom: toRpx(28);
    .sprite-icon {
      margin-right: toRpx(8);
    }
  }
  .popup-content-left {
    width: toRpx(448);
    height: toRpx(672);
    border-right: 2px solid #f7f7f6;
    box-sizing: border-box;
    padding-right: toRpx(40);
    flex-shrink: 0;
    .tabItem {
      border-radius: toRpx(24);
      background: #f7f7f7;
      padding: toRpx(26) toRpx(29);
      cursor: pointer;
      &.active0 {
        background: #797afc14;
        .title {
          color: #797afc;
        }
      }
      &.active1 {
        background: #3785ff14;
        .title {
          color: #3785ff;
        }
      }
      .sprite-icon {
        margin-right: toRpx(17);
      }
      .title {
        color: #292d33;
        font-size: toRpx(30);
        font-weight: 500;
        margin-bottom: toRpx(8);
      }
      .desc {
        color: #666666;
        font-size: toRpx(26);
        font-weight: 400;
      }
    }
  }
  .popup-content-right {
    padding-left: toRpx(40);
    .placeholder {
      color: #999999;
      font-size: toRpx(28);
      font-weight: 400;
    }
    .box {
      border-radius: toRpx(16);
      background: #ffffff;
      margin-bottom: toRpx(24);

      .title {
        color: #333333;
        font-size: toRpx(28);
        font-weight: 500;
        display: flex;
        line-height: toRpx(40);

        .required {
          color: #f24724;
          font-size: toRpx(28);
          margin-left: toRpx(8);
        }
      }
    }

    .upload-box {
      .vinInput {
        border-radius: toRpx(16);
        opacity: 1;
        background: #f7f7f7;
        padding: toRpx(22) toRpx(24);
        margin-top: toRpx(24);
      }

      .img-list {
        flex-wrap: wrap;
        gap: toRpx(24);
        margin-top: toRpx(24);
        .upload {
          background: url('@/assets/images/common/uploadBc.webp') no-repeat;
          background-size: 100% 100%;
          flex-direction: column;
          justify-content: center;
          color: #999999;
          font-size: toRpx(26);
          position: relative;

          .icon-takePhotoIcon {
            position: absolute;
          }
        }

        .img-item {
          width: toRpx(224);
          height: toRpx(224);
          border-radius: toRpx(12);
          position: relative;
          overflow: hidden;

          .img {
            width: 100%;
            height: 100%;
          }

          .del {
            position: absolute;
            width: toRpx(32);
            height: toRpx(32);
            background: #00000080;
            border-radius: 100%;
            top: toRpx(8);
            right: toRpx(4);
            justify-content: center;
          }
        }
      }

      .img-tips {
        color: #999999;
        font-size: toRpx(24);
        padding: toRpx(16) 0 toRpx(28);
        line-height: toRpx(36);
      }
    }
    .checkboxLabel {
      color: #333333;
      font-size: toRpx(24);
      font-weight: 400;
    }
    .disabled {
      opacity: 0.5;
    }
    .btn {
      width: toRpx(352);
      height: toRpx(80);
      border-radius: toRpx(48);
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
      font-size: toRpx(28);
      font-weight: 500;
      text-align: center;
    }
    .mt-108 {
      margin-top: toRpx(68);
    }
  }
}
</style>
