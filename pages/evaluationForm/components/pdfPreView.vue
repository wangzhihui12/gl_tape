<template>
  <view class="material-detail">
    <!-- App+html+保存：顶部通栏大按钮 + 可选标题，无返回；其它：返回+标题+右上角保存 -->
    <view class="nav-chrome">
      <template v-if="appHtmlFullSaveMode">

        <view class="nav-app-html-tool">
          <view
            class="nav-app-html-tool__btn"
            hover-class="nav-app-html-tool__btn--hover"
            @click.stop="saveReportImage"
            @tap.stop="saveReportImage"
          >保存图片</view>
        </view>
      </template>
      <view v-else class="nav-bar">
        <view class="nav-leading">
          <view class="back" @click.stop="back" @tap.stop="back">
            <uni-icons type="left" :size="20" color="#000"></uni-icons>
          </view>
        </view>
        <view class="nav-title">{{ title }}</view>
        <view
          v-if="showSaveEntry"
          class="nav-save-hit"
          @click.stop="saveReportImage"
          @tap.stop="saveReportImage"
          @longpress.stop="saveReportImage"
        >
          <view class="nav-save-btn">保存图片</view>
        </view>
      </view>
    </view>
    <web-view
      v-if="fileUrltype === 'html' && isAppClient"
      :src="previewUrl"
      :webview-styles="htmlWebviewInsetStyle"
    ></web-view>
    <view
      v-else-if="fileUrltype === 'html' && !isAppClient"
      class="html-webview-shell"
      :style="htmlWebviewShellStyle"
    >
      <web-view :src="previewUrl"></web-view>
    </view>
    <view v-else-if="fileUrltype !== 'pdf'">
      <lk-preview-office :url="previewUrl" :fileType="fileType"></lk-preview-office>
    </view>
    <view v-else>
      <lk-preview-office :url="previewUrl" fileType="pdf"></lk-preview-office>
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
import { report } from '@/mixin/index.js'
export default {
  name: '',
  mixins: [report],
  data () {
    return {
      previewUrl: '',
      title: '',
      fileType: 'pdf',
      Signature: true,
      fileUrltype:'pdf',
      showSaveBtn: false,
      reportImageUrl: '',
      /** 实测 .nav-bar 底边到窗口顶的距离(px)，用于对齐子 webview，避免 rpx 换算与 App 坐标系不一致出现大块白条 */
      measuredNavBottomPx: 0
    }
  },
  onLoad (options) {
    console.log(options)
    this.fileUrltype = options.fileUrltype || 'pdf'
    this.fileType = options.fileType || 'pdf'
    this.Signature = options.Signature === 'false' ? false : (options.Signature || true);
    if(this.fileType === 'docx') {
      this.previewUrl = options.fileUrl
    }else if(!this.Signature) {
      this.previewUrl = options.fileUrl
    }else {
      this.previewUrl = options.fileUrl + '&OSSAccessKeyId='+ options.OSSAccessKeyId + '&Signature=' + options.Signature
    }

    this.title = options.fileName
    // 来自报告管理的额外参数：是否显示保存按钮 & 报告图片地址
    this.showSaveBtn = options.showSaveBtn === '1'
    const rawImg = options.reportImageUrl
    if (rawImg != null && String(rawImg).trim() !== '') {
      try {
        this.reportImageUrl = decodeURIComponent(String(rawImg).trim())
      } catch (e) {
        this.reportImageUrl = String(rawImg).trim()
      }
    } else {
      this.reportImageUrl = ''
    }
    console.log(this.previewUrl)
    // else this.setWv()
  },
  computed: {
    /** 报告管理：showSaveBtn=1 且 reportImageUrl 有值才显示保存 */
    showSaveEntry () {
      return this.showSaveBtn && !!this.reportImageUrl
    },
    /** App+html+保存：顶部通栏大按钮，无返回 icon */
    appHtmlFullSaveMode () {
      return this.showSaveEntry && this.isAppClient && this.fileUrltype === 'html'
    },
    /** 未测到布局前：与 .nav-chrome（含通栏工具条）高度兜底一致 */
    htmlReportNavTopPx () {
      const sys = uni.getSystemInfoSync()
      const r = sys.windowWidth / 750
      const topOffset = Math.ceil(48 * r)
      if (this.appHtmlFullSaveMode) {
        const titleH = this.title ? Math.ceil(72 * r) : 0
        const toolH = Math.ceil((12 + 88 + 16) * r)
        return topOffset + titleH + toolH
      }
      return Math.ceil((48 + 96) * r)
    },
    /** 子 web-view 的 top：优先用实测导航栏底边，消除「预留导航」与真机之间的多余白缝 */
    effectiveHtmlWebviewTopPx () {
      return this.measuredNavBottomPx > 0 ? this.measuredNavBottomPx : this.htmlReportNavTopPx
    },
    isAppClient () {
      return typeof plus !== 'undefined'
    },
    /**
     * 仅 App 生效：传给原生 web-view 的初始位置/尺寸，把内容整体下移，露出上方自定义导航栏。
     * H5/小程序里 plus 不存在，返回 {}，改由 htmlWebviewShellStyle 外壳限制区域。
     */
    htmlWebviewInsetStyle () {
      if (this.fileUrltype !== 'html' || !this.isAppClient) {
        return {}
      }
      const sys = uni.getSystemInfoSync()
      const topPx = this.effectiveHtmlWebviewTopPx
      const h = Math.max(0, Math.floor(sys.windowHeight - topPx))
      return {
        // top 必须为 topPx：top=0 时子 web-view 盖住导航栏，保存/返回点击无响应
        top: topPx,
        left: 0,
        width: sys.windowWidth,
        height: h
      }
    },
    /** H5：fixed 外壳把 iframe 限制在导航下方 */
    htmlWebviewShellStyle () {
      if (this.fileUrltype !== 'html' || this.isAppClient) {
        return {}
      }
      const topPx = this.effectiveHtmlWebviewTopPx
      return {
        position: 'fixed',
        left: '0',
        right: '0',
        top: `${topPx}px`,
        bottom: '0',
        zIndex: 1
      }
    }
  },
  onReady () {
    this.measureNavBarForWebview()
  },
  mounted () {
    if (this.fileUrltype === 'html' && this.isAppClient) {
      this.$nextTick(() => {
        setTimeout(() => this.applyHtmlWebviewInset(), 200)
      })
    }
  },
  methods: {
    back () {
      uni.navigateBack({
        delta: 1,
        animationType: 'pop-out',
        animationDuration: 100
      })
    },
    measureNavBarForWebview () {
      if (this.fileUrltype !== 'html') return
      const run = () => {
        uni.createSelectorQuery()
          .in(this)
          .select('.nav-chrome')
          .boundingClientRect(rect => {
            if (!rect || rect.bottom <= 0) return
            const bottom = Math.ceil(rect.bottom)
            if (bottom === this.measuredNavBottomPx) return
            this.measuredNavBottomPx = bottom
            if (this.isAppClient) {
              this.$nextTick(() => this.applyHtmlWebviewInset())
            }
          })
          .exec()
      }
      this.$nextTick(() => {
        run()
        setTimeout(run, 80)
        setTimeout(run, 300)
      })
    },
    saveReportImage () {
      if (!this.reportImageUrl) {
        uni.showToast({ title: '暂无可保存的图片', icon: 'none' })
        return
      }
      uni.showLoading({ title: '保存中...', mask: true })
      uni.downloadFile({
        url: this.reportImageUrl,
        success: res => {
          if (res.statusCode === 200 && res.tempFilePath) {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({ title: '已保存到相册', icon: 'none' })
              },
              fail: err => {
                console.warn('saveImageToPhotosAlbum', err)
                uni.showToast({
                  title: (err && err.errMsg) || '保存失败，请检查相册权限',
                  icon: 'none'
                })
              },
              complete: () => {
                uni.hideLoading()
              }
            })
          } else {
            uni.hideLoading()
            uni.showToast({ title: '图片下载失败', icon: 'none' })
          }
        },
        fail: err => {
          uni.hideLoading()
          console.warn('downloadFile', err)
          uni.showToast({
            title: (err && err.errMsg) || '图片下载失败',
            icon: 'none'
          })
        }
      })
    },
    /** App html 报告：原生子 webview 与 htmlWebviewInsetStyle 数值对齐 */
    applyHtmlWebviewInset () {
      if (this.fileUrltype !== 'html' || !this.isAppClient) return
      const sys = uni.getSystemInfoSync()
      const topPx = this.effectiveHtmlWebviewTopPx
      const h = Math.max(0, Math.floor(sys.windowHeight - topPx))
      const trySet = () => {
        try {
          const currentWebview = this.$scope.$getAppWebview()
          const kids = currentWebview.children()
          let wv = null
          for (let i = 0; i < kids.length; i++) {
            const c = kids[i]
            if (c && typeof c.setStyle === 'function' && typeof c.draw === 'function') {
              wv = c
              break
            }
          }
          if (wv) {
            wv.setStyle({
              top: String(topPx),
              left: '0',
              width: String(sys.windowWidth),
              height: String(h)
            })
            return true
          }
        } catch (e) {
          console.warn('applyHtmlWebviewInset', e)
        }
        return false
      }
      const retry = (n = 0) => {
        if (trySet() || n > 30) return
        setTimeout(() => retry(n + 1), 50)
      }
      retry()
    },
    setWebviewStyle () {
      const setWebviewStyleWithRetry = () => {
        const currentWebview = this.$scope.$getAppWebview()
        let [wv] = currentWebview.children(),
          wvFlag = false
        if (wv) {
          wv.setStyle({
            left: '71.9%',
            top: '17.18%',
            height: '82.82%',
            width: '28.3%'
          })
          wvFlag = true;
        }
        return wvFlag
      }
      const retrySetWebviewStyle = () => {
        if (!setWebviewStyleWithRetry()) {
          // 如果未成功，继续重试
          setTimeout(retrySetWebviewStyle, 50);
        } else {
          // 成功设置样式，结束循环
          console.log('Webview样式设置成功');
        }
      };

      setTimeout(retrySetWebviewStyle, 100);
    }
  }
}
</script>

