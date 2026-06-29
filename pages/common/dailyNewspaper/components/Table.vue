<template>
  <view class="table-container">
    <view class="table-scroll">
      <view class="table-wrapper" :style="tableStyle">
        <!-- 表格 -->
        <view class="table" :id="id">
          <!-- 第一行：表头 -->
          <view class="table-row header-row">
            <!-- 左上角固定单元格 -->
            <view :class="['table-cell corner-cell fixed-corner', { 'is-detail': isDetail }]"
              :style="{ width: LeftWidth, minWidth: LeftWidth }">
              <text class="cell-text">{{ cornerText }}</text>
            </view>
            <!-- 顶部表头 -->
            <view v-for="(col, colIndex) in columns" :key="'header-' + colIndex"
              :class="['table-cell header-cell fixed-header', { 'is-detail': isDetail }]"
              :style="{ width: col.width + 'rpx', minWidth: col.width + 'rpx' }">
              <text class="cell-text">
                {{ col[titleKey] }}
                <template v-if="col.required">
                  <text class="required-text">*</text>
                </template>
              </text>
            </view>
          </view>

          <!-- 数据行 -->
          <view v-for="(row, rowIndex) in tableData" :key="'row-' + rowIndex"
            :class="['table-row', { 'row-clicked': clickedRowIndex === rowIndex }]"
            @click="handleRowClick(row, rowIndex)">
            <!-- 左侧行表头 -->
            <view class="table-cell row-header-cell fixed-left" :style="{ width: LeftWidth, minWidth: LeftWidth }">
              <text class="cell-text">{{ row.rowHeader || rowIndex + 1 }}</text>
            </view>
            <!-- 数据单元格 -->
            <view v-for="(col, colIndex) in columns" :key="'cell-' + rowIndex + '-' + colIndex"
              class="table-cell data-cell" :style="{ width: col.width + 'rpx', minWidth: col.width + 'rpx' }">
              <template v-if="customTable">
                <slot name="customCell" :row="row" :col="col" :colIndex="colIndex" :rowIndex="rowIndex"></slot>
              </template>
              <template v-else>
                <text :class="[`${isDetail ? '' : 'cell-text'}`]">{{ formatValue(row.data[colIndex]) }}</text>
                <template v-if="row.unit && formatValue(row.data[colIndex]) != '-'">
                  <text class="unit">{{ row.unit }}</text>
                </template>
              </template>
            </view>
          </view>
        </view>
        <template v-if="hasFooter">
          <view class="footer-row" :style="{ width: tableWidth }" v-if="maxLength && tableData.length < maxLength">
            <view :class="['add', { 'disabled': disabled }]" @click="add"></view>
          </view>
        </template>
      </view>
    </view>

  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: 'DailyNewspaperTable',
  props: {
    // 左上角文字
    cornerText: {
      type: String,
      default: ''
    },
    // 列配置（顶部表头）
    columns: {
      type: Array,
      default: () => []
    },
    // 行数据（包含左侧行表头）
    data: {
      type: Array,
      default: () => []
    },
    LeftWidth: {
      type: String,
      default: '200rpx'
    },
    tableStyle: {
      type: String,
      default: ''
    },
    customTable: {
      type: Boolean,
      default: false
    },
    scrollY: {
      type: Boolean,
      default: false
    },
    hasFooter: {
      type: Boolean,
      default: false
    },
    titleKey: {
      type: String,
      default: 'title'
    },
    tableIndex: {
      type: Number,
      default: 0
    },
    maxLength: {
      type: Number,
      default: 20
    },
    isDetail: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      tableData: [],
      tableWidth: '',
      clickedRowIndex: -1, // 记录被点击的行索引
      clickTimer: null // 定时器
    }
  },
  watch: {
    data: {
      handler(val) {
        this.tableData = val || []
        this.$nextTick(() => {
          this.getTableWidth()
        })
      },
      immediate: true
    }
  },
  computed: {
    id() {
      return 'table-' + this.tableIndex
    },
  },
  mounted() {
  },
  methods: {
    add() {
      if (this.disabled) return
      this.$emit('clickAdd')
    },
    formatValue(value) {
      return value !== null && value !== '' && value !== undefined ? value : '-'
    },
    handleRowClick(row, rowIndex) {
      if (this.isDetail || this.disabled) return
      // 清除之前的定时器
      if (this.clickTimer) {
        clearTimeout(this.clickTimer)
      }

      this.clickedRowIndex = rowIndex;
      this.$emit('rowClick', row, rowIndex, this.tableIndex)

      // 0.5秒后清除点击样式
      this.clickTimer = setTimeout(() => {
        this.clickedRowIndex = -1
      }, 500)
    },
    getTableWidth() {
      const query = uni.createSelectorQuery()
      query.select(`#${this.id}`).boundingClientRect(data => {
        if (data && data.width) this.tableWidth = data.width + 'px'
      }).exec()
      if (!this.tableWidth) setTimeout(() => {
        this.getTableWidth()
      }, 500)

    }
  }
}
</script>

