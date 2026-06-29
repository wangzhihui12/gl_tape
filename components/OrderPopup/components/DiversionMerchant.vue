<template>
  <view class="merchant-list">
    <template v-for="(i, index) in list">
      <view
        :key="index"
        @click="choose(i)"
        :class="['item flex',{active: currentId ? i.subMerchantId == currentId : i.subMerchantId == data[params.idKey]}]"
      >
        <view class="sprite-icon icon-tag-checked"></view>
        {{i.subMerchantName}}
      </view>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'DiversionMerchant',
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    async getList () {
      const { userInfo: { shopMerchantId }, params } = this,
        { cacheData } = params
      this.currentId = ''
      if (cacheData && cacheData.length) {
        this.initData(cacheData)
        return
      }
      const data = await uni.$api.popupApi.getDiversionMerchantRef({
        merchantId: shopMerchantId
      })
      this.updateParams(params, data || [])
    },
    initData (list) {
      const { params: { idKey }, data } = this
      if (data[idKey]) {
        this.currentId = data[idKey]
        let item = list.find(i => i.subMerchantId == this.currentId)
        this.$emit('choose', item)
      }
      this.list = list
      this.$emit('onComplete')
    },
    choose (i) {
      this.currentId = i.subMerchantId
      this.$emit('choose', i)
    }
  }
}
</script>

<style scoped lang='scss'>
.merchant-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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