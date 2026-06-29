<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-07 13:49:15
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-06 15:14:04
 * @FilePath: \gl-tape\components\HomeFrame\components\Income\History.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="history-container" @click="handleTouch">
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">
        <text>{{ pageName }}</text>
      </view>
    </view>
    <view class="history-box">
      <view class="chart-box">
        <view class="chart-header">
          <text class="year-text">{{ year }}年</text>
          <view class="sprite-icon icon-tips-g"></view>
          <text>点击柱形图切换月份</text>
        </view>
        <view id="mycan">
          <canvas canvas-id="DataCanvas" class="canvas-box" @touchstart="handleCanvasClick"></canvas>
        </view>
      </view>
      <view class="income-box">
        <view class="income-header">
          <view class="sprite-icon icon-income-icon"></view>
          <text>{{ year }}年{{ monthStr || month - 1 }}月收入</text>
        </view>
        <template v-if="salaryDetail">
          <view class="income-footer">
            <view class="footer-up flex">
              <view class="sprite-icon icon-income-card"></view>
              <view class="footer-label">当月收入</view>
              <view class="income-mark" v-if="!salaryDetail.confirmSalary">系统测算</view>
              <view class="income-mark primary" v-else>应发工资</view>
            </view>
            <view class="footer-price">
              <text>¥</text>
              {{ salaryDetail.correctSalary || 0 }}
            </view>
          </view>
          <view class="income-list" :style="{ height: 'calc(100% - 484rpx)' }">
            <template v-for="(item, index) in IncomeList">
              <view class="income-item" :key="index" v-if="isShow(item.value)">
                <view class="item-label" @click="handleShow(item)">{{ item.label }}</view>
                <uni-icons type="help" size="18" color="#A2A2A8" @click="clickTips(item)"></uni-icons>
                <view class="item-price">{{ item.showUnit }}{{ formatNumber(salaryDetail[item.value] || '0') }}</view>
                <view class="item-expand" @click="showDetail(item)" v-if="(salaryDetail[item.value] && item.tabelTh) || item.showNext"></view>
              </view>
            </template>
          </view>
          <view class="footer-bottom">
            <view class="income-time flex">
              <view class="sprite-icon icon-time-icon"></view>
              生成时间：{{ salaryDetail.createdDate }}
            </view>
            <view class="income-tips" v-if="salaryDetail.confirmSalary">
              <view class="sprite-icon icon-tips-b"></view>
              <text>人工核验冲减，并已扣除个人所得税和社保</text>
            </view>
            <view class="income-warning" v-else>
              <view class="sprite-icon icon-warning-icon"></view>
              <text>以上测算未包括 个人所得税、社保等事项</text>
            </view>
            <template v-if="!salaryDetail.confirmSalary">
              <view class="verify-btn" v-if="!isExist" @click="handleVerify">我要咨询</view>
              <view class="finish-box flex-center" v-else>
                <view class="sprite-icon icon-finish-icon"></view>
                已提交咨询
              </view>
            </template>
          </view>
        </template>
        <view class="empty-body" v-else>
          <view class="empty-box">
            <image :src="require('@/assets/images/boutique/nothing.webp')" mode="heightFix" />
            <view class="empty-text">暂无记录</view>
          </view>
        </view>
      </view>
    </view>

    <Detail @close="show = false" :show="show" :detail="detail" :tabelTh="detail.tabelTh" :tabelTr="detail.tabelTr"></Detail>
    <Question @close="tipsShow = false" :show="tipsShow" :detail="tipsDetail"></Question>
    <base-dialog @close="baseShow = false" @showBaseDetail="showBaseDetail" :baseSalaryDetail="baseSalaryDetail" :show="baseShow"></base-dialog>
    <base-detail
      @close="
        baseDetailShow = false
        baseShow = true
      "
      :show="baseDetailShow"
      :detail="detail"
    ></base-detail>
    <Dailog @close="showVerify = false" v-if="showVerify" width="1640rpx" title="工资测算咨询" icon="income-count">
      <template slot="content">
        <view class="dailog-body">
          <view class="form-item">
            <view class="form-label">咨询月份：{{ salaryMonth }}</view>
          </view>
          <view class="form-item">
            <view class="form-label">咨询说明：</view>
            <textarea class="textarea-box" placeholder="请填写咨询说明" v-model="appealDesc" />
          </view>
          <view class="form-btn" @click="appealCommit">提交咨询</view>
        </view>
      </template>
    </Dailog>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import Detail from './Detail'
