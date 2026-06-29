<template>
  <view :class="['list', { out: isOut }]">
    <view class="common-title">
    </view>
    <view class="list-box">
      <template v-if="loadComplete">
        <template v-if="staffList.length">
          <scroll-view scroll-x>
            <view class="name-list">
              <view :class="['name-item', currentIndex === index ? 'active' : '', 'flex']"
                v-for="(item, index) in staffList" :key="index" @click="changeSatffView(index)">{{ item.staffName }}
              </view>
            </view>
          </scroll-view>
          <view class="content">
            <template v-for="(i, index) in list">
              <view class="table-box" :key="`t-${index}`" v-if="i.children && i.children.length">
                <view class="table-title">{{ i.label }}</view>
                <Table :columns="i.columns" :data="i.dataList" tableStyle="padding-right:32rpx" isDetail />
              </view>
            </template>
          </view>
        </template>
        <Nothing v-else />
      </template>
    </view>
    <view class="footer">
      <Footer>
        <view class="btn" @click="back">返回</view>
      </Footer>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import Nothing from '../components/Nothing'
import Footer from '../components/Footer'
import Table from '../components/Table'
import utils from '@/utils/utils'

export default {
  name: 'negotiationList',
  components: { Nothing, Footer, Table },
  inject: ['userInfo','sceneType'],

  props: {
    currentDate: {
      type: String,
      default: ''
    }
  },
  watch: {
    currentDate: {
      handler(val) {
        if (val) {
          this.getDiscussionStaffList(val)
          this.currentIndex = 0
          this.isOut = false
        }
      },
      immediate: true,
      deep: true
    },

  },
  data() {
    return {
      staffList: [],
      loadComplete: false,
      currentIndex: 0,
      list: [],
      isOut: false
    }
  },
  mounted() {
  },
  methods: {
    changeSatffView(index) {
      if (this.currentIndex === index) return
      this.currentIndex = index
      this.getReportDetail(this.staffList[index])
    },
    async getDiscussionStaffList(reportDate) {
      this.loadComplete = false
      const { shopMerchantId } = this.userInfo,
      {sceneType} = this,
        data = await uni.$api.dailyTemplateApi.getDiscussionStaffList({
          merchantId: shopMerchantId,
          reportDate,
          sceneType
        })
      this.staffList = data || []
      this.loadComplete = true
      if (data && data.length) this.getReportDetail(data[0])

    },
    async getReportDetail(item) {
      const { shopMerchantId } = this.userInfo,
        { currentDate, sceneType } = this,
        data = await uni.$api.dailyTemplateApi.getReportDetail({
          merchantId: shopMerchantId,
          staffUuid: item.staffUuid,
          templateType: 3,
          reportDate: currentDate,
          sceneType
        })
      if (data) {
        let list = JSON.parse(data.jsonContent || '[]')
        console.log(list)
        list.forEach(e => {
          if (e.childrenValue && e.childrenValue.length > 0) {
            const children = e.childrenValue.map(c => {
              // 每次循环创建新的深拷贝，避免引用共享问题
              const originChildren = utils.deepClone(e.origin_children)
              originChildren.forEach(item => {
                const key = item.key
                const val = c[e.key]?.[key]

                if (typeof val == 'string' || typeof val == 'number') {
                  item.value = val
                } else if (val) {
                  item.value = val.text
                  item[key] = val.value
                }
              })
              return originChildren
            })
            e.children = children
          }
        })
        list.forEach(item => {
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
      }
    },
    back() {
      this.isOut = true
      this.$emit('back')
    }
  }
}
</script>

<style scoped lang='scss'>
.list {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  animation: list-left-in 0.5s ease-in-out;

  .common-title {
    position: absolute;
    top: 0;
    left: 0;
  }

  &-box {
    height: calc(100% - #{toRpx(136)});
    box-sizing: border-box;

    .name-list {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      overflow-x: auto;
      gap: 16rpx;
      padding: 48rpx 48rpx 32rpx;

      .name-item {
        padding: 0 48rpx;
        height: 72rpx;
        color: #6c6f75;
        font-size: 28rpx;
        line-height: 40rpx;
        border-radius: 16rpx;
        background: #f5f7fa;
        box-sizing: border-box;
        border: 2rpx solid #f5f7fa;
      }

      .active {
        border-color: #fff;
        font-weight: 500;
        color: #fff;
        background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
      }
    }

    .content {
      height: calc(100% - #{toRpx(152)});
      box-sizing: border-box;
      margin: 0 48rpx;
      padding: 0 32rpx 32rpx;
      border-radius: 32rpx;
      background: #fff;
      overflow-y: auto;

      .table-title {
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

  .footer {
    height: 136rpx;

    .btn {
      margin: 0 168rpx;
      width: 100%;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 80rpx;
      background: #3b73ff1a;
      color: #4673ff;
      font-size: 28rpx;
      font-weight: 500;
    }
  }
}

.list.out {
  animation: list-right-out 0.5s ease-in-out;
}

@keyframes list-left-in {
  0% {
    left: 100%;
  }

  100% {
    left: 0;
  }
}

@keyframes list-right-out {
  0% {
    left: 0;
  }

  100% {
    left: 100%;
  }
}
</style>