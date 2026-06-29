<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view class="back" @click="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">服务中心</view>
    </view>
    <view class="detail-content">
      <view class="detail-left">
        <ServiceList :moduleType="moduleType" :messageList="messageList" :topListProp="topList" @handleClick="handleClick" />
      </view>
      <view class="detail-right">
        <view class="common-title">
          <view>{{ moduleTypeEnum[moduleType] }}</view>
          <view class="stick-top" @click="handleStickTop">
            <view class="sprite-icon icon-stick-top-blue"></view>
            {{ topList.includes(Number(moduleType)) ? '取消置顶' : '置顶' }}
          </view>
        </view>
        <scroll-view scroll-y class="service-list" @scrolltolower="pageonReachBottom" :scroll-top="scrollTop">
          <view class="service-item" v-for="(item, index) in formattedList" :key="index" @click="handleDetail(item)">
            <view class="service-item-title">
              <view class="service-item-title-left">
                <view class="dot-value" v-if="showDot(item)"></view>
                {{ item.displayTitle }}
              </view>
              <view class="service-item-title-right">
                <view>查看详情</view>
                <view class="sprite-icon icon-coupon-arrow"></view>
              </view>
            </view>
            <view class="service-item-text" v-if="item.taskNameRow">{{ item.taskNameRow }}</view>
            <view class="service-item-text" v-if="item.finishTimeRow">{{ item.finishTimeRow }}</view>
            <view class="service-item-text">{{ item.reminderTimeRow }}</view>
            <view class="service-item-text" v-if="item.contentRow">{{ item.contentRow }}</view>
          </view>
          <template v-if="nothing">
            <view class="end-text">-已经到底了-</view>
          </template>
        </scroll-view>
      </view>
    </view>
    <uni-transition :show="noticeTips" mode="slide-top">
      <view class="notice-tips">
        <!-- <view class="sprite-icon icon-notice-success"></view> -->
        <view>{{ topList.includes(Number(moduleType)) ? '置顶成功' : '取消置顶' }}</view>
      </view>
    </uni-transition>
  </view>
