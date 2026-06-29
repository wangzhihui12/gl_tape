<template>
  <view class="exam-submit-popup-wrapper">
    <!-- 标题 -->
    <view :class="['exam-title', { 'title-loading': isLoading }]">是否已提交考试</view>
        <!-- 加载状态 -->
        <template v-if="isLoading">
          <view class="loading-text">正在查询考试结果，请稍后...</view>
          <image 
            class="loading-gif" 
            :src="require('@/assets/images/common/loadding.gif')"
          />
        </template>
        <template v-if="showError">
          <view class="error-text">未查询到考试结果，请重新确认</view>
        </template>
    <!-- 按钮组（始终显示） -->
    <view class="button-group">
      <view class="cancel-button" @click="handleCancel">
        未提交
      </view>
      <view class="confirm-button" v-if="!isLoading" @click="handleConfirm">
        {{ confirmText }}
      </view>
      <view class="confirm-button confirm-button-loading" v-else> {{ confirmText }}</view>
    </view>
    

  </view>
</template>

<script>
export default {
  name: 'ExamSubmitPopup',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    showError: {
      type: Boolean,
      default: false
    },
    confirmText: {
      type: String,
      default: '确认'
    }
  },
  watch: {
    isLoading(newVal) {
      console.log('ExamSubmitPopup isLoading changed:', newVal)
    }
  },
  methods: {
    handleCancel() {
      this.$emit('cancel')
    },
    handleConfirm() {
      console.log('handleConfirm clicked')
      this.$emit('confirm')
    },
  }
}
</script>

<style lang="scss" scoped>
.exam-submit-popup-wrapper {
  position: relative;
  width: 100%;
  min-height: toRpx(400);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: toRpx(48);
}

.exam-title {
  width: toRpx(280);
  height: toRpx(48);
  color: #333333;
  font-size: toRpx(40);
  font-weight: 500;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  margin-top: toRpx(48);
}

.exam-title.title-loading {
  margin-bottom: toRpx(40);
  margin-top: toRpx(0);
}

.loading-text {
  height: toRpx(48);
  color: #6c6f75;
  font-size: toRpx(32);
  font-weight: 400;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  line-height: toRpx(48);
  margin-bottom: toRpx(40);
}

.loading-gif {
  width: toRpx(64);
  height: toRpx(64);
  margin-bottom: toRpx(76);
}
.error-text {
  color: #6c6f75;
  font-size: toRpx(32);
  font-weight: 400;
  line-height: toRpx(48);
  margin-top: toRpx(48);
}
.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: toRpx(16);
  margin-top: auto;
}

.cancel-button {
  width: toRpx(344);
  height: toRpx(80);
  border-radius: toRpx(64);
  background: #f0f1f5;
  color: #1a1a1a;
  font-size: toRpx(28);
  font-weight: 400;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  line-height: toRpx(80);
}

.confirm-button {
  width: toRpx(360);
  height: toRpx(80);
  border-radius: toRpx(48);
  border: toRpx(2) solid #979797;
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  color: #ffffff;
  font-size: toRpx(28);
  font-weight: 500;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  line-height: toRpx(80);
  
  &-loading {
    opacity: 0.5;
  }
  
  &:active {
    opacity: 0.8;
  }
}
</style>

