<template>
  <view class="case-layout">
    <view class="case-box">
      <view class="nav-bar">
        <view
          class="back"
          @click="back"
        >
          <uni-icons
            type="left"
            :size="20"
            color="#000"
          ></uni-icons>
        </view>
        {{ caseObject.title }}
      </view>
      <view :class="['case-content',{'has-ai':AIUrl}]">
        <view class="left-menu">
          <view class="title">方案目录</view>
          <scroll-view
            scroll-y
            class="scroll"
            :scroll-into-view="`menu-${currentId}`"
            @scroll="menuScroll"
          >
            <view
              class="scroll-content"
              id="scroll-content"
            >
              <template v-for="(item, index) in detailInfo">
                <view
                  class="item"
                  :key="index"
                >
                  <view
                    :class="['name', isLast(index), isActive(item)]"
                    @click="menuClick(item)"
                  >
                    <view
                      class="text text-hide"
                      :id="`menu-${item.id}`"
                    >{{ item.headings }}</view>
                  </view>
                  <template v-if="item.children && item.children.length">
                    <template v-for="(i, j) in item.children">
                      <view
                        :class="['name', isLast(index, j, item.children), isActive(i)]"
                        :key="j"
                        @click="menuClick(i)"
                      >
                        <view
                          class="text"
                          :id="`menu-${i.id}`"
                        >
                          <view class="icon"></view>
                          <view class="text-hide">{{ i.headings }}</view>
                        </view>
                      </view>
                    </template>
                  </template>
                </view>
              </template>
              <template v-if="currentId">
                <view
                  class="block"
                  :style="blockTop"
                ></view>
              </template>
            </view>
          </scroll-view>
        </view>
        <scroll-view
          class="right-content"
          scroll-y
          :scroll-into-view="`case-${contentId}`"
          @scroll="contentScroll"
          enable-flex
        >
          <!-- scroll-with-animation -->
          <template v-for="(item, index) in detailInfo">
            <view
              class="detail-item"
              :key="item.id"
            >
              <view
                class="item-title"
                :id="`case-${item.id}`"
              >{{ item.headings }}</view>
              <template v-if="item.audio">
                <audio-component
                  :src="item.audio"
                  @onPlay="onPlay(item)"
                  :ref="`audio-${item.id}`"
                  :audioKey="`key${item.id}`"
                />
              </template>
              <view class="item-content">
                <rich-text :nodes="item.content"></rich-text>
              </view>
              <template v-for="(i, ind) in item.imgList">
                <view
                  class="picture"
                  :key="`img-${index}-${ind}`"
                  :id="`img-${index}-${ind}`"
                  :data-item="item"
                  :data-index="ind"
                >
                  <image
                    :src="i.url"
                    class="item-img"
                    mode="widthFix"
                    @load="imgLoad"
                    v-if="i.visible"
                  ></image>
                </view>
              </template>
              <template v-if="item.children && item.children.length">
                <template v-for="(i, s) in item.children">
                  <view
                    class="sub-item-content"
                    :key="s"
                  >
                    <view
                      class="item-title sub-item-title flex"
                      :id="`case-${i.id}`"
                    >{{ i.headings }}</view>
                    <template v-if="i.audio">
                      <audio-component
                        :src="i.audio"
                        @onPlay="onPlay(i)"
                        :ref="`audio-${i.id}`"
                        :audioKey="`key${i.id}`"
                      />
                    </template>
                    <view class="item-content">
                      <rich-text :nodes="i.content"></rich-text>
                    </view>
                    <template v-for="(c, k) in i.imgList">
                      <view
                        class="picture"
                        :key="`cimg-${s}-${k}`"
                        :id="`cimg-${s}-${k}`"
                        :data-item="i"
                        :data-index="k"
                        data-is-child
                      >
                        <image
                          :src="c.url"
                          class="item-img"
                          mode="widthFix"
                          @load="imgLoad"
                          v-if="c.visible"
                        ></image>
                      </view>
                    </template>
                  </view>
                </template>
              </template>
            </view>
          </template>

          <view class="content-end">-已经到底了-</view>
        </scroll-view>
      </view>
    </view>

    <view
      class="AI-window"
      v-if="AIUrl"
    >
      <view class="AI-title flex">场景二拓</view>
      <web-view :src="AIUrl"></web-view>
    </view>
  </view>
