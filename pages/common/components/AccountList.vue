<template>
  <view class="box" :key="selectedUuid" v-if="flag">
    <template v-if="loginUserInfoList.length">
      <template v-for="(item, index) in loginUserInfoList">
        <view :key="index" :class="['items', `${item.active ? 'active' : ''}`]" @click="chooseAccount(item)">
          <view class="right">
            <view :class="['midle', midle(item)]">
              {{ item.isSuper == true ? '超管' : item.userType == 1 ? '商户' : item.loginRole == 3 ? '督导' : item.loginRole == 4 ? '驻店' : '员工' }}
            </view>
          </view>
          <view class="left">
            <view class="name">
              {{ item.merchantName }}
            </view>
            <view class="shop_no">商户号：{{ item.merchantId }}</view>
          </view>
        </view>
      </template>
    </template>
    <template v-else>
      <no-data />
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import { loginMixin } from '@/mixin/index'
import NoData from './NoData.vue'
export default {
  mixins: [loginMixin],
  components: {
    NoData
  },
  data () {
    return {
      copyLoginUserInfoList: [],
      loginRole: {
        1: '超管',
        2: '商户号',
        3: '区域督导',
        4: '驻店负责人'
      },
      selectedUuid: '',
      loginUserInfoList: [],
      flag: false
    }
  },
  mounted () {
    this.getListSelectAccount()
    uni.$logger.local.info(`进入选择账号页面！`)
  },
  methods: {
    getListSelectAccount (autoLogin = false) {
      uni.showLoading({
        mask: true
      })
      uni.$api.userApi.getListSelectAccount().then(res => {
        uni.hideLoading()
        let { code, data, message } = res
        if (code == 21) uni.reLaunch({
          url: "/pages/common/login",
        })
        else {
          if (code == 0) {
            let { loginUserInfoList, sessionId } = data
            uni.$storage.set('sessionId', sessionId);
            this.loginUserInfoList = loginUserInfoList
            this.copyLoginUserInfoList = loginUserInfoList
            const yqMerchantIdList = loginUserInfoList.map(item => item.merchantId)
            // const _res = {
            //   directSaleAuth: false,
            //   hmzxAuth: true,
            //   authorizedBusinessList: [1,2]
            // }
            // uni.$storage.set('studyCenterPermission', _res)
   
            if (autoLogin) this.chooseAccount(loginUserInfoList[0])
          } else uni.showToast({
            title: message,
            icon: 'none',
          });
          this.flag = true
        }
      }).catch(() => {
        uni.hideLoading()
      })
    },
    chooseAccount (item) {
      let { loginUserInfoList } = this
      loginUserInfoList.map(i => {
        i.active = false
        if (i.uuid == item?.uuid) i.active = true
        return i
      })
      this.loginUserInfoList = loginUserInfoList
      this.selectedUuid = item.uuid
      this.choiceAccountLogin()
    },
    async choiceAccountLogin () {
      let { loginUserInfoList } = this,
        id = null,
        merchantName = null
        console.log(loginUserInfoList,'loginUserInfoList')
      loginUserInfoList.map(e => {
        if (e.active) {
          id = e.uuid
          merchantName = e.merchantName
        }
      })

      if (!id) {
        uni.showToast({
          title: '请选择账号',
          icon: 'none',
        });
        return
      }
      // 清空4s店数据
      // app.globalData.storeListRange = []
      this.selectAccountLogin(id,merchantName)
    },
    selectAccountLogin (id,merchantName) {
      uni.$logger.local.info(`选择账号${merchantName}登录！`)
      uni.showLoading({
        mask: true
      })
      uni.$api.userApi.selectAccountLogin({ id }).then(data => {
        uni.hideLoading()
        let [userInfo] = data.loginUserInfoList
        if (data && userInfo) this.get4SStoreList(userInfo)
        else uni.showToast({
          title: '获取4S店列表失败',
          icon: 'none',
        })
      }).catch((err) => {
        uni.$logger.local.error(`获取4S店列表失败${err}！`)
        uni.hideLoading()
      })
    },
    // 搜索过滤
    searchEvent (searchValue) {
      let { copyLoginUserInfoList, selectedUuid } = this
      copyLoginUserInfoList.map(val => {
        val.active = false
        if (val.uuid == selectedUuid) val.active = true
        return val
      })
      let filterArr = copyLoginUserInfoList.filter(val => val.merchantName.includes(searchValue) || val.merchantId == searchValue) || []
      this.loginUserInfoList = filterArr
      if (!searchValue) this.loginUserInfoList = copyLoginUserInfoList
    },
    midle (item) {
      return item.isSuper == true ? 'midle_1' : item.userType == 1 ? 'midle_2' : (item.loginRole == 3 ? 'midle_3' : item.loginRole == 4 ? 'midle_4' : 'midle_5')
    },
  }
}
</script>

<style scoped lang="scss">
.box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 toRpx(48);
  gap: toRpx(48);

  .items {
    width: calc(50% - #{toRpx(24)});
    height: toRpx(160);
    background: #ffffff;
    border-radius: toRpx(16);
    padding: toRpx(32);
    display: flex;
    align-items: center;
    box-sizing: border-box;
    border: toRpx(4) solid transparent;
    .left {
      width: 65%;
      display: flex;
      flex-flow: column;
      justify-content: center;
      .name {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: toRpx(32);
        color: #181a1f;
      }
      .shop_no {
        font-weight: 400;
        font-size: toRpx(28);
        margin-top: toRpx(12);
        color: #999ea8;
      }
    }
    .right {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      .midle {
        font-size: toRpx(28);
        font-weight: 700;
        width: toRpx(96);
        height: toRpx(96);
        border-radius: toRpx(8);
        margin-right: toRpx(28);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .midle_1 {
        color: #f24724;
        background-color: #f247241a;
      }
      .midle_2 {
        color: #ff9d0a;
        /* border: var(--fontSize2) solid #FF9D0A; */
        background-color: #ff9d0a1a;
      }
      .midle_3 {
        color: #347bff;
        /* border: var(--fontSize2) solid #347BFF; */
        background-color: #347bff1a;
      }
      .midle_4 {
        color: #35c376;
        /* border: var(--fontSize2) solid #35C376; */
        background-color: #35c3761a;
      }
      .midle_5 {
        color: #35c376;
        /* border: var(--fontSize2) solid #35C376; */
        background-color: #35c3761a;
      }
      .icon {
        width: toRpx(40);
        height: toRpx(40);
      }
    }
  }
  .active {
    border: toRpx(4) solid #347bff;
  }
}
</style>
