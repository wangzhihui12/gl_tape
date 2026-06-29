<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-08 09:51:43
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-06 15:18:53
 * @FilePath: \gl-tape\components\HomeFrame\components\Income\Tips.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <view class="tips-container">
    <view class="tips-header flex">
      <view class="sprite-icon icon-tips"></view>
      <text>今日TIPS</text>
    </view>
    <view class="tips-body" v-if="tipsList.length">
      <view class="tips-item" v-for="(item, index) in tipsList" :key="index">
        <view class="item-header flex">
          <view class="sprite-icon icon-store-icon"></view>
          <text>{{ item.merchantName }}</text>
        </view>
        <view class="item-logo">
          <text>{{ item.messageTypeName }}</text>
        </view>
        <view class="item-content">{{ item.tipsContent }}</view>
        <view class="item-footer flex-between">
          <text>{{ item.createdDate | formatTime }}</text>
        </view>
      </view>
    </view>
    <view class="tips-body" v-else>
      <view class="empty-box">
        <image :src="require('@/assets/images/boutique/nothing.webp')" mode="heightFix" />
        <view class="empty-text">暂无记录</view>
      </view>
    </view>
    <!-- <view class="tips-footer">
      <view class="tips-btn" @click="IncomeCal">
        <text>收入测算</text>
        <view class="tip-img">
          <view class="sprite-icon icon-btn-tips"></view>
        </view>
      </view>
    </view> -->
    <Dailog @close="closeCalDaliog" v-if="calDaliog" width="1600rpx" title="职级晋升、渗透率提升后收入测算">
      <view class="dailog-body" slot="content">
        <view :class="{ 'input-box select-container': true, row_2: form.sceneType === '0' }">
          <template v-for="(item, index) in selectList">
            <view class="input-item" :key="index" v-if="item.key != 'configCarType' || (item.key == 'configCarType' && form.sceneType === '0')">
              <view class="input-label">{{ item.label }}</view>
              <view :class="['select flex', { placeholderStyle: !getValue(item.key, form[item.key]) }]" @click="showPopup(item, item.key)">
                <view class="text-hide">{{ getValue(item.key, form[item.key]) || '请选择' }}</view>
                <uni-icons class="arrow" type="right" :size="16"></uni-icons>
              </view>
            </view>
          </template>
        </view>
        <view class="line"></view>
        <view class="input-box">
          <view class="input-item">
            <view :class="['input-label label-mark ', form.goodsTypeList.length && form.goodsTypeList[0].showName ? 'mr-120' : 'label-m']">应触客台数</view>
            <input type="number" class="input" maxlength="3" @input="form.shouldToShopCount = form.shouldToShopCount.replace(/\D/g, '')" placeholder="请输入" v-model="form.shouldToShopCount" />
          </view>
        </view>
        <view class="input-box num-second" v-if="form.goodsTypeList.length">
          <template v-for="(item, index) in form.goodsTypeList">
            <block :key="index">
            <view class="input-item" >
              <view :class="{ 'label-mark': true, 'label-m': !item.showName }">{{ item.showName }}</view>
              <view class="input-label">订单数</view>
              <input type="number" class="input" maxlength="3" @input="item.subOrderCount = item.subOrderCount.replace(/\D/g, '')" placeholder="请输入" v-model="item.subOrderCount" />
            </view>
            <view class="input-item">
              <view class="input-label">产值</view>
              <input type="number" class="input" maxlength="7" @input="item.totalPrice = item.totalPrice.replace(/\D/g, '')" placeholder="请输入" v-model="item.totalPrice" />
            </view>
            </block>
          </template>
        </view>
      </view>
      <template slot="footer">
        <view class="dailog-footer">
          <view :class="{ 'dailog-btn': true, grey: !isClick }" @click="startCount(isClick)">开始测算</view>
        </view>
      </template>
    </Dailog>
    <Dailog @close="closeResultDailog" v-if="show" class="result-dailog" width="1400rpx" title="收入测算结果">
      <view class="dailog-body result-body flex" slot="content">
        <view :class="{ 'output-box': true, 'output-one': form.sceneType == 1 }">
          <view class="month-box" v-if="form.sceneType == 1">
            <view class="month-mark flex">
              <view class="sprite-icon icon-qg-tips"></view>
              <text>轻改</text>
            </view>
            <view class="value-box">
              <view class="value-desc flex">
                <view class="value-title">本月产值</view>
                <view class="value-price">
                  <text>¥</text>
                  {{ salaryDetail.commissionRecord.orderTotalPrice }}
                </view>
              </view>
              <view class="value-desc flex">
                <view class="value-title">成交</view>
                <view class="value-price">
                  {{ salaryDetail.commissionRecord.orderCount }}
                  <text>单</text>
                </view>
              </view>
            </view>
            <view class="value-detail value-two">
              <view class="detail-item">
                <view class="detail-label">渗透率</view>
                <view class="detail-num">--</view>
              </view>
              <view class="detail-item">
                <view class="detail-label">提成系数</view>
                <view class="detail-num">{{ salaryDetail.commissionRecord.avgCustomerCalculateValue || '--' }}</view>
              </view>
            </view>

            <view class="ratio-panel">
              <view class="ratio-item flex-between" v-for="(output, i) in salaryDetail.goodsTypeList" :key="i">
                <view class="ratio-label">{{ output.showName }}提成比例</view>
                <view class="ratio-num">{{ output.outputCommissionRatio }}%</view>
              </view>
            </view>
          </view>
          <template v-else>
            <view class="month-box" v-for="(item, index) in form.goodsTypeList" :key="index">
              <view class="month-mark flex">
                <view :class="`sprite-icon icon-${item.showName ? 'yw-icon' : 'qg-tips'}`"></view>
                <text>{{ form.sceneType == 1 ? '轻改' : item.showName }}</text>
              </view>
              <view class="value-box">
                <view class="value-desc flex">
                  <view class="value-title">本月产值</view>
                  <view class="value-price">
                    <text>¥</text>
                    {{ item.totalPrice }}
                  </view>
                </view>
                <view class="value-desc flex">
                  <view class="value-title">成交</view>
                  <view class="value-price">
                    {{ item.subOrderCount || 0 }}
                    <text>单</text>
                  </view>
                </view>
              </view>
              <view class="value-detail">
                <template v-for="(output, i) in outputDetail">
                  <view class="detail-item" :key="i">
                    <view class="detail-label">{{ output.label }}</view>
                    <view class="detail-num">{{ getOutput(output, item) }}{{ output.unit }}</view>
                  </view>
                </template>
              </view>
            </view>
          </template>
        </view>

        <view class="month-mid"><uni-icons type="right" :size="14" color="#fff"></uni-icons></view>
        <view class="month-result">
          <view class="result-title">测算结果仅供参考</view>
          <view class="result-main">
            <view class="result-item">
              <view class="result-label">基本工资</view>
              <view class="result-price">{{ formatNumber(salaryDetail.basicSalary) }}</view>
            </view>
            <!-- <template v-if="form.sceneType == 1">
              <view class="result-item">
                <view class="result-label">轻改提成</view>
                <view class="result-price">{{ formatNumber(salaryDetail.commissionPrice) }}</view>
              </view>
            </template> -->
            <view class="result-item" v-for="(item, index) in form.goodsTypeList" :key="index">
              <view class="result-label">{{ item.showName }}提成</view>
              <view class="result-price">{{ formatNumber(salaryDetail.goodsTypeList[getIndex(item)] ? salaryDetail.goodsTypeList[getIndex(item)].commissionPrice : 0) }}</view>
            </view>
            <view class="result-item checked">
              <view class="result-label">合计提成</view>
              <view class="result-price">{{ formatNumber(salaryDetail.commissionPrice) }}</view>
            </view>
            <view class="result-item">
              <view class="result-label">本月递延金</view>
              <view class="result-price">{{ formatNumber(salaryDetail.deferExpenses) }}</view>
            </view>
          </view>
          <view class="result-footer">
            <view class="result-label">收入合计（估算）</view>
            <view class="result-price">
              <text>¥</text>
              {{ salaryDetail.salary }}
            </view>
          </view>
        </view>
      </view>
      <template slot="footer">
        <view class="dailog-footer mt-20">
          <view
            class="dailog-btn"
            @click="
              show = false
              calDaliog = true
            "
          >
            再测一次
          </view>
          <view class="dailog-btn disabled" @click="closeResultDailog">关闭</view>
        </view>
      </template>
    </Dailog>
    <MessageBox ref="drawVisible" position="bottom" :isFooter="false" :title="`请选择${drawInfo.label}`" :maxHeight="1000">
      <view class="select-box">
        <view class="select-item" :class="{ checked: form[selectKey] == item.value }" @click="selectBox(item)" v-for="(item, index) in list" :key="index">
          {{ item.label }}
        </view>
      </view>
    </MessageBox>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import Dailog from './Dailog'
