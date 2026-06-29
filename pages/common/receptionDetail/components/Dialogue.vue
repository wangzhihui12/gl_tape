<template>
  <view class="view">
    <scroll-view
      class="scroll-view"
      enhanced
      scroll-y
      scroll-with-animation
      :scroll-into-view="toId"
      @touchstart="touchstart"
      @touchend="touchend"
    >
      <template v-if="dialogueList.length">
        <block
          v-for="(item,index) in dialogueList"
          :key="index"
        >
          <view
            :class="['item flex', {active:item.text_id == activeId}]"
            :id="item.text_id"
            @click="seekPlay({item,click:true})"
          >
            <view class="avatar-box">
              <view :class="['sprite-icon',`icon-role-${item.role}`]"></view>
              <view class="time">{{item.time}}</view>
            </view>
            <view class="text flex">{{item.content}}</view>
          </view>
          <!-- 意图匹配 -->
          <block v-if="item.recordingCheckResultList && item.recordingCheckResultList.length">
            <template v-for="(i, ind) in item.recordingCheckResultList">
              <view
                :class="['detail-box',i.detailClassName]"
                :key="`text_${index}_${ind}`"
              >
                <view class="text-box">
                  <view
                    class="btn"
                    @click="changeDetailClassName(i)"
                  >
                    意图匹配
                    <view class="arrow sprite-icon icon-suggestions-arrow"></view>
                  </view>
                  {{i.tagGroupName}}
                  <view class="score">{{i.score}}分</view>
                </view>
                <view class="content-box">
                  <block v-if="!i.scriptRec">
                    <view class="suggestions-box no">
                      暂无话术推荐
                    </view>
                  </block>
                  <block v-else>
                    <view class="suggestions-box">
                      <view class="title">
                        <view class="sprite-icon icon-suggestions-icon"></view>
                        话术推荐
                      </view>
                      <view class="text">
                        <rich-text :nodes="i.scriptRec"></rich-text>
                      </view>
                    </view>
                  </block>
                </view>
              </view>
            </template>
          </block>
        </block>
        <view class="safeAreaInset">-已经到底了-</view>
      </template>
      <template v-else>
        <view class="nothing flex">
          <view class="sprite-icon icon-quality-no-data"></view>
          分析中，稍等...
        </view>
      </template>
    </scroll-view>
    <view
      class="axis-bar-area"
      :hidden="!qualityData.length"
      @click="barSeek"
    >
      <view class="axis-bar">
        <view
          class="progress-bar"
          :style="[{height:`${progress}%`}]"
        ></view>
        <template v-if="true">
          <template v-for="(item,index) in axisList">
            <block :key="index">
              <view
                :class="['axis-item',{'axis-active':activeId == item.text_id}]"
                :style="[{top:`${item.docTop + 'px'}`}]"
              >
                <view :class="['axis-dot', `${!isPlayIng && !isScrolllIng?'':'radius'}`]"></view>
              </view>
              <template v-if="!isPlayIng && !isScrolllIng">
                <view
                  :class="['axis-text',{'axis-text-active':activeId == item.text_id}]"
                  :style="[{top:`${item.top + 'px'}`}]"
                  @click.stop="seekPlay({
                  item,
                  scroll:true
                })"
                >
                  {{item.tagGroupName}}+{{item.score}}
                </view>
              </template>
            </block>
          </template>
          <view class="hide-bar">
            <block
              v-for="(item,index) in axisList"
              :key="index"
            >
              <block v-if="item.inspectionConversationDetailId">
                <view
                  :class="['axis-line']"
                  :style="[{height:`${item.height + 20 + 'px'}`},{top:`${item.docTop  - 10 + 'px'}`}]"
                ></view>
              </block>
            </block>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import utils from '@/utils/utils'

