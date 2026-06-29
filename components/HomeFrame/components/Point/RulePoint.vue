<template>
  <view class="point-box">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">
        <text>{{ pageName }}</text>
      </view>
    </view>
    <view class="rule-table">
      <view class="table-box">
        <table class="score-table">
          <tr class="th">
            <th v-for="(item, index) in tabelTh" :key="index" :style="{ width: item.width + 'vw' }">{{ item.title }}</th>
          </tr>
          <tr v-for="(item, index) in tabelTr" :key="index" :class="{ line: item.row1Span }">
            <td class="row_1" :rowspan="item.row1Span" v-if="item.showRow1">{{ item.categoryName }}</td>
            <td :rowspan="item.row2Span" v-if="item.showRow2">{{ item.typeName }}</td>
            <td>{{ item.description }}</td>
            <td>
              <template v-if="item.pointValue">{{ item.pointValue }}</template>
              <text v-else>导入</text>
            </td>
            <td>{{ item.pointsValueMax }}</td>
            <td>{{ item.detail }}</td>
          </tr>
        </table>
      </view>
    </view>
  </view>
</template>
<script>
import point from '@/mixin/point'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, pointTrack],
  data() {
    return {
      pageName: '积分规则',
      eventCode: 'app_point_rule',
      selectItem: {},
      tabelTh: [
        { title: '分类', width: 6 },
        { title: '积分类型', width: 7 },
        { title: '积分描述', width: 13 },
        { title: '积分值', width: 5 },
        { title: '月满积分值', width: 8 },
        { title: '说明', width: 50 }
      ],
      tabelTr: [],
      processedData: [],
      result: [],
      show: false
    }
  },
  methods: {
    getDetail() {
      uni.$api.pointApi.pointRuleDetail().then(res => {
        let result = []
        let row1Span = 0
        let row2Span = 0
        const obj = res || []
        obj.forEach((item, index) => {
          if (index === 0 || obj[index - 1].categoryName !== item.categoryName) {
            row1Span = obj.filter((el, idx) => idx >= index && el.categoryName === item.categoryName).length
            result.push({ ...item, row1Span, showRow1: true })
          } else {
            result.push({ ...item, showRow1: false })
          }
          if (index === 0 || obj[index - 1].typeName !== item.typeName || obj[index - 1].categoryName !== item.categoryName) {
            row2Span = obj.filter((el, idx) => idx >= index && el.categoryName === item.categoryName && el.typeName === item.typeName).length
            result[index].row2Span = row2Span
            result[index].showRow2 = true
          } else {
            result[index].showRow2 = false
          }
        })
        this.tabelTr = result
      })
    },
    handleGo(val) {
      this.selectItem = val
      this.show = true
    }
  }
}
</script>
<style scoped lang="scss">
.point-box {
  position: relative;
}

.nav-bar {
  width: 100%;
  height: 96rpx;
  margin-top: 48rpx;
  display: flex;
  align-items: center;

  .back {
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .title {
    font-weight: 700;
    font-size: 32rpx;
    color: #1a1a1a;
    flex: 1;
    text-align: center;

    text {
      margin-left: -96rpx;
    }
  }
}

.rule-table {
  background: #ffffff;
  border-radius: 48rpx;
  padding: 32rpx 64rpx;
  margin: 20rpx 64rpx;
  height: calc(100vh - 196rpx);

  .table-box {
    height: calc(100%);
    overflow-y: auto;
  }

  .score-table {
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
        padding: 8px;
        border-top: none;
        /* 除了首行外，所有行的上方无边框 */
        background: #edf2ff;
        height: 88rpx;
        font-size: 26rpx;
        color: #333333;

        &:first-child {
          border-left: none;
          border-radius: 16rpx 0 0 16rpx;
        }

        &:last-child {
          border-radius: 0 16rpx 16rpx 0;
        }
      }

      td {
        border: 4rpx solid #fff;
        /* 所有单元格都有边框 */
        padding: 8px;
        border-top: none;
        /* 除了首行外，所有行的上方无边框 */
        background: #f7f8fa;
        height: 88rpx;
        font-size: 26rpx;
        color: #333333;
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
}
</style>
