<template>
  <view class="entrance-box">
    <template v-if="entranceList.length">
      <view class="entrance-container">
        <view :class="['entrance-list', `entrance-list-${type}`]">
          <view class="entrance-item" v-for="(item, index) in entranceList" :key="index" @click="handleClick(item)">
            <view :class="['sprite-icon', `icon-${item.icon}`]"></view>
            <view class="entrance-name">{{ item.label }}</view>
          </view>
        </view>
      </view>
    </template>
    <template v-else>
      <view class="developing flex">
        <image class="developing-icon" src="../assets/images/common/developing.webp" />
        功能开发中
      </view>
    </template>
  </view>
</template>

<script>
export default {
  name: 'Entrance',
  props: {
    // 默认一行展示5个，type传1展示4个
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // 工资申诉入口是否允许显示
      wageAppealAllowed: false,
      // 工资申诉入口加载中，加载完成前不展示避免误显示
      loadingEntrance: true,
      entranceList: []
    }
  },
  created() {
    // 组件创建时请求工资申诉入口权限
    this.fetchWageAppealEntrance()
    this.getEntranceList()
  },
  computed: {

  },
  methods: {
    // 请求工资申诉入口权限，并设置显示开关
    async fetchWageAppealEntrance() {
      try {
        this.loadingEntrance = true
        const userInfo = uni.$storage.get('userInfo') || {}
        const { shopMerchantId } = userInfo
        // 缺少商户ID时降级为不展示
        if (!shopMerchantId) {
          this.wageAppealAllowed = false
          return
        }
        const res = await uni.$api.commonApi.getWageAppealEntrance({
          merchantId: shopMerchantId
        })
        // 兼容不同返回结构，解析是否允许显示
        this.wageAppealAllowed = !!res
      } catch (error) {
        // 接口异常降级：不展示工资申诉入口，并提示（非打断式）
        this.wageAppealAllowed = false
        if (error) {
          uni.showToast({
            title: '工资申诉入口获取失败',
            icon: 'none'
          })
        }
      } finally {
        this.loadingEntrance = false
      }
    },
    handleClick(item) {
      // 这里可以根据实际需求进行跳转或功能处理
      this.$emit('entranceClick', item)
    },
    isNewVersionNeed(merchantId) {
      return uni.$api.dailyTemplateApi.isNewVersionNeed({ merchantId })
    },
    async getEntranceList() {
      let entranceList = [
        {
          icon: 'daily-report',
          label: '驻店日报',
          name: 'DailyReport',
          sceneType: [0, 1, 7],
          noInterception: true
        },
        {
          icon: 'create-order',
          label: '新建工单',
          name: 'CreateOrder',
          sceneType: [0, 1]
        },
        {
          icon: 'equity-order',
          label: '权益提单',
          name: 'EquityManagement',
          sceneType: [0]
        },
        {
          icon: 'defeat-order',
          label: '战败下单',
          name: 'DefeatOrder',
          sceneType: [0, 1]
        },
        {
          icon: 'order-management',
          label: '工单列表',
          name: 'OrderManagement',
          sceneType: [0, 1]
        },
        {
          icon: 'wage-appeal',
          label: '工资申诉',
          name: 'WageAppeal',
          sceneType: [0, 1],
          noInterception: true
        },
        {
          icon: 'evaluation-management',
          label: '评估单管理',
          name: 'EvaluationFormList',
          sceneType: [7]
        },
        {
          icon: 'carInfoIcon',
          label: '车况信息',
          name: 'CarConditionInfo',
          page: '/pages/usedCar/inspectionReport/index?h5Entry=carInfo',
          sceneType: [7]
        },
        {
          icon: 'delivery-management',
          label: '交付管理',
          name: 'DeliveryManagement',
          page: '/pages/usedCar/deliveryManagement/index',
          sceneType: [7],
          checkDailyReport: false
        },
        {
          icon: 'report-management',
          label: '报告管理',
          name: 'ReportManagement',
          page: '/pages/usedCar/reportManagement/index',
          sceneType: [7],
          checkDailyReport: false
        },
        {
          icon: 'report',
          label: '检测管理',
          name: 'InspectionReport',
          page: '/pages/usedCar/inspectionReport/index',
          sceneType: [7],
          noInterception: true
        },
        {
          icon: 'store-daily-report',
          label: '门店日报',
          name: 'storeDailyReport',
          page: '/pages/common/dailyNewspaper/index',
          eventCode: 'store_daily_report_page',
          noInterception: true
        },
        {
          icon: 'negotiation-detail',
          name: 'NegotiationDetail',
          label: '洽谈明细',
          page: '/pages/common/dailyNewspaper/index',
          eventCode: 'negotiation_detail_page',
          noInterception: true
        },
      ]
      try {
        let userInfo = uni.$storage.get('userInfo'),
          { sceneType, shopMerchantId } = userInfo,
          newReport = await this.isNewVersionNeed(shopMerchantId)
        if (newReport && sceneType != 7) {
          let [staffDailyReport] = entranceList
          entranceList[0] = {
            ...staffDailyReport,
            name: 'staffDailyReport',
            page: '/pages/common/dailyNewspaper/index',
            eventCode: 'staff_daily_report_page',
          }
          entranceList.map(e => {
            if (['staffDailyReport', 'storeDailyReport', 'NegotiationDetail'].includes(e.name)) e.sceneType = [0, 1]
          })
        }
        this.$store.dispatch('setNewReport', newReport)
        // 先根据场景过滤
        let list = entranceList.filter(e => e.sceneType?.includes(sceneType))
        // 加载阶段或不允许显示时，移除工资申诉入口
        if (this.loadingEntrance || !this.wageAppealAllowed) {
          list = list.filter(e => e.name !== 'WageAppeal')
        }
        this.entranceList = list
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.entrance-container {
  width: 100%;
  // margin-top: toRpx(64);
  display: flex;
  // justify-content: center;
}

.entrance-list {
  width: 100%;
  display: grid;
  row-gap: toRpx(30);
  column-gap: toRpx(68);

  &.entrance-list-0 {
    grid-template-columns: repeat(5, 1fr);
  }

  &.entrance-list-1 {
    grid-template-columns: repeat(4, 1fr);
  }
}

.entrance-item {
  min-width: toRpx(120);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: toRpx(28);
  color: #333;

  .entrance-name {
    margin-top: toRpx(8);
  }
}

.developing {
  height: 100%;
  flex-direction: column;
  color: #999999;
  font-size: toRpx(20);

  &-icon {
    width: toRpx(344);
    height: toRpx(208);
  }
}
</style>
