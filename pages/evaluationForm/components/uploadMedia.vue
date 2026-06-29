<template>
  <view class="upload-grid" :style="gridStyle">
    <view class="flex upload-item-container" :class="{ fullwidth: field.fullwidth }" v-for="field in uploadFields" :key="field.key">
      <view class="upload-label">
        {{ field.label }}
        <text class="requiredLabel" v-if="field.required">*</text>
      </view>
      <view class="upload-images-wrapper" :class="{ flexWarp: field.fullwidth }">
        <!-- 上传按钮，当未达到最大限制时显示 -->
        <view v-if="!hasReachedMax(field)" class="upload-item" @click="handleMediaUpload(field)">
          <view class="upload-placeholder">
            <view class="sprite-icon icon-uploadAdd"></view>
            <text class="upload-text">{{ field.maxCount > 1 ? getMedia(field).length + '/' + field.maxCount : getUploadText(field) }}</text>
          </view>
        </view>
        <!-- 显示已上传的媒体列表 -->
        <view v-for="(media, index) in getMedia(field)" :key="index" class="uploaded-media-container">
          <!-- 图片显示 -->
          <image v-if="field.accept == 'image'" :src="getImageDisplayUrl(media.url || media)" mode="aspectFill" class="uploaded-media" @click.stop="previewMedia(media, 1)"></image>
          <!-- 视频显示 -->
          <view v-else class="video-container" @click.stop="previewMedia(media, 2)">
            <!-- <video :src="media.url || media" mode="aspectFill" controls class="uploaded-media"></video> -->

            <image :src="media.url + videoProcess" mode="aspectFill"></image>
            <view class="video-play-icon">
              <view class="sprite-icon icon-upload-play"></view>
            </view>
          </view>
          <view class="delete-icon" @click.stop="deleteMedia(field.key, index)">
            <view class="sprite-icon icon-icon-circle-error"></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
// import { uploadFile } from '@/utils/ossUploadFile/uploadFile.js'
import { uploadFile } from '@/utils/ossUpload.js'
import { getImageDisplayUrl } from '@/utils/ossImageProcess.js'
import permision from '@/js_sdk/wa-permission/permission.js'

