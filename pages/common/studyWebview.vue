<template>
  <view class="study-webview-container">
    <!-- <view
      class="header"
      @click="back"
    >
      <view class="nav-bar">
        <view class="back">
          <uni-icons
            type="left"
            :size="20"
            color="#000000"
          ></uni-icons>
        </view>
        <view class="title">{{ pageTitle }}</view>
      </view>
    </view> -->
    <view
      class="webview-window"
      v-if="webviewUrl"
    >
      <web-view :src="webviewUrl" @onPostMessage="handlePostMessage"></web-view>
    </view>

    <!-- 全屏 Loading -->
    <view class="loading-overlay" v-if="showLoading">
      <image class="loading-icon" src="../../assets/images/common/loadding.gif" mode="aspectFit" />
    </view>

  </view>
</template>

<script>
export default {
  name: 'StudyWebview',
  data () {
    return {
      webviewUrl: '',
      pageTitle: '学习测评',
      type: null,
      wv: null,
      hotArea: null, // 存储热区对象
      showLoading: true // 控制 loading 显示
    }
  },
  onLoad (options) {
    if (options.pageTitle) {
      this.pageTitle = options.pageTitle
    }
    if (options.url) {
      // 和 detail.vue 一样，直接使用 URL，不需要 decode
      this.webviewUrl = options.url
    }
    if (options.type) {
      this.type = options.type
    }
    console.log('📱 学习中心 webview 接收到的 URL (直接使用):', this.webviewUrl)
    
    // 提取并解码 return_url 部分以便查看
    try {
      const match = this.webviewUrl.match(/return_url=([^&]+)/)
      if (match) {
        const returnUrl = decodeURIComponent(match[1])
        console.log('🎯 return_url 部分 (完全解码，仅用于查看):', returnUrl)
      }
    } catch (e) {
      console.log('⚠️ 解析 return_url 失败')
    }
    
    // 设置 webview 样式
    setTimeout(() => {
      this.setWebviewStyle()
    }, 500)
  },
  mounted() {
    // 在 mounted 时也尝试设置，确保样式生效
    setTimeout(() => {
      this.setWebviewStyle()
      this.createHotArea()
      // this.hideThirdPartyBackButton() // 不隐藏第三方按钮，只用热区拦截点击
    }, 1000)
    
    // 设置超时自动隐藏 loading（防止页面加载失败一直显示 loading）
    setTimeout(() => {
      if (this.showLoading) {
        console.log('⏰ 超时自动关闭 loading')
        this.showLoading = false
      }
    }, 10000) // 10秒后自动关闭
  },
  beforeDestroy() {
    // 销毁热区
    if (this.hotArea) {
      this.hotArea.close()
      this.hotArea = null
    }
  },
  onBackPress(options) {
    if (options.from === 'backbutton') {
      // 阻止默认返回
      this.back()
      return true
    }
    return false
  },
  methods: {
    setWebviewStyle() {
      // 参照 detail.vue，设置 webview 样式
      const setWebviewStyleWithRetry = () => {
        console.log('尝试设置 webview 样式')
        try {
          const currentWebview = this.$scope.$getAppWebview()
          const wv = currentWebview.children()[0]
          console.log('webview 对象:', wv)
          
          if (wv) {
            this.wv = wv
            // 设置 webview 从导航栏下方开始显示
            wv.setStyle({
              top: '26',      // 状态栏(48) + 导航栏(88) = 136rpx 转换为 68px
              left: '0',
              width: '100%',
              height: '724'  // 减去顶部导航栏高度
            })
            console.log('✅ webview 样式设置成功')
            
            // 监听 webview 加载完成事件
            wv.addEventListener('loaded', () => {
              console.log('✅ webview 加载完成，关闭 loading')
              setTimeout(() => {
                this.showLoading = false
              }, 300)
            }, false)
            
            return true
          } else {
            console.log('⚠️ 未找到 webview 对象')
            return false
          }
        } catch (error) {
          console.error('❌ 设置 webview 样式失败:', error)
          return false
        }
      }

      // 尝试设置，如果失败则重试
      let retryCount = 0
      const maxRetries = 5
      const retry = () => {
        if (!setWebviewStyleWithRetry() && retryCount < maxRetries) {
          retryCount++
          console.log(`重试设置 webview 样式 (${retryCount}/${maxRetries})`)
          setTimeout(retry, 300)
        }
      }
      retry()
    },
    back () {
      console.log('触发返回，发送事件')
      const {type } = this
      console.log(type, 'type')
      // 先返回上一页
      uni.navigateBack({
        success: () => {
          console.log('返回成功，触发弹窗事件')
          uni.$logger.local.info('返回成功，触发弹窗事件', type)
          // 延迟触发事件，确保页面已经返回
          setTimeout(() => {
            if (type == 0) {
              uni.$emit('levelStudyPopup')
            } else if (type == 1) {
              uni.$emit('afterStudyPopup')
            }
            // uni.$emit('showExamSubmitPopup')
            // uni.$emit('showStudyPopup', {
            //   type: 'examSubmit'
            // })
          }, 100)
        }
      })
    },
    // 处理 webview 发送的消息
    handlePostMessage(e) {
      console.log('📨 收到 webview 消息:', e)
      // webview 加载完成后隐藏 loading
      if (this.showLoading) {
        setTimeout(() => {
          console.log('✅ webview 消息触发，关闭 loading')
          this.showLoading = false
        }, 500)
      }
    },
    // 创建透明热区覆盖在返回按钮位置，拦截点击事件
    createHotArea() {
      // #ifdef APP-PLUS
      try {
        // 获取系统状态栏高度
        const statusBarHeight = plus.navigator.getStatusbarHeight()
        
        // 创建一个透明的原生 View 作为热区
        // 覆盖在第三方页面左上角返回按钮的位置
        this.hotArea = new plus.nativeObj.View('hotArea', {
          top: statusBarHeight + 'px', // 状态栏下方
          left: '0px',
          width: '120px', // 热区宽度
          height: '88px', // 热区高度（导航栏高度）
          backgroundColor: 'rgba(0,0,0,0)' // 完全透明
        })
        
        // 监听热区点击事件
        this.hotArea.addEventListener('click', () => {
          console.log('🎯 热区被点击，触发返回')
          this.back()
        }, false)
        
        // 显示热区
        this.hotArea.show()
        console.log('✅ 已创建返回按钮热区')
      } catch (error) {
        console.error('❌ 创建热区失败:', error)
      }
      // #endif
    }
  }
}
</script>

<style scoped lang="scss">

.header {

  z-index: 999999999;
  background-size: 100% 100%;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  
  .nav-bar {
    width: 100%;
    height: toRpx(88);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .back {
      position: absolute;
      left: toRpx(32);
      display: flex;
      align-items: center;
      justify-content: center;
      width: toRpx(48);
      height: toRpx(48);
    }
    
    .title {
      color: #333333;
      font-size: toRpx(36);
      font-weight: 500;
      text-align: center;
    }
  }
}

.webview-window {
  // webview 样式通过原生 setStyle 方法设置
  // 这里只是占位，实际样式由 setWebviewStyle() 控制
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  
  .loading-icon {
    width: toRpx(100);
    height: toRpx(100);
  }
}
</style>

