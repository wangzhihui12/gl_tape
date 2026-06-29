<template>
  <popup ref="popup" @onConfirm="confirm" @onCancel="cancel">
    <view class="popup-title flex">
      上传合同协议
      <view class="popup-close flex" @click="close">
        <uni-icons type="closeempty" size="16"></uni-icons>
      </view>
    </view>

    <template>
      <view class="popup-body">
        <view class="flex px-24 tips">
          <view class="sprite-icon icon-study-tips"></view>
          <text class="tips-text">上传完毕计入有效成交，订单才可参与提成/清分/积分发放！</text>
        </view>
        <view class="contract-upload-container">
          <view class="upload-item-container">
            <view class="upload-label">
              合同协议
              <text class="requiredLabel">*</text>
            </view>
            <view class="upload-wrapper">
              <!-- 显示已上传的文件列表 -->
              <view v-for="(file, index) in getContractFiles()" :key="index" class="uploaded-file-container">
                <!-- PDF文件显示 -->
                <view v-if="isPdfFile(file)" class="pdf-container" @click.stop="previewFile(file, 3)">
                  <view class="pdf-icon">
                    <view class="sprite-icon icon-pdf-xl"></view>
                  </view>
                  <view class="file-info">
                    <text class="file-name">{{ getFileName(file) }}</text>
                    <!-- <text class="file-size">{{ formatFileSize(file.size) }}</text> -->
                  </view>
                </view>
                <!-- 图片文件显示 -->
                <image v-else :src="file.url || file" mode="aspectFill" class="uploaded-image" @click.stop="previewFile(file, 1)"></image>

                <view class="delete-icon" @click.stop="deleteContractFile(index)">
                  <view class="sprite-icon icon-icon-circle-error"></view>
                </view>
              </view>
              <!-- 上传按钮，当未达到最大限制时显示 -->
              <view v-if="!hasReachedMax(uploadField)" class="upload-item" @click="handleContractUpload(uploadField)">
                <view class="upload-placeholder">
                  <view class="sprite-icon icon-uploadAdd"></view>
                  <text class="upload-text">{{ getContractFiles().length > 0 ? getContractFiles().length + '/' + uploadField.maxCount : '图片或PDF' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>
    <xe-upload ref="XeUpload" :options="uploadOptions" @callback="handleUploadCallback"></xe-upload>
  </popup>
</template>

<script type="text/ecmascript-6">
import Popup from '@/components/Popup.vue'
import { uploadFile } from '@/utils/ossUpload.js'
import permision from '@/js_sdk/wa-permission/permission.js'

export default {
  components: {
    Popup,
  },
  name: 'ContractPopup',
  props: {
  },

  data() {
    return {
      uploadOptions: {},
      data: null,
      currentId: '',
      contractData: {},
      uploadField: {
        key: 'contractFiles',
        maxCount: 9,
        maxSize: 10 * 1024 * 1024,
        accept: 'image/*, .pdf'
      },
    }
  },
  mounted() {
  },
  methods: {
    open(data) {
      this.currentId = ''
      console.log('data', data)
      if (data && data.zyPayUrl) {
        const urls = data.zyPayUrl.split(',').filter(url => url.trim())
        this.$set(this.contractData, this.uploadField.key, urls.map(url => ({
          url: url.trim(),
          type: this.getFileTypeFromUrl(url.trim()),
          name: this.getFileNameFromUrl(url.trim()),
          size: 0 // 从字符串无法获取文件大小
        })))
      }
      this.$nextTick(() => {
        this.$refs.popup.open()
      })
    },
    cancel() {
      this.$refs.popup.close()
      this.$emit('cancel')
    },
    close() {
      this.$refs.popup.close()
      this.$emit('close')
    },
    // 处理合同协议上传
    async handleContractUpload(uploadField) {
      // #ifdef APP-PLUS
      const photoLibrary = await permision.requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE')
      const isOnline = await uni.$isNetWork()
      if (photoLibrary != 1) {
        uni.showToast({ title: '您的设备不支持文件选择功能或未授权访问，请前往设置中开启存储权限', icon: 'none' })
        return
      }
      if (!isOnline) {
        uni.showToast({ title: '当前无网络连接，请连接网络后重试', icon: 'none' })
        return
      }
      // #endif

      // 显示操作菜单
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择', '选择文件'],
        success: res => {
          if (res.tapIndex === 0) {
            // 拍照
            this.takePhoto(uploadField)
          } else if (res.tapIndex === 1) {
            // 从相册选择
            this.chooseImageFromAlbum(uploadField)
          } else if (res.tapIndex === 2) {
            // 选择文件(PDF等)
            this.$refs.XeUpload.upload('file', {});
          }
        },
        fail: err => {
          console.log('选择操作失败', err)
        }
      })
    },
    // 拍照
    takePhoto(uploadField) {
      uni.chooseImage({
        count: this.getRemainingCount(uploadField),
        sizeType: ['original'],
        sourceType: ['camera'],
        success: async res => {
          try {
            const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
            for (const file of res.tempFiles) {
              if (file.size > MAX_FILE_SIZE) {
                uni.showToast({ title: '文件大小不能超过10MB', icon: 'none' })
                return
              }
            }
            uni.showLoading({ title: '上传中...', mask: true })

            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              uni.hideLoading()
              this.addContractFile({
                url,
                type: 'image',
                name: this.getFileNameFromPath(res.tempFilePaths[i]),
                size: res.tempFiles[i].size
              })
            }
          } catch (error) {
            console.log('上传图片失败', error)
            uni.showToast({ title: '图片上传失败，请重试', icon: 'none' })
          }
        },
        fail: err => {
          console.log('拍照失败', err)
          uni.hideLoading()
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '拍照失败', icon: 'none' })
          }
        }
      })
    },

    // 从相册选择图片
    chooseImageFromAlbum(uploadField) {
      uni.chooseImage({
        count: this.getRemainingCount(uploadField),
        sizeType: ['original'],
        sourceType: ['album'],
        success: async res => {
          try {
            const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
            for (const file of res.tempFiles) {
              if (file.size > MAX_FILE_SIZE) {
                uni.showToast({ title: '文件大小不能超过10MB', icon: 'none' })
                return
              }
            }
            uni.showLoading({ title: '上传中...', mask: true })

            for (let i = 0; i < res.tempFilePaths.length; i++) {
              const url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              uni.hideLoading()
              this.addContractFile({
                url,
                type: 'image',
                name: this.getFileNameFromPath(res.tempFilePaths[i]),
                size: res.tempFiles[i].size
              })
            }
          } catch (error) {
            console.log('上传图片失败', error)
            uni.showToast({ title: '图片上传失败，请重试', icon: 'none' })
          }
        },
        fail: err => {
          console.log('选择图片失败', err)
          uni.hideLoading()
          if (err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '选择图片失败', icon: 'none' })
          }
        }
      })
    },

    handleUploadCallback(e) {
      console.log('handleUploadCallback', e)

      // 检查回调类型
      if (e.type === 'choose' && e.data && e.data.length > 0) {
        const fileData = e.data[0]

        // 检查文件大小 (10MB限制)
        if (fileData.size > 10 * 1024 * 1024) {
          uni.showToast({ title: '文件大小不能超过10MB', icon: 'none' })
          return
        }

        // 检查文件类型 (只支持PDF)
        if (fileData.type !== 'application/pdf' && !fileData.name.toLowerCase().endsWith('.pdf')) {
          uni.showToast({ title: '只支持PDF文件', icon: 'none' })
          return
        }

        // 开始上传
        uni.showLoading({ title: '上传中...', mask: true })

        // 使用tempFilePath进行上传
        uploadFile(fileData.tempFile, fileData.tempFilePath)
          .then(url => {
            uni.hideLoading()
            console.log('上传成功', url)
            // 添加到合同文件列表
            this.addContractFile({
              url: url,
              type: 'pdf',
              name: fileData.name,
              size: fileData.size
            })
            uni.showToast({ title: '上传成功', icon: 'success' })
          })
          .catch(error => {
            uni.hideLoading()
            console.log('上传文件失败', error)
            uni.showToast({ title: '文件上传失败，请重试', icon: 'none' })
          })
      } else if (e.type === 'error') {
        console.log('上传组件错误', e)
        uni.showToast({ title: '文件选择失败', icon: 'none' })
      }
    },



    // 获取合同文件数组
    getContractFiles() {
      const files = this.contractData[this.uploadField.key]
      return Array.isArray(files) ? files : []
    },

    // 检查是否是PDF文件
    isPdfFile(file) {
      console.log(file,'file')
      if (typeof file === 'object' && file.type) {
        return file.type === 'pdf'
      }
      const url = file.url || file
      const ext = url.split('.').pop().toLowerCase()
      return ext === 'pdf'
    },

    // 获取文件名
    getFileName(file) {
      if (typeof file === 'object' && file.name) {
        return file.name
      }
      const url = file.url || file
      return url.split('/').pop().split('?')[0]
    },

    // 从路径获取文件名
    getFileNameFromPath(path) {
      return path.split('/').pop()
    },
    // 格式化文件大小
    formatFileSize(size) {
      if (size < 1024) {
        return size + 'B'
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + 'KB'
      } else {
        return (size / (1024 * 1024)).toFixed(1) + 'MB'
      }
    },

    // 检查是否达到最大上传数量
    hasReachedMax(uploadField) {
      const files = this.getContractFiles()
      return files.length >= (uploadField.maxCount || 1)
    },

    // 获取剩余可上传数量
    getRemainingCount(uploadField) {
      const files = this.getContractFiles()
      return Math.max(1, (uploadField.maxCount || 1) - files.length)
    },

    // 添加合同文件
    addContractFile(file) {
      if (!Array.isArray(this.contractData[this.uploadField.key])) {
        this.$set(this.contractData, this.uploadField.key, [])
      }
      this.contractData[this.uploadField.key].push(file)
      this.$emit('update:contractData', { ...this.contractData })
    },
    // 删除合同文件
    deleteContractFile(index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这个文件吗？',
        success: res => {
          if (res.confirm) {
            if (Array.isArray(this.contractData[this.uploadField.key])) {
              this.contractData[this.uploadField.key].splice(index, 1)
              if (this.contractData[this.uploadField.key].length === 0) {
                this.$delete(this.contractData, this.uploadField.key)
              }
              this.$emit('update:contractData', { ...this.contractData })
            }
          }
        }
      })
    },

    // 预览文件
    previewFile(file, type) {
      const url = file.url || file
      const fileName = this.getFileName(file)

      // 跳转到预览页面
      uni.navigateTo({
        url: `/pages/common/filePreview?fileUrl=${encodeURIComponent(url)}&fileType=${type}&fileName=${encodeURIComponent(fileName)}`
      })
    },
    // 表单校验方法
    validate() {
      if (this.uploadField.required) {
        const files = this.getContractFiles()
        if (files.length === 0) {
          uni.showToast({ title: `${this.uploadField.label}不能为空`, icon: 'none' })
          return false
        }
      }
      return true
    },
    confirm() {
      if (this.validate) {
        this.$emit('onConfirm', this.contractData)
      }
    },
    getFileTypeFromUrl(url) {
      const ext = url.split('.').pop().toLowerCase()
      return ext === 'pdf' ? 'pdf' : 'image'
    },

    // 从URL获取文件名
    getFileNameFromUrl(url) {
      return url.split('/').pop().split('?')[0] || '未知文件'
    },
  }
}
</script>

