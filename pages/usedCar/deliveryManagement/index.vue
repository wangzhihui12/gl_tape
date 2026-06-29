<template>
  <page-component title="交付列表">
    <view class="content">
      <uni-calendar
        ref="calendar"
        :insert="false"
        range
        :clearDate="false"
        startDate="1970-01-01"
        :endDate="endDate"
        @confirm="confirmCalendar"
        @close="resetFocusIndex"
        :rangeValue="rangeValue"
        title="请选择工单创建时间"
        showBottomBtn
      />
      <view class="search-box flex">
        <view :class="['form-item', {active:focusIndex == 0}]">
          <view class="form-item-box">
            <view
              :class="['calendar',{placeholder:!createdTime}]"
              @click="openCalendar"
            >
              {{createdTime||' 请选择工单创建时间'}}
            </view>
            <template v-if="createdTime">
              <view
                class="clear flex"
                @click="clearTime"
              >
                <uni-icons
                  type="closeempty"
                  size="12"
                  color="#999EA8"
                ></uni-icons>
              </view>
            </template>
          </view>
        </view>
        <view :class="['form-item form-item-input', {active:focusIndex == 1}]">
          <view class="form-item-box">
            <input
              :maxlength="50"
              v-model="searchText"
              class="input"
              placeholder="请输入车型/客户姓名/客户联系方式"
              @focus="focusIndex = 1"
              @blur="resetFocusIndex"
              placeholder-class="placeholder"
            />
          </view>
        </view>
        <view
          class="btn search"
          @click="search"
        >查询</view>
        <view
          class="btn reset"
          @click="reset"
        >重置</view>
      </view>
      <view class="list-box">
        <type-tab-component
          :typeList="typeList"
          :isShowCount="true"
          :tabIndex="tabIndex"
          @tabClick="tabBarClick"
        ></type-tab-component>
        <!-- <type-tab-component
          class="tab-class"
          :typeList="typeList"
          :tabIndex="tabIndex"
          @tabClick="tabBarClick"
          hasNum
          nameKey="name"
          numKey="count"
        ></type-tab-component> -->
        <z-paging
          ref="paging"
          :fixed="false"
          paging-class="scroll-view"
          :class="tabIndex == 0 ? 'no-br' : ''"
          :loading-full-fixed="false"
          :auto-show-system-loading="true"
          :show-scrollbar="false"
          v-model="list"
          @query="getDeliveryOrderPageList"
          :default-page-size="10"
        >
          <template #empty>
            <view class="nothing flex">
              <image
                class="noDataImg"
                :src="noData"
              />
              <view>暂无交付工单</view>
            </view>
          </template>
          <template v-for="(i,index) in list">
            <view
              :class="['item',{'last':index == list.length -1 },{'first':index == 0}]"
              :key="index"
              @click="toDetail(i)"
            >
              <view :class="['status flex',{
                'success-status':i.paymentStatus == 1
              }]">{{PAYMENT_STATUS[i.paymentStatus]}}</view>
              <image
                :src="i.carPhoto || 'https://assets.msn.cn/weathermapdata/1/static/weather/Icons/taskbar_v10/Condition_Card/MostlySunnyDay.svg'"
                class="img"
              />
              <view class="info">
                <view class="title">{{i.vehicleTitle}}</view>
                <view class="info-item flex">
                  <view class="label">客户姓名</view>
                  <view class="value">{{i.buyerName}}</view>
                </view>
                <view class="info-item flex">
                  <view class="label">客户联系方式</view>
                  <view class="value">{{i.buyerContact}}</view>
                </view>
                <view class="flex">
                  <view class="info-item flex">
                    <view class="label">工单创建时间</view>
                    <view class="value">{{i.createdDate}}</view>
                  </view>
                  <view class="info-item flex">
                    <view class="label">交付状态</view>
                    <view class="value">{{ORDER_STATUS[i.orderStatus]}}</view>
                  </view>
                </view>
              </view>
            </view>
          </template>
        </z-paging>
      </view>
    </view>
  </page-component>
</template>

