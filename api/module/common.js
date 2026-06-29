import { method } from 'lodash'
import http from '../request/http'
import environment from '@/env'

module.exports = {
  /**获取APP更新 */
  getAPPVersion(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.findVersion',
      projectName: 'boutique',
      ...data
    })
  },
  // 查询接待素材
  findSoureList(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.soure.findSoureList',
      projectName: 'boutique',
      ...data
    })
  },
  // 查询门店支付配置
  findPayInfo(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.pay.findPayInfoConfigListByMerchantId',
      projectName: 'boutique',
      ...data
    })
  },
  // 接待客户信息保存
  saveRecCustomer(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.customer.saveRecCustomer',
      projectName: 'boutique',
      ...data
    })
  },
  searchRecordingEndTime(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.customer.searchRecordingEndTime',
      projectName: 'boutique',
      ...data
    })
  },

  getToken(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.customer.oss.getToken',
      projectName: 'boutique'
    })
  },
  // 历史订单列表
  getQuotationList(data) {
    return http.post({
      method: 'dj.api.smartcarlife.vehicle.damage.upgrade.quotation.page',
      projectName: 'boutique',
      ...data
    })
  },
  /** 获取门店主营车品牌 */
  getMerchantCarBrandList(merchantIdList) {
    return http.post(
      {
        method: 'merchants.api.open.merchant.info',
        projectName: 'merchants',
        merchantIdList,
        merchantInfoSwitch: {
          brandFlag: true
        }
      },
      false,
      'merchant'
    )
  },
  /**
   * 车型
   *
   */
  getCarBrandsList(data) {
    return http.post(
      {
        method: 'scrm.api.carlife.common.getCarSeriesList',
        ...data
      },
      false,
      'scrm'
    )
  },
  /**
   * 推荐人
   */
  getEmployeeList(data) {
    return http.post({
      // method: 'dj.api.smartcarlife.employee.getByMerchantId',
      method: 'dj.api.smartcarlife.employee.getByMerchantId.new',
      projectName: 'boutique',
      sceneList: [0],
      ...data
    })
  },

  /** 查询接待记录列表 */
  getReceptionList(data) {
    return http.post({
      method: 'dj.api.smartcarlife.reception.customer.page',
      projectName: 'boutique',
      ...data
    })
  },
  /** 接待统计 */
  getReceptionStatistics(data) {
    return http.post({
      method: 'dj.api.smartcarlife.reception.customer.statistics',
      projectName: 'boutique',
      ...data
    })
  },
  /** 埋点进入 */
  addRecord(data) {
    return http.post({
      method: 'dj.api.customer.dynamic.record.add',
      projectName: 'boutique',
      ...data
    })
  },
  /** 埋点离开 */
  leaveRecord(data) {
    return http.post({
      method: 'dj.api.customer.dynamic.record.leave',
      projectName: 'boutique',
      ...data
    })
  },

  /**创建小程序码 */
  createQrcode(data) {
    const envVersion = {
      0: 'develop',
      1: 'develop',
      2: 'trial',
      3: 'release',
      4: 'trial'
    }[environment.index]
    data.projectName = 'wechat'
    return http.fetch(
      'scrm.api.wechat.miniprogram.createQrcode',
      {
        envVersion,
        ...data
      },
      true,
      'scrm'
    )
  },
  /** 保存平板安装包信息 */
  saveOrUpdateEmployeeAppUsage(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.customer.saveOrUpdateEmployeeAppUsage',
      projectName: 'boutique',
      ...data
    })
  },
  checkAppUpload(data) {
    return http.post({
      method: 'dj.api.smartcarlife.recepiton.customer.checkAppUpload',
      projectName: 'boutique',
      ...data
    })
  },
  /** 系统消息埋点接口 */
  addSystemInfo(data) {
    return http.post({
      method: 'dj.api.smartcarlife.contentManagerTask.view.add',
      projectName: 'mindworkplate',
      ...data
    })
  },
  leaveSystemInfo(data) {
    return http.post({
      method: 'dj.api.smartcarlife.contentManagerTask.view.leave',
      projectName: 'mindworkplate',
      ...data
    })
  },
  /** 消息盒子 */
  // 获取客户标签分类信息
  getClassConfig(data = {}) {
    return http.post({
      method: 'dj.pad.api.list.script.config.class',
      projectName: 'pad',
      ...data
    })
  },
  // 查阅未阅读的优秀话术
  getUnreadRecord(data) {
    return http.post({
      method: 'dj.pad.api.list.unread.script.message.box.record',
      projectName: 'pad',
      ...data
    })
  },
  // 分页查询的优秀话术接口
  getPageRecord(data) {
    return http.post({
      method: 'dj.pad.api.page.script.message.box.record',
      projectName: 'pad',
      ...data
    })
  },
  // 更新话术状态
  updateMessageStatus(data) {
    return http.post({
      method: 'dj.pad.api.update.script.message.status',
      projectName: 'pad',
      ...data
    })
  },
  // 埋点
  extractExcellent(data) {
    return http.post({
      method: 'dj.pad.api.burying.point.script.extract.excellent.browse',
      projectName: 'pad',
      ...data
    })
  },
  // 消息盒子消息分页列表-新
  getBoxPage(data) {
    return http.post({
      method: 'dj.pad.api.new.pad.message.box.page',
      projectName: 'pad',
      ...data
    })
  },
  // 查询消息盒子消息详情 - 新
  getBoxDetail(data) {
    return http.post({
      method: 'dj.pad.api.new.pad.message.box.detail',
      projectName: 'pad',
      ...data
    })
  },
  // 长课程消息提醒 - 旧接口拆的新接口
  getLongCourseNotify(data = {}) {
    return http.post({
      method: 'dj.pad.api.staff.long.course.message.notify',
      projectName: 'pad',
      ...data
    })
  },
  // 企业通知消息提醒 - 旧接口拆的新接口
  getEnterpriseNotify(data = {}) {
    return http.post({
      method: 'dj.pad.api.staff.enterprise.message.notify',
      projectName: 'pad',
      ...data
    })
  },
  // 录音学习记录管理
  insertLearningRecord(data) {
    return http.post({
      method: 'dj.api.strategy.monitor.insertOrUpdateLearningRecord',
      projectName: 'pad',
      ...data
    })
  },
  /** 系统消息接口 */
  // 分页查询系统消息
  getTaskInfo(data) {
    return http.post({
      method: 'dj.pad.api.contentManagerTask.page',
      projectName: 'pad',
      ...data
    })
  },
  // 查询系统详细信息
  getTaskById(data) {
    return http.post({
      method: 'dj.pad.api.contentManagerTask.getById',
      projectName: 'pad',
      ...data
    })
  },
  // 根据状态查询消息数量
  getMessageCount(data) {
    return http.post({
      method: 'dj.pad.api.message.box.count.by.status',
      projectName: 'pad',
      ...data
    })
  },
  // 获取ai智能体入口
  getAiagentList(data) {
    return http.post({
      method: 'dj.pad.api.aiagent.get.entry.list',
      projectName: 'pad',
      ...data
    })
  },
  // 预警消息
  getWarningPage(data) {
    return http.post({
      method: 'dj.pad.api.message.box.findWarningNotificationPage',
      projectName: 'pad',
      ...data
    })
  },

  recordInsert(data) {
    return http.post(
      {
        method: 'clue.api.burial.point.record.batch.insert',
        projectName: 'clue',
        ...data
      },
      false,
      'scrm'
    )
  },
  //获取北森代办数量
  getUnreadCount(data) {
    return http.post(
      {
        // method: 'dj.pad.api.beisen.getUnreadCount',
        method: 'dj.pad.api.staff.getUnreadCount', // 修改为sop+北森的未读数
        projectName: 'pad',
        ...data
      },
      true
    )
  },
  //获取北森SSO鉴权
  findBeiSenSSOToken(data) {
    return http.post(
      {
        method: 'dj.pad.api.beisen.findBeiSenSSOToken',
        projectName: 'pad',
        ...data
      },
      true
    )
  },
  //北森埋点进入
  dynamicrecordAdd(data) {
    return http.post({
      method: 'dj.pad.api.beisen.dynamicrecord.add',
      projectName: 'pad',
      ...data
    })
  },
  //更新埋点离开信息
  dynamicrecordLeave(data) {
    return http.post({
      method: 'dj.pad.api.beisen.dynamicrecord.leave',
      projectName: 'pad',
      ...data
    })
  },
  // 更新所有sop- AI导师通知消息状态
  updateSopAiAgentMessageStatus(data) {
    return http.post({
      method: 'dj.pad.api.update.script.all.sop.message.status',
      projectName: 'pad',
      ...data
    })
  },
  // 分页查询AI导师推送消息
  getSopAiAgentMessageList(data) {
    return http.post({
      method: 'dj.pad.api.page.script.sop.message.box.record',
      projectName: 'pad',
      ...data
    })
  },
  // 根据状态查询AI导师推送消息数量
  getSopAiAgentMessageCount(data) {
    return http.post({
      method: 'dj.pad.api.message.box.count.sop.message',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心、分页列表
  getStudyCenterList(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.page',
      projectName: 'pad',
      ...data
    })
  },
  // 查询当前员工的消息弹窗
  getMessagePop(data) {
    return http.post({
      method: 'dj.pad.api.staff.message.notify',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心-员工课程阅读
  getStudyCenterRead(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.course.read',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心-员工课程统计
  getStudyCenterStatistics(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.summary',
      projectName: 'pad',
      ...data
    })
  },
  // 服务中心-消息汇总
  getMessageSummary(data) {
    return http.post({
      method: 'dj.pad.api.page.script.sop.message.summary.list',
      projectName: 'pad',
      ...data
    })
  },
  // 课程消息提醒列表
  getCourseList(data) {
    return http.post({
      method: 'dj.pad.api.page.script.sop.message.course.list',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心-学习看板
  getStudyBoard(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.bulletin.board',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心-课程任务分页
  getCourseTaskPage(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.course.task.page',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心-短课程详情
  getShortCourseDetail(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.short.course.detail',
      projectName: 'pad',
      ...data
    })
  },
    // 学习中心-轻改短课程详情
    getLightShortCourseDetail(data) {
      return http.post({
        method: 'dj.pad.api.staff.light.short.course.task.detail',
        projectName: 'pad',
        ...data
      })
    },
        // 学习中心-轻改短课程改进明细
        getImprovementDetails(data) {
          return http.get({
            method: 'http://192.168.1.173:8422/data?recording_id=100002',
          })
        },
  // 学习中心-轻改短课程任务明细完成复盘
  finishLightShortCourseReview(data) {
    return http.post({
      method: 'dj.pad.api.staff.light.short.course.detail.finishReview',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心-长课程详情
  getLongCourseDetail(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.long.course.detail',
      projectName: 'pad',
      ...data
    })
  },
  // 获取智能体
  getAiAgentList(data) {
    return http.post({
      method: 'dj.pad.api.aiagent.get.special.agent',
      projectName: 'pad',
      ...data
    })
  },
  // 学习任务确认消息弹窗
  getStudyTaskConfirm(data) {
    return http.post({
      method: 'dj.pad.api.staff.message.confirm',
      projectName: 'pad',
      ...data
    })
  },
  // 学习中心-员工学习中心权限授权校验
  getStudyCenterPermission(data) {
    return http.post({
      method: 'dj.pad.api.staff.study.center.access.auth.verify',
      projectName: 'pad',
      ...data
    })
  },
  // 活动消息列表
  getActivityMessageList(data) {
    return http.post({
      method: 'dj.pad.api.page.activity.message.list',
      projectName: 'pad',
      ...data
    })
  },
  // 更新活动消息状态
  updateActivityMessageStatus(data) {
    return http.post({
      method: 'dj.pad.api.activity.message.update',
      projectName: 'pad',
      ...data
    })
  },
  // 新 学习中心 - 开始测评
  startExam(data) {
    return http.post({
      method: 'dj.api.pad.learning.center.level.exam',
      projectName: 'pad',
      ...data
    })
  },
  // 新 学习中心 - 员工学习时长统计
  getStudyCenterTimeStatistics(data) {
    return http.post({
      method: 'dj.pad.api.course.staff.statistics',
      projectName: 'pad',
      ...data
    })
  },
  //  新 学习中心 - 我的课程 ，带状态的分页接口
  getMyCourseList(data) {
    return http.post({
      method: 'dj.api.pad.learning.center.myself.course',
      projectName: 'pad',
      ...data
    })
  },
  //  新 学习中心 - 推荐课程
  getRecommendCourseList(data) {
    return http.post({
      method: 'dj.api.pad.learning.center.myself.course.recommend',
      projectName: 'pad',
      ...data
    })
  },
  // 新 学习中心 - 查询考试分页接口
  getExamPage(data) {
    return http.post({
      method: 'dj.pad.api.recommended.staff.examination.page',
      projectName: 'pad',
      ...data
    })
  },
  // 新 学习中心 - 考试统计
  getExamStatistics(data) {
    return http.post({
      method: 'dj.pad.api.recommended.staff.examination.count',
      projectName: 'pad',
      ...data
    })
  },
  // 新 学习中心 - 排行榜
  getStudyDurationRank(data) {
    return http.post({
      method: 'dj.pad.api.recommended.staff.study.duration.rank',
      projectName: 'pad',
      ...data
    })
  },
  // 新学习中心 - 全部课程
  getALlCourse(data) {
    return http.post({
      method: 'dj.pad.api.recommended.course.page',
      projectName: 'pad',
      ...data
    })
  },
  // 新学习中心 - 课程分类树
  getCourseCategoryTree(data = {}) {
    return http.post({
      method: 'dj.pad.api.course.category.list.tree',
      projectName: 'pad',
      ...data
    })
  },
  // 新学习中心 - 员工学习中心剩余时间
  getStudyCenterResidueTime(data = {}) {
    return http.post({
      method: 'dj.api.pad.learning.center.residue.time',
      projectName: 'pad',
      ...data
    })
  },
  // 新学习中心 - 查询我的课程页签数量
  getMyCourseTabCount(data = {}) {
    return http.post({
      method: 'dj.api.pad.learning.center.myself.course.count',
      projectName: 'pad',
      ...data
    })
  },
  // 新学习中心 - 考试结果
  getExamResult(data = {}) {
    return http.post({
      method: 'dj.api.pad.learning.center.beisen.exam.result',
      projectName: 'pad',
      ...data
    })
  },
  // 限制录单
  getLimitRecord(data = {}) {
    return http.post({
      method: 'dj.api.pad.learning.center.study.permission',
      projectName: 'pad',
      ...data
    })
  },
  // VIN车架号校验
  checkVinValidate(data = {}) {
    return http.post({
      method: 'dj.pad.api.vin.validate',
      projectName: 'pad',
      ...data
    })
  },
  // 工资新增申诉
  addWageAppeal(data={}) {
    return http.post({
      method: 'dj.api.staff.miniprogram.salaryapply.pad.create',
      projectName: 'staffMiniprogram',
      ...data,
    })
  },
  // 工资申诉概览信息（包含申诉状态、申诉类型、申诉时间等）
  getWageAppealOverview(data={}) {
    return http.post({
      method: 'dj.api.staff.miniprogram.salaryapply.summary',
      projectName: 'staffMiniprogram',
      ...data,
    })
  },
  // 工资申诉订单统计查询
  getWageAppealStatistics(data={}) {
    return http.post({
      method: 'dj.api.staff.miniprogram.salaryapply.order.statistics',
      projectName: 'staffMiniprogram',
      ...data,
    })
  },
  // 工资申诉复议记录
  replyList(data={}) {
    return http.post({
      method: 'dj.api.staff.miniprogram.salaryapply.reply.list',
      projectName: 'staffMiniprogram',
      ...data,
    })
  },
  // 工资申诉最新记录查询
  getWageAppealLatestRecord(data={}) {
    return http.post({
      method: 'dj.api.staff.miniprogram.salaryapply.latest',
      projectName: 'staffMiniprogram',
      ...data,
    })
  },
    // 异常订单锁单信息查询
    getAbnormalOrderLock(data = {}) {
      return http.post({
        method: 'dj.api.smartcarlife.goodsOrder.abnormalOrder.lock.select',
        projectName: 'boutique',
        ...data
      })
    },
  /**
   * 检查今天是否在T1-T5之间
   */

  checkTodayInT1T5(data={}) {
    return http.post({
      method: 'dj.api.staff.miniprogram.salaryapply.daily.report.fill.check',
      projectName: 'staffMiniprogram',
      ...data,
    })
  },
  // 工资申诉入口判断
  getWageAppealEntrance(data={}) {
    return http.post({
      method: 'dj.staff.api.has.performance.config.formerchant',
      projectName: 'staffMiniprogram',
      ...data,
    })
  },
  /** OCR 识别 */
  orcRecognition(data = {}) {
    return http.post({
      method: 'dj.api.common.ocr.recognition',
      projectName: 'boutique',
      ...data,
    })
  },

  /**
   * 查询门店分类
   * 
   */
  getSceneByMerchantId(data = {}) {
    return http.post({
      method: 'dj.api.scenemerchantref.findAllSceneByMerchantId',
      projectName: 'boutique',
      ...data
    })
  },
}
