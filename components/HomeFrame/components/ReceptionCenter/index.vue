<template>
  <view class="reception-box">
    <view :class="['record-box-content',`${showInfo || !showRecord?'hide-record':'show-record'}`]">
      <view class="left box-class" v-if="!onlyRight">
        <view class="common-title">
          业绩看板
          <view
            :class="['sprite-icon',`icon-eyes-${dataShow?'on':'off'}`]"
            @click="dataShow = !dataShow"
          ></view>
          <view class="time-box flex">
            时间进度
            <view class="time-bar">
              <view
                class="time-line"
                :style="{ width: timeProgress + '%' }"
              ></view>
            </view>
            <view class="progress">
              {{timeProgress }}%
            </view>
          </view>
          <template v-if="sceneType == 0">
            <view class="reception-select">
              <select-component
                :selectList="performanceTypeList"
                @chooseType="changePerformance"
              />
            </view>
          </template>
        </view>
        <template v-if="showPageFlag">
          <view class="customer-box box">
            <customer-flow
              :pageData="pageData"
              :dataShow="dataShow"
            />
          </view>
          <view class="linebar-box box">
            <line-bar
              :dataShow="dataShow"
              :pageData="pageData"
              :sceneType="sceneType"
              :isHarmony="isHarmony"
              :bussinessType="bussinessType"
            />
          </view>
          <view class="box">
            <output-value
              :dataShow="dataShow"
              :pageData="pageData"
            />
          </view>
        </template>
        <template v-else>
          <view class="loading flex">
            <image
              class="gif"
              src="../../../../assets/images/common/loadding.gif"
            />
            <!-- <uni-icons
              class="icon"
              type="refreshempty"
              :size="120"
              color="#3773f8"
            ></uni-icons> -->
          </view>
        </template>
      </view>
      <view class="right box-class" :class="{'only-right':onlyRight}">
        <type-tab-component
          :typeList="typeList"
          :tabIndex.sync="tabIndex"
        ></type-tab-component>
        <view :class="['right-content',`${tabIndex != 0?'hide-record':'show-record'}`]">
          <record-list
            @openRecordPage="openRecordPage"
            ref="recordListRef"
            :show="tabIndex == 0"
          />
        </view>
        <view :class="['right-content',`${tabIndex != 1?'hide-record':'show-record'}`]">
          <customer-file
            @showSuccess="$refs.successRef.open()"
            ref="customerFile"
            @editCustomer="editCustomer"
            :show="tabIndex == 1"
          />
        </view>
      </view>
    </view>
    <template v-if="!showRecord">
      <view :class="['save-record-box',backClass]">
        <save-record
          @cancel="handleCancel"
          @submit="handleSubmit"
          :customerInfoVal="customerInfo"
        ></save-record>
      </view>
    </template>

    <uni-popup
      ref="successRef"
      type="message"
    >
      <uni-popup-message
        type="success"
        message="删除成功"
        :duration="1500"
      ></uni-popup-message>
    </uni-popup>

    <customer-info
      :customerId="customerId"
      :show.sync="showInfo"
      @refresh="$refs.customerFile.refresh()"
    />
  </view>
</template>

<script type='text/ecmascript-6'>
import dayjs from 'dayjs'
import CustomerFlow from './CustomerFlow.vue'
import LineBar from './LineBar.vue'
import OutputValue from './OutputValue.vue'
import RecordList from './RecordList.vue'
import saveRecord from './saveRecord.vue'
import CustomerFile from './CustomerFile.vue'
import CustomerInfo from './CustomerInfo.vue'
import TypeTabComponent from '@/components/TypeTabComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'

