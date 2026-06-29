<template>
  <view class="daily-report">
    <view class="common-title">
      基础信息
    </view>
    <view class="content">
      <template v-if="loadComplete">
        <template v-if="list.length">
          <template v-for="(item, index) in list">
            <template v-if="item.type == 'subform'">
              <view class="list-box" :key="`subform-${index}`" v-if="item.children && item.children.length">
                <view class="list-title">{{ item.label }}</view>
                <Table :columns="item.columns" :data="item.dataList" tableStyle="padding-right:32rpx"
                  cornerText="门店日报内容项" isDetail />

              </view>
            </template>
            <template v-else-if="item.type == 'divider'">
              <view class="divider" :key="`divider-${index}`">{{ item.label }}</view>
            </template>
            <template v-else>
              <view
                :class="['item', { 'before-divider': isFollowedByDivider(index) || isFollowedBySubform(index) }, { 'frist': index === 0 }]"
                :key="`item-${index}`">
                <view class="label">{{ item.label }}</view>
                <view class="value flex">
                  <text class="value-text">{{ formatValue(item.value) }}</text>
                  <template v-if="item.unit && formatValue(item.value) != '-'">
                    <text class="unit">{{ item.unit }}</text>
                  </template>
                </view>
              </view>
            </template>
          </template>
        </template>
        <nothing v-else />
      </template>
    </view>

  </view>
</template>

<script type='text/ecmascript-6'>
import Table from '../components/Table'
import Nothing from '../components/Nothing'
import utils from '@/utils/utils'
export default {
  components: { Table, Nothing },
  name: 'detail',
  props: {
    templateData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loadComplete: false,
      list: []
    }
  },
  watch: {
    templateData: {
      handler(newVal) {
        console.log(newVal)
        if (newVal.length) this.formatData(newVal)
        else {
          this.list = []
          this.loadComplete = true
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
  },
  mounted() {

  },
  methods: {
    isFollowedByDivider(index) {
      const nextItem = this.list[index + 1];
      return nextItem && nextItem.type === 'divider';
    },
    isFollowedBySubform(index) {
      const prevItem = this.list[index + 1];
      return prevItem && prevItem.type === 'subform';
    },
    formatValue(value) {
      return value != null && value !== undefined && value !== '' ? value : '-'
    },
    formatData(data) {
      let list = utils.deepClone(data)
      list.map(item => {
        let columns = [],
          dataList = [],
          values = {}

        if (item.children && item.children.length) {
          item.children.map((child, index) => {
            child.map(k => {
              if (!values[k.key]) values[k.key] = []
              values[k.key].push(k.value)
            })
            columns.push({ title: `数据${index + 1}` })
          })
          let rowData = item.children[0] || []
          rowData.map(row => {
            dataList.push({
              rowHeader: row.label,
              data: values[row.key],
               unit: row.unit
            })
          })
        }
        item.columns = columns
        item.dataList = dataList
      })
      this.list = list
      this.loadComplete = true
    }
  }
}
</script>

<style scoped lang='scss'>
.daily-report {
  height: 100%;
  position: relative;

  .content {
    height: calc(100% - #{toRpx(120)});
    overflow-y: auto;
    padding: 0 48rpx 32rpx;
    box-sizing: border-box;
  }

  .divider {
    color: #333333;
    font-size: 32rpx;
    font-weight: 500;
    line-height: 48rpx;
    margin-bottom: 24rpx;
    padding-top: 16rpx;
  }

  .item {
    display: flex;
    align-items: flex-start;
    gap: 32rpx;
    background-color: #fff;
    box-sizing: border-box;
    padding: 0 32rpx 16rpx;
    font-size: 28rpx;
    font-weight: 400;
    color: #333333;

    .label,
    .value {
      width: calc(50% - #{toRpx(16)});
      word-break: break-all;
    }

    .label {
      color: #999999;
    }
  }

  .item.before-divider {
    padding-bottom: 28rpx;
    border-radius: 0 0 16rpx 16rpx;
  }

  .divider+.item,
  .frist {
    padding-top: 28rpx;
    border-radius: 16rpx 16rpx 0 0;
  }

  .list-box {
    // position: absolute;
    width: 100%;
    border-radius: 16rpx;
    background: #fff;
    padding: 0 0 32rpx 32rpx;
    overflow-x: auto;
    margin-top: 16rpx;

    .list-title {
      font-size: 32rpx;
      font-weight: 600;
      line-height: 44rpx;
      padding: 32rpx 0 24rpx;
    }
  }
}
</style>