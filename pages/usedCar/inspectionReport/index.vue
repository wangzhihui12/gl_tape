<!--
 * App：:fullscreen="false" 时必须同时给出 webview-styles 的 top/left/width/height(px)，
 * 否则子 webview 会缩在左上角一小块；再用 setStyle 重试对齐实测导航栏底边。
 * 原生子 webview：setStyle 用显式 top/left/width/height（不用 bottom）。部分机型 top+bottom 推算高度小于父层，肉眼短一截。
 * 子 webview height = ceil(根窗口可视高) + slop（真机上不减 top；top 由 setStyle 单独指定）。
 * @FilePath: /gl_tape/pages/usedCar/inspectionReport/index.vue
-->
<template>
  <view class="inspection-page" :class="{ 'layout-debug': layoutDebug }">
    <view class="header">
      <view class="nav-bar" @click="back">
        <view class="back">
          <uni-icons type="left" :size="20" color="#000000"></uni-icons>
        </view>
        <view class="title">{{ title }}</view>
      </view>
    </view>
    <view class="ai-window" v-if="webviewUrl" :style="aiWindowInsetStyle">
      <web-view
        class="ai-window-wv"
        :src="webviewUrl"
        :fullscreen="false"
        :webview-styles="appWebviewStyles"
        @message="handleMessage"
      ></web-view>
    </view>
    <view v-if="layoutDebug" class="layout-debug-panel" :style="layoutDebugPanelStyle">
      <view class="layout-debug-title">布局调试（贴在标题下，不占底部布局；此前 fixed+底边会盖住 webview）</view>
      <view>页面 windowHeight: {{ debugSys.windowHeight != null ? debugSys.windowHeight + 'px' : '—' }}（见下方说明）</view>
      <view>screenHeight: {{ debugSys.screenHeight != null ? debugSys.screenHeight : '—' }} statusBar: {{ debugSys.statusBarHeight != null ? debugSys.statusBarHeight + 'px' : '—' }}</view>
      <view>header 实测 top→bottom: {{ headerDebugText }}</view>
      <view>header 高度(height): {{ headerHeightText }}</view>
      <view>ai-window 容器: {{ aiWindowDebugText }}</view>
      <view>webview_styles: top={{ webviewStylesText.top }} h={{ webviewStylesText.height }} w={{ webviewStylesText.width }}</view>
      <view>原生 setStyle: {{ nativeStyleText }}</view>
      <view class="layout-debug-hint">{{ layoutHeightHint }}</view>
    </view>
  </view>
</template>

<script>
import { venusUsedcarH5BaseUrl, venusUsedcarH5CarInfoBaseUrl } from '@/env.js'

