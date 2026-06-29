<template>
  <view class="left-side">
    <view class="user-box">
      <view class="user-info flex" @click="jumpPersonCenter">
        <view :class="['user-avatar', 'sprite-icon', 'icon-avatar', tabIndex == 99 ? 'user-active' : '']"></view>
        <view class="user-name">
          <view class="user-name-text">{{ userInfo.name }}</view>
          <view v-if="hasPerson" class="sprite-icon icon-arrow-next"></view>
        </view>
      </view>
    </view>
    <view :class="['left-tabs', { three: tabs.length == 3 }]">
      <template v-for="(i, index) in tabs">
        <view :class="['tab-item', { tabActive: tabIndex == index }]" :key="index" @click="changeIndex(index, i)"
          v-if="!i.hidden && (i.name !== 'ActivityCenter' || activityTabVisible)">
          <view class="icon-box">
            <view :class="['sprite-icon', `icon-${i.icon}${tabIndex == index ? '-active' : ''}`]"></view>
          </view>
          {{ i.label }}
          <view class="dot" v-if="i.icon == 'record' && perRecordNumber"></view>
          <view class="tip-box" v-if="i.icon == 'study' && readCount">待办事项：{{ readCount }}</view>
        </view>
      </template>
    </view>
    <view class="left-footer">
      <!-- <view
        class="btn"
        @click="openPop"
      >
        <view class="sprite-icon icon-feedback"></view>
        <view
          class="message-number"
          v-if="messageTotal > 0"
        ></view>
      </view> -->
      <view class="btn" @click="openScenePopup">
        <view class="sprite-icon icon-scene-change"></view>
      </view>
      <view class="btn" @click="handleSetting">
        <view class="sprite-icon icon-setting"></view>
      </view>
    </view>
    <!-- 客服弹框 -->
    <!-- <kf-box ref="kfRef" /> -->
    <message-pop ref="kfRef" :type="messageType" :messageData="messageData"></message-pop>
    <!-- 设置弹框 -->
    <setting-box ref="settingRef" @stopAudio="$emit('stopAudio')" />
    <center-popup :list="sceneTypeList" ref="sceneTypeRef" @choose="chooseSceneType" title="选择场景" tag="当前场景"
      :id="userInfo.sceneType" isLine />
  </view>
</template>

