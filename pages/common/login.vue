<template>
  <view class="layout">
    <view class="bg"></view>
    <view class="login">
      <view class="title">登录</view>
      <view class="sub-title">手机号码登录</view>
      <view class="input">
        <input
          type="tel"
          :value="mobile"
          placeholder="请输入手机号"
          maxlength="11"
          @blur="input($event, 'mobile')"
          :key="dateKey.mobile"
          auto-blur
        />
        <template v-if="mobile">
          <view
            class="icon"
            @click="mobile = ''"
          >
            <icon
              type="clear"
              size="16"
              color="#000"
            ></icon>
          </view>
        </template>
      </view>
      <view class="input">
        <input
          type="number"
          :value="code"
          placeholder="请输入验证码"
          maxlength="4"
          @blur="input($event, 'code')"
          :key="dateKey.code"
          auto-blur
        />
        <template v-if="code">
          <view
            class="icon"
            @click="code = ''"
          >
            <icon
              type="clear"
              size="16"
              color="#000"
            ></icon>
          </view>
        </template>
        <view
          :class="['code-btn', `${count ? 'code-disabled' : ''}`]"
          @click="getSmsCode"
        >{{ count ? `重新发送(${count}s)` : '获取验证码' }}</view>
      </view>
      <button
        class="btn"
        @click="login"
      >登录</button>
      <view class="form-footer">
        <view
          class="autoLogin"
          @click="readingStatus = !readingStatus"
        >
          <uni-icons
            :type="`${readingStatus ? 'checkbox-filled' : 'circle'}`"
            :size="18"
            :color="`${readingStatus ? '#2C66F7' : '#858A94'}`"
          ></uni-icons>
          我已阅读并同意
          <text @click.stop="jumpUrl()">《隐私协议》</text>
        </view>
        <view
          class="autoLogin"
          @click="noSignIn = !noSignIn"
        >
          <uni-icons
            :type="`${noSignIn ? 'checkbox-filled' : 'circle'}`"
            :size="18"
            :color="`${noSignIn ? '#2C66F7' : '#858A94'}`"
          ></uni-icons>
          30天内免登录
        </view>
      </view>
    </view>
    <view class="app-code flex">
      APP编码：{{ deviceId }}
      <view
        class="sprite-icon icon-clone"
        @click="copyText"
      ></view>
    </view>
    <update-box />
  </view>