export default {
  name: 'InspectionReport',
  data() {
    return {
      webviewUrl: '',
      title: '检测报告',
      measuredHeaderBottomPx: 0,
      /** 实测 .ai-window 像素框，与原生子 webview setStyle 共用，避免 windowHeight 与布局不一致 */
      measuredWebviewFrame: null,
      /** 设为 true 开启日志与浅色标记；勿长期开，易与 inset 调试样式混淆真机留白 */
      layoutDebug: false,
      debugSys: {},
      debugHeaderRect: null,
      debugNativeWebviewStyle: null,
      /** 在 ceil(根窗口高) 上再加的像素，默认 0 */
      nativeWebviewHeightSlopPx: 0
    }
  },
  computed: {
    layoutHeightHint() {
      return 'windowHeight：uni 文档为「可使用窗口高度」；App 端一般指当前页面 webview 可视区域高度，通常不含状态栏占用高度。header/webview 的 boundingClientRect 相对该可视区域，top=0 在内容区顶边（多在状态栏下方）。'
    },
    headerDebugText() {
      const r = this.debugHeaderRect
      return r ? `${r.top} → ${r.bottom}` : '—'
    },
    headerHeightText() {
      const r = this.debugHeaderRect
      return r ? `${r.height}px` : '—'
    },
    aiWindowDebugText() {
      const f = this.measuredWebviewFrame
      return f ? `top ${f.top} 高 ${f.height} 宽 ${f.width}` : '—'
    },
    webviewStylesText() {
      const s = this.appWebviewStyles
      if (!s || !Object.keys(s).length) return { top: '—', height: '—', width: '—' }
      return {
        top: s.top,
        height: s.height,
        width: s.width
      }
    },
    nativeStyleText() {
      const n = this.debugNativeWebviewStyle
      if (!n) return '—'
      const b = n.bottom != null && n.bottom !== '' ? n.bottom : '—'
      return `top=${n.top} bottom=${b} h=${n.height} w=${n.width}`
    },
    /** 调试条放标题栏下方，避免 position:fixed + bottom:0 叠在整页最上层挡住 ai-window 底边 */
    layoutDebugPanelStyle() {
      return {
        top: `${this.webviewTopPx}px`,
        bottom: 'auto'
      }
    },
    isApp() {
      return typeof plus !== 'undefined'
    },
    webviewTopPx() {
      if (this.measuredHeaderBottomPx > 0) return this.measuredHeaderBottomPx
      const sys = uni.getSystemInfoSync()
      return Math.ceil(sys.windowHeight * 0.1)
    },
    /**
     * .ai-window 仅占「根窗 − 顶栏」区域；原生子 webview height 另用 nativeSubWebviewHeightPx（整窗高 + slop）。
     */
    aiWindowInsetStyle() {
      const sys = uni.getSystemInfoSync()
      const topPx = this.webviewTopPx
      const winH = this.usableWindowHeightFloat(sys)
      const h = Math.max(0, Math.floor(winH - topPx))
      return {
        top: `${topPx}px`,
        height: `${h}px`,
        bottom: 'auto'
      }
    },
    appWebviewStyles() {
      if (!this.isApp) return {}
      const sys = uni.getSystemInfoSync()
      const frame = this.measuredWebviewFrame
      if (frame && frame.height > 0) {
        const topPx = frame.top
        const cw = this.contentWidthPx(sys)
        const w = cw > 0 ? cw : frame.width
        const h = this.nativeSubWebviewHeightPx(sys)
        return {
          top: `${topPx}px`,
          left: '0px',
          width: `${w}px`,
          height: `${h}px`
        }
      }
      const topPx = this.webviewTopPx
      const h = this.nativeSubWebviewHeightPx(sys)
      const ww = this.contentWidthPx(sys) || sys.windowWidth || 0
      return {
        top: `${topPx}px`,
        left: '0px',
        width: `${ww}px`,
        height: `${h}px`
      }
    }
  },
  created() {
    try {
      this.debugSys = uni.getSystemInfoSync() || {}
    } catch (e) {
      this.debugSys = {}
    }
  },
  onLoad(options) {
    const isCarInfo = options.h5Entry === 'carInfo'
    if (options.pageTitle) {
      this.title = options.pageTitle
    } else if (isCarInfo) {
      this.title = '车况信息'
    }
    const baseUrl = isCarInfo ? venusUsedcarH5CarInfoBaseUrl : venusUsedcarH5BaseUrl
    if (!baseUrl || typeof baseUrl !== 'string') {
      uni.showToast({
        title: isCarInfo ? '车况信息地址未配置' : '检测报告地址未配置',
        icon: 'none'
      })
      return
    }
    const userInfo = uni.$storage.get('userInfo') || {}
    if (isCarInfo) {
      const sessionId = uni.$storage.get('sessionId') || ''
      const str = v => (v == null || v === '' ? '' : String(v))
      const params = {
        source: '1',
        sessionId,
        phone: str(userInfo.phone || userInfo.mobile),
        operator: str(userInfo.name),
        operatorId: str(userInfo.uuid),
        conversionUserId: str(userInfo.uuid),
        conversionName: str(userInfo.name),
        conversionMerchantId: str(userInfo.merchantId),
        conversionMerchantName: str(userInfo.merchantName),
        merchantId: str(userInfo.shopMerchantId),
        merchantName: str(userInfo.shopMerchantName)
      }
      const qs = Object.keys(params)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&')
      const token = userInfo.token || ''
      const sep = baseUrl.includes('?') ? '&' : '?'
      this.webviewUrl = token
        ? `${baseUrl}${sep}${qs}&token=${encodeURIComponent(token)}`
        : `${baseUrl}${sep}${qs}`
    } else {
      const token = userInfo.token || ''
      const sep = baseUrl.includes('?') ? '&' : '?'
      this.webviewUrl = token ? `${baseUrl}${sep}token=${encodeURIComponent(token)}` : baseUrl
    }
  },
  onReady() {
    this.measureHeaderThenInset()
    this.logLayoutMetrics('onReady')
    if (this.isApp) {
      this.$nextTick(() => {
        this.measureWebviewFrameThenApply()
        ;[120, 400, 800, 1500, 2500].forEach(ms =>
          setTimeout(() => this.measureWebviewFrameThenApply(), ms)
        )
      })
    }
  },
  onShow() {
    if (this.isApp && this.webviewUrl) {
      this.$nextTick(() => this.measureWebviewFrameThenApply())
    }
  },
  onBackPress(options) {
    if (options.from === 'backbutton') {
      this.back()
      return true
    }
    return false
  },
  onResize() {
    this.measureHeaderThenInset()
    if (this.isApp) {
      this.$nextTick(() => this.measureWebviewFrameThenApply())
    }
  },
  methods: {
    logLayoutMetrics(tag) {
      if (!this.layoutDebug) return
      const sys = uni.getSystemInfoSync() || {}
      const payload = {
        tag,
        系统信息: {
          screenHeight: sys.screenHeight,
          windowHeight: sys.windowHeight,
          windowWidth: sys.windowWidth,
          statusBarHeight: sys.statusBarHeight,
          safeArea: sys.safeArea,
          safeAreaInsets: sys.safeAreaInsets
        },
        文档含义: {
          windowHeight:
            '可使用窗口高度；App 多为页面 webview 可视区域高度，一般不含状态栏本身高度（内容从状态栏下算起）',
          screenHeight: '屏幕高度',
          statusBarHeight: '状态栏高度',
          boundingClientRect:
            '相对可视布局视口，通常顶部从 webview 内容区顶边起算（y=0 常在状态栏下方）'
        },
        header实测: this.debugHeaderRect,
        measuredHeaderBottomPx: this.measuredHeaderBottomPx,
        aiWindow容器: this.measuredWebviewFrame,
        webviewTopPx: this.webviewTopPx,
        appWebviewStyles: this.appWebviewStyles,
        原生setStyle: this.debugNativeWebviewStyle
      }
      console.log('[inspectionReport 布局]', JSON.stringify(payload, null, 2))
    },
    /** 根 webview 高度（浮点），用于 ceil(剩余高) 对齐真机子 webview 绘制 */
    getRootWebviewHeightFloat() {
      if (typeof plus === 'undefined') return 0
      try {
        const cur = this.$scope && this.$scope.$getAppWebview && this.$scope.$getAppWebview()
        if (!cur || typeof cur.getStyle !== 'function') return 0
        const st = cur.getStyle()
        if (!st || st.height == null) return 0
        const n = parseFloat(String(st.height).replace(/px$/i, ''))
        return Number.isFinite(n) && n > 0 ? n : 0
      } catch (e) {
        return 0
      }
    },
    usableWindowHeightFloat(sys) {
      let h = Number((sys && sys.windowHeight) || 0)
      try {
        if (typeof uni.getWindowInfo === 'function') {
          const w = uni.getWindowInfo()
          if (w && Number(w.windowHeight) > 0) h = Math.max(h, Number(w.windowHeight))
        }
      } catch (e) {
        /* ignore */
      }
      const rh = this.getRootWebviewHeightFloat()
      if (rh > 0) h = Math.max(h, rh)
      return h
    },
    /** 与 systemInfo.windowWidth 对齐，避免 rect.width 多 1px */
    contentWidthPx(sys) {
      const w = Math.round((sys && sys.windowWidth) || 0)
      return w > 0 ? w : 0
    },
    /**
     * 原生子 webview 的 height：ceil(根窗口可视高) + slop；不减 topPx（与 top 组合在目标机型上正常）。
     */
    nativeSubWebviewHeightPx(sys) {
      const winH = this.usableWindowHeightFloat(sys)
      const raw = Math.max(0, winH)
      const slop = Math.max(0, Number(this.nativeWebviewHeightSlopPx) || 0)
      return Math.max(0, Math.ceil(raw - 1e-6) + slop)
    },
    back() {
      if (this.isApp) {
        try {
          const cur = this.$scope.$getAppWebview()
          this.pickSubWebviews(cur).forEach(sub => {
            if (sub && typeof sub.close === 'function') {
              sub.close()
            }
          })
          if (cur && typeof cur.close === 'function') {
            cur.close()
            return
          }
        } catch (e) {
          /* ignore */
        }
      }
      uni.navigateBack()
    },
    measureHeaderThenInset() {
      const run = () => {
        uni.createSelectorQuery()
          .in(this)
          .select('.header')
          .boundingClientRect(rect => {
            if (!rect || rect.bottom <= 0) return
            if (this.layoutDebug) {
              this.debugHeaderRect = {
                top: Math.round(rect.top),
                bottom: Math.round(rect.bottom),
                height: Math.round(rect.height),
                width: Math.round(rect.width)
              }
            }
            const bottom = Math.ceil(rect.bottom)
            if (bottom === this.measuredHeaderBottomPx) return
            this.measuredHeaderBottomPx = bottom
            this.logLayoutMetrics('header')
            this.$nextTick(() => {
              this.measureWebviewFrameThenApply()
            })
          })
          .exec()
      }
      this.$nextTick(() => {
        run()
        setTimeout(run, 80)
        setTimeout(run, 250)
      })
    },
    measureWebviewFrameThenApply() {
      if (!this.webviewUrl) return
      this.$nextTick(() => {
        const q = uni.createSelectorQuery().in(this)
        q.select('.ai-window').boundingClientRect()
        q.exec(res => {
          const rect = res && res[0]
          if (!rect || rect.height <= 0) {
            this.applyNativeWebviewInset()
            return
          }
          const sys = uni.getSystemInfoSync()
          const top = this.webviewTopPx
          const cw = this.contentWidthPx(sys)
          const width = cw > 0 ? cw : Math.round(rect.width)
          const height = this.nativeSubWebviewHeightPx(sys)
          const prev = this.measuredWebviewFrame
          if (prev && prev.top === top && prev.width === width && prev.height === height) {
            this.applyNativeWebviewInset()
            return
          }
          this.measuredWebviewFrame = { top, width, height }
          this.logLayoutMetrics('ai-window')
          this.$nextTick(() => this.applyNativeWebviewInset())
        })
      })
    },
    /** 根 webview 下所有可调 setStyle 的子实例（布局用，避免只命中 draw 池仍漏掉真机上的内容 webview） */
    listAllSubWebviewsForSetStyle(currentWebview) {
      const list = []
      try {
        const kids = currentWebview.children()
        if (!kids || !kids.length) return list
        for (let i = 0; i < kids.length; i++) {
          const c = kids[i]
          if (c && typeof c.setStyle === 'function') list.push(c)
        }
      } catch (e) {
        /* ignore */
      }
      return list
    },
    /**
     * 关闭页面前：优先 URL 命中；与 pdfPreView 一致可带 draw 过滤，避免关错层。
     */
    pickSubWebviews(currentWebview) {
      try {
        const kids = currentWebview.children()
        if (!kids || !kids.length) return []
        const raw = []
        for (let i = 0; i < kids.length; i++) {
          const c = kids[i]
          if (!c || typeof c.setStyle !== 'function') continue
          let url = ''
          try {
            url = (c.getURL && c.getURL()) || ''
          } catch (e) {
            url = ''
          }
          raw.push({ c, url })
        }
        const pool = raw.filter(x => typeof x.c.draw === 'function')
        const candidates = pool.length ? pool : raw
        if (!candidates.length) return []
        const full = this.webviewUrl || ''
        const hint = full.split('?')[0]
        if (hint) {
          const matched = candidates.filter(
            ({ url }) => url && (url === full || url.indexOf(hint) !== -1)
          )
          if (matched.length) return matched.map(m => m.c)
        }
        const httpOnes = candidates.filter(({ url }) => url && /^https?:\/\//i.test(url))
        if (httpOnes.length) return httpOnes.map(m => m.c)
        return [candidates[candidates.length - 1].c]
      } catch (e) {
        return []
      }
    },
    /**
     * 原生子 webview：显式 height，避免仅用 bottom 时真机绘制高度小于 .ai-window。
     */
    buildNativeSubWebviewInsetStyle(topPx, widthPx, heightPx) {
      return {
        top: `${topPx}px`,
        left: '0px',
        width: `${widthPx}px`,
        height: `${heightPx}px`
      }
    },
    applyNativeWebviewInset() {
      if (!this.isApp || !this.webviewUrl) return
      const sys = uni.getSystemInfoSync()
      const frame = this.measuredWebviewFrame
      const topPx = frame && frame.height > 0 ? frame.top : this.webviewTopPx
      const cw = this.contentWidthPx(sys)
      const w =
        cw > 0
          ? cw
          : frame && frame.height > 0
            ? frame.width
            : sys.windowWidth
      const hNative = this.nativeSubWebviewHeightPx(sys)
      const styleInset = this.buildNativeSubWebviewInsetStyle(topPx, w, hNative)
      const trySet = () => {
        try {
          const cur = this.$scope.$getAppWebview()
          let list = this.listAllSubWebviewsForSetStyle(cur)
          if (!list.length) list = this.pickSubWebviews(cur)
          if (list.length) {
            list.forEach(wv => {
              wv.setStyle(styleInset)
            })
            if (this.layoutDebug) {
              try {
                const wv = list[0]
                const st = wv.getStyle && wv.getStyle()
                this.debugNativeWebviewStyle = {
                  top: st && st.top,
                  width: st && st.width,
                  height: st && st.height,
                  bottom: st && st.bottom
                }
              } catch (e) {
                this.debugNativeWebviewStyle = {
                  top: styleInset.top,
                  width: styleInset.width,
                  height: styleInset.height
                }
              }
              this.logLayoutMetrics('native-setStyle')
            }
            return true
          }
        } catch (e) {
          /* ignore */
        }
        return false
      }
      const retry = (n = 0) => {
        if (trySet() || n > 55) return
        setTimeout(() => retry(n + 1), 50)
      }
      retry()
    },
    handleMessage(e) {
      const data = (e.detail && e.detail.data && e.detail.data[0]) || {}
      if (data.type === 'AUTH_TOKEN') {
        const userInfo = uni.$storage.get('userInfo') || {}
        userInfo.token = data.token
        uni.$storage.set('userInfo', userInfo)
      } else if (data.type === 'LOGOUT') {
        const userInfo = uni.$storage.get('userInfo') || {}
        userInfo.token = ''
        uni.$storage.set('userInfo', userInfo)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.inspection-page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
}

.inspection-page.layout-debug {
  background-color: #ffcdd2;
  .header {
    background-color: #ffe082 !important;
    box-shadow: inset 0 0 0 3px #ff6f00;
  }
  /* 不要用 inset 描边：会在四边形成固定宽度的「绿框」，子 webview 即使与 rect 对齐也会露出来，极易误判未铺满 */
  .ai-window {
    background-color: rgba(46, 125, 50, 0.1);
  }
}

.layout-debug-panel {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 99999;
  padding: 8px 10px 12px;
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font-size: 11px;
  line-height: 1.45;
  max-height: 38vh;
  overflow-y: auto;
  box-sizing: border-box;
  border-bottom: 2px solid #ffeb3b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}
.layout-debug-title {
  font-weight: 700;
  margin-bottom: 4px;
  color: #ffeb3b;
}
.layout-debug-hint {
  margin-top: 6px;
  opacity: 0.85;
  font-size: 10px;
}

.header {
  padding-top: 30px;
  background-color: #f5f9ff;
  z-index: 9;
  position: fixed;
  top: 0;
  left: 0;
  height: 10%;
  width: 100%;
  box-sizing: border-box;
  .nav-bar {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    .back {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title {
      color: #333333;
      flex: 1;
      font-size: 16px;
      font-weight: 700;
      text-align: center;
    }
  }
}

.ai-window {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 1;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ai-window-wv {
  flex: 1;
  width: 100%;
  min-height: 0;
}
</style>
