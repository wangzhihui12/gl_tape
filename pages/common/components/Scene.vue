<template>
  <view class="box">
    <template v-for="(item, index) in sceneList">
      <view
        :key="index"
        :class="['items', `${item.actived ? 'active' : ''}`]"
        @click="selectScene(item, index)"
      >
        <view class="left">
          <view :class="['sprite-icon', `icon-scene-${item.sceneType}`]"></view>
        </view>
        <view class="right">
          <view class="name">
            {{ item.sceneName }}
          </view>
          <view class="shop_no">
            {{ item.sceneDesc }}
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import utils from '@/utils/utils.js'
export default {
  name: '',
  data () {
    return {
      sceneList: [
        {
          sceneName: '轻改',
          sceneDesc: '太阳膜升级转化',
          sceneType: 1,
          actived: false
        },
        {
          sceneName: '会员权益/升级',
          sceneDesc: '权益、延保',
          sceneType: 0,
          actived: false
        },
        {
          sceneName: '二手车',
          sceneDesc: '二手车业务',
          sceneType: 7,
          actived: false
        },
      ],
      userInfo: {},
    }
  },
  mounted () {
  },
  methods: {
    init (userInfo) {
      this.userInfo = userInfo
      uni.$logger.local.info(`进入选择场景页！`)

    },
    // 选择场景
    async selectScene ({ sceneType }, index) {
      uni.$logger.local.info(`选择场景${sceneType}！`)
      let { sceneList, userInfo, userInfo: { openSceneArr } } = this
      try {
        if (!openSceneArr.includes(sceneType) && !userInfo?.isSuper) return uni.showToast({
          title: '暂未开通此场景',
          icon: 'none'
        })
        sceneList.map(i => (i.actived = false))
        sceneList[index].actived = true
        this.sceneList = sceneList
        userInfo.sceneType = sceneType
        uni.showLoading({
          mask: true
        })
        if (userInfo?.isSuper) this.jump(userInfo)
        else {
          const data = await uni.$api.userApi.selectMerchantScene({
            merchantId: userInfo.shopMerchantId,
            merchantName: userInfo.shopMerchantName,
            sceneType
          })
          if (data) this.jump(userInfo, data)
          else {
            uni.$logger.local.error(`选择场景异常：merchantId：${userInfo.shopMerchantId},merchantName:${userInfo.shopMerchantName},sceneType:${sceneType},接口返回:${JSON.stringify(data || '')}`)
          }
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: typeof error == "string" ? error : error.toString(),
          icon: 'none'
        })
        uni.$logger.local.error(`选择场景异常：merchantId：${userInfo?.shopMerchantId},merchantName:${userInfo?.shopMerchantName},sceneType:${sceneType},失败原因:${typeof error == "string" ? error : error.toString()}`)
      }
    },
    jump: utils.throttle(async function (userInfo, data) {
      uni.$logger.local.info(`跳转进入首页！`)
      try {
        uni.hideLoading()
        if (data) userInfo.loginRoleOnSelectMerchant = data?.loginRoleOnSelectMerchant
        let { shopMerchantId } = userInfo
        //调接口获取门店主营品牌
        uni.showLoading({
          mask: true
        })
        const res = await uni.$api.userApi.getMerchantBrand({
          merchantId: shopMerchantId
        })
        uni.hideLoading()
        userInfo.channelType = res.channelType || 1 // 默认1 1问界 2 比亚迪 3 其他
        // userInfo.channelType = 2
        uni.$storage.set('userInfo', userInfo)
        let url = {
          1: '/pages/boutique/index',
          0: '/pages/equity/index',
          7: '/pages/usedCar/index'
        }[userInfo.sceneType]
        uni.reLaunch({
          url
        })
        uni.$storage.rm("boutique_YQorderSetting") //切换场景后清空配置
      } catch (error) {
        uni.$logger.local.error(`选择场景后跳转异常：${error}！`)
        uni.hideLoading()
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    }, 3000)
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
      margin-right: toRpx(28);
      flex-shrink: 0;
    }
    .right {
      flex: 1;
      .name {
        font-weight: 500;
        font-size: toRpx(32);
        color: #181a1f;
        margin-bottom: toRpx(12);
      }
      .shop_no {
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