<script type="text/ecmascript-6">
import KfBox from "./KfBox";
import MessagePop from "./MessagePop"
import SettingBox from "./SettingBox";
import utils from '@/utils/utils'
import CenterPopup from '@/components/CenterPopup.vue'
export default {
  components: { KfBox, SettingBox, MessagePop, CenterPopup },
  props: {
    tabIndex: Number,
    userInfo: Object
  },
  name: '',
  data() {
    return {
      messageData: {
        classCountList: [],
        recordDetailList: [],
        total: 0
      },
      messageTotal: 0,
      readCount: 0,
      // trackId: 0,
      // trackInterval: null,
      collectTrack: false,
      hasPerson: false,
      messageType: 'study',
      sopCount: 0,
      activityTabVisible: true,
      hasPopupOpen: false
    }
  },
  watch: {
    userInfo(n) {
      if (n.shopMerchantId) this.haveCustomerAccess(n)
    },
    activityWindowPopStatus: {
      handler(n) {
        if (n == 1) this.getMessageInfo()
      },
      immediate: true,
      deep: true
    }
    // trackId (n) {
    //   if (!n) {
    //     clearInterval(this.trackInterval)
    //   }
    // }
  },
  computed: {
    perRecordNumber() {
      return this.$store.state.audio.perRecordNumber
    },
    sceneTypeList() {
      const sceneTypeObject = {
        1: {
          title: '轻改',
          describe: '太阳膜升级转化',
          icon: 'icon-scene-1',
          zoom: 1.1669,
        },
        0: {
          title: '会员权益/升级',
          describe: '权益延保',
          icon: 'icon-scene-0',
          zoom: 1.1669,
        },
        7: {
          title: '二手车',
          describe: '二手车业务',
          icon: 'icon-scene-7',
          zoom: 1.1669,

        }
      }
      let { openSceneArr } = uni.$storage.get("userInfo")
      let result = []
      if (openSceneArr && openSceneArr.length) {
        openSceneArr.map(e => {
          if (e == 1 || e == 0 || e == 7) {
            result.push({
              ...sceneTypeObject[e],
              id: e
            })
          }
        })
      }
      return result
    },
    // 这个tabs进来的值更新触发顺序是 getStudyCenterPermission的方法变更 => 计算属性的变更 => userInfo的监听变更 => haveCustomerAccess的变更。   计算属性的变更后的更新值是不会重新触发渲染的
    tabs() {
      const tabs = [
        {
          label: "首页",
          icon: "home",
          name: 'HomeSlot'
        },
        {
          label: "接待中心",
          icon: "record",
          name: 'ReceptionCenter',
          eventCode: 'app_reception_center'
        },
        {
          label: "学习中心",
          icon: "study",
          isTrack: true,
          name: 'StudyCenter',
          eventCode: 'app_study_center',
        },
        {
          label: "场景集市",
          icon: "scene",
          name: 'SceneMarket',
          eventCode: 'app_scene_market'
        },
        {
          label: "活动中心",
          icon: "activity",
          isTrack: true,
          name: 'ActivityCenter',
          eventCode: 'app_activeity_center',
          hidden: false
        }
      ]
      let { sceneType } = uni.$storage.get("userInfo")
      if (sceneType == 7) tabs[1].hidden = true
      return tabs
    },
    activityWindowPopStatus() {
      return this.$store.state.sys.activityWindowPopStatus
    },
  },
  created() {

    uni.$on('ActivityCenter', this.handleActivityCenter);
    // uni.$on('ActivityCenter', () => {
    //   let { tabs } = this,
    //   index = tabs.findIndex(e => e.name == 'ActivityCenter')
    //   this.changeIndex(index, this.tabs[index])
    // })
    // 监听学习任务弹窗提醒，长课程
    uni.$on('studyCenter', () => {
      let { tabs } = this,
        index = tabs.findIndex(e => e.name == 'StudyCenter')
      this.changeIndex(index, this.tabs[index])
    });
    //获取北森代办数量
    this.getUnreadCount()
    // 学习中心权限获取，场景集市权限
    this.getStudyCenterPermission()
    // 获取消息弹窗
    this.getMessageInfo()
    // 获取北森权限
    this.findBeiSenSSOToken()
  },
  inject: ['showPage'],
  methods: {
    getUnreadCount() {
      let _this = this
      uni.$api.commonApi.getUnreadCount({}).then(res => {
        this.readCount = res.data
        if (res.data) setTimeout(() => {
          utils.getViewInfo('.tip-box', info => {
            _this.$emit('showReadCountTips', {
              style: `display:block;opacity:1;top: ${info.top}px; left: ${info.left}px;`,
              text: `待办事项：${res.data}`
            })
          })
        }, 1e3)
      })
    },
    // addTrack () {
    //   const { merchantId, merchantName } = uni.$storage.get("userInfo")
    //   const params = {
    //     goodsType: 1,
    //     merchantId,
    //     merchantName
    //   }
    //   uni.$api.commonApi.dynamicrecordAdd(params).then(res => {
    //     this.trackId = res
    //   })
    // },
    // leaveTrack () {
    //   if (!this.trackId) return
    //   uni.$api.commonApi.dynamicrecordLeave({ id: this.trackId }).then(res => {
    //   })
    // },
    // startTrack () {
    //   if (this.trackInterval) clearInterval(this.trackInterval)
    //   this.trackInterval = setInterval(() => {
    //     this.leaveTrack()
    //   }, 5000)
    // },
    clickHome() {
      if (this.tabs[this.tabIndex].isTrack)
        this.changeIndex(0, this.tabs[0])
    },
    handleSetting() {
      this.$refs.settingRef.open()
      this.clickHome()
    },
    findBeiSenSSOToken() {
      return new Promise(resolve => {
        const url = 'https%3A%2F%2Fcloud.italent.cn%2FPageHome%2FIndex%3Fproduct%3DLearning%26keyName%3DNusion%26pageCode%3DLearningNewHomepage%26appCode%3DLearning%26_qsrcapp%3DLearning%26_qrt%3Dhtml%26quark_s%3D5102bff371c00da5b19968ee53a8c3f1499ecd2447a19f72f3e3ba2390cc9617%23%2FviewDynamic%3Fshadow_context%3D%257BappModel%253A%2522italent%2522%252Cuppid%253A%25221%2522%257D%26quark_s%3D028930f1066f8ef8d28790940d53ae64337f44bde3a44cf89a290e4a3611e3e2'
        uni.$api.commonApi.findBeiSenSSOToken({}).then(res => {
          uni.$storage.set('beisenToken', res.data)
          const studyUrl = res.data ? `${res.data}&return_url=${url}` : ''
          resolve(studyUrl)
        })
      })
    },
    handleActivityCenter() {
      let { tabs } = this;
      let index = tabs.findIndex(e => e.name == 'ActivityCenter');
      if (index !== -1) {
        this.changeIndex(index, this.tabs[index]);
      }
    },
    async changeIndex(index, item) {
      if (item.eventCode) uni.$track.add({
        eventCode: item.eventCode
      })
      // if (this.tabIndex == index) return;
      // 点击学习中心要跳从北森回后台配置的学习中心，学习中心为3
      if (this.tabIndex == index && !item.isTrack) return;
      // let jumpUrl
      if (item.isTrack) {
        this.$emit('closeTips')
      }
      this.$emit('update:tabIndex', index)
      this.$emit("changeTab", {
        item,
        index
      })
      this.getMessageInfo()
      if (item.name == 'StudyCenter') {
        this.findBeiSenSSOToken()
      }
    },
    async haveCustomerAccess(val) {
      const { shopMerchantId, sceneType: scene } = val
      uni.$api.customerApi.saleOpen({
        merchantId: shopMerchantId,
        scene
      }).then(result => {
        if (result) {
          this.hasPerson = true
          // this.activityTabVisible = scene !== 7
          //  this.tabs[this.tabs.length-1].hidden = scene !== 7
          // this.$nextTick(() => {
          //   const activityTabIcon = document.querySelector('.sprite-icon.icon-activity')
          //   if (activityTabIcon) {
          //     const activityTab = activityTabIcon.closest('.tab-item')
          //     if (activityTab) {
          //       if (scene === 7) {
          //         activityTab.style.display = 'none'
          //       } else {
          //         activityTab.style.display = 'block'
          //       }
          //     }
          //   }
          // })
          this.activityTabVisible = scene !== 7;
        } else {
          //  this.tabs[this.tabs.length-1].hidden = false
          // this.activityTabVisible = false
          // this.$nextTick(() => {
          //   const activityTabIcon = document.querySelector('.sprite-icon.icon-activity')
          //   if (activityTabIcon) {
          //     const activityTab = activityTabIcon.closest('.tab-item')
          //     if (activityTab) {
          //       activityTab.style.display = 'none'
          //     }
          //   }
          // })
          this.activityTabVisible = false;
        }
      })
    },
    // 获取话术未读列表
    async getMessage() {
      const { sceneType, uuid } = uni.$storage.get("userInfo")
      let businessTypeList = []
      if (sceneType == 0) {
        businessTypeList = [0, 2]
      } else if (sceneType == 1) {
        businessTypeList = [1]
      } else businessTypeList = [4]
      const res = await uni.$api.commonApi.getUnreadRecord({
        // businessType: sceneType,
        businessTypeList,
        uuid
      })
      if (res.total) {
        this.messageData = res
        this.messageType = 'attendance'
        this.openPopup()
      }
      return Promise.resolve(res.total)
    },
    // 弹窗推送优先级：1）学习策略/长课程推送 2）优秀案例分享 3）优秀话术推送 4）任务通知（企业通知） 5）活动中心
    async getMessagePop() {
      this.hasPopupOpen = false
      const pages = getCurrentPages(),
        currentPage = pages[pages.length - 1]
      if (!['pages/equity/index', 'pages/boutique/index'].includes(currentPage.route)) return this.$store.dispatch('setActivityWindowPopCount', 0)
      const { sceneType } = uni.$storage.get("userInfo")
      const caseParams = {
        pageNum: 1,
        pageSize: 1,
        businessType: sceneType,
        status: 0,
        createdTimeSortType: 0
      }
      // 1. 学习策略弹窗
      caseParams.moduleType = 6
      const studyCaseRes = await uni.$api.commonApi.getBoxPage(caseParams)
      if (studyCaseRes.list.length) {
        this.messageType = 'caseStudy'
        this.messageData = studyCaseRes.list[0]
        this.openPopup()
        return
      }
      // 2. 长课程推送
      const longCourseRes = await uni.$api.commonApi.getLongCourseNotify()
      if (longCourseRes.count > 0) {
        this.messageType = 'study'
        this.messageData = longCourseRes
        this.openPopup()
        // 确认消息
        if (longCourseRes.ids.length) {
          uni.$api.commonApi.getStudyTaskConfirm({
            ids: longCourseRes.ids[0]
          })
        }
        return
      }
      // 3. 优秀案例分享
      caseParams.moduleType = 7
      const caseRes = await uni.$api.commonApi.getBoxPage(caseParams)
      if (caseRes.list.length) {
        this.messageType = 'caseShare'
        this.messageData = caseRes.list[0]
        this.openPopup()
        return
      }
      // 4. 优秀话术推送
      const data = await this.getMessage()
      if (data) return

      // 5. 企业通知推送
      const enterpriseRes = await uni.$api.commonApi.getEnterpriseNotify()
      if (enterpriseRes.ids || enterpriseRes.businessIds) {
        this.messageType = 'system'
        this.messageData = enterpriseRes
        this.openPopup()
        return
      }
      // 6. 活动中心弹窗
      if (this.activityWindowPopStatus == 1) this.$store.dispatch('setActivityWindowPopCount', 2)
    },
    openPopup() {
      this.$refs.kfRef.open()
      this.hasPopupOpen = true
      this.$store.dispatch('setActivityWindowPopCount', 0)
      this.$emit('closeActivityCenter')
    },
    openPop() {
      uni.navigateTo({
        url: `/pages/common/messageList`
      })
    },
    getMessageInfo() {
      this.getMessagePop()
    },
    jumpPersonCenter() {
      if (this.hasPerson) {
        uni.$track.add({
          eventCode: 'app_personal_center'
        })
        this.clickHome()
        this.$emit('update:tabIndex', 99)
      }
    },
    chooseSceneType(index) {
      let { userInfo, sceneTypeList } = this,
        sceneType = sceneTypeList[index].id
      if (sceneType == userInfo.sceneType) return
      userInfo.sceneType = sceneType
      uni.showLoading({
        title: '切换中',
        mask: true
      })
      uni.$storage.set('userInfo', userInfo)
      let url = {
        1: '/pages/boutique/index',
        0: '/pages/equity/index',
        7: '/pages/usedCar/index'
      }[userInfo.sceneType]
      uni.reLaunch({
        url
      })
    },
    openScenePopup() {
      this.$refs.sceneTypeRef.open()
      uni.$track.add({
        eventCode: 'app_scene_change'
      })
    },
    // 学习中心权限获取，场景集市权限
    getStudyCenterPermission() {
      const userInfo = uni.$storage.get('userInfo')
      const res = uni.$storage.get('studyCenterPermission')
      if (!res) {
        uni.$api.commonApi.getStudyCenterPermission({}).then(res => {
          uni.$storage.set('studyCenterPermission', res)
        })
      }
      if (userInfo.sceneType == 7) {
        this.tabs[2].hidden = true
      }
      if (userInfo.subLoginUser.channelType == 9) {
        this.tabs[2].hidden = true
        this.tabs[3].hidden = true
        return
      }
    }
  },
  beforeCreate() {
    // clearInterval(this.trackInterval)
    // this.trackInterval = null
  },
  beforeDestroy() {
    // uni.$off('pageBack')
    // uni.$off('studyCenter')
    uni.$off('ActivityCenter', this.handleActivityCenter);
    // clearInterval(this.trackInterval)
    // this.trackInterval = null
  },
}
</script>

