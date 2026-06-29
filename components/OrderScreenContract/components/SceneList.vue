<template>
    <view class="employee-list">
      <view @click="currentId = ''" :class="['item flex', { active: !currentId }]">
        <view class="sprite-icon icon-tag-checked"></view>
        全部
      </view>
      <view v-for="(i, index) in list" :key="index" @click="choose(i)" :class="['item flex', { active: checkActive(i) }]">
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i.name || i.staffName }}
      </view>
    </view>
  </template>
  
  <script type="text/ecmascript-6">
  export default {
    name: 'SceneList',
    inject: ['userInfo'],
    data () {
      return {
        list: [],
        currentId: ''
      }
    },
    props: {
      params: Object,
      data: [Array, Object],
    },
    watch: {
      currentId: {
        handler (val) {
          let { params: { idKey } } = this
          this.$emit('choose', {
            key: idKey,
            // 场景名称单选：baseSceneCode 始终为 string（空字符串表示“全部”）
            value: val ? String(val) : ''
          })
        },
      }
    },
    mounted () {
      this.getList()
    },
    methods: {
      getSceneId (item = {}) {
        return item.baseSceneCode
      },
      async getList () {
        const { userInfo, params } = this,
          { cacheData } = params
        if (cacheData && cacheData.length) {
          this.initList(cacheData)
          return
        }
        const data = await uni.$api.equityApi.getSceneListWithOrder({
          sceneType: String(userInfo.sceneType),
          phone: userInfo.phone
        })
        const list = (data && data.length)
          ? data
          : [
              { uuid: '100101', name: '精品升级', baseSceneCode: '100101', sceneType: 1, businessType: null },
              { uuid: '100102', name: '交新车干配', baseSceneCode: '100102', sceneType: 2, businessType: null },
              { uuid: '100103', name: '售后众筹', baseSceneCode: '100103', sceneType: 3, businessType: null },
              { uuid: '110101', name: '售前会员权益升级', baseSceneCode: '110101', sceneType: 0, businessType: 1 },
              { uuid: '110102', name: '售后会员权益升级', baseSceneCode: '110102', sceneType: 0, businessType: 1 },
              { uuid: '110201', name: '售前延保', baseSceneCode: '110201', sceneType: 0, businessType: 2 },
              { uuid: '110202', name: '售后延保', baseSceneCode: '110202', sceneType: 0, businessType: 2 },
              { uuid: '120101', name: '二手车收车', baseSceneCode: '120101', sceneType: 7, businessType: null }
            ]
        this.initList(list)
        params.cacheData = list
        this.$emit('update:params', params)
      },
      initList (list) {
        let { data, params: {idKey} } = this
        this.list = list
        const paramsData = idKey ? data?.[idKey] : data
        // 兼容历史值：如果传进来是数组，取第一个；否则按 string 处理
        if (Array.isArray(paramsData)) this.currentId = paramsData[0] ? String(paramsData[0]) : ''
        else this.currentId = paramsData ? String(paramsData) : ''
        this.$emit('onComplete')
      },
      choose (i) {
        if (!i) return
        const sceneId = this.getSceneId(i)
        if (!sceneId) return
        // 单选：点击已选项不取消
        if (String(this.currentId) === String(sceneId)) return
        this.currentId = String(sceneId)
      },
      checkActive (i) {
        const id = this.getSceneId(i)
        if (!id) return false
        return this.currentId ? String(this.currentId) === String(id) : false
      },
    }
  }
  </script>
  
  <style scoped lang="scss">
  .employee-list {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: toRpx(32);
    margin: 0 toRpx(48);
    .item {
      justify-content: center;
      height: toRpx(72);
      border-radius: toRpx(8);
      border: toRpx(2) solid #dce0e6;
      box-sizing: border-box;
      position: relative;
      color: #333333;
      font-size: toRpx(32);
      .sprite-icon {
        display: none;
        position: absolute;
        top: 0;
        right: 0;
      }
    }
    .active {
      border-color: #2c66f7;
      background: #ecf1ff;
      color: #2c66f7;
      .sprite-icon {
        display: block;
      }
    }
  }
  </style>
  