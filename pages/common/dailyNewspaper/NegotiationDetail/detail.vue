<template>
  <view class="daily-report">
    <view class="common-title">
    </view>
    <view class="report-content">
      <template v-if="loadComplete">
        <template v-if="list.length">
          <template v-for="(item, index) in list">
            <view
              class="list-box"
              :key="index"
              v-if="item.children && item.children.length"
            >
              <view class="list-title">{{ item.label }}</view>
              <Table
                :columns="item.columns"
                :data="item.dataList"
                tableStyle="padding-right:32rpx"
                isDetail
              >
              </Table>

            </view>
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
  data () {
    return {
      loadComplete: false,
      list: []
    }
  },
  watch: {
    templateData: {
      handler (newVal) {
        if (newVal.length) this.formatData(newVal)
        else {
          this.list = []
          this.loadComplete = true
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
  },
  mounted () {

  },
  methods: {
    formatValue (value) {
      return value !== null && value !== undefined && value !== '' ? value : '-'
    },
    formatData (data) {
      try {
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
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.daily-report {
  height: 100%;
  position: relative;
  padding: 48rpx 0;
  .common-title {
    position: absolute;
    top: 0;
    left: 0;
  }
  .report-content {
    height: 100%;
    overflow-y: auto;
    border-radius: 32rpx;
    background: #fff;
    margin: 0 48rpx;
    box-sizing: border-box;
    padding-bottom: 32rpx;
  }
  .list-box {
    padding-left: 32rpx;
    overflow-x: auto;
    .list-title {
      font-size: 32rpx;
      font-weight: 600;
      line-height: 44rpx;
      padding: 32rpx 0 24rpx;
      position: sticky;
      top: 0;
      z-index: 50;
      background: #fff;
    }
  }
}
</style>