<style scoped lang="scss">
.left-side {
  display: flex;
  flex-direction: column;
  position: relative;
  width: toRpx(240);
  flex-shrink: 0;
  background-image: url('@/assets/images/home/left-bg.png');
  background-size: 100% 100%;

  .left-tabs {
    width: 100%;
    height: toRpx(1080);
    display: flex;
    flex-direction: column;
    justify-content: center;
    // align-items: center;
    box-sizing: border-box;
    padding: toRpx(16) 0;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    margin: auto;
    box-sizing: border-box;
    padding-left: toRpx(32);

    // &::after {
    //   position: absolute;
    //   left: 0;
    //   top: 0;
    //   width: 100%;
    //   height: 100%;
    //   background-image: url('@/assets/images/home/left.webp');
    //   background-size: 100% 100%;
    //   content: '';
    //   z-index: -1;
    // }

    .tab-item {
      width: toRpx(104);
      font-size: toRpx(26);
      color: #8a98b5;
      text-align: center;
      padding-bottom: toRpx(25);
      position: relative;

      .dot {
        width: toRpx(16);
        height: toRpx(16);
        background: #f24724;
        border-radius: 50%;
        position: absolute;
        right: toRpx(20);
        top: toRpx(20);
      }

      .icon-box {
        width: toRpx(104);
        height: toRpx(104);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
      }

      .tip-box {
        position: absolute;
        left: toRpx(90);
        top: toRpx(20);
        color: #ffffff;
        font-size: toRpx(28);
        width: toRpx(310);
        height: toRpx(90);
        line-height: toRpx(64);
        background-image: url('@/assets/images/home/daliog.webp');
        background-size: 100% 100%;
        z-index: 99999;
        padding-left: toRpx(60);
        text-align: left;
        opacity: 0;
      }
    }

    .tabActive {
      color: #3773f8;

      .icon-box {
        animation: arc-move 0.15s forwards;
      }
    }

    @keyframes arc-move {
      from {
        transform: scale(0.1) rotate(0);
      }

      to {
        transform: scale(1) rotate(360deg);
      }
    }
  }

  .three {
    .tab-item {
      padding-bottom: toRpx(64);
    }
  }

  .user-box {
    padding-top: toRpx(92);
  }

  .user-info {
    width: toRpx(184);
    box-sizing: border-box;
    flex-direction: column;
    position: relative;
    z-index: 2;
    text-align: center;

    .account-change {
      width: toRpx(136);
      height: toRpx(32);
      background: #ffffff66;
      border-radius: toRpx(16);
      font-size: toRpx(20);
      color: #9e9e9e;
      justify-content: center;
      margin-top: toRpx(10);
    }
  }

  .user-avatar {
    width: toRpx(100);
    height: toRpx(100);
    border: toRpx(2) solid #ffffff;
    box-shadow: 0 toRpx(4) toRpx(8) 0 #0000001a;
    border-radius: 100%;

    &.user-active {
      border: toRpx(2) solid rgb(55, 115, 248);
    }
  }

  .user-name {
    display: inline-flex;
    align-items: center;
    font-weight: 500;
    font-size: toRpx(28);
    color: #292d33;
    margin-top: toRpx(16);
    padding: 0 toRpx(12);

    &-text {
      width: toRpx(112);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .user-position {
    font-size: toRpx(20);
    color: #9b9b9e;
    margin-top: toRpx(8);
  }

  .left-footer {
    margin-top: auto;
    padding: 0 0 toRpx(80) 0;
  }

  .btn {
    position: relative;
    display: flex;
    align-items: center;
    margin: toRpx(48) auto 0;
    box-sizing: border-box;
    padding-left: toRpx(60);

    .icon-scene-change {
      zoom: 2;
    }

    .message-number {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: toRpx(16);
      height: toRpx(16);
      background-color: #f24724;
      right: 50%;
      top: 0;
      color: #fff;
      border-radius: 50%;
      font-size: toRpx(20);
    }
  }
}
</style>
