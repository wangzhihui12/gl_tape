<!--
 * @Description: 
 * @Author: huyue
 * @Date: 2024-06-24 16:35:00
 * @LastEditors: huyue
 * @LastEditTime: 2024-07-04 16:02:54
-->
<template>
  <view
    class="layout"
    :style="detail.pageStyle"
  >
    <image
      class="icon-car"
      :src="detail.carIcon"
    />
    <wnCanvas
      :drawStatus="penSwitch"
      :canvasId="`c-${madiaId}`"
      custom
      @scale="$emit('scale',$event)"
      ref="threeGuarantees"
    >
      <template slot="customContent">
        <view class="layout-content">

          <view class="title flex">{{title}}</view>
          <view class="container">
            <view class="left-tab">
              <view
                class="tab-item"
                v-for="item in detail.tabList"
                :key="item.id"
                @click="tabChange(item)"
                :class="[item.id == activeIndex ? 'active' : '']"
              >{{item.name}}</view>
            </view>
            <div class="content-bg"></div>
            <view class="content">
              <template v-if="detail.viewActiveIndex.includes(activeIndex)">
                <image
                  :key="imgKey"
                  :class="direction"
                  class="content-image"
                  :src="viewsImg()"
                />

                <view class="content-tab">
                  <template v-for="(item,index) in imgIdList">
                    <view
                      :key="index"
                      class="tab-item"
                      @click="tabSwitch(item)"
                    ></view>
                  </template>
                </view>
              </template>
              <template v-else>
                <image
                  :key="imgKey"
                  :class="direction"
                  class="content-image"
                  :src="viewsImg()"
                />
              </template>
            </view>
          </view>
        </view>
      </template>
    </wnCanvas>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  props: {
    views: Object,
    penSwitch: Boolean,
    title: String,
    madiaId: Number,
    detail: Object,
  },
  name: 'MediaComponent',
  data () {
    return {
      activeIndex: 1,
      direction: 'bottom',
      imgKey: Date.now(),
      tabIndex: 2
    }
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    imgIdList () {
      return this.detail.tabList.find(item => item.id == this.activeIndex).imgIdList
    }
  },
  watch: {
    watchStatus () {
      this.activeIndex = this.detail.defultActiveId || 0
      this.tabIndex = this.detail.defultTabId
    }
  },
  mounted () {
  },
  methods: {
    tabChange (item) {
      const { id } = item
      if (this.activeIndex === id) return
      this.direction = ''
      this.direction = id > this.activeIndex ? 'bottom' : 'top'
      this.activeIndex = id
      this.imgKey = Date.now()
      this.$refs.threeGuarantees.clearBoard()
    },
    tabSwitch (val) {
      if (val == this.tabIndex) return
      this.tabIndex = val
      this.$refs.threeGuarantees.clearBoard()
    },
    viewsImg () {
      let { activeIndex, tabIndex, detail, views } = this
      if (detail.viewActiveIndex.includes(activeIndex)) return views[tabIndex]
      return views[activeIndex]
    }
  }
}
</script>

<style scoped lang='scss'>
.layout {
  width: 100%;
  height: 100%;
  position: relative;
  // background-image: url('@/assets/images/media/media-bg.webp');
  background-size: 100%;
  &-content {
    margin: $margin;
    height: 100%;
    position: relative;
  }
  .title {
    justify-content: center;
    position: absolute;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    font-weight: 500;
    font-size: toRpx(36);
    color: #333;
    text-align: center;
    width: 100%;
    z-index: 2;
  }
  .container {
    display: flex;
    align-items: center;
    padding-top: toRpx(248);
    padding-bottom: toRpx(96);
    height: 100%;
    margin: 0 toRpx(80);
    position: relative;
    .left-tab {
      width: toRpx(360);
      margin-right: toRpx(48);
      .tab-item {
        display: flex;
        padding: 0 toRpx(76);
        box-sizing: border-box;
        align-items: center;
        // justify-content: center;
        width: 100%;
        height: toRpx(312);
        background: #f2f5ff;
        border: toRpx(4) solid hsl(0, 80%, 100%);
        box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
        border-radius: toRpx(32);
        margin-bottom: toRpx(48);
        font-weight: 500;
        font-size: toRpx(40);
        color: #1a1a1a;
        &:last-child {
          margin-bottom: 0;
        }
        &.active {
          color: #fff;
          background-image: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
          box-shadow: toRpx(32) toRpx(32) toRpx(48) 0 #849dc240, inset 0 0 toRpx(32) 0 #ffffff;
        }
      }
    }
    .content-bg {
      position: absolute;
      right: 0;
      z-index: -1;
      width: toRpx(1778);
      height: toRpx(1192);
      background-color: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(toRpx(8));
      z-index: 0;
      border-radius: toRpx(64);
    }
    .content {
      position: relative;
      &-tab {
        display: flex;
        position: absolute;
        width: 100%;
        top: 0;
        height: toRpx(112);
        z-index: 1;
        .tab-item {
          width: 50%;
          height: 100%;
        }
      }
    }
    .content-image {
      width: toRpx(1778);
      height: toRpx(1192);
    }
  }
  .icon-car {
    position: absolute;
    bottom: 0;
    right: 0;
    width: toRpx(952);
    height: toRpx(248);
    z-index: 2;
  }
}
.top {
  animation: show-view-top 0.5s;
}
.bottom {
  animation: show-view-bottom 0.3s;
}
@keyframes show-view-top {
  0% {
    opacity: 0;
    transform: translateY(toMinusRpx(224));
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes show-view-bottom {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>