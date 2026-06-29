<template>
  <view class="employee-list">
    <view @click="currentIds = []" :class="['item flex', { active: !currentIds.length }]">
      <view class="sprite-icon icon-tag-checked"></view>
      全部
    </view>
    <template v-for="(i, index) in list">
      <view :key="index" @click="choose(i)" :class="['item flex', { active: checkActive(i) }]">
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i.staffName }}
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'EmployeeList',
  inject: ['userInfo'],
  data () {
    return {
      list: [],
      currentIds: []
    }
  },
  props: {
    params: Object,
    data: [Array, Object],
  },
  watch: {
    currentIds: {
      handler (val) {
        let { params: { idKey } } = this
        this.$emit('choose', {
          key: idKey,
          value: val.length ? val : null
        })
      },
      deep: true
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    async getList () {
      const { userInfo, params } = this,
        { cacheData } = params
      if (cacheData && cacheData.length) {
        this.initList(cacheData)
        return
      }
      const { shopMerchantId, sceneType, merchantId } = userInfo,
        data = await uni.$api.popupApi.getOrderScreenEmployeeList({
          merchantId: params.idKey == 'transferIds' ? merchantId : shopMerchantId,
          sceneList: params.idKey == 'transferIds' ? '' : [sceneType]
        })
      if (data && data.length) {
        this.initList(data)
        params.cacheData = data
        this.$emit('update:params', params)
      }
    },
    initList (list) {
      let { data, params: {idKey} } = this
      this.list = list
      let paramsData = idKey ? data[idKey] : data
      if (paramsData && paramsData.length) paramsData.map(e => {
        this.currentIds.push(e)
      })
      this.$emit('onComplete')
    },
    choose (i) {
      if (i) {
        let { uuid } = i,
          { currentIds } = this,
          index = currentIds.indexOf(uuid)
        if (index == -1) this.currentIds.push(uuid)
        else this.currentIds.splice(index, 1)
      }
    },
    checkActive (i) {
      let { currentIds } = this,
        active = false
      if (currentIds.length) active = currentIds.includes(i.uuid)
      return active
      // return this.currentIds.includes(i.uuid)
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
