<template>
  <view class="gearbox-list">
    <template v-for="(i, index) in list">
      <view
        :key="index"
        @click="choose(i)"
        :class="['item flex', { active: currentId ? i.value == currentId : i.value == data[params.idKey] }]"
      >
        <view class="sprite-icon icon-tag-checked"></view>
        <template v-if="!i.type">
          {{ i.value }}
        </template>
        <template v-else>
          <input
            type="text"
            v-model="i.value"
            class="input"
            :placeholder="i.label"
          >
        </template>
      </view>
    </template>
  </view>
</template>

<script type="text/ecmascript-6">
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'Gearbox',
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
        {
          value: 'MT变速箱'
        },
        {
          value: 'AMT变速箱'
        },
        {
          value: 'AT变速箱'
        },
        {
          value: 'CVT变速箱'
        },
        {
          value: 'DCT变速箱'
        },
        {
          label: '自定义',
          value: '',
          type: 'input'
        }
      ]
      this.updateParams(params, data)
    },
    initData (list) {
      const { params: { idKey }, data } = this
      console.log(data[idKey])
      if (data[idKey]) {
        this.currentId = data[idKey]
        this.$emit('choose', data[idKey])
        let index = list.findIndex(item => item.value == data[idKey])
        if(index == -1) list[list.length - 1].value = data[idKey]
      }
      this.list = list
      this.$emit('onComplete')
    },
    handleSearch (searchValue) {
      this.list = []
      this.getList(searchValue, true)
    },
    choose (i) {
      this.currentId = i.value
      this.$emit('choose', i.value)
    }
  }
}
</script>

<style scoped lang="scss">
.gearbox-list {
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
    .input{
      width: 100%;
      height: 100%;
      text-align: center;
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
