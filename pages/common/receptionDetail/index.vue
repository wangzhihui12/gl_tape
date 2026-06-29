<template>
  <view class="reception-box">
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
      接待详情
    </view>
    <template v-if="pageData.customerName">
      <view class="reception-content-box flex">
        <view class="reception-left-box">
          <view class="customer-info">
            <view class="name flex">
              <view class="name-text text-hide">
                {{pageData.customerName}}
              </view>
              <view class="phone">{{desensitizePhoneNumber(pageData.phoneNumber)}}</view>
            </view>
            <view class="brand-box flex">
              <view
                class="brand flex"
                v-if="pageData.carBrand"
              >{{pageData.carBrand}}</view>
              <view class="brand flex">{{pageData.carModel}}</view>
            </view>
            <view class="tips flex">
              <template v-if="sceneType == 1">
                <view :class="['tips-text',{deal:pageData.orderFinishFlag}]">
                  {{pageData.orderFinishFlag? '成交': '战败'}}
                </view>
                <view
                  class="score-box"
                  v-if="pageData.score != null"
                >
                  {{pageData.score}}<view class="unit">分</view>
                </view>
              </template>
              <template v-else>
                <template v-if="pageData.indeterminate">
                  <view class="tips-text indeterminate">
                    待定
                  </view>
                </template>
                <template v-else>
                  <view :class="['tips-text',{deal:pageData.orderFinishFlag}]">
                    {{pageData.orderFinishFlag? '成交': '战败'}}
                  </view>
                  <view
                    class="score-box"
                    v-if="pageData.score != null"
                  >
                    {{formatReceptionScore(pageData)}}
                  </view>
                </template>
              </template>
            </view>

          </view>
          <view class="content-box">
            <view class="content-tab-box flex">
              <template v-for="i in tab">
                <view
                  :key="i.id"
                  :class="['tab flex',{'active-tab': tabId == i.id}]"
                  @click="tabId = i.id"
                >
                  {{i.name}}
                </view>
              </template>
            </view>
            <view class="control-box flex">
              <view
                class="sprite-icon icon-reception-share"
                @click="share"
              ></view>
              <template v-if="showPlayControl">
                <view
                  class="play-box flex"
                  @click="onHandle"
                >
                  <view :class="['sprite-icon', `icon-reception-${status=='pause'||status=='ending' ? 'play' :'pause'}`]"></view>
                  {{currentTime}}
                </view>
              </template>
            </view>
            <view class="component-box">
              <!-- <dialogue
                :class="['component-item',{hide:  tabId != 1}]"
                :batchId="pageData.batchId"
                :qualityData="qualityData"
                :totalDuration="pageData.totalDuration"
                ref="dialogueRef"
                :qualityAudio="qualityAudio"
                @seek="seek"
                @onPlay="onPlay"
                @onPause="onPause"
                @changeOperate="isOperate = $event"
              /> -->
              <quality
                :qualityData="qualityData"
                :class="['component-item',{hide:  tabId != 2}]"
                ref="qualityRef"
                :qualityAudio="qualityAudio"
                @seek="seek"
                @onPlay="onPlay"
                @onPause="onPause"
                @changeOperate="isOperate = $event"
                @tabClick="tabClick"
                :disabled="isResponding || isRecording"
                :disabledText="disabledText"
              />
            </view>
          </view>
        </view>
        <view class="reception-right-box">
          <view
            class="AI-window"
            v-if="AIUrl"
          >
            <view class="AI-title flex">AI导师</view>
            <web-view
              :src="AIUrl"
              @message="handlerMessage"
            ></web-view>
          </view>
          <template v-else>
            <view class="nothing flex">
              <view class="sprite-icon icon-quality-no-data"></view>
              分析中，稍等...
            </view>
          </template>
          <!-- <template v-if="qualityData.length">
            <tags :batchId="pageData.batchId" />
            <quality-table :qualityData="qualityData" />
          </template>-->
        </view>
      </view>
    </template>

  </view>
