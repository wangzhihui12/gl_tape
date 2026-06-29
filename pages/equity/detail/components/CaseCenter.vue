<template>
  <view
    class="case-box"
    v-if="show"
  >
    <view class="case-body">
      <view
        class="case-poster"
        :style="{ width: posterW + 'rpx' }"
      >
        <view class="poster-wrap">
          <image
            :src="detail.productPoster"
            :style="{ width: posterW + 'rpx', height: posterStyle[posterW] }"
            class="poster-image"
          />
          <view class="pull-box">
            <view
              class="full-box"
              @click="handlePull"
            >
              <image
                class="icon"
                v-if="posterW == 751"
                src="../../../../assets/images/boutique/push_icon.png"
              />
              <image
                v-else
                class="icon"
                src="../../../../assets/images/boutique/pull_icon.png"
              />
            </view>
          </view>
        </view>
      </view>
      <view class="case-detail">
        <view class="case-tabs">
          <view
            :class="{ 'tab-prev': true, disabled: currentIndex == 0 }"
            @click="prevTab(currentIndex == 0)"
          >
            <view class="tab-icon">
              <uni-icons
                type="left"
                size="20"
              ></uni-icons>
            </view>
          </view>
          <view class="tab-body">
            <view class="case-name">{{ getValue('customerName') }}</view>
            <view class="case-carNum">{{ getValue('licPlateNumber') }}</view>
          </view>
          <view
            :class="{ 'tab-next': true, disabled: currentIndex == detail.receptionpriproCusCaseList.length - 1 }"
            @click="nextTab(currentIndex == detail.receptionpriproCusCaseList.length - 1)"
          >
            <view class="tab-icon">
              <uni-icons
                type="right"
                size="20"
              ></uni-icons>
            </view>
          </view>
        </view>
        <view class="equity-box">
          <text>权益项目</text>
          <text
            class="equity-title"
            :style="{ 'margin-right': posterW == 751 ? '30%' : '15%' }"
          >{{ detail.title }}</text>
          <text>赔付金额</text>
          <text class="equity-price">¥ {{ format(getValue('comAmount')) }}</text>
        </view>
        <view class="case-step">
          <view class="step-title">案例回溯</view>
          <view class="step-box">
            <view
              @click="changeStep(index)"
              :class="{ 'step-item': true, checked: currentStep == index }"
              class="step-item"
              v-for="(step, index) in getValue('receptionpriproCusCaseStageList')"
              :key="index"
            >
              {{ step.stageName }}
            </view>
          </view>
        </view>
        <view class="case-swiper">
          <view class="swiper-box">
            <view class="case-num">
              <text>{{ currentStage + 1 }}/{{ stageList.length }}</text>
              <text class="line">|</text>
              <text v-if="stageList.length">{{ stageList[currentStage].imageTag }}</text>
            </view>
            <view
              class="full-box"
              @click="handleFull(stageList[currentStage].imageTag, stageList[currentStage].imageUrl)"
            >
              <image
                class="icon"
                src="../../../../assets/images/boutique/full_icon.png"
              />
            </view>
            <view
              class="swiper-button swiper-button-prev"
              @click="prevSwiper"
              v-if="currentStage > 0"
            >
              <uni-icons
                type="left"
                size="14"
                color="#fff"
              ></uni-icons>
            </view>
            <swiper
              class="swiper-warp"
              :current="currentStage"
              @change="onSwiperChange"
              :disable-touch="true"
            >
              <swiper-item
                v-for="(step, index) in stageList"
                :key="index"
              >
                <view class="swiper-item">
                  <image
                    :src="step.imageUrl"
                    class="swiper-image"
                    mode="heightFix"
                  />
                  <!-- <view class="swiper-content">{{ step.imageUrl }}</view> -->
                </view>
              </swiper-item>
            </swiper>
            <view
              class="swiper-button swiper-button-next"
              @click="nextSwiper"
              v-if="currentStage < stageList.length - 1"
            >
              <uni-icons
                type="right"
                size="14"
                color="#fff"
              ></uni-icons>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view
      class="popup-box"
      v-if="popupShow"
    >
      <view class="nav-bar">
        <view
          class="back"
          @click="close"
        >
          <uni-icons
            type="left"
            :size="24"
            color="#fff"
          ></uni-icons>
        </view>
        <view class="title">{{ imageTag }}</view>
      </view>
      <view class="popup-body">
        <view class="img-detail">
          <view
            class="swiper-button swiper-button-prev"
            @click="prevSwiper"
            v-if="currentStage > 0"
          >
            <uni-icons
              type="left"
              size="14"
              color="#fff"
            ></uni-icons>
          </view>
          <swiper
            class="swiper-warp"
            :current="currentStage"
            @change="onSwiperChange"
            :disable-touch="true"
          >
            <swiper-item
              v-for="(step, index) in stageList"
              :key="index"
            >
              <view class="swiper-item">
                <movable-area style="width: 100%; height: 100%">
                  <movable-view
                    direction="all"
                    :x="-9999"
                    :key="index"
                    :out-of-bounds="true"
                    :scale="true"
                  >
                    <image
                      :src="step.imageUrl"
                      class="swiper-image"
                      mode="heightFix"
                    />
                    <!-- <view class="swiper-content">{{ step.imageUrl }}</view> -->
                  </movable-view>
                </movable-area>
              </view>
            </swiper-item>
          </swiper>
          <view
            class="swiper-button swiper-button-next"
            @click="nextSwiper"
            v-if="currentStage < stageList.length - 1"
          >
            <uni-icons
              type="right"
              size="14"
              color="#fff"
            ></uni-icons>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script type="text/ecmascript-6">
