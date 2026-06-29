<template>
  <view class="record-box">
    <view class="data-container">
      <view class="control-box flex">
        <view class="tabs">
          <page-tabs
            :list="tabList"
            @changeTab="changeTab"
          />
        </view>
        <view class="select-box-list select-component flex">
          <template v-if="tabIndex == 0">
            <select-component
              :selectList="orderTypeList"
              @chooseType="searchReceptionList($event,'orderFinishFlag')"
            />
            <select-component
              :selectList="receptionTypeList"
              @chooseType="searchReceptionList($event,'reviewFlag')"
            />
          </template>
        </view>
        <template v-if="tabIndex == 1">
          <select-component
            class="select-component"
            :selectList="uploadTypeList"
            @chooseType="changeUploadType"
          />
        </template>
      </view>
      <scroll-view
        class="record-list"
        scroll-y
        @scrolltolower="pageonReachBottom"
      >
        <view
          class="record-tips flex"
          v-if="tabIndex == 1 && isPrePage && list.length && list[0] && list[0].length"
        >
          <uni-icons
            type="info"
            :size="16"
            color="#FF9D0A"
            class="icon"
          ></uni-icons>
          以下非正常结束的接待记录，需要进行信息确认后才能提交到系统。
        </view>
        <view class="list">
          <template v-if="flag">
            <template v-if="list.length && list[0] && list[0].length">
              <template v-for="i in list">
                <template>
                  <view
                    v-for="item in i"
                    class="item"
                    :key="item.id"
                    @click="jumpDetail(item)"
                  >
                    <view class="top-right-box flex">
                      <template v-if="tabIndex == 0">
                        <view :class="['status flex',`${item.reviewFlag == 0?'deal':'disabled'}`]">
                          {{item.reviewFlag == 0 ?'已复盘':'未复盘'}}
                        </view>
                        <view :class="['status flex', { 'deal': item.orderFinishFlag }]">
                          {{item.orderFinishFlag? '成交': '战败'}}
                        </view>
                      </template>
                      <template v-else>
                        <view @click.stop="handleDelete(item)">
                          <uni-icons type="trash" :size="18" color="#999"></uni-icons>
                        </view>
                      </template>
                      <!-- <template v-else>
                        <view :class="[
                        'status flex',
                        {'disabled':item.receptionStatus !== 1 && item.receptionStatus !== 0 },
                        { 'deal': item.receptionStatus == 1 }
                        ]">
                          <template v-if="item.receptionStatus === 1 || item.receptionStatus === 0">
                            {{ {
                            1: '成交',
                            0: '战败'
                          }[item.receptionStatus]}}
                          </template>
                          <template v-else>
                            未知
                          </template>
                        </view>
                      </template> -->
                    </view>
                    <view class="name">
                      {{ item.customerName ? item.customerName : '未填写姓名' }}
                    </view>
                    <view class="goods-name">{{ item.carModel ? item.carModel : '未选择车型' }}</view>
                    <template>
                      <view
                        v-for="(k, ind) in itemObject"
                        class="info flex"
                        :key="ind"
                      >
                        <view class="label">{{ k.label }}</view>
                        <view class="value">{{ formatValue(item[k.key], k.key) || '— —' }}</view>
                      </view>
                    </template>
                  </view>
                </template>
              </template>
            </template>
            <template v-else>
              <view class="nothing flex">
                <image
                  class="icon"
                  src="../../../../assets/images/home/nothing.webp"
                />
                暂无接待记录
              </view>
            </template>
          </template>
        </view>
        <template v-if="nothing">
          <view class="end-text">-已经到底了-</view>
        </template>
      </scroll-view>
    </view>

  </view>
</template>
<script type="text/ecmascript-6">
import dayjs from 'dayjs'