export default {
  name: 'UploadMedia',
  props: {
    // 上传字段配置数组
    uploadFields: {
      type: Array,
      required: true,
      default: () => []
    },
    // 媒体数据对象（统一使用一个变量）
    mediaData: {
      type: Object,
      default: () => ({})
    },
    // 新增：配置upload-grid的列数
    gridColumns: {
      type: Number,
      default: 2
    }
  },
  computed: {
    // 计算grid样式
    gridStyle() {
      return {
        'grid-template-columns': `repeat(${this.gridColumns}, 1fr)`
      }
    }
  },
  data() {
    return {
      videoProcess: '?x-oss-process=video/snapshot,t_7000,f_jpg,w_800,h_600,m_fast'
    }
  },
  methods: {
    getImageDisplayUrl,
    // 处理媒体上传
    async handleMediaUpload(field) {
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
      // 根据字段类型显示不同的操作菜单
      const itemList = []
      if (field.accept === 'image' || !field.accept) {
        itemList.push('拍照', '从相册选择')
      }
      if (field.accept === 'video' || !field.accept) {
        itemList.push('拍摄视频', '从相册选择视频')
      }

      if (itemList.length === 0) {
        itemList.push('选择文件')
      }

      uni.showActionSheet({
        itemList,
        success: res => {
          if (res.tapIndex === 0 && (field.accept === 'image' || !field.accept)) {
            // 拍照
            this.takePhoto(field)
          } else if (res.tapIndex === 1 && (field.accept === 'image' || !field.accept)) {
            // 从相册选择图片
            this.chooseImageFromAlbum(field)
          } else if ((res.tapIndex === 0 && field.accept === 'video') || (res.tapIndex === 2 && !field.accept)) {
            // 拍摄视频
            this.takeVideo(field)
          } else if ((res.tapIndex === 1 && field.accept === 'video') || (res.tapIndex === 3 && !field.accept)) {
            // 从相册选择视频
            this.chooseVideoFromAlbum(field)
          }
        },
        fail: err => {
          console.log('选择操作失败', err)
        }
      })
    },

    // 拍照
    takePhoto(field) {
      uni.chooseImage({
        count: this.getRemainingCount(field),
        sizeType: ['original'],
        sourceType: ['camera'],
        success: async res => {
          console.log('选择图片成功', res)
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
            uni.showLoading({ title: '上传中...', mask: true })
            // 上传所有选择的图片
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              let url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])

              uni.hideLoading()

              // const fileExtension = res.tempFiles[0]?.name ? res.tempFiles[0]?.name.split('.').pop().toLowerCase() : res.tempFiles[0]?.path.split('.').pop().toLowerCase()
              this.addMedia(field, { url, fileFormat: 'png', type: 'image', name: field.label })
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
    chooseImageFromAlbum(field) {
      uni.chooseImage({
        count: this.getRemainingCount(field),
        sizeType: ['original'],
        sourceType: ['album'],
        success: async res => {
          console.log(res, '选择图片')
          try {
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
            for (const file of res.tempFiles) {
              if (file.size > MAX_IMAGE_SIZE) {
                uni.showToast({ title: '图片上传最大10MB', icon: 'none' })
                return
              }
            }
            uni.showLoading({ title: '上传中...', mask: true })
            // 上传所有选择的图片
            for (let i = 0; i < res.tempFilePaths.length; i++) {
              let url = await uploadFile(res.tempFiles[i], res.tempFilePaths[i])
              console.log('上传图片成功', url)
              uni.hideLoading()
              // const fileExtension = res.tempFiles[0]?.name ? res.tempFiles[0]?.name.split('.').pop().toLowerCase() : res.tempFiles[0]?.path.split('.').pop().toLowerCase()
              this.addMedia(field, { url, fileFormat: 'png', type: 'image', name: field.label })
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
            uni.showLoading({ title: '上传中...', mask: true })
            // #ifdef H5
            const url = await uploadFile(res.tempFile, res.tempFilePath)
            // #endif
            // #ifdef APP-PLUS
            const url = await uploadFile(null, res.tempFilePath)
            // #endif
            console.log('上传视频成功', url)
            // const fileExtension = res.name ? res.name.split('.').pop().toLowerCase() : res.tempFilePath.split('.').pop().toLowerCase()
            this.addMedia(field, {
              url,
              type: 'video',
              fileFormat: 'mp4',
              name: field.label,
              duration: res.duration,
              size: res.size
            })
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
            uni.showLoading({ title: '上传中...', mask: true })
            // #ifdef H5
            const url = await uploadFile(res.tempFile, res.tempFilePath)
            // #endif
            // #ifdef APP-PLUS
            const url = await uploadFile(null, res.tempFilePath)
            // #endif

            console.log('上传视频成功', url)
            // const fileExtension = res.name ? res.name.split('.').pop().toLowerCase() : res.tempFilePath.split('.').pop().toLowerCase()
            this.addMedia(field, {
              url,
              type: 'video',
              name: field.label,
              duration: res.duration,
              size: res.size,
              fileFormat: 'mp4'
            })
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

    // 获取指定字段的媒体数组
    getMedia(field) {
      console.log(this.mediaData[field.key])
      // 确保返回的是数组
      return Array.isArray(this.mediaData[field.key]) ? this.mediaData[field.key] : []
    },

    // 检查是否是图片
    isImage(media) {
      // 如果是对象且有type字段，则根据type判断
      if (typeof media === 'object' && media.type) {
        return media.type === 'image'
      }
      // 否则根据文件扩展名判断
      const url = media.url || media
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      const extension = url.split('.').pop().toLowerCase()
      return imageExtensions.includes(extension)
    },

    // 检查是否达到最大上传数量
    hasReachedMax(field) {
      const media = this.getMedia(field)
      return media.length >= (field.maxCount || 1)
    },

    // 获取剩余可上传数量
    getRemainingCount(field) {
      const media = this.getMedia(field)
      return Math.max(1, (field.maxCount || 1) - media.length)
    },

    // 获取上传按钮显示文本
    getUploadText(field) {
      if (field.accept === 'image') {
        return '上传图片'
      } else if (field.accept === 'video') {
        return '上传视频'
      } else {
        return '上传媒体'
      }
    },

    // 添加媒体到对应的数组中（确保响应式更新）
    addMedia(field, media) {
      // 确保字段存在且是数组
      if (!Array.isArray(this.mediaData[field.key])) {
        this.$set(this.mediaData, field.key, [])
      }

      // 添加新媒体
      this.mediaData[field.key].push(media)
      // 触发父组件更新
      console.log('this.mediaData', this.mediaData)
      this.$emit('update:mediaData', { ...this.mediaData })
    },

    // 删除媒体
    deleteMedia(key, index) {
      if (Array.isArray(this.mediaData[key])) {
        uni.showModal({
          title: '提示',
          content: '确定要删除这个媒体文件吗？',
          success: res => {
            if (res.confirm) {
              // 使用splice确保响应式更新
              this.mediaData[key].splice(index, 1)
              // 如果数组为空，可以选择删除该字段
              if (this.mediaData[key].length === 0) {
                this.$delete(this.mediaData, key)
              }
              console.log('删除媒体成功')

              // 触发父组件更新 - 创建新的对象副本
              this.$emit('update:mediaData', { ...this.mediaData })
            }
          }
        })
      }
    },
    previewMedia(media, type) {
      const url = `/pages/boutique/preview?tabName=预览&sourceType=${type}&detailUrl=${media.url || media}`
      uni.navigateTo({
        url: `${url}`
      })
    }
  }
}
</script>
<style scoped lang="scss">
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

.upload-grid {
  display: grid;
  gap: toRpx(24);
  /* 移除固定的grid-template-columns，改为通过内联样式动态设置 */
}

.upload-item-container {
  align-items: flex-start;
  margin-bottom: toRpx(32);
  uni-image {
    width: 100%;
    height: 100%;
  }
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
  .requiredLabel {
    color: #f24724;
    font-size: toRpx(28);
    font-weight: 400;
    margin-left: toRpx(8);
  }
  .upload-images-wrapper {
    display: flex;
    gap: toRpx(16);
    flex: 1;
  }
  .flexWarp {
    flex-wrap: wrap;
  }
  &.fullwidth {
    grid-column: 1 / -1; // 跨越所有列
    .upload-label {
      flex: none;
    }
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
  width: toRpx(240);
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

/* 已上传媒体样式 */
.uploaded-media-container {
  position: relative;
  height: toRpx(240);
  border-radius: toRpx(12);
  overflow: hidden;
  width: toRpx(240);
}

.uploaded-media {
  width: 100%;
  height: 100%;
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
.uploaded-media-container video {
  z-index: 1;
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
</style>
