<template>
  <view :class="['swiper-box', { 'type-2': swiperType == 2 }]">
    <template v-if="loadComplete">
      <template v-if="moduleList.length">
          <view
            class="swiper-carousel"
            @touchstart="starts"
            @touchmove="moves"
            @touchend="ends"
          >
            <template v-for="(item, index) in imagelist">
            <view
              :key="index"
              :class="['carousel-block', item.class]"
              @click.stop="changeBlock(item)"
              :style="getItemStyle(item)"
              v-if="item.imgUrl"
            >
              <view class="transform-container">
                <template v-if="custom">
                  <slot :content="item" name="swiper"></slot>
                </template>
                <template v-else>
                  <image
                    class="image-block"
                    :src="item.imgUrl"
                    mode="aspectFill"
                    @load="item.hide = true"
                  />
                  <view class="bg" v-if="item.hide"></view>
                  <view class="mask"></view>
                </template>
              </view>
            </view>
          </template>
        </view>
        <view class="module-title flex">
          {{ moduleTitle }}
        </view>
        <view class="module-dots flex">
          <template v-for="(i, index) in moduleList">
            <div
              :class="['dot', { active: index == currentIndex }]"
              :key="index"
            ></div>
          </template>
        </view>
      </template>
      <template v-else>
        <view class="nothing flex">
          <template v-if="noDataObject.icon">
            <image
              :src="noDataObject.icon"
              class="icon"
              :style="noDataObject.style"
            />
          </template>
          {{ noDataObject.text || '该场景尚未配置素材，请联系总部人员' }}
        </view>
      </template>
    </template>
    <template v-else>
      <view class="loading flex">
        <image class="gif" src="../assets/images/common/loadding.gif" />
      </view>
    </template>
  </view>
