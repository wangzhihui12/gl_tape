<template>
  <view class="view">
    <template v-if="qualityData.length">
      <view class="classify-wrap">
        <template v-for="(item,index) in qualityData">
          <view
            :class="['classify-item flex',{active: index == activeIndex}]"
            :key="index"
            @click="tabClick(item,index)"
          >
            <view class="title">{{item.tagGroupName}}</view>
            <view class="score">{{item.formatScore}}</view>
          </view>
        </template>
      </view>
      <scroll-view
        class="scroll-view"
        enhanced
        scroll-y
        scroll-with-animation
        :scroll-into-view="activeId"
      >
        <template v-if="qualityData[activeIndex]">
          <view class="quality-block">
            <view class="title flex">
              {{qualityData[activeIndex].tagGroupName}}
              <view :class="['matched-btn flex', qualityData[activeIndex].matchedClass]">{{qualityData[activeIndex].matchedText}}</view>
            </view>
            <template v-for="(item,index) in qualityData[activeIndex].conversationDetailDTOList">
              <block :key="index">
                <view
                  v-if="item.text_id"
                  :id="item.text_id"
                  :class="['quality-item flex',{active:item.text_id == activeId}]"
                  @click="seekPlay(item)"
                >
                  <view class="avatar-box">
                    <view :class="['sprite-icon',`icon-role-${item.role}`]"></view>
                    <view class="time">{{item.time}}</view>
                  </view>
                  <view class="text flex">{{item.content}}</view>
                </view>

                <template v-if="item.scriptRec">
                  <view class="script-rec">
                    <view class="suggestions-box">
                      <view class="suggestions-title">
                        <view class="sprite-icon icon-suggestions-icon"></view>
                        话术推荐
                      </view>
                      <view class="text">
                        <rich-text :nodes="item.scriptRec"></rich-text>
                      </view>
                    </view>
                  </view>
                </template>
              </block>
            </template>
          </view>
        </template>
      </scroll-view>
    </template>
    <template v-else>
      <view class="nothing flex">
        <view class="sprite-icon icon-quality-no-data"></view>
        分析中，稍等...
      </view>
    </template>
  </view>
</template>

<script type='text/ecmascript-6'>
export default {
  name: '',
  props: {
    qualityData: {
      type: Array,
      default: () => []
    },
    qualityAudio: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    disabledText: String
  },
  data () {
    return {
      activeIndex: 0,
      activeId: ''
    }
  },
  mounted () {
  },
  methods: {
    onTimeUpdate () {
      const {
        mergedOffset
      } = this.setProgress()
      this.activeId = `text_${mergedOffset}`
    },
    setProgress () {
      const {
        currentTime
      } = this.qualityAudio,
        mergedOffset = Math.ceil(currentTime)
      return {
        currentTime,
        mergedOffset
      }
    },
    seekPlay (item) {
      let { activeId } = this
      this.$emit('seek', item.mergedOffset)
      if (item.text_id == activeId) {
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
    tabClick (item, index) {
      if (this.activeIndex == index) return
      if (this.disabled && this.disabledText) return uni.showToast({
        title: this.disabledText,
        icon: 'none',
        mask: true,
        duration: 2e3
      })
      this.activeIndex = index
      this.$emit('tabClick', item)
    }
  }
}
</script>

<style scoped lang='scss'>
.view {
  height: 100%;
  width: 100%;
  position: relative;
  .classify-wrap {
    width: 100%;
    height: toRpx(112);
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;

    .classify-item {
      min-width: toRpx(160);
      height: 100%;
      padding: 0 toRpx(24);
      flex-shrink: 0;
      justify-content: center;
      flex-direction: column;
      line-height: toRpx(40);
      font-size: toRpx(28);
      transition: all 0.15s;
      background: #f5f9ff;
      .title {
        color: #757980;
      }
      .score {
        color: #347bff;
        font-weight: 600;
      }
    }
    .active {
      border-radius: toRpx(16) toRpx(16) 0 0;
      background: #ffffff;
      .title {
        color: #292d33;
        font-weight: 600;
      }
    }
  }
  .scroll-view {
    height: calc(100% - #{toRpx(112)});
  }
  .quality-block {
    .title {
      height: toRpx(80);
      background: linear-gradient(119.9deg, #e1f7fc 0%, #f3f7ff 27%, #f7f2ff 41%, #e8f1ff 66%, #f7f2ff 100%);
      font-size: toRpx(28);
      font-weight: 600;
      padding: 0 toRpx(20);
      &::before {
        content: '';
        width: toRpx(8);
        height: toRpx(8);
        background: #000000;
        border-radius: 100%;
        display: block;
        margin-right: toRpx(16);
      }

      .matched-btn {
        margin-left: auto;
        height: toRpx(56);
        border-radius: toRpx(28);
        background: #ffffff;
        padding: 0 toRpx(36);
        color: #eb4e4e;
        font-size: toRpx(24);
        font-weight: 600;
      }
      .hit {
        color: #35c376;
      }
    }
    .quality-item {
      padding: toRpx(20) toRpx(24);
      background: #fff;
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
    .script-rec {
      padding: toRpx(24);
      .suggestions-box {
        background: #ffffff;
        border-radius: toRpx(16);
        padding: toRpx(24) toRpx(28);
        box-sizing: border-box;

        .suggestions-title {
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
    }
    .active {
      background: #f0f6ff;
      .text {
        font-weight: 500;
      }
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
}
</style>