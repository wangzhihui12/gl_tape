<template>
  <view class="file-preview-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack" @tap="goBack">
        <uni-icons type="arrow-left" size="20" color="#fff"></uni-icons>
      </view>
      <view class="nav-title">{{ fileName || getDefaultTitle() }}</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 预览内容区域 -->
    <view class="preview-container">
      <!-- 图片预览 -->
      <view v-if="fileType === 1" class="image-preview">
        <image :src="fileUrl" mode="aspectFit" class="preview-image" @load="onImageLoad" @error="onImageError" />
      </view>

      <!-- 视频预览 -->
      <view v-else-if="fileType === 2" class="video-preview">
        <video :src="fileUrl" controls autoplay class="preview-video" object-fit="contain" style="width: 100%; height: 100%"></video>
      </view>

      <!-- PDF预览 -->
      <view v-else-if="fileType === 3" class="pdf-preview">
        <!-- <web-view :src="fileUrl" class="pdf-webview"></web-view> -->
        <lk-preview-office :url="fileUrl" fileType="pdf"></lk-preview-office>
      </view>

      <!-- 加载中状态 -->
      <view v-else class="loading-container">
        <view class="spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FilePreview',
  data() {
    return {
      fileUrl: '',
      fileType: 1, // 1: 图片, 2: 视频, 3: PDF
      fileName: '',
      loading: true,
      error: false
    }
  },
  onLoad(options) {
    // 从路由参数获取文件信息
    if (options.fileUrl) {
      this.fileUrl = decodeURIComponent(options.fileUrl)
    }
    if (options.fileType) {
      this.fileType = parseInt(options.fileType)
    }
    if (options.fileName) {
      this.fileName = decodeURIComponent(options.fileName)
    }

    console.log('预览文件信息:', {
      url: this.fileUrl,
      type: this.fileType,
      name: this.fileName
    })
  },
  methods: {
    goBack() {
      console.log('返回按钮被点击')
      // 使用 setTimeout 确保事件处理完成
      setTimeout(() => {
        uni.navigateBack({
          delta: 1,
          success: () => {
            console.log('navigateBack 成功')
          },
          fail: err => {
            console.log('navigateBack失败:', err)
            // 如果没有上一级页面，跳转到首页
            this.goToHomePage()
          }
        })
      }, 100)
    },

    goToHomePage() {
      console.log('跳转到首页')
      // 请根据你的实际首页路径修改
      const homePage = '/pages/index/index'

      // 使用 redirectTo 而不是 reLaunch 避免页面栈问题
      uni.redirectTo({
        url: homePage,
        fail: () => {
          // 如果 redirectTo 失败，尝试 switchTab
          uni.switchTab({
            url: homePage,
            fail: () => {
              console.log('所有跳转方式都失败了')
              // 最后尝试 reLaunch
              uni.reLaunch({
                url: homePage
              })
            }
          })
        }
      })
    },

    getDefaultTitle() {
      const titles = {
        1: '图片预览',
        2: '视频预览',
        3: '文档预览'
      }
      return titles[this.fileType] || '文件预览'
    },

    onImageLoad() {
      this.loading = false
      console.log('图片加载成功')
    },

    onImageError(e) {
      this.loading = false
      this.error = true
      console.error('图片加载失败:', e)
      uni.showToast({
        title: '图片加载失败',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.file-preview-page {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  position: relative;
}

.nav-bar {
  height: toRpx(88);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.8);
  padding: 0 toRpx(32);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  /* 移除 backdrop-filter 避免可能的渲染问题 */

  .nav-back {
    width: toRpx(60);
    height: toRpx(60);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    z-index: 10000;
    position: relative;
    /* 添加 pointer-events 确保可点击 */
    pointer-events: auto;
  }

  .nav-title {
    color: #fff;
    font-size: toRpx(32);
    font-weight: 500;
    flex: 1;
    text-align: center;
    margin: 0 toRpx(60);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-placeholder {
    width: toRpx(60);
  }
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  margin-top: toRpx(88); /* 为固定导航栏留出空间 */
  z-index: 1;
  /* 确保内容不会阻挡导航栏 */
  pointer-events: auto;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }
}

.video-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .preview-video {
    width: 100%;
    height: 100%;
  }
}

.pdf-preview {
  width: 100%;
  height: 100%;

  .pdf-webview {
    width: 100%;
    height: 100%;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;

  .spinner {
    width: toRpx(80);
    height: toRpx(80);
    border: toRpx(4) solid rgba(255, 255, 255, 0.3);
    border-top: toRpx(4) solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: toRpx(20);
  }

  .loading-text {
    font-size: toRpx(28);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .nav-bar {
    height: toRpx(80);
    padding: 0 toRpx(24);
  }

  .nav-title {
    font-size: toRpx(28);
  }

  .nav-back,
  .nav-placeholder {
    width: toRpx(50);
    height: toRpx(50);
  }

  .preview-container {
    margin-top: toRpx(80);
  }
}
</style>