export default {
  components: {
    CustomerFlow,
    LineBar,
    OutputValue,
    RecordList,
    saveRecord,
    CustomerFile,
    CustomerInfo,
    TypeTabComponent,
    SelectComponent
  },

  name: '',
  data () {
    return {
      backClass: '',
      showRecord: true,
      customerInfo: {},
      dataShow: true,
      timeProgress: '',
      tabIndex: 0,
      typeList: Object.freeze([
        { tabName: '接待复盘' },
        { tabName: '客户预录' },
      ]),
      showInfo: false,
      customerId: '',
      bussinessType: 1,
      pageData: {
        //门店客流
        // cumulativeDeliveryCount: 0, //累计交付数
        // actualContactCount: 0, // 实际触客数
        // contactRate: 0, // 触客率（实际触客数 / 累计交付数）

        // excellentStoreAvgDealRate: 0, // 优秀门店均值成交率
        // thisStoreDealRate: 0, // 本门店成交率
        // personalDealRate: 0,  // 个人成交率

        // excellentStoreAvgDeal: 0, // 优秀门店均值客单价
        // thisStoreKdj: 0, // 本门店客单价
        // personalKdj: 0, // 个人客单价


        // //本月产值
        // actualProduction: 0, // 实际完成产值（万元）
        // personalProduction: 0, // 个人产值（累计成交金额）
        // targetProduction: 0, // 目标产值（万元）
        // achievementRatio: 0, // 达成比例 = 实际产值 ÷ 目标产值
        // productionContribution: 0 // 产值贡献 = 个人产值 ÷ 实际完成产值
      }
    }
  },
  computed: {
    onlyRight() {
      const userInfo = uni.$storage.get('userInfo')
      return userInfo.subLoginUser.channelType == 9
    },
    showPageFlag () {
      return Object.keys(this.pageData).length
    },
    isHarmony () {
      const { channelType } = uni.$storage.get('userInfo')
      return channelType == 1
    },
    performanceTypeList () {
      let list = []
      if (this.isHarmony) list = [
        { label: '问界', value: 1 },
        { label: '鸿蒙', value: 2 },
      ]
      else list = [
        { label: '延保', value: 1 },
        { label: '权益', value: 3 },
      ]
      return list
    },
    sceneType () {
      return uni.$storage.get('userInfo').sceneType
    }
  },
  mounted () {
    this.setTimeProgress()
    this.getMerchantPerformance()
  },
  methods: {
    setTimeProgress () {
      let nowNum = dayjs().date(),
        monthDayNum = dayjs().daysInMonth()
      this.timeProgress = Math.round(nowNum / monthDayNum * 100)
    },
    changeType (index, name) {
      if (this[name] == index) return  // 点击同一个
    },
    openRecordPage (item) {
      this.showRecord = false
      this.customerInfo = item
    },
    handleCancel () {
      this.backClass = 'backClass'
      setTimeout(() => {
        this.showRecord = true;
        this.backClass = ''
      }, 300)

    },
    handleSubmit (val) {
      this.handleCancel()
      this.$refs.recordListRef.submitRecord(val)
    },
    editCustomer (id) {
      this.customerId = id
      this.showInfo = true
    },
    async getMerchantPerformance (bussinessType = 1, hmzxFlag) {
      this.bussinessType = bussinessType
      const { shopMerchantId, sceneType } = uni.$storage.get("userInfo")
      let params = {
        merchantIdList: shopMerchantId,
        sceneType,
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD')
      }
      if (sceneType == 0) {
        params.bussinessType = bussinessType
        if (hmzxFlag) params.hmzxFlag = hmzxFlag
        if (this.isHarmony && !params.hmzxFlag) params.hmzxFlag = 1
      } else params.hmzxFlag = this.isHarmony ? 3 : 4
      this.pageData = await uni.$api.receptionApi.getMerchantPerformance(params) || {}
    },
    changePerformance ({ item }) {
      this.pageData = {}
      if (this.isHarmony) this.getMerchantPerformance(1, item.value)
      else this.getMerchantPerformance(item.value)
    }
  }
}
</script>

<style scoped lang='scss'>
.reception-box {
  .record-box-content {
    position: relative;
    height: 100vh;
    box-sizing: border-box;
    padding: toRpx(64) 0 toRpx(80);
    display: flex;
    gap: 0 toRpx(48);
    visibility: visible;
    transition: all 0.15s;
    opacity: 1;
  }
  .hide-record {
    opacity: 0;
    z-index: -1;
    visibility: hidden;
  }
  .show-record {
    opacity: 1;
    position: relative;
    animation: show-box 0.15s forwards;
  }
  @keyframes show-box {
    0% {
      left: 100%;
    }
    100% {
      left: 0;
    }
  }
  .box-class {
    height: 100%;
    background: #ffffff59;
    backdrop-filter: blur(toRpx(16));
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    border-radius: toRpx(48);
    overflow: hidden;
  }
  .left {
    width: toRpx(656);
    .common-title {
      position: relative;
      .sprite-icon {
        margin-left: toRpx(16);
        zoom: 1.5;
      }
      .time-box {
        position: absolute;
        left: toRpx(48);
        bottom: toRpx(8);
        color: #999999;
        font-size: toRpx(20);
        .time-bar {
          width: toRpx(200);
          height: toRpx(16);
          border-radius: toRpx(8);
          background: #ffffff;
          overflow: hidden;
          margin: 0 toRpx(12);
          .time-line {
            height: 100%;
            border-radius: toRpx(8);
            background: linear-gradient(90deg, #75bcff 0%, #2c66f7 100%);
          }
        }
        .progress {
          color: #4673ff;
          font-weight: 500;
        }
      }
      .reception-select {
        position: absolute;
        top: toRpx(36);
        right: toRpx(32);
        /deep/.select {
          width: toRpx(148);
          height: toRpx(48);
          border-radius: toRpx(12);
          background: #ffffff59;
          backdrop-filter: blur(toRpx(16));
          box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
          color: #333333;
          font-size: toRpx(26);
          padding-left: toRpx(32);
          .icon-arrow-bottom {
            zoom: 0.75;
          }
        }
        /deep/.pop-box {
          top: toRpx(64);
          color: #292d33;
          font-size: toRpx(28);
          .type-item {
            height: toRpx(56);
          }
        }
      }
    }
    .box {
      border-radius: toRpx(32);
      background: #ffffff;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      margin: toRpx(20) toRpx(32) 0;
    }
    .customer-box {
      margin: toRpx(24) toRpx(32) toRpx(20);
    }
    .loading {
      width: 100%;
      height: 100%;
      justify-content: center;
      .gif {
        width: toRpx(64);
        height: toRpx(64);
      }
      .icon {
        animation: rotate 1s infinite;
      }
      @keyframes rotate {
        0% {
          transform: rotate(0);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    }
  }
  .right {
    width: calc(100% - #{toRpx(752)});
    border: toRpx(2) solid #fff;
    box-sizing: border-box;
    &.only-right {
      width: calc(100% - #{toRpx(64)});
    }
    &-content {
      width: 100%;
      position: absolute;
      border-radius: toRpx(48);
      background: #ffffff;
      height: calc(100% - #{toRpx(128)});
      transform: translateY(toMinusRpx(32));
    }
  }

  .save-record-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: left-in 0.25s forwards;
  }

  .backClass {
    animation: left-out 0.25s forwards;
  }

  @keyframes left-in {
    0% {
      left: 100%;
    }
    100% {
      left: 0;
    }
  }
  @keyframes left-out {
    0% {
      left: 0;
    }
    100% {
      left: 100%;
    }
  }
}
</style>
