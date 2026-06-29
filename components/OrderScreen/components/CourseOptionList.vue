<template>
  <view class="list">
    <view
      v-for="(item, index) in options"
      :key="index"
      @click="selectOption(item)"
      :class="['item flex', { active: currentId === item.value }]"
    >
      <view class="sprite-icon icon-tag-checked"></view>
      {{ item.label }}
    </view>
  </view>
</template>

<script>
export default {
  name: 'CourseOptionList',
  data() {
    return {
      currentId: '',
      options: []
    }
  },
  props: {
    params: Object,
    data: [Object, Array]
  },
  watch: {
    currentId: {
      handler(value) {
        let { params: { idKey } } = this
        this.$emit('choose', {
          key: idKey,
          value
        })
      },
      deep: true
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      const { params } = this
      this.options = params.options || []
      
      // 初始化选中值
      let { data, params: { idKey } } = this
      if (data && data[idKey]) {
        this.currentId = data[idKey]
      }
      this.$emit('onComplete')
    },
    selectOption(item) {
      // 如果点击已选中的选项，则取消选中
      if (this.currentId === item.value) {
        this.currentId = ''
      } else {
        this.currentId = item.value
      }
    }
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