</template>

<script type="text/ecmascript-6">
import Dialogue from './components/Dialogue.vue'
import Quality from './components/Quality.vue'
import Tags from './components/Tags.vue'
import QualityTable from './components/QualityTable.vue'
import dayjs from 'dayjs'
export default {
  components: {
    QualityTable,
    Dialogue,
    Quality,
    Tags
  },
  mixins: [],
  data () {
    return {
      tab: Object.freeze([
        // {
        //   id: 1,
        //   name: '对话',
        //   componentName: 'dialogue'
        // },
        {
          id: 2,
          name: '质检',
          componentName: 'quality'
        }
      ]),
      tabId: 2,
      qualityData: [],
      pageData: {},
      qualityAudio: {},
      currentTime: '00:00',
      status: 'pause',
      isOperate: true,
      showPlayControl: false,
      AIUrl: '',
      wv: null,
      disabledText: '',
      isResponding: true,
      isRecording: true,

    }
  },
  onLoad () {
    let _this = this
    this.getOpenerEventChannel().on('getData', function (data) {
      data.totalDuration = (data.receptionEndTime - data.receptionStartTime) / 1000
      _this.pageData = data || {}
      if (!data.orderFinishFlag && dayjs(data.receptionEndTime).isSame(dayjs(), 'day')) data.indeterminate = true
      if (data.batchId) _this.findCheckResultByBatchId(data.batchId)
      _this.setAudio(data.recordingUrl)
    })
  },
  onHide () {
    this.qualityAudio.stop()
  },
  onUnload () {
    this.qualityAudio.stop()
  },
  computed: {
    // dialogueRef () {
    //   return this.$refs.dialogueRef
    // },
    qualityRef () {
      return this.$refs.qualityRef
    },
    sceneType () {
      const { sceneType } = uni.$storage.get('userInfo')
      return sceneType
    }
  },
  onBackPress (options) {
    if (options.from === 'backbutton') {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.back()
      return true
    }
    // 其他情况允许正常返回
    return false
  },
  methods: {
    onHandle (e) {
      let {
        isOperate
      } = this;
      if (isOperate) {
        this.onPlay()
      } else {
        this.onPause()
      }
      this.isOperate = !this.isOperate
    },
    //音频暂停
    onPause () {
      const {
        tabId
      } = this
      // this.dialogueRef.isPlayIng = false
      this.qualityAudio.pause()
    },
    //播放
    onPlay () {
      if (!this.showPlayControl) {
        return uni.showToast({
          title: '音频暂不能播放，稍等...',
          icon: 'none'
        })
      }
      const {
        paused
      } = this.qualityAudio
      if (paused) this.qualityAudio.play()
    },
    setAudio (recordingUrl) {
      this.qualityAudio = uni.createInnerAudioContext()
      this.qualityAudio.src = recordingUrl
      this.qualityAudio.onPause(() => {
        this.status = 'pause'
      })
      //监听音频的播放事件
      this.qualityAudio.onPlay(() => {
        this.status = 'play'
      })
      this.qualityAudio.onCanplay(() => {
        this.showPlayControl = true
      })
      this.qualityAudio.onTimeUpdate(this.onTimeUpdate)
      this.qualityAudio.onEnded(() => {
        this.status = 'ending'
        this.currentTime = this.formatTime(this.qualityAudio.duration)
        // this.dialogueRef.isPlayIng = false
        this.isOperate = true
      })
    },
    onTimeUpdate () {
      const {
        tabId
      } = this
      this.currentTime = this.formatTime(this.qualityAudio.currentTime)
      // this.dialogueRef?.onTimeUpdate()
      this.qualityRef?.onTimeUpdate()
    },
    formatTime (num) {
      num = Math.round(num)
      let minutes = Math.floor(num / 60) || '0',
        seconds = num % 60 || '0'
      seconds = seconds < 10 ? `0${seconds}` : seconds
      minutes = minutes < 10 ? `0${minutes}` : minutes
      return `${minutes}:${seconds}`
    },
    //跳转到指定位置
    seek (time) {
      this.qualityAudio.seek(time)
    },
    back () {
      uni.$emit('refreshRecord')
      if (this.qualityAudio) this.qualityAudio?.pause()
      uni.navigateBack()
    },
    async findCheckResultByBatchId (batchId) {
      const res = await uni.$api.receptionApi.findCheckResultByBatchId({
        batchId
      })
      res.map(item => {
        item.formatScore = `${item.score || item.score === 0 ? item.score : '-'}/${item.sumScore || item.sumScore === 0 ? item.sumScore : '-'}`
        let hitTextList = JSON.parse(item.hitText),
          matchedClass = 'no-hit',
          matchedText = '意图不匹配'
        if (hitTextList && hitTextList.length) {
          item.hitTextList = hitTextList.map(e => e.replace(/\n/g, '<br>'))
          matchedClass = 'hit'
          matchedText = '意图匹配'
        }
        item.matchedClass = matchedClass
        item.matchedText = matchedText
        let [scriptRec] = JSON.parse(item.scriptRec)
        if (scriptRec) scriptRec = scriptRec.replace(/\n/g, '<br>')
        if (item.conversationDetailDTOList && item.conversationDetailDTOList.length) {
          item.conversationDetailDTOList.map(e => {
            e.time = this.formatTime(e.mergedOffset)
            e.text_id = `text_${e.mergedOffset}`
            if (e.mergedOffset == item.offset && !item.matched) {
              e.scriptRec = scriptRec
              item.matched = true
            }
          })
          if (item.conversationDetailDTOList.findIndex(e => e.scriptRec) == -1) {
            /**时间戳都对不上时 话术推荐加到最后 */
            item.conversationDetailDTOList[item.conversationDetailDTOList.length - 1].scriptRec = scriptRec
          }
        } else item.conversationDetailDTOList = [{
          scriptRec: scriptRec || '暂无话术推荐'
        }]
      })
      this.qualityData = res
      this.getAiagent(res[0])
    },
    desensitizePhoneNumber (phoneNumber) {
      return phoneNumber.replace(phoneNumber.slice(3, 7), '****')
    },
    async share () {
      try {
        const {
          merchantName,
          receptionStartTime,
          receptionEndTime,
          duration,
          merchantId,
          batchId,
          receptionStatus
        } = this.pageData,
          receptionStatusText = {
            1: '成交',
            2: '战败',
            3: '未知'
          }[receptionStatus]

        // 获取短链地址
        const url = await uni.$api.receptionApi.getShortUrl({
          merchantNo: merchantId,
          batchId,
          receptionStartTime: receptionStartTime
        })
        if (url) {
          // 门店 - 接待开始时间 - 接待时长 - 员工标记的接待结果 - 接待录音mp3地址（更换成短链）
          let text = [
            merchantName,
            dayjs(receptionStartTime).format("YYYY年MM月DD日 HH:mm:ss"),
            dayjs(receptionEndTime).format("YYYY年MM月DD日 HH:mm:ss"),
            duration,
            receptionStatusText,
            url
          ].join(' - ')
          uni.setClipboardData({
            data: text,
          })
        } else uni.showToast({
          title: "获取短链失败",
          icon: "none",
        })
      } catch (error) {
        uni.showToast({
          title: error,
          icon: "none",
        })
      }
    },
    async getAiagent (item) {
      if (item) {
        uni.showLoading({
          mask: true
        })
        const { phone } = uni.$storage.get('userInfo'),
          [data] = await uni.$api.sceneMarketApi.getAiagent({
            ownerShipType: 1,
            accountPhone: phone,
            agentCode: 'AI7'
          })
        if (data) {
          const { sceneType, uuid, phone, channelType = 1 } = uni.$storage.get('userInfo'),
            bussinessType = sceneType == 0 ? 1 : 2,// sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
            brand = {
              1: '问界',
              2: '比亚迪',
              3: '其他'
            }[channelType],
            { modelType } = this.pageData
          let title = ''
          if (item.sumScore > item.score) title = item.tagGroupName
          let { agentUrl, domainName, taskStatus } = data
          // agentUrl = 'https://scrm.dev.glsx.com.cn/dj-scrm-wx-work-main-zhangls/chat/0piVRFb1xn6OBTcv'
          let url = `${agentUrl}?no_header=1&businessType=${bussinessType}&one_id=${uuid}&platformType=1&domain=${domainName}&presuppositionProblem=${title}&brandType=${modelType || 1001}`
          url += `&phone=${phone}&brand=${brand}&date=${dayjs().format('YYYY-MM-DD')}`
          if (taskStatus) url += `&practice_status=${taskStatus}`
          this.AIUrl = url
          this.setWebviewStyle()
        } else uni.showToast({
          title: '获取智能体失败',
          icon: 'error'
        })
      }

    },
    setWebviewStyle () {
      //修改UA为PC端
      const setWebviewStyleWithRetry = () => {
        const currentWebview = this.$scope.$getAppWebview()
        const [wv] = currentWebview.children()
        if (wv) {
          this.wv = wv
          wv.setStyle({
            left: '40.85%',
            top: '16.65%',
            height: '78.17%',
            width: '56.52%'
          });
          // wv.setCssText( '.chat-panel-bg{background:#f5f9ff !important;}' )
          return true; // 成功设置样式
        } else {
          return false; // 未找到wv
        }
      };

      const retrySetWebviewStyle = () => {
        if (!setWebviewStyleWithRetry()) {
          // 如果未成功，继续重试
          setTimeout(retrySetWebviewStyle, 50);
        } else {
          // 成功设置样式，结束循环
          console.log('Webview样式设置成功');
        }
      };

      setTimeout(retrySetWebviewStyle, 100);
    },
    tabClick (item) {
      if (this.wv) {
        let message = item.sumScore > item.score ? item.tagGroupName : ''
        this.wv.evalJS(`sendMessage({type:'reset_chat',payload:{message:'${message}'}})`)
      }
    },
    handlerMessage ({ detail }) {
      uni.hideLoading()
      let [data] = detail.data
      if (typeof data.isResponding == 'boolean') this.isResponding = data.isResponding
      if (typeof data.isRecording == 'boolean') this.isRecording = data.isRecording
      if (data.isResponding || data.isRecording) {
        this.disabledText = data.isResponding ? '请等待内容生成后再切换其他质检点' : '请等待录音结束后再切换其他质检点'
      }
    },
    formatReceptionScore (pageData) {
      const { orderFinishFlag, score } = pageData;
      if (score >= 85 && orderFinishFlag) return 'A+';
      if (score >= 60 && score < 85 && orderFinishFlag) return 'A';
      if (score < 60 && orderFinishFlag) return 'B';
      if (score >= 85 && !orderFinishFlag) return 'B+';
      if (score >= 60 && score < 85 && !orderFinishFlag) return 'B';
      if (score < 60 && !orderFinishFlag) return 'C';
      return '-';
    },
    orderFinishText ({ orderFinishFlag, receptionEndTime }) {
      return orderFinishFlag ? '成交' : '战败'
    }
  }
}
</script>

