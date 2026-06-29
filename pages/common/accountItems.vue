<template>
  <view class="layout">
    <view class="bg"></view>
    <view class="nav-bar">
      <view
        class="back"
        @click="back"
      >
        <uni-icons
          type="left"
          :size="20"
          color="#000"
        ></uni-icons>
      </view>
    </view>
    <view class="step-box">
      <template v-for="(i,index) in stepList">
        <view
          :class="['step-item',{'active-item':stepIndex >= index}]"
          :key="index"
          @click="setStep(index)"
        >
          <view class="num">
            <view class="border"></view>
            <view class="text">{{index + 1}}</view>
          </view>{{i}}
        </view>
      </template>
    </view>
    <view class="content-box">
      <template v-if="stepIndex != 2">
        <view class="search-box">
          <view class="search-input">
            <template v-if="!edit">
              <view
                :class="['input', `${searchValue ? '' : 'placeholder'}`]"
                @click="open"
              >
                <template v-if="searchValue">
                  {{searchValue}}
                </template>
                <template v-else>
                  请输入门店名称/商户号搜索
                  <view class="sprite-icon icon-search"></view>
                </template>
              </view>
            </template>
            <template v-else>
              <input
                type="text"
                class="input"
                v-model="searchValue"
                :focus='inputFocus'
                confirm-type="search"
                @blur="search"
                @confirm="search"
              />
            </template>
          </view>
          <template v-if="searchValue">
            <view
              class="clear"
              @click="clear"
            >
              <uni-icons
                type="closeempty"
                :size="16"
                color="#1A1A1A"
              ></uni-icons>
            </view>
          </template>
        </view>
      </template>
      <scroll-view
        class="list"
        scroll-y
        enable-flex
        :show-scrollbar="true"
      >
        <account-list
          v-show="stepIndex == 0"
          ref="account"
          @chooseAccount="chooseAccount"
        />
        <merchant-list
          v-show="stepIndex == 1"
          ref="merchant"
          @chooseMerchant="chooseMerchant"
        />
        <scene
          v-show="stepIndex == 2"
          ref="scene"
        />
      </scroll-view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import AccountList from './components/AccountList.vue'
import MerchantList from './components/MerchantList.vue'
import Scene from './components/Scene.vue'
export default {
  name: 'accountItem',
  components: { AccountList, MerchantList, Scene },
  data () {
    return {
      stepList: ['选择账号', '选择4S店', '选择场景'],
      stepIndex: 0,
      searchValue: '',
      edit: false,
    }
  },
  onLoad (options) {
    if (options.stepIndex == 1) {
      this.$nextTick(() => {
        this.$refs.account.getListSelectAccount(true)
      })
    }
  },
  mounted () {
  },
  methods: {

    search () {
      this.edit = false
      const { stepIndex } = this
      this.$refs[{
        0: 'account',
        1: 'merchant'
      }[stepIndex]]?.searchEvent(this.searchValue)
    },
    open () {
      this.edit = true
      this.inputFocus = true
    },
    back () {
      uni.navigateBack()
    },
    chooseAccount (userInfo) {
      this.stepIndex = 1
      this.searchValue = ''
      this.$nextTick(() => {
        this.$refs.merchant.init(userInfo)
      })
    },
    chooseMerchant (userInfo) {
      this.stepIndex = 2
      this.searchValue = ''
      this.$refs.scene.init(userInfo)
    },
    setStep (index) {
      let { stepIndex } = this
      if (index == 2) return
      if (stepIndex > index) this.stepIndex = index
    },
    clear () {
      this.searchValue = ''
      this.search()
    }
  }
}
</script>

<style scoped lang='scss'>
.layout {
  padding-top: toRpx(144);
  font-size: toRpx(28);
  color: #333;
  letter-spacing: 0;
  background: #f7f8fa;
  box-sizing: border-box;
  height: 100%;
  .bg {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-image: url('../../assets/images/login/account-bg.webp');
    background-size: 100% 100%;
  }
  .nav-bar {
    position: fixed;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    z-index: 9;
    .back {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .step-box {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0 toRpx(166);
    .step-item {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: toRpx(36);
      color: #999999;
      .num {
        width: toRpx(56);
        height: toRpx(56);
        position: relative;
        padding: toRpx(4);
        color: #ffffff;
        box-sizing: border-box;
        margin-right: toRpx(10);
        &::after {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          border: toRpx(2) solid #b1b1b1;
          content: '';
          border-radius: 100%;
        }
        .text {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: toRpx(32);
          background: #b1b1b1;
          border-radius: 100%;
        }
      }
    }
    .active-item {
      color: #4673ff;
      .num {
        &::after {
          border-color: #4673ff;
        }
        .text {
          background: #4673ff;
        }
      }
    }
  }
  .content-box {
    width: 81.84%;
    height: calc(100vh - #{toRpx(404)});
    position: relative;
    margin: toRpx(48) auto 0;
    box-sizing: border-box;
    padding-top: toRpx(48);
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    border-radius: toRpx(48);
    background: #ffffff59;
    &::after {
      position: absolute;
      content: '';
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: #ffffff59;
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(48);
      filter: blur(toRpx(8));
    }
  }
  .search-box {
    margin: 0 toRpx(48) toRpx(48);
    position: relative;
    z-index: 2;
    .search-input {
      width: 100%;
      height: toRpx(80);
      background: #ffffff;
      border: toRpx(3) solid #a8c1ff;
      border-radius: toRpx(16);
      box-sizing: border-box;
      color: #333;
      padding: 0 toRpx(24);
      font-size: toRpx(28);
      position: relative;
      .input {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        justify-content: center;
        text-align: center;
        font-size: toRpx(28);
      }
      .icon-search {
        margin-left: toRpx(16);
      }
      .placeholder {
        font-size: toRpx(28);
        color: #999999;
      }
    }
    .clear {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      padding: 0 toRpx(32);
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
  .list {
    position: relative;
    z-index: 2;
    height: calc(100% - #{toRpx(176)});
    & ::-webkit-scrollbar {
      background-color: #ffffff59 !important;
    }
    & ::-webkit-scrollbar-thumb {
      width: toRpx(8);
      background-color: #fff !important;
      border-radius: toRpx(4);
    }
  }
}
</style>