import point from '@/mixin/point'
import Dailog from './Dailog.vue'
import Question from './Question.vue'
import firstTime from '@/mixin/firstTime'
import baseDialog from './baseDialog'
import baseDetail from './baseDetail'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, firstTime, pointTrack],
  components: {
    Detail,
    Dailog,
    Question,
    baseDialog,
    baseDetail
  },
  data() {
    return {
      pageName: '历史收入记录',
      eventCode: 'app_income_history',
      title: '学习数据',
      show: false,
      isExist: false,
      tipsShow: false,
      baseShow: false,
      baseDetailShow: false,
      showVerify: false,
      salaryMonth: '',
      appealDesc: '',
      tipsDetail: {},
      salaryDetail: {},
      baseSalaryDetail: {},
      detail: {},
      canvasList: [
        { date: '1月', num: 0 },
        { date: '2月', num: 24 },
        { date: '3月', num: 100 },
        { date: '4月', num: 45 },
        { date: '5月', num: 15 },
        { date: '6月', num: 54 },
        { date: '7月', num: 0 },
        { date: '8月', num: 0 },
        { date: '9月', num: 0 },
        { date: '10月', num: 0 },
        { date: '11月', num: 0 },
        { date: '12月', num: 0 }
      ],
      width: 600,
      height: 420,
      monthStr: '',
      canPersent: [], //百分比数组

      listIndex: 0,
      basicSalary: {}
    }
  },
  mounted() {
    this.IncomeList = this.IncomeList.sort((a, b) => a.sort - b.sort)
    console.log(this.IncomeList, 'IncomeList')
    const query = uni.createSelectorQuery().in(this)
    query
      .select('.canvas-box')
      .boundingClientRect(data => {
        this.width = data.width - 30
        this.height = data.height - 15
        // this.showChart()
      })
      .exec()
    // setTimeout(() => {
    //   const _basicSalary = {
    //     confirmSalary: true,   // 是否确认工资，核验
    //     basicSalary: 3000,  // 基本工资/底薪
    //     performanceSalary: 1000, // 绩效工资
    //     actualBasicSalary: 3500,  // 实际基本工资
    //     shouldWorkDay: 26,  // 应出勤天数
    //     actualWorkDay: 10,  // 实际出勤天数
    //     actualPerformanceSalary: 1500,  // 实际绩效工资
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
  methods: {
    isShow(key) {
      if (key == 'equityCommission' && !this.salaryDetail.equityCommission && this.salaryDetail.lightCommission) {
        return
      }
      if (key == 'lightCommission' && !this.salaryDetail.lightCommission && this.salaryDetail.equityCommission) {
        return
      }
      return true
    },
    handleVerify() {
      this.showVerify = true
    },
    appealCommit() {
      if (!this.appealDesc) {
        uni.showToast({
          title: '请填写咨询说明',
          icon: 'none'
        })
      }
      const { phone: staffPhone } = uni.$storage.get('userInfo')
      const params = {
        staffPhone,
        appealType: 2, // 工资
        appealDate: this.salaryMonth + '-01',
        appealDesc: this.appealDesc
      }
      uni.$api.pointApi.appealCommit(params).then(res => {
        this.showVerify = false
        this.appealExist()
      })
    },
    getDetail(date) {
      uni.$api.pointApi.pageStat({ salaryMonthBegin: `${this.year}-01`, salaryMonthEnd: `${this.year}-12` }).then(res => {
        const list = res.list || []
        const canvasList = []
        for (let i = 0; i < 12; i++) {
          const num = list.find(item => {
            const m = item.salaryMonth.replace(/\d+-/, '')
            return m - 1 == i
          })
          canvasList.push({
            date: `${i + 1}月`,
            num: 0
          })
          if (num) {
            canvasList[i].num = num.correctSalary
          }
        }
        this.canvasList = canvasList
        this.showChart(this.month - 2)
      })
      this.monthSalaryDetail(this.year + '-' + String(this.month - 1).padStart(2, 0))
    },
    getLastDayOfMonth(yearMonth) {
      // 分割字符串，获取年和月
      const [year, month] = yearMonth.split('-').map(Number)

      // 创建一个日期对象，月份是从0开始的，所以这里要 month（而不是 month-1）
      // 我们将日期设置为下个月的第0天，这会自动回到上个月的最后一天
      const date = new Date(year, month, 0)

      // 返回最后一天的日期
      return yearMonth + '-' + date.getDate()
    },
    /**
     * 个人月薪资明细
     * @param {String} salaryMonth - 月份,格式为:YYYY-MM
     * @return {Promise}
     */
    monthSalaryDetail(salaryMonth) {
      this.salaryMonth = salaryMonth
      uni.$api.pointApi.monthSalaryDetail({ salaryMonth }).then(res => {
        this.salaryDetail = res
        this.basicSalary = res
      })
      const { phone: staffPhone } = uni.$storage.get('userInfo')
      const params = {
        staffPhone,
        startTime: this.salaryMonth + '-01 00:00:00',
        endTime: this.getLastDayOfMonth(this.salaryMonth) + ' 23:59:59'
      }
      uni.$api.pointApi.attendanceDetail(params).then(res => {
        this.baseSalaryDetail = res
      })
      this.appealExist()
    },
    appealExist() {
      const { phone: staffPhone } = uni.$storage.get('userInfo')
      uni.$api.pointApi.appealExist({ staffPhone, appealType: 2, appealDate: this.salaryMonth + '-01' }).then(res => {
        this.isExist = res
      })
    },

    /**
     * 点击tips
     * @param {Object} item - 点击的tips对象
     */
    clickTips(item) {
      console.log(this.basicSalary, 'basicSalary=======')
      if (item.label == '基本工资') {
        this.tipsDetail = Object.assign(item, this.basicSalary)
        console.log(dayjs(new Date()).daysInMonth())
        // 应出勤天数tips
        const month = dayjs(this.salaryMonth).daysInMonth()
        this.tipsDetail.basicList[1].tips = `(本月${month} - ${month-this.basicSalary.shouldWorkDay})`
        // 实际出勤天数tips
        this.tipsDetail.basicList[2].tips = `(截至${dayjs(this.salaryMonth).endOf('month').format('YYYY-MM-DD')})`
      } else {
        this.tipsDetail = item
      }
      this.tipsShow = true
    },
    showBaseDetail(item) {
      this.baseShow = false
      this.baseDetailShow = true
      this.detail = item
    },
    /**
     * 显示薪资明细
     * @param {Object} item - 点击的月份对象
     */
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
    /**
     * 点击柱状图时的回调函数
     * @param {Object} e - 点击事件对象
     */
    handleCanvasClick(e) {
      // 获取点击位置
      const touchX = e.touches[0].x
      const touchY = e.touches[0].y

      // 计算柱状图之间的间隔
      const gap = this.width / this.canPersent.length

      // 判断点击的是哪个柱形图
      for (let i = 0; i < this.canPersent.length; i++) {
        const startX = 10 + gap * i
        const endX = startX + 40 // 柱形图的宽度假设为10
        const startY = 0
        // const startY = this.height - this.canPersent[i] - 6;
        const endY = this.height - 6

        // 判断点击位置是否在柱形图内
        if (touchX >= startX && touchX <= endX && touchY >= startY && touchY <= endY) {
          // 点击了第 i 个柱形图
          console.log(`点击了 ${this.canvasList[i].date} 的柱形图`)
          // 在这里可以添加切换月份或显示详细信息的逻辑
          if (this.canvasList[i].num) {
            this.showChart(i) // 重新绘制图表，如果需要更新显示
            const month = this.canvasList[i].date.replace(/\D+/, '')
            this.monthStr = month
            this.monthSalaryDetail(this.year + '-' + month.padStart(2, 0))
          }

          break
        }
      }
    },
    // 坐标图
    showChart(index) {
      const ctx = uni.createCanvasContext('DataCanvas')
      ctx.lineWidth = 1
      // 横坐标
      ctx.beginPath() //新建一条path
      ctx.setStrokeStyle('#c6c6c6')
      ctx.moveTo(20, this.height) //把画笔移动到指定的坐标
      //   ctx.lineTo(this.width, this.height) //绘制一条从当前位置到指定坐标(200, 50)的直线.
      ctx.closePath() //闭合路径。会拉一条从当前点到path起始点的直线。如果当前点与起始点重合，则什么都不做
      ctx.stroke() //绘制路径。
      // 纵坐标
      ctx.beginPath()
      ctx.moveTo(20, 0)
      // ctx.lineTo(20, this.height)
      ctx.closePath()
      ctx.stroke()

      var max = 0 //最大值
      // 找到最大的数
      for (var i = 0; i < this.canvasList.length; i++) {
        if (this.canvasList[i].num >= max) {
          max = this.canvasList[i].num
        }
      }

      max = 100 * Math.ceil(max / 100)

      // 计算百分比: 以数组中最大的为100%，来计算其他的百分比
      for (var i = 0; i < this.canvasList.length; i++) {
        this.canPersent[i] = (this.canvasList[i].num / max) * (this.height - 40) // -10 ,防止太高溢出头
      }

      console.log(this.canPersent)
      const step = Math.ceil(max / 5) // 假设我们想要5个刻度
      const yStep = (this.height - 40) / 5

      // 绘制纵坐标线和刻度标签
      for (let i = 0; i <= 5; i++) {
        const y = this.height - i * yStep
        ctx.beginPath()
        ctx.moveTo(20, y)
        ctx.lineTo(30, y)
        // ctx.stroke()
        if (i != 0) {
          ctx.setFillStyle('#808291')
          ctx.fillText('¥' + step * i, 0, y + 5)
          ctx.setFillStyle('#000') // 恢复默认字体颜色
        }
      }
      // 柱状图之间的间隔
      // 绘制7个粗线条 (300-20)/7 = 40，所以 i 每次要加上40  20为左右间隔
      var gap = this.width / this.canPersent.length
      console.log('--gap----->', gap)

      for (var i = 0; i < this.canPersent.length; i++) {
        console.log(this.canvasList[i], 'this.canvasList[i]')
        // 横坐标的数据
        ctx.setFillStyle('#808291')
        ctx.fillText(this.canvasList[i].date, 30 + gap * i, this.height + 10)
        ctx.setFillStyle('#000') // 恢复默认字体颜色
        if (this.canvasList[i].num == 0) {
          continue
        }
        // 柱状图上的数据
        // 获取文本宽度
        const text = '¥' + this.formatNumber(this.canvasList[i].num)
        const textWidth = ctx.measureText(text).width

        // 计算文本的起始位置以使其居中
        const textX = 40 + gap * i - textWidth / 2

        ctx.fillText(text, textX, this.height - this.canPersent[i] - 15)
        // if (this.canPersent[i] == 0) {
        //   i++
        //   ctx.fillText(this.canvasList[i].date, 30 + gap * i, this.height + 10)
        //   this.canvasList[i].num && ctx.fillText(this.canvasList[i].num, 33 + gap * i, this.height - this.canPersent[i] - 15)
        // }
        ctx.beginPath()
        ctx.setStrokeStyle(i == index ? 'rgba(44, 102, 247, 1)' : 'rgba(44, 102, 247, 0.2)') //设置柱状图颜色
        ctx.moveTo(40 + gap * i, this.height - this.canPersent[i] - 2)
        ctx.lineTo(40 + gap * i, this.height - 15)
        ctx.lineWidth = 10
        ctx.lineCap = 'round' //设置线条样式
        ctx.stroke()
      }
      ctx.draw()
    }
  }
}
</script>