<script type='text/ecmascript-6'>
import TypeTabComponent from '../../evaluationForm/components/TypeTabComponent.vue'
import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin'
import { ORDER_STATUS, PAYMENT_STATUS } from './contant'
import dayjs from 'dayjs'

export default {
  mixins: [ZPMixin],
  components: {
    TypeTabComponent
  },

  name: '',
  data () {
    return {
      endDate: dayjs().format('YYYY-MM-DD'),
      ORDER_STATUS,
      PAYMENT_STATUS,
      noData: require('@/assets/images/evaluationForm/noData.webp'),
      typeList: [
        { tabName: '全部', count: 0, keyNum: 'count', key: '' },
        { tabName: '待交付', count: 0, keyNum: 'count', key: '0' },
        { tabName: '交付中', count: 0, keyNum: 'count', key: '1' },
        { tabName: '交付完成', count: 0, keyNum: 'count', key: '2' },
      ],
      tabIndex: 0,
      list: [],
      searchText: '',
      focusIndex: -1,
      rangeValue: {},
      createdDate: {
        createdStartDate: '',
        createdEndDate: ''
      }
    }
  },
  computed: {
    createdTime () {
      const { createdStartDate, createdEndDate } = this.createdDate
      let str = ''
      if (createdStartDate && createdEndDate) str = `${dayjs(createdStartDate).format('YYYY-MM-DD')}至${dayjs(createdEndDate).format('YYYY-MM-DD')}`
      return str
    }
  },
  mounted () {
    uni.$track.add({
      eventCode: 'app_delivery_management'
    })
  },
  onShow () {
    this.search()


  },
  methods: {
    async getDeliveryOrderPageList (currentPage, pageSize) {
      try {
        const { typeList, tabIndex, searchText, createdDate } = this,
          { data: { code, data, msg } } = await uni.$api.usedCarApi.getDeliveryOrderPageList({
            t: {
              searchText,
              orderStatus: typeList[tabIndex].key,
              ...createdDate
            },
            currentPage,
            pageSize
          })
        if (code == 0) this.$refs.paging.complete(data.records || [])
        else throw msg
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error || '请求失败',
          icon: 'none'
        })
        this.$refs.paging.complete(false)
      }
    },
    async getDeliveryOrderListCount () {
      const { searchText, createdDate } = this,
        data = await uni.$api.usedCarApi.getDeliveryOrderListCount({
          searchText,
          ...createdDate
        })
      this.typeList[0].count = data.deliveryNum || 0
      this.typeList[1].count = data.deliveryWaitingNum || 0
      this.typeList[2].count = data.deliveringNum || 0
      this.typeList[3].count = data.deliveryEndNum || 0
      console.log(data, '---')
    },
    tabBarClick (index) {
      if (this.tabIndex == index) return
      this.tabIndex = index
      this.search()
    },
    search () {
      this.getDeliveryOrderListCount()
      this.$refs.paging?.reload()
    },
    reset () {
      this.searchText = ''
      this.clearTime()
      this.tabIndex = 0
      this.search()
    },
    toDetail (e) {
      uni.navigateTo({
        url: `/pages/usedCar/deliveryManagement/detail?id=${e.id || ''}`
      })
    },
    openCalendar () {
      this.$refs.calendar.open()
      this.focusIndex = 0
    },
    confirmCalendar ({ range }) {
      let { data } = range
      this.createdDate = {
        createdStartDate: (data[0] || dayjs().format('YYYY-MM-DD')) + ' 00:00:00',
        createdEndDate: (data[data.length - 1] || dayjs().format('YYYY-MM-DD')) + ' 23:59:59'
      }
    },
    resetFocusIndex () {
      this.focusIndex = -1
    },
    clearTime () {
      this.createdDate = {
        createdStartDate: '',
        createdEndDate: ''
      }
      this.$refs.calendar.cleanDate()
    }
  }
}
</script>