</template>
<script>
const PAGE_SIZE = 10
const PAGE_NUM = 1
let timer = null
import dayjs from 'dayjs'
import { moduleTypeEnum, moduleContentEnum, reminderTypeEnum } from './components/contant'
import ServiceList from './components/ServiceList.vue'
import { getMessageSummary } from '../../../api/module/common'
export default {
  name: 'ServiceDetail',
  components: {
    ServiceList
  },
  data() {
    return {
      moduleTypeEnum,
      moduleContentEnum,
      reminderTypeEnum,
      moduleType: null,
      topList: [],
      scriptList: [],
      earlyWarnList: [],
      systemList: [],
      shortCourseList: [],
      lightShortCourseList: [],
      longCourseList: [],
      activityList: [],
      caseList: [],
      total: 0,
      nothing: false,
      pageNum: 1,
      pageSize: 10,
      scrollTop: 0,
      isLoading: false,
      userInfo: {},
      noticeTips: false,
      messageList: [],
      isfirst: true
    }
  },
  computed: {
    formattedList() {
      const moduleType = Number(this.moduleType)
      return this.list.map(item => {
        let displayTitle = ''
        let taskNameRow = ''
        let finishTimeRow = ''
        let contentRow = ''

        // 标题逻辑
        if (moduleType === 3 || moduleType === 4 || moduleType === 9) {
          displayTitle = item.title
        } else if (moduleType === 7) {
          displayTitle = this.reminderTypeEnum[item.reminderType]
        } else {
          displayTitle = this.moduleTypeEnum[moduleType]
        }

        // 时间格式化辅助函数
        const fmt = (t) => this.formatTime(t, 'YYYY-MM-DD HH:mm:ss')

        // 任务和内容逻辑
        if (moduleType === 3 || moduleType === 4 || moduleType === 9) {
          if (item.taskType == 1) {
            taskNameRow = `学习任务名称：${item.taskName}`
            finishTimeRow = `任务完成时间：小伙伴，请于${fmt(item.finishTime)}完成哦～`
          } else if (item.taskType == 2) {
            if (item.moduleType == 6) {
              taskNameRow = `学习任务名称：${item.taskName}`
              finishTimeRow = `学习任务时间：您有未完成的学习任务即将到期：${fmt(item.finishTime)}，抓紧时间完成哦！`
            } else {
              contentRow = `提醒内容：您有未完成的学习任务即将到期：${fmt(item.finishTime)}，抓紧时间完成哦！`
            }
          }
        } else if (moduleType === 7) {
          taskNameRow = `学习任务名称：${item.msgTitle}`
          if (item.reminderType == 1) {
            finishTimeRow = `任务完成时间：小伙伴，请于${fmt(item.taskEndTime)}完成哦～`
          } else if (item.reminderType == 2) {
            finishTimeRow = `任务完成时间：您有未完成的学习任务即将到期：${fmt(item.taskEndTime)}，抓紧时间完成哦！`
          }
        } else if (moduleType === 1 || moduleType === 2) {
          contentRow = `提醒内容：${this.moduleContentEnum[moduleType]}`
        } else if (moduleType === 0) {
          contentRow = `提醒内容：${item.title}`
        } else if (moduleType === 5) {
          contentRow = `提醒内容：${item.content}`
        }

        // 提醒时间
        const reminderTimeRow = `提醒时间：${item.time || fmt(item.createdTime)}`

        return {
          ...item,
          displayTitle,
          taskNameRow,
          finishTimeRow,
          contentRow,
          reminderTimeRow
        }
      })
    },
    list() {
      switch (this.moduleType) {
        case 0:
          return this.systemList
        case 1:
          return this.scriptList
        case 2:
          return this.earlyWarnList
        case 3:
          return this.shortCourseList
        case 9:
          return this.lightShortCourseList
        case 4:
          return this.longCourseList
        case 5:
          return this.activityList
        case 7:
          return this.caseList
        default:
          return []
      }
    }
  },
  watch: {
    moduleType: {
      handler(newVal) {
        this.getRightList(newVal)
      }
    }
  },
  onLoad(options) {
    this.userInfo = uni.$storage.get('userInfo')
    this.getTopInfo()
    this.moduleType = Number(options.moduleType)
    this.isfirst = false
  },
  onShow() {
    if (!this.isfirst) {
      this.getMessageSummary(this.userInfo.sceneType)
      console.log(this.moduleType, 'moduleType')
      this.getRightList(this.moduleType)
    }
  },
  methods: {
    formatTime(time, formatStr) {
      if (!time) return '-'
      return dayjs(time).format(formatStr)
    },
    showDot(item) {
      const moduleType = Number(this.moduleType)
      if (moduleType === 0) {
        return !item.readFlag
      }
      if ([1, 2, 3, 4, 5, 6, 7, 9].includes(moduleType)) {
        return item.status == 0
      }
      return false
    },
    // 获取服务中心列表
    async getMessageSummary(sceneType) {
      // const userInfo = uni.$storage.get('userInfo')
      const res = await getMessageSummary({ businessType: sceneType })
      this.messageList = res
    },
    getRightList(val) {
      switch (val) {
        case 0:
          this.getSystemPage()
          break
        case 1:
          this.getScriptList()
          break
        case 2:
          this.getWarningPage()
          break
        case 3:
          this.getCourseList(3)
          break
        case 9:
          this.getCourseList(9)
          break
        case 4:
          this.getCourseList(4)
          break
        case 5:
          this.getActivityList()
          break
        case 7:
          this.getBoxList(7)
          break
        default:
          break
      }
    },
    // 获取缓存中置顶的列表
    getTopInfo() {
      const { phone, shopMerchantId, sceneType } = this.userInfo
      this.getMessageSummary(sceneType)
      const _topInfo = uni.$storage.get('noticeTopInfo') || {}
      const key = `${phone}-${shopMerchantId}-${sceneType}`
      this.topList = _topInfo[key] || []
    },
    backPage() {
      uni.navigateBack({
        success: res => {
          this.getMessageSummary(this.userInfo.sceneType)
          uni.$emit('messageBackHome', this.topList)
          uni.$emit('pageBack')
        }
      })
    },
    handleClick(item) {
      // 如果点击的是同一个模块类型，则不进行操作
      if (this.moduleType === item.moduleType) {
        return
      }
      this.moduleType = item.moduleType
      this.pageNum = PAGE_NUM
      this.pageSize = PAGE_SIZE
      this.scrollTop = 0
      this.nothing = false
      setTimeout(() => {
        this.scrollTop = 0
      }, 100)
    },
    // 企业通知列表
    async getSystemPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const res = await uni.$api.commonApi.getTaskInfo({
          pageNum,
          pageSize
        })
        res.list?.length &&
          res.list.map(e => {
            e.time = e.actualSendTimeStr
          })
        if (pageNum == 1) {
          this.systemList = res.list
        } else {
          this.systemList = this.systemList.concat(res.list)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    // 优秀话术列表
    async getScriptList() {
      try {
        uni.showLoading({
          mask: true
        })
        const { sceneType, uuid } = uni.$storage.get('userInfo')
        const { pageNum, pageSize } = this
        let businessTypeList = []
        if (sceneType == 0) {
          businessTypeList = [0, 2]
        } else if (sceneType == 1) {
          businessTypeList = [1]
        }
        const params = {
          // businessType: sceneType,
          businessTypeList,
          uuid,
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getPageRecord(params)
        res.list?.length &&
          res.list.map(e => {
            e.time = dayjs(new Date(e.pushTime)).format('YYYY-MM-DD HH:mm:ss')
          })
        if (pageNum == 1) {
          this.scriptList = res.list
        } else {
          this.scriptList = this.scriptList.concat(res.list)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    // 违规话术列表
    async getWarningPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const params = {
          pageNum,
          pageSize
        }
        const res = await uni.$api.commonApi.getWarningPage(params)
        res.list?.length &&
          res.list.map(e => {
            e.time = dayjs(new Date(e.warningTime)).format('YYYY-MM-DD HH:mm:ss')
          })
        if (pageNum == 1) {
          this.earlyWarnList = res.list
          console.log(this.earlyWarnList, '===')
        } else {
          this.earlyWarnList = this.earlyWarnList.concat(res.list)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    /**
     * 页面触底时的处理函数
     * 当页面触底时，判断是否还有更多数据，如果有则加载下一页数据
     * 如果没有更多数据，则标记为没有更多数据状态
     */
    pageonReachBottom() {
      console.log('到底了')
      // 解构赋值，设置 nothing 的默认值
      let { pageNum, total, nothing = 'nothing', pageSize } = this

      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1
        // 根据 firstIndex 的值调用不同的方法
        switch (this.moduleType) {
          case 1:
            try {
              this.getMessagePage()
            } catch (error) {
              console.error('调用 getMessagePage 方法时出错:', error)
            }
            break
          case 0:
            try {
              this.getSystemPage()
            } catch (error) {
              console.error('调用 getSystemPage 方法时出错:', error)
            }
            break
          case 2:
            try {
              this.getWarningPage()
            } catch (error) {
              console.error('调用 getWarningPage 方法时出错:', error)
            }
            break
          case 3:
            try {
              this.getCourseList(3)
            } catch (error) {
              console.error('调用 getCourseList 方法时出错:', error)
            }
            break
          case 9:
            try {
              this.getCourseList(9)
            } catch (error) {
              console.error('调用 getCourseList 方法时出错:', error)
            }
            break
          case 4:
            try {
              this.getCourseList(4)
            } catch (error) {
              console.error('调用 getCourseList 方法时出错:', error)
            }
            break
          case 5:
            try {
              this.getActivityList()
            } catch (error) {
              console.error('调用 getActivityList 方法时出错:', error)
            }
            break
          default:
            break
        }
      } else {
        this.nothing = true
      }
    },
    // 查看详情
    async handleDetail(item) {
      console.log(item, this.moduleType)
      const { moduleType } = this
      switch (moduleType) {
        case 0:
          console.log('企业消息跳转')
          let res = ''
          if (item.moduleType == 8) {
            res = (await uni.$api.commonApi.getBoxDetail({ id: item.id }))?.msgDetail
          } else {
            res = await uni.$api.commonApi.getTaskById({ id: item.id })
          }
          const _row = encodeURIComponent(JSON.stringify(res))
          if (res.contentType == 1) {
            uni.navigateTo({
              url: `/pages/common/systemDetail?row=${_row}`
            })
          } else if (res.contentType == 2) {
            console.log(JSON.parse(res.content))
            const _content = res.content ? JSON.parse(res.content) : []
            const url = _content[0]
            const { content, title, id } = res
            uni.navigateTo({
              // url: `/pages/common/msgwebview?url=${url}&title=${title}&id=${id}`
              url: `/pages/common/imgPreview?tabName=${title}&sourceType=2&detailUrl=${url}&row=${_row}`
            })
          } else if (res.contentType == 3) {
            const _content = res.content ? JSON.parse(res.content) : []
            const url = _content[0].image
            const { content, title, id } = res
            uni.navigateTo({
              url: `/pages/common/msgwebview?fileUrl=${url}&title=${title}&id=${id}&row=${_row}`
            })
          }
          break
        case 1:
          console.log('优秀话术跳转')
          uni.navigateTo({
            url: `/pages/common/messageDetail?row=${encodeURIComponent(JSON.stringify(item))}&type=service`,
            fail: err => {
              console.error('页面跳转失败:', err)
            }
          })
          break
        case 2:
          console.log('违规话术跳转')
          uni.navigateTo({
            url: `/pages/common/earlyWarnDetail?row=${encodeURIComponent(JSON.stringify(item))}`,
            fail: err => {
              console.error('页面跳转失败:', err)
            }
          })
          break
        case 3:
          console.log('短课程学习跳转')
          uni.$track.add({ eventCode: 'app_short_course', businessId: item.detailId, pagePath: '/pages/common/serviceDetail/index' })
          // const row = {
          //   ...item,
          // }
          // row.id = item.detailId
          uni.navigateTo({
            url: `/pages/common/studyDetail/shortCourse?row=${encodeURIComponent(JSON.stringify(item))}&completeStatus=${item.completeStatus}&from=service`,
            fail: err => {
              console.error('页面跳转失败:', err)
            }
          })
          break
        case 4:
          console.log('长课程学习跳转')
          if (item.moduleType == 4) {
            // 长课程配置的任务
            uni.navigateTo({
              url: `/pages/common/studyDetail/longCourse?row=${encodeURIComponent(JSON.stringify(item))}&completeStatus=${item.completeStatus}&from=service`,
              fail: err => {
                console.error('页面跳转失败:', err)
              }
            })
          } else if (item.moduleType == 6) {
            // 策略中心配置的长课程任务
            uni.navigateTo({
              url: `/pages/common/studyDetail/caseCourse?id=${item.id}`,
              fail: err => {
                console.error('页面跳转失败:', err)
              }
            })
          }
          break
        case 5:
          console.log('活动消息跳转')
          if (item.status == 0) {
            await uni.$api.commonApi.updateActivityMessageStatus({
              msgId: item.msgId
            })
          }
          uni.navigateBack({
            delta: 1
          })
          uni.$emit('ActivityCenter')
          break
        case 7:
          console.log('优秀案例学习跳转')
          uni.navigateTo({
            url: `/pages/common/caseDetail/index?id=${item.id}`,
            fail: err => {
              console.error('页面跳转失败:', err)
            }
          })
          break
          case 9:
          console.log('轻改短课程学习跳转')
          uni.$track.add({ eventCode: 'app_short_course', businessId: item.detailId, pagePath: '/pages/common/serviceDetail/index' })
          // const row = {
          //   ...item,
          // }
          // row.id = item.detailId
          uni.navigateTo({
            url: `/pages/common/studyDetail/shortCourseLearnRoom?row=${encodeURIComponent(JSON.stringify(item))}&completeStatus=${item.completeStatus}&from=service`,
            fail: err => {
              console.error('页面跳转失败:', err)
            }
          })
          break
        default:
          break
      }
    },
    // 长短课程列表
    async getCourseList(moduleType) {
      try {
        uni.showLoading({
          mask: true
        })
        const { pageNum, pageSize } = this
        const res = await uni.$api.commonApi.getCourseList({
          pageNum,
          pageSize,
          moduleType
        })
        res.list?.length &&
          res.list.map(e => {
            e.time = e.actualSendTimeStr
          })
        if (pageNum == 1) {
          if (moduleType == 3) this.shortCourseList = res.list
          else if (moduleType == 4) this.longCourseList = res.list
          else if (moduleType == 9) this.lightShortCourseList = res.list
        } else {
          if (moduleType == 3) this.shortCourseList = this.shortCourseList.concat(res.list)
          else if (moduleType == 4) this.longCourseList = this.longCourseList.concat(res.list)
          else if (moduleType == 9) this.lightShortCourseList = this.lightShortCourseList.concat(res.list)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    // 活动消息列表
    async getActivityList() {
      try {
        uni.showLoading({
          mask: true
        })
        const { sceneType } = uni.$storage.get('userInfo')
        const { pageNum, pageSize } = this
        const res = await uni.$api.commonApi.getActivityMessageList({
          pageNum,
          pageSize,
          businessType: sceneType
        })
        res.list?.length &&
          res.list.map(e => {
            e.time = e.createTime
          })
        if (pageNum == 1) {
          this.activityList = res.list || []
        } else {
          this.activityList = this.activityList.concat(res.list || [])
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    // 优秀案例学习列表
    async getBoxList(moduleType) {
      try {
        uni.showLoading({
          mask: true
        })
        const { sceneType } = uni.$storage.get('userInfo')
        const { pageNum, pageSize } = this
        const res = await uni.$api.commonApi.getBoxPage({
          pageNum,
          pageSize,
          moduleType: moduleType, // 7-优秀案例分享策略
          businessType: sceneType
        })
        res.list?.length &&
          res.list.map(e => {
            e.time = e.createTime
          })
        if (pageNum == 1) {
          this.caseList = res.list || []
        } else {
          this.caseList = this.caseList.concat(res.list || [])
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    // 置顶,取消置顶
    handleStickTop() {
      clearTimeout(timer)
      const { phone, shopMerchantId, sceneType } = this.userInfo
      const _topInfo = uni.$storage.get('noticeTopInfo') || {}
      const key = `${phone}-${shopMerchantId}-${sceneType}`
      let _topList = _topInfo[key] || []
      if (_topList.includes(this.moduleType)) {
        _topList = _topList.filter(item => item !== this.moduleType)
      } else {
        _topList.push(this.moduleType)
      }
      _topInfo[key] = _topList
      this.topList = _topList
      this.noticeTips = true
      timer = setTimeout(() => {
        this.noticeTips = false
      }, 3000)
      uni.$storage.set('noticeTopInfo', _topInfo)
    }
  }
}
</script>
<style scoped lang="scss">
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
  height: calc(100vh - #{toRpx(212)});

  .detail-left {
    width: toRpx(800);
    height: 100%;
    border-radius: toRpx(48);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    margin-right: toRpx(32);
    padding-top: toRpx(32);
  }

  .detail-right {
    // width: toRpx(1368);
    width: calc(100% - #{toRpx(832)});
    height: 100%;
    border-radius: toRpx(48);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    z-index: 1;
    overflow: hidden;

    .common-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stick-top {
      height: toRpx(50);
      border-radius: toRpx(530);
      background: #4673ff1a;
      color: #4673ff;
      font-size: toRpx(24);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: toRpx(48);
      padding: 0 toRpx(16);

      .sprite-icon {
        margin-right: toRpx(4);
      }
    }

    .service-list {
      width: 100%;
      height: calc(100% - #{toRpx(120)});

      .service-item {
        width: calc(100% - #{toRpx(96)});
        background: #fff;
        border-radius: toRpx(16);
        padding: toRpx(24) toRpx(32);
        margin-left: toRpx(48);
        margin-right: toRpx(48);

        &:not(:last-child) {
          margin-bottom: toRpx(32);
        }
        &-title-left {
          display: flex;
          align-items: center;
          .dot-value {
            width: toRpx(12);
            height: toRpx(12);
            border-radius: 50%;
            background: #f24724;
            margin-right: toRpx(24);
          }
        }
        &-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #333333;
          font-size: toRpx(32);
          font-weight: 500;
          &-right {
            display: flex;
            align-items: center;
            color: #999999;
            font-size: toRpx(24);
          }
        }

        &-text {
          color: #999999;
          font-size: toRpx(28);
          margin-top: toRpx(16);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      }
    }
  }
}
.end-text {
  color: #999;
  text-align: center;
  padding: toRpx(30) 0;
  font-size: toRpx(24);
}
.notice-tips {
  position: fixed;
  top: toRpx(150);
  width: toRpx(400);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: toRpx(28);
  padding: toRpx(16) toRpx(24);
  border-radius: toRpx(8);
  z-index: 1;
  background-color: #000000cc;
}
</style>