</template>
<script>
import utils from "@/utils/utils.js";
export default {
  name: 'SwiperComponent',
  props: {
    moduleList: {
      type: Array,
      default: () => []
    },
    imgKey: {
      type: String,
      default: 'thumbnail'
    },
    icon: {
      type: String,
      default: 'image'
    },
    size: {
      type: [Number, String],
      default: '40'
    },
    interval: {
      type: [Number, String],
      default: 5e3
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    stopAutoPlay: {
      type: Boolean,
      default: false
    },
    loadComplete: Boolean,
    noDataObject: {
      type: Object,
      default: () => ({})
    },
    custom: Boolean,
    swiperType: [Number, String]
  },
  watch: {
    moduleList: {
      handler (val) {
        if (!val.length) {
          this.datalist = []
          this.imagelist = []
        }
        if (val.length && !this.imagelist.length) this.getDatalist()
      },
      deep: true
    },
    stopAutoPlay: {
      handler (val) {
        if (this.autoplay && !val) this.autoPlayFunction()
      },
      deep: true
    }
  },
  computed: {
    moduleTitle () {
      return this.moduleList[this.currentIndex]?.detailTitle || ''
    }
  },
  created () {
    // this.getDatalist()
  },
  data () {
    return {
      datalist: [],
      imagelist: [],
      ismove: 0,
      currentIndex: 0,
      autoPlayTimer: null,
      endTimer: null,
      playStatus: true,
      isTouching: false,
      style_object: Object.freeze([
        { index: 0, class: 'block-left' },
        { index: 1, class: 'block-center' },
        { index: 2, class: 'block-right' }
      ]),
      blockX: 0,
      viewX: 0
    }
  },
  beforeDestroy () {
    this._isDestroyed = true
    // 组件销毁时清理所有定时器
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    if (this.endTimer) {
      clearTimeout(this.endTimer);
      this.endTimer = null;
    }
  },
  methods: {
    getItemStyle(item) {
      // 基础样式
      let style = {}
      
      // 3D 变换
      let transform = ''
      
      // 计算拖动时的实时偏移
      let moveX = 0
      if (this.isTouching) {
        moveX = this.viewX
      }
      if (item.class === 'block-left') {
        transform = `translateX(calc(-45% + ${moveX * 0.5}px)) translateZ(-100px) rotateY(25deg) scale(0.9)`
        style.zIndex = 10
        style.opacity = 0.8
      } else if (item.class === 'block-right') {
        transform = `translateX(calc(45% + ${moveX * 0.5}px)) translateZ(-100px) rotateY(-25deg) scale(0.9)`
        style.zIndex = 10
        style.opacity = 0.8
      } else {
        // block-center
        transform = `translateX(${moveX}px) translateZ(0) rotateY(0deg) scale(1)`
        style.zIndex = 20
        style.opacity = 1
      }
      
      // 拖动时取消过渡动画，保证跟手性
      if (this.isTouching) {
        style.transition = 'none'
      }
      if(this.swiperType != 2) style.transform = transform
      return style
    },
    getDatalist () {
      if (this.moduleList) {
        this.currentIndex = 0
        // 浅拷贝即可，避免昂贵的 JSON 序列化
        this.datalist = [...this.moduleList]
        let num = 3
        let diff = num - this.moduleList.length
        if (diff > 0) {
          for (let i = 0; i < diff; i++) {
            let obj = {}
            obj[this.imgKey] = ''
            this.datalist.push(obj)
          }
        }
        this.getImagelist()
      }
    },
    getImagelist () {
      let { datalist, autoplay, style_object } = this
      // 优化：使用 map 进行浅拷贝，避免 JSON.parse(JSON.stringify)
      this.imagelist = style_object.map(item => ({ ...item }))
      
      this.imagelist.forEach((item, index) => {
        const dataIndex = index - 1 < 0 ? datalist.length - 1 : index - 1
        item.isIndex = dataIndex
        item.isToor = index
        item.imgUrl = datalist[dataIndex]?.[this.imgKey] || ''
        item.originalData = datalist[dataIndex]
        item.x = 0
      })
      if (autoplay) this.autoPlayFunction()
    },
    autoPlayFunction () {
      if (this._isDestroyed) return
      if (!this.autoplay) return
      if (this.stopAutoPlay || !this.playStatus) {
        if (this.autoPlayTimer) {
          clearTimeout(this.autoPlayTimer);
          this.autoPlayTimer = null;
        }
        return;
      }
      // 设置新的自动播放定时器
      this.autoPlayTimer = setTimeout(() => {
        if (this._isDestroyed) return // 双重检查
        // 再次检查是否需要停止播放
        if (this.stopAutoPlay || !this.playStatus) {
          clearTimeout(this.autoPlayTimer);
          this.autoPlayTimer = null;
          return;
        }
        // 执行轮播动画并递归调用自身
        this.updateCarouselPositions();
        this.autoPlayFunction();
      }, this.interval);
    },
    updateCarouselPositions (direction = 'left') {
      let { imagelist, datalist, moduleList } = this,
        len = datalist.length - 1,
        // 优化：浅拷贝 style_object
        list = this.style_object
      if (moduleList.length == 2) {
        this.imagelist.forEach((item, index) => {
          if (index != 0) {
            let toor = item.isToor == 1 ? 2 : 1
            item.isToor = toor
            item.class = list[toor].class
            item.x = 0
            let isIndex = item.isIndex
            item.isIndex = isIndex
            item.imgUrl = datalist[isIndex][this.imgKey] || ''
            item.index = list[toor].index
          }
        })
      } else {
        this.imagelist.forEach(item => {
          let toor = direction == 'left' ?
            (item.isToor - 1) < 0 ? imagelist.length - 1 : item.isToor - 1
            : (item.isToor + 1) > imagelist.length - 1 ? 0 : item.isToor + 1
          item.isToor = toor
          item.class = list[toor].class
          item.x = 0
          let isIndex = item.isIndex
          if (direction == 'left' && item.class == 'block-right') {
            if (isIndex == len) isIndex = 2
            else if (isIndex == len - 1) isIndex = 1
            else isIndex += 3
            if (isIndex > len) isIndex = 0
          }
          if (direction == 'right' && item.class == 'block-left') {
            if (isIndex == 1) isIndex = len - 1
            else if (isIndex == 0) isIndex = len - 2
            else isIndex -= 3
            if (isIndex < 0) isIndex = len
          }
          item.isIndex = isIndex
          item.imgUrl = datalist[isIndex][this.imgKey] || ''
          item.index = list[toor].index
        })
      }
      let currentIndex = this.imagelist.findIndex(item => item.index == 1)
      if (currentIndex < 0 || !this.imagelist[currentIndex]) return
      this.currentIndex = this.imagelist[currentIndex].isIndex
    },
    changeBlock (item) {
      let toor = item.isToor
      if (toor === 0) this.updateCarouselPositions('right')
      if (toor == 2) this.updateCarouselPositions()
      this.$emit('click', item.isIndex)
    },
    starts (e) {
      this.ismove = e.touches[0].pageX
      this.playStatus = false
      this.isTouching = true
      this.viewX = 0
      if (this.endTimer) {
        clearTimeout(this.endTimer);
        this.endTimer = null;
      }
      if (this.autoPlayTimer) {
        clearTimeout(this.autoPlayTimer)
        this.autoPlayTimer = null
      }
    },
    moves (e) {
      if (!this.isTouching) return
      let pageX = e.touches[0].pageX
      this.viewX = pageX - this.ismove
    },
    ends (e) {
      this.isTouching = false
      let { moduleList } = this
      if (moduleList.length == 1) return
      
      let moveDistance = this.viewX
      this.viewX = 0 // 重置偏移量，让CSS transition接管回弹或切换动画
      
      // 阈值判断，超过 50px 或者快速滑动则切换
      if (moveDistance > 50) {
        this.updateCarouselPositions('right')
      } else if (moveDistance < -50) {
        this.updateCarouselPositions('left')
      }
      
      // 恢复自动播放
      this.endTimer = setTimeout(() => {
        if (this._isDestroyed) return
        if (!this.playStatus) {
          this.playStatus = true
          this.autoPlayFunction()
        }
      }, this.interval)
    },
    change: utils.throttle(function (e, item) {
      let { x } = e.detail
      this.blockX = x
    }, 16)
  }
}
</script>
<style lang="scss" scoped>
.swiper-box {
  height: 100%;
  .loading {
    width: 100%;
    height: 100%;
    justify-content: center;
    .gif {
      width: toRpx(64);
      height: toRpx(64);
    }
    .icon {
      animation: rotate 1s infinite;
    }
    @keyframes rotate {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
.swiper-carousel {
  width: 100%;
  height: toRpx(440);
  position: relative;
  // overflow: hidden; // 移除 hidden 以显示 3D 效果
  perspective: 1000px; // 添加透视
  display: flex;
  justify-content: center;
  align-items: center;

  .carousel-block {
    position: absolute;
    width: toRpx(624);
    height: toRpx(408);
    border-radius: toRpx(24);
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 toRpx(8) toRpx(24) 0 rgba(0, 0, 0, 0.1);
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform-style: preserve-3d;
    
    // 默认居中
    left: 50%;
    top: 50%;
    margin-left: toRpx(-312); // width的一半
    margin-top: toRpx(-204); // height的一半

    .transform-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .image-block {
      width: 100%;
      height: 100%;
      border-radius: toRpx(24);
    }
    
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.1); // 侧边遮罩
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
    }
    
    &.block-left, &.block-right {
      .mask {
        opacity: 1;
      }
    }
  }
}
.module-title {
  color: #333333;
  font-size: toRpx(24);
  margin-top: toRpx(24);
  justify-content: center;
  position: relative;
}
.module-dots {
  position: absolute;
  bottom: toRpx(56);
  right: toRpx(48);
  gap: toRpx(12);
  .dot {
    width: toRpx(12);
    height: toRpx(12);
    opacity: 1;
    background: #0007400d;
    border-radius: 100%;
  }
  .active {
    background: #fff;
  }
}
.nothing {
  width: 100%;
  height: 100%;
  justify-content: center;
  color: #999;
  font-size: toRpx(20);
  flex-direction: column;
  .icon {
    width: toRpx(344);
    height: toRpx(236);
  }
}
.type-2 {
  .swiper-carousel {
    height: toRpx(460);
    .carousel-block {
      border: none;
    }
    .block-left,
    .block-right {
      top: toRpx(68);
      height: toRpx(306);
      width: toRpx(604);
       margin: 0 !important;
    }
    .block-left {
      left: toRpx(88);
      z-index: 10;
    }
    .block-right {
      left: toRpx(508);
      z-index: 15;
    }
    .block-center {
      left: toRpx(180);
      top: toRpx(10);
      width: toRpx(848);
      height: toRpx(428);
      margin: 0 !important;
    }
  }
  flex-direction: column;
  .icon {
    width: toRpx(344);
    height: toRpx(236);
  }
}
</style>