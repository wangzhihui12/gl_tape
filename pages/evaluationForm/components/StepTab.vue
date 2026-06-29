<template>
  <view class="step-tab flex items-center justify-center">
    <view v-for="(step, index) in steps" :key="step.key || index" class="flex">
      <view v-if="index > 0" :class="['step-line', { active: index == currentStep }]"></view>
      <view class="step-item" @click.stop="handleStepClick(index)">
        <view :class="['step-label', { active: index == currentStep }]">
          {{ step.label || '步骤' + (index + 1) }}
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'StepTab',
  props: {
    steps: {
      type: Array,
      default: () => [{ label: '步骤1' }, { label: '步骤2' }, { label: '步骤3' }]
    },

    currentStep: {
      type: Number,
      default: 0
    },
    clickable: {
      type: Boolean,
      default: true
    },
    isShowStepNumber: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleStepClick(index) {
      if (this.clickable) {
        this.$emit('step-change', index)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.step-tab {
  width: 100%;
  padding: toRpx(20) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  position: relative;
}

.step-item {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: toRpx(64);
  padding: 0 toRpx(32);
  border-radius: toRpx(12);
  background: #f2f2f2;
  z-index: 1;
  transition: all 0.3s ease;

  .step-label.active + & {
    background: #dee7ff;
  }

  .step-label {
    font-size: toRpx(28);
    color: #666;
    text-align: center;
    transition: all 0.3s ease;

    &.active {
      color: #347bff;
      font-size: toRpx(28);
      font-weight: 400;
    }
  }

  &:before {
    content: '';
    position: absolute;

    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
  }
}

.step-line {
  height: toRpx(4);
  width: toRpx(40);
  background-color: #e6e6e6;
  margin: 0 toRpx(40);
  z-index: 1;
  transition: all 0.3s ease;
  align-self: center;
}
</style>
