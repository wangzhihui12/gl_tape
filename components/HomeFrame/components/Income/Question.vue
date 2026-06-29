<!--
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2025-01-14 11:25:37
 * @LastEditors: 前端 qianduan01@didihu.com.cn
 * @LastEditTime: 2025-01-16 11:39:18
 * @FilePath: \gl-tape\components\HomeFrame\components\Income\Question.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <Tips @close="close" v-if="show" width="1288rpx" :title="detail.label">
    <template v-if="detail.customize">
      <template v-if="detail.label == '基本工资'">
        <view class="basic-body" slot="content">
          <view class="basic-content">
            <view class="basic-item">{{ detail.content }}</view>
            <view class="basic-item" v-for="(item, index) in detail.basicList" :key="index">
              <view>{{ item.label }}</view>
              <view class="basic-right">
                <view class="tips">{{ item.tips }}</view>
                <view class="value">
                  <template v-if="!detail.confirmSalary">
                    {{ detail[item.prop] }}{{ item.unit }}
                  </template>
                  <template v-else>
                    {{ item.actualProp ? detail[item.actualProp] : detail[item.prop] }}{{ item.unit }}
                  </template>
                </view>
              </view>
            </view>
          </view>
          <view class="basic-item performance">
            <view>{{ detail.performance.label }}</view>
            <view class="basic-right">
              <view class="tips">{{ detail.confirmSalary ? '' : '未核算' }}</view>
              <view class="value">{{ detail.confirmSalary ? detail.actualPerformanceSalary : detail.performanceSalary }}</view>
            </view>
          </view>
          <ul class="basic-ul">
            <li v-for="(i, ind) in detail.performanceSalaryConfigItemList" :key="ind">
              <template v-if="i.assessmentType == 1">
                月产值=0，且 {{ i.minAssessmentValue }} ≦ 考勤 < {{ i.maxAssessmentValue ? i.maxAssessmentValue : '' }} 绩效工资{{ i.performanceSalarDeductionRatio < 100 ? `扣减${i.performanceSalarDeductionRatio}%` : '不扣减' }}
              </template>
              <template v-if="i.assessmentType == 2">
                月产值≠0，{{ i.minAssessmentValue }} ≦ 月度触客总数（含售前+售后触客）< {{ i.maxAssessmentValue ? i.maxAssessmentValue : '' }} 台，则绩效工资{{ i.performanceSalarDeductionRatio < 100 ? `扣减${i.performanceSalarDeductionRatio}%` : '不扣减' }}
              </template>
            </li>
          </ul>
        </view>
      </template>
    </template>
    <template v-else>
      <view class="dailog-body" slot="content">
        <view class="dailog-content">{{ detail.content }}</view>
        <view class="dailog-content" v-if="detail.subContent">{{ detail.subContent }}</view>
        <view class="dailog-warn" v-if="detail.warnList">
          <view class="warn-label">注：</view>
          <view>
            <view v-for="(item, index) in detail.warnList" :key="index" :style="item.style">{{ item.message }}</view>
          </view>
        </view>
        <view class="dailog-desc" v-if="detail.desc">{{ detail.desc }}</view>
      </view>
    </template>
  </Tips>
</template>

<script>
import Tips from './Tips'
export default {
  props: {
    detail: {
      type: Object,
      default: () => {}
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Tips
  },
  data() {
    return {}
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.dailog-body {
  padding: 0 152rpx;
  .dailog-content {
    font-size: 32rpx;
    color: #1a1a1a;
    line-height: 52rpx;
    margin-bottom: 32rpx;
  }
  .dailog-warn {
    display: flex;
    .warn-label {
      font-size: 28rpx;
      color: #808291;
      line-height: 44rpx;
    }
  }
  .base-line {
    font-size: 32rpx;
    color: #1a1a1a;
    line-height: 50rpx;
    .base-times {
      margin-left: auto;
      color: #808291;
      margin-right: 32rpx;
    }
  }
  .dailog-desc {
    font-size: 32rpx;
    color: #808291;
    line-height: 52rpx;
    margin-top: 32rpx;
  }
}
.basic-body {
  padding: 0 toRpx(180);
  .basic-content {
    border-radius: toRpx(24);
    background: #fafafa;
    padding: toRpx(20) toRpx(36);
    font-size: toRpx(26);
  }
  .basic-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: toRpx(18);
    &.performance {
      padding: toRpx(20) toRpx(36);
      margin-bottom: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
    .basic-right {
      display: flex;
      align-items: center;
      .tips {
        color: #808291;
        margin-right: toRpx(20);
      }
      .value {
        color: #1A1A1A;
      }
    }
  }
  .basic-ul {
    color: #ADB0B8;
    font-size: toRpx(24);
    padding-right: toRpx(36);
    padding-left: toRpx(64);
    max-height: toRpx(224);
    overflow-y: auto;
    li {
      margin-bottom: toRpx(12);
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