<style scoped lang='scss'>
.table-container {
  width: 100%;
  // height: 100%;
}

.table-scroll {
  width: 100%;
  height: 100%;
  overflow-x: auto;
}

.table-wrapper {
  display: inline-block;
  min-width: 100%;
}

.table {
  display: table;
  border-collapse: separate;
  border-spacing: 0;
  width: max-content;
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
  padding: 24rpx;
  text-align: center;
  vertical-align: middle;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
  border-right: 1rpx solid #fff;
  max-width: 800rpx;
  min-width: 200rpx;
}

.table-cell:last-child {
  border-right: none;
}

// 左上角固定单元格
.corner-cell {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 30;
  background-color: #f0f4ff;
  border-bottom: 2rpx solid #fff;
  border-right: 1rpx solid #fff;
}

.required-text {
  color: #f24724;
}

// 顶部表头
.header-row {
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-cell {
  background-color: #f0f4ff;
  color: #000;
  font-size: 28rpx;
  font-weight: 500;
  border-bottom: 2rpx solid #fff;
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: 20;
}

// 左侧行表头
.row-header-cell {
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: #f9fafc;
  color: #303133;
  text-align: left;
  padding-left: 20rpx;
  padding-right: 32rpx;
  border-bottom: 1rpx solid #fff;
  border-right: 1rpx solid #fff;
}

.fixed-left {
  position: sticky;
  left: 0;
  z-index: 10;
}

// 数据单元格
.data-cell {
  background-color: #f9fafc;
  border-bottom: 1rpx solid #fff;
  word-break: break-all;
}

// 点击行的样式
.row-clicked {
  .data-cell {
    background-color: rgba($color: #000000, $alpha: 0.05) !important;
  }

  .row-header-cell {
    background-color: rgba($color: #000000, $alpha: 0.05) !important;

  }
}

// 最后一行去掉底部边框
.table-row:last-child .data-cell,
.table-row:last-child .row-header-cell {
  border-bottom: none;
}

.cell-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-row {
  width: 100%;
  height: 88rpx;
  padding: 16rpx 24rpx;
  border-top: 2rpx solid #fff;
  background: #f9fafc;

  .add {
    width: 56rpx;
    height: 56rpx;
    border-radius: 16rpx;
    border: 1.6rpx solid #4673ff33;
    background: #4673ff14;
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky;
    left: 24rpx;

    &::before,
    &::after {
      position: absolute;
      content: '';
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4673ff;
      border-radius: 4rpx;
    }

    &::before {
      width: 4rpx;
      height: 28rpx;
    }

    &::after {
      width: 28rpx;
      height: 4rpx;
    }
  }
}

.is-detail {
  color: #999 !important;
}

.disabled {
  opacity: .5;
}
</style>