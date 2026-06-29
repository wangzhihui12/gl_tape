<template>
  <scroll-view
    class="scene-list-box"
    scroll-y
  >
    <template v-if="requestComplete">
      <view class="material-box">
        <template v-if="materialList.length">
          <template v-for="(item,index) in materialList">
            <view
              class="item"
              :key="index"
            >
              <material
                :item="item"
                :sceneMarketLevelTwoItem="sceneMarketLevelTwoItem"
              ></material>
            </view>
          </template>
          <view class="bottom flex">-已经到底了-</view>
        </template>
        <template v-else>
          <view class="list-nothing flex">
            <image
              class="icon"
              src="../../../../../assets/images/home/nothing.webp"
            />
            暂无内容
          </view>
        </template>
      </view>
    </template>
  </scroll-view>
</template>

<script type='text/ecmascript-6'>
import dayjs from 'dayjs'
import Material from './Material.vue'
export default {
  props: {
    requestParams: Object,
    sceneMarketLevelTwoItem:Object
  },
  components: {
    Material
  },
  name: '',
  data () {
    return {
      requestComplete: false,
      materialList: []
    }
  },
  mounted () {
  },
  methods: {
    async getSceneMarketMaterialList () {
      try {
        uni.showLoading({
          title: '加载中',
          mask: true
        })
        const {
          requestParams
        } = this,
          data = await uni.$api.sceneMarketApi.getSceneMarketMaterialList(requestParams)
        uni.hideLoading()
        data?.map(e => {
          e.date = dayjs(e.createdDate).format('YYYY-MM-DD')
        })
        this.materialList = data
        this.requestComplete = true
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error,
          icon: "error",
        })
      }

    },
  }
}
</script>

<style scoped lang='scss'>
.scene-list-box {
  width: 100%;
  height: 100%;
  .material-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: toRpx(28) toRpx(48);
    padding: 0 toRpx(44);
    align-content: flex-start;
    .item {
      width: calc((100% - #{toRpx(96)}) / 3);
      height: toRpx(164);
      border-radius: toRpx(16);
      background: #ffffff;
      box-shadow: 0 toRpx(8) toRpx(24) 0 #2c66f71a;
    }
    .bottom {
      margin-top: auto;
      width: 100%;
      justify-content: center;
      color: #999;
      text-align: center;
      padding: toRpx(50) 0;
      font-size: toRpx(24);
    }
  }
  .list-nothing {
    width: 100%;
    flex-direction: column;
    margin-top: toRpx(260);
    font-size: toRpx(28);
    color: #999999;
    .icon {
      width: toRpx(678);
      height: toRpx(284);
      margin-bottom: toRpx(24);
    }
  }
}
</style>