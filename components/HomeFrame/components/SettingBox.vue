<template>
  <uni-popup
    ref="popup"
    border-radius="20px"
  >
    <view class="setting-box">
      <view
        class="close flex"
        @click="close"
      >
        <uni-icons
          type="closeempty"
          :size="18"
          color="#1A1A1A"
        ></uni-icons>
      </view>
      <view class="app-info flex">
        <view class="sprite-icon icon-logo"></view>
        展业助手
        <view class="version">版本号：V{{ version }}</view>
        <view
          class="check-box"
          @click="handleCheck"
        >检查更新</view>
      </view>
      <view class="btn-box">
        <view
          class="btn flex"
          @click="changeAccount"
        >切换账号</view>
        <view
          class="btn flex logout"
          @click="delAccount"
        >注销</view>
        <view
          class="btn flex logout"
          @click="logout"
        >退出</view>
      </view>
      <view
        class="a"
        @click="jump('agreement')"
      >《隐私协议》</view>
      <view
        class="icp flex"
        @click="jump('icp')"
      >
        ICP备案号：苏ICP备18023686号-2A
        <view class="sprite-icon icon-arrow-right"></view>
      </view>
      <view class="app-code flex">
        APP编码：{{ deviceId }}
        <view
          class="sprite-icon icon-clone"
          @click="copyText"
        ></view>
      </view>
    </view>
  </uni-popup>
</template>

<script type="text/ecmascript-6">
import checkUpdate from "@/uni_modules/uni-upgrade-center-app/utils/check-update-nvue.js";
import utils from '@/utils/utils'
export default {
  name: 'SettingBox',
  data () {
    return {
      version: '',
      deviceId: ''
    }
  },
  mounted () {
    this.version = plus?.runtime?.version || '1.0.0'
    const {
      deviceId
    } = uni.getDeviceInfo()
    this.deviceId = deviceId
  },
  methods: {
    copyText () {
      uni.setClipboardData({
        data: this.deviceId,
        success: function () {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },

    async handleCheck () {
      const {
        textList,
        tempFileURL,
        version
      } = uni.$storage.get('mock_data')
      const res = utils.compareVersions(this.version, version)
      if (res > -1) {
        uni.showToast({
          title: '目前已是最新版本',
          duration: 2000,
          icon: 'none'
        });
        return
      }
      this.close()
      const e = {
        result: {
          "is_silently": false,
          "is_mandatory": true,
          "name": "",
          "title": "",
          "contents": textList.join('\n'),
          "version": version,
          "url": tempFileURL,
          "stable_publish": true,
        },
      }
      checkUpdate(e)
    },
    open () {
      this.$refs.popup.open("center");
    },
    close () {
      this.$refs.popup.close()
    },
    changeAccount () {
      uni.reLaunch({
        url: '/pages/common/accountItems'
      })
    },
    // 退出
    logout () {
      let _this = this
      uni.showModal({
        title: '温馨提示',
        content: '是否退出当前账号？',
        confirmColor: '#347BFF',
        async success (res) {
          if (res.confirm) {
            // _this.$emit('stopAudio')
            try {
              uni.showLoading({
                mask: true
              })
              const {
                code,
                message
              } = await uni.$api.userApi.logout(),
                userInfo = uni.$storage.get("userInfo")
              if (code == 0) {
                uni.$storage.rm("userInfo");
                uni.$storage.rm("sessionId");
                uni.$storage.rm("noSignInUuid");
                uni.$storage.rm("beisenToken");
                uni.$storage.rm("studyCenterPermission");
                uni.$storage.rm("boutique_YQorderSetting")
                setTimeout(() => {
                  uni.hideLoading()
                  uni.reLaunch({
                    url: `/pages/common/login?mobile=${userInfo.phone}`,
                  });
                }, 500)
              } else throw message
            } catch (error) {
              uni.hideLoading()
              uni.showToast({
                title: error,
                icon: "none",
              });
            }
          }
        }
      })
    },
    jump (type) {
      let url = type == 'icp' ? 'https://beian.miit.gov.cn/' :
        'https://img01.glsx.com.cn/weapp/resource/saas/app/privacy.html'
      uni.navigateTo({
        url: `/pages/common/webview?url=${url}`
      })
    },
    delAccount () {
      uni.showModal({
        title: '账号注销',
        content: '注销申请将提交给企业管理员审核，审核通过后账号将无法登录。确认提交吗？',
        confirmColor: '#347BFF',
        success (res) {
          if (res.confirm) uni.showToast({
            title: '申请已提交',
            icon: "none",
          });
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.setting-box {
  position: relative;
  width: toRpx(720);
  height: toRpx(880);
  background: #ffffff;
  border-radius: toRpx(40);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .close {
    position: absolute;
    width: toRpx(120);
    height: toRpx(120);
    top: 0;
    right: 0;
    justify-content: center;
  }

  .app-info {
    flex-direction: column;
    font-size: toRpx(32);
    color: #333333;

    .sprite-icon {
      margin-bottom: toRpx(12);
      box-shadow: 0 0 toRpx(24) 0 #3682ef33;
      border-radius: toRpx(40);
    }

    .version {
      margin-top: toRpx(8);
      font-size: toRpx(24);
      color: #999999;
    }

    .check-box {
      width: toRpx(120);
      padding: toRpx(10) 0 toRpx(4);
      background: #f2f2f2;
      border-radius: toRpx(6);
      font-size: toRpx(22);
      color: #999999;
      text-align: center;
      margin-top: toRpx(16);
      box-sizing: border-box;
    }
  }

  .btn-box {
    margin-top: toRpx(120);

    .btn {
      width: toRpx(384);
      height: toRpx(64);
      background: #3b73ff1a;
      border: toRpx(2) solid transparent;
      border-radius: toRpx(32);
      justify-content: center;
      font-size: toRpx(28);
      color: #3b73ff;
      margin-bottom: toRpx(16);
    }

    .logout {
      background: #ffffff;
      color: #333333;
      border: toRpx(2) solid #e8e8e8;
    }
  }

  .a {
    font-size: toRpx(24);
    color: #2c66f7;
    margin: toRpx(48) 0 toRpx(16);
  }

  .icp {
    font-size: toRpx(24);
    color: #999999;
  }

  .app-code {
    font-size: toRpx(24);
    color: #999999;
    line-height: toRpx(40);

    .icon-clone {
      width: toRpx(24);
      height: toRpx(24);
    }
  }
}
</style>
