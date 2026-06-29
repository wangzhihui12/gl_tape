<template>
  <view class="store-container">
    <view class="store-header flex">
      <view class="sprite-icon icon-my-store"></view>
      <text>我的门店</text>
      <view class="tab-box" v-if="scene0PenetrationRateCommissions.length">
        <view @click="selectTab(i.value)" :class="{ 'tab-item': true, active: activeIndex == i.value }" v-for="(i, index) in tabList" :key="index">{{ i.name }}</view>
      </view>
      <view :class="{ 'select-store flex': true, 'ml-auto': !scene0PenetrationRateCommissions.length }" @click="showPopup">
        <view class="store-name text-hide">{{ form.merchantName }}</view>
        <view class="up-icon"></view>
      </view>
    </view>
    <view class="store-body flex">
      <view class="total-box">
        <view class="total-title">
          <text>应触客台数</text>
          <uni-icons type="help" size="18" color="#A2A2A8" @click="showTips"></uni-icons>
        </view>
        <view class="total-num">
          {{ commissionsInfo[0].shouldToShopCount || 0 }}
          <text>台</text>
        </view>
        <view class="total-time">截至{{ commissionsInfo[0].calculationDay }}</view>
      </view>
      <view class="total-detail flex">
        <view class="month-box" v-for="(item, index) in commissionsInfo" :key="index">
          <view class="month-header flex">
            <view :class="`sprite-icon icon-${scene0PenetrationRateCommissions.length || item.sceneType == 0 ? 'yw-icon' : 'qg-tips'}`"></view>
            <text>{{ item.showGoodsTypeName || (item.sceneType == 0 ? '权益' : '轻改') }}</text>
          </view>
          <view class="value-box flex">
            <view class="value-desc flex">
              <view class="value-title">产值</view>
              <view class="value-price">
                <text>¥</text>
                <!-- 新规则没有值显示-，老规则没有值显示0（原来没有值显示0） -->
                {{ (item.configType && item.configType == 4) ? (item.orderTotalPrice || '-') : (item.orderTotalPrice || '0') }}
              </view>
            </view>
            <view class="value-desc flex">
              <view class="value-title">成交</view>
              <view class="value-price">
                {{ item.orderCount || '0' }}
                <text>单</text>
              </view>
            </view>
          </view>
          <view :class="{ 'value-detail': true, 'bg-box': commissionsInfo.length == 1 }">
            <view class="detail-item" v-for="(v, k) in outputDetail" :key="k">
              <view class="detail-label">
                <text>{{ v.label }}</text>
                <uni-icons type="help" size="15" color="#A2A2A8" v-if="v.content" @click="clickTips(v)"></uni-icons>
              </view>
              <view class="detail-link flex" @click="showProductDetail(item)" v-if="item.specificGoodsType && v.isLink">
                <text>产品明细</text>
                <view class="link-icon"></view>
              </view>
              <view v-else-if="item.configType && item.configType == 4 && v.label == '提成系数'" class="detail-num">-</view>
              <view v-else-if="item.configType && item.configType == 4 && v.label == '提成比例'" class="detail-num">
                <view class="detail-num-text">每单</view>{{ item[v.value] || '0' }}<view class="detail-num-text">元</view>
              </view>
              <view class="detail-num" v-else>{{ item[v.value] || '0' }}{{ v.unit }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="income-body">
      <view class="income-header flex">
        <view class="sprite-icon icon-income-icon"></view>
        <text>本月收入测算</text>
        <view class="history-box flex-center" @click="showPage('History')">
          <view class="sprite-icon icon-lssl-icon"></view>
          <text>历史收入</text>
        </view>
      </view>
      <view class="income-panel">
        <view class="panel-up flex">
          <view class="sprite-icon icon-income-card"></view>
          <text>本月预估收入</text>
          <view class="time">截至{{ salaryDetail.calculationDay }}</view>
        </view>
        <view class="panel-bottom">
          <text>¥</text>
          {{ formatNumber(salaryDetail.correctSalary || 0) }}
        </view>
      </view>
      <view class="income-detail">
        <template v-for="(item, index) in IncomeList">
          <view class="income-detail-item flex" v-if="isShow(item.value)" :key="index">
            <view :class="`sprite-icon icon-${item.icon}`"></view>
            <view class="item-label">{{ item.label }}</view>
            <uni-icons type="help" size="15" color="#A2A2A8" @click="clickTips(item)"></uni-icons>
            <view class="item-value">{{ item.showUnit }}{{ formatNumber(salaryDetail[item.value] || '0') }}</view>
            <view class="item-next" @click="showDetail(item)" v-if="(salaryDetail[item.value] && item.tabelTh) || item.showNext"></view>
          </view>
        </template>
      </view>
      <view class="income-footer">个人所得税、社保、迟到、早退等月初统一核算，不包括在收入测算中。实际发放工资以工资核算为准。</view>
    </view>
    <Detail @close="show = false" :show="show" :detail="detail" :tabelTh="detail.tabelTh" :tabelTr="detail.tabelTr"></Detail>
    <base-dialog @close="baseShow = false" @showBaseDetail="showBaseDetail" :baseSalaryDetail="baseSalaryDetail" :show="baseShow"></base-dialog>
    <base-detail
      @close="
        baseDetailShow = false
        baseShow = true
      "
      :show="baseDetailShow"
      :detail="detail"
    ></base-detail>
    <Question @close="tipsShow = false" :show="tipsShow" :detail="tipsDetail"></Question>
    <MessageBox ref="drawVisible" position="bottom" :isFooter="false" title="选择门店" :maxHeight="1000">
      <view class="select-box">
        <view class="select-item" :class="{ checked: form.merchantId == item.merchantId }" @click="selectMerchantId(item)" v-for="(item, index) in merchants" :key="index">
          {{ item.merchantName }}
        </view>
      </view>
    </MessageBox>
  </view>
</template>

<script>
const _tabList = [
  {
    name: '问界',
    value: 1
  },
  {
    name: '鸿蒙',
    value: 3
  },
  {
    name: '其他',
    value: 2
  },
]
import dayjs from 'dayjs'
import Detail from './Detail'
import baseDialog from './baseDialog'
import baseDetail from './baseDetail'
import point from '@/mixin/point'
import Question from './Question.vue'
export default {
  mixins: [point],
  components: {
    Question,
    Detail,
    baseDialog,
    baseDetail
  },
  props: {
    merchants: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    getPrevDay(val) {
      let date = new Date(val)
      const prevDate = new Date(date.setDate(date.getDate() - 1))
      const year = prevDate.getFullYear()
      const month = prevDate.getMonth() + 1
      const day = prevDate.getDate()
      return `${year}-${month}-${day}`
    }
  },
  inject: ['showPage'],
  data() {
    return {
      show: false,
      baseDetailShow: false,
      baseShow: false,
      tipsDetail: {},
      baseSalaryDetail: {},
      tipsShow: false,
      activeIndex: 1,
      outputDetail: [
        {
          label: '渗透率',
          content: '渗透率 = 成交订单数 / 应触客台数',
          value: 'penetrationRate',
          unit: '%'
        },
        {
          label: '提成系数',
          content: '根据不同的渗透率情况，将按照不同提成系数进行提成发放。',
          value: 'calculateValue'
        },
        {
          label: '提成比例',
          value: 'commissionRatio',
          isLink: true,
          unit: '%'
        }
      ],
      outputList: [
        {
          sence: '延保',
          icon: 'yw-icon',
          value: 0
        },
        {
          sence: '安心包Max',
          icon: 'yw-icon',
          value: 0
        },
        {
          sence: '轻改',
          icon: 'qg-tips',
          value: 1
        }
      ],
      tabelTr: [{ list: [2, 3] }, { list: [2, 3] }],
      tabList: [
        {
          name: '问界',
          value: 1
        },
        {
          name: '鸿蒙',
          value: 3
        },
        {
          name: '其他',
          value: 2
        }
      ],
      detail: {},
      salaryDetail: {},
      form: {
        merchantName: '',
        merchantId: ''
      },
      commissionsInfo: [{}],
      scene0PenetrationRateCommissions: [],
      tipsList: [],
      list: [],
      show: false,
      calDaliog: false,
      caseList: [],
      basicSalary: {}
    }
  },
  mounted() {
    this.outputList = this.outputList.filter(i => i.value == 0)
    // setTimeout(() => {
    //   const _basicSalary = {
    //     confirmSalary: false,
    //     basicSalary: 3000,
    //     performanceSalary: 1000,
    //     actualBasicSalary: 3500,
    //     shouldWorkDay: 26,
    //     actualWorkDay: 10,
    //     actualPerformanceSalary: 1500,
    //     performanceSalaryConfigItemList: [
    //       {
    //         assessmentType: 1,
    //         minAssessmentValue: 0,
    //         maxAssessmentValue: 20,
    //         performanceSalarDeductionRatio: 10
    //       },
    //       {
    //         assessmentType: 1,
    //         minAssessmentValue: 24,
    //         maxAssessmentValue: 26,
    //         performanceSalarDeductionRatio: 50
    //       },
    //       {
    //         assessmentType: 1,
    //         minAssessmentValue: 23,
    //         maxAssessmentValue: 26,
    //         performanceSalarDeductionRatio: 60
    //       },
    //       {
    //         assessmentType: 1,
    //         minAssessmentValue: 22,
    //         maxAssessmentValue: 26,
    //         performanceSalarDeductionRatio: 60
    //       },
    //       {
    //         assessmentType: 1,
    //         minAssessmentValue: 21,
    //         maxAssessmentValue: 26,
    //         performanceSalarDeductionRatio: 100
    //       },
    //       {
    //         assessmentType: 2,
    //         minAssessmentValue: 0,
    //         maxAssessmentValue: 20,
    //         performanceSalarDeductionRatio: 100
    //       }
    //     ]
    //   }
    //   this.basicSalary = _basicSalary
    // }, 100)
  },
  watch: {
    'form.merchantId'(val) {
      val && this.getIncomeCalculationDetail(val)
    },
    merchants: {
      handler(val) {
        this.form.merchantId = val[0].merchantId
        this.form.merchantName = val[0].merchantName
      },
      immediate: true
    }
  },
  methods: {
    getLastDayOfMonth(yearMonth) {
      // 分割字符串，获取年和月
      const [year, month] = yearMonth.split('-').map(Number)

      // 创建一个日期对象，月份是从0开始的，所以这里要 month（而不是 month-1）
      // 我们将日期设置为下个月的第0天，这会自动回到上个月的最后一天
      const date = new Date(year, month, 0)

      // 返回最后一天的日期
      return yearMonth + '-' + date.getDate()
    },
    getDetail(salaryMonth) {
      uni.$api.pointApi.monthSalaryDetail({ salaryMonth: `${this.year}-${(this.month + '').padStart(2, '0')}`, calculationDataFlag: 'Y' }).then(res => {
        this.salaryDetail = res || {}
        this.basicSalary = res || {}
      })
      const { phone: staffPhone } = uni.$storage.get('userInfo')
      const params = {
        staffPhone,
        startTime: salaryMonth + '-01 00:00:00',
        endTime: this.getLastDayOfMonth(salaryMonth) + ' 23:59:59'
      }
      uni.$api.pointApi.attendanceDetail(params).then(res => {
        this.baseSalaryDetail = res
      })
    },
    /**
     * @description 选择门店
     * @param {Object} value 门店对象
     * @property {number} value.merchantId 门店id
     * @property {string} value.merchantName 门店名称
     */
    selectMerchantId(value) {
      this.form.merchantName = value.merchantName
      this.form.merchantId = value.merchantId
      // this.$set(this.form, 'merchantId', value.merchantId)
      // this.$set(this.form, 'merchantName', value.merchantName)
      this.$refs.drawVisible.close()
    },
    getIncomeCalculationDetail(merchantId) {
      uni.$api.pointApi.incomeCalculationDetail({ merchantId }).then(res => {
        console.log(res)
        if (res && res.commissions) {
          const commissions = res.commissions.find(i => i.configType == 3 || i.configType == 4)
          const commissionsOther = res.commissions.filter(i => i.configType == 1)
          if (commissions || commissionsOther.length > 0) {
            this.commissionsInfoQG = []
            console.log(commissionsOther, 'commissionsInfoQG')
            commissionsOther.forEach(i => {
              this.commissionsInfoQG = [...this.commissionsInfoQG, ...(i.nscene0PenetrationRateGoodsCommissions || [])]
            })
            console.log(this.commissionsInfoQG, 'commissionsInfoQG')
            this.scene0PenetrationRateCommissions = commissions?.scene0PenetrationRateCommissions || []
            this.tabList = _tabList.filter(i => this.scene0PenetrationRateCommissions.some(item => item.configCarType === i.value))
            this.activeIndex = this.tabList[0].value
            this.getCommissionsInfo()
          } else {
            this.commissionsInfo = [{}]
            this.commissionsInfoQG = []
            this.scene0PenetrationRateCommissions = []
          }
        } else {
          this.commissionsInfo = [{}]
          this.commissionsInfoQG = []
          this.scene0PenetrationRateCommissions = []
        }
      })
    },

    /**
     * @description 是否展示某个提成
     * @param {string} key 提成key
     * @returns {boolean} 是否展示
     * @description 如果是equityCommission且不展示equityCommission但是展示lightCommission
     *              如果是lightCommission且不展示lightCommission但是展示equityCommission
     *              都不展示
     */
    isShow(key) {
      if (key == 'equityCommission' && !this.salaryDetail.equityCommission && this.salaryDetail.lightCommission) {
        return
      }
      if (key == 'lightCommission' && !this.salaryDetail.lightCommission && this.salaryDetail.equityCommission) {
        return
      }
      return true
    },
    getCommissionsInfo() {
      console.log(this.scene0PenetrationRateCommissions, 'this.scene0PenetrationRateCommissions')
      const result = this.scene0PenetrationRateCommissions.find(i => {
        return i.configCarType == this.activeIndex
      })
      this.commissionsInfo = [...(result?.configCarTypeCommissions || []), ...this.commissionsInfoQG]
      console.log(this.commissionsInfo, 'this.commissionsInfoQG', this.commissionsInfoQG)
    },
    clickTips(item) {
      if (item.label == '基本工资')  {
        this.tipsDetail = Object.assign(item, this.basicSalary)
        // 应出勤天数tips
        const month = dayjs(new Date()).daysInMonth()
        this.tipsDetail.basicList[1].tips = `(本月${month} - ${month - this.basicSalary.shouldWorkDay || 0})`
        // 实际出勤天数tips
        this.tipsDetail.basicList[2].tips = `(截至${dayjs().date() === 1 ? dayjs().format('YYYY-MM-DD') : dayjs().subtract(1, 'day').format('YYYY-MM-DD')})`
      } else {
        this.tipsDetail = item
      }
      this.tipsShow = true
    },
    showTips() {
      this.clickTips({
        label: '应触客台数',
        content: '主机厂（门店）新车销量，未到店交付车辆将按照门店零售驻店的触客比例分配，公式如下：',
        subContent: '应触客台数 =（门店交付数-所有售前触客数）×（个人售前触客数/所有零售驻店售前触客数）+个人售前触客数',
        desc: '如门店只有一名零售驻店，则应触客台数=门店交付数'
      })
    },
    showProductDetail(val) {
      this.detail = {
        label: '产品提成比例明细',
        icon: 'info-icon',
        scale: 1,
        tabelTh: [
          {
            title: '产品名称'
          },
          {
            title: '提成比例',
            width: 20
          }
        ],
        tabelTr: [
          'showGoodsTypeName',
          {
            key: 'commissionRatio',
            format: val => {
              return val + '%'
            }
          }
        ],
        recordList: val.goodsTypeCommissions
      }
      console.log(this.detail, 11)
      this.show = true
    },
    showBaseDetail(item) {
      console.log(888)
      this.baseShow = false
      this.baseDetailShow = true
      const recordList = [1, 2, 3]
      this.detail = { ...item, recordList }
    },
    showDetail(item) {
      if (item.label == '基本工资') {
        this.baseShow = true
        return
      }
      const total = this.salaryDetail[item.value]
      const recordList = this.salaryDetail[item.recordKey]
      this.detail = { ...item, total, recordList }
      console.log(this.detail, 'detail')
      this.show = true
    },
    selectTab(val) {
      this.activeIndex = val
      this.getCommissionsInfo()
    },
    showPopup() {
      this.$refs.drawVisible.open()
    }
  }
}
</script>

<style scoped lang="scss">
.store-container {
  padding-top: toRpx(32);

  .store-header {
    padding: 0 toRpx(36);

    text {
      font-size: toRpx(32);
      margin-top: toRpx(-6);
      margin-left: toRpx(12);
      color: #1a1a1a;
    }

    .tab-box {
      margin-left: auto;
      width: toRpx(212);
      height: toRpx(60);
      background: #f0f6ff00;
      border: toRpx(2) solid #e9ecf2;
      border-radius: toRpx(430);
      display: flex;
      align-items: center;
      justify-content: center;

      .tab-item {
        font-size: toRpx(26);
        color: #666666;
        text-align: center;
        width: 50%;

        &.active {
          width: toRpx(100);
          height: toRpx(48);
          line-height: toRpx(48);
          background: #ffffff;
          border-radius: toRpx(462);
          color: #2d66f7;
        }
      }
    }

    .select-store {
      margin-left: toRpx(38);
      width: toRpx(336);
      height: toRpx(60);
      background: #f0f6ff00;
      border: toRpx(2) solid #dde9fb;
      border-radius: toRpx(12);
      padding: 0 toRpx(20);

      &.ml-auto {
        margin-left: auto;
      }

      .store-name {
        width: toRpx(260);
      }

      .up-icon {
        border-right: toRpx(10) solid transparent;
        border-left: toRpx(10) solid transparent;
        border-top: toRpx(10) solid #000000;
        /* 箭头颜色 */
      }
    }
  }

  .store-body {
    padding: 0 toRpx(36);
    margin-top: toRpx(34);

    .total-box {
      width: 20%;
      padding-left: toRpx(30);

      .total-title {
        font-size: toRpx(28);
        color: #181a1f;
        line-height: toRpx(36);
      }

      .total-num {
        font-size: toRpx(48);
        color: #3773f8;
        font-weight: 600;
        margin-top: toRpx(16);

        text {
          font-size: toRpx(22);
        }
      }

      .total-time {
        margin-top: toRpx(64);
        font-size: toRpx(24);
        color: #808291;
      }
    }

    .total-detail {
      flex: 1;
      overflow-x: auto;

      .month-box {
        margin-left: toRpx(40);
        flex: 1;
        min-width: calc(50% - #{toRpx(40)});
        padding: toRpx(32);
        background: #ffffff;
        border-radius: toRpx(24);

        .month-header {
          text {
            font-size: toRpx(24);
            color: #808291;
            margin-left: toRpx(16);
          }
        }

        .value-box {
          margin-top: toRpx(12);
          .value-desc {
            width: 55%;

            &:last-child {
              width: 45%;
              margin-left: toRpx(30);
            }

            .value-title {
              font-size: toRpx(24);
              color: #adb0b8;
              line-height: toRpx(36);
            }

            .value-price {
              font-size: toRpx(32);
              color: #181a1f;
              line-height: toRpx(60);
              margin-left: toRpx(8);
              text {
                font-size: toRpx(24);
                margin: 0 4rpx;
              }
            }
          }
        }

        .value-detail {
          background: #ffffff;
          border-radius: toRpx(16);
          display: grid;
          padding: toRpx(8) 0;
          margin-top: toRpx(4);
          grid-template-columns: repeat(3, 1fr);
          &.bg-box {
            background: #f7faff;
            border-radius: toRpx(16);
            .detail-item {
              padding-left: 40%;
            }
          }
          .detail-item {
            .detail-label {
              font-size: toRpx(24);
              color: #adb0b8;
              line-height: toRpx(36);
            }
            .detail-link {
              margin-top: toRpx(4);
              font-size: toRpx(24);
              color: #3773f8;
              line-height: toRpx(48);
              .link-icon {
                border-left: toRpx(10) solid #3773f8;
                border-bottom: toRpx(10) solid transparent;
                border-top: toRpx(10) solid transparent;
                margin-left: toRpx(10);
              }
            }
            .detail-num {
              font-size: toRpx(32);
              color: #292d33;
              line-height: toRpx(48);
              &-text {
                display: inline-block;
                font-size: toRpx(24);
                color: #808291;
              }
            }
          }
        }
      }
    }
  }

  .income-body {
    margin-top: toRpx(40);
    background: #ffffff;
    border: toRpx(4) solid #ffffff;
    box-shadow:
      0 0 toRpx(40) -8rpx #5182cc33,
      inset 0 toRpx(4) toRpx(8) 0 #ffffff80;
    border-radius: toRpx(48);
    padding: toRpx(32) toRpx(36);
    height: calc(100vh - #{toRpx(400)});

    .income-header {
      text {
        font-size: toRpx(32);
        margin-top: toRpx(-6);
        margin-left: toRpx(12);
        color: #1a1a1a;
      }

      .history-box {
        margin-left: auto;
        width: 180rpx;
        height: 60rpx;
        border-radius: 16rpx;
        opacity: 1;
        background: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
        box-shadow: inset 0 0 32rpx 0 #ffffff80;

        text {
          color: #ffffff;
          font-size: 26rpx;
          margin-left: 8rpx;
          margin-top: 1prx;
        }
      }
    }

    .income-panel {
      height: toRpx(152);
      width: 100%;
      padding: toRpx(24) toRpx(48);
      background-image: linear-gradient(45deg, #edfaff 10%, #eff7fe 30%, #e5f2fe 50%, #d8f3fb 70%, #edfaff 80%, #c3e4fa 100%);
      border: toRpx(2) solid #ffffff;
      box-shadow: inset 0 toRpx(4) toRpx(8) 0 #ffffff80;
      border-radius: toRpx(24);
      box-sizing: border-box;
      margin: toRpx(20) 0 toRpx(0);

      .panel-up {
        font-size: toRpx(28);
        color: #808291;

        .time {
          margin-left: auto;
          font-size: toRpx(24);
          color: #808291;
        }

        text {
          margin: 0 toRpx(16);
        }
      }

      .panel-bottom {
        font-weight: 600;
        font-size: toRpx(40);
        color: #181a1f;
        margin-top: toRpx(14);

        text {
          font-size: toRpx(28);
        }
      }
    }

    .income-detail {
      display: flex;
      flex-wrap: wrap;
      gap: toRpx(40) toRpx(96);
      padding: toRpx(30);

      .income-detail-item {
        width: calc(50% - #{toRpx(96)});

        .item-label {
          font-weight: 300;
          font-size: toRpx(26);
          color: #181a1f;
          margin: 0 toRpx(10) 0 toRpx(16);
        }

        .item-value {
          font-size: toRpx(30);
          color: #181a1f;
          margin-left: auto;
        }

        .item-next {
          margin-left: toRpx(24);
          width: 0;
          height: 0;
          border-left: toRpx(10) solid #808291;
          border-bottom: toRpx(10) solid transparent;
          border-top: toRpx(10) solid transparent;
          /* 箭头颜色 */
        }
      }
    }

    .income-footer {
      font-size: toRpx(24);
      color: #808291;
      padding: toRpx(20) 0 toRpx(60) toRpx(40);
    }
  }

  .store-footer {
    margin-top: toRpx(40);

    .store-btn {
      width: 100%;
      height: toRpx(80);
      background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      box-shadow: inset 0 0 toRpx(32) 0 #ffffff80;
      border-radius: toRpx(16);
      line-height: toRpx(80);
      font-size: toRpx(28);
      color: #ffffff;
      text-align: center;
    }
  }
}

.select-box {
  margin: toRpx(40) 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRpx(20);
  overflow-y: scroll;
  max-height: 50vh;
  padding-bottom: toRpx(60);

  .select-item {
    text-align: center;
    height: toRpx(68);
    line-height: toRpx(68);
    opacity: 1;
    border: toRpx(2) solid #dce0e6;
    color: #292d33;
    font-size: toRpx(28);
    border-radius: toRpx(8);

    &.checked {
      border: toRpx(2) solid #292d33;
    }
  }
}
</style>