<style scoped lang='scss'>
.content {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: toRpx(144) toRpx(64) toRpx(48);
  box-sizing: border-box;
  .search-box {
    margin: toRpx(8) 0 toRpx(32);
    height: toRpx(72);
    gap: toRpx(12);
    .form-item {
      width: toRpx(424);
      height: 100%;
      position: relative;
      &-box {
        width: 100%;
        height: 100%;
        border-radius: toRpx(12);
        border: toRpx(3) solid #a8c1ff;
        background: #ffffff;
        box-sizing: border-box;
        padding: 0 toRpx(20);
        position: relative;
        z-index: 2;
        .input,
        .calendar {
          width: 100%;
          height: 100%;
          border: none !important;
          outline: none;
          font-size: toRpx(26);
          color: #292d33;
          box-sizing: border-box;
          line-height: toRpx(72);
          padding: 0 !important;
        }
        .placeholder {
          color: #999ea8;
        }
        .clear {
          position: absolute;
          top: toRpx(16);
          right: toRpx(16);
          width: toRpx(36);
          height: toRpx(36);
          background: #f0f1f5;
          border-radius: 100%;
          justify-content: center;
        }
      }
    }
    .form-item-input{
      width: toRpx(452);
      margin: 0 toRpx(12);
    }
    .active {
      position: relative;
      &::after {
        position: absolute;
        left: toMinusRpx(2);
        top: toMinusRpx(2);
        width: calc(100% + #{toRpx(4)});
        height: calc(100% + #{toRpx(4)});
        content: '';
        background-image: linear-gradient(#2f6af7, #75bcff);
        box-shadow: 0 0 0 toRpx(8) #2c66f71a;
        border-radius: toRpx(16);
      }
    }
    .btn {
      width: toRpx(120);
      height: toRpx(72);
      border-radius: toRpx(12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #292d33;
      font-size: toRpx(28);
    }
    .search {
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #fff;
    }
    .reset {
      background: #f0f1f5;
    }
  }
  .list-box {
    height: calc(100% - #{toRpx(112)});
    border-radius: toRpx(32);
    overflow: hidden;
    background: #ffffff59;
    backdrop-filter: blur(toRpx(16));
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    .scroll-view {
      position: relative;
      z-index: 2;
      height: calc(100% - #{toRpx(96)});
      padding-top: toRpx(2);
      background: #fff;
      border-radius: toRpx(32);
      .nothing {
        color: #808291;
        font-size: toRpx(28);
        flex-direction: column;
        justify-content: center;
        .noDataImg {
          width: toRpx(480);
          height: toRpx(240);
          margin-bottom: toRpx(16);
        }
      }
      .item {
        height: toRpx(232);
        border-radius: toRpx(24);
        box-shadow: 0 toRpx(6) toRpx(24) 0 #2a61eb1a;
        margin: 0 toRpx(50) toRpx(40);
        position: relative;
        display: flex;
        padding: toRpx(24) toRpx(40);
        .img {
          width: toRpx(240);
          height: toRpx(180);
          border-radius: toRpx(12);
          margin-right: toRpx(32);
        }
        .info {
          .title {
            color: #292d33;
            font-size: toRpx(30);
            font-weight: 500;
            line-height: toRpx(44);
            margin-bottom: toRpx(16);
          }
          &-item {
            margin-bottom: toRpx(8);
            flex-shrink: 0;
            line-height: toRpx(36);
            .label {
              color: #999ea8;
              font-size: toRpx(24);
            }
            .value {
              min-width: toRpx(572);
              margin-left: toRpx(16);
              color: #666666;
              font-size: toRpx(24);
            }
          }
        }
        .status {
          position: absolute;
          top: toRpx(24);
          right: toRpx(40);
          height: toRpx(44);
          border-radius: toRpx(4);
          background: #fef4e8;
          padding: 0 toRpx(20);
          color: #f59619;
          font-size: toRpx(24);
          font-weight: 500;
        }
        .success-status {
          color: #2cca74;
          background: #e9f9f1;
        }
      }
      .first{
        margin-top:  toRpx(40);
      }
      .last {
        margin-bottom: 0;
      }
      .block {
        width: 100%;
        height: toRpx(40);
      }
    }
    .no-br {
      border-radius: 0 toRpx(32) toRpx(32) toRpx(32);
    }
  }
}
</style>