<template>
  <uni-popup ref="popup" type="center" border-radius="16px" :mask-click="false">
    <view class="popup-content" :class="[`popup-${type}`]">
      <view class="popup-icon">
        <image
          :src="require(`@/assets/images/common/${type}-notice.webp`)"
          mode="aspectFit"
          class="icon-image"
        />
      </view>
      <view class="popup-title">{{ title }}</view>
      <view class="popup-text">{{ text }}</view>
      <view class="popup-buttons">
        <view 
          v-for="(button, index) in buttonsList" 
          :key="index" 
          class="popup-button"
          :class="[
            `button-${button.type || 'default'}`,
            { 'single-button': buttonsList.length === 1 }
          ]"
          @click="handleButtonClick(button)"
        >
          {{ button.text }}
        </view>
      </view>
    </view>
  </uni-popup>
</template>
<script>
import utils from '@/utils/utils'

export default {
  props: {
    // 弹窗类型：success, error, warning, info
    type: {
      type: String,
      default: 'info'
    },
    // 弹窗标题
    title: {
      type: String,
      default: 'warning'
    },
    // 弹窗内容
    text: {
      type: String,
      default: ''
    },
    // 按钮配置
    buttons: {
      type: Array,
      default: () => [{
        text: '确认',
        type: 'primary',
        callback: null
      }]
    }
  },
  data() {
    return {
      popupShow: false,
      buttonsList: []
    }
  },
  methods: {
    open() {
      this.$refs.popup.open("center");
    },
    close() {
      this.$refs.popup.close()
    },
    // 处理按钮点击事件
    handleButtonClick(button) {
      if (typeof button.callback === 'function') {
        button.callback()
      } else {
        this.close()
      }
      // 触发点击事件，传递按钮信息
      this.$emit('buttonClick', button)
    }
  },
  
  // 监听props变化，更新本地数据
  watch: {
    buttons: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal) {
          this.buttonsList = utils.deepClone(newVal)
        }
      }
    }
  },
  
  created() {
    // 初始化时将buttons赋值给buttonsList
    this.buttonsList = utils.deepClone(this.buttons)
  }
}
</script>

<style scoped lang="scss">
.popup-content {
  background-color: #fff;
  border-radius: toRpx(38);
  width: toRpx(848);
  min-height: toRpx(660);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

.popup-icon {
  width: 100%;
  margin-bottom: toRpx(48);
  
  .icon-image {
    width: 100%;
    height: toRpx(248);
    // border-radius: toRpx(38) toRpx(38) 0 0;
  }
}

.popup-title {
  font-size: toRpx(48);
  font-weight: 500;
  color: #333;
  margin-bottom: toRpx(24);
  text-align: center;
}

.popup-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin:0 64rpx 32rpx;
  line-height: 1.5;
}

.popup-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: toRpx(32);
  margin-top: auto;
  height: toRpx(160);
}

.popup-button {
  flex: 1;
  height: toRpx(80);
  line-height: toRpx(80);
  text-align: center;
  border-radius: toRpx(40);
  font-size: toRpx(28);
  max-width: toRpx(344);
  
  &.single-button {
    max-width: toRpx(688);
  }
}

.button-primary {
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  color: #fff;
}

.button-default {
  background-color: #f5f5f5;
  color: #333;
}

.button-danger {
  background-color: #f45001;
  color: #fff;
}

</style>