import point from '@/mixin/point'
import pointTrack from '@/mixin/pointTrack'
export default {
  mixins: [point, pointTrack],
  components: {
    Dailog
  },
  props: {
    merchants: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    formatTime(val) {
      return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  data() {
    return {
      pageName: '收入测算试算页',
      eventCode: 'app_income_count',
      errorTip: false,
      isClick: false,
      list: [],
      selectKey: '',
      selectObj: {},
      outputDetail: [
        {
          label: '渗透率',
          content: '渗透率 = 成交订单数 / 应触客台数',
          unit: '%',
          value: 'penetrationRate'
        },
        {
          label: '提成系数',
          content: '根据不同的渗透率情况，将按照不同提成系数进行提成发放。',
          value: 'calculateValue'
        },
        {
          label: '提成比例',
          value: 'outputCommissionRatio',
          unit: '%'
        }
      ],
      formItemList: {
        merchantId: [],
        sceneType: [
          {
            label: '轻改',
            value: '1'
          },
          {
            label: '会员权益/升级',
            value: '0'
          }
        ],
        configCarType: [
          {
            label: '问界',
            value: '1'
          },
          {
            label: '鸿蒙',
            value: '3'
          },
          {
            label: '其他',
            value: '2'
          }
        ],
        jobType: [
          {
            label: '初级驻店',
            value: '2'
          },
          {
            label: '中级驻店',
            value: '3'
          },
          {
            label: '高级驻店',
            value: '4'
          }
        ]
      },
      form: {},
      drawInfo: {},
      salaryDetail: {},
      selectList: [
        { label: '职级', key: 'jobType' },
        { label: '业务类型', key: 'sceneType' },
        { label: '门店', key: 'merchantId' },
        { label: '品牌', key: 'configCarType', isHide: true }
      ],
      tipsList: [],
      list: [],
      show: false,
      calDaliog: false,
      caseList: []
    }
  },
  watch: {
    merchants: {
      handler(val) {
        this.formItemList.merchantId = val.map(i => {
          return {
            label: i.merchantName,
            value: i.merchantId
          }
        })
      },
      immediate: true
    },
    'form.merchantId'(val) {
      if (val) {
        console.log(val)
      }
    },
    form: {
      handler(val) {
        const { merchantId, sceneType, jobType, configCarType, goodsTypeList, shouldToShopCount } = val
        let flag = false
        if (goodsTypeList.length == 0) {
          flag = true
        }
        goodsTypeList.forEach(i => {
          if (!i.subOrderCount || !i.totalPrice) {
            flag = true
          }
        })
        console.log(goodsTypeList, 'goodsTypeList')
        if (merchantId && sceneType && jobType && ((sceneType == 0 && configCarType) || sceneType == 1) && shouldToShopCount && !flag) {
          this.isClick = true
        } else {
          this.isClick = false
        }
      },
      deep: true
    },
    formItem: {
      handler(val) {
        const fL = val.filter(i => i)
        if (fL.length == 4 && this.form.sceneType == 0) {
          this.getLatestConfigDetail()
        }
        if (fL.length >= 3 && this.form.sceneType == 1) {
          this.getLatestConfigDetail()
        }
      },
      deep: true
    },
    'form.sceneType'(val) {
      if (val === '1') {
        this.form.goodsTypeList = [
          {
            showName: '',
            subOrderCount: '',
            totalPrice: ''
          }
        ]
      }
    }
  },
  computed: {
    formItem() {
      const { merchantId, sceneType, jobType, configCarType } = this.form
      return [merchantId, sceneType, jobType, configCarType]
    }
  },
  methods: {
    closeResultDailog() {
      this.show = false
      this.leavePage()
    },
    closeCalDaliog() {
      this.calDaliog = false
      this.leavePage()
    },
    getOutput(output, item) {
      return this.salaryDetail.commissionRecord ? this.salaryDetail.commissionRecord[output.value] : (this.salaryDetail.goodsTypeList[this.getIndex(item)] && this.salaryDetail.goodsTypeList[this.getIndex(item)][output.value]) || 0
    },
    getIndex(item) {
      const idx = this.salaryDetail.goodsTypeList.findIndex(i => i.showName == item.showName)
      return idx
    },
    IncomeCal() {
      this.enterPage()
      this.calDaliog = true
      this.form = {
        shouldToShopCount: '',
        goodsTypeList: [],
        sceneType: ''
      }
      this.selectKey = ''
    },
    getDetail() {
      const { phone: staffPhone, shopMerchantId: merchantId } = uni.$storage.get('userInfo')
      uni.$api.pointApi.getTipsMessage({ staffPhone, merchantId }).then(res => {
        this.tipsList = res || []
      })
    },
    /**
     * @description: 开始计算
     * @return {void}
     */
    startCount() {
      if (!this.isClick) {
        return
      }
      const { phone: staffPhone } = uni.$storage.get('userInfo')
      const params = { staffPhone, ...this.form }
      // if (params.sceneType == 1) {
      //   const { subOrderCount, totalPrice } = params.goodsTypeList[0]
      //   params.lightOrderCount = subOrderCount
      //   params.lightTotalPrice = totalPrice
      //   delete params.goodsTypeList
      // }
      if (params.goodsTypeList[0] && !params.goodsTypeList[0].showName) {
        delete params.goodsTypeList
      }
      uni.$api.pointApi.monthSalaryCalculation(params).then(res => {
        this.salaryDetail = res
        if (!this.salaryDetail.goodsTypeList && !this.salaryDetail.commissionRecord) {
          uni.showToast({
            title: '该门店绩效未配置，无法测算，请联系上级进行配置。',
            icon: 'none'
          })
          return
        }
        this.calDaliog = false
        this.show = true
      })
    },
    /**
     * @description: 获取配置明细
     * @return {void}
     */
    getLatestConfigDetail() {
      const { merchantId, sceneType, jobType, configCarType } = this.form
      uni.$api.pointApi.getLatestConfigDetail({ merchantId, sceneType, hireType: 2, jobType, configCarType }).then(res => {
        this.form.goodsTypeList = res.map(i => {
          return {
            ...i,
            subOrderCount: '',
            totalPrice: ''
          }
        })
        console.log(this.form.goodsTypeList, 'this.form.goodsTypeList')
      })
    },
    /**
     * @description: 选择框change事件
     * @param {Object} val 选择框的值
     * @return {void}
     */
    selectBox(val) {
      Object.assign(this.selectObj, {
        [this.selectKey + '_' + val.value]: val.label
      })
      console.log(this.selectObj)
      this.$set(this.form, this.selectKey, val.value)
      this.$refs.drawVisible.close()
    },
    /**
     * @description: 通过key和value获取label
     * @param {String} f key
     * @param {String} k value
     * @return {String} label
     */
    getValue(f, k) {
      return this.selectObj[f + '_' + k]
    },
    /**
     * @description: 显示选择框
     * @param {String} val 选择框的值
     * @return {void}
     */
    showPopup(val) {
      this.drawInfo = val
      this.list = this.formItemList[val.key]
      this.selectKey = val.key
      this.$refs.drawVisible.open()
    }
  }
}
</script>

<style scoped lang="scss">
.tips-container {
  padding: 32rpx 36rpx;

  .tips-header {
    text {
      font-size: 32rpx;
      margin-top: -6rpx;
      margin-left: 12rpx;
      color: #1a1a1a;
    }
  }

  .tips-body {
    height: calc(100vh - 420rpx);
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
      background: #ffffffb3;
      border-radius: 24rpx;
      margin-top: 32rpx;

      .item-header {
        text {
          font-size: 24rpx;
          color: #808291;
          margin-left: 8rpx;
        }
      }

      .item-logo {
        width: 100%;
        height: 88rpx;
        background-image: linear-gradient(81deg, #f0f6ff 0%, #f7faff 4%, #ecf4fe 9%, #f8f9ff 11%, #e8f2ff 43%, #f0f2ff 66%, #dbedff 100%);
        font-size: 32rpx;
        text-align: center;
        line-height: 92rpx;
        font-weight: 700;
        margin: 22rpx 0;

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

  .tips-footer {
    margin-top: 40rpx;

    .tips-btn {
      width: 100%;
      height: 80rpx;
      background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      box-shadow: inset 0 0 32rpx 0 #ffffff80;
      border-radius: 16rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      color: #ffffff;
      text-align: center;
      position: relative;

      .tip-img {
        position: absolute;
        right: 0;
        top: -12rpx;
      }
    }
  }
}

.dailog-body {
  padding: 0 64rpx 24rpx;
  max-height: 50vh;
  overflow-y: auto;
  &.result-body {
    overflow-y: visible;
  }
  .output-box {
    max-height: 600rpx;
    overflow-y: auto;
    box-sizing: border-box;
    overflow-x: hidden;
    &.output-one {
      // min-height: 420rpx;
    }
  }

  .line {
    border-top: 2rpx dashed #e1e9fa;
    margin: 47rpx 50rpx;
  }
  .input-box {
    width: 100%;
    display: flex;
    padding: 0 64rpx;
    justify-content: space-between;
    margin-bottom: 40rpx;
    &.select-container {
      display: grid;
      gap: 40rpx;
      grid-template-columns: 31% 38% 31%;
    }
    &.row_2 {
      // grid-template-columns: 50% 50%;
      .input-label {
        width: 150rpx;
      }
    }
    &.num-second {
      flex-wrap: wrap;

      .input-item {
        margin-bottom: 40rpx;
      }
    }

    .input-item {
      display: flex;
      align-items: center;

      .label-mark {
        position: relative;
        font-size: 32rpx;
        color: #808291;
        width: 250rpx;
        text-align: left !important;
        height: 40rpx;
        &.mr-120 {
          margin-right: 114rpx;
        }
        &.label-m {
          width: auto;
        }
        &::before {
          content: '';
          position: absolute;
          left: -28rpx;
          top: 4rpx;
          width: 8rpx;
          height: 32rpx;
          background-image: linear-gradient(169deg, #75bcff 6%, #2c66f7 100%);
        }
      }
      .input-label {
        font-size: 32rpx;
        color: #808291;
        text-align: right;
        margin-right: 24rpx;
        &.width-320 {
          min-width: 320rpx;
        }
      }
    }

    .input,
    .select {
      width: 320rpx;
      height: 80rpx;
      background: #ffffff;
      border: 2rpx solid #e8e8e8;
      border-radius: 12rpx;
      outline: none;
      padding: 0 20rpx;
      font-size: toRpx(30);
      color: #333;
      &:active {
        border: 4rpx solid #2f6af7;
      }
      &:focus {
        border: 4rpx solid #2f6af7;
      }

      &::placeholder {
        color: #c9c9c9;
      }
    }

    .placeholderStyle {
      color: #999999;
    }

    .arrow {
      color: #999 !important;
      margin-left: auto;
      flex-shrink: 0;
    }
  }

  .month-box {
    width: 540rpx;
    min-height: 260rpx;
    background: #ffffff;
    margin-bottom: 40rpx;
    border-radius: 24rpx;
    &:last-child {
      margin-bottom: 0;
    }
    .month-mark {
      font-size: 24rpx;
      color: #808291;
      padding-left: 30rpx;
      padding-top: 28rpx;
      text {
        margin-left: 12rpx;
      }
    }
    .value-box {
      display: flex;
      margin: 0 30rpx;

      .value-desc {
        &:first-child {
          width: 65%;
        }
        text-align: center;
        padding: 20rpx 0 0;
        .value-title {
          font-size: 24rpx;
          color: #adb0b8;
          line-height: 36rpx;
        }

        .value-price {
          font-size: 36rpx;
          color: #181a1f;
          margin-left: 8rpx;

          text {
            font-size: 22rpx;
          }
        }
      }
    }

    .value-detail {
      background: #ffffff;
      border-radius: 16rpx;
      margin: 10rpx auto;
      display: grid;
      grid-template-columns: 30% 40% 30%;
      padding: 16rpx 32rpx;
      &.value-two {
        grid-template-columns: 50% 50%;
        background: #f5f7fa;
        border-radius: 12rpx;
        padding: 8rpx 32rpx;
        margin: 18rpx 20rpx 10rpx;
        .detail-item {
          text-align: center;
        }
      }
      .detail-item {
        .detail-label {
          font-size: 24rpx;
          color: #999ea8;
          line-height: 36rpx;
        }

        .detail-num {
          font-size: 32rpx;
          color: #292d33;
          line-height: 48rpx;
        }
      }
    }
    .ratio-panel {
      padding: 0rpx 32rpx 16rpx;
      .ratio-item {
        height: 44rpx;
        .ratio-label {
          font-size: 24rpx;
          color: #adb0b8;
        }
        .ratio-num {
          font-size: 28rpx;
          color: #292d33;
        }
      }
    }
  }

  .month-mid {
    width: 48rpx;
    border-radius: 50%;
    margin: 28rpx;
    height: 48rpx;
    text-align: center;
    line-height: 48rpx;
    background-image: linear-gradient(140deg, #3874f8 0%, #6fb5fe 100%), linear-gradient(126deg, #7b86f5 0%, #9886f0 82%);
  }

  .month-result {
    width: 626rpx;
    background: #ffffff;
    border: 12rpx solid #dbe8ff;
    box-shadow: 0 0 24rpx 0 #4b85d180;
    border-radius: 48rpx;
    border-radius: 48rpx;
    padding: 40rpx 48rpx;

    .result-title {
      font-size: 24rpx;
      color: #808291;
      line-height: 32rpx;
      margin-bottom: 30rpx;
    }
    .result-main {
      max-height: 400rpx;
      overflow-y: auto;
    }
    .result-item {
      font-size: 26rpx;
      color: #181a1f;
      display: flex;
      padding: 10rpx;
      margin-bottom: 32rpx;
      justify-content: space-between;

      &.checked {
        background: #f2f4f7;
        border-radius: 12rpx;
        color: #808291;
        height: 64rpx;
        line-height: 64rpx;
        padding: 0 10rpx;
        box-sizing: border-box;
      }
    }

    .result-footer {
      margin-top: 38rpx;
      font-size: 26rpx;
      color: #181a1f;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      padding: 0 10rpx;
      .result-price {
        color: #2c66f7;
        font-size: 40rpx;
        text {
          font-size: 28rpx;
        }
      }
    }
  }
}
.dailog-footer {
  display: flex;
  justify-content: center;
  &.mt-20 {
    margin-top: 40rpx;
  }
  .dailog-btn {
    width: 400rpx;
    height: 96rpx;
    background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
    box-shadow: inset 0 0 32rpx 0 #ffffff80;
    border-radius: 16rpx;
    text-align: center;
    font-size: 36rpx;
    color: #ffffff;
    line-height: 96rpx;
    &.grey {
      background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      box-shadow: inset 0 0 32rpx 0 rgba(255, 255, 255, 0.5);
      opacity: 0.5;
    }
    &.disabled {
      background: #ffffff;
      background-image: none;
      color: #181a1f;
      margin-left: 48rpx;
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
.result-dailog {
  /deep/.dailog-box {
    background-image: linear-gradient(243deg, #c3e4fa 0%, #edfaff 15%, #d8f3fb 21%, #e5f2fe 40%, #eff7fe 73%, #e3e7ff 100%);
    box-shadow: inset 0 4rpx 8rpx 0 #ffffff80;
    background-size: 100% 100%;
  }
}
</style>