<style scoped lang="scss">
.reception-box {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(180deg, #ebf2ff 0%, #f1f6ff 100%);
  box-sizing: border-box;
  padding-top: toRpx(160);
  overflow: hidden;
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
  .reception-content-box {
    padding: 0 toRpx(64) toRpx(64);
    box-sizing: border-box;
    height: 100%;
    .reception-left-box {
      width: calc(100% - #{toRpx(1326)});
      height: 100%;
      box-sizing: border-box;
      padding-right: toRpx(32);
      .customer-info {
        width: 100%;
        height: toRpx(156);
        border-radius: toRpx(24);
        background: linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%);
        backdrop-filter: blur(toRpx(16));
        box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
        box-sizing: border-box;
        padding: toRpx(32) toRpx(32) 0;
        position: relative;
        .name {
          color: #333333;
          font-size: toRpx(36);
          font-weight: 500;
          line-height: toRpx(44);
          .phone {
            color: #79859e;
            font-size: toRpx(26);
            font-weight: normal;
            margin-left: toRpx(16);
            flex-shrink: 0;
          }
        }
        .brand-box {
          margin-top: toRpx(18);
          gap: toRpx(12);
          .brand {
            height: toRpx(32);
            border-radius: toRpx(4);
            border: toRpx(2) solid #e8ecf0;
            padding: 0 toRpx(8);
            color: #79859e;
            font-size: toRpx(22);
          }
        }
        .tips {
          position: absolute;
          right: toRpx(32);
          bottom: toRpx(28);
          line-height: toRpx(40);
          .tips-text {
            color: #f24724;
            font-size: toRpx(32);
          }
          .deal {
            color: #2cca74;
          }
          .indeterminate {
            color: #999ea8;
            
          }
          &-box {
            opacity: 0.85;
            color: #2cca74;
            font-size: toRpx(32);
          }
          .score-box {
            opacity: 0.85;
            color: #292d33;
            font-size: toRpx(48);
            font-weight: 700;
            line-height: toRpx(44);
            margin-left: toRpx(16);
            padding-left: toRpx(16);
            position: relative;
            display: flex;
            align-items: baseline;
            &::before {
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              content: '';
              width: toRpx(2);
              height: toRpx(14);
              background: #979797;
            }
            .unit {
              font-size: toRpx(24);
              font-weight: 400;
              margin-left: toRpx(4);
            }
          }
        }
      }
      .content-box {
        width: 100%;
        height: calc(100% - #{toRpx(192)});
        margin-top: toRpx(36);
        border-radius: toRpx(32);
        background: #ffffff33;
        backdrop-filter: blur(toRpx(16));
        box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
        position: relative;
        .control-box {
          position: absolute;
          right: toRpx(32);
          top: toRpx(28);
          .play-box {
            height: toRpx(60);
            border-radius: toRpx(28);
            border: toRpx(2) solid #f0f6ff;
            background: #ffffff;
            margin-left: toRpx(8);
            padding: 0 toRpx(12) 0 toRpx(4);
            color: #757980;
            font-size: toRpx(26);
            .sprite-icon {
              margin-right: toRpx(4);
            }
          }
        }
        .content-tab-box {
          height: toRpx(112);
          padding: 0 toRpx(32);
          gap: toRpx(24);
          .tab {
            width: toRpx(172);
            height: toRpx(72);
            border-radius: toRpx(16);
            border: toRpx(2) solid #ffffffcc;
            background: #ffffff;
            backdrop-filter: blur(toRpx(12));
            box-sizing: border-box;
            justify-content: center;
            color: #666666;
            font-size: toRpx(30);
            transition: all 0.1s;
          }
          .active-tab {
            background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
            color: #fff;
            font-weight: 500;
          }
        }
        .component-box {
          width: 100%;
          height: calc(100% - #{toRpx(112)});
          position: relative;
          .component-item {
            position: absolute;
            top: 0;
            left: 0;
            transition: all 0.15s;
          }
          .hide {
            opacity: 0;
            z-index: -1;
          }
        }
      }
    }
    .reception-right-box {
      height: 100%;
      width: toRpx(1326);
      border-radius: toRpx(32);
      opacity: 1;
      background: #f5f9ff;
      box-sizing: border-box;
      position: relative;
      .AI-window {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        .AI-title {
          height: toRpx(96);
          font-size: toRpx(36);
          font-weight: 500;
          justify-content: center;
          color: #333333;
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
  }
}
</style>
