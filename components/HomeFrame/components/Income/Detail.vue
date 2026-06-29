<template>
  <Dailog @close="close" v-if="show" width="1288rpx" :title="detail.label" :icon="detail.icon" :scale="detail.scale">
    <view class="dailog-body" slot="content">
      <view class="table-container">
        <table class="table-box">
          <tr class="th">
            <th v-for="(item, index) in tabelTh" :key="index" :style="{ width: item.width + '%' }">{{ item.title }}</th>
          </tr>
          <tr class="tr" v-for="(item, index) in detail.recordList" :key="index">
            <td v-if="tabelTh[0].title == '序号'">{{ index + 1 }}</td>
            <td v-for="(colValue, colKey) in tabelTr" :key="colKey">
              <text class="car-box" v-if="colValue.style" :style="colValue.style(item[colValue.type])">{{ colValue.text(item[colValue.type]) }}</text>
              {{ colValue.format ? colValue.format(item[colValue.key]) : colValue.name ? colValue.name(item) : item[colValue] }}
            </td>
          </tr>
        </table>
      </view>
      <view class="table-footer flex" v-if="detail.total">
        <text>{{ detail.label }}合计：</text>
        <text class="price">{{ detail.showUnit }}¥ {{ detail.total }}</text>
      </view>
    </view>
  </Dailog>
</template>

<script>
import Dailog from './Dailog'
export default {
  props: {
    detail: {
      type: Object,
      default: () => {}
    },
    show: {
      type: Boolean,
      default: false
    },
    tabelTh: {
      type: Array,
      default: () => []
    },
    tabelTr: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Dailog
  },
  data() {
    return {}
  },
  methods: {
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
      background: #edf2ff;
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
      }

      &:last-child {
        border-right: none;
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
  color: #333333;
  font-weight: 600;
  .price {
    margin-left: auto;
  }
}
</style>
