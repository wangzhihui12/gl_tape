<template>
  <view class="container" @click="handleTouchStart">
    <view :class="['home', { show: !id && showHome }]">
      <left-side :userInfo="userInfo" :tabIndex.sync="tabIndex" ref="leftBox" @changeTab="changeTab"
        @stopAudio="stopAudio" @showReadCountTips="showReadCountTips" @closeTips="closeTips"
        @closeActivityCenter="closeActivityCenter" />
      <view class="tips-box" :style="tipsObject.style" @click.stop="closeTips">{{ tipsObject.text }}</view>
      <view class="right-side">
        <view :class="['app-content-box right-content', { 'show-content-box': tabIndex == 0 }]">
          <view class="start" @click="start">
            <template v-if="sceneType != 7">
              <view class="sprite-icon icon-start-text"></view>
            </template>
          </view>
          <view class="right-content-box flex">
            <view class="content-left">
              <view class="module-box box-class">
                <view class="common-title">产品介绍</view>
                <view class="content-box">
                  <template v-if="swiperCustom">
                    <slot name="swiperCustom" />
                  </template>
                  <template v-else>
                    <swiper-component :moduleList="moduleList" @click="swiperClick" :stopAutoPlay="previewOff"
                      :imgKey="bannerKey" :loadComplete="loadComplete"
                      :noDataObject="swiperNoDataObject"></swiper-component>
                  </template>
                </view>
              </view>
              <view class="tool-box box-class">
                <view class="common-title">展业工具</view>
                <view class="content-box">
                  <Entrance @entranceClick="entranceClick"></Entrance>
                </view>
              </view>
            </view>
            <view class="content-right box-class">
              <view class="common-title">服务中心</view>
              <view class="content-box">
                <MessageIndex class="message-box" ref="messageRef" />
              </view>
            </view>
          </view>
        </view>
        <view :class="['app-content-box right-content', { 'show-content-box': tabIndex == 99 }]">
          <component :is="'Point'" ref="pointRef" :userInfo="userInfo" @showPage="handleShowPage" />
        </view>
        <template v-if="tabIndex != 0 && tabIndex != 99">
          <component :is="componentName" ref="pointRef" :userInfo="userInfo" @showPage="handleShowPage"
            :isPermissionFunction="isPermission" />
        </template>
      </view>
      <view class="store-addr" v-if="footerBox">
        <view class="icon-addr sprite-icon icon-addr"></view>
        <view class="addr-text">{{ userInfo.shopMerchantName }}</view>
      </view>
    </view>
    <view :class="['detail', { show: id }]">
      <slot name="detail" />
    </view>
    <view class="point-page" v-if="!showHome">
      <component :is="pointComponentName" @backHome="backHome" @jump="jump" :transfer="transfer" />
    </view>
    <!-- 未点击开始接待，弹窗 -->
    <MessageBox ref="previewRef" @confirm="previewHandler('preview', true)" :popupW="704"
      content="直接点击素材可进行预览，若面向车主展示，请点击「开始接待」" confirmBtnText="预览素材" @cancel="previewHandler('previewCancel')"
      @close="previewHandler('previewClose')"></MessageBox>
    <!-- 停留弹框 -->
    <!-- <MessageBox ref="tipBox" @cancel="tipCancel" @confirm="tipConfirm" content="系统检测到您在当前页面停留较久，是否仍在客户接待中？" cancelBtnText="否" confirmBtnText="是"></MessageBox> -->
    <!-- 退出弹框 -->
    <MessageBox :popupW="704" ref="finish" :content="finishContene" :isFooter="false">
      <view class="footer">
        <view class="footer-btn confirm flex" @click="$emit('openStep')">
          <template v-if="finishDoneText">
            {{ finishDoneText }}
          </template>
          <template v-else>
            完成接待
            <text>(推荐)</text>
          </template>
        </view>
        <view class="footer-btn cancel flex" @click="$emit('backHome')">
          仍要退出
          <text>(不推荐)</text>
        </view>
      </view>
    </MessageBox>
    <!-- 升级弹框 -->
    <update-box />
    <slot name="content" />
    <!-- <web-view
      @message="handlerMessage"
      ref="webview"
      src="/hybrid/html/index.html"
    ></web-view> -->
    <web-view ref="uploaderWebview" src="/hybrid/html/index.html" @message="handleUploadMessageNew"
      :webview-styles="webviewStyles"></web-view>
    <!-- <web-view
      ref="studyWebview"
      :src="jumpUrl"
      v-if="showBeisen"
    ></web-view> -->

    <!-- 学习中心 等级考试弹窗 -->
    <StudyPopup :show.sync="showStudyPopup" title="开始您的学习之旅"
      :topImage="require('@/assets/images/common/study-center-bg.webp')" :topImageWidth="848" :topImageHeight="248">
      <StudyPopupContent cardTitle="个性化学习路径" description="根据您当前的学习情况，我们将为您定制专属的学习计划，帮助您高效提升技能，实现职业突破。"
        :listItems="['基于当前能力水平评估', '结合岗位发展目标制定', '定期跟踪学习进度和效果']" tipText="true" :courseName="courseInfo.title"
        buttonText="开始测评" @cancel="handleStudyPopupCancel" @button-click="handleStartAssessment" />
    </StudyPopup>

    <!-- 考试提交确认弹窗 -->
    <StudyPopup :show.sync="showExamPopup" title="" :width="848" :height="examPopInfo.isExamLoading ? 740 : 656"
      :topImage="require('@/assets/images/common/warning-notice.webp')" :topImageWidth="848" :topImageHeight="248">
      <ExamSubmitPopup :isLoading="examPopInfo.isExamLoading" :showError="examPopInfo.showError"
        :confirmText="examPopInfo.confirmText" @cancel="handleExamCancel" @confirm="handleExamConfirm" />
    </StudyPopup>

    <!-- 学习中心权限弹窗 -->
    <StudyPopup :show.sync="showStudyPermissionPopup" title="" :width="848" :height="870"
      :topImage="require('@/assets/images/common/warning-notice.webp')" :topImageWidth="848" :topImageHeight="248"
      style="overflow: hidden">
      <StudyCenterPermissionPopup :lockReason="lockReason" @confirm="handleStudyPermissionConfirm" />
    </StudyPopup>
    <activity-popup ref="activityPopup" @JumpActivityCenter="JumpActivityCenter"></activity-popup>
    <uni-popup ref="errorRef" type="message">
      <uni-popup-message type="error" :message="errorMsg" :duration="1500"></uni-popup-message>
    </uni-popup>
    <!-- 异常订单锁单 -->
    <ErrorOrderPopup :show.sync="showErrorOrderPopup" title="" :width="848" :height="870"
      :topImage="require('@/assets/images/common/warning-notice.webp')" :topImageWidth="848" :topImageHeight="248"
      style="overflow: hidden">
      <view>
        <view class="error-order-title">异常订单提醒</view>
        <view class="error-order-content">存在{{ abnormalOrderCount }} 条异常订单未处理，请尽快处理！</view>
      </view>
      <template #footer>
        <view class="flex justify-between error-order-footer">
          <!-- <view class="footer-btn cancel" @click="showErrorOrderPopup=false">
          取消
        </view> -->
          <view class="footer-btn sure flex-1" @click="showErrorOrderPopup = false">好的</view>
        </view>
      </template>
    </ErrorOrderPopup>
  </view>