<style scoped lang="scss">
#mycan {
  margin: 20px;
}
.canvas-box {
  height: calc(100vh - 520rpx);
  width: 100%;
}
.navTab {
  display: flex;
  justify-content: space-evenly;
  margin: 3px 0;
}

.activite {
  color: #fc722d;
  padding: 3px 0;
  border-bottom: 3px #fc722d solid;
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
.history-box {
  width: calc(100vw - 128rpx);
  margin: 30rpx auto 0;
  height: calc(100vh - 220rpx);
  box-sizing: border-box;
  display: flex;
  .chart-box {
    background: #ffffff;
    border-radius: 48rpx;
    flex: 1;
    padding: 64rpx;
    .chart-header {
      font-size: 24rpx;
      color: #808291;
      display: flex;
      align-items: center;
      .sprite-icon {
        margin-left: auto;
        transform: scale(0.7);
      }
      .year-text {
        font-weight: 600;
        color: rgb(26, 26, 26);
        font-size: 64rpx;
        margin-right: 36rpx;
      }
    }
  }
  .income-box {
    background-image: linear-gradient(180deg, #faf9f7 0%, #ffffff 28%);
    border: 4rpx solid #ffffff;
    box-shadow: inset 0 4rpx 8rpx 0 #ffffff80;
    border-radius: 48rpx;
    width: 648rpx;
    margin-left: 48rpx;
    padding: 56rpx 64rpx;
    box-sizing: border-box;
    .income-header {
      font-size: 36rpx;
      color: #1a1a1a;
      font-weight: 600;
      display: flex;
      align-items: center;
      text {
        margin-left: 24rpx;
      }
    }
    .income-list {
      margin-top: 28rpx;
      overflow-y: auto;
      .income-item {
        height: 76rpx;
        display: flex;
        align-items: center;
        padding: 0 20rpx 0rpx 32rpx;
        .item-label {
          font-size: 26rpx;
          color: #181a1f;
          margin-right: 6rpx;
        }
        .item-price {
          font-size: 30rpx;
          color: #181a1f;
          margin-left: auto;
        }
        .item-expand {
          margin-left: 24rpx;
          width: 0;
          height: 0;
          border-left: 10rpx solid #808291;
          border-bottom: 10rpx solid transparent;
          border-top: 10rpx solid transparent; /* 箭头颜色 */
        }
      }
    }
    .footer-bottom {
      .income-time {
        color: #808291;
        font-size: 24rpx;
        line-height: 40rpx;
      }
      .income-tips {
        font-size: 24rpx;
        color: #2c66f7;
        display: flex;
        align-items: center;
        margin-top: 10rpx;
      }
      .income-warning {
        font-size: 24rpx;
        color: #f59619;
        display: flex;
        align-items: center;
        margin-top: 10rpx;
      }
      .finish-box {
        color: #2cca74;
        font-size: 32rpx;
        margin-top: 56rpx;
      }
      .verify-btn {
        width: 288rpx;
        height: 80rpx;
        border-radius: 16rpx;
        opacity: 1;
        background: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
        box-shadow: inset 0 0 32rpx 0 #ffffff80;
        text-align: center;
        color: #ffffff;
        font-size: 32rpx;
        line-height: 80rpx;
        margin: 40rpx auto 0;
      }
    }
    .income-footer {
      margin-top: 24rpx;
      justify-content: space-between;
      padding: 32rpx 48rpx;
      background-image: linear-gradient(45deg, #edfaff 10%, #eff7fe 30%, #e5f2fe 50%, #d8f3fb 70%, #edfaff 80%, #c3e4fa 100%);
      border: toRpx(2) solid #ffffff;
      box-shadow: inset 0 toRpx(4) toRpx(8) 0 #ffffff80;
      border-radius: 24rpx;
      .footer-label {
        font-size: 26rpx;
        color: #181a1f;
        margin-left: 16rpx;
      }
      .income-mark {
        border-radius: 12rpx;
        opacity: 1;
        background: #fef4e8;
        color: #f59619;
        font-size: 24rpx;
        text-align: center;
        padding: 6rpx 16rpx;
        margin-left: auto;
        &.primary {
          background: #ecf1fe;
          color: #3773f8;
        }
      }
      .footer-price {
        font-size: 40rpx;
        color: #181a1f;
        margin-top: 16rpx;
        font-weight: 600;
        text {
          font-size: 28rpx;
        }
      }
    }
  }
}
.empty-body {
  height: calc(100vh - 540rpx);
  overflow-y: auto;
  overflow-x: hidden;
  .empty-box {
    text-align: center;
    margin-top: 160rpx;
    image {
      height: 224rpx;
    }
    .empty-text {
      font-size: 28rpx;
      color: #808291;
      line-height: 40rpx;
      text-align: center;
    }
  }
  .tips-item {
    padding: 30rpx 32rpx;
    width: 100%;
    min-height: 384rpx;
    background: #ffffffb3;
    border-radius: 24rpx;
    margin-top: 32rpx;

    .item-header {
      text {
        font-size: 24rpx;
        color: #808291;
      }
    }

    .item-logo {
      width: 100%;
      height: 88rpx;
      background-image: linear-gradient(81deg, #f0f6ff 0%, #f7faff 4%, #ecf4fe 9%, #f8f9ff 11%, #e8f2ff 43%, #f0f2ff 66%, #dbedff 100%);
      font-size: 32rpx;
      text-align: center;
      line-height: 88rpx;
      font-weight: 700;
      margin: 10rpx 0;

      text {
        background: linear-gradient(129deg, #0eabf9 13%, #2f80ea 50%, #7d6ee6 91%);
        color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
      }
    }

    .item-content {
      font-size: 26rpx;
      color: #181a1f;
      line-height: 40rpx;
    }

    .item-footer {
      margin-top: 16rpx;

      text {
        font-size: 24rpx;
        color: #adb0b8;
      }
    }
  }
}
.dailog-content {
  font-size: 32rpx;
  color: #1a1a1a;
  line-height: 52rpx;
  padding: 0 120rpx 0 152rpx;
  margin-top: 32rpx;
}
.dailog-desc {
  font-size: 32rpx;
  color: #808291;
  padding: 0 120rpx 0 152rpx;
  margin-top: 32rpx;
  line-height: 48rpx;
}
.dailog-body {
  padding: 0 144rpx;
  .form-item {
    .form-label {
      color: #181a1f;
      font-size: 32rpx;
      margin-bottom: 20rpx;
    }
    .textarea-box {
      width: 100%;
      height: 488rpx;
      border-radius: 20rpx;
      opacity: 1;
      border: 2rpx solid #e8e8e8;
      background: #ffffff;
      padding: 20rpx 24rpx;
    }
  }
  .form-btn {
    width: 376rpx;
    height: 88rpx;
    border-radius: 16rpx;
    opacity: 1;
    background: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
    box-shadow: inset 0 0 32rpx 0 #ffffff80;
    text-align: center;
    color: #ffffff;
    font-size: 36rpx;
    line-height: 88rpx;
    margin: 48rpx auto 0;
  }
}
</style>
