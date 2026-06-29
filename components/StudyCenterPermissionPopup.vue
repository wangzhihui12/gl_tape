<template>
  <view class="study-permission-popup-wrapper">
    <!-- 标题 -->
    <view class="popup-title">未完成学习任务，暂不能开单</view>
    
    <!-- 第一段描述 -->
    <view class="description-text">
      优秀的技能是您接单的通行证，磨刀不误砍柴工，您的专业能力是赢得客户信任的关键。
    </view>

    <!-- 第二段描述（橙色） -->
    <view class="highlight-text">
      <template v-if="lockReason == '0'">
        到学习中心-我的课程-待学习，完成课程学习后，即可解锁开单权限。
      </template>
      <template v-if="lockReason == '1'">
        到学习中心-我的任务，完成长课程学习任务后，即可解锁开单权限。
      </template>
      <template v-if="lockReason == '2'">
        到服务中心-短课程，完成短课程学习任务后，即可解锁开单权限。
      </template>
    </view>

    <!-- 第三段描述 -->
    <view class="tip-text">
      只差一步即可开启您的接单之旅！
    </view>

    <!-- 按钮 -->
    <view class="goto-button" @click="handleGoToStudy">
      {{ lockReason == '2' ? '去往服务中心' : '去往学习中心' }}
    </view>
  </view>
</template>

<script>
export default {
  props: {
    lockReason: {
      type: String,
      default: '0'
    }
  },
  name: 'StudyCenterPermissionPopup',
  methods: {
    handleGoToStudy() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.study-permission-popup-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: toRpx(48);
}

.popup-title {
  height: toRpx(48);
  color: #333333;
  font-size: toRpx(40);
  font-weight: 500;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  margin-bottom: toRpx(40);
}

.description-text {
  width: toRpx(720);
  min-height: toRpx(96);
  color: #6c6f75;
  font-size: toRpx(32);
  font-weight: 400;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  line-height: toRpx(48);
  margin-bottom: toRpx(40);
}

.highlight-text {
  background-color: #FEF5EA;
  padding: toRpx(8) toRpx(32);
  border-radius: toRpx(8);
  width: toRpx(720);
  min-height: toRpx(104);
  color: #ff9d0a;
  font-size: toRpx(32);
  font-weight: 400;
  text-align: center;
  line-height: toRpx(52);
  margin-bottom: toRpx(64);
}

.tip-text {
  width: toRpx(420);
  height: toRpx(34);
  color: #6c6f75;
  font-size: toRpx(28);
  font-weight: 400;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  margin-bottom: toRpx(16);
}

.goto-button {
  width: toRpx(704);
  height: toRpx(80);
  border-radius: toRpx(48);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  color: #ffffff;
  font-size: toRpx(28);
  font-weight: 500;
  font-family: "HarmonyOSSansSC";
  text-align: center;
  line-height: toRpx(80);
  // margin-bottom: toRpx(48);
  margin-top: auto;
  
  &:active {
    opacity: 0.8;
  }
}
</style>

