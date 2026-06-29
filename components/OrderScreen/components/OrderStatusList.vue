<template>
  <view class="list">
    <view @click="currentId = ''" :class="['item flex', { active: !currentId }]">
      <view class="sprite-icon icon-tag-checked"></view>
      全部
    </view>
    <template v-for="(i, index) in list">
      <view :key="index" @click="currentId = i.id" :class="['item flex', { active: currentId == i.id }]">
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i.name }}
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'OrderStatusList',
  inject: ['userInfo'],
  data () {
    return {
      list: Object.freeze([
        {
          name: '待跟进',
          value: [1],
          id: 1
        },
        {
          name: '已支付',
          value: [4],
          id: 2
        },
        {
          name: '待支付',
          value: [3],
          id: 3
        },
        {
          name: '已撤销',
          value: [9],
          id: 4
        },
        {
          name: '战败',
          value: [2],
          id: 5
        },
        {
          name: '已评价',
          value: [6],
          id: 6
        },
        {
          name: '已关闭',
          value: [10],
          id: 7
        },
        {
          name: '错误订单',
          value: [11],
          id: 8
        },
        {
          name: '未施工',
          value: ['N'],
          id: 9
        },
        {
          name: '已施工',
          value: ['Y'],
          id: 10
        },
        {
          name: '已退款',
          value: [5, 12],
          id: 11
        },
        {
          name: '审批中',
          value: [14],
          id: 12
        },
      ]),
      currentId: '',
    }
  },
  props: {
    params: Object,
    data: [Array, Object],
  },
  watch: {
    currentId: {
      handler (val) {
        let { params: { idKey } } = this,
          { list } = this,
          item = list.find(item => item.id == val)
        this.$emit('choose', {
          key: idKey,
          value: item ? item.value : null
        })
      },
      deep: true
    }
  },
  mounted () {
    this.initList()
  },
  methods: {
    initList () {
      let { data, params: { idKey }, list } = this
      if (data[idKey]) {
        let item = list.find(val => val.value.join(',') == data[idKey].join(','))
        this.currentId = item ? item.id : ''
      }
      this.$emit('onComplete')
    }
  }
}
</script>

<style scoped lang="scss">
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