<style scoped lang="scss">
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

  .tips {
    display: flex;
    align-items: center;
    font-size: toRpx(28);
    width: 100%;
    height: toRpx(56);
    border-radius: toRpx(8);
    opacity: 1;
    background: #fef5ea;
    // margin: toRpx(16) 0;
    color: #ff9d0a;

    .sprite-icon {
      flex-shrink: 0;
    }

    &-text {
      flex: 1;
    }

    .icon-study-tips {
      margin-right: toRpx(8);
    }
  }

  .popup-body {
    height: calc(100% - #{toRpx(350)});
    padding: 0 toRpx(48);

    .popup-scroll-view {
      height: 100%;
      padding-top: toRpx(24);
    }
  }

  .contract-upload-container {
    margin-top: toRpx(32);

    .upload-item-container {
      align-items: flex-start;
      margin-bottom: toRpx(32);

      .upload-label {
        color: #333333;
        font-size: toRpx(28);
        font-weight: 400;
        display: flex;
        align-items: flex-start;
        margin-right: toRpx(42);
        width: toRpx(180);
        margin-bottom: toRpx(16);
      }

      .requiredLabel {
        color: #f24724;
        font-size: toRpx(28);
        font-weight: 400;
        margin-left: toRpx(8);
      }

      .upload-wrapper {
        display: flex;
        gap: toRpx(16);
        flex: 1;
        flex-wrap: wrap;
      }
    }

    .upload-item {
      height: toRpx(240);
      border-radius: toRpx(12);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      opacity: 1;
      background: #f5f8ff;
      width: toRpx(320);
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

    .uploaded-file-container {
      position: relative;
      height: toRpx(240);
      border-radius: toRpx(12);
      overflow: hidden;
      width: toRpx(320);
    }

    .uploaded-image {
      width: 100%;
      height: 100%;
    }

    .pdf-container {
      width: 100%;
      height: 100%;
      background: #f5f8ff;
      display: flex;
      flex-direction: column;
      padding: toRpx(20);
      box-sizing: border-box;
    }

    .pdf-icon {
      display: flex;
      justify-content: center;
      margin-bottom: toRpx(16);
    }

    .file-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .file-name {
      font-size: toRpx(24);
      color: #333;
      text-align: center;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .file-size {
      font-size: toRpx(20);
      color: #999;
      text-align: center;
      margin-top: toRpx(8);
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
  }
}
</style>
