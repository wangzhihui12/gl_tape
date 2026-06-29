<template>
  <view class="employee-list">
    <template v-for="(i, index) in listData">
      <view
        :key="index"
        @click="choose(i)"
        :class="['item flex', { active: checkActive(i) }]"
      >
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i.staffName }}
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'EmployeeList',
  inject: ['userInfo'],
  data () {
    return {
    }
  },
  computed: {
    idKey () {
      let { params: { idKey }, sceneType } = this

      return Array.isArray(idKey) ? idKey[sceneType] : idKey
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
        if (searchValue) this.handleSearch(searchValue)
        return
      }
      this.componentLoading(params)
      const { shopMerchantId, sceneType, merchantId } = userInfo,
        apiTargetName = sceneType == 1 || params.defeat ? 'getEmployeeList' : 'getOrderScreenEmployeeList',
        apiParams = {
          merchantId: params.idKey == 'sellerUserId' ? merchantId : shopMerchantId,
          sceneList: params.idKey == 'sellerUserId' ? '' : [sceneType],
        }
      if (searchValue) apiParams.name = searchValue
      const data = await uni.$api.popupApi[apiTargetName](apiParams)
      this.updateParams(params, data || [])
    },
    initData (list) {
      const { idKey, data } = this
      if (data[idKey]) {
        this.currentId = data[idKey]
        let item = list.find(i => i.uuid == this.currentId)
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
          if (e.staffName && e.staffName.toUpperCase().indexOf(searchValue) != -1) arr.push(e)
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
      this.currentId = i.uuid
      this.$emit('choose', i)
    },
    checkActive (i) {
      let { currentId, idKey, data } = this
      return currentId ? i.uuid == currentId : i.uuid == data[idKey]
    }
  }
}
</script>

<style scoped lang="scss">
.employee-list {
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
