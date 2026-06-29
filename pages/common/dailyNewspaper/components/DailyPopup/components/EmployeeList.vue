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
      const { userInfo, params, data: { optionsKey } } = this,
        { cacheData } = params
      this.currentId = ''
      this.currentIds = []
      this.chooseList = []
      if (!search && cacheData && cacheData.length) {
        this.initData(cacheData)
        if (searchValue) this.handleSearch(searchValue)
        return
      }
      this.componentLoading(params)
      console.log(optionsKey)
      const { shopMerchantId, merchantId } = userInfo,
        apiParams = {
          merchantId: optionsKey == '4sStaffList' ? shopMerchantId : merchantId,
        }
      if (searchValue) apiParams.name = searchValue
      const data = await uni.$api.popupApi.getEmployeeList(apiParams)
      this.updateParams(params, data || [])
    },
    initData (list) {
      const { data, data: { key }, params: { multiple } } = this
      if (data[key]) {
        if (!multiple) {
          this.currentId = data[key]
          let item = list.find(i => i.uuid == this.currentId)
          this.$emit('choose', item)

        } else {
          let arr = data[key]
          this.chooseList = arr.map(i => list.find(e => e.uuid == i))
          this.currentIds = arr
          this.$emit('choose', this.chooseList)
        }
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
      let { params: { multiple }, currentIds } = this
      if (!multiple) {
        this.currentId = i.uuid
        this.$emit('choose', i)
      } else {
        let index = currentIds.indexOf(i.uuid)
        if (index == -1) {
          this.currentIds.push(i.uuid)
          this.chooseList.push(i)
        } else {
          this.currentIds.splice(index, 1)
          this.chooseList.splice(index, 1)
        }
        this.$emit('choose', this.chooseList)
      }
    },
    checkActive (i) {
      let { currentId, currentIds, data: { key }, data } = this
      if (currentIds && currentIds.length) return currentIds.includes(i.uuid)
      return currentId ? i.uuid == currentId : i.uuid == data[key]
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