</template>
<script>
import ReceptionCenter from './components/ReceptionCenter/index.vue'
import SceneMarket from './components/SceneMarket/index.vue'
// import myClick from '@/mixin/click'
import timeout from '@/mixin/timeout'
import recorder from '@/mixin/record/recorder'
import uploader from '@/mixin/record/uploader.js'
import versionCheck from '@/mixin/versionCheck.js'
import LeftSide from './components/LeftSide.vue'
import Point from './components/Point.vue'
import dayPoint from './components/Point/DayPoint.vue'
import rulePoint from './components/Point/RulePoint.vue'
import LevelPoint from './components/Point/LevelPoint.vue'
import LevelMedal from './components/Point/LevelMedal.vue'
import Course from './components/Point/Course.vue'
import Ranking from './components/Point/Ranking.vue'
import Calendar from './components/Income/Calendar.vue'
import Promotion from './components/Income/Promotion.vue'
import History from './components/Income/History.vue'
// import merge from '@/mixin/record/merge.js'
import MessageDetail from './components/Message/MessageDetail.vue'
import SwiperComponent from '../SwiperComponent.vue'
import StudyCenter from './components/StudyCenter.vue'
import ActivityCenter from './components/ActivityCenter.vue'
import MessageIndex from './components/Message/index.vue'
import permision from '@/js_sdk/wa-permission/permission.js'
import Entrance from '@/components/Entrance.vue'
import mediaResourceManager from '@/utils/mediaResourceManager/mediaResourceManager'
import { interceptionMixin } from '@/mixin/index'
import StudyPopup from '@/components/StudyPopup.vue'
import StudyPopupContent from '@/components/StudyPopupContent.vue'
import ExamSubmitPopup from '@/components/ExamSubmitPopup.vue'
import StudyCenterPermissionPopup from '@/components/StudyCenterPermissionPopup.vue'
import ActivityPopup from './components/ActivityPopup.vue'
import ErrorOrderPopup from '@/components/ErrorOrderPopup.vue'
import { FileUploadManager, UploadService } from '@/utils/recordManager/index.js'
export default {
  // mixins: [recorder, uploader, timeout, versionCheck, merge, interceptionMixin],
  mixins: [recorder, versionCheck, interceptionMixin],
  components: {
    ReceptionCenter,
    StudyCenter,
    SceneMarket,
    LeftSide,
    Point,
    dayPoint,
    rulePoint,
    Course,
    Ranking,
    LevelPoint,
    Calendar,
    Promotion,
    History,
    LevelMedal,
    MessageDetail,
    SwiperComponent,
    MessageIndex,
    Entrance,
    StudyPopup,
    StudyPopupContent,
    ExamSubmitPopup,
    StudyCenterPermissionPopup,
    ActivityCenter,
    ActivityPopup,
    ErrorOrderPopup
  },
  props: {
    id: [String, Number],
    finishDoneText: String,
    finishContene: {
      type: String,
      default: '当前操作视为强制退出接待，若需正常流程完成接待请点击「完成接待」'
    },
    moduleList: {
      type: Array,
      default: () => []
    },
    bannerKey: String,
    loadComplete: Boolean,
    swiperNoDataObject: Object,
    checkRecordAudio: {
      type: Boolean,
      default: true
    },
    swiperCustom: Boolean
  },
  data() {
    return {
      studyUrl: '',
      jumpUrl: '',
      transfer: '',
      footerBox: true,
      showHome: true,
      pointComponentName: 'Point',
      // userInfo: {},
      tabIndex: 0,
      showBeisen: false,
      tipsObject: {},
      autoplay: true,
      previewOff: false,
      showStudyPopup: false,
      showExamPopup: false,
      examPopInfo: {
        isExamLoading: false,
        showError: false,
        confirmText: '确认已提交'
      },
      showStudyPermissionPopup: false,
      courseInfo: {
        title: ''
      },
      lockReason: 0,
      errorMsg: '',
      showErrorOrderPopup: false,
      abnormalOrderCount: 0,
      webviewStyles: Object.freeze({
        progress: false,
        width: '10px',
        height: '10px',
        position: 'absolute',
        top: '-1000px',
        left: '-1000px'
      })
    }
  },
  beforeDestroy() {
    // 组件销毁前移除监听
    uni.$logger.local.info('levelStudyPopup 移除监听')
    uni.$off('levelStudyPopup')
    uni.$off('pageBack')
  },
  async mounted() {
    uni.$logger.local.info('levelStudyPopup 开始监听mounted')
    uni.$on('levelStudyPopup', obj => {
      uni.$logger.local.info('接收到学习弹窗事件', obj)
      this.showExamPopup = true
    })
    // const userInfo = uni.$storage.get('userInfo') || {}
    // this.userInfo = userInfo
    FileUploadManager.init({
      webviewRef: this.$refs.uploaderWebview,
      vueContext: this
    })
    if (this.checkRecordAudio) permision.requestAndroidPermission('android.permission.RECORD_AUDIO') // 进入界面时检查权限
    // 检查是否锁单
    const { abnormalOrderNum } = await this.getAbnormalOrderLock()
    if (abnormalOrderNum > 0) {
      this.showErrorOrderPopup = true
      this.abnormalOrderCount = abnormalOrderNum
      return
    }
  },
  beforeDestroy() {
    // 清理 FileUploadManager 资源
    FileUploadManager.destroy()
  },
  provide() {
    return {
      showPage: this.handleShowPage,
      hideFooter: this.handleFooter
    }
  },
  computed: {
    previewRef() {
      return this.$refs.previewRef
    },
    finishRef() {
      return this.$refs.finish
    },
    componentName() {
      let tabs = this.$refs.leftBox?.tabs
      return tabs ? tabs[this.tabIndex].name : ''
    },
    sceneType() {
      const { sceneType } = uni.$storage.get('userInfo') || {}
      return sceneType
    },
    activityWindowPopStatus() {
      return this.$store.getters.activityWindowPopStatus
    }
  },
  watch: {
    activityWindowPopStatus: {
      handler(val) {
        const { id, tabIndex } = this
        if (val == 2 && !id && tabIndex == 0) this.getActivityMessage()
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    // 监听自定义事件
    uni.$on('pageBack', () => {
      this.$refs.leftBox.getMessageInfo()
      this.$refs.messageRef.getMessageSummary()
    })
    /**
     * 获取员工场景小分类
     */
    this.getStaffBaseSceneCodeList()
    /**
     * 获取门店场景小分类
     */
    this.getStoreBaseSceneCodeList()
  },
  methods: {
    // 处理开始测评（参考 detail.vue 的实现）
    async handleStartAssessment() {
      this.showStudyPopup = false
      try {
        // 获取北森 token
        uni.showLoading({ title: '加载中...' })
        const token = await this.findBeiSenSSOToken()
        console.log('🔑 获取到的 token:', token)
        uni.hideLoading()
        if (token) {
          // const COURSE_ID = 'c6d20419-fae9-4d35-a1d1-bd2b35c0c619';
          const baseUrl = 'https://cloud.italent.cn/PageHome/Index'
          const params = {
            product: 'Learning',
            keyName: 'Nusion',
            pageCode: 'LearningExamTraineePage',
            appCode: 'Learning',
            examId: this.courseInfo.examId
          }
          const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')
          const tokenUrl = this.tokenUrl || uni.$storage.get('beisenToken')
          // this.setWebviewStyle()
          const url = encodeURIComponent(`${baseUrl}?${queryString}#/viewDynamic?1=1`)
          this.jumpUrl = `${tokenUrl}&return_url=${url}`
          uni.navigateTo({
            url: `/pages/common/studyWebview?url=${encodeURIComponent(this.jumpUrl)}&pageTitle=学习测评&type=0`
          })
        } else {
          uni.showToast({
            title: '培训账号未创建',
            icon: 'none'
          })
          this.getLevelExamInfo()
          throw new Error('获取 token 失败1')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 获取 token 失败:', error)
        uni.showToast({
          title: '培训账号未创建',
          icon: 'none'
        })
      }
    },
    // 获取北森 SSO Token（参考 detail.vue 的方法）
    findBeiSenSSOToken() {
      return new Promise((resolve, reject) => {
        uni.$api.commonApi
          .findBeiSenSSOToken({})
          .then(res => {
            uni.$storage.set('beisenToken', res.data)
            resolve(res.data || '')
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 处理考试取消（用户选择未提交）
    handleExamCancel() {
      this.showExamPopup = false
      this.examPopInfo = {
        isExamLoading: false,
        showError: false,
        confirmText: '确认已提交'
      }
      this.getLevelExamInfo()
    },
    handleStudyPermissionConfirm() {
      this.showStudyPermissionPopup = false
      if (this.lockReason == '2') {
        uni.navigateTo({ url: '/pages/common/serviceDetail/index?moduleType=9' })
        return
      }
      // 切换到学习中心 tab
      const tabs = this.$refs.leftBox?.tabs
      if (tabs) {
        const studyCenterIndex = tabs.findIndex(tab => tab.name === 'StudyCenter')
        if (studyCenterIndex !== -1) {
          this.tabIndex = studyCenterIndex
          this.changeTab({ item: tabs[studyCenterIndex], index: studyCenterIndex })
        }
      }
    },
    // 处理学习弹窗取消
    handleStudyPopupCancel() {
      this.showStudyPopup = false
      // 切换到学习中心 tab
      const tabs = this.$refs.leftBox?.tabs
      if (tabs) {
        const homeIndex = tabs.findIndex(tab => tab.name === 'HomeSlot')
        if (homeIndex !== -1) {
          this.tabIndex = homeIndex
          this.changeTab({ item: tabs[homeIndex], index: homeIndex })
        }
      }
    },
    // 检查学习中心权限
    async checkStudyCenterPermission() {
      try {
        const userInfo = uni.$storage.get('userInfo') || {}

        // 如果是渠道类型为9，没有权限
        if (userInfo?.subLoginUser?.channelType == 9) {
          return false
        }

        // 获取权限信息
        let studyCenterPermission = uni.$storage.get('studyCenterPermission')

        // 如果缓存中没有，调用接口获取
        if (!studyCenterPermission) {
          const yqMerchantIdList = userInfo?.subLoginUser?.yqMerchantIdList || []
          const res = await uni.$api.commonApi.getStudyCenterPermission({ yqMerchantIdList })
          studyCenterPermission = res
          uni.$storage.set('studyCenterPermission', res)
        }

        // 判断权限：直营 或者 （鸿蒙智行 且 有延保业务）
        const { directSaleAuth, hmzxAuth, authorizedBusinessList } = studyCenterPermission
        const isYb = authorizedBusinessList && authorizedBusinessList.includes(1) // 1.延保 2.轻改 3.权益

        // 有直营权限 或者 （有鸿蒙智行权限 且 有延保业务权限）则显示
        // 这里返回 false 表示没有权限（即未完成学习任务），需要弹出提示
        // TODO: 这里后续需要调用接口查询是否完成必修课
        return false // 暂时返回 false 用于测试弹窗
      } catch (error) {
        console.error('获取学习中心权限失败:', error)
        return true // 出错时默认允许通过
      }
    },
    // 处理考试确认（用户选择已提交）
    async handleExamConfirm() {
      this.examPopInfo.isExamLoading = true
      this.examPopInfo.showError = false
      const { examId, levelExamId } = this.courseInfo
      try {
        const params = {
          examId,
          invokeType: 0,
          levelExamId
        }
        // TODO: 这里后续调用后端查询接口
        const result = await uni.$api.commonApi.getExamResult(params)
        console.log('查询到的考试结果:', result)
        // 模拟延迟
        // await new Promise(resolve => setTimeout(resolve, 2000))
        if (result) {
          // 查询完成后关闭弹窗
          this.examPopInfo.isExamLoading = false
          console.log('查询完成，关闭弹窗')
          this.showExamPopup = false
          this.getLevelExamInfo()
          // 关闭后刷新学习中心的学习时长
          if (this.$refs.pointRef && typeof this.$refs.pointRef.getMyStudyTime === 'function') {
            setTimeout(() => {
              this.$refs.pointRef.getMyStudyTime()
            }, 500)
          }
        } else {
          this.examPopInfo.isExamLoading = false
          this.examPopInfo.showError = true
          this.examPopInfo.confirmText = '重新确认'
        }
      } catch (error) {
        console.error('查询考试结果失败:', error)
        this.examPopInfo.isExamLoading = false
        this.examPopInfo.showError = true
        this.examPopInfo.confirmText = '重新确认'
        uni.showToast({
          title: '未查询到考试结果，请重新确认',
          icon: 'none'
        })
      }
    },
    async changeTab({ item, index }) {
      if (index == 0) this.$refs.messageRef.getMessageSummary()
      this.previewOff = index != 0
      this.$emit('changeTab', index)
      console.log(this.$refs.leftBox.hasPopupOpen)
      // 切换到学习中心时显示弹窗
      if (item.name === 'StudyCenter' && !this.$refs.leftBox.hasPopupOpen) {
        this.getLevelExamInfo()
      }
    },
    // 查询等级弹窗信息
    async getLevelExamInfo() {
      const res = await uni.$api.commonApi.startExam()
      if (res) {
        this.showStudyPopup = true
        this.courseInfo = res
      }
    },
    handleFooter(val) {
      this.footerBox = val
    },
    backHome() {
      this.showHome = true
      Promise.resolve().then(() => {
        this.$refs.pointRef?.$refs?.centerRef?.init && this.$refs.pointRef.$refs.centerRef.init()
      })
    },
    jump(val) {
      this.showHome = true
      if (val == 'CustomerFile') {
        this.tabIndex = 2
        return
      }
      this.start()
    },
    handleShowPage(name, transfer) {
      this.transfer = transfer
      this.showHome = false
      this.pointComponentName = name
    },
    handleOperation(val, data) {
      const { type } = val

      // 提取公共的webview设置逻辑
      const setWebviewStyle = () => {
        //修改UA为PC端
        // plus.navigator.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0')
        const setWebviewStyleWithRetry = () => {
          const currentWebview = this.$parent.$scope.$getAppWebview()
          const wv = currentWebview.children()[1]

          if (wv) {
            wv.setStyle({
              left: '8%',
              top: '3%',
              height: '97%',
              width: '92%'
            })
            return true // 成功设置样式
          } else {
            return false // 未找到wv
          }
        }

        const retrySetWebviewStyle = () => {
          if (!setWebviewStyleWithRetry()) {
            // 如果未成功，继续重试
            setTimeout(retrySetWebviewStyle, 50)
          }
        }

        setTimeout(retrySetWebviewStyle, 100)
      }

      // 处理课程详情
      const handleCourseDetail = () => {
        const COURSE_ID = val.data.courseId
        const baseUrl = 'https://cloud.italent.cn/PageHome/Index'
        const params = {
          product: 'Learning',
          keyName: 'Nusion',
          pageCode: 'LearningCourseTraineeDetailPage',
          appCode: 'Learning',
          id: COURSE_ID
        }

        const queryString = Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
        const tokenUrl = uni.$storage.get('beisenToken')
        const url = encodeURIComponent(`${baseUrl}?${queryString}#/viewDynamic?1=1`)
        this.jumpUrl = `${tokenUrl}&return_url=${url}`
      }

      // 根据操作类型执行相应逻辑
      switch (type) {
        case 'openCourse':
          this.showBeisen = true
          setWebviewStyle()
          break

        case 'courseDetail':
          handleCourseDetail()
          this.showBeisen = true
          setWebviewStyle()
          this.getStudyCenterRead(val.data.id)
          break
      }
    },
    // 学习中心修改阅读状态，打开后才修改
    async getStudyCenterRead(id) {
      const res = await uni.$api.commonApi.getStudyCenterRead({ id })
    },

    showReadCountTips(res) {
      this.tipsObject = res
    },
    closeTips() {
      this.$refs.leftBox.readCount = 0
      this.tipsObject = {
        style: '',
        text: ''
      }
    },
    swiperClick(e) {
      if (this.sceneType == 0)
        uni.$track.add({
          eventCode: 'app_product_Introduction'
        }) //轻改场景不埋点
      this.previewOff = true
      this.$emit('swiperClick', e)
    },
    previewHandler(name, off = false) {
      this.previewOff = off
      this.$emit(name)
    },
    start() {
      const { sceneType } = this
      if (sceneType == 7) return //二手车无接待功能
      uni.$track.add({
        eventCode: 'app_reception_begins'
      })
      this.$emit('start')
    },
    async updateApp(requested = false) {
      if (!requested) await uni.$api.systemApi.getMockData(true)
      this.checkVersion()
    },
    async entranceClick(item) {
      if (item.eventCode) uni.$track.add({ eventCode: item.eventCode })
      // 清除评估单的图片视频资源缓存
      const { sceneType } = this
      if (!item.noInterception) {
        if (sceneType != 7) {
          // if (await this.inspectionOfProhibitionBill()) return
          // 检查是否限制录单
          const res = await this.getLimitRecord()
          if (res.lockOrder) {
            this.showStudyPermissionPopup = true
            this.lockReason = res.lockReason
            return
          }
          const { abnormalOrderNum, lockOrderFlag } = await this.getAbnormalOrderLock()
          if (abnormalOrderNum > 0 && lockOrderFlag === 'Y') {
            this.showErrorOrderPopup = true
            this.abnormalOrderCount = abnormalOrderNum
            return
          }
        }
        if (await this.checkDailyReport(sceneType != 7)) return
      }
      if (item.name === 'EvaluationFormList') {
        mediaResourceManager.cleanupExpired()
        uni.navigateTo({
          url: `/pages/evaluationForm/index`
        })
        return
      }
      if (item.name === 'ReportManagement') {
        const res = await uni.$api.usedCarApi.checkVisitButton({
          buttonCode: 'quotation'
        })
        if (!res.data.data) {
          uni.showToast({
            title: '功能暂未开放',
            icon: 'none'
          })
          return
        }
      }
      if (item.page)
        return uni.navigateTo({
          url: `${item.page}?componentName=${item.name}`
        })
      let pageName = {
        0: 'equity',
        1: 'boutique',
        7: 'usedCar'
      }[this.sceneType]
      uni.navigateTo({
        url: `/pages/${pageName}/tool/index?componentName=${item.name}`
      })
    },
    async getActivityMessage() {
      this.$store.dispatch('setActivityWindowPopCount', 0)
      const { sceneType } = this,
        pages = getCurrentPages(),
        currentPage = pages[pages.length - 1]
      if (sceneType == 7) return // 二手车业务无活动中心
       if (!['pages/equity/index', 'pages/boutique/index'].includes(currentPage.route)) return
      const data = await uni.$api.activityApi.getActivityMessagePopUpWindow({
        businessType: sceneType
      })
      if (data) this.$refs.activityPopup.open(data)
    },
    closeActivityCenter() {
      this.$refs.activityPopup.close()
    },
    async JumpActivityCenter(data) {
      const { activityId } = data,
        { shopMerchantId } = uni.$storage.get('userInfo'),
        { sceneType } = this,
        res = await uni.$api.activityApi.getActivityDetail({
          sceneType,
          id: activityId,
          merchantId: shopMerchantId
        })
      if (!res) {
        this.errorMsg = '暂无该活动查看权限'
        this.$refs.errorRef.open()
      }
      this.$refs.leftBox.handleActivityCenter()
    },
    handleErrorOrderPopupSure() {
      let pageName = {
        0: 'equity',
        1: 'boutique'
      }[this.sceneType]
      uni.navigateTo({
        url: `/pages/${pageName}/tool/index?componentName=OrderManagement`
      })
    },
    handleUploadMessageNew(event) {
      FileUploadManager.handleWebViewMessage(event)
    },
    handleTouchStart() {
      uni.$emit('reset_timeout')
    },
    async getStaffBaseSceneCodeList() {
      const { shopMerchantId: merchantId, phone } = uni.$storage.get('userInfo'),
        { sceneType } = this,
        data = await uni.$api.dailyTemplateApi.getStaffBaseSceneCodeList({
          merchantId,
          phone,
          sceneType
        })
      let baseSceneCode = []
      if (data && data.length) baseSceneCode = data.map(e => Number(e.baseSceneCode))
      uni.$storage.set('baseSceneCode', baseSceneCode)
    },
    async getStoreBaseSceneCodeList() {
      const { shopMerchantId: merchantId } = uni.$storage.get('userInfo'),
        { sceneType } = this,
        data = await uni.$api.dailyTemplateApi.getStoreBaseSceneCodeList({
          merchantId,
          sceneType
        })
      let baseSceneCode = []
      if (data && data.length) baseSceneCode = data.map(e => Number(e.baseSceneCode))
      uni.$storage.set('storeBaseSceneCode', baseSceneCode)
    },
  }
}
</script>
<style scoped lang="scss">
.container {
  position: relative;

  .tips-box {
    position: absolute;
    color: #ffffff;
    font-size: toRpx(28);
    width: toRpx(310);
    height: toRpx(90);
    line-height: toRpx(68);
    background-image: url('@/assets/images/home/daliog.webp');
    background-size: 100% 100%;
    z-index: 9;
    padding-left: toRpx(60);
    text-align: left;
    display: none;
    opacity: 0;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background-image: url('@/assets/images/common/home-bg-1.webp');
    background-size: 100% 100%;
    z-index: 1;
  }

  .home,
  .detail {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: -1;
    top: 0;
    left: 0;
    visibility: hidden;
    opacity: 0;
  }

  .point-page {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 2;
    top: 0;
    left: 0;
  }

  .home {
    display: flex;
    height: 100vh;
    position: relative;

    .store-addr {
      position: absolute;
      left: 50%;
      bottom: toRpx(24);
      transform: translateX(-50%);
      display: flex;
      align-items: center;

      .icon-addr {
        width: toRpx(32);
        height: toRpx(32);
        flex-shrink: 0;
      }

      .addr-text {
        font-size: toRpx(24);
        color: #999999;
        word-wrap: break-word;
        white-space: normal;
        line-height: toRpx(32);
        margin-left: toRpx(4);
        flex-shrink: 0;
      }

      &::before,
      &::after {
        content: '';
        width: toRpx(600);
        height: toRpx(2);

        margin: 0 toRpx(40);
      }

      &::before {
        background-image: linear-gradient(270deg, #eeeeee 0%, #d8d8d800 100%);
      }

      &::after {
        background-image: linear-gradient(90deg, #eeeeee 0%, #d8d8d800 100%);
      }
    }
  }

  .show {
    opacity: 1;
    position: absolute;
    z-index: 2;
    visibility: visible;
    animation: show-content-left 0.15s forwards;
  }
}

@keyframes show-content-left {
  0% {
    left: 100%;
  }

  100% {
    left: 0;
  }
}

.right-side {
  flex: 1;
  position: relative;
  width: calc(100vw - #{toRpx(240)});

  .right-content {
    height: 100vh;
    box-sizing: border-box;
    position: relative;
    animation: show-box 0.15s forwards;
    overflow: hidden;
  }

  @keyframes show-box {
    0% {
      left: 100%;
    }

    100% {
      left: 0;
    }
  }

  .start {
    height: toRpx(232);
    box-sizing: border-box;
    margin-right: toRpx(64);
    position: relative;
    background: url('@/assets/images/home/start-btn.webp') no-repeat;
    background-size: 100% 100%;
    padding-top: toRpx(60);
    display: flex;
    justify-content: center;

    .sprite-icon {
      zoom: 2;
    }
  }

  .right-content-box {
    width: 100%;
    height: calc(100% - #{toRpx(232)});
    gap: toRpx(48);
    box-sizing: border-box;
    padding: toRpx(32) 0 toRpx(80);

    .box-class {
      background: #ffffff59;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border-radius: toRpx(48);
      overflow: hidden;
    }

    .content-box {
      position: relative;
      width: 100%;
      height: calc(100% - #{toRpx(120)});

      .message-box {
        height: 100%;
      }
    }

    .content-left,
    .content-right {
      height: 100%;
      flex-shrink: 0;
    }

    .content-left {
      width: toRpx(1210);

      .module-box {
        height: toRpx(664);
        margin-bottom: toRpx(48);
      }

      .tool-box {
        height: calc(100% - #{toRpx(712)});

        .content-box {
          width: calc(100% - #{toRpx(96)});
          margin: 0 toRpx(48);
        }
      }
    }

    .content-right {
      width: calc(100% - #{toRpx(1322)});
      // width: toRpx(800);
    }
  }

  .app-content-box {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    z-index: -999;
  }

  .show-content-box {
    opacity: 1;
    z-index: 1;
  }
}

.footer {
  border-top: toRpx(2) solid #eff0f2;
  font-weight: 600;
  font-size: toRpx(32);
  margin-top: toRpx(48);

  .footer-btn {
    justify-content: center;
    margin: toRpx(16) auto 0;
  }

  .confirm {
    width: toRpx(608);
    height: toRpx(80);
    background: #2c66f7;
    border-radius: toRpx(40);
    color: #fff;
  }

  .cancel {
    width: toRpx(608);
    height: toRpx(80);
    background: #ffffff00;
    border-radius: toRpx(40);
    color: #2c66f7;
  }

  text {
    font-size: toRpx(24);
  }
}

.lead-page {
  height: 100vh;
  width: 100vw;
  z-index: 999999;
  position: fixed;
}

.error-order-title {
  text-align: center;
  color: #333333;
  font-size: toRpx(40);
  font-weight: 500;
}

.error-order-content {
  text-align: center;
  color: #666666;
  font-size: toRpx(32);
  font-weight: 400;
  margin-top: toRpx(16);
}

.error-order-footer {
  margin-top: toRpx(64);
  margin-bottom: toRpx(48);
  width: 100%;

  .cancel {
    height: toRpx(88);
    border-radius: toRpx(64);
    opacity: 1;
    line-height: toRpx(88);
    background: #f0f1f5;
    width: toRpx(344);
    text-align: center;
    color: #1a1a1a;
    font-size: toRpx(32);
    font-weight: 400;
  }

  .sure {
    height: toRpx(88);
    border-radius: toRpx(64);
    opacity: 1;
    line-height: toRpx(88);
    background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
    color: #fff;
    font-size: toRpx(32);
    font-weight: 500;
    width: 100%;
    text-align: center;
    margin-left: toRpx(32);
    margin-right: toRpx(32);
  }
}
</style>