<style scoped lang="scss">
.nav-chrome {
  position: fixed;
  left: 0;
  top: toRpx(48);
  width: 100%;
  z-index: 999999;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-app-html-title {
  padding: toRpx(20) toRpx(40) toRpx(8);
  text-align: center;
  font-size: toRpx(30);
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-app-html-tool {
  padding: toRpx(12) toRpx(32) toRpx(20);
}
.nav-app-html-tool__btn {
  width: toRpx(188);
  height: toRpx(88);
  line-height: toRpx(88);
  text-align: center;
  border-radius: toRpx(44);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  color: #ffffff;
  font-size: toRpx(28);
  font-weight: 600;
}
.nav-app-html-tool__btn--hover {
  opacity: 0.9;
}
.nav-bar {
  position: relative;
  width: 100%;
  height: toRpx(96);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: toRpx(32);
  color: #1a1a1a;
}
.nav-leading {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 56%;
  padding-left: toRpx(8);
  box-sizing: border-box;
}
.back {
  flex-shrink: 0;
  width: toRpx(88);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  flex: 0 1 auto;
  max-width: 52%;
  min-width: 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 不参与点击检测，避免透明区域盖住右侧「保存」导致 App 上只有保存无响应 */
  pointer-events: none;
}
/* 扩大可点区域并提高层级，避免被标题层或 transform 命中异常挡住 */
.nav-save-hit {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  padding: 0 toRpx(16) 0 toRpx(24);
  box-sizing: border-box;
}
.nav-save-btn {
  padding: 0 toRpx(24);
  height: toRpx(64);
  line-height: toRpx(64);
  border-radius: toRpx(32);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  color: #ffffff;
  font-size: toRpx(24);
}
.nav-title {
  max-width: 60%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-save-btn {
  position: absolute;
  right: toRpx(24);
  top: 50%;
  transform: translateY(-50%);
  padding: 0 toRpx(24);
  height: toRpx(64);
  line-height: toRpx(64);
  border-radius: toRpx(32);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  color: #ffffff;
  font-size: toRpx(24);
}
.nav-title {
  max-width: 60%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-save-btn {
  position: absolute;
  right: toRpx(24);
  top: 50%;
  transform: translateY(-50%);
  padding: 0 toRpx(24);
  height: toRpx(64);
  line-height: toRpx(64);
  border-radius: toRpx(32);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  color: #ffffff;
  font-size: toRpx(24);
}
.file-box {
  position: fixed;
  top: 5.2vh;
  height: 94.8vh;
  left: 0;
  width: 100vw;
}
.html-webview-shell {
  width: 100%;
  height: 100%;
}
.html-webview-shell ::v-deep iframe,
.html-webview-shell ::v-deep .uni-webview--fullscreen {
  width: 100% !important;
  height: 100% !important;
}
.has-ai {
  width: 71.36vw;
}
.AI-window {
  width: 28.3vw;
  height: 90.63vh;
  position: fixed;
  top: 9.37vh;
  right: 0;
  background: #f5f9ff;
  .AI-title {
    height: 5.73vh;
    padding-top: 2.08vh;
    font-size: toRpx(34);
    font-weight: 500;
    justify-content: center;
    color: #333333;
  }
}
</style>
