<template>
  <view class="study-popup-content-wrapper">
    <!-- 内容卡片 -->
    <view class="content-card">
      <!-- 卡片标题 -->
      <view v-if="cardTitle" class="card-title">{{ cardTitle }}</view>
      
      <!-- 主要描述文本 -->
      <view v-if="description" class="description-text">{{ description }}</view>
      
      <!-- 列表项 -->
      <view v-if="listItems && listItems.length" class="list-wrapper">
        <view 
          v-for="(item, index) in listItems" 
          :key="index" 
          class="list-item"
        >
          <view class="dot"></view>
          <view class="list-text">{{ item }}</view>
        </view>
      </view>
      
      <!-- 自定义内容插槽 -->
      <slot></slot>
    </view>
    
    <!-- 提示文本 -->
    <view v-if="tipText" class="tip-text">
      请先完成 <text class="highlight"> 【 {{ courseName }} 】</text>考试测评后会推送适合您的课程
    </view>
    
    <!-- 按钮 -->
     <view class="button-group">
      <view class="cancel-button" @click="handleCancel">
        暂不测评
      </view>
      <view v-if="buttonText" class="action-button" @click="handleButtonClick">
        {{ buttonText }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StudyPopupContent',
  props: {
    cardTitle: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    listItems: {
      type: Array,
      default: () => []
    },
    tipText: {
      type: String,
      default: ''
    },
    courseName: {
      type: String,
      default: 'XXX'
    },
    buttonText: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleButtonClick() {
      this.$emit('button-click')
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.study-popup-content-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-card {
  width: toRpx(720);
  opacity: 1;
  border-radius: toRpx(20);
  background: rgba(247, 248, 250, 1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: toRpx(32) toRpx(40);
  box-sizing: border-box;
}

.card-title {
  font-size: toRpx(32);
  font-weight: 500;
  letter-spacing: 0;
  line-height: toRpx(40);
  color: rgba(41, 45, 51, 1);
  text-align: left;
  margin-bottom: toRpx(16);
}

.description-text {
  width: toRpx(640);
  font-size: toRpx(28);
  font-weight: 400;
  letter-spacing: 0;
  line-height: toRpx(48);
  color: rgba(108, 111, 117, 1);
}

.list-wrapper {
  width: 100%;
  margin-top: toRpx(16);
}

.list-item {
  display: flex;
  align-items: flex-start;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.dot {
  width: toRpx(8);
  height: toRpx(8);
  border-radius: 50%;
  background: rgba(108, 111, 117, 1);
  margin-top: toRpx(18);
  margin-right: toRpx(12);
  flex-shrink: 0;
}

.list-text {
  flex: 1;
  font-size: toRpx(32);
  font-weight: 400;
  letter-spacing: 0;
  line-height: toRpx(52);
  color: rgba(108, 111, 117, 1);
}

.tip-text {
  width: toRpx(720);
  font-size: toRpx(28);
  font-weight: 500;
  letter-spacing: 0;
  line-height: toRpx(32.82);
  color: rgba(108, 111, 117, 1);
  margin-top: toRpx(56);
  text-align: center;
  
  .highlight {
    color: rgba(59, 115, 255, 1);
  }
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
.action-button {
  width: toRpx(360);
  height: toRpx(80);
  border-radius: toRpx(48);
  background: linear-gradient(180deg, rgba(44, 102, 247, 1) 0%, rgba(72, 166, 255, 1) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: toRpx(16);
  font-size: toRpx(28);
  font-weight: 500;
  letter-spacing: 0;
  line-height: toRpx(40);
  color: rgba(255, 255, 255, 1);
  text-align: center;
  cursor: pointer;
  
  &:active {
    opacity: 0.8;
  }
}
</style>