export default {
  name: 'CaseCenter',
  props: {
    title: String,
    detail: Object,
    show: Boolean,
  },
  data () {
    return {
      x: 0,
      y: 0,
      clientX: 0,
      clientY: 0,
      moveX: 0,
      moveY: 0,
      touchType: 0, // 0为单指触摸  1为双指
      // 初始双指距离
      distance: 0,
      // 初始缩放比例
      scale: 1,
      posterW: 751,
      posterStyle: {},
      posterH: 0,
      detailUrl: '',
      imageTag: '888',
      popupShow: false,
      fullWidth: '',
      currentIndex: 0,
      currentStep: 0,
      currentStage: 0,
      stageList: [],
      noLick: false,
      thumbnails: [
        { src: 'path/to/image1.jpg', title: '详图1' },
        { src: 'path/to/image2.jpg', title: '详图2' },
        { src: 'path/to/image3.jpg', title: '详图3' },
        { src: 'path/to/image4.jpg', title: '详图4' }
      ],
      currentThumbnail: 0
    }
  },
  mounted () {
  },
  watch: {
    show (n) {
      if (n) {
        this.popupShow = false
        this.posterW = 751
      }
    },
    'detail.productPoster': {
      handler (val) {
        setTimeout(() => {
          const _this = this
          uni.getImageInfo({
            src: val, // 替换为你的图片路径
            success (img) {
              _this.posterStyle = { 751: 'calc(100% - 8rpx)', 1328: 1328 * img.height / img.width + 'rpx' }
            },
            fail: function (error) {
              console.error('获取图片信息失败：', error);
            }
          }, 1500)
        });
      },
      immediate: true
    },
    currentStep: {
      async handler () {
        this.updateStage()
      },
      immediate: true
    },
    popupShow (val) {
      console.log(val)
      this.$emit('full', val)
    },
  },
  methods: {
    format (number) {
      const arr = String(number).split('.')
      const reg = /\d{1,3}(?=(\d{3})+$)/g;
      const result = arr[0].replace(reg, "$&,")
      return arr.length > 1 ? result + '.' + arr[1] : result;
    },
    close () {
      console.log(888)
      this.popupShow = false
    },
    // 获取两点距离
    getDistance (point1, point2) {
      const x = point1.clientX - point2.clientX
      const y = point1.clientY - point2.clientY
      return Math.sqrt(x * x + y * y)
    },
    // 触摸开始
    touchstart (e) {
      // 当触摸事件为一个时
      if (e.touches.length === 1) {
        // 记录开始触摸位置
        this.clientX = e.changedTouches[0].clientX
        this.clientY = e.changedTouches[0].clientY
        this.touchType = 0
      } else if (e.touches.length === 2) {
        // 双指进行放大缩小操作
        this.touchType = 1
        // 获取双指距离
        this.distance = this.getDistance(e.touches[0], e.touches[1])
      }
    },
    // 触摸移动中
    touchmove (e) {
      // 当触摸事件为一个时
      if (this.touchType === 0) {
        // 记录移动的距离
        const moveX = e.changedTouches[0].clientX - this.clientX
        const moveY = e.changedTouches[0].clientY - this.clientY
        // 最终偏移距离为初始偏移距离+当前偏移距离
        this.x = this.moveX + moveX
        this.y = this.moveY + moveY
      } else if (this.touchType === 1) {
        // 双指进行放大缩小操作
        if (e.touches.length === 2) {
          // 获取移动后的双指距离
          const le = this.getDistance(e.touches[0], e.touches[1])
          // 最终放大 缩小效果为 初始放大缩小比例 * 当前放大缩小比例
          const bl = le / this.distance
          const scale = this.scale * bl
          this.scale = scale > 0.1 ? scale : 0.1
          // 随着移动将开始的位置重置 不然会一次性放很大 或者缩很小，不好控制
          this.distance = le
        }
      }
    },
    // 触摸结束
    touchend (e) {
      // 当触摸事件为一个时
      if (this.touchType === 0) {
        // 记录最终移动距离
        const moveX = e.changedTouches[0].clientX - this.clientX
        const moveY = e.changedTouches[0].clientY - this.clientY
        // 最终偏移距离为初始偏移距离+当前偏移距离
        this.x = this.moveX + moveX
        this.y = this.moveY + moveY
        // 当前偏移距离设置为当前位置
        this.moveX = this.x
        this.moveY = this.y
      } else if (this.touchType === 1) {
        // 当双指松开后
        console.log(e)
      }
    },
    // 因电话等打断时触发
    touchcancel (e) {
      if (this.touchType === 0) {
        this.x = 0
        this.y = 0
      } else {
        this.clientX = 0
        this.clientY = 0
        this.moveX = 0
        this.moveY = 0
        this.touchType = 0 // 0为单指触摸  1为双指
        // 初始双指距离
        this.distance = 0
        // 初始缩放比例
        this.scale = 1
      }
    },
    updateStage () {
      let { receptionpriproCusCaseList } = this.detail
      this.noLick = true
      if (receptionpriproCusCaseList.length) this.stageList = receptionpriproCusCaseList[this.currentIndex].receptionpriproCusCaseStageList[this.currentStep].receptionpriproCusCaseStageDetailList
      this.currentStage = 0
      this.noLick = false
    },
    handlePull () {
      this.posterW = this.posterW == 751 ? 1328 : 751
    },
    getValue (name) {
      let str = '',
        { receptionpriproCusCaseList } = this.detail
      if (receptionpriproCusCaseList.length) str = receptionpriproCusCaseList[this.currentIndex][name]
      return str
    },
    handleFull (text, url) {
      this.imageTag = text
      this.detailUrl = url;
      this.popupShow = true;
    },
    changeStep (step) {
      if (this.noLick) return
      this.currentStep = step;
      this.currentStage = 0
    },
    prevTab (val) {
      if (val) return
      this.currentIndex--;
      this.currentStep = 0
      this.updateStage()
    },
    nextTab (val) {
      if (val) return
      this.currentIndex++;
      this.currentStep = 0
      this.updateStage()
    },
    onSwiperChange (e) {
      this.currentStage = e.detail.current;
    },
    selectThumbnail (index) {
      this.currentThumbnail = index;
    },
    prevSwiper () {
      if (this.currentStage > 0) {
        this.currentStage--;
      }
    },
    nextSwiper () {
      if (this.currentStage < this.stageList.length - 1) {
        this.currentStage++;
      }
    },
  }
}
</script>
<style scoped lang="scss">
.case-box {
  position: relative;
  height: 100vh;
  width: 100vw;
  z-index: 1000; /* 提高父元素的层级 */
  .case-title {
    position: absolute;
    left: 0;
    top: toRpx(62);
    font-weight: 700;
    font-size: toRpx(48);
    color: #333;
    letter-spacing: toRpx(4);
    line-height: toRpx(64);
    text-align: center;
    width: 100%;
    z-index: 2;
  }
  .case-body {
    display: flex;
    padding-top: toRpx(140);
    padding-left: toRpx(64);
    .case-poster {
      position: relative;
      height: calc(100vh - #{toRpx(180)});
      .poster-wrap {
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
      }
      .pull-box {
        top: 24px;
        right: 0px;
        position: absolute;
        width: 30px;
        height: 24px;
        border-radius: 186px 0 0 186px;
        opacity: 1;
        background: #00000033;
        image {
          width: 16px;
          height: 16px;
          margin: 4px 8px;
        }
      }
      .poster-image {
        width: 100%;
        height: 100%;
        // position: absolute;
        // top: 50%;
        // transform: translateY(-50%);
      }
    }
    .case-detail {
      flex: 1;
      padding: 0 toRpx(64) 0 toRpx(32);
      .case-tabs {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px auto;
        width: calc(100% - #{toRpx(300)});
      }
      .tab-body {
        text-align: center;
        .case-name {
          color: #333333;
          font-weight: 700;
          font-size: toRpx(36);
          line-height: toRpx(48);
        }
        .case-carNum {
          color: #333333;
          line-height: toRpx(36);
          color: #999999;
          font-size: toRpx(28);
        }
      }
      .tab-prev,
      .tab-next {
        display: flex;
        align-items: center;
        justify-content: center;
        width: toRpx(80);
        height: toRpx(80);
        border-radius: 50%;
        border: 2px solid #ffffffcc;
        background: #f2f5ff;
        box-shadow: inset 0 0 8px 0 #ffffff;
        &.disabled {
          opacity: 0.3;
          background: #ffffff;
          box-shadow: 0 2px 6px 0 #0000001a;
        }
        .uni-icons {
          color: #6795ff !important;
        }
        .tab-icon {
          color: #6795ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      .tab-title {
        font-size: 18px;
        color: #333;
      }
    }
  }
}
.equity-box {
  height: toRpx(108);
  border-radius: toRpx(24);
  opacity: 1;
  background: #ffffff59;
  box-shadow: inset 0 0 8px 0 #ffffff;
  padding-left: toRpx(32);
  width: 100%;
  display: flex;
  align-items: center;
  text {
    color: #999999;
    font-size: toRpx(28);
    margin-right: toRpx(10);
    &.equity-title {
      line-height: toRpx(98);
      font-weight: 700;
      color: #333333;
      font-size: toRpx(36);
      margin-right: 30%;
    }
    &.equity-price {
      color: #f24724;
      font-weight: 700;
      line-height: toRpx(98);
      font-size: toRpx(42);
    }
  }
}
.case-step {
  margin: 20px 0;
  position: relative;
  .step-title {
    color: #999999;
    font-size: toRpx(24);
  }
  .step-box {
    display: flex;
    margin-top: toRpx(16);
    .step-item {
      width: toRpx(184);
      height: toRpx(80);
      border-radius: toRpx(16);
      text-align: center;
      line-height: toRpx(72);
      opacity: 1;
      border: toRpx(4) solid #ffffffcc;
      background: #f2f5ff;
      box-shadow: inset 0 0 8px 0 #ffffff;
      color: #666666;
      font-size: toRpx(30);
      margin-right: toRpx(32);
      &.checked {
        border: toRpx(4) solid #ffffff;
        background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
        box-shadow: 8px 8px 12px 0 #849dc240, inset 0 0 8px 0 #ffffff;
        color: #fff;
      }
    }
  }
}
.case-swiper {
  background: #ffffff59;
  box-shadow: inset 0 0 8px 0 #ffffff;
  border-radius: toRpx(24);
  height: calc(100vh - #{toRpx(660)});
  position: relative;
  .swiper-box {
    position: relative;
    height: 100%;
    .swiper-warp {
      width: 100%;
      height: 100%;
      .swiper-item {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: toRpx(24);
        overflow: hidden;
      }
      .swiper-image {
        height: 100%;
        width: auto;
      }
    }
    .full-box {
      width: toRpx(48);
      height: toRpx(48);
      border-radius: toRpx(8);
      background: #000000b3;
      position: absolute;
      right: toRpx(24);
      bottom: toRpx(24);
      z-index: 100;
      image {
        width: toRpx(24);
        height: toRpx(24);
        margin: toRpx(12) toRpx(12);
      }
    }
    .case-num {
      position: absolute;
      left: toRpx(24);
      bottom: toRpx(24);
      height: toRpx(48);
      line-height: toRpx(48);
      padding: 0 toRpx(20);
      border-radius: toRpx(8);
      opacity: 1;
      background: #000000b3;
      color: #ffffff;
      font-size: toRpx(24);
      z-index: 100;
      .line {
        margin: 0 toRpx(10);
      }
    }
    .swiper-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: #00000066;
      color: #fff;
      border-radius: 50%;
      width: toRpx(48);
      height: toRpx(48);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 100;
      &.swiper-button-prev {
        left: toRpx(24);
      }
      &.swiper-button-next {
        right: toRpx(24);
      }
    }
  }
}
.popup-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 9999;
  .nav-bar {
    width: 100%;
    height: toRpx(96);
    color: #fff;
    position: relative;
    z-index: 10000;
    .back {
      margin-left: toRpx(60);
      height: 100%;
      width: toRpx(64);
      margin-top: toRpx(40);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 700;
      font-size: toRpx(32);
      color: #ffffff;
      pointer-events: auto;
    }
  }
  .img-detail {
    height: calc(100vh - #{toRpx(96)});
    text-align: center;
    width: 100%;
    position: relative;
    .swiper-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba($color: #fff, $alpha: 0.3);
      color: #000;
      border-radius: 50%;
      width: toRpx(68);
      height: toRpx(68);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 100;
      &.swiper-button-prev {
        left: toRpx(32);
      }
      &.swiper-button-next {
        right: toRpx(32);
      }
    }
    .swiper-warp {
      width: calc(100% - #{toRpx(240)});
      margin-left: toRpx(118);
      height: 100%;
      .swiper-item {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: toRpx(24);
        overflow: hidden;
      }
      .swiper-image {
        height: calc(100vh - #{toRpx(96)});
        width: auto;
      }
    }
  }
}
</style>
