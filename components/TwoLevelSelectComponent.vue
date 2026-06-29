<template>
  <view class="two-level-select-box">
    <view class="select" @click.stop="toggleSelect">
      {{ currentLabel }}
      <view class="sprite-icon icon-arrow-bottom"></view>
    </view>
    <view class="pop-box" v-if="isSelect">
      <view class="first-level-box ">
        <view v-for="(item, index) in selectList" :key="index" class="type-item flex" :class="getItemClass(index, item)"
          @click="chooseFirstLevel(index, item)">
          <view class="item-label">{{ item[labelKey] }}</view>
        </view>
      </view>
      <view class="second-level-box" v-if="showSecondLevel && currentFirstLevel && currentFirstLevel.children && currentFirstLevel.children.length">
        <view v-for="(child, childIndex) in currentFirstLevel.children" :key="childIndex" class="type-item flex"
          :class="childIndex === selectSecondIndex ? 'active' : ''" @click.stop="chooseSecondLevel(childIndex, child)">
          {{ child[labelKey] }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    selectList: Array,
    labelKey: {
      type: String,
      default: 'label'
    }
  },
  name: 'TwoLevelSelectComponent',
  data() {
    return {
      selectFirstIndex: 0,
      selectSecondIndex: -1,
      isSelect: false,
      showSecondLevel: false,
      currentFirstLevel: null
    }
  },
  watch: {
    selectList: {
      immediate: true,
      handler (n) {
        if (Array.isArray(n) && n.length) {
          this.selectFirstIndex = 0
          this.currentFirstLevel = n[0]
          if (this.currentFirstLevel.children && this.currentFirstLevel.children.length) {
            this.showSecondLevel = true
            const idx = this.currentFirstLevel.children.findIndex(c => c[this.labelKey] === '全部')
            this.selectSecondIndex = idx !== -1 ? idx : 0
          } else {
            this.showSecondLevel = false
            this.selectSecondIndex = -1
          }
        }
      }
    }
  },
  computed: {
    currentLabel() {
      const firstItem = this.selectList[this.selectFirstIndex]
      if (!firstItem) return ''

      // 如果有选中的二级分类
      if (this.selectSecondIndex >= 0 && firstItem.children && firstItem.children[this.selectSecondIndex]) {
        console.log(111111)
        const child = firstItem.children[this.selectSecondIndex]
        const childLabel = child[this.labelKey]
        if (childLabel === '全部') return firstItem[this.labelKey]
        return childLabel
      }

      // 否则显示一级分类
      return firstItem[this.labelKey]
    }
  },
  methods: {
    getItemClass(index, item) {
      const classes = []
      if (index === this.selectFirstIndex) {
        classes.push('active')
      }
      if (item.children && item.children.length) {
        classes.push('has-children')
      }
      return classes.join(' ')
    },
    hideSelect() {
      this.isSelect = false
    },
    toggleSelect() {
      this.isSelect = !this.isSelect
      if (this.isSelect && this.currentFirstLevel && this.currentFirstLevel.children && this.currentFirstLevel.children.length) {
        this.showSecondLevel = true
      }
    },
    chooseFirstLevel(index, item) {
      // 如果有二级菜单，显示二级菜单
      if (item.children && item.children.length) {
        this.currentFirstLevel = item
        this.selectFirstIndex = index
        this.showSecondLevel = true
        const idx = item.children.findIndex(c => c[this.labelKey] === '全部')
        this.selectSecondIndex = idx !== -1 ? idx : 0
        if(item.children.length === 1 && item.children[0][this.labelKey] === '全部') {
          this.isSelect = false
          this.$emit('chooseType', { item, index, level: 1 })
        }
      } else {
        // 没有二级菜单，直接选中
        this.selectFirstIndex = index
        this.selectSecondIndex = -1
        this.isSelect = false
        this.$emit('chooseType', { item, index, level: 1 })
      }
    },
    chooseSecondLevel(childIndex, child) {
      this.selectSecondIndex = childIndex
      this.isSelect = false
      const isAll = child && child[this.labelKey] === '全部'
      if (isAll) {
        this.$emit('chooseType', {
          item: this.currentFirstLevel,
          index: this.selectFirstIndex,
          level: 1
        })
      } else {
        this.$emit('chooseType', {
          item: child,
          index: childIndex,
          parentIndex: this.selectFirstIndex,
          parent: this.currentFirstLevel,
          level: 2
        })
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.two-level-select-box {
  position: relative;
  z-index: 5;

  .select {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: toRpx(84);
    border-radius: toRpx(16);
    opacity: 1;
    background: #f2f2f2;
    padding: 0 toRpx(24) 0 toRpx(40);
  }

  .pop-box {
    position: absolute;
    top: toRpx(100);
    left: 0;
    background: #ffffff;
    box-shadow: 0 0 toRpx(16) 0 #99999933;
    border-radius: toRpx(16);
    padding: toRpx(16) 0;
    animation: show-view-opacity 0.15s forwards;
    display: flex;
    max-height: toRpx(600);
    overflow-y: auto;

    .first-level-box {
      text-align: left;
      // height: 100%;
      // overflow-y: auto;
      .item-label {
        display: inline-block;
        white-space: nowrap;
      }
    }

    .second-level-box {
      width: toRpx(400);
      // height: 100%;
      // overflow-y: auto;
    }

    .type-item {
      padding: 0 toRpx(28);
      margin-bottom: toRpx(8);
      height: toRpx(84);
      // justify-content: center;
      align-items: center;

      &:last-child {
        margin-bottom: 0;
      } &.active {
        background-color: #ecf1ff;
      }
    }
  }
  
}
</style>

