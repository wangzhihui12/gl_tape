<template>
  <view
    class="box"
    :key="selectMerchantId"
  >
    <template v-if="flag">
      <template v-if="loginUserInfoList.length">
        <template v-for="(item, index) in loginUserInfoList">
          <view
            :key="index"
            :class="['items', { active: item.active }]"
            @click="chooseAccount(item)"
          >
            <view class="right">
              <view class="sprite-icon icon-store"></view>
            </view>
            <view class="left">
              <view class="text_box">
                <view class="name">{{ item.merchantName }}</view>
                <view class="text_no">商户号：{{ item.merchantId }}</view>
              </view>
            </view>
          </view>
        </template>
      </template>
      <template v-else>
        <no-data />
      </template>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import NoData from './NoData.vue'

export default {
  name: 'MerchantList',
  data () {
    return {
      loginUserInfoList: [],
      copyLoginUserInfoList: [],
      showSelect: false,
      flag: false,
      userInfo: {},
      selectMerchantId: ''
    }
  },
  components: {
    NoData
  },
  methods: {
    init (userInfo) {
      uni.$logger.info(`进入选择4s店页面！`)
      this.userInfo = userInfo
      this.getMerchantList()
      // this.getSceneArr()
    },
    async getSceneArr (merchantId = '') {
      return new Promise(async resolve => {
        let { userInfo } = this,
          openSceneArr = []
        // 获取4s店关联场景数据
        const result = await uni.$api.userApi.getYqMerchantSceneConfigAPI({
          yqMerchantId: userInfo?.subLoginUser?.merchantId,
          merchantId
        })
        result.map(val => {
          if (val.sceneOpenFlag == 0) openSceneArr.push(val.scene)
        })
        resolve(openSceneArr)
      })
    },
    getMerchantList () {
      this.loginUserInfoList = []
      this.copyLoginUserInfoList = []
      this.flag = false
      uni.showLoading({
        mask: true
      })
      let { userInfo } = this
      let params = {
        merchantId: userInfo?.isSuper ? '' : userInfo?.merchantId,
        staffUUID: userInfo?.isSuper ? '' : userInfo?.uuid
      }
      uni.$api.userApi.getSceneMerchantRefStoreList(params).then(result => {
        uni.hideLoading()
        this.loginUserInfoList = result
        this.copyLoginUserInfoList = result
        this.flag = true
        if (result && result.length == 1) this.chooseAccount(result[0])
      }).catch(err => {
        uni.hideLoading()
      })
    },
    async chooseAccount (item) {
      uni.$logger.info(`选择4s店${item.merchantName}！`)
      uni.showLoading({
        mask: true
      })
      let { loginUserInfoList } = this
      let listArr = loginUserInfoList
      listArr.map(i => {
        i.active = false
        if (i.merchantId == item?.merchantId) {
          i.active = true
        }
        return i
      })
      let openSceneArr = await this.getSceneArr(item.merchantId)
      this.loginUserInfoList = listArr
      this.selectMerchantId = item.merchantId
      this.jumpPage(item, openSceneArr)
    },
    async jumpPage (item, openSceneArr) {
      let { merchantName: shopMerchantName, merchantId: shopMerchantId } = item,
        { userInfo } = this
      const usedCarSceneType = 7
      if (!openSceneArr?.length && !userInfo?.isSuper) {
        uni.hideLoading()
        uni.showToast({
          title: '暂无开通业务，请联系总部管理员',
          icon: 'none'
        })
        return
      }
      if (userInfo.isSuper) openSceneArr = [1, 0, usedCarSceneType] //超管默认开通全部场景

      userInfo = {
        ...userInfo,
        openSceneArr,
        shopMerchantName,
        shopMerchantId,
        default4SStoreInfo: {
          merchantId: shopMerchantId,
          merchantName: shopMerchantName
        },
        default4SStoreInfo_crowdFunding: {
          merchantId: shopMerchantId,
          merchantName: shopMerchantName
        },
        default4SStoreInfo_newCarConversion: {
          merchantId: shopMerchantId,
          merchantName: shopMerchantName
        }
      }
      if (openSceneArr.length == 1 && openSceneArr[0] == usedCarSceneType) {
        const data = await uni.$api.userApi.selectMerchantScene({
          merchantId: userInfo.shopMerchantId,
          merchantName: userInfo.shopMerchantName,
          sceneType: usedCarSceneType
        })
        uni.$logger.local.info(`商户只有二手车场景时自动跳转进入二手车首页！`)
        if (data) userInfo.loginRoleOnSelectMerchant = data?.loginRoleOnSelectMerchant
        userInfo.sceneType = usedCarSceneType
        uni.$storage.set('userInfo', userInfo)
        uni.reLaunch({
          url: '/pages/usedCar/index'
        })
        return
      }
      this.$emit('chooseMerchant', userInfo)
      uni.hideLoading()
    },
    searchEvent (searchValue) {
      let { copyLoginUserInfoList, selectMerchantId } = this
      copyLoginUserInfoList.map(val => {
        val.active = false
        if (val.merchantId == selectMerchantId) val.active = true
        return val
      })
      let filterArr = copyLoginUserInfoList.filter(val => val.merchantName.includes(searchValue) || val.merchantId == searchValue) || []
      this.loginUserInfoList = filterArr

      if (!searchValue) this.loginUserInfoList = copyLoginUserInfoList
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
    .right {
      margin-right: toRpx(28);
      flex-shrink: 0;
    }
    .left {
      flex: 1;
      .name {
        font-weight: 500;
        font-size: toRpx(32);
        color: #181a1f;
        margin-bottom: toRpx(12);
      }
      .text_no {
        font-size: toRpx(28);
        color: #999ea8;
      }
    }
  }
  .active {
    border: toRpx(4) solid #347bff;
  }
}
</style>