import SelectComponent from '@/components/SelectComponent.vue'
import PageTabs from '@/components/PageTabs.vue'
export default {
  inject: ['getRecorder'],
  name: '',
  components: { SelectComponent, PageTabs },
  inject: ['getRecorder'],
  props: {
    show: Boolean
  },
  data () {
    return {
      tabList: Object.freeze([
        { text: '已提交' },
        { text: '未提交', dot: () => this.preRecordFailList.length },
      ]),
      orderTypeList: Object.freeze([
        { label: '战败', value: 0 },
        { label: '成交', value: 1 },
      ]),
      receptionTypeList: Object.freeze([
        { label: '未复盘', value: 0 },
        { label: '已复盘', value: 1 },
      ]),
      uploadTypeList: Object.freeze([
        { label: '待上传' },
        { label: '待提交' },
      ]),
      itemObject: Object.freeze([
        { label: '客户电话', key: 'phoneNumber' },
        { label: '销售姓名', key: 'salesName' },
        { label: '接待时长', key: 'duration' },
        { label: '开始接待', key: 'startTime' },
        { label: '结束接待', key: 'endTime' },
      ]),
      recordFailList: [],
      preRecordFailList: [],
      tabIndex: 0,
      pageNum: 1,
      total: 0,
      list: [],
      flag: false,
      nothing: false,
      pageSize: 10,
      isPrePage: false,
      reviewFlag: 0,
      orderFinishFlag: 0,
      loaded: false
    }
  },
  watch: {
    show: {
      immediate: true,
      handler (newval) {
        if (newval && !this.loaded) {
          this.init();
          this.getRecordNum()
          this.getPreRecordNum()
          this.loaded = true
        }
      }
    }
  },
  mounted () {
    uni.$on('refreshRecord', () => {
      this.changeTab(0)
    })
  },
  methods: {
    resetData () {
      this.flag = false
      this.nothing = false
      this.total = 0
      this.list = []
      this.pageNum = 1
    },
    changeTab (index) {
      if (this.tabIndex == index) return
      this.resetData()
      this.tabIndex = index
      this.reviewFlag = 0
      this.orderFinishFlag = 0
      if (index == 0) this.getReceptionList()
      else this.getRecordFail()
    },
    formatValue (val, k) {
      if (!val) return
      if (k == 'phoneNumber') {
        val = val.toString()
        return val.slice(0, 3) + " " + val.slice(3, 7) + " " + val.slice(7)
      }
      return val
    },
    jumpDetail (item) {
      if (this.tabIndex == 0) { // 已上传 && 新质检
        const { sceneType } = uni.$storage.get("userInfo");
        if (sceneType == 1 || item.checkHistoryFlag != 0 || item.score == null) return uni.showToast({
          title: '该接待尚不支持复盘',
          icon: "none"
        })
        uni.$track.add({ eventCode: item.orderFinishFlag ? 'app_reception_deal' : 'app_reception_defeat' })
        this.tabIndex = -1
        uni.navigateTo({
          url: `/pages/common/receptionDetail/index`,
          success (res) {
            res.eventChannel.emit('getData', item)
          }
        })
        return
      }
      if (this.isPrePage) {
        this.$emit('openRecordPage', item)
      }
    },

    async getRecordNum () {
      // let recordFailListAll = await uni.$dbManager.getRecords();
      let recordFailListAll = await uni.$dbRecord.getCompletedRecords();
      if (typeof recordFailListAll == 'string') {
        recordFailListAll = JSON.parse(recordFailListAll || '[]')
      }
      const { shopMerchantId, sceneType, phone } = uni.$storage.get("userInfo");
      let recordFailList = recordFailListAll.filter(i => {
        return i.merchantId == shopMerchantId && i.bussinessType == (sceneType == 0 ? 1 : 2) && i.loginPhone == phone
      })
      this.recordFailList = recordFailList.reverse();
    },
    async getPreRecordFail () {
      await this.getPreRecordNum()
      // this.list[0] = this.preRecordFailList.map(i => {
      //   return Object.assign(i, {
      //     duration: 0,
      //     startTime: i.receptionStartTime && i.receptionStartTime.replace(/\//g, '.')
      //   })
      // })
      const list = this.preRecordFailList.map(i => {
        return Object.assign(i, {
          duration: 0,
          startTime: i.receptionStartTime && i.receptionStartTime.replace(/\//g, '.')
        })
      })
      this.$set(this.list, 0, list)
      this.isPrePage = true
      this.flag = true
      this.nothing = this.preRecordFailList.length ? true : false
    },
    async getPreRecordNum () {
      // const preRecordList = await this.recorder.getRecords()
      const preRecordList = await uni.$dbRecord.getTempRecords();
      this.preRecordFailList = preRecordList.reverse()
    },
    async getRecordFail () {
      await this.getRecordNum()
      // this.list[0] = this.recordFailList.map(i => {
      const list = this.recordFailList.map(i => {
        return {
          id: i.id,
          receptionStatus: i.receptionStatus,
          phoneNumber: i.phoneNumber,
          salesName: i.salesName,
          customerName: i.customerName,
          carModel: i.carModel,
          duration: this.formatSeconds(new Date(i.receptionEndTime).getTime() - new Date(i.receptionStartTime).getTime()),
          startTime: i.receptionStartTime.replace(/\//g, '.'),
          endTime: i.receptionEndTime.replace(/\//g, '.')
        }
      })
      this.$set(this.list, 0, list)
      this.flag = true
      this.isPrePage = false
      this.nothing = this.recordFailList.length ? true : false
    },
    init () {
      this.getReceptionList()
      this.recorder = this.getRecorder()
    },
    async getReceptionList () {
      try {
        await uni.$isNetWork()
      } catch (error) {
        const recordSuccessList = JSON.parse(uni.$storage.get("recordSuccessList") || "{}")
        // this.list[0] = recordSuccessList[this.tabIndex] || []
        this.$set(this.list, 0, recordSuccessList[this.tabIndex] || [])
        this.flag = true
        return
      }
      try {
        uni.showLoading({
          mask: true
        })
        const { tabIndex, pageNum, pageSize, reviewFlag, orderFinishFlag } = this,
          userInfo = uni.$storage.get("userInfo"),
          { shopMerchantId, sceneType } = userInfo,
          { list, total } = await uni.$api.commonApi.getReceptionList({
            merchantId: shopMerchantId,
            pageNum,
            pageSize,
            reviewFlag,
            orderFinishFlag,
            bussinessType: sceneType == 0 ? 1 : 2, // sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
          })
        uni.hideLoading()
        list?.length && list.map(e => {
          e.duration = this.formatSeconds(e.receptionEndTime - e.receptionStartTime)
          e.startTime = dayjs(e.receptionStartTime).format("YYYY.MM.DD HH:mm:ss")
          e.endTime = dayjs(e.receptionEndTime).format("YYYY.MM.DD HH:mm:ss")
        })
        if (pageNum == 1) {
          const record = {
            [tabIndex]: list
          }
          const recordSuccessList = JSON.parse(uni.$storage.get("recordSuccessList") || "{}")
          const mergeRecord = Object.assign(recordSuccessList, record)
          uni.$storage.set("recordSuccessList", JSON.stringify(mergeRecord))
        }
        this.$set(this.list, pageNum - 1, list)
        // this.list[pageNum - 1] = list
        this.flag = true
        this.total = total
      } catch (error) {
        this.flag = true
      }
    },
    formatTime (num) {
      let minutes = Math.floor(num / 60) || '0',
        seconds = num % 60 || '0'
      seconds = seconds < 10 ? `0${seconds}` : seconds
      return {
        minutes,
        seconds
      }
    },
    formatSeconds (seconds) {
      seconds = Math.floor(seconds / 1000)
      let formattedTime = ''
      if (seconds < 60) return seconds + '秒'
      else {
        let hours = Math.floor(seconds / 3600),
          minutes = Math.floor((seconds % 3600) / 60),
          remainingSeconds = seconds % 60
        if (hours > 0) formattedTime += hours + '小时'
        if (minutes > 0 || hours > 0) formattedTime += minutes + '分'
        if (remainingSeconds > 0) formattedTime += remainingSeconds + '秒'
        return formattedTime
      }
    },
    pageonReachBottom () {
      let { pageNum, total, nothing, pageSize } = this
      if (this.tabIndex == 1) return
      if (!nothing) nothing = 'nothing'
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1
        this.getReceptionList()
      } else this.nothing = true
    },
    changeUploadType ({ index }) {
      this.resetData()
      if (index == 0) this.getRecordFail()
      else this.getPreRecordFail()
    },
    // async submitRecord (val) {
    //   this.flag = false
    //   delete val.duration
    //   delete val.startTime
    //   const { maxUploadNum = 10 } = uni.$storage.get('mock_data')
    //   if (val.recordUrlList.length > maxUploadNum) {
    //     const userInfo = uni.$storage.get('userInfo')
    //     const { customerName, phoneNumber, carModel, salesName } = val || {}
    //     const { name } = userInfo || {}
    //     uni.$logger.error({
    //       msg: `员工: ${name}, 客户: ${customerName}`,
    //       extra: {
    //         '手机号: ': phoneNumber,
    //         '姓名: ': customerName,
    //         '销售: ': salesName,
    //         '车型: ': carModel,
    //         '原因: ': '录音文件过长，数量' + val.recordUrlList.length
    //       }
    //     })
    //   }
    //   val.recordUrlList = val.recordUrlList.slice(0, maxUploadNum)
    //   await this.recorder.save(val)
    //   this.getRecordNum()
    //   await this.getPreRecordFail()
    // },
    async submitRecord (val) {
      this.flag = false
      const {duration,startTime,...record} = val
      await this.recorder.saveInternal(record)
      await this.getPreRecordFail()
    },
    searchReceptionList ({ item }, name) {
      if (this[name] == item.value) return
      this[name] = item.value
      this.resetData()
      this.getReceptionList()
    },
    async handleDelete(item) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这条待提交记录吗？删除后将无法恢复。',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 从数据库中删除记录
              await this.recorder.deleteRecord(item)
              // 刷新列表
              await this.getPreRecordFail()
              uni.showToast({ title: '删除成功', icon: 'success' })
            } catch (error) {
              uni.$logger.local.error('删除待提交记录失败:'+ error.message)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },
  }
}
</script>
<style scoped lang="scss">
.record-box {
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
  .data-container {
    background: #ffffff;
    border-radius: toRpx(48);
    height: 100%;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    box-sizing: border-box;
    position: relative;
    .control-box {
      height: toRpx(164);
      .tabs {
        width: toRpx(336);
        height: toRpx(84);
        margin-left: toRpx(44);
      }
      .select-box-list {
        margin-left: auto;

        gap: 0 toRpx(40);
      }
      .select-component {
        margin-right: toRpx(44);
      }
    }
  }
  .record-list {
    box-sizing: border-box;
    height: calc(100% - #{toRpx(164)});
    position: relative;
    z-index: 4;
    .record-tips {
      height: toRpx(76);
      background: #f58e341a;
      border-radius: toRpx(16);
      font-size: toRpx(28);
      color: #f58e34;
      width: calc(100% - #{toRpx(88)});
      margin: 0 auto toRpx(40);
      justify-content: center;
      .icon {
        margin-right: toRpx(8);
      }
    }
  }
  .list {
    display: flex;
    flex-wrap: wrap;
    gap: toRpx(40) toRpx(46);
    padding: toRpx(2) toRpx(44) 0;
    .item {
      // width: toRpx(610);
      width: calc(50% - #{toRpx(23)});
      background: #ffffff;
      box-sizing: border-box;
      padding: toRpx(24) toRpx(32);
      position: relative;
      box-shadow: 0 toRpx(8) toRpx(24) 0 #2c66f71a;
      border-radius: toRpx(16);
      .top-right-box {
        position: absolute;
        top: toRpx(24);
        right: toRpx(32);
        gap: 0 toRpx(16);
        .status {
          width: toRpx(88);
          height: toRpx(44);
          background: #fdece9;
          color: #f24724;
          border-radius: toRpx(4);
          font-weight: 500;
          font-size: toRpx(24);
          justify-content: center;
        }

        .disabled {
          background: #f2f2f2;
          color: #999999;
        }
        .deal {
          background: #eaf9f1;
          color: #35c376;
        }
      }

      .name {
        font-weight: 500;
        font-size: toRpx(32);
        color: #292d33;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 62%;
      }
      .goods-name {
        font-weight: 500;
        font-size: toRpx(32);
        color: #2c66f7;
        margin-top: toRpx(16);
      }
      .info {
        margin-top: toRpx(16);
        font-size: toRpx(24);
        color: #999ea8;
        .value {
          margin-left: auto;
          color: #666666;
        }
      }
    }
  }
}
.nothing {
  width: 100%;
  flex-direction: column;
  margin-top: toRpx(260);
  font-size: toRpx(28);
  color: #999999;
  .icon {
    width: toRpx(678);
    height: toRpx(284);
    margin-bottom: toRpx(24);
  }
}
.end-text {
  color: #999;
  text-align: center;
  padding: toRpx(50) 0;
  font-size: toRpx(24);
}
</style>
