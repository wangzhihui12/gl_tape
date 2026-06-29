<template>
  <view class="confirm-car">
    <view class="nav-bar">
      <view class="back" @click.stop="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">确认交车登记</view>
    </view>
    <view class="detail-content">
      <view class="box-class mt-16">
        <view class="bg-title"></view>
        <view class="form-container-upload">
          <view class="upload-section">
            <view class="section-title">交接清单</view>
            <view class="upload-grid">
              <view class="flex upload-item-container" :class="{ fullwidth: field.fullwidth }" v-for="field in uploadFields" :key="field.key">
                <view class="upload-label">
                  {{ field.label }}
                  <text class="requiredLabel" v-if="field.required">*</text>
                </view>
                <view>
                  <view class="flex align-center inputBox" :class="{ fullInput: field.fullInput }" v-if="field.key === 'carKeyUrl'">
                    <input type="number" v-model="formData[field.inputKey]" placeholder="请输入" maxlength="1" />
                    <text>套</text>
                  </view>
                  <view class="flex align-center inputBox" :class="{ fullInput: field.fullInput }" v-if="field.key === 'otherUrl'">
                    <input type="text" v-model="formData[field.inputKey]" placeholder="请输入" maxlength="28" />
                  </view>
                  <view class="upload-images-wrapper">
                    <!-- 显示已上传的图片列表 -->
                    <view v-for="(image, index) in getImages(field, 'upload')" :key="index" class="uploaded-image-container">
                      <!-- 视频显示 -->
                      <view v-if="image.includes(videoProcess)" class="video-container" @click.stop="previewMedia(media, 2)">
                        <!-- <video :src="media.url || media" mode="aspectFill" controls class="uploaded-media"></video> -->

                        <image :src="getImageDisplayUrl(image)" mode="aspectFill" @click.stop="previewMedia(image, 2)"></image>
                        <view class="video-play-icon">
                          <view class="sprite-icon icon-upload-play"></view>
                        </view>
                      </view>
                      <image v-else :src="getImageDisplayUrl(image)" mode="aspectFill" class="uploaded-image" @click.stop="previewMedia(image, 1)"></image>
                      <view class="delete-icon" @click.stop="deleteImage(field.key, index, 'upload')">
                        <view class="sprite-icon icon-icon-circle-error"></view>
                      </view>
                    </view>
                    <!-- 上传按钮，当未达到最大限制时显示 -->
                    <view v-if="!hasReachedMax(field, 'upload')" class="upload-item" @click.stop="handleImageUpload(field)">
                      <view class="upload-placeholder">
                        <view class="sprite-icon icon-uploadAdd"></view>
                        <text class="upload-text">{{ field.maxCount > 1 ? getImages(field, 'upload').length + '/' + field.maxCount : '上传图片' }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="upload-section">
            <view class="section-title">交车确认照片</view>
            <view class="upload-grid">
              <view class="flex upload-item-container" :class="{ fullwidth: field.fullwidth }" v-for="field in confirmCarUploadFields" :key="field.key">
                <view class="upload-label">
                  {{ field.label }}
                  <text class="requiredLabel" v-if="field.required">*</text>
                </view>
                <view class="upload-images-wrapper">
                  <!-- 显示已上传的图片列表 -->
                  <view v-for="(image, index) in getImages(field, 'confirm')" :key="index" class="uploaded-image-container">
                    <image :src="getImageDisplayUrl(image)" mode="aspectFill" class="uploaded-image" @click.stop="previewMedia(image, 1)"></image>
                    <view class="delete-icon" @click.stop="deleteImage(field.key, index, 'confirm')">
                      <view class="sprite-icon icon-icon-circle-error"></view>
                    </view>
                  </view>
                  <!-- 上传按钮，当未达到最大限制时显示 -->
                  <view v-if="!hasReachedMax(field, 'confirm')" class="upload-item" @click.stop="handleImageUpload(field)">
                    <view class="upload-placeholder">
                      <view class="sprite-icon icon-uploadAdd"></view>
                      <text class="upload-text">{{ field.maxCount > 1 ? getImages(field, 'confirm').length + '/' + field.maxCount : '上传图片' }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="fromBox">
            <FormCell :formFields="formFields" :formData="formData" @handleCell="handleCell" @previewPdf="previewPdf" @deletePdf="deletePdf" @location="location" />
          </view>
        </view>
        <view class="button-module flex justify-center align-center">
          <view class="button-container flex justify-between">
            <view class="cancel-btn" @click.stop="backPage">取消</view>
            <view class="next-btn" @click.stop="confirmDelivery">确认交车</view>
          </view>
        </view>
      </view>
    </view>
    <GeneralPopup ref="addAgreementPopup" popupClass="addAgreementPopup" type="center" :otherText="formData.supplementaryClauseText" title="补充协议条款" :autoClose="false" @confirm="confirmAddAgreement">
      <template v-slot:content>
        <textarea placeholder="请输入 (200字以内)" v-model="formData.supplementaryClauseText" maxlength="200" />
      </template>
    </GeneralPopup>
    <GeneralPopup ref="tipsPopup" popupClass="tipsPopup" type="center" :showClose="true" :showTitle="false" @confirm="confirmTips" :noTitle="true">
      <template #content>
        <view>
          <image class="tipsPopupBg" :src="bg" />
          <view class="title">确认交车提醒</view>
          <view class="tipsConent">
            <view>{{ showTips }}</view>
            <!-- <view>请确定车辆已经交付：代保管人 {{ custodianName }}。</view> -->
          </view>
        </view>
      </template>
    </GeneralPopup>
    <order-popup ref="openDate" popupType="13" @onConfirm="confirmDate" />
    <NoticePopup ref="notice" title="重要提示" text="当前页面暂未保存，是否确认退出" type="warning"></NoticePopup>
    <u-datetime-picker class="sign-info-datetime-picker" :show="show" v-model="value1" mode="datetime" @confirm="confirmDate" @cancel="show = false"></u-datetime-picker>
  </view>
</template>
<script>
// import { uploadFile } from '@/utils/ossUploadFile/uploadFile.js'
import { uploadFile } from '@/utils/ossUpload.js'
import { getImageDisplayUrl } from '@/utils/ossImageProcess.js'
import FormCell from './components/FormCell.vue'
import GeneralPopup from './components/GeneralPopup.vue'
import OrderPopup from '@/components/OrderPopup/index.vue'
import dayjs from 'dayjs'
import NoticePopup from '@/components/NoticePopup.vue'
import { throttle } from 'lodash'
import permision from '@/js_sdk/wa-permission/permission.js'
export default {
  components: {
    FormCell,
    GeneralPopup,
    OrderPopup,
    NoticePopup
  },
  data() {
    return {
      currentField: null,
      videoProcess: '?x-oss-process=video/snapshot,t_7000,f_jpg,w_800,h_600,m_fast',
      bg: require('@/assets/images/boutique/tipsPopupBg.webp'),
      userInfo: {},
      current: 0,
      index: 0,
      uploadedImages: {},
      confirmCarImages: {},
      custodianName: '',
      pdfUrl: '',
      showTips: '《车辆交接确认单》已发送至签约车主，请提醒车主完成签署。',
      successDate: '',
      show: false,
      value1: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      formFields: [
        {
          key: 'handoverTime',
          label: '交车时间',
          required: true,
          fullWidth: false,
          targetNameKey: 'handoverTimeName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'handoverTime',
          type: 'calendar'
        },
        {
          key: 'handoverAddress',
          label: '交车地点',
          required: true,
          fullWidth: false,
          targetNameKey: 'handoverAddre',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'handoverAddress',
          type: 'input',
          maxlength: 43,
          isLocation: true
        },
        {
          key: 'buyerAgreementUrl',
          label: '补充协议条款',
          required: false,
          fullWidth: false,
          targetNameKey: 'sellerName',
          sourceNameKey: 'staffName',
          sourceKey: 'uuid',
          targetKey: 'sellerUserId',
          targetObj: 'evalOrderBasicReqDTO',
          type: 'pdf',
          isShowPreview: false
        }
      ],
      formData: {
        motorBookUrl: '',
        motorRegistrationCertificateUrl: '',
        purchaseReceiptUrl: '',
        purchaseInvoiceUrl: '',
        trafficScreenshotUrl: '',
        carKeyUrl: '',
        carKeyCount: '',
        trafficInsuranceUrl: '',
        insuranceCardUrl: '',
        transferPhotoUrl: '',
        otherUrl: '',
        otherText: '',
        handoverPhotoFrontFourFive: '',
        handoverPhotoFront: '',
        handoverPhotoRightSide: '',
        handoverPhotoLeftSide: '',
        handoverPhotoBack: '',
        handoverPhotoMore: '',
        handoverTime: '',
        handoverAddress: '',
        supplementaryClauseText: ''
      },
      uploadFields: [
        { key: 'motorBookUrl', label: '机动车登记本', required: true, maxCount: 3 },
        { key: 'motorRegistrationCertificateUrl', label: '机动车行驶证', required: true, maxCount: 2 },
        { key: 'purchaseReceiptUrl', label: '购置税证及收据', required: false, maxCount: 1 },
        { key: 'purchaseInvoiceUrl', label: '购车发票', required: false, maxCount: 1 },
        { key: 'trafficScreenshotUrl', label: '交管12123截图', required: true, maxCount: 1 },
        { key: 'trafficInsuranceUrl', label: '交强险', required: true, maxCount: 1 },
        { key: 'transferPhotoUrl', label: '过户授权委托书照片/视频', required: true, maxCount: 1, accept: 'image/video' },
        { key: 'insuranceCardUrl', label: '保险单商业保险单或卡', required: false, maxCount: 1 },
        { key: 'carKeyUrl', label: '车钥匙', required: true, maxCount: 1, inputKey: 'carKeyCount' },
        { key: 'otherUrl', label: '其他', required: false, maxCount: 1, fullInput: true, inputKey: 'otherText', inputType: 'number' }
      ],
      confirmCarUploadFields: [
        { key: 'handoverPhotoFrontFourFive', label: '正面45度', required: true, maxCount: 1 },
        { key: 'handoverPhotoFront', label: '正面', required: false, maxCount: 1 },
        { key: 'handoverPhotoLeftSide', label: '左侧面', required: false, maxCount: 1 },
        { key: 'handoverPhotoBack', label: '后面', required: false, maxCount: 1 },
        { key: 'handoverPhotoRightSide', label: '右侧面', required: false, maxCount: 1 },
        { key: 'handoverPhotoMore', label: '其他', required: false, maxCount: 5, fullwidth: true }
      ],
      query: null
    }
  },
  computed: {},
  onLoad(options) {
    this.init(options)
  },
  onBackPress(options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.backPage()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  methods: {
    getImageDisplayUrl,
    init(options) {
      this.query = options
      this.getEvalOrderSimpleDetail()
    },
    backPage() {
      this.$refs.notice.buttonsList = [
        {
          text: '确认退出',
          type: 'default',
          callback: () => {
            this.$refs.notice.close()
            uni.navigateBack({
              delta: 1
            })
          }
        },
        {
          text: '继续编辑',
          type: 'primary',
          callback: () => {
            this.$refs.notice.close()
          }
        }
      ]
      this.$refs.notice.open()
    },
    async getEvalOrderSimpleDetail() {
      const res = await uni.$api.evaluationApi.evalOrderSimpleDetail({
        evalOrderNo: this.query.evalOrderNo
      })
      if (res.data.code == 0) {
        const data = res.data.data

        // 设置交车时间
        this.formData.handoverTime = dayjs().format('YYYY-MM-DD HH:mm:00')

        // 处理图片回显
        if (data.imageListDTO && data.imageListDTO.length > 0) {
          // 行驶证图片 (fileSubtype: 21)
          const drivingLicenseImages = data.imageListDTO.filter(img => img.fileSubtype === 21).map(img => img.fileUrl)
          if (drivingLicenseImages.length > 0) {
            this.$set(this.uploadedImages, 'motorRegistrationCertificateUrl', drivingLicenseImages)
            this.formData.motorRegistrationCertificateUrl = drivingLicenseImages.join(',')
          }

          // 登记证图片 (fileSubtype: 22)
          const registrationImages = data.imageListDTO.filter(img => img.fileSubtype === 22).map(img => img.fileUrl)
          if (registrationImages.length > 0) {
            this.$set(this.uploadedImages, 'motorBookUrl', registrationImages)
            this.formData.motorBookUrl = registrationImages.join(',')
          }
        }

        // this.evalOrderSimpleDetail = res.data.data
      } else {
        uni.hideLoading()
        uni.showToast({
          title: res.data.msg || '请求失败',
          icon: 'none'
        })
      }
    },
    confirmAddAgreement() {
      if (this.formData.supplementaryClauseText) {
        uni.showLoading()
        uni.$api.evaluationApi
          .salesAgreementPreview({
            evalOrderNo: this.query.evalOrderNo,
            supplementaryClauseText: this.formData.supplementaryClauseText
          })
          .then(res => {
            if (res.data.code == 0) {
              uni.hideLoading()
              this.$refs.addAgreementPopup.closePopup()
              this.formFields.forEach(item => {
                if (item.key === this.currentField.key) {
                  item.isShowPreview = true
                }
              })
              this.pdfUrl = res.data.data.fileDownloadUrl
              console.log('this.pdfUrl', this.pdfUrl)
            } else {
              uni.hideLoading()
              uni.showToast({
                title: res.data.msg || '请求失败',
                icon: 'none'
              })
            }
          })
      } else {
        uni.showToast({
          title: '请填写补充条款',
          icon: 'none'
        })
      }
    },
    handleCell(field) {
      const that = this
      console.log('handleCell', field)
      that.currentField = field
      if (field.type === 'pdf') {
        this.$refs.addAgreementPopup.open()
      } else if (field.type === 'calendar') {
        that.show = true
      }
    },
    confirmDelivery: throttle(function (e) {
      if (!this.formData.handoverTime) {
        uni.showToast({ title: '请选择交车时间', icon: 'none' })
        return
      }

      if (!this.formData.handoverAddress) {
        uni.showToast({ title: '请输入交车地点', icon: 'none' })
        return
      }
      if (this.formData.carKeyCount < 0 || this.formData.carKeyCount == '') {
        uni.showToast({ title: '请输入车钥匙数量', icon: 'none' })
        return
      }
      console.log('this.formData', this.getImages({ key: 'otherUrl' }, 'upload'))
      if (this.formData.otherText && (!this.getImages({ key: 'otherUrl' }, 'upload') || this.getImages({ key: 'otherUrl' }, 'upload').length == 0)) {
        uni.showToast({ title: '请输入其他图片', icon: 'none' })
        return
      }
      console.log('this.formData', this.getImages({ key: 'handoverPhotoFrontFourFive' }, 'confirm'))
      if (!this.getImages({ key: 'handoverPhotoFrontFourFive' }, 'confirm') || this.getImages({ key: 'handoverPhotoFrontFourFive' }, 'confirm').length == 0) {
        uni.showToast({ title: '请上传正面45度图片', icon: 'none' })
        return
      }

      const requiredUploadFields = this.uploadFields.filter(field => field.required)

      for (const field of requiredUploadFields) {
        const images = this.getImages(field, 'upload')
        if (field.key === 'carKeyUrl' && (!images || images.length === 0)) {
          uni.showToast({ title: '请上车车钥匙图片', icon: 'none' })
          return
        }
        if (!images || images.length === 0) {
          uni.showToast({ title: `请上传${field.label}`, icon: 'none' })
          return
        }
      }
      this.showTips = `《车辆交接确认单》${this.formData.supplementaryClauseText ? '、《二手车补充协议》' : ''}已发送至签约车主，请提醒车主完成签署。`
      this.$refs.tipsPopup.open()
    }, 1500),
    async confirmTips() {
      // this.uploadedImages

      Object.keys(this.uploadedImages).forEach(key => {
        console.log(this.uploadedImages)
        if (Array.isArray(this.uploadedImages[key])) {
          // 将图片URL数组转换为逗号分隔的字符串
          const imagesStr = this.uploadedImages[key].join(',')
          // 更新formData中对应的字段
          if (imagesStr.includes(this.videoProcess)) {
            this.formData[key] = imagesStr.replace(this.videoProcess, '')
          } else {
            this.formData[key] = imagesStr
          }

          console.log('this.uploadedImages', this.formData)
        }
      })
      uni.showLoading()
      const res = await uni.$api.evaluationApi.confirmDelivery({
        evalOrderNo: this.query.evalOrderNo,
        ...this.formData
      })
      console.log('res:', res)
      if (res.data.code == 0) {
        uni.hideLoading()
        uni.showToast({ title: '交车成功', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          })
        }, 500)
      } else {
        uni.hideLoading()
        uni.showToast({
          title: res.data.msg || '请求失败',
          icon: 'none'
        })
      }
    },
    async handleImageUpload(field) {
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
      // 显示操作菜单，让用户选择拍照或从相册选择
      uni.showActionSheet({
        itemList: field.accept == 'image/video' ? ['拍照', '从相册选择', '拍摄视频', '从相册选择视频'] : ['拍照', '从相册选择'],
        success: res => {
          if (res.tapIndex === 0) {
            // 拍照
            this.takePhoto(field)
          } else if (res.tapIndex === 1) {
            // 从相册选择
            this.chooseImageFromAlbum(field)
          } else if (res.tapIndex === 2) {
            // 拍摄视频
            this.takeVideo(field)
          } else if (res.tapIndex === 3) {
            // 从相册选择视频
            this.chooseVideoFromAlbum(field)
          }
        },
        fail: err => {
          console.log('选择操作失败', err)
        }
      })
    },
    deletePdf() {
      this.formFields.forEach(item => {
        if (item.key === 'buyerAgreementUrl') {
          item.isShowPreview = false
        }
      })
      this.formData.supplementaryClauseText = ''
    },

    takePhoto(field) {
      uni.chooseImage({
        count: this.getRemainingCount(field),
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
              this.addImage(field, url)
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
    chooseImageFromAlbum(field) {
      uni.chooseImage({
        count: this.getRemainingCount(field),
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
              this.addImage(field, url)
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
    // 拍摄视频
    takeVideo(field) {
      uni.chooseVideo({
        sourceType: ['camera'],
        maxDuration: field.maxDuration || 60,
        camera: 'back',
        compressed: false,
        success: async res => {
          console.log('拍摄视频成功', res)
          uni.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function () {
              console.log('save success')
            }
          })
          try {
            const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
            if (res.size > MAX_VIDEO_SIZE) {
              uni.showToast({ title: '视频上传最大100MB', icon: 'none' })
              return
            }
            uni.showLoading({ title: '上传中...' })
            let url = ''
            // #ifdef H5
            url = await uploadFile(res.tempFile, res.tempFilePath)
            // #endif
            // #ifdef APP-PLUS
            url = await uploadFile(null, res.tempFilePath)
            // #endif
            url = url + this.videoProcess
            console.log('上传视频成功', url)
            // const fileExtension = res.name ? res.name.split('.').pop().toLowerCase() : res.tempFilePath.split('.').pop().toLowerCase()
            this.addImage(field, url)
            uni.hideLoading()
          } catch (error) {
            console.log('上传视频失败', error)
            uni.hideLoading()
            uni.showToast({ title: '视频上传失败，请重试', icon: 'none' })
          }
        },
        fail: err => {
          console.log('拍摄视频失败', err)
          uni.hideLoading()
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '拍摄视频失败', icon: 'none' })
          }
        }
      })
    },

    // 从相册选择视频
    chooseVideoFromAlbum(field) {
      uni.chooseVideo({
        sourceType: ['album'],
        compressed: false,
        maxDuration: field.maxDuration || 60,
        success: async res => {
          console.log('选择视频成功', res)
          try {
            const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
            if (res.size > MAX_VIDEO_SIZE) {
              uni.showToast({ title: '视频上传最大100MB', icon: 'none' })
              return
            }
            let url = ''
            uni.showLoading({ title: '上传中...' })
            // #ifdef H5
            url = await uploadFile(res.tempFile, res.tempFilePath)
            // #endif
            // #ifdef APP-PLUS
            url = await uploadFile(null, res.tempFilePath)
            // #endif
            url = url + this.videoProcess
            console.log('上传视频成功', url)

            // const fileExtension = res.name ? res.name.split('.').pop().toLowerCase() : res.tempFilePath.split('.').pop().toLowerCase()
            this.addImage(field, url)
            uni.hideLoading()
          } catch (error) {
            console.log('上传视频失败', error)
            uni.hideLoading()
            uni.showToast({ title: '视频上传失败，请重试', icon: 'none' })
          }
        },
        fail: err => {
          console.log('选择视频失败', err)
          uni.hideLoading()
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '选择视频失败', icon: 'none' })
          }
        }
      })
    },
    // 获取指定字段类型的图片数组
    getImages(field, type) {
      // 确保返回的是数组
      return Array.isArray(this.uploadedImages[field.key]) ? this.uploadedImages[field.key] : []
    },
    // 检查是否达到最大上传数量
    hasReachedMax(field, type) {
      const images = this.getImages(field, type)
      return images.length >= (field.maxCount || 1)
    },
    // 获取剩余可上传数量
    getRemainingCount(field) {
      const type = this.uploadFields.some(item => item.key === field.key) ? 'upload' : 'confirm'
      const images = this.getImages(field, type)
      return Math.max(1, (field.maxCount || 1) - images.length)
    },
    // 添加图片到对应的数组中（确保响应式更新）
    addImage(field, url) {
      // 上传完成后保持原始 URL；仅在回显/预览时拼接 OSS 处理参数展示
      const finalUrl = url
      // 添加新图片
      if (!Array.isArray(this.uploadedImages[field.key])) {
        this.$set(this.uploadedImages, field.key, [])
      }

      // 添加新媒体
      this.$set(this.uploadedImages[field.key], this.uploadedImages[field.key].length, finalUrl)
      console.log('this.uploadedImages', this.uploadedImages)
    },
    // 删除图片
    deleteImage(key, index, type) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这张图片吗？',
        success: res => {
          if (res.confirm && Array.isArray(this.uploadedImages[key])) {
            if (key === 'otherUrl') {
              this.formData.otherUrl = ''
            }
            // 使用splice确保响应式更新
            this.uploadedImages[key].splice(index, 1)
            // 如果数组为空，可以选择删除该字段
            if (this.uploadedImages[key].length === 0) {
              this.$delete(this.uploadedImages, key)
            }
          }
        }
      })
    },
    // 预览PDF
    previewPdf(field) {
      const url = `/pages/evaluationForm/components/pdfPreView?fileUrl=${this.pdfUrl}&title=pdf&fileUrltype=pdf`
      uni.navigateTo({
        url: `${url}`
      })
    },
    confirmDate(date) {
      const successDate = dayjs(date.value).format('YYYY-MM-DD HH:mm:00')
      console.log(successDate)
      this.$set(this.formData, 'handoverTime', successDate)
      this.show = false
    },
    location() {
      const that = this
      uni.showLoading({ title: '定位中...' })
      uni.getLocation({
        type: 'gcj02',
        geocode: true,
        success: function (res) {
          uni.hideLoading()
          that.$set(that.formData, 'handoverAddress', res.address.province + res.address.city)
        },
        fail: function (err) {
          uni.hideLoading()
          uni.showToast({ title: '定位失败', icon: 'none' })
        }
      })
    }
  },
  watch: {},
  mounted() {
    // 组件挂载时的初始化逻辑
    this.userInfo = uni.$storage.get('userInfo') || {}
    console.log('userInfo', this.userInfo)
  }
}
</script>
<style scoped lang="scss">
// Popup样式
::v-deep .tipsPopup .uni-popup__wrapper {
  width: toRpx(848);
  height: toRpx(664);
  border-radius: toRpx(42);
  background: rgb(255, 255, 255) !important;
  .tipsPopupBg {
    border-radius: toRpx(42) toRpx(42) 0 0;
    width: 100%;
    height: toRpx(244);
  }
  .title {
    color: #333333;
    font-size: toRpx(40);
    font-weight: 500;
    text-align: center;
    margin-top: toRpx(48);
  }
  .tipsConent {
    color: #666666;
    font-size: toRpx(32);
    font-weight: 400;
    padding: toRpx(16) toRpx(64);
    line-height: toRpx(48);
    text {
      color: #347bff;
    }
  }
}
::v-deep .sign-info-datetime-picker {
  .u-transition {
    border-radius: toRpx(32) toRpx(32) 0 0;
    overflow: hidden;
  }
  .u-picker__view {
    height: 62vh !important;
  }
}
::v-deep .addAgreementPopup {
  uni-textarea {
    width: 100%;
    height: toRpx(568);
    border-radius: toRpx(16);
    background: #f4f5f7;
    padding: toRpx(24);
    box-sizing: border-box;
  }
}
.confirm-car {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/common/page-bg.webp');
  background-size: 100%;
  padding: toRpx(160) toRpx(64) toRpx(48);
  box-sizing: border-box;
  .detail-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    .box-class {
      height: 100%;
      background: #f1f4ff;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(48);
      overflow: hidden;
      padding: toRpx(48) toRpx(48) 0;
      box-sizing: border-box;

      .form-container-upload {
        width: 100%;
        height: calc(100% - #{toRpx(128)});
        overflow-y: auto;
        padding-right: toRpx(8);
      }

      /* 上传按钮样式 */
      .upload-btn {
        width: toRpx(200);
        height: toRpx(64);
        border-radius: toRpx(32);
        border: toRpx(2) dashed #999999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999999;
        font-size: toRpx(28);
      }

      /* 上传区域样式 */
      .upload-section {
        margin-bottom: toRpx(24);
        grid-column: 1 / -1;
        padding: toRpx(32) toRpx(48);
        border-radius: toRpx(16);
        background-color: #fff;
      }

      .section-title {
        font-size: toRpx(32);
        font-weight: 600;
        color: #333333;
        margin-bottom: toRpx(24);
      }

      .upload-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: toRpx(24);
      }
      .upload-item-container {
        align-items: flex-start;
        margin-bottom: toRpx(32);
        .upload-label {
          color: #666666;
          font-size: toRpx(26);
          font-weight: 400;
          display: flex;
          align-items: flex-start;
          margin-right: toRpx(42);
          width: toRpx(180);
          margin-bottom: toRpx(16);
        }
        .inputBox {
          width: toRpx(240);
          height: toRpx(64);
          border-radius: toRpx(8);
          background: #f4f5f7;
          padding: toRpx(8) toRpx(20);
          box-sizing: border-box;
          margin-bottom: toRpx(16);
          font-size: toRpx(28);
          .uni-input-placeholder {
            color: #999999;
            font-size: toRpx(28);
            font-weight: 400;
          }
        }
        .fullInput {
          width: 100%;
        }
        .requiredLabel {
          color: #f24724;
          font-size: toRpx(28);
          font-weight: 400;
          margin-left: toRpx(8);
        }
        // 图片包装器，使用flex布局显示多张图片
        .upload-images-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: toRpx(16);
        }
        // fullwidth类样式，使字段占据整行
        &.fullwidth {
          grid-column: 1 / -1; // 跨越所有列
          .upload-label {
            flex: none;
          }
          .upload-images-wrapper {
            // 全宽模式下可以显示更多图片
          }
        }
      }

      .upload-item {
        width: toRpx(240);
        height: toRpx(240);
        border-radius: toRpx(12);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        opacity: 1;
        background: #f5f8ff;
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #999999;
      }

      .upload-text {
        margin-top: toRpx(12);
        font-size: toRpx(24);
      }

      /* 已上传图片样式 */
      .uploaded-image-container {
        position: relative;
        width: toRpx(240);
        height: toRpx(240);
        border-radius: toRpx(12);
        overflow: hidden;
      }

      .uploaded-image {
        width: 100%;
        height: 100%;
      }

      .delete-icon {
        position: absolute;
        top: toRpx(8);
        right: toRpx(8);

        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }
      /* 视频容器样式 */
      .video-container {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      /* 视频播放图标 */
      .video-play-icon {
        position: absolute;
        bottom: 0;
        left: toRpx(36);
        transform: translate(-50%, -50%);
        width: toRpx(40);
        height: toRpx(40);
        background-color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }
    }
    .button-module {
      margin-bottom: toRpx(24);
      margin-top: toRpx(24);
      .button-container {
        width: 100%;
        display: flex;
        justify-content: center;
        gap: toRpx(32);
      }

      .cancel-btn {
        width: toRpx(724);
        height: toRpx(80);
        border-radius: toRpx(48);
        border: toRpx(1) solid #ffffff;
        background: #3b73ff1a;
        text-align: center;
        line-height: toRpx(80);
        color: #4673ff;
        font-size: toRpx(28);
        font-weight: 500;
      }

      .next-btn {
        width: toRpx(724);
        height: toRpx(80);
        border-radius: toRpx(48);
        border: toRpx(1) solid #ffffff;
        background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
        text-align: center;
        line-height: toRpx(80);
        color: #ffffff;
        font-size: toRpx(28);
        font-weight: 500;
      }
    }
  }
}
</style>
