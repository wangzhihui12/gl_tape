<template>
  <view class="stepper-navigation" :class="direction">
    <view class="stepper-container">
      <view v-for="(step, index) in steps" :key="index" class="step-item">
        <!-- 左侧点线区域 -->
        <view class="step-left-area">
          <view class="step-number-circle" :class="{ active: currentStep >= index + 1 }">
            <!-- 激活状态下显示三个圆圈 -->
            <view v-if="currentStep >= index + 1" class="circle-group">
              <view class="circle circle-1"></view>
              <view class="circle circle-2"></view>
              <view class="circle circle-3"></view>
            </view>
          </view>
          <!-- 连接线 - 动态适应距离 -->
          <view v-if="index < steps.length - 1" class="dash-line-wrapper">
            <view class="dash-line" :class="{ active: currentStep >= index + 2 }"></view>
          </view>
        </view>
        <!-- 右侧名称和内容区域 -->
        <view class="step-right-area">
          <view class="step-name flex align-center justify-between" :class="{ active: currentStep >= index + 1 }">
            <view>{{ step.roundNo ? `第${step.roundNo}轮报价` : index == steps.length - 1 ? '首次提交' : '编辑记录' }}</view>
            <view class="step-time">{{ step.quoteTime || step.operateTime }}</view>
          </view>
          <!-- 可自定义添加其他内容 -->
          <slot :step="step" :indexContent="index"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StepperNavigation',
  props: {
    // 当前步骤，从1开始
    currentStep: {
      type: Number,
      default: 1
    },
    // 步骤数据数组，每项可以包含name属性
    steps: {
      type: Array,
      default: () => [{ name: '步骤1' }, { name: '步骤2' }, { name: '步骤3' }]
    },
    // 显示方向：'horizontal'(水平) 或 'vertical'(垂直)
    direction: {
      type: String,
      default: 'horizontal',
      validator: value => {
        return ['horizontal', 'vertical'].includes(value)
      }
    }
  }
}
</script>

<style scoped lang="scss">
// 基础样式
.stepper-navigation {
  /* 基础样式 */
}

/* 步骤容器 */
.stepper-container {
  padding: toRpx(32) 0;
}

/* 步骤项 */
.step-item {
  display: flex;
  margin-bottom: toRpx(16);
}

/* 左侧点线区域 */
.step-left-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: toRpx(16);
  position: relative;
}

/* 步骤数字圆圈 */
.step-number-circle {
  width: toRpx(40);
  height: toRpx(40);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

/* 不激活状态 - 一个圆圈 */
.step-number-circle::before {
  content: '';
  width: toRpx(20);
  height: toRpx(20);
  border-radius: 50%;
  background: #8eb2fb;
  position: absolute;
  z-index: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 激活状态 - 三个圆圈组 */
.step-number-circle.active {
  background: transparent;
}

.step-number-circle.active::before {
  display: none;
}

/* 三个圆圈的样式 */
.circle-group {
  position: relative;
  width: toRpx(40);
  height: toRpx(40);
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  position: absolute;
  border-radius: 50%;
}

/* 三个圆圈的定位和大小 */
.circle-1 {
  width: toRpx(14);
  height: toRpx(14);
  z-index: 3;
  background: #ffffff;
  border: 2rpx solid #4673ff;
}

.circle-2 {
  width: toRpx(20);
  height: toRpx(20);
  z-index: 2;
  background: #4673ff;
}

.circle-3 {
  width: toRpx(36);
  height: toRpx(36);
  z-index: 1;
  background: #d6e4ff;
}

/* 右侧名称和内容区域 */
.step-right-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.step-name {
  color: #333333;
  font-size: toRpx(32);
  font-weight: 500;

  word-wrap: break-word;
  white-space: normal;
  margin-bottom: toRpx(20);
}
.step-time {
  color: #999999;
  font-size: toRpx(28);
  font-weight: 400;
}

/* 连接线容器 */
.dash-line-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  min-height: toRpx(48);
}

/* 连接线样式 */
.dash-line {
  width: toRpx(4);
  background: #d7e7fe;
  flex: 1;
  height: 100%;
}

.dash-line.active {
  background: #4673ff;
}

/* 水平方向特定样式 */
.horizontal .stepper-container {
  display: flex;
  flex-wrap: wrap;
}

.horizontal .step-item {
  flex-direction: column;
  align-items: center;
  margin-right: toRpx(32);
  margin-bottom: toRpx(0);
}

.horizontal .step-left-area {
  flex-direction: row;
  margin-right: 0;
  margin-bottom: toRpx(16);
}

.horizontal .step-right-area {
  align-items: center;
}

.horizontal .dash-line-wrapper {
  min-width: toRpx(64);
  min-height: 0;
  margin: 0 toRpx(16);
}

.horizontal .dash-line {
  height: toRpx(4);
  width: 100%;
}
</style>
