<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-08 10:31:49
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-13 20:36:45
 * @FilePath: \gl-tape\components\HomeFrame\components\Income\Dailog.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="dailog-panel">
    <view class="dailog-box">
      <view class="dailog-left flex-center">
        <view class="sprite-icon icon-locker-icon"></view>
      </view>
      <view class="dailog-right">
        <view class="dailog-close" @click="back"><uni-icons type="closeempty" size="20"></uni-icons></view>
        <view class="password-title flex">
          <text>{{ passwordInfo.title }}</text>
          <view @click="changeIconShow" :class="`sprite-icon icon-${passwordInfo.icon}`"></view>
        </view>
        <view class="password-tips">{{ passwordInfo.tips }}</view>
        <view class="verify-box" v-if="passwordInfo.type == 'reset'">
          <view class="verify-title flex-between">
            <text>接收验证码手机号码：{{ phone | formatPhone }}</text>
            <view :class="['verify-btn', `${count ? 'code-disabled' : ''}`]" @click="getSmsCode">{{ count ? `重新发送(${count}s)` : '发送验证码' }}</view>
          </view>
          <view class="verify-input flex">
            <text>验证码：</text>
            <input v-model="checkCode" type="number" maxlength="6" />
          </view>
        </view>
        <view class="password-warn" v-if="passwordInfo.warn">{{ passwordInfo.warn }}</view>
        <view class="password-body flex flex-direction-column" :class="passwordInfo.type == 'reset' ? 'reset' : ''">
          <view class="uni-input-wrapper passwordInput">
            <input ref="passwordInputs" id="passWord" :focus="focused" v-model="passwords.passwordsNumber" class="uni-password-input" placeholder="请输入6位密码" type="number" :password="showPassword" maxlength="6" @input="handleInput" />
          </view>

          <!-- <input class="password-input" type="number" v-model="passwords.passwordsNumber" max-length="6" /> -->
          <!-- <view class="password-input" v-for="(input, index) in passwords" :key="index" :class="`${index == focusedIndex ? 'focus' : ''}`">
            <input id="code1" v-if="inputType == 'number'" type="number" :ref="'input' + index" v-model="passwords[index]" @click="handleInput(index)" @input="handleInput(index, 'focusedIndex')" @keyup.native="keyUp" @keydown.native="handleKeyUp($event, index)" maxlength="1" :focus="focusedIndex === index" class="password-input-single" />
            <input v-if="inputType == 'password'" type="password" :ref="'input' + index" v-model="passwords[index]"  @input="handleInput(index, 'focusedIndex')" @keyup.native="keyUp" @keydown.native="handleKeyUp($event, index)" maxlength="1" :focus="focusedIndex === index" class="password-input-single" />
          </view> -->
        </view>
        <template v-if="passwordInfo.type == 'set'">
          <view class="password-sure">{{ passwordInfo.sure }}</view>
          <view class="password-body flex flex-direction-column" :class="showError ? 'error' : ''">
            <view class="uni-input-wrapper passwordInput passwordInput-set">
              <input v-model="passwords.passwordsNumberAgain" class="uni-password-input" placeholder="请再次输入6位密码" type="number" :password="showPassword" maxlength="6" @click="handleInput" />
            </view>
            <text v-show="showError" class="error-text">两次密码不一致，请检查</text>
            <!-- <input type="number" v-model="passwords.passwordsNumber" max-length="6" /> -->
            <!-- <view class="password-input" v-for="(input, index) in passwordsAgain" :key="index" :class="`${index == focusedAgainIndex ? 'focus' : ''}`">
              <input v-if="inputType == 'number'" type="number" :ref="'input' + index" v-model="passwordsAgain[index]" @click="handleInput(index)" @input="handleInput(index, 'focusedAgainIndex')" @keydown.native="handleKeyUp($event, index)" maxlength="1" :focus="focusedAgainIndex === index" class="password-input-single" />
              <input v-if="inputType == 'password'" type="password" :ref="'input' + index" v-model="passwordsAgain[index]" @click="handleInput(index)" @input="handleInput(index, 'focusedAgainIndex')" @keydown.native="handleKeyUp($event, index)" maxlength="1" :focus="focusedAgainIndex === index" class="password-input-single" />
            </view> -->
          </view>
        </template>
        <view class="password-change" v-if="passwordInfo.type == 'input'">
          <text>忘记密码？</text>
          <text class="password-btn" @click="handleRetrieveTheSecret">找回密码</text>
        </view>
        <view class="password-complete" :class="submitDisabled ? '' : 'disabled'" v-if="passwordInfo.complete" disabled="true" @click="handleSubmit">{{ passwordInfo.complete }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Password',
  data() {
    return {
      focused: false,
      showError: false,
      showPassword: true,
      inputType: 'password',
      passwordInfo: '',
      phone: '',
      count: 0,
      typeList: [
        {
          type: 'input',
          title: '输入隐私密码',
          icon: 'eyes-off',
          tips: '即将访问个人收入计算模块，请输入隐私密码'
        },
        {
          type: 'set',
          title: '设置隐私密码',
          icon: 'eyes-off',
          tips: '首次访问收入计算模块需要设置6位数字隐私密码。',
          warn: '收入计算涉及个人隐私，请勿将密码告知他人。',
          sure: '请再次输入以确认',
          complete: '完成密码设置'
        },
        {
          type: 'reset',
          title: '重置密码',
          icon: 'eyes-off',
          tips: '通过短信验证码方式重置隐私密码',
          complete: '确认重置密码'
        }
      ],
      passwords: {
        passwordsNumber: '',
        passwordsNumberAgain: ''
      },
      checkCode: '',
      // passwords: ['', '', '', '', '', ''], // 初始化6个密码输入框的值为空数组
      // passwordsAgain: ['', '', '', '', '', ''], // 初始化6个密码输入框的值为空数组
      focusedIndex: 0, // 当前聚焦的输入框索引
      focusedAgainIndex: -1, // 当前聚焦的输入框索引
      stepList: [{ title: '设置隐私密码', content: '首次访问收入计算模块需要设置6位数字隐私密码。', warn: '收入计算涉及个人隐私，请勿将密码告知他人。' }, { title: '请再次输入以确认' }]
    }
  },
  computed: {
    submitDisabled() {
      // return this.passwords.passwordsNumber.length < 6
      if (this.passwordInfo.type == 'set') {
        return this.passwords.passwordsNumber.length == 6 && this.passwords.passwordsNumberAgain.length == 6
      } else {
        return this.passwords.passwordsNumber.length == 6
      }
    }
  },
  mounted() {
    const { phone } = uni.$storage.get('userInfo')
    this.phone = phone
    this.getUserInfo()
    this.$nextTick(() => {
      this.focused = true
    })
  },
  filters: {
    formatPhone(phone) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  },
  methods: {
    async getUserInfo() {
      // 判断这个用户是要显示那个模式
      // this.passwordInfo = this.typeList[2]
      let params = {
        staffPhone: this.phone,
        operateType: 0
      }
      let result = await uni.$api.userApi.verifyStaffPassword(params)
      console.log(result)
      this.passwordInfo = this.typeList[result.firstLogin ? 1 : 0]
    },
    handleRetrieveTheSecret() {
      this.passwordInfo = this.typeList[2]
      this.passwords.passwordsNumber = ''
    },
    async handleSubmit() {
      // 没有输入正确长度的不过提交
      // debugger
      console.log(this.submitDisabled)
      if (!this.submitDisabled) return
      let params = {
        staffPhone: this.phone
      }
      if (this.passwords.passwordsNumber.length != 6) {
        uni.showToast({
          title: '请输入6位数字密码',
          icon: 'none'
        })
        return
      }
      // 设置密码
      if (this.passwordInfo.type === 'set') {
        if (this.passwords.passwordsNumberAgain.length != 6) {
          uni.showToast({
            title: '请输入6位确认数字密码',
            icon: 'none'
          })
          return
        }
        if (this.passwords.passwordsNumber != this.passwords.passwordsNumberAgain) {
          uni.showToast({
            title: '两次密码不一致',
            icon: 'none'
          })
          this.showError = true
          return
        }

        params = {
          ...params,
          password: this.passwords.passwordsNumber,
          operateType: 2,
          firstLogin: true
        }
      }
      // 登录
      if (this.passwordInfo.type === 'input') {
        params = {
          ...params,
          password: this.passwords.passwordsNumber,
          operateType: 1
        }
      }
      // console.error('重置密',重置密)
      if (this.passwordInfo.type === 'reset') {
        // 判断有没有输入验证码
        if (!this.checkCode) {
          uni.showToast({
            title: '请输入验证码',
            icon: 'none'
          })
          return
        }
        params = {
          ...params,
          password: this.passwords.passwordsNumber,
          operateType: 2,
          checkCode: this.checkCode,
          firstLogin: false
        }
      }
      const result = await uni.$api.userApi.verifyStaffPassword(params)
      console.log(result, 'verifyStaffPassword')
      if (result) {
        this.passwordInfo.type === 'set' &&
          uni.showToast({
            title: '密码设置成功',
            icon: 'none'
          })
        this.passwordInfo.type === 'input' &&
          uni.showToast({
            title: '登录成功',
            icon: 'none'
          })
        if (this.passwordInfo.type === 'reset') {
          if (result.loginStatus != 1) {
            // 返回状态不对就要验证码错误
            return uni.showToast({
              title: '验证码错误',
              icon: 'none'
            })
          }
          uni.showToast({
            title: '重置密码成功',
            icon: 'none'
          })
        }
        this.$emit('close', false, true)
      }
    },
    // keyUp(ev) {
    //   console.log(ev, ev.keyCode)
    //   // let index = this.pwdList.length
    //   // if (!index) return
    //   // if (ev.keyCode === 8) {
    //   //   this.isDelete = true
    //   //   if (this.oldPwdList === this.pwdList.length) {
    //   //     if (index === this.pwdList.length) {
    //   //       this.pwdList.pop()
    //   //     }
    //   //     index--
    //   //   } else {
    //   //     index > 0 && index--
    //   //   }
    //   //   this.ipt[index].focus()
    //   // } else if (this.isDelete && index === this.pwdList.length && /^\d$/.test(ev.key)) {
    //   //   this.isDelete = false
    //   //   this.pwdList.pop()
    //   //   this.pwdList.push(ev.key)
    //   //   this.ipt[this.pwdList.length] && this.ipt[this.pwdList.length].focus()
    //   // }
    // },
    changeIconShow() {
      this.showPassword = !this.showPassword
      this.passwordInfo.icon = this.passwordInfo.icon == 'eyes-off' ? 'eyes-on' : 'eyes-off'
    },
    /**获取验证码 */
    async getSmsCode() {
      // return
      const { phone, count } = this
      try {
        console.log(count, 'count')
        if (count) throw '验证码发送过于频繁,请稍后再试'
        uni.showLoading({
          mask: true
        })
        const { code, message } = await uni.$api.userApi.getSmsCode({ mobile: phone })
        console.log(code, message)
        uni.hideLoading()
        if (code == '0') {
          uni.$logger.local.info(`${phone}发送验证码成功`)
          uni.showToast({
            title: '验证码已发送',
            icon: 'none'
          })
          this.countDown(60)
        } else throw message || '发送验证码失败'
      } catch (error) {
        uni.$logger.local.info(`${phone}发送验证码失败，失败原因：${error}`)
        uni.hideLoading()
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
      this.countDown(60)
    },
    /**验证码倒计时 */
    countDown(countDown) {
      if (countDown) this.count = countDown
      setTimeout(() => {
        let { count } = this
        this.count = --count
        if (count > 0) this.countDown()
        else this.count = null
      }, 1e3)
    },
    handleInput() {
      this.showError = false
      console.log(this.passwordInfo.type, this.passwords.passwordsNumber.length)
      if (this.passwordInfo.type === 'input' && this.passwords.passwordsNumber.length == 6) {
        this.handleSubmit()
      }
      // console.log(index, 'index')
      // 当输入框有值时，移动焦点到下一个输入框
      // if (this.passwords[index]) {
      //   // 如果不是最后一个输入框，则聚焦到下一个输入框
      //   if (index < this.passwords.length - 1) {
      //     this.focusedIndex = index + 1
      //   }
      // } else {
      //   if (type == 'focusedAgainIndex') {
      //     this.focusedAgainIndex = index
      //     this.focusedIndex = -1
      //   } else {
      //     this.focusedIndex = index
      //     this.focusedAgainIndex = -1
      //   }
      // }
    },
    handleKeyUp(event, index) {
      console.log(event, event.keyCode, index)
      // 检查按下的键是否是删除键（Backspace）
      if (event.keyCode === 8) {
        // 如果当前输入框为空，并且不是第一个输入框，则将焦点移动到前一个输入框
        if (this.passwords[index] === '' && index > 0) {
          this.focusedIndex = index - 1
          // 清空前一个输入框的内容
          this.passwords[index - 1] = ''
        }
      }
    },
    back() {
      console.log('back')
      this.$emit('close', 1)
    }
  }
}
</script>

<style scoped lang="scss">
.dailog-panel {
  position: fixed;
  width: 100vw;
  height: 100vh;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .dailog-box {
    position: fixed;
    left: 50%;
    top: 50%;
    background: #f5f8ff;
    transform: translate(-50%, -50%);
    border-radius: 48rpx;
    display: flex;
    .dailog-right {
      position: relative;
      padding: 128rpx 72rpx;
      width: 1060rpx;
      .dailog-close {
        position: absolute;
        top: 64rpx;
        right: 64rpx;
        .uni-icons {
          color: #808291 !important;
          font-size: 40rpx;
        }
      }
      .password-title {
        font-size: 40rpx;
        color: #1a1a1a;
        line-height: 56rpx;
        font-weight: bold;
        text {
          margin-right: 10rpx;
        }
      }
      .verify-box {
        .verify-title {
          font-size: 32rpx;
          color: #808291;
          margin-top: 10rpx;
          .verify-btn {
            width: 208rpx;
            height: 64rpx;
            background: #ffffff;
            border: 2rpx solid #2c66f7;
            box-shadow: inset 0 0 32rpx 0 #ffffff80;
            border-radius: 12rpx;
            font-size: 28rpx;
            color: #2c66f7;
            text-align: center;
            line-height: 60rpx;
            &.code-disabled {
              color: #9b9b9e;
              border: 2rpx solid #9b9b9e;
            }
          }
        }
        .verify-input {
          font-size: 32rpx;
          color: #808291;
          margin-top: 40rpx;
          input {
            width: 392rpx;
            height: 104rpx;
            background: #f2f4f7;
            border-radius: 16rpx;
            line-height: 104rpx;
            padding-left: 20rpx;
          }
        }
      }
      .password-tips {
        font-size: 32rpx;
        color: #808291;
        margin-top: 16rpx;
      }
      .password-warn {
        font-size: 32rpx;
        color: #f47f13;
        line-height: 46rpx;
      }

      .password-body {
        // margin: 96rpx 0;
        align-items: flex-start;
        &.reset {
          margin-bottom: 112rpx;
        }
        .password-input {
          margin-right: 24rpx;
          input {
            width: 112rpx;
            height: 136rpx;
            text-align: center;
            line-height: 136rpx;
            background: #f2f4f7;
            border-radius: 20rpx;
            transition: border 0.3s; // 添加过渡效果
          }
        }
        input {
          color: #1a1a1a;
          font-size: 44rpx;
        }
        &.error {
          .passwordInput {
            margin-bottom: 0;
          }
          .error-text {
            margin: 24rpx 0 40rpx;
          }
        }
      }
      .password-change {
        margin-top: 128rpx;
        font-size: 32rpx;
        color: #808291;
        .password-btn {
          color: #2c66f7;
        }
      }
      .password-complete {
        width: 376rpx;
        height: 96rpx;
        background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
        box-shadow: inset 0 0 32rpx 0 #ffffff80;
        border-radius: 16rpx;
        font-size: 36rpx;
        color: #ffffff;
        line-height: 96rpx;
        text-align: center;
      }
    }
  }
}
.dailog-right {
  .password-sure {
    line-height: 46rpx;
    font-size: 32rpx;
    color: #1a1a1a;
    font-weight: bold;
    margin: 56rpx 0;
  }
}
.passwordInput {
  box-sizing: border-box;
  width: 500rpx;
  height: 112rpx;
  background: #f2f4f7;
  border-radius: 20rpx;
  // width: 810rpx;
  display: flex;
  align-items: center;
  margin-top: 48rpx;
  // border-bottom: 1rpx solid #e3e3e6;
  padding: 32rpx;
  position: relative;

  input {
    flex: 1;
    color: #323436;
    font-size: 28rpx;
  }
  .uni-input-placeholder {
    color: #ccc;
    font-size: 36rpx;
  }
  .placeholder {
    color: #ccced1;
    font-size: 28rpx;
  }

  .sms {
    width: 160rpx;
    flex-shrink: 0;
    color: #5092ff;
    font-size: 24rpx;
    padding: 0;
    text-align: right;
    transition: all 0.25s;

    &[disabled]:not([type]) {
      color: #ccced1;
    }
  }
  .error {
    border: toRpx(2) solid #f24724;
    border-radius: toRpx(8);
  }
  .error {
    position: absolute;
    font-size: 24rpx;
    color: #f35251;
    left: 0;
    bottom: -13rpx;
    transform: translateY(100%);
  }
}
.passwordInput-set {
  margin: 0 0 112rpx;
}
.flex-direction-column {
  // flex-direction: ;
  flex-direction: column;
}
.error-text {
  font-size: 32rpx;
  color: #f24724;
  text-align: left;
  width: 100%;
}
.disabled {
  opacity: 0.5;
}
</style>
