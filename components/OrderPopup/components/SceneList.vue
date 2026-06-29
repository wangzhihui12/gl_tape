<template>
  <view class="scene-list">
    <view
      v-for="(i, index) in listData"
      :key="index"
      @click="choose(i)"
      :class="['item flex', { active: checkActive(i) }]"
    >
      <view
        class="scene-type-tag"
        :style="{ background: sceneTag.bg, color: sceneTag.color }"
      >{{ sceneTag.label }}</view>
      <view class="sprite-icon icon-tag-checked"></view>
      {{ i.name || i.staffName }}
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'

const SCENE_TYPE_TAG_MAP = {
  1: { label: '轻改', bg: '#5575f51a', color: '#5575f5' },
  0: { label: '权益', bg: '#4bc8fe1a', color: '#4bc8fe' },
  2: { label: '保险', bg: '#00baad1a', color: '#00baad' },
  7: { label: '二手车', bg: '#fe624b1a', color: '#fe624b' },
  4: { label: '其他', bg: '#ff9d2e1a', color: '#ff9d2e' }
}

export default {
  mixins: [popupmixin],
  name: 'SceneList',
  inject: ['userInfo'],
  data () {
    return {
    }
  },
  computed: {
    idKey () {
      let { params: { idKey }, sceneType } = this

      return Array.isArray(idKey) ? idKey[sceneType] : idKey
    },
    sceneTag () {
      const n = Number(this.sceneType)
      const key = n >= 0 && n <= 4 ? n : 4
      return SCENE_TYPE_TAG_MAP[key] || SCENE_TYPE_TAG_MAP[4]
    }
  },
  mounted () {
  },
  methods: {
    getSceneId (item = {}) {
      return item.baseSceneCode || item.uuid
    },
    async getList (searchValue, search) {
      const { userInfo, params } = this,
        { cacheData } = params
      this.currentId = ''
      if (!search && cacheData && cacheData.length) {
        this.initData(cacheData)
        if (searchValue) this.handleSearch(searchValue)
        return
      }
      this.componentLoading(params)
      // 和 OrderScreen 的 SceneList 保持一致：走 getSceneListWithOrder
      const data = await uni.$api.equityApi.getSceneListWithOrder({
        sceneType: String(userInfo.sceneType),
        phone: userInfo.phone
      })
      const list = (data && data.length) ? data : []
      this.updateParams(params, list)
    },
    initData (list) {
      const { idKey, data } = this
      if (data[idKey]) {
        this.currentId = data[idKey]
        let item = list.find(i => this.getSceneId(i) == this.currentId)
        console.log(item)
        this.$emit('choose', item)
      }
      this.list = list
      this.$emit('onComplete')
    },
    handleSearch (searchValue) {
      const { sceneType } = this
      if (sceneType == 1) {
        this.list = []
        this.getList(searchValue, true)
      } else this.originalDataSearch(searchValue)
    },
    originalDataSearch (searchValue) {
      console.log(searchValue, '===')
      if (!searchValue) this.searchStatus = false
      else {
        searchValue = searchValue.toUpperCase()
        let { list } = this,
          employeeList = JSON.parse(JSON.stringify(list)),
          arr = []
        employeeList.map(e => {
          const sceneName = e.name || e.staffName
          if (sceneName && sceneName.toUpperCase().indexOf(searchValue) != -1) arr.push(e)
        })
        this.searchList = arr
        this.searchStatus = true
      }
    },
    choose (i) {
      let { idKey, data } = this,
        userId = data.deliveryUserId,
        referrerId = data.deliveryId,
        deliveryUserId = data.userId,
        deliveryId = data.referrerId,
        value = {
          userId,
          deliveryUserId,
          referrerId,
          deliveryId
        }[idKey]
      if (['referrerId', 'userId', 'deliveryId', 'deliveryUserId'].includes(idKey) && value == i.uuid) return uni.showToast({
        title: '销售顾问/录单员与交付专员不能选取同一人',
        icon: 'none',
        mask: true
      })
      this.currentId = this.getSceneId(i)
      this.$emit('choose', i)
    },
    checkActive (i) {
      let { currentId, idKey, data } = this
      const id = this.getSceneId(i)
      return currentId ? id == currentId : id == data[idKey]
    }
  }
}
</script>

<style scoped lang="scss">
.scene-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRpx(32);
  margin: 0 toRpx(48);
  .item {
    align-items: center;
    justify-content: start;
    height: toRpx(144);
    border-radius: toRpx(8);
    border: toRpx(2) solid #dce0e6;
    box-sizing: border-box;
    position: relative;
    color: #333333;
    font-size: toRpx(32);
    padding: 0 toRpx(32);
    box-sizing: border-box;
    .scene-type-tag {
      flex-shrink: 0;
      margin-right: toRpx(16);
      height: toRpx(48);
      line-height: toRpx(48);
      padding: 0 toRpx(12);
      border-radius: toRpx(12);
      font-size: toRpx(24);
      font-weight: 500;
      box-sizing: border-box;
    }
    .sprite-icon {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  .active {
    border-color: #2c66f7;
    color: #2c66f7;
    .sprite-icon {
      display: block;
    }
  }
}
</style>
