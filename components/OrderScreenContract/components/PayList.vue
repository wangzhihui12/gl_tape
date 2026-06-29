<template>
  <view class="list">
    <view
      @click="currentId = ''"
      :class="['item flex',{active:!currentId}]"
    >
      <view class="sprite-icon icon-tag-checked"></view>
      全部
    </view>
    <template v-for="(i, index) in list">
      <view
        :key="index"
        @click="currentId = i.value"
        :class="['item flex',{active:currentId == i.value}]"
      >
        <view class="sprite-icon icon-tag-checked"></view>
        {{i.name}}
      </view>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
const payTypeList = [{
  name: '门店收款',
  value: 2
},
{
  name: '微信支付',
  value: 1
},
{
  name: 'POS机支付',
  value: 3
},
{
  name: '支付宝支付',
  value: 4
},
{
  name: '嘀加收款',
  value: 5
}
]
export default {
  name: 'PayList',
  inject: ['userInfo'],
  data () {
    return {
      list: [],
      currentId: '',
    }
  },
  props: {
    params: Object,
    data: [Object, Array],
  },
  watch: {
    currentId: {
      handler (value) {
        let { params: { idKey } } = this
        this.$emit('choose', {
          key: idKey,
          value
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
      const { merchantId } = userInfo,
        data = await uni.$api.popupApi.getYqStoreConfig({
          yqMerchantId: merchantId
        })
      if (data) {
        let obj = data || {}
        let m = obj.supportPayTypes || []
        let n = JSON.parse(JSON.stringify(payTypeList))
        let payList = n.filter(k => {
          let idx = m.find(j => j == k.value)
          return idx >= 0
        })
        payList = [
          ...payList,
          {
            name: '对公转账',
            value: '6'
          },
          {
            name: '其它收款',
            value: '7'
          }
        ]
        this.initList(payList)
        params.cacheData = payList
        this.$emit('update:params', params)
      }
    },
    initList (list) {
      this.list = list
      let { data, params: { idKey } } = this
      this.currentId = data[idKey]
      this.$emit('onComplete')
    },
  }
}
</script>

<style scoped lang='scss'>
.list {
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
  .splice {
    color: #333333;
    font-size: toRpx(32);
    margin: 0 toRpx(8);
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