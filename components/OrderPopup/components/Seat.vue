<template>
  <view class="seat-list">
    <template v-for="(i, index) in list">
      <view
        :key="index"
        @click="choose(i)"
        :class="['item flex', { active: currentId ? i == currentId : i == data[params.idKey] }]"
      >
        <view class="sprite-icon icon-tag-checked"></view>
        {{ i }}
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'Seat',
  inject: ['userInfo'],
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    async getList () {
      const { params } = this
      this.currentId = ''
      let data = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
      ]
      this.updateParams(params, data)
    },
    initData (list) {
      const { params:{idKey}, data } = this
      if(data[idKey]) {
        this.currentId = data[idKey]
        this.$emit('choose', data[idKey])
      }
      this.list = list
      this.$emit('onComplete')
    },
    handleSearch (searchValue) {
      this.list = []
      this.getList(searchValue, true)
    },
    choose (i) {
      this.currentId = i
      this.$emit('choose', i)
    }
  }
}
</script>

<style scoped lang="scss">
.seat-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
