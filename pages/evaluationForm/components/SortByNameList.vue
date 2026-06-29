<template>
  <view class="container">
    <!-- 主内容区域 - 使用scroll-view -->
    <scroll-view class="scroll-view" scroll-y="true" :scroll-into-view="currentScrollId" @scroll="onScroll">
      <view v-if="groupedItems && Object.keys(groupedItems).length > 0">
        <view v-for="(groupItems, groupKey) in groupedItems" :key="groupKey" :id="`group-${groupKey}`">
          <view class="group-header">
            <text class="group-label">{{ groupKey }}</text>
          </view>

          <view class="items-box">
            <view v-for="item in groupItems" :key="getItemKey(item)" v-if="item[itemNameField]" :class="['item', { active: isActiveItem(item) }]" @tap="onItemClick(item)">
              {{ item[itemNameField] }}
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="items && items.length === 0" class="empty-state">
        <text>暂无数据</text>
      </view>

      <view v-else class="loading-state">
        <text>加载中...</text>
      </view>
    </scroll-view>

    <!-- 字母索引列表 - 仅在启用快速滚动时显示 -->
    <view v-if="enableFastScroll && groupKeys.length > 0" class="letter-index">
      <view v-for="key in groupKeys" :key="key" class="letter-item" @tap="scrollToLetter(key)">
        {{ key }}
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'SortByNameList',
  props: {
    items: {
      type: Array,
      default: () => []
    },

    activeValue: {
      type: [String, Number],
      default: ''
    },

    activeField: {
      type: String,
      default: 'id'
    },

    clickable: {
      type: Boolean,
      default: true
    },

    itemsPerRow: {
      type: Number,
      default: 3
    },

    itemSpacing: {
      type: Number,
      default: 32
    },

    itemKeyField: {
      type: String,
      default: 'id'
    },
    itemNameField: {
      type: String,
      default: 'name'
    },

    groupKeyField: {
      type: String,
      default: 'letter'
    },

    // 是否启用快速滚动功能
    enableFastScroll: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentScrollId: ''
    }
  },
  computed: {
    groupedItems() {
      if (!this.items || this.items.length === 0) {
        console.log('No items provided to SortByNameList')
        return {}
      }

      console.log('Items received:', this.items)
      console.log('Using groupKeyField:', this.groupKeyField)
      const groups = {}
      this.items.forEach(item => {
        const groupKey = item[this.groupKeyField] || '#'
        const key = String(groupKey).toUpperCase()

        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(item)
      })
      const sortedGroups = {}
      Object.keys(groups)
        .sort()
        .forEach(key => {
          sortedGroups[key] = groups[key]
        })
      console.log('Sorted groups:', sortedGroups)
      return sortedGroups
    },

    // 获取所有字母分组的键
    groupKeys() {
      if (!this.groupedItems) {
        return []
      }
      return Object.keys(this.groupedItems)
    }
  },
  methods: {
    onItemClick(item) {
      if (this.clickable) {
        this.$emit('item-click', item)
      }
    },

    getItemKey(item) {
      return item[this.itemKeyField] || item[this.itemNameField]
    },

    isActiveItem(item) {
      return item[this.activeField] === this.activeValue
    },

    // 滚动到指定字母分组
    scrollToLetter(key) {
      this.currentScrollId = `group-${key}`
      // 强制更新DOM后清除currentScrollId，避免重复点击同一字母失效
      this.$nextTick(() => {
        setTimeout(() => {
          this.currentScrollId = ''
        }, 100)
      })
    },

    // 监听滚动事件（可选，可用于高亮当前字母）
    onScroll(e) {
      // 这里可以根据滚动位置更新当前激活的字母索引
      // 例如：计算当前可视区域的第一个分组字母，并高亮显示
    }
  }
}
</script>
<style scoped lang="scss">
.container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scroll-view {
  height: 100%;
  background-color: #ffffff;
}

.container-list {
  background-color: #ffffff;
  height: 100%;
  overflow-y: auto;
}

.letter-index {
  position: absolute;
  right: toRpx(16);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: toRpx(10);
  padding: toRpx(5) toRpx(2);
}

.letter-item {
  width: toRpx(20);
  height: toRpx(20);
  line-height: toRpx(20);
  text-align: center;
  font-size: toRpx(26);
  color: #333;
  margin: toRpx(8) 0;
  border-radius: toRpx(3);
  &:active {
    background-color: #347bff;
    color: #fff;
  }
}

.group-header {
  display: flex;
  align-items: center;
  padding: toRpx(0) toRpx(48);
  background-color: #f5f7fa;
  height: toRpx(40);
  .group-label {
    font-size: toRpx(28);
    font-weight: 400;
    color: #888;
  }
}

.items-box {
  display: flex;
  flex-wrap: wrap;
  padding: toRpx(16) toRpx(48);
  box-sizing: border-box;
  margin: 0 toMinusRpx(16);
  border-bottom: toRpx(1) solid #f0f2f5;
}

.item {
  width: calc(33.333% - #{toRpx(32)});
  margin: toRpx(16);
  padding: toRpx(12) toRpx(24);
  color: #333333;
  font-size: toRpx(32);
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: toRpx(8);
  border: toRpx(2) solid #dce0e6;
  text-align: center;
  box-sizing: border-box;

  &:active {
    background-color: #f5f7fa;
  }
  &.active {
    background: #dee7ff;
    color: #347bff;
  }
}

.empty-state {
  padding: toRpx(60) toRpx(48);
  text-align: center;
  color: #999;
  font-size: toRpx(32);
}
.loading-state {
  padding: toRpx(60) toRpx(48);
  text-align: center;
  color: #666;
  font-size: toRpx(32);
}
</style>
