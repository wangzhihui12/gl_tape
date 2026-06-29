<template>
  <view class="order-list">
    <template v-for="(i, index) in listData">
      <view :key="index" @click="choose(i)" :class="['item flex', { active: checkActive(i) }]">
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i.orderCode }}
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'OrderList',
  inject: ['userInfo'],
  data() {
    return {
    }
  },
  computed: {
    idKey() {
      let { params: { idKey }, sceneType } = this

      return Array.isArray(idKey) ? idKey[sceneType] : idKey
    }
  },
  mounted() {
  },
  methods: {
    async getList(searchValue, search) {
      const { userInfo, params, data, reqParams } = this,
        { cacheData } = params
      this.currentId = ''
      // if (!search && cacheData && cacheData.length) {
      // this.initData(cacheData)
      //   return
      // }
      this.componentLoading(params)
      const { shopMerchantId, uuid } = userInfo,
        apiParams = {
          merchantId:shopMerchantId,
          sellerUserId: uuid,
          ...reqParams
        }
      const res = await uni.$api.dailyTemplateApi.getGoodsOrderList(apiParams)
      this.updateParams(params, res || [])
    },
    initData(list) {
      const {  data: { value } } = this
      if (value) {
        this.currentId = value
        let item = list.find(i => i.orderCode == this.currentId)
        this.$emit('choose', item)
      }
      this.list = list
      this.$emit('onComplete')
    },
    choose(i) {
      this.currentId = i.orderCode
      this.$emit('choose', i)
    },
    checkActive(i) {
      let { currentId, data: { value } } = this
      return currentId ? i.orderCode == currentId : i.orderCode == value
    }
  }
}
</script>

<style scoped lang="scss">
.order-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
