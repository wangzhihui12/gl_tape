<template>
  <view class="employee-list">
    <template v-for="(i, index) in list">
      <view :key="index" @click="choose(i)" :class="['item flex', { active: currentId ? i.id == currentId : i.id == data[params.idKey] }]">
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i.name + ' | ' + i.phone }}
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'AgreementList',
  inject: ['userInfo'],
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    async getList (searchValue, search) {

      const { userInfo, params } = this

         const res = await uni.$api.evaluationApi.getCustodyAgreementList()
         if(res.data.code == 0) {
    this.updateParams(params, res.data.data || [])
         }


    },
    initData (data) {
      this.list = data
      this.$emit('onComplete')
    },
    handleSearch (searchValue) {
      this.list = []
      this.getList(searchValue, true)
    },
    choose (i) {
      console.log('choose', i)
      let { params: { idKey }, data } = this,
        value = {
          userId: data.deliveryUserId,
          deliveryUserId: data.userId
        }[idKey]
      if ((idKey == 'userId' || idKey == 'deliveryUserId') && value == i.uuid) return uni.showToast({
        title: '销售顾问/录单员与交付专员不能选取同一人',
        icon: 'none',
        mask: true
      })
      this.currentId = i.id
      this.$emit('choose', i)
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
