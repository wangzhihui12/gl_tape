<template>
  <view class="customer-list">
    <template v-for="(i, index) in listData">
      <view
        :key="index"
        @click="choose(i)"
        :class="['item flex', { active: checkActive(i) }]"
      >
        <view class="sprite-icon icon-tag-checked"></view>
        <view class="info flex text-hide">
          <template v-if="i.customerName || (i.customer && i.customer.customerName)">
            {{ i.customerName || (i.customer && i.customer.customerName) }}
          </template>
          <template v-if="i.carSeriesName || i.carType">
            <view class="car-model  text-hide">（{{ i.carType ? i.carType : i.carChildsBrandName + '-' + i.carSeriesName || '' }}）</view>
          </template>
        </view>
        <template v-if="i.customerPhone || i.customer.customerPhone">
          <view class="phone">｜{{ i.customerPhone || (i.customer && i.customer.customerPhone) }}</view>
        </template>
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'Customer',
  inject: ['userInfo'],
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    async getList (searchValue, search) {
      const { userInfo, params } = this,
        { cacheData } = params
      this.currentId = ''
      if (!search && cacheData && cacheData.length) {
        this.initData(cacheData)
        return
      }
      this.componentLoading(params)
      const { shopMerchantId } = userInfo,
        apiParams = {
          merchantId: shopMerchantId,
          pageSize: 999999,
          currentPage: 1,
          search: searchValue
        }
      let apiTargetName = !params.defeat ? 'getQuotationCustomerList' : 'getWorkPackageGoodsList'
      console.log(apiTargetName, 'apiTargetName')
      if (params.defeat) {
        apiParams.keyword = searchValue
      }
      const { list } = await uni.$api.popupApi[apiTargetName](apiParams)
      let customerList = list
      if (params.defeat) {
        const listArray = list.map(item => {
          if (item.customer && item.customer.carSeriesName) {
            item.carType = `${item.customer.carBrand || ''}-${item.customer.carChildsBrandName || ''}-${item.customer.carSeriesName || ''}`
          }
          return item
        })
        customerList = listArray
      }
      console.log(customerList, 'customerList')
      this.updateParams(params, customerList || [])
    },
    initData (list) {
      const { params: { idKey, defeat }, data } = this
      let key = defeat ? 'id' : 'customerPhone'
      console.log(data, idKey)
      if (data[idKey]) {
        this.currentId = data[idKey]
        let item = list.find(i => i[key] == this.currentId)
        this.$emit('choose', item)
      }
      this.list = list
      this.$emit('onComplete')
    },
    handleSearch (searchValue) {
      this.list = []
      this.getList(searchValue, true)
    },
    choose (i) {
      let { params } = this
      let key = params.defeat ? 'id' : 'customerPhone'
      this.currentId = i[key]
      this.$emit('choose', i)
    },
    checkActive (i) {
      let { currentId, data, params } = this
      let key = params.defeat ? 'id' : 'customerPhone'
      return currentId ? (i[key] == currentId) : (i[key]) == data[params.idKey]
    }
  }
}
</script>

<style scoped lang="scss">
.customer-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
    .info{
      max-width: 70%;
    }
    .phone{
      flex-shrink: 0;
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