</template>

<script type="text/ecmascript-6">
import AudioComponent from './components/AudioComponent.vue'
import { aiUrlMixin, report } from '@/mixin/index.js'

let view_padding_top = 88,
  menuHeight = 68
export default {
  components: {
    AudioComponent
  },
  mixins: [report, aiUrlMixin],
  data () {
    return {
      detailInfo: [],
      currentId: '',
      blockTop: '',
      menuScrollTop: 0,
      topList: [],
      itemList: [],
      contentId: '',
      caseObject: {},
      imgLength: 0,
      contentScrollNumber: 0,
    }
  },
  onLoad (options) {
    this.getMaterialDetail(options)
  },
  watch: {
    currentId (n) {
      if (!n) return
      const query = uni.createSelectorQuery()
      query.select(`#menu-${n}`).boundingClientRect((data) => {
        let top = data.top - (view_padding_top + menuHeight) + this.menuScrollTop
        this.blockTop = `transform:translateY(${top * 2}rpx);`
      }).exec()
    }
  },
  computed: {
  },
  methods: {

    async getMaterialDetail (options) {
      try {
        uni.showLoading({
          mask: true
        })
        const res = await uni.$api.customerApi.getMaterialDetail({
          id: options.id
        })
        let detailInfo = []
          , imgLength = 0
        this.caseObject = res
        if (options.specialFlag == 1) this.getAiagent({ ...res, directoryName: options.directoryName })
        res.richTextInfoList?.map(e => {
          let imgList = []
          if (e.content) e.content = this.highlightText(e.content)
          if (e.pictureList && e.pictureList.length) {
            imgLength += e.pictureList.length
            e.pictureList.map(i => {
              imgList.push({
                // visible: false,
                visible: true,
                url: i
              })
            })
            e.imgList = imgList
          }
          if (e.level == 1) detailInfo.push({
            ...e,
            children: []
          })
        })
        res.richTextInfoList?.map(e => {
          if (e.level == 2) {
            let index = detailInfo.findIndex(item => item.id == e.parentId)
            if (index > -1) detailInfo[index].children.push(e)
          }
        })
        this.imgLength = imgLength
        this.detailInfo = detailInfo
        this.$nextTick(() => {
          this.initScrollListTop()
          // this.observerPicture()
          // uni.hideLoading()
        })

        if (imgLength == 0) uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        console.log(error)
      }
    },
    observerPicture () {
      uni.createIntersectionObserver(this, {
        observeAll: true
      })
        .relativeToViewport({
          top: 0,
          bottom: 300,
        }).observe('.picture', res => {
          const {
            item,
            index,
            isChild
          } = res.dataset,
            currentItem = item.imgList[index]
          if (!currentItem?.visible && res.intersectionRatio > 0) {
            let parentIndex = this.detailInfo.findIndex(e => e.id == (isChild ? item.parentId : item.id))
            if (isChild) {
              let childIndex = this.detailInfo[parentIndex].children.findIndex(e => e.id == item.id)
              console.log(this.detailInfo[parentIndex].children[childIndex], index)
              this.detailInfo[parentIndex].children[childIndex].imgList[index].visible = true
            } else this.detailInfo[parentIndex].imgList[index].visible = true
            this.initScrollListTop()
            this.$forceUpdate()
          }
        })
    },
    highlightText (text) {
      text = text.replace(/<\/?br\s*\/?>|\n/g, '<br>')
      const matches = text.match(/#/g)
      if (!matches) return text
      const spanCount = matches.length
      let lastSpan = spanCount % 2 === 1,
        parts = [],
        currentIndex = 0
      for (let i = 0; i < spanCount; i++) {
        const matchIndex = text.indexOf('#', currentIndex)
        parts.push(text.substring(currentIndex, matchIndex))
        if (i === spanCount - 1 && lastSpan) parts.push('')
        else {
          if (i % 2 === 0) parts.push('<span style="color:#FF8D1A;font-weight: 500;">')
          else parts.push('</span>')
        }
        currentIndex = matchIndex + 1
      }
      parts.push(text.substring(currentIndex))
      return parts.join('')
    },
    back () {
      uni.navigateBack({
        delta: 1,
        animationType: 'pop-out',
        animationDuration: 100
      })
    },
    async initScrollListTop () {
      let { detailInfo, contentScrollNumber } = this,
        topList = [],
        itemList = [],
        itemHeight = view_padding_top + 30
      await detailInfo.map(async e => {
        let query = uni.createSelectorQuery()
        query.select(`#case-${e.id}`).boundingClientRect(data => {
          if (data) {
            topList.push(data.top - itemHeight + contentScrollNumber)
            e.top = data.top - itemHeight + contentScrollNumber
            itemList.push(e)
          }
        }).exec()

        if (e.children) e.children.map(i => {
          let c_query = uni.createSelectorQuery()
          c_query.select(`#case-${i.id}`).boundingClientRect((data) => {
            if (data) {
              topList.push(data.top - itemHeight + contentScrollNumber)
              i.top = data.top - itemHeight + contentScrollNumber
              itemList.push(i)
            }
          }).exec()
        })
      })
      this.topList = topList
      this.itemList = itemList
      this.detailInfo = detailInfo
      const query = uni.createSelectorQuery()
      query.select('.title').boundingClientRect((box) => {
        menuHeight = box.height
      })
      query.select('.case-content').boundingClientRect((box) => {
        view_padding_top = box.top
      }).exec()
      if (!this.currentId) this.currentId = detailInfo[0].id
      this.$forceUpdate()
    },
    isLast (index, ind, children) {
      let result = false
      if (ind > - 1 && children) result = ind == children.length - 1 && index == this.detailInfo.length - 1
      else result = (index == this.detailInfo.length - 1 && !this.detailInfo[index].children.length)
      return result ? 'last' : ''
    },
    isActive (item) {
      return item.id == this.currentId ? 'active' : ''
    },
    menuScroll (e) {
      this.menuScrollTop = e.detail.scrollTop
    },
    contentScroll (e) {
      this.contentScrollNumber = e.detail.scrollTop
      let { topList, itemList } = this,
        targetNum = this.findClosestNotGreaterThan(e.detail.scrollTop, topList)
      let item = itemList.find(i => i.top == targetNum)
      if (item) this.currentId = item.id
    },
    findClosestNotGreaterThan (target, arr) {
      let closest = arr[0]
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] <= target) closest = arr[i]
        else break
      }
      return closest
    },
    menuClick (item) {
      this.currentId = item.id
      this.contentId = item.id
    },
    onPlay (item) {
      Object.keys(this.$refs).map(key => {
        if (`audio-${item.id}` != key) this.$refs[key][0]?.stop()
      })
      let innerAudioContext = this.$refs[`audio-${item.id}`][0]?.innerAudioContext[`key${item.id}`]
      if (innerAudioContext) innerAudioContext.play()

    },
    imgLoad () {
      this.imgLength -= 1
      if (this.imgLength == 0) uni.hideLoading()
      this.initScrollListTop()
    },
  }
}
</script>

