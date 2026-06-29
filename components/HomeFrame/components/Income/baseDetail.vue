<template>
  <Dailog @close="close" v-if="show" width="1440rpx" :title="detail.label" :icon="detail.icon">
    <view class="dailog-body" slot="content">
      <view class="table-container">
        <table class="table-box">
          <tr class="th">
            <th v-for="(item, index) in detail.th" :key="index" :style="{ width: item.width + '%' }">{{ item.title }}</th>
          </tr>
          <tr class="tr" v-for="(item, index) in detail.exceptionDetailList" :key="index">
            <td v-for="(colValue, colKey) in detail.th" :key="colKey">{{ item[colValue.value] ? item[colValue.value] : colValue.value == 'attendanceType' ? detail.desc : '' }}</td>
          </tr>
        </table>
      </view>
      <view class="table-footer flex">
        <text>合计：{{ detail.label }}{{ detail.exceptionDetailList && detail.exceptionDetailList.length }}次</text>
        <text class="price">{{ detail.total }}</text>
        <text class="total-text">{{ getCount(detail.exceptionDetailList) }}天</text>
      </view>
      <view class="tips-box">{{ detail.tips }}</view>
    </view>
  </Dailog>
</template>

<script>
import Dailog from './Dailog'
import utils from '@/utils/utils'
export default {
  props: {
    detail: {
      type: Object,
      default: () => {}
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Dailog
  },
  data() {
    return {}
  },
  methods: {
    getCount(val) {
      return val.reduce((pre, cur) => {
        return utils.calcAdd(pre, isNaN(cur.deductionDays) ? 0 : cur.deductionDays)
      }, 0)
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.table-container {
  max-height: 50vh;
  overflow: auto;
}
.table-box {
  width: 100%;
  padding: 0 64rpx;
  border-collapse: separate;
  /* 防止边框合并 */
  border-spacing: 0;
  border: none;

  .th {
    position: sticky;
    top: 0;
  }
  /* 单元格之间没有间距 */
  tr {
    border: none;
    text-align: center;

    &.line {
      td {
        border-top: 16rpx solid rgba($color: #fff, $alpha: 0.9);
      }
    }

    th {
      border: 4rpx solid #fff;
      /* 所有单元格都有边框 */
      border-top: none;
      /* 除了首行外，所有行的上方无边框 */
      background: #edf3ff;
      height: 88rpx;
      font-size: 26rpx;
      box-sizing: border-box;
      color: #333333;

      &:first-child {
        border-left: none;
        border-radius: 16rpx 0 0 16rpx;
      }

      &:last-child {
        border-radius: 0 16rpx 16rpx 0;
        text-align: right;
        padding-right: 48rpx;
      }
    }

    td {
      .car-box {
        padding: 4rpx;
        font-size: 24rpx;
        border-radius: 4rpx;
        margin-right: 6rpx;
      }
      border: 4rpx solid #fff;
      /* 所有单元格都有边框 */
      border-top: none;
      /* 除了首行外，所有行的上方无边框 */
      background: #f7f8fa;
      height: 88rpx;
      font-size: 26rpx;
      color: #333333;
      text-align: center;
      box-sizing: border-box;
      &:last-child {
        text-align: right;
        padding-right: 48rpx;
      }
      text {
        color: #c8c8cc;
      }
      &.line {
        border-bottom: 16rpx solid #fff;
      }

      &:first-child {
        border-left: none;
        border-radius: 0;
      }

      &:last-child {
        border-right: none;
        border-radius: 0;
      }
    }
  }
}
.table-footer {
  margin: 0 64rpx;
  height: 88rpx;
  padding: 0 48rpx;
  background: #edf3ff;
  border-radius: 0 0 16rpx 16rpx;
  font-size: 26rpx;
  color: #eb4e4e;
  font-weight: 600;
  .price {
    margin-left: auto;
  }
}
.tips-box {
  color: #808291;
  font-size: 26rpx;
  margin: 48rpx 64rpx 0;
}
</style>