export default {
  name: '',
  props: {
    batchId: [String, Number],
    qualityData: {
      type: Array,
      default: () => []
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    qualityAudio: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    batchId: {
      handler (n) {
        const data = {
          batchId: n,
        };
        this.findConversationDetailByBatchIdNew(data)
      },
      immediate: true
    },
    qualityData: {
      handler (n) {
        if (n.length) this.findCbByBatchId()
      },
      immediate: true
    }
  },
  data () {
    return {
      dialogueList: [],
      activeId: '',
      progress: 0,
      barTop: 0,
      containerHeight: 0,
      axisList: [],
      isPlayIng: false,
      isScrolllIng: false,
      toId: '',
      touchTimer: null
    }
  },
  mounted () {
  },
  methods: {
    formatTime (num) {
      let minutes = Math.floor(num / 60) || '0',
        seconds = num % 60 || '0'
      seconds = seconds < 10 ? `0${seconds}` : seconds
      return `${minutes}:${seconds}`
    },
    transitionBr (text) {
      let regex = new RegExp('</br>', 'g')
      text = text.replace(regex, '<div></div>')
      return text
    },
    changeDetailClassName (i) {
      i.detailClassName = i.detailClassName == 'up' ? 'down' : 'up'
    },
    async findConversationDetailByBatchIdNew (params) {
      const res = await uni.$api.receptionApi.findConversationDetailByBatchIdNew(params)
      res.map(e => {
        e.time = this.formatTime(e.mergedOffset)
        e.text_id = `text_${e.mergedOffset}`
        if (e?.recordingCheckResultList && e.recordingCheckResultList.length) {
          e.recordingCheckResultList.map(i => {
            i.detailClassName = 'down'
            console.log(i.scriptRec)
            let [scriptRec] = JSON.parse(i.scriptRec)
            if (scriptRec) i.scriptRec = scriptRec.replace(/\n/g, '<br>')
            else i.scriptRec = ''
          })
        }
      })
      this.dialogueList = res
    },
    async findCbByBatchId () {
      let data = JSON.parse(JSON.stringify(this.qualityData))
      let { totalDuration } = this,
        margin = 20
      utils.getViewInfo('.axis-bar', ({
        height: containerHeight,
        top: barTop
      }) => {
        if (containerHeight == 0) {
          return setTimeout(() => {
            this.findCbByBatchId()
          }, 100)
        }
        this.barTop = barTop
        this.containerHeight = containerHeight
        let axisList = []
        data?.sort((a, b) => a.offset - b.offset).forEach(e => {
          const {
            offset: mergedOffset,
            id
          } = e
          e.top = mergedOffset / totalDuration * containerHeight
          e.docTop = mergedOffset / totalDuration * containerHeight
          e.text_id = `text_${mergedOffset}`
          e.mergedOffset = mergedOffset
          if (mergedOffset != null) axisList.push(e)
        })
        axisList.map((e, index) => {
          // 检查并调整 top 值，避免重叠
          for (let i = 0; i < index; i++) {
            if (e.top < axisList[i].top + margin &&
              e.top + margin > axisList[i].top) {
              // 如果重叠，将当前元素的 top 设置为前一个元素的底部加上 margin
              e.top = axisList[i].top + margin;
            }
          }
        })
        this.axisList = axisList
      })
    },
    onTimeUpdate () {
      const {
        dialogueList,
      } = this, {
        paused
      } = this.qualityAudio, {
        mergedOffset
      } = this.setProgress(),
        item = dialogueList.find(e => e.mergedOffset == mergedOffset)

      if (!paused) this.isPlayIng = true
      if (this.isScrolllIng) return
      if (item && item.id) this.setTopId(item, true)
    },
    setTopId (item, scroll = false) {
      const {
        dialogueList
      } = this
      let centerIndex = dialogueList.findIndex(e => e.text_id == item.text_id)
      centerIndex -= 3
      if (centerIndex < 0) centerIndex = 0
      this.$nextTick(() => {
        this.activeId = item.text_id
      })
      if (scroll) this.toId = dialogueList[centerIndex].text_id
    },
    setProgress () {
      const {
        duration,
        currentTime
      } = this.qualityAudio,
        mergedOffset = Math.ceil(currentTime)
      this.progress = mergedOffset / duration * 100
      return {
        currentTime,
        mergedOffset
      }
    },
    seekPlay (e) {
      let {
        item,
        click,
        scroll
      } = e, {
        activeId,
      } = this
      if (!item) return
      this.$emit('seek', item.mergedOffset)
      this.setTopId(item, scroll)
      if (click && item.text_id == activeId) {
        const {
          paused
        } = this.qualityAudio
        if (paused) this.$emit('onPlay')
        else this.$emit('onPause')
        this.$emit('changeOperate', !paused)
      } else {
        this.$emit('onPlay')
        this.$emit('changeOperate', false)
      }
    },
    touchstart () {
      this.isScrolllIng = true
      this.clearTimer()
    },
    touchend () {
      this.touchTimer = setTimeout(() => {
        this.isScrolllIng = false
        this.clearTimer()
      }, 3e3)
    },
    clearTimer () {
      if (this.touchTimer) {
        clearTimeout(this.touchTimer)
        this.touchTimer = null
      }
    },
    barSeek (e) {
      function findNearest (arr, target) {
        let closest = arr[0];
        let minDiff = Math.abs(target - arr[0]);

        for (let i = 1; i < arr.length; i++) {
          const diff = Math.abs(target - arr[i]);
          if (diff < minDiff) {
            minDiff = diff;
            closest = arr[i];
          }
        }

        return closest;
      }
      let [touches] = e.touches, {
        barTop,
        containerHeight
      } = this, {
        duration
      } = this.qualityAudio, {
        dialogueList
      } = this
      if (touches) {
        let {
          clientY
        } = touches,
          progress = (clientY - barTop) / containerHeight * 100,
          offsetList = dialogueList.map(i => i.mergedOffset),
          mergedOffset = findNearest(offsetList, duration * progress / 100),
          item = dialogueList.find(i => i.mergedOffset == mergedOffset)
        this.seekPlay({
          item,
          scroll: true
        })
      }
    },
  }
}
</script>

<style scoped lang='scss'>
.view {
  height: 100%;
  width: 100%;
  position: relative;
  .scroll-view {
    height: 100%;
    width: 100%;
    border-radius: toRpx(28);
    background: #fff;
    .item {
      padding: toRpx(20) toRpx(24);
      .avatar-box {
        position: relative;
        width: toRpx(68);
        height: toRpx(96);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        flex-direction: column;

        .sprite-icon {
          border-radius: 100%;
          overflow: hidden;
          flex-shrink: 0;
        }
        .time {
          width: toRpx(70);
          height: toRpx(28);
          background: #ffffff;
          border: toRpx(2) solid #f0f6ff;
          border-radius: toRpx(28);
          font-size: toRpx(20);
          color: #999ea8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
      }
      .text {
        width: toRpx(722);
        min-height: toRpx(80);
        color: #292d33;
        font-size: toRpx(26);
        margin-left: toRpx(16);
        line-height: toRpx(44);
      }
    }
    .active {
      background: #f0f6ff;
      .text {
        font-weight: 500;
      }
    }
    .detail-box {
      background: #f5f8fc;
      overflow: hidden;
      opacity: 0;
      .content-box {
        transform: translateY(-100%);
      }

      .text-box {
        height: toRpx(80);
        display: flex;
        align-items: center;
        color: #133667;
        font-size: toRpx(24);
        padding: 0 toRpx(24);
        border-bottom: toRpx(2) solid #e8f0ff;
        position: relative;
        background: #f5f8fc;
        z-index: 2;

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: toRpx(172);
          height: toRpx(56);
          background: #ffffff;
          border-radius: toRpx(28);
          margin-right: toRpx(8);

          .arrow {
            transition: all 0.25s;
          }
        }

        .score {
          font-weight: 600;
          margin-left: toRpx(8);
        }
      }
      .suggestions-box {
        width: toRpx(796);
        background: #ffffff;
        border-radius: toRpx(16);
        margin: toRpx(24);
        padding: toRpx(24) toRpx(28);
        box-sizing: border-box;

        .title {
          display: flex;
          align-items: center;
          font-weight: 500;
          font-size: toRpx(28);
          color: #333333;
          margin-bottom: toRpx(20);

          .sprite-icon {
            margin-right: toRpx(12);
          }
        }

        .text {
          color: #292d33;
          font-size: toRpx(26);
          line-height: toRpx(44);
        }

        .suggestions-text {
          padding-bottom: toRpx(22);
          border-bottom: toRpx(2) solid #f0f6ff;
          margin-bottom: toRpx(24);
        }
      }
      .no {
        display: flex;
        align-items: center;
        justify-content: center;
        height: toRpx(124);
        font-size: toRpx(24);
        color: #8a8c90;
      }
    }
    .up {
      height: auto;
      opacity: 1;
      .arrow {
        transform: rotate(180deg);
      }

      .content-box {
        animation: move-up 0.2s forwards;
      }
    }

    .down {
      animation: hide-box 0.2s 0.1s forwards;

      .content-box {
        animation: move-down 0.2s forwards;
      }
    }

    @keyframes hide-box {
      100% {
        height: toRpx(80);
        opacity: 1;
      }
    }

    @keyframes move-up {
      0% {
        transform: translateY(-100%);
      }

      100% {
        transform: translateY(0);
      }
    }

    @keyframes move-down {
      0% {
        transform: translateY(0);
      }

      100% {
        transform: translateY(-100%);
      }
    }
    .safeAreaInset {
      text-align: center;
      line-height: toRpx(40);
      color: #999;
      font-size: toRpx(24);
      padding-bottom: toRpx(20);
    }
  }
  .nothing {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    color: #808291;
    font-size: toRpx(28);
    background: #fff;
  }
  .axis-bar-area {
    position: absolute;
    top: 50%;
    height: toRpx(912);
    transform: translateY(-50%);
    z-index: 8;
    width: toRpx(36);
    right: toMinusRpx(20);
    .axis-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: toRpx(16);
      height: 100%;

      background-color: #e7e7e7;
      border-radius: toRpx(8);
      .hide-bar {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border-radius: toRpx(8);
        overflow: hidden;
        z-index: 2;

        .axis-line {
          border-radius: toRpx(4);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: -1;
          width: toRpx(8);
          background: #347bff;
        }
      }

      .progress-bar {
        position: absolute;
        width: 100%;
        background-color: #347bff;
        top: 0;
        left: 0;
        border-radius: toRpx(8);
        z-index: 3;
        transition: all 0.1s;
      }

      .axis-item {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
      }

      .axis-dot {
        position: absolute;
        left: 50%;
        top: 0;
        transform: translate(-50%, -50%);
        width: toRpx(20);
        height: toRpx(20);
        background: #ffffff;
        border: toRpx(4) solid #347bff;
        box-shadow: 0 toRpx(4) toRpx(16) 0 #7a7a7a33;
        border-radius: 100%;
        box-sizing: border-box;
      }
      .default-axis-dot {
        width: toRpx(36);
        height: toRpx(36);
        border: toRpx(6) solid #347bff;
        z-index: 9;
      }
      .axis-text {
        position: absolute;
        right: toRpx(20);
        font-size: toRpx(24);
        color: #757980;
        display: inline-flex;
        align-items: center;
        height: toRpx(36);
        border-radius: toRpx(16);
        padding: 0 toRpx(22) 0 toRpx(12);
        transform: translateY(-50%);
        white-space: nowrap;
        background: #347bff1a;
        /* 防止文本换行 */
      }
      .axis-active {
        z-index: 4;

        .axis-dot {
          width: toRpx(36);
          height: toRpx(36);
          background: #347bff !important;
          border: none;
          box-shadow: 0 toRpx(4) toRpx(16) 0 #7a7a7a33;
          border-radius: 0 100% 100% 0;

          &::after {
            position: absolute;
            content: '';
            border-radius: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
            width: toRpx(26);
            height: toRpx(26);
          }
        }

        .radius {
          border-radius: 100%;
        }
      }
      .axis-text-active {
        color: #ffffff !important;
        background-color: #347bff !important;
        border-radius: toRpx(16) 0 0 toRpx(16);
        right: toRpx(18);
        z-index: 2;
      }
    }
  }
}
</style>