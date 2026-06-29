<script>
  const PATH = ['/pages/common/caseDetail']
  const keepAlive = uni.requireNativePlugin('Ba-KeepAliveSuit')
  import { mapState } from 'vuex'
  import { Ws } from '@/ws/Ws.js'
  import { RecordSaveService, UploadService } from '@/utils/recordManager/index.js'
  import appCacheApi from '@/utils/clearAppCache.js'
  export default {
    computed: {
      ...mapState('audio', ['isEnd', 'isStart'])
    },
    globalData: {
      userInfo: uni.getStorageSync('release_userInfo')
    },
    onLaunch: async function () {
      this.onKeep()
      // this.setAPPVersion()
      setTimeout(() => {
        plus.screen.unlockOrientation() //解除锁定屏幕方向
        plus.screen.lockOrientation('landscape-primary')
      }, 300)
      uni.setKeepScreenOn({
        keepScreenOn: true
      })
      new Ws().connect()
    },
    methods: {
      onKeep() {
        keepAlive &&
          keepAlive.onKeep(
            {
              title: '接待',
              content: '接待通知'
            },
            res => {
              console.log(res)
            }
          )
      },
      setAPPVersion() {
        let version = plus.runtime.version
        let storageVersion = uni.$storage.get('storageVersion')
        uni.$logger.local.info(`storageVersion ->${storageVersion}, version ->${version}`)
        if (storageVersion != version) {
          uni.$storage.rm('userInfo')
          uni.$storage.rm('noSignInUuid')
        }
        uni.$storage.set('storageVersion', version)
      }
    },
    onShow: async function () {
      appCacheApi.clearAppCache()
      this.$store.dispatch('setBackgroundState', false)
      this.$store.dispatch('setActivityWindowPopCount', 1) //冷启动重置活动弹框次数
      // 触发轮询开始事件，通知上传管理重新开始轮询
      // UploadService.startPolling()
      RecordSaveService.startPolling()
      uni.onMemoryWarning(function () {
        console.log('onMemoryWarningReceive')
      })
      // const systemInfo = await uni.$api.systemApi.getMockData();
      // if (systemInfo.isCheckedUpdate) {
      //   checkUpdate();
      // }
      // let version = plus.runtime.version;
      // uni.$api.commonApi.getAPPVersion().then((res) => {
      //   if (res != version && !systemInfo.isCheckedUpdate)
      //     this.$store.dispatch("openUpdateModal");
      // });
    },
    onHide: function () {
      this.$store.dispatch('setBackgroundState', true)
    },
    onError: function (e) {
      try {
        const msg = typeof e === 'string' ? e : e.message || '捕获全局异常'
        const stack = typeof e === 'object' ? e.stack || JSON.stringify(e) : ''
        uni.$logger?.error({
          msg: `[全局异常] ${msg}`,
          extra: {
            stack,
            raw: e,
            url: this.$route?.path || 'unknown'
          }
        })
      } catch (error) {
        console.error('日志上报失败:', error)
      }
    },
    onUnhandledRejection: function (res) {
      try {
        const reason = res.reason
        const msg = reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : '未处理的 Promise 拒绝'
        const stack = reason instanceof Error ? reason.stack : JSON.stringify(reason)
        uni.$logger?.error({
          msg: `[UnhandledRejection] ${msg}`,
          extra: {
            stack,
            reason: reason,
            url: this.$route?.path || 'unknown'
          }
        })
      } catch (error) {
        console.error('Promise 异常上报失败:', error)
      }
    }
  }
  </script>
  <style lang="scss">
  page {
    font-size: 28rpx;
    height: 100%;
    min-height: 100%;
  }
  view,
  navigator,
  image,
  text,
  scroll-view,
  swiper,
  swiper-item,
  input,
  textarea,
  button {
    box-sizing: border-box;
  }
  /* 文字避头尾法则 */
  .btw {
    table-layout: fixed;
    word-wrap: break-word;
    word-break: normal;
    text-align: justify;
    text-justify: inter-ideograph;
  }
  .bg-white {
    background: #fff;
  }
  .font-weight {
    font-weight: bold;
  }
  .u-flex-center {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  button {
    margin: 0;
    padding: 0;
    line-height: 1.5;
    font-size: 28rpx;
    background-color: transparent;
    border-radius: 0;
    position: relative;
  }
  button::after {
    border: none;
  }
  // 指定按钮按下去的样式类
  .button-hover {
    transform: translate(1rpx, 1rpx);
  }
  .webview-container {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
    top: 0rpx;
    left: 0rpx;
  }
  </style>
  