</template>
<script type="text/ecmascript-6">
const phoneRex = /^[1]([3-9])[0-9]{9}$/;
import { Request } from 'glsk-toolkit'
export default {
  data () {
    return {
      mobile: '',
      code: '',
      count: '',
      noSignIn: true,
      readingStatus: false,
      dateKey: {
        mobile: 0,
        code: 0
      }
    };
  },
  watch: {
    code: {
      handler (val) {
        this.autoLoginByMobile()
      },
      immediate: true,
      deep: true
    },
    mobile: {
      handler (val) {
        this.autoLoginByMobile()
      },
      immediate: true,
      deep: true
    }
  },
  onLoad (options) {
    uni.$signHttp = new Request(uni.signHttpConfig) //重新登录重置请求参数
    if (options.mobile) this.mobile = options.mobile
    const noSignInUuid = uni.$storage.get('noSignInUuid')
    if (noSignInUuid) this.autoLogin(noSignInUuid)
    const {
      deviceId
    } = uni.getDeviceInfo()
    this.deviceId = deviceId
  },
  methods: {
    autoLoginByMobile () {
      let { mobile, code } = this
      if (code && mobile && code.length == 4 && phoneRex.test(mobile)) this.login()
    },
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
    async autoLogin (noSignInUuid) {
      uni.showLoading({
        mask: true
      });
      const { data } = await uni.$api.userApi.autoLogin({ noSignInUuid })
      uni.hideLoading();
      if (data) this.jump(data, true)
    },
    /**获取验证码 */
    async getSmsCode () {
      const { mobile, count } = this;
      try {
        if (!mobile) throw '请输入手机号';
        if (!phoneRex.test(mobile)) throw '请输入正确的手机号';
        if (count) throw '验证码发送过于频繁,请稍后再试';
        uni.showLoading({
          mask: true
        });
        const { code, message } = await uni.$api.userApi.getSmsCode({ mobile });
        uni.hideLoading();
        if (code == '0') {
          uni.$logger.local.info(`${mobile}发送验证码成功`)
          uni.showToast({
            title: '验证码已发送',
            icon: 'none',
          });
          this.countDown(60);
        } else throw message || '发送验证码失败';
      } catch (error) {
        uni.$logger.local.info(`${mobile}发送验证码失败，失败原因：${error}`)
        uni.hideLoading();
        uni.showToast({
          title: error,
          icon: 'none',
        });
      }
    },
    /**验证码倒计时 */
    countDown (countDown) {
      if (countDown) this.count = countDown;
      setTimeout(() => {
        let { count } = this;
        this.count = --count;
        if (count > 0) this.countDown();
        else this.count = null;
      }, 1e3);
    },
    login: uni.$throttle(async function () {
      const { mobile, code: smsCode, noSignIn, readingStatus } = this;
      try {
        if (!mobile) throw '请输入手机号'
        if (!phoneRex.test(mobile)) throw '请输入正确的手机号';
        if (!smsCode) throw '请输入验证码'
        if (!readingStatus) throw '请您阅读并同意《隐私协议》'
        let params = {
          mobile,
          code: smsCode
        }
        if (noSignIn) params.noSignIn = noSignIn
        uni.showLoading({
          mask: true
        });
        const { code, data, message } = await uni.$api.userApi.smsLogin(params);
        console.log(code, data, message);
        uni.hideLoading();
        if (code == 0) {
          this.jump(data, noSignIn);
          uni.$logger.local.info(`${mobile}登录`)
        }
        else {
          uni.showModal({
            title: '温馨提示',
            content: message,
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#347BFF',
          });
          uni.$logger.local.info(`${mobile}登录失败，失败原因：${message}`)
        }

      } catch (error) {
        uni.$logger.local.info(`${mobile}登录失败，失败原因：${error}`)
        uni.hideLoading();
        uni.showToast({
          title: error,
          icon: 'none',
        });
      }
    }, 200),
    // 获取登录账号下园区店列表
    getAccountLoginList (loginUserInfoList) {
      let stepIndex = loginUserInfoList?.length == 1 ? 1 : 0
      uni.navigateTo({
        url: `/pages/common/accountItems?stepIndex=${stepIndex}`
      })
    },
    jumpUrl () {
      let url = 'https://img01.glsx.com.cn/weapp/resource/saas/app/privacy.html'
      uni.navigateTo({
        url: `/pages/common/webview?url=${url}`
      })
    },
    jump (data, noSignIn) {
      let {
        loginUserInfoList,
        noSignInUuid,
        sessionId,
      } = data;
      if (loginUserInfoList.length) {
        uni.$storage.set('sessionId', sessionId);
        if (noSignInUuid && noSignIn) uni.$storage.set('noSignInUuid', noSignInUuid)
        this.getAccountLoginList(loginUserInfoList)
      } else uni.reLaunch({
        url: '/pages/common/nothing'
      });
    },
    input (e, key) {
      setTimeout(() => {
        let { value } = e.detail,
          numbers = value.match(/\d+/g)
        console.log(numbers)
        this[key] = numbers ? numbers.join('') : ''
        this.dateKey[key] = Date.now()
      }, 0)
    },
  },
};
</script>
<style lang="scss" scoped>
.bg {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-image: url('../../assets/images/login/bg.webp');
  background-size: 100% 100%;
}
.login {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .title {
    font-weight: 600;
    font-size: toRpx(96);
    color: #333333;
    text-align: center;
  }
  .sub-title {
    font-weight: 500;
    font-size: toRpx(32);
    color: #1a1a1a;
    margin: toRpx(46) 0;
  }
  .input {
    width: toRpx(800);
    height: toRpx(112);
    background: #f7f8fa;
    border-radius: toRpx(56);
    margin-bottom: toRpx(40);
    box-sizing: border-box;
    padding-left: toRpx(40);
    display: flex;
    align-items: center;
    input {
      height: 100%;
      flex: 1;
      font-size: toRpx(32) !important;
    }
    .icon {
      margin-left: auto;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 0 toRpx(40);
      height: 100%;
    }
    .code-btn {
      font-weight: 500;
      font-size: toRpx(32);
      color: #2c66f7;
      flex-shrink: 0;
      border: none;
      margin-right: toRpx(40);
    }
    .code-disabled {
      color: #9b9b9e;
    }
  }
  .btn {
    width: toRpx(800);
    height: toRpx(112);
    background-image: linear-gradient(90deg, #48a6ff 0%, #2c66f7 100%);
    border-radius: toRpx(56);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: toRpx(40);
    color: #ffffff;
  }
  .btn[disabled]:not([type]),
  .btn[disabled][type='default'] {
    background: #c9c9c9 !important;
  }
  .form-footer {
    display: flex;
    justify-content: center;
    margin-top: toRpx(40);
    flex-direction: column;
    gap: toRpx(38) 0;
    padding-left: toRpx(142);
    .autoLogin {
      display: flex;
      align-items: center;
      margin-right: toRpx(20);
      .uni-icons {
        margin-right: toRpx(8);
        // margin-left: toRpx(142);
      }
      text {
        color: #2c66f7;
      }
    }
  }
}
.app-code {
  position: fixed;
  bottom: toRpx(20);
  left: 50%;
  transform: translate(-50%);
  font-size: toRpx(24);
  color: #999999;
  line-height: toRpx(40);
  .icon-clone {
    width: toRpx(24);
    height: toRpx(24);
    margin-left: toRpx(20);
  }
}
</style>
