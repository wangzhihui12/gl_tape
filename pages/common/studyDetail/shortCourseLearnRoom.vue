<template>
    <view class="detail-box">
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
        <view class="title">任务详情</view>
      </view>
      <view class="detail-content">
        <view class="left-box">
          <view class="top-box">
            <view class="top-box-name">
              {{ courseDetail.staffName || '-' }}
              <view
                class="role-tag"
                v-for="(item, index) in courseDetail.positionList"
                :key="index"
              >{{ item }}</view>
            </view>
            <view class="top-box-info">
              <view class="top-box-info-item">驻店时间：{{ courseDetail.residentTimeTag || '-' }}</view>
              <view class="top-box-info-item">
                直属上级：
                <text class="superior-text">
                  {{ courseDetail.superior || '-' }}
                </text>
              </view>
            </view>
          </view>
          <view class="bottom-box">
            <view class="bottom-box-radar-box">
                <view class="bottom-box-title margin-bottom">
                    <view class="flex"><view class="sprite-icon icon-short-frame"></view>能力雷达图</view>
                    <view class="date">{{ formatTime(courseDetail.checkDate, 'YYYY年MM月DD日') }}</view>
                </view>
                <RadarChart
                :labelColors="labelColors"
                :chartData="chartData"
                />
            </view>
            <!-- <view class="bottom-box-summary">
              <view>总结</view>
              <view
                class="summary-btn"
                @click="handleSummary"
              >查看</view>
            </view> -->
            <view class="bottom-box-detail-box">
              <view class="detail-recheck-header">
                <view class="detail-recheck-header-left">
                  <view class="sprite-icon icon-reviewChecklist"></view>
                  <text class="detail-recheck-date-ym">待复盘清单</text>
                  <text class="detail-recheck-date-d">({{ pendingRecheckCount }}单)</text>
                </view>
                <view class="detail-recheck-header-extra" />
              </view>
              <scroll-view
                scroll-y
                class="detail-recheck-scroll"
              >
                <view class="detail-recheck-list">
                  <view
                    class="detail-recheck-row"
                    :class="{ 'detail-recheck-row--highlight': index === activeRecheckIndex }"
                    @click="handleDetail(item, index)"
                    v-for="(item, index) in courseDetail.defeatReviewDetailList || []"
                    :key="index"
                  >
                    <view class="detail-recheck-row-main">
                      <view class="detail-recheck-row-title">{{ item.customerName || '-' }}</view>
                      <view class="detail-recheck-row-meta">
                        <view class="sprite-icon icon-short-car" />
                        <text class="detail-recheck-car-text">{{
                          item.carModel || '-'
                        }}</text>
                      </view>
                    </view>
                    <view
                      :class="[
                        'detail-recheck-badge',
                        Number(item.reviewStatus) === 1 ? 'detail-recheck-badge--success' : 'detail-recheck-badge--danger'
                      ]"
                    >
                      <view class="detail-recheck-badge-dot" />
                      <text class="detail-recheck-badge-text">{{ Number(item.reviewStatus) === 1 ? '已结案' : '待复盘' }}</text>
                    </view>
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>
        <view class="right-box">
          <!-- Frame 24 顶栏 -->
          <view class="right-box__header">
            <view class="sprite-icon icon-short-course right-box__course-icon-glyph"></view>
            <view class="right-box__head-main">
              <view class="right-box__room-title">{{ roomTitleText }}</view>
              <view class="right-box__head-tags">
                <view class="right-box__tag-outline">正在复盘客户：{{ customerNameText }}</view>
              </view>
            </view>
            <view class="right-box__head-extra">
              <view class="right-box__car-pill">
                <view class="sprite-icon icon-short-time"></view>
                <text class="right-box__car-pill-text">学习时长</text>
                <text class="right-box__car-pill-text">{{ reviewDurationMinutesText }}</text>
                <text class="right-box__car-pill-text">:</text>
                <text class="right-box__car-pill-text">{{ reviewDurationSecondsText }}</text>
              </view>
            </view>
          </view>
          <template v-if="rightBoxMode === 'practice'">
            <view class="right-box__body right-box__body--practice">
              <!-- App 内嵌子 webview 的承载区域（高度=right-box__body--practice） -->
              <view class="right-box__practice-host">
                <view class="right-box__practice-host-bar">
                  <view class="right-box__practice-bar-left">
                    <view class="sprite-icon icon-short-ai" />
                    <text class="right-box__practice-bar-title">实战对练室</text>
                    <view class="right-box__practice-divider"><view class="right-box__practice-divider-line" /></view>
                    <text class="right-box__practice-bar-subtitle">{{ practiceProgressText }}</text>
                  </view>
                  <view class="right-box__practice-bar-right" @click="handlePracticeBack">
                    <view class="sprite-icon icon-short-back" />
                    <view class="right-box__practice-back" >返回知识学习</view>
                  </view>
                </view>
                <view class="right-box__practice-webview-wrap">
                  <web-view class="right-box__practice-webview" :src="practiceUrlComputed" @message="handlerMessage" />
                </view>
              </view>
            </view>
          </template>
          <template v-else>
            <!-- Frame 33 月份选项卡 -->
            <view class="right-box__tabs">
              <view
                v-for="(tab, idx) in monthTabs"
                :key="idx"
                :class="['right-box__tab', { 'right-box__tab--active': activeMonthTab === idx }]"
                @click="activeMonthTab = idx"
              >
                <text>{{ tab.label }}</text>
                <view
                  v-if="tab.pending"
                  class="right-box__tab-badge"
                >待学</view>
              </view>
            </view>
            <!-- 主体：表格或空状态 -->
            <view :class="['right-box__body', { 'right-box__body--no-footer': Number((activeRecheckItem || {}).reviewStatus) === 1 }]">
              <view v-if="!activeStageData" class="right-box__empty">
                <view class="right-box__empty-visual">
                  <view class="sprite-icon icon-perferIcon"></view>
                  <view class="right-box__empty-pill">此阶段表现完美</view>
                </view>
                <text class="right-box__empty-desc">系统未在录音中检测到该阶段的话术短板，请切换其他存在红点的标签页。</text>
              </view>
              <scroll-view v-else scroll-y class="right-box__stage-scroll">
                <view class="right-box__stage-card">
                  <view class="right-box__stage-card-header">
                    <view class="sprite-icon icon-detail-change" />
                    <view class="right-box__stage-title">话术改进明细 ({{ redDotProgress.done }}/{{ redDotProgress.total }})</view>
                  </view>


                  <view class="right-box__frame67">
                    <!-- 客户原话（左气泡） -->
                    <view v-if="activeStageData.customer_original" class="right-box__msg-row right-box__msg-row--left">
                      <view class="right-box__bubble right-box__bubble--left">
                        <view class="right-box__bubble-head">
                          <view class="sprite-icon icon-employee_response" />
                          <text class="right-box__bubble-title">客户原话</text>
                        </view>
                        <view class="right-box__bubble-text">{{ activeStageData.customer_original }}</view>
                      </view>
                    </view>

                    <!-- 您的当时回复（右气泡） -->
                    <view v-if="activeStageData.employee_response" class="right-box__msg-row right-box__msg-row--right">
                      <view class="right-box__bubble right-box__bubble--right">
                        <view class="right-box__bubble-head">
                          <view class="sprite-icon icon-customer_original" />
                          <text class="right-box__bubble-title">您的当时回复</text>
                        </view>
                        <view class="right-box__bubble-text">{{ activeStageData.employee_response }}</view>
                      </view>
                    </view>

                    <!-- Slot 2：金牌话术实践（包裹诊断/策略） -->
                    <view
                      v-if="activeStageData.script_practice || activeStageData.script_diagnosis || activeStageData.technique_strategy"
                      class="right-box__slot2 right-box__slot2--practice"
                    >
                      <view class="right-box__slot2-head">
                        <text class="right-box__slot2-title">金牌话术实践</text>
                      </view>
                      <view v-if="activeStageData.script_practice" class="right-box__slot2-text">{{ activeStageData.script_practice }}</view>

                      <view v-if="activeStageData.script_diagnosis" class="right-box__slot2-inner right-box__slot2-inner--diagnosis">
                        <view class="right-box__slot2-head">
                          <text class="right-box__slot2-title">话术诊断</text>
                        </view>
                        <view class="right-box__slot2-text">{{ activeStageData.script_diagnosis }}</view>
                      </view>

                      <view v-if="activeStageData.technique_strategy" class="right-box__slot2-inner right-box__slot2-inner--strategy">
                        <view class="right-box__slot2-head">
                          <text class="right-box__slot2-title">技巧策略</text>
                        </view>
                        <view class="right-box__slot2-text">{{ activeStageData.technique_strategy }}</view>
                      </view>
                    </view>

                    <!-- 场景总结（如需要保留，样式同 practice） -->
                    <!-- <view v-if="activeStageData.scenario_summary" class="right-box__slot2 right-box__slot2--practice">
                      <view class="right-box__slot2-head">
                        <text class="right-box__slot2-title">场景总结</text>
                      </view>
                      <view class="right-box__slot2-text">{{ activeStageData.scenario_summary }}</view>
                    </view> -->
                  </view>
                </view>
              </scroll-view>
            </view>
            <!-- Frame 68 底部对练提示 -->
            <view class="right-box__footer" v-if="Number((activeRecheckItem || {}).reviewStatus) !== 1">
              <view
                :class="['right-box__practice-bar', { 'right-box__practice-bar--unlocked': redDotProgress.done >= redDotProgress.total }]"
                @click="handlePracticeClick"
              >
                <view
                  :class="[
                    'sprite-icon',
                    redDotProgress.done >= redDotProgress.total ? 'icon-short-duilian' : 'icon-short-vector'
                  ]"
                />
                <text class="right-box__practice-text">{{ redDotHint }}</text>
              </view>
            </view>
          </template>
        </view>
      </view>
      <learn-popup
        ref="learn"
        content="尚未完成复盘，\n是否退出？"
        @cancel="handlePracticeExitCancel"
        @confirm="handleBackConfirm"
      />
    </view>
  </template>
  <script>
  import dayjs from 'dayjs'
  import RadarChart from 'pages/common/studyDetail/components/RadarChart.vue'
  import LearnPopup from '@/components/LearnPopup.vue'

  export default {
    components: {
      RadarChart,
      LearnPopup
    },
    data () {
      return {
        chartData: {},
        labelColors: [],
        qualityTitle: Object.freeze(['课程标签', '不足/改善建议', '对练考核']),
        courseDetail: {},
        rowData: {},
        countdown: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        },
        isTimeout: false,
        timer: null,
        reviewSeconds: 0,
        reviewTimer: null,
        coursePopupVisible: false,
        popupTitle: '',
        popupType: '',
        popupDetail: {},
        aiAgentData: {},
        completeStatus: null,
        studyId: '',
        options: {},
        activeRecheckIndex: 0,
        activeMonthTab: 0,
        improvementDetails: {},
        stageReadMap: {},
        rightBoxMode: 'knowledge',
        practiceUrl: '',
        practiceWv: null,
        practiceWvStyle: null,
        practiceSceneIndex: 1
      }
    },
    onLoad (options) {
      const { uuid } = uni.$storage.get('userInfo') || {}
      uni.$track.add({ eventCode: 'app_short_courselearnroom', businessId: uuid })
      console.log(options, 'options')
      this.options = options
      const { row } = options
      const rowData = JSON.parse(decodeURIComponent(row))
      console.log(rowData, 'rowData')
      this.rowData = rowData
      this.completeStatus = options.completeStatus
      if (!this.rowData.taskDeadline) this.rowData.taskDeadline = rowData.finishTime
      this.refreshStudyList()
      uni.$on('refreshStudyList', () => {
        this.refreshStudyList()
      })
    },
  
    onUnload () {
      const { uuid } = uni.$storage.get('userInfo') || {}
      uni.$track.add({ eventCode: 'app_short_courselearnroom', businessId: uuid })
      // 清除定时器
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.reviewTimer) {
        clearInterval(this.reviewTimer)
        this.reviewTimer = null
      }
      this.closePracticeWebview()
    },
    watch: {
      activeRecheckIndex: {
        handler (next, prev) {
          // 切换“待复盘清单”项时，如果仍停留在对练模式，
          // App-Plus 的子 webview 可能仍悬浮在页面上，需要主动关闭/回到知识学习。
          if (this.rightBoxMode === 'practice' && next !== prev) {
            this.rightBoxMode = 'knowledge'
            this.closePracticeWebview()
          }
          this.resetReviewTimer()
          this.loadActiveImprovementDetails()
        }
      },
      activeMonthTab: {
        handler (idx) {
          this.markStageReadByIndex(idx)
        },
        immediate: true
      },
      courseDetail: {
        handler () {
          this.syncActiveMonthTab()
        },
        deep: true
      }
    },
    computed: {
      learnRef () {
        return this.$refs.learn
      },
      pendingRecheckCount () {
        const list = this.courseDetail.defeatReviewDetailList || []
        return list.filter(i => Number(i.reviewStatus) === 0).length
      },
      roomTitleText () {
        const d = this.courseDetail.checkDate
        if (!d) return '短课程学习室'
        return `${this.formatTime(d, 'YYYY年MM月DD日')}短课程学习室`
      },
      carModelText () {
        const c = this.courseDetail
        const line = [c.carBrand, c.carModel].filter(Boolean).join(' ')
        return line || '问界M9'
      },
      customerNameText () {
        const list = (this.courseDetail && this.courseDetail.defeatReviewDetailList) || []
        const idx = Number(this.activeRecheckIndex) || 0
        const cur = list[idx] || list[0] || {}
        return cur.customerName || '-'
      },
      reviewDurationText () {
        const sec = Number(this.reviewSeconds) || 0
        const mm = Math.floor(sec / 60)
        const ss = sec % 60
        const pad2 = (n) => (n < 10 ? `0${n}` : String(n))
        return `${pad2(mm)}:${pad2(ss)}`
      },
      reviewDurationMinutesText () {
        const sec = Number(this.reviewSeconds) || 0
        const mm = Math.floor(sec / 60)
        return this.pad2(mm)
      },
      reviewDurationSecondsText () {
        const sec = Number(this.reviewSeconds) || 0
        const ss = sec % 60
        return this.pad2(ss)
      },
      isPracticeUnlocked () {
        const { done, total } = this.redDotProgress
        return done >= total
      },
      activeRecheckItem () {
        const list = (this.courseDetail && this.courseDetail.defeatReviewDetailList) || []
        const idx = Number(this.activeRecheckIndex) || 0
        return list[idx] || list[0] || {}
      },
      practiceParams () {
        // 首场景参数：统一按 practiceScenes 的顺序取第一个（不依赖当前 tab）
        const first = (this.practiceScenes && this.practiceScenes.length)
          ? this.practiceScenes[0]
          : null
        return {
          type: first?.type || '',
          scenario_summary: first?.scenario_summary || '',
          customer_original: first?.customer_original || '',
          scenario_summary_index: first?.scenario_summary_index || 1,
          scenario_summary_length: (this.practiceScenes && this.practiceScenes.length) ? this.practiceScenes.length : 0
        }
      },
      practiceUrlComputed () {
        // 对练 webview URL（根据当前阶段/客户动态拼接）
        const base = (uni.$storage.get('boutique_mock_data') || {}).aiURL || 'http://192.168.1.155:3000/chat/XkxkmjOMCMtbvFcn'
        const domain = 'https://aiassistant.glsx.com.cn'
        const { phone, name } = uni.$storage.get('userInfo') || {}
        const type = this.practiceParams.type || ''
        const scenario_summary = this.practiceParams.scenario_summary || ''
        const customer_original = this.practiceParams.customer_original || ''
        const customer_name = (this.activeRecheckItem && this.activeRecheckItem.customerName) || ''
        // 这里的 index/length 统一按 practiceScenes（阶段）维度
        const scenario_summary_index = Number(this.practiceParams.scenario_summary_index) || 1
        const scenario_summary_length = Number(this.practiceParams.scenario_summary_length) || 0

        const q = [
          `platformType=1`,
          `domain=${encodeURIComponent(domain)}`,
          `type=${encodeURIComponent(type)}`,
          `scenario_summary=${encodeURIComponent(scenario_summary)}`,
          `customer_original=${encodeURIComponent(customer_original)}`,
          `customer_name=${encodeURIComponent(customer_name)}`,
          `scenario_summary_index=${encodeURIComponent(String(scenario_summary_index))}`,
          `scenario_summary_length=${encodeURIComponent(String(scenario_summary_length))}`,
          `phone=${encodeURIComponent(phone || '')}`,
          `name=${encodeURIComponent(name || '')}`
        ].join('&')
        return `${base}?${q}`
      },
      practiceHeaderMonthText () {
        // 设计稿示例为“2025年1月”，这里优先用 checkDate，否则用当前月
        const d = this.courseDetail && this.courseDetail.checkDate
          ? dayjs(this.courseDetail.checkDate)
          : dayjs()
        return d.format('YYYY年M月')
      },
      monthTabs () {
        const details = this.improvementDetails || {}
        const isClosed = Number((this.activeRecheckItem || {}).reviewStatus) === 1
        return [
          {
            label: '开场破冰',
            value: 'ice_breaking',
            pending: !isClosed && Boolean(details.ice_breaking) && !this.stageReadMap.ice_breaking
          },
          {
            label: '需求分析',
            value: 'needs_analysis',
            pending: !isClosed && Boolean(details.needs_analysis) && !this.stageReadMap.needs_analysis
          },
          {
            label: '场景塑造',
            value: 'scenario_building',
            pending: !isClosed && Boolean(details.scenario_building) && !this.stageReadMap.scenario_building
          },
          {
            label: '产品推荐',
            value: 'product_recommendation',
            pending: !isClosed && Boolean(details.product_recommendation) && !this.stageReadMap.product_recommendation
          },
          {
            label: '异议处理',
            value: 'objection_handling',
            pending: !isClosed && Boolean(details.objection_handling) && !this.stageReadMap.objection_handling
          },
          {
            label: '合规促单',
            value: 'compliance_closing',
            pending: !isClosed && Boolean(details.compliance_closing) && !this.stageReadMap.compliance_closing
          }
        ]
      },
      activeStageKey () {
        return this.monthTabs[this.activeMonthTab]?.value
      },
      activeStageLabel () {
        return this.monthTabs[this.activeMonthTab]?.label || ''
      },
      activeStageData () {
        const k = this.activeStageKey
        if (!k) return null
        const d = this.improvementDetails || {}
        return d[k] || null
      },
      redDotProgress () {
        const details = this.improvementDetails || {}
        const keys = this.monthTabs.map(t => t.value)
        const total = keys.filter(k => Boolean(details[k])).length
        const done = keys.filter(k => Boolean(details[k]) && Boolean(this.stageReadMap[k])).length
        return { done, total }
      },
      redDotHint () {
        const { done, total } = this.redDotProgress
        if (done >= total) return '知识已掌握，开启模拟对练'
        return `需阅读全部红点知识点后解锁对练（${done}/${total}）`
      },
      practiceScenes () {
        const details = this.improvementDetails || {}
        const order = ['ice_breaking', 'needs_analysis', 'scenario_building', 'product_recommendation', 'objection_handling', 'compliance_closing']
        return order
          .filter(k => Boolean(details[k]))
          .map((k, idx) => ({
            type: k,
            scenario_summary: details[k]?.scenario_summary || '',
            customer_original: details[k]?.customer_original || '',
            scenario_summary_index: idx + 1
          }))
      },
      practiceProgressText () {
        const total = this.practiceScenes.length
        const idx = Number(this.practiceSceneIndex) || 1
        return `当前进度：场景${Math.min(Math.max(idx, 1), Math.max(total, 1))}/${total || 0}`
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
      loadActiveImprovementDetails () {
        const item = this.activeRecheckItem || {}
        const raw = item.result
        let train = null
        if (raw) {
          try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
            train = parsed && (parsed.train || parsed.result?.train) ? (parsed.train || parsed.result?.train) : null
          } catch (e) {
            train = null
          }
        }

        // 将 train 转成当前页面的 improvementDetails 结构
        const details = {
          ice_breaking: train?.ice_breaking || null,
          needs_analysis: train?.needs_analysis || null,
          scenario_building: train?.scenario_building || null,
          product_recommendation: train?.product_recommendation || null,
          objection_handling: train?.objection_handling || null,
          compliance_closing: train?.compliance_closing || null
        }
        this.improvementDetails = details
        // 切换客户时红点阅读状态重置；开场破冰为默认第一项，进入即视为已读
        const nextStageReadMap = {}
        if (details.ice_breaking) nextStageReadMap.ice_breaking = true
        this.stageReadMap = nextStageReadMap
        this.activeMonthTab = 0
      },
      handlePracticeClick () {
        if (!this.isPracticeUnlocked) return
        this.practiceUrl = this.practiceUrlComputed
        this.practiceSceneIndex = 1
        this.rightBoxMode = 'practice'
        this.$nextTick(() => {
          this.openPracticeWebview()
        })
      },
      handlerMessage ({ detail }) {
        uni.hideLoading()
        const payloadArr = (detail && detail.data) ? detail.data : []
        const data = Array.isArray(payloadArr) ? payloadArr[0] : payloadArr
        if (!data) return

        // webview 可能发 0-based 或 1-based
        const sceneIndexRaw = Number(data.sceneIndex)
        if (!Number.isNaN(sceneIndexRaw)) {
          this.practiceSceneIndex = sceneIndexRaw >= 1 ? sceneIndexRaw : (sceneIndexRaw + 1)
        }

        if (data.messageType === 'nextScene') {
          const scenes = this.practiceScenes
          const total = scenes.length
          if (!this.practiceWv || !total || Number.isNaN(sceneIndexRaw)) return

          const currentOneBased = sceneIndexRaw >= 1 ? sceneIndexRaw : (sceneIndexRaw + 1)
          const nextOneBased = currentOneBased + 1
          if (nextOneBased > total) return
          const next = scenes[nextOneBased - 1]
          // 顶部进度在点击“下一场景”后就应前进
          this.practiceSceneIndex = nextOneBased

          try {
            console.log('[shortCourse][practice][nextScene]', nextOneBased, {
              type: next.type,
              scenario_summary: next.scenario_summary,
              customer_original: next.customer_original,
              scenario_summary_index: nextOneBased
            })
            this.practiceWv.evalJS(`nextScene(${JSON.stringify({
              type: next.type,
              scenario_summary: next.scenario_summary,
              customer_original: next.customer_original,
              scenario_summary_index: nextOneBased
            })})`)
          } catch (e) {}
        }

        if (data.messageType === 'assessmentComplete') {
          console.log('考核完成')
          this.finishReviewAndRefresh()
        }
      },
      async finishReviewAndRefresh () {
        uni.$track.add({ eventCode: 'app_short_courselearnroom_finish', eventType: 0 })
        const detailId = (this.activeRecheckItem && this.activeRecheckItem.id) || ''
        if (!detailId) return
        try {
          uni.showLoading({ mask: true })
          await uni.$api.commonApi.finishLightShortCourseReview({ id: detailId })
          uni.hideLoading()
          // 完成后刷新详情（会重新拉列表、重算红点/雷达等）
          this.refreshStudyList()
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: e?.message || '完成复盘失败', icon: 'none' })
        }
      },
      handlePracticeBack () {
        this.rightBoxMode = 'knowledge'
        this.hidePracticeWebview()
      },
      handlePracticeExitCancel () {
        // 继续学习：把 webview 复原到原位
        // #ifdef APP-PLUS
        if (this.practiceWv && this.practiceWvStyle) {
          try {
            this.practiceWv.setStyle(this.practiceWvStyle)
          } catch (e) {}
        }
        // #endif
      },
      openPracticeWebview () {
        // 仅 App-Plus 支持子 webview 方式嵌入指定区域
        // #ifdef APP-PLUS
        const url = this.practiceUrlComputed || this.practiceUrl
        if (!url) return
        const currentWebview = this.$scope.$getAppWebview()
        if (!currentWebview) return

        const setStyleWithRetry = () => {
          if (this.rightBoxMode !== 'practice') return
          // 拿到 <web-view> 生成的子 webview（像 receptionDetail 那样）
          const children = currentWebview.children ? currentWebview.children() : []
          const wv = children && children.length ? children[children.length - 1] : null
          if (!wv) {
            setTimeout(setStyleWithRetry, 50)
            return
          }
          this.practiceWv = wv

          const query = uni.createSelectorQuery().in(this)
          query
            .select('.right-box__body--practice')
            .boundingClientRect(bodyRect => {
              if (!bodyRect || !bodyRect.width || !bodyRect.height) {
                setTimeout(setStyleWithRetry, 50)
                return
              }
              // 让 webview 不遮挡顶部返回条
              const barQuery = uni.createSelectorQuery().in(this)
              barQuery.select('.right-box__practice-host-bar').boundingClientRect(barRect => {
                const barH = (barRect && barRect.height)
                  ? barRect.height
                  : (typeof uni.upx2px === 'function' ? uni.upx2px(120) : 0)
                this.practiceWvStyle = {
                  left: `${bodyRect.left}px`,
                  top: `${bodyRect.top + barH}px`,
                  width: `${bodyRect.width}px`,
                  height: `${Math.max(0, bodyRect.height - barH)}px`,
                  background: 'transparent'
                }
                wv.setStyle(this.practiceWvStyle)
                wv.show()
                // 用页面内 CSS 实现圆角（原生 webview 本身不可靠支持圆角裁剪）
                try {
                  wv.evalJS(`(function(){
                    try{
                      var id='__gl_practice_round_style__';
                      if(!document.getElementById(id)){
                        var s=document.createElement('style');
                        s.id=id;
                        s.innerHTML='html,body{background:transparent !important;}body{margin:0!important;padding:0!important;}#app,.__nuxt,main{background:transparent!important;}';
                        document.head.appendChild(s);
                      }
                      if(document.body){
                        document.body.style.overflow='hidden';
                        document.body.style.borderRadius='16px';
                      }
                    }catch(e){}
                  })();`)
                } catch (e) {}
              }).exec()
            })
            .exec()
        }

        setTimeout(setStyleWithRetry, 50)
        // #endif
      },
      hidePracticeWebview () {
        // #ifdef APP-PLUS
        if (this.practiceWv) this.practiceWv.hide()
        // #endif
      },
      closePracticeWebview () {
        // #ifdef APP-PLUS
        try {
          if (this.practiceWv) {
            this.practiceWv.close()
            this.practiceWv = null
          }
        } catch (e) {
          this.practiceWv = null
        }
        // #endif
      },
      resetReviewTimer () {
        const list = (this.courseDetail && this.courseDetail.defeatReviewDetailList) || []
        if (!list.length) {
          this.reviewSeconds = 0
          if (this.reviewTimer) {
            clearInterval(this.reviewTimer)
            this.reviewTimer = null
          }
          return
        }
        this.reviewSeconds = 0
        if (this.reviewTimer) {
          clearInterval(this.reviewTimer)
          this.reviewTimer = null
        }
        this.reviewTimer = setInterval(() => {
          this.reviewSeconds += 1
        }, 1000)
      },
      pad2 (n) {
        const v = Number(n) || 0
        return v < 10 ? `0${v}` : String(v)
      },
      syncActiveMonthTab () {
        if (!this.monthTabs.length) {
          this.activeMonthTab = 0
          return
        }
        if (this.activeMonthTab >= this.monthTabs.length) {
          this.activeMonthTab = 0
        }
      },
      refreshStudyList () {
        const { options, rowData } = this
        if (options.from === 'service') {
          // 服务中心进入时，部分模块（如 moduleType=9）可能不返回 detailId，这里做兜底
          const detailId = rowData.detailId || rowData.id
          this.studyId = detailId
          this.getShortCourseDetail(detailId, rowData.id)
        } else {
          this.studyId = rowData.id
          this.getShortCourseDetail(rowData.id)
        }
      },
      formatTime (time, formatStr) {
        return dayjs(time).format(formatStr);
      },
      backPage () {
        if (!this.coursePopupVisible) { // 防止弹窗遮罩点击后返回
          uni.$emit("backStudyCenter")
          uni.navigateBack();
        }
      },
      async getShortCourseDetail (id, boxId) {
        uni.showLoading()
        const params = { id }
        if (boxId) {
          params.boxId = boxId
        }
        let res = await uni.$api.commonApi.getLightShortCourseDetail(params)
        uni.hideLoading()
        // const res = {
        //   staffName: '许小奇',
        //   position: '驻店销售,带教导师',
        //   residentTimeTag: '',
        //   superior: '',
        //   defeatReviewTag: ["身份介绍", "逼单能力", "攻防能力", "案例展示", "场景塑造", "专业知识", "需求分析", "话题介入", "服务意识"],
        //   defeatReviewScore: [1, 2, 3, 1, 2, 2, 3, 3, 3]
        // }
        const _chartData = {
          categories: res?.defeatReviewTag || [],
          series: [
            {
              data: res?.defeatReviewValue || []
            }
          ]
        }
        this.chartData = _chartData
        console.log(_chartData, '_chartData')
        if (_chartData.series && _chartData.series[0] && Array.isArray(_chartData.series[0].data)) {
          const dataArr = _chartData.series[0].data;
          let _labelColors = [];
          if (dataArr.every(val => val === 0)) {
            _labelColors = [];
          } else {
            _labelColors = dataArr.map(val => val === 1 ? '#EB4E4E' : '#666666');
          }
          console.log(_labelColors, '_labelColors')
          this.labelColors = _labelColors;
          console.log(this.labelColors, 'this.labelColors')
        }
        console.log(res, 'res')
        const normalized = {
          ...res,
          positionList: String(res.position || '').split(',').filter(Boolean),
          defeatReviewDetailList: (res.detailList || []).map(i => ({
            ...i,
            carBrand: i.carBrand,
            carModel: i.carModel,
            customerName: i.customerName,
            customerPhone: i.customerPhone,
            reviewStatus: i.reviewStatus,
            badgeRecordingsId: i.badgeRecordingsId
          }))
        }
        // 兼容旧字段（有些地方可能仍使用）
        if (!normalized.positionList.length && res.position) {
          normalized.positionList = [res.position]
        }
        this.courseDetail = normalized
        this.activeRecheckIndex = 0
        this.rightBoxMode = 'knowledge'
        this.loadActiveImprovementDetails()
        this.resetReviewTimer()
        this.$nextTick(() => {
          this.syncActiveMonthTab()
        })
      },
      async handleExam (item) {
        console.log(item, '===')
        if (item.examStatus == 0) {
          return
        }
        // const { checkDate } = this.rowData
        const { businessType, brandType, checkDate } = this.courseDetail
        console.log(checkDate, 'checkDate')
        let { agentUrl, domainName, taskStatus, agentCode } = this.aiAgentData
        // if (agentCode == 'AI8') {
        //   const isPermision = await this.isPermissionFunction('请打开麦克风权限')
        //   if (!isPermision) return
        // }
        if (!agentUrl) {
          return uni.showToast({
            title: '待开放',
            icon: 'none'
          })
        }
        let url = `/pages/common/aiWebview?url=${agentUrl}&domain=${domainName}&presuppositionProblem=${item.tagName}&businessType=${businessType}&brandType=${brandType}&studyId=${this.studyId}&pageTitle=AI导师`
        url += `&date=${this.formatTime(checkDate, 'YYYY-MM-DD')}`
        uni.navigateTo({ url })
      },
      handleSummary () {
        console.log(1211, '===')
        this.popupTitle = '战败总结'
        this.popupType = 'summary'
        this.coursePopupVisible = true
        this.$refs.coursePopupRef.open()
      },
      handleDetail (item, index) {
        this.activeRecheckIndex = index
      },
      handleCancel () {
        this.coursePopupVisible = false
      },
      markStageReadByIndex (idx) {
        const tab = this.monthTabs[idx]
        if (!tab) return
        const key = tab.value
        const details = this.improvementDetails || {}
        if (!details[key]) return
        if (this.stageReadMap[key]) return
        this.$set(this.stageReadMap, key, true)
      },
  
  
      handleBackConfirm () {
        this.closePracticeWebview()
        this.backPage()
      },
      back () {
        // 先把 webview 移出可视区（如果存在）
        // #ifdef APP-PLUS
        if (this.practiceWv) {
          try {
            this.practiceWv.setStyle({ left: '-9999px', top: '-9999px' })
          } catch (e) {}
        }
        // #endif
        this.learnRef.open()
      }
    }
  }
  </script>
  <style lang="scss" scoped>
  .detail-box {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-image: url('@/assets/images/common/page-bg.webp');
    background-size: 100%;
    box-sizing: border-box;
    padding: toRpx(160) toRpx(64) 0;
  }
  
  .nav-bar {
    position: fixed;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(48);
    z-index: 999;
    pointer-events: none;
  
    .back {
      height: 100%;
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }
  
    .title {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 700;
      font-size: toRpx(32);
      color: #1a1a1a;
    }
  }
  
  .detail-content {
    display: flex;
    gap: toRpx(32);
    height: calc(100% - #{toRpx(80)});
  
    .left-box {
      width: toRpx(656);
      height: 100%;
  
      .top-box {
        width: 100%;
        height: toRpx(160);
        border-radius: toRpx(24);
        background: linear-gradient(180deg, #f0f6ff 0%, #ffffff 100%);
        box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
        padding: toRpx(32);
  
        &-name {
          display: flex;
          align-items: center;
          color: #333333;
          font-size: toRpx(36);
          font-weight: 500;
  
          .role-tag {
            height: toRpx(36);
            border-radius: toRpx(4);
            border: toRpx(2) solid #e8ecf0;
            padding: toRpx(4) toRpx(16);
            font-size: toRpx(24);
            color: #79859e;
            margin-left: toRpx(12);
            font-weight: 400;
  
            &:first-child {
              margin-left: toRpx(16);
            }
          }
        }
  
        &-info {
          display: flex;
          justify-content: space-between;
          margin-top: toRpx(24);
  
          &-item {
            color: #79859e;
            font-size: toRpx(24);
            font-weight: 400;
            .superior-text {
              max-width: toRpx(200);
              display: inline-block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              vertical-align: bottom;
            }
          }
        }
      }
  
      .bottom-box {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        height: calc(100% - #{toRpx(184)});
        border-radius: toRpx(24);
        margin-top: toRpx(24);
        border: 2px solid #FFF;
        background: rgba(255, 255, 255, 0.35);
        box-shadow: 0 0 8px 0 #FFF inset;
        backdrop-filter: blur(4px);
        box-sizing: border-box;
        .bottom-box-radar-box {
            padding: toRpx(32);
        }
        .bottom-box-detail-box {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          align-self: stretch;
          padding: toRpx(32);
          gap: toRpx(32);
          width: 100%;
          flex: 1;
          min-height: 0;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.5) 100%);
          border-radius: toRpx(32);
  
          .detail-recheck-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            align-self: stretch;
            flex: none;
            width: 100%;
            min-height: toRpx(36);
            padding: 0;
          }
  
          .detail-recheck-header-left {
            display: flex;
            flex-direction: row;
            align-items: center;
            flex: none;
            gap: toRpx(8);
            min-height: toRpx(36);
          }
  
          .detail-recheck-header-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: none;
            width: toRpx(36);
            height: toRpx(36);
            border-radius: toRpx(8);
            background: linear-gradient(135deg, #81fbb8 0%, #28c76f 100%);
          }
  
          .detail-recheck-date-ym {
            flex: none;
            font-weight: 500;
            font-size: toRpx(30);
            line-height: toRpx(36);
            color: #292d33;
          }
  
          .detail-recheck-date-d {
            flex: none;
            font-weight: 500;
            font-size: toRpx(30);
            line-height: toRpx(36);
            color: #292d33;
          }
  
          .detail-recheck-header-extra {
            flex: none;
            width: toRpx(168);
            min-height: toRpx(36);
            font-weight: 400;
            font-size: toRpx(24);
            line-height: toRpx(36);
            text-align: right;
            color: #999ea8;
            opacity: 0;
          }
  
          .detail-recheck-scroll {
            flex: 1;
            width: 100%;
            min-height: 0;
            height: 0;
            align-self: stretch;
          }
  
          .detail-recheck-list {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            align-self: stretch;
            gap: toRpx(16);
            width: 100%;
            padding-bottom: toRpx(8);
          }
  
          .detail-recheck-row {
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            flex: none;
            align-self: stretch;
            width: 100%;
            min-height: toRpx(124);
            padding: toRpx(24);
            gap: toRpx(28);
            border-radius: toRpx(16);
            /* 与 --highlight 同宽透明描边，避免切换高亮时因 border 有无导致布局抖动 */
            border: toRpx(2) solid transparent;
  
            &--highlight {
              background: rgba(44, 102, 247, 0.05);
              border-color: rgba(44, 102, 247, 0.1);
            }
          }
  
          .detail-recheck-row-main {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            flex: 1;
            min-width: 0;
            max-width: toRpx(422);
            gap: toRpx(8);
          }
  
          .detail-recheck-row-title {
            align-self: stretch;
            font-weight: 400;
            font-size: toRpx(30);
            line-height: toRpx(36);
            color: #292d33;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
  
          .detail-recheck-row-meta {
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            align-self: stretch;
            gap: toRpx(16);
            min-height: toRpx(32);
          }
  
          .detail-recheck-car-icon {
            flex: none;
            width: toRpx(32);
            height: toRpx(32);
            position: relative;
            &::after {
              content: '';
              position: absolute;
              left: 8.33%;
              right: 8.33%;
              top: 20.83%;
              bottom: 16.66%;
              background: #999ea8;
              border-radius: toRpx(2);
            }
          }
  
          .detail-recheck-car-text {
            flex: 1;
            min-width: 0;
            font-weight: 400;
            font-size: toRpx(26);
            line-height: toRpx(30);
            color: #999ea8;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
  
          .detail-recheck-badge {
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            flex: none;
            flex-grow: 0;
            margin: 0 auto;
            min-width: toRpx(122);
            height: toRpx(44);
            padding: 0 toRpx(16);
            gap: toRpx(8);
            border-radius: toRpx(8);
          }
  
          .detail-recheck-badge-dot {
            flex: none;
            width: toRpx(10);
            height: toRpx(10);
            border-radius: 50%;
          }
  
          .detail-recheck-badge-text {
            flex: none;
            font-weight: 400;
            font-size: toRpx(24);
            line-height: toRpx(44);
          }
  
          .detail-recheck-badge-score {
            flex: none;
            font-weight: 400;
            font-size: toRpx(24);
            line-height: toRpx(44);
          }
  
          .detail-recheck-badge--danger {
            background: #fdece9;
  
            .detail-recheck-badge-dot {
              background: #f24724;
            }
  
            .detail-recheck-badge-text,
            .detail-recheck-badge-score {
              color: #f24724;
            }
          }
  
          .detail-recheck-badge--success {
            background: #eaf9f1;
  
            .detail-recheck-badge-dot {
              background: #35c376;
            }
  
            .detail-recheck-badge-text,
            .detail-recheck-badge-score {
              color: #35c376;
            }
          }
        }
  
        .bottom-box-title {
          display: flex;
          justify-content: space-between;
          font-weight: 500;
            font-size: toRpx(30);
            line-height: toRpx(36);
            color: #292d33;
          &.margin-bottom {
            margin-bottom: toRpx(12);
          }
          .icon-short-frame {
            margin-right: toRpx(8);
          }
  
          .date {
            font-size: toRpx(24);
            color: #999EA8;
            
          }
        }
  
        .bottom-box-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          background-color: #fff;
          border-radius: toRpx(16);
          padding: toRpx(18) toRpx(24);
          font-size: toRpx(24);
          color: #000000;
          margin-top: toRpx(24);
          margin-bottom: toRpx(32);
  
          .summary-btn {
            color: #3b73ff;
          }
        }
  
      }
    }
  
    .right-box {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      position: relative;
      height: 100%;
      background: #ffffff;
      border: toRpx(4) solid #ffffff;
      border-radius: toRpx(32);
      overflow: hidden;
  
      /* Frame 24 */
      &__header {
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        padding: toRpx(32) toRpx(40);
        gap: toRpx(16);
        box-sizing: border-box;
        background: linear-gradient(180deg, rgba(44, 102, 247, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
      }
  
  
      &__head-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: toRpx(8);
      }
  
      &__room-title {
        width: 100%;
        font-weight: 500;
        font-size: toRpx(36);
        line-height: toRpx(48);
        color: #292d33;
      }
  
      &__head-tags {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
        gap: toRpx(16);
      }
  
      /* Frame 7 */
      &__tag-outline {
        box-sizing: border-box;
        padding:0 toRpx(16);
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: toRpx(2) solid #dce1e6;
        border-radius: toRpx(4);
        font-size: toRpx(24);
        line-height: toRpx(40);
        color: #999ea8;
      }
  
      &__head-extra {
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: toRpx(12);
        flex-wrap: wrap;
        justify-content: flex-end;
      }
  
      /* Frame 27 车型条 */
      &__car-pill {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: toRpx(4) 0 toRpx(4) toRpx(20);
        gap: toRpx(12);
        height: toRpx(56);
        box-sizing: border-box;
        background: linear-gradient(90deg, rgba(44, 102, 247, 0.1) 0%, rgba(44, 102, 247, 0) 100%);
        border-radius: toRpx(44);
      }
  
      &__car-pill-icon {
        width: toRpx(32);
        height: toRpx(32);
        flex-shrink: 0;
        border-radius: toRpx(4);
        border: toRpx(3) solid #2c66f7;
        box-sizing: border-box;
        position: relative;
  
        &::after {
          content: '';
          position: absolute;
          right: toRpx(4);
          bottom: toRpx(4);
          width: 40%;
          height: 35%;
          border-right: toRpx(3) solid #2c66f7;
          border-bottom: toRpx(3) solid #2c66f7;
          border-radius: 0 0 toRpx(4) 0;
        }
      }
  
      &__car-pill-text {
        font-size: toRpx(28);
        line-height: toRpx(32);
        color: #2c66f7;
        padding-right: toRpx(16);
      }
  
      &__countdown {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: toRpx(8);
        flex-wrap: wrap;
      }
  
      &__limit-img {
        width: toRpx(122);
        height: toRpx(48);
        margin-right: toRpx(8);
      }
  
      &__countdown-label {
        font-size: toRpx(28);
        color: #b87a11;
  
        &--timeout {
          color: #b87a11;
        }
      }
  
      &__countdown-unit {
        font-size: toRpx(28);
        color: #b87a11;
      }
  
      /* Frame 28 时间块 */
      &__time-chip {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-width: toRpx(66);
        height: toRpx(48);
        padding: 0 toRpx(16);
        box-sizing: border-box;
        background: rgba(44, 102, 247, 0.06);
        border-radius: toRpx(8);
        font-weight: 500;
        font-size: toRpx(28);
        line-height: toRpx(32);
        text-align: center;
        color: #2c66f7;
      }
  
      &__time-colon {
        font-size: toRpx(28);
        line-height: toRpx(40);
        color: #2c66f7;
      }
  
      /* Frame 33 */
      &__tabs {
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 toRpx(40);
        gap: toRpx(16);
        box-sizing: border-box;
        min-height: toRpx(72);
        overflow-x: auto;
      }
  
      &__tab {
        position: relative;
        flex: none;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: toRpx(16) toRpx(48);
        gap: toRpx(20);
        min-width: toRpx(208);
        height: toRpx(72);
        box-sizing: border-box;
        background: #f5f7fa;
        border-radius: toRpx(16);
        font-weight: 400;
        font-size: toRpx(28);
        line-height: toRpx(40);
        color: #6c6f75;
  
        &--active {
          font-weight: 500;
          color: #ffffff;
          background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
          border: toRpx(2) solid #ffffff;
          box-shadow: 0 toRpx(4) toRpx(24) rgba(44, 102, 247, 0.1);
        }
      }
  
      &__tab-badge {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-end;
        padding: 0 toRpx(8);
        width: toRpx(56);
        height: toRpx(28);
        background: rgba(242, 71, 36, 0.1);
        border-radius: 0 toRpx(16) 0 0;
        font-size: toRpx(20);
        line-height: 1;
        color: #f24724;
        white-space: nowrap;
        box-sizing: border-box;
      }
  
      &__body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        position: relative;
        padding-bottom: toRpx(176);
      }
  
      &__body--practice {
        padding-bottom: 0;
      }

      &__body--no-footer {
        padding-bottom: 0;
      }

      &__practice-host {
        position: absolute;
        left: 0;
        right: 0;
        top: toRpx(0);
        bottom: toRpx(0);
        background: #F7FAFF;
        border-radius: toRpx(32);
        overflow: hidden;
      }

      &__practice-host-bar {
        /* Frame 45 */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: toRpx(32) toRpx(40) toRpx(40);
        gap: toRpx(490);
        position: absolute;
        height: toRpx(120);
        left: 0;
        right: 0;
        top: 0;
        z-index: 2;
        box-sizing: border-box;
        background: linear-gradient(360deg, rgba(247, 250, 255, 0) 0%, #F7FAFF 20%, #F7FAFF 100%);
      }

      &__practice-bar-left {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: toRpx(18);
        min-width: 0;
      }

      &__practice-bar-right {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      &__practice-bar-title {
        font-weight: 500;
        font-size: toRpx(32);
        line-height: toRpx(44);
        color: #292D33;
      }

      &__practice-divider {
        width: toRpx(2);
        height: toRpx(48);
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      &__practice-divider-line {
        width: 100%;
        height: toRpx(32);
        background: #F5F7FA;
      }

      &__practice-bar-subtitle {
        font-size: toRpx(28);
        line-height: toRpx(44);
        color: #999EA8;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: toRpx(360);
      }

      &__practice-back {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 toRpx(16);
        height: toRpx(56);
        color: #999EA8;
        font-size: toRpx(26);
      }

      &__practice-webview {
        width: 100%;
        height: 100%;
      }

      &__practice-webview-wrap {
        position: absolute;
        left: 0;
        right: 0;
        top: toRpx(120); /* = right-box__practice-host-bar 高度 */
        bottom: 0;
        border-radius: toRpx(32);
        overflow: hidden;
      }
  
      &__stage-scroll {
        flex: 1;
        min-height: 0;
        padding: 0 toRpx(40) toRpx(24);
        box-sizing: border-box;
      }
  
      &__stage-card {
        width: 100%;
        background: rgba(255, 255, 255, 0.9);
        border-radius: toRpx(24);
        padding: toRpx(32);
        box-sizing: border-box;
      }
      &__stage-card-header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: toRpx(8);
        margin-bottom: toRpx(16);
      }
  
      &__stage-title {
        font-weight: 400;
        font-size: toRpx(26);
        line-height: toRpx(34);
        color: #292D33;
        margin-left: toRpx(8);
      }

      &__stage-progress {
        font-size: toRpx(24);
        line-height: toRpx(34);
        color: #9498a0;
      }
  
      /* Frame 67：对话气泡 + 信息卡片 */
      &__frame67 {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0;
        gap: toRpx(28);
      }

      &__msg-row {
        width: 100%;
        display: flex;
      }

      &__msg-row--left {
        justify-content: flex-start;
        padding-right: toRpx(112);
        box-sizing: border-box;
      }

      &__msg-row--right {
        justify-content: flex-end;
        padding-left: toRpx(112);
        box-sizing: border-box;
      }

      &__bubble {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        padding: toRpx(32);
        gap: toRpx(16);
        background: linear-gradient(180deg, #F5F7FA 0%, #FFFFFF 100%);
        border: toRpx(2) solid #F5F7FA;
      }

      &__bubble--left {
        width: 100%;
        max-width: toRpx(1090);
        border-radius: toRpx(32) toRpx(32) toRpx(32) toRpx(8);
      }

      &__bubble--right {
        width: 100%;
        max-width: toRpx(1044);
        border-radius: toRpx(32) toRpx(32) toRpx(8) toRpx(32);
      }

      &__bubble-head {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: toRpx(8);
        width: 100%;
      }

      &__bubble-icon {
        width: toRpx(32);
        height: toRpx(32);
        border-radius: 50%;
        background: #999EA8;
        opacity: 0.25;
        flex-shrink: 0;
      }

      &__bubble-title {
        flex: 1;
        font-size: toRpx(26);
        line-height: toRpx(32);
        color: #999EA8;
      }

      &__bubble-text {
        width: 100%;
        font-size: toRpx(28);
        line-height: toRpx(40);
        color: #6C6F75;
        word-break: break-all;
      }

      &__slot2 {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: toRpx(32);
        gap: toRpx(16);
        border-radius: toRpx(32);
      }

      &__slot2--practice {
        background: linear-gradient(180deg, rgba(44, 102, 247, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
        border: toRpx(2) solid rgba(44, 102, 247, 0.1);
      }

      &__slot2-inner {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: toRpx(32);
        gap: toRpx(16);
        border-radius: toRpx(32);
      }

      &__slot2-inner--diagnosis {
        background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(242, 71, 36, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
        opacity: 0.9;
        border: toRpx(2) solid rgba(44, 102, 247, 0.1);
      }

      &__slot2-inner--strategy {
        background: linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(180deg, rgba(255, 157, 10, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
        opacity: 0.9;
        border: toRpx(2) solid rgba(44, 102, 247, 0.1);
      }

      &__slot2-head {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
      }

      &__slot2-title {
        font-size: toRpx(28);
        line-height: toRpx(32);
        color: #292D33;
      }

      &__slot2-text {
        width: 100%;
        font-size: toRpx(28);
        line-height: toRpx(40);
        color: #292D33;
        word-break: break-all;
      }
  
      /* Frame 39 空状态 */
      &__empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: toRpx(24);
        gap: toRpx(24);
      }
  
      &__empty-visual {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: toRpx(8);
      }
  
      &__empty-icon-wrap {
        width: toRpx(160);
        height: toRpx(160);
        border-radius: toRpx(32);
        background: radial-gradient(50% 50% at 50% 50%, #eaf9f1 0%, #ffffff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
  
      &__empty-icon {
        transform: scale(1.65);
      }
  
      &__empty-pill {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: toRpx(260);
        height: toRpx(64);
        padding: toRpx(16) toRpx(32);
        box-sizing: border-box;
        background: #eaf9f1;
        border-radius: toRpx(16);
        font-weight: 500;
        font-size: toRpx(28);
        line-height: toRpx(32);
        text-align: center;
        color: #35c376;
      }
  
      &__empty-desc {
        font-size: toRpx(26);
        line-height: toRpx(30);
        text-align: center;
        color: #999ea8;
      }
  
      /* Frame 68 */
      &__footer {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: toRpx(40);
        gap: toRpx(20);
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: toRpx(176);
        box-sizing: border-box;
        background: #ffffff;
      }
  
      &__practice-bar {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: toRpx(20);
        gap: toRpx(16);
        width: 100%;
        box-sizing: border-box;
        min-height: toRpx(96);
        background: #f5f7fa;
        box-shadow: inset 0 0 toRpx(24) rgba(255, 255, 255, 0.6);
        border-radius: toRpx(16);
  
        &--unlocked {
          background: linear-gradient(180deg, #61C0FF 0%, #2C66F7 100%);
          box-shadow: inset 0 0 toRpx(24) rgba(255, 255, 255, 0.6);
          border-radius: toRpx(16);

          .right-box__practice-text {
            color: #ffffff;
          }
        }
      }
  
      &__practice-lock {
        width: toRpx(44);
        height: toRpx(44);
        flex-shrink: 0;
        border-radius: toRpx(6);
        border: toRpx(4) solid #999ea8;
        box-sizing: border-box;
        position: relative;
  
        &::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translate(-50%, toRpx(4));
          width: toRpx(22);
          height: toRpx(18);
          border: toRpx(4) solid #999ea8;
          border-bottom: none;
          border-radius: toRpx(22) toRpx(22) 0 0;
          box-sizing: border-box;
        }
      }
  
      &__practice-text {
        font-weight: 500;
        font-size: toRpx(30);
        line-height: toRpx(44);
        color: #999ea8;
      }
  
      .table-box {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 toRpx(40) toRpx(24);
        box-sizing: border-box;
  
        .table-content {
          width: 100%;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          border-radius: toRpx(16);
          overflow: hidden;
  
          .table-header {
            background-color: #edf3ff;
            border-radius: toRpx(16) toRpx(16) 0 0;
            height: toRpx(88);
            color: #000;
            font-size: toRpx(26);
            line-height: toRpx(40);
  
            .title-item {
              height: toRpx(88);
              justify-content: center;
              box-sizing: border-box;
              flex-shrink: 0;
              color: #000;
            }
          }
  
          .row-1 {
            width: toRpx(192);
          }
  
          .row-2 {
            width: toRpx(1042);
            border-right: toRpx(4) solid #fff;
            border-left: toRpx(4) solid #fff;
          }
  
          .row-3 {
            width: calc(100% - #{toRpx(1042 + 192)});
          }
  
          .table-content-scroll {
            flex: 1;
            min-height: 0;
  
            .table-content-item {
              display: flex;
              font-size: toRpx(26);
              background-color: #fafcff;
              box-sizing: border-box;
              border-top: toRpx(4) solid #fff;
  
              .row-1 {
                text-align: center;
                color: #333;
                align-items: center;
              }
  
              .row-1,
              .row-2,
              .row-3 {
                padding: toRpx(24) toRpx(40);
                vertical-align: middle;
              }
  
              .row-3 {
                align-items: center;
  
                .check-result-text {
                  color: #2cca74;
                  font-size: toRpx(24);
                  margin-left: toRpx(6);
                }
  
                .check-result-btn {
                  width: toRpx(120);
                  height: toRpx(56);
                  text-align: center;
                  line-height: toRpx(56);
                  color: #fff;
                  font-size: toRpx(24);
                  border-radius: toRpx(40);
                  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
                  &.disabled {
                    background: #d3dae6;
                    width: toRpx(140);
                  }
                }
              }
            }
          }
  
          .table-content-text {
            color: #71747a;
            line-height: toRpx(40);
          }
  
          .table-content-suggest {
            line-height: toRpx(40);
            .suggest-title {
              display: inline-block;
              color: #3b73ff;
              font-size: toRpx(24);
              padding: toRpx(4) toRpx(12);
              border-radius: toRpx(8);
              background: #eaf3fe;
              margin-top: toRpx(20);
              margin-right: toRpx(16);
            }
          }
        }
      }
    }
  }
  // 战败详情
  .popup-details-box {
    .detail-user-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .user-basic-info {
        display: flex;
        align-items: baseline;
        .user-name {
          font-size: toRpx(48);
          color: #333;
          font-weight: 500;
          margin-right: toRpx(20);
        }
        .user-phone {
          font-size: toRpx(32);
          color: #79859e;
        }
      }
      .role-tag-score {
        display: flex;
        align-items: center;
        .role-tag-score-text {
          font-size: toRpx(32);
          color: #eb4e4e;
        }
        .score-line {
          display: block;
          width: toRpx(2);
          height: toRpx(24);
          background-color: #d1dbe7;
          margin-left: toRpx(12);
          margin-right: toRpx(12);
        }
        .score-value {
          font-size: toRpx(32);
          color: #292d33;
        }
        .score-text-unit {
          font-size: toRpx(32);
          color: #292d33;
          margin-left: toRpx(4);
        }
      }
    }
    .role-box {
      display: flex;
      align-items: center;
      margin-top: toRpx(16);
  
      .role-tag {
        height: toRpx(44);
        line-height: toRpx(44);
        margin-right: toRpx(12);
        font-size: toRpx(22);
        color: #79859e;
        border-radius: toRpx(4);
        border: toRpx(2) solid #e8ecf0;
        padding: 0 toRpx(8);
      }
    }
    .detail-time-list {
      display: flex;
      justify-content: space-between;
      margin-top: toRpx(32);
      font-size: toRpx(32);
      .detail-time-item {
        display: flex;
        color: #999ea8;
      }
      .detail-time-value {
        color: #666;
        margin-left: toRpx(16);
      }
    }
    .identity-list {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: toRpx(32);
      margin-top: toRpx(48);
      .identity-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: toRpx(170);
        border-radius: toRpx(16);
        background-color: #f5f7fa;
        // margin-right: toRpx(32);
        &:nth-child(5n) {
          margin-right: 0;
        }
        .identity-title {
          font-size: toRpx(32);
          color: #383838;
        }
        .identity-desc {
          font-size: toRpx(40);
          color: #181a1f;
          margin-top: toRpx(16);
          &.bad {
            color: #eb4e4e;
          }
        }
      }
    }
  }
  .summary-content {
    line-height: toRpx(40);
  }
  </style>