<style scoped lang="scss">
.case-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(0deg, #eef3ff 0%, #f3f6ff 100%);
  box-sizing: border-box;
  padding-top: toRpx(176);
  .nav-bar {
    position: fixed;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    z-index: 9;
    text-align: center;
    font-weight: 700;
    font-size: toRpx(32);
    color: #1a1a1a;
    line-height: toRpx(96);
    .back {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .case-content {
    height: calc(100vh - #{toRpx(176)});
    position: relative;

    .left-menu {
      position: absolute;
      top: 0;
      left: 2.7%;
      width: 20.4%;
      height: toRpx(1296);
      border-radius: toRpx(16);
      background-color: #fff;
      background-image: url('@/assets/images/common/left-menu.webp');
      background-size: 100%;
      .title {
        padding: toRpx(48) toRpx(48) toRpx(32);
        font-weight: 500;
        font-size: toRpx(36);
        color: #333333;
        line-height: toRpx(56);
      }
      .scroll {
        height: calc(100% - #{toRpx(184)});
        padding-left: toRpx(48);
        &-content {
          position: relative;
          &::after {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: toRpx(6);
            height: 100%;
            background: #0000001a;
          }
          .block {
            position: absolute;
            top: 0;
            left: 0;
            width: toRpx(6);
            height: toRpx(40);
            background-image: linear-gradient(173deg, #75bcff 6%, #2c66f7 100%);
            box-shadow: 0 toRpx(8) toRpx(16) 0 #2c66f759;
            transition: all 0.15s;
          }
        }
        .item {
          padding: 0 toRpx(20) 0 toRpx(30);

          .name {
            font-size: toRpx(30);
            color: #333333b3;
            line-height: toRpx(40);
            padding-bottom: toRpx(48);
            .text {
              display: flex;
              align-items: center;
              position: relative;
            }
            .icon {
              width: toRpx(6);
              height: toRpx(6);
              border-radius: 100%;
              background: #33333399;
              margin: 0 toRpx(12);
              flex-shrink: 0;
            }
          }
          .active {
            font-weight: 500;
            color: #333;
            position: relative;
            .icon {
              background: #333;
            }
          }
          &:first-child {
            .name {
              &:first-child {
                padding-top: toRpx(16);
              }
            }
          }
          .last {
            padding-bottom: toRpx(16);
          }
        }
      }
    }
    .right-content {
      width: 73.4%;
      height: 100%;
      margin-left: 26.6%;
      /deep/.uni-scroll-view-content {
        display: flex;
        flex-direction: column;
      }

      .detail-item {
        padding-right: toRpx(64);
        .item-title {
          font-weight: 500;
          font-size: toRpx(40);
          color: #333333;
          line-height: toRpx(56);
          margin-bottom: toRpx(24);
        }
        .sub-item-title {
          font-size: toRpx(32);
          line-height: toRpx(48);
          &::before {
            content: '';
            width: toRpx(8);
            height: toRpx(8);
            border-radius: 100%;
            background: #333;
            margin: 0 toRpx(16);
            flex-shrink: 0;
          }
        }

        .item-content {
          color: #333333e6;
          font-size: toRpx(28);
          line-height: toRpx(44);
          margin-bottom: toRpx(24);
          word-wrap: break-word;
        }
        .picture {
          width: 78.9%;
          margin: 0 auto toRpx(24);
          min-height: toRpx(100);
        }
        .item-img {
          display: block;
          width: 100%;
        }
      }
      .content-end {
        width: 100%;
        text-align: center;
        color: #999;
        text-align: center;
        padding: toRpx(24) toRpx(64) toRpx(24) 0;
        font-size: toRpx(24);
        margin-top: auto;
      }
    }
  }
  .has-ai {
    width: 71.36% !important;
  }
}
.AI-window {
  width: 28.3vw;
  height: 90.63vh;
  position: fixed;
  top: 9.37vh;
  right: 0;
  background: #f5f9ff;
  .AI-title {
    height: 5.73vh;
    padding-top: 2.08vh;
    font-size: toRpx(34);
    font-weight: 500;
    justify-content: center;
    color: #333333;
  }
}
</style>
