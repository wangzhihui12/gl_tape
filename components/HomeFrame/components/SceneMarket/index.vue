<template>
  <view class="scene-market-box">
    <type-tab-component
      :typeList="typeList"
      :tabIndex="tabIndex"
      @tabClick="tabBarClick"
      nameKey="directoryName"
    ></type-tab-component>
    <view class="scene-market-content">
      <view class="tabs flex">
        <template v-for="i in sceneMarketLevelTwoList">
          <view
            :class="['tab flex',{active: tagId == i.id}]"
            :key="i.id"
            @click="tabClick(i)"
          >{{i.directoryName}}</view>
        </template>
      </view>
      <scene-list
        class="scene-list"
        ref="sceneListRef"
        :requestParams="requestParams"
        :sceneMarketLevelTwoItem="sceneMarketLevelTwoItem"
      />
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import TypeTabComponent from '../../../TypeTabComponent.vue'
import SceneList from './compontens/SceneList.vue'
export default {
  components: {
    TypeTabComponent,
    SceneList
  },
  name: '',
  data () {
    return {
      typeList: [],
      tabIndex: -1,
      tagId: '',
      requestParams: {}
    }
  },
  computed: {
    sceneListRef () {
      return this.$refs.sceneListRef
    },
    sceneMarketLevelTwoList () {
      return this.typeList[this.tabIndex]?.sceneMarketLevelTwoList || []
    },
    sceneMarketLevelTwoItem () {
      return this.sceneMarketLevelTwoList.find(e => e.id == this.tagId)
    }
  },
  mounted () {
    this.getSceneMarketMaterialMenu()
  },
  methods: {
    async getSceneMarketMaterialMenu () {
      const typeList = await uni.$api.sceneMarketApi.getSceneMarketMaterialMenu()
      this.typeList = typeList
      this.tabBarClick(0)
    },
    tabBarClick (index) {
      if (this.tabIndex == index) return
      const tabIndex = index,
        {
          typeList
        } = this
      this.tabIndex = tabIndex
      let detail = typeList[tabIndex].code
      if (typeList[tabIndex]?.sceneMarketLevelTwoList.length) detail = typeList[tabIndex].sceneMarketLevelTwoList[0]
      this.tabClick(detail)
    },
    tabClick ({ code: businessCode, id }) {
      this.tagId = id
      if (this.requestParams.businessCode == businessCode) return
      this.requestParams.businessCode = businessCode
      this.sceneListRef.requestComplete = false
      this.sceneListRef.getSceneMarketMaterialList()
    },

  }
}
</script>

<style scoped lang='scss'>
.scene-market-box {
  height: calc(100vh - #{toRpx(144)});
  margin: toRpx(64) toRpx(48) 0 0 ;
  border-radius: toRpx(48);
  background: #ffffff59;
  backdrop-filter: blur(toRpx(16));
  box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
  box-sizing: border-box;
  overflow: hidden;
  border: toRpx(2) solid #ffffff;
  .scene-market-content {
    width: 100%;
    height: calc(100% - #{toRpx(128)});
    background: #ffffff;
    transform: translateY(toMinusRpx(32));
    box-sizing: border-box;
    border-radius: toRpx(48);
    .tabs {
      gap: toRpx(24);
      padding: toRpx(40) toRpx(44);
      .tab {
        height: toRpx(80);
        background: #f2f2f2;
        padding: 0 toRpx(32);
        color: #666666;
        font-size: toRpx(28);
        border-radius: toRpx(16);
      }
      .active {
        background: #2d66f71a;
        color: #2d66f7;
        font-weight: 500;
      }
    }
    .scene-list {
      height: calc(100% - #{toRpx(160)});
    }
  }
}
</style>