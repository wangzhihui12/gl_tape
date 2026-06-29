<template>
  <view class="activity-center">
    <view class="activity-left">
      <view class="title">荣誉墙</view>
      <u-list @scrolltolower="scrolltolower" class="activity-list" height="100%" v-if="activityRewardList.length > 0">
        <u-list-item v-for="item in activityRewardList" :key="item.id" class="activity-list-item">
          <view class="activity-name">{{ item.name }}</view>
          <view class="activity-time">{{ dayjs(item.startTime).format('YYYY.MM.DD HH:mm') }} - {{ dayjs(item.endTime).format('YYYY.MM.DD HH:mm') }}</view>
          <view class="activity-cycle" v-if="item.cycleName">周期：{{ item.cycleName }}</view>
          <view class="activity-prize">
            <view class="sprite-icon icon-medalNew"></view>
            <view class="prize-name">{{ item.awardRemark }}</view>
            <view class="prize-money text-two-line">{{ item.awardName }}</view>
          </view>
        </u-list-item>
        <template v-if="rewardNothing && activityRewardList.length > 0">
          <view class="end-text">到底了！</view>
        </template>
      </u-list>
      <template v-else>
        <view class="nothing flex">
          <image class="icon" src="../../../assets/images/common/noData.webp" />
          暂无记录
        </view>
      </template>
    </view>
    <view class="activity-right">
      <view class="data-container">
        <view :class="['type-box']">
          <view class="tab-item" v-for="(i, index) in typeList" :key="index" @click="changeType(index, i.id)">
            <view :class="['sprite-icon', firstIndex == index ? `icon-${firstClass[index]} active` : '', firstLeft[index]]"></view>
            <view class="text" :class="[firstIndex == index ? `active` : '']">
              {{ i.tabName }}
              <template>{{ i.num() }}</template>
              <div class="dot" :style="{ right: '86rpx' }" v-if="i.dot && i.dot()"></div>
            </view>
          </view>
        </view>
        <template>
          <view class="activity-box">
            <scroll-view scroll-y ref="scrollViewRef" @scrolltolower="pageonReachBottom" class="activity-list-box" v-if="cardList.length">
              <template>
                <view class="card-list">
                  <Card v-for="item in cardList" :key="item.id" :item="item" :tabIndex="firstIndex" @handleAvtivityItemClick="handleAvtivityItemClick(item)" @rulesShow="rulesShow" />
                </view>
              </template>

              <template v-if="pageNothing">
                <view class="end-text">到底了！</view>
              </template>
            </scroll-view>
            <template v-else>
              <view class="nothing flex">
                <image class="icon" src="../../../assets/images/common/noData.webp" />
                暂无数据
              </view>
            </template>
          </view>
        </template>
      </view>
    </view>

    <view v-if="showPopup" class="activity-detail-popup">
      <view class="activity-popup-details">
        <view class="popup-top-box flex align-center">
          <view class="popup-top-box-title flex-1">活动详情</view>

          <view @click.stop="closePopup">
            <view class="sprite-icon icon-evaluationClose"></view>
          </view>
        </view>
        <view class="activity-details-content">
          <view class="activity-details-content-box">
            <view class="flex align-center top-box">
              <image class="card-item-img" :src="currentItem.activityCover" mode="aspectFill" />
              <view class="card-item-content flex-1">
                <view class="card-item-title">{{ currentItem.name }}</view>
                <view class="card-item-text flex" v-if="firstIndex != 1">
                  <view class="card-item-label">活动进度</view>
                  <view v-if="firstIndex != 2" class="flex flex-1">
                    <view class="card-item-progress">
                      <view class="card-item-progress-bar" :style="{ width: Math.floor(Number(currentItem.process) || 0) + '%' }"></view>
                    </view>
                    <view class="card-item-progress-text ml-16">{{ Math.floor(Number(currentItem.process) || 0) }}%</view>
                  </view>
                  <view class="card-item-value" v-else>
                    <view class="gray">已结束</view>
                  </view>
                </view>
                <view class="card-item-text">
                  <view class="card-item-label">活动时间</view>
                  <view class="card-item-value">{{ dayjs(currentItem.startTime).format('YYYY.MM.DD HH:mm') }} - {{ dayjs(currentItem.endTime).format('YYYY.MM.DD HH:mm') }}</view>
                </view>
              </view>
            </view>
            <template v-if="currentItem.activityCycleResponses && currentItem.activityCycleResponses.length > 0">
              <u-scroll-list class="activity-tab-box" :indicator="false" v-if="currentItem.activityCycleResponses">
                <view v-for="(activityCycleResponsesItem, index) in currentItem.activityCycleResponses" :key="activityCycleResponsesItem.id" class="tab-item-box" @click="changeDetailsTab(index)">
                  <view class="tab-item" :class="{ active: activeIndex === index }">
                    {{ activityCycleResponsesItem.cycleName }}
                  </view>
                </view>
              </u-scroll-list>
              <scroll-view class="activity-detailslist-box" scroll-y="true" v-if="currentItem.activityCycleResponses">
                <template v-if="currentItem.activityCycleResponses[activeIndex].activityAwardWinnerResponses.length > 0">
                  <view v-for="(i, index) in currentItem.activityCycleResponses[activeIndex].activityAwardWinnerResponses" :key="i.id" class="tab-detailslist flex" :class="{ active: userInfo.phone === i.phone }" @click="changeDetailsTab(index)">
                    <view class="sprite-icon icon-icon-gold"></view>
                    <view class="flex-1">
                      <view class="flex align-center justify-between mb-12">
                        <view class="name">{{ i.winnerName }}</view>
                        <view class="priceValue text-right">{{ i.awardName }}</view>
                      </view>
                      <view class="flex align-center justify-between">
                        <view class="grayName">{{ i.winnerRemark }}</view>
                        <view class="grayName text-right">{{ i.awardRemark }}</view>
                      </view>
                    </view>
                  </view>
                </template>
                <template v-else>
                  <view class="flex algin-center justify-between w-100 h-100">
                    <view class="flex noData">
                      <image class="icon" src="../../../assets/images/boutique/nothing.webp" />
                      暂无数据
                    </view>
                  </view>
                </template>
              </scroll-view>
            </template>
            <template v-else>
              <view class="flex algin-center justify-between w-100 h-100">
                <view class="flex noData">
                  <image class="icon" src="../../../assets/images/boutique/nothing.webp" />
                  暂无数据
                </view>
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>

    <Popup ref="activityRulePopup" popupClass="activityRule" title="评选规则" type="center" size="medium" :isShowFooter="false" :showClose="true" :autoClose="false">
      <template #content>
        <view class="activityRuleContent" v-if="currentItem">
          <view class="activityRuleContent-box">
            <div v-html="currentItem.selectionRule"></div>
            <!-- <editor id="editor" class="ql-container" placeholder="开始输入..." show-img-size show-img-toolbar show-img-resize @statuschange="onStatusChange" :read-only="true" @ready="onEditorReady"></editor> -->
          </view>
        </view>
      </template>
    </Popup>
  </view>
</template>

<script>
import Card from './Activity/card.vue'
import Popup from './Activity/popup.vue'
import dayjs from 'dayjs'
export default {
  name: 'ActivityCenter',
  components: {
    Card,
    Popup
  },
  data() {
    return {
      dayjs,
      currenrId: '0',
      chartData: {},
      dataInfo: {},
      labelColors: [],
      typeList: [
        { tabName: '进行中', num: () => '', id: '0' },
        { tabName: '即将开始', num: () => '', id: '2' },
        { tabName: '已结束', num: () => '', id: '1' }
      ],
      detailsTabList: [],
      cardList: [],
      detailsList: [],
      activityRewardList: [],
      firstIndex: 0,
      activeIndex: 0,
      firstLeft: ['first', 'second', 'three'],
      firstClass: ['short-first-nav', 'short-second-nav', 'short-second-nav'],
      isBeisen: false, // 是否是有北森权限，true 有，false无
      isFlag: true, // 当前驻店人员所关联的门店非鸿蒙智行或非延保业务
      isHmzx: false, // 当前驻店人员所关联的门店是否是鸿蒙智行
      isYb: false, // 当前驻店人员所关联的门店是否是延保业务
      editorCtx: null,
      currentItem: null,
      rewardNothing: false,
      pageNothing: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      pageListNum: 1,
      pageListSize: 10,
      showPopup: false,
      userInfo: null
    }
  },
  created() {},
  mounted() {
    console.log('触发', this.query)
    this.userInfo = uni.$storage.get('userInfo')
    // uni.$track.add({ eventCode: 'app_activeity_center' })
    this.getActivityPage()
    this.getActivityReward()
  },
  methods: {
    // tab切换
    changeType(index, id) {
      this.pageListNum = 1
      uni.$track.add({ eventCode: 'app_activity_tabChange' })
      this.cardList = []
      this.firstIndex = index
      this.currenrId = id
      this.getActivityPage()
    },
    handleAvtivityItemClick(item) {
      this.activeIndex = 0
      this.currentItem = item
      console.log('rulesShow', item)
      console.log('rulesShow', this.tabIndex)
      // this.$refs.activityDetailsPopup.open()
      this.showPopup = true
    },
    closePopup() {
      this.showPopup = false
    },
    changeDetailsTab(index) {
      this.activeIndex = index
      this.detailsList = []
    },
    rulesShow(item) {
      this.currentItem = item

      this.$refs.activityRulePopup.open()
    },
    getActivityPage() {
      uni.showLoading({
        mask: true
      })
      const { sceneType, shopMerchantId } = uni.$storage.get('userInfo')
      uni.$api.activityApi
        .activityPage({
          pageNum: this.pageListNum,
          pageSize: this.pageListSize,
          status: this.currenrId,
          sceneType,
          merchantId: shopMerchantId
        })
        .then(res => {
          uni.hideLoading()
          this.pageListTotal = res.total
          if (this.pageListNum === 1) {
            this.cardList = res.list
          } else {
            this.cardList = [...this.cardList, ...res.list]
          }
          this.pageNothing = this.cardList.length >= this.pageListTotal
        })
        .catch(() => {
          uni.hideLoading()
        })
    },
    getActivityReward() {
      const { phone } = uni.$storage.get('userInfo')
      uni.showLoading({
        mask: true
      })
      uni.$api.activityApi
        .activityReward({
          phone: phone,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        .then(res => {
          uni.hideLoading()
          this.total = res.total
          if (this.pageNum === 1) {
            this.activityRewardList = res.list
          } else {
            this.activityRewardList = [...this.activityRewardList, ...res.list]
          }
          this.rewardNothing = this.activityRewardList.length >= this.total
        })
        .catch(() => {
          uni.hideLoading()
        })
    },
    scrolltolower() {
      if (!this.rewardNothing && Math.ceil(this.total / this.pageSize) > this.pageNum) {
        this.pageNum += 1
        this.getActivityReward()
      } else {
        this.rewardNothing = true
      }
    },
    pageonReachBottom() {
      console.log('pageonReachBottom', this.pageListNum, this.pageListSize, this.pageListTotal)
      if (!this.pageNothing && Math.ceil(this.pageListTotal / this.pageListSize) > this.pageListNum) {
        this.pageListNum += 1
        this.getActivityPage()
      } else {
        this.pageNothing = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.activity-center {
  display: flex;
  margin-top: toRpx(56);
  margin-bottom: toRpx(80);

  .activity-left {
    width: toRpx(656);
    margin-right: toRpx(48);
    border-radius: toRpx(48);
    height: calc(100vh - #{toRpx(136)});
    background: url('@/assets/images/common/activeityCenterBg.webp') no-repeat;
    background-size: 100% 100%;
    overflow: hidden;
    .title {
      height: toRpx(118);
      border-radius: toRpx(32) toRpx(32) 0 0;

      background-size: toRpx(656) toRpx(104);

      padding-left: toRpx(48);
      padding-top: toRpx(40);
      font-size: toRpx(34);
      color: #333;
      font-weight: 500;
      box-sizing: border-box;
    }

    .activity-board-box {
      width: 100%;
      border: toRpx(4) solid #fff;
      border-top: none;
      background: #eff4ff;
      height: calc(100vh - #{toRpx(136)} - #{toRpx(104)});
      border-radius: 0 0 toRpx(48) toRpx(48);
    }

    .activity-list {
      padding: toRpx(24) toRpx(32);
      width: 100%;
      height: calc(100% - #{toRpx(152)}) !important;
      .activity-list-item {
        padding: toRpx(24) toRpx(32);
        background-color: #fff;
        box-sizing: border-box;
        border-radius: toRpx(24);
        margin-bottom: toRpx(24);
        .activity-name {
          color: #1a1a1a;
          font-size: toRpx(28);
          font-weight: 400;
          margin-bottom: toRpx(4);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 80%;
        }
        .activity-time {
          color: #808080;
          font-size: toRpx(24);
          font-weight: 400;
          margin-top: toRpx(12);
        }
        .activity-cycle {
          color: #808080;
          font-size: toRpx(24);
          font-weight: 400;
          margin-top: toRpx(12);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .activity-prize {
          // min-height: toRpx(116);
          border-radius: toRpx(12);
          background: linear-gradient(180deg, rgba(251, 230, 194, 0.2) 0%, rgba(251, 217, 180, 0.2) 100%);
          padding: toRpx(18) toRpx(14);
          box-sizing: border-box;
          margin-top: toRpx(12);
          position: relative;
          .icon-medalNew {
            position: absolute;
            top: toRpx(0);
            right: toRpx(24);
          }
          .prize-name {
            color: #808080;
            font-size: toRpx(22);
            font-weight: 400;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 80%;
          }
          .prize-money {
            color: #b87a11;
            font-size: toRpx(32);
            font-weight: 700;
            margin-top: toRpx(12);
            width: 80%;
          }
        }
      }
      .activity-list-item:last-child {
        margin-bottom: 0;
      }
    }
  }

  .activity-box3 {
    width: calc(100% - #{toRpx(64)});
    border-radius: toRpx(24);
    background: #ffffff;
    padding: toRpx(28) toRpx(24) toRpx(24);
    margin: 0 toRpx(32) toRpx(16);

    &.big-height {
      height: toRpx(448);
    }

    &-title {
      margin-bottom: toRpx(10);

      &.big-margin {
        margin-bottom: toRpx(40);
      }
    }
  }

  .activity-right {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(16px);
    box-shadow: inset 0 0 16px 0 #ffffff;
    border-radius: toRpx(48);
    margin-right: toRpx(48);
    position: relative;

    .data-container {
      background: #ffffff;
      border-radius: toRpx(48);
      height: calc(100vh - #{toRpx(136)});
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      border: toRpx(2) solid #fff;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;

      .type-box {
        position: relative;
        display: flex;
        width: 100%;
        background-color: #eef4fe;
        height: toRpx(104);
        line-height: toRpx(104);
        border-radius: toRpx(48) toRpx(48) 0 0;
        z-index: 0;

        .tab-item {
          width: toRpx(400);
          text-align: center;
          font-weight: 500;
          font-size: toRpx(34);
          color: #292d33;

          .first {
            left: 0;
          }

          .second {
            left: toRpx(367);
          }

          .three {
            left: toRpx(770);
          }

          .four {
            left: toRpx(1162);
          }
          .sprite-icon {
            &.active {
              position: absolute;
              top: 0;
              z-index: -1;
              font-weight: 500;
              font-size: toRpx(32);
              color: #3b73ff;
            }
          }
          .text {
            position: relative;
            text-align: center;
            width: toRpx(400);

            .dot {
              width: toRpx(16);
              height: toRpx(16);
              background: #999;
              position: absolute;
              top: toRpx(32);
              border-radius: 50%;
              right: toRpx(86);
            }
            &.active {
              position: absolute;
              top: 0;
              z-index: -1;
              font-weight: 500;
              font-size: toRpx(32);
              color: #3b73ff;

              &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: toRpx(48);
                height: toRpx(8);
                background-color: #3b73ff;
                border-radius: toRpx(16);
              }
            }
          }
        }
      }
      .activity-box {
        padding-top: toRpx(24);
        height: calc(100% - #{toRpx(100)});
        .activity-list-box {
          margin-top: toRpx(24);
          height: calc(100% - #{toRpx(60)});
          // height: 100%;
        }
      }
      .card-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: toRpx(40);
        padding: 0 toRpx(40) toRpx(32);
      }
    }
  }

  .nothing {
    width: 100%;
    flex-direction: column;
    margin-top: toRpx(270);
    font-size: toRpx(28);
    color: #999999;

    .icon {
      width: toRpx(344);
      height: toRpx(208);
      margin-bottom: toRpx(24);
    }
  }

  ::v-deep .activityDetails {
    .content {
      height: calc(100% - #{toRpx(112)});
    }
  }

  .activity-details-content {
    padding: toRpx(24) toRpx(64) toRpx(64);
    box-sizing: border-box;
    height: calc(100% - #{toRpx(112)});
    &-box {
      border-radius: toRpx(24);
      background: #ffffff;
      box-shadow: 0 toRpx(8) toRpx(24) 0 #2a61eb1a;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      .top-box {
        padding: toRpx(24) toRpx(32);
        box-sizing: border-box;
        background: linear-gradient(90deg, #e7f1ff 0%, #eaf2ff1a 100%);
        .card-item-img {
          width: toRpx(288);
          height: toRpx(144);
          flex-shrink: 0;
          border-radius: toRpx(16);
        }

        .card-item-content {
          padding: 0 toRpx(32);
          min-width: 0;
          flex: 1;
        }

        .card-item-title {
          font-size: toRpx(30);
          color: #292d33;
          font-weight: 500;
          margin-bottom: toRpx(20);
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-item-text {
          position: relative;
          display: flex;
          align-items: center;
          font-size: toRpx(24);
          margin-bottom: toRpx(16);

          .card-item-label {
            width: toRpx(96);
            color: #999ea8;
            margin-right: toRpx(24);
          }

          .card-item-value {
            color: #666666;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            .dot-value {
              width: toRpx(12);
              height: toRpx(12);
              border-radius: 50%;
              background: #2cca74;
              margin-right: toRpx(8);
            }
            .gray {
              color: #666666;
            }
          }
          .blueValue {
            color: #4673ff;
          }
        }

        .card-item-progress {
          width: toRpx(596);
          height: toRpx(16);
          background: linear-gradient(128.8deg, rgba(117, 188, 255, 0.35) 0%, rgba(44, 102, 247, 0.35) 100%);
          border-radius: toRpx(8);

          .card-item-progress-text {
            color: #3b73ff;
            font-size: toRpx(24);
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
          }

          .card-item-progress-bar {
            height: 100%;
            background: linear-gradient(128.8deg, #75bcff 0%, #2c66f7 100%);
            border-radius: toRpx(8);
          }
        }
      }
      .activity-tab-box {
        width: 100%;
        white-space: nowrap;
        padding: toRpx(23) toRpx(32) toRpx(16);
        box-sizing: border-box;
        .tab-scroll-container {
          display: flex;
          // 确保在app端内容不会被截断
          min-width: 100%;
        }
        .tab-item-box {
          margin-right: toRpx(16);
          &:last-child {
            margin-right: 0;
          }
        }
        .tab-item {
          display: inline-block;
          min-width: toRpx(176);
          padding: 0 toRpx(24);
          box-sizing: border-box;
          max-width: toRpx(366);
          height: toRpx(56);
          border-radius: toRpx(12);
          opacity: 1;
          border: toRpx(2) solid #ffffffcc;
          background: #f5f6f7;
          backdrop-filter: blur(toRpx(12));
          color: #666666;
          font-size: toRpx(26);
          margin-right: toRpx(16);
          text-align: center;
          line-height: toRpx(56);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .active {
          background: linear-gradient(180deg, #6795ff 0%, #4a84f9 100%);
          color: #ffffff;
        }
      }
      .activity-detailslist-box {
        flex: 1;
        min-height: 0;
        padding: 0 toRpx(32) toRpx(24);
        .tab-detailslist {
          width: 100%;
          height: toRpx(120);

          margin-bottom: toRpx(16);
          &:last-child {
            border-bottom: none;
          }
          .icon-icon-gold {
            flex: 0 0 auto;
            flex-shrink: 0;
            margin-right: toRpx(32);
          }

          > .flex-1 {
            min-width: 0;
          }
          .name {
            color: #181a1f;
            font-size: toRpx(28);
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .priceValue {
            color: #3b73ff;
            font-size: toRpx(28);
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .grayName {
            color: #999ea8;
            font-size: toRpx(24);
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .text-right {
            text-align: right;
          }
        }
        .active {
          background: linear-gradient(270deg, rgba(251, 230, 194, 0) 0%, rgba(251, 217, 180, 0.2) 100%);
        }
      }
    }
  }
  .noData {
    width: 100%;
    flex-direction: column;

    font-size: toRpx(28);
    color: #999999;

    .icon {
      width: toRpx(288);
      height: toRpx(144);
      margin-bottom: toRpx(24);
    }
  }
  ::v-deep .activityRule {
    .content {
      height: calc(100% - #{toRpx(112)});
    }
  }
  .activityRuleContent {
    padding: toRpx(24) toRpx(64) toRpx(64);
    box-sizing: border-box;
    height: 100%;
    .activityRuleContent-box {
      border-radius: toRpx(16);
      background: #f5f7fa;
      height: 100%;
      padding: toRpx(24) toRpx(32);
      box-sizing: border-box;
      overflow: scroll;
      .ql-container {
        width: 100%;
        height: 100%;
        padding: toRpx(24) toRpx(32);
        box-sizing: border-box;
      }
    }
  }

  .activity-detail-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: toRpx(48);
    box-sizing: border-box;
  }
  .activity-popup-details {
    width: 60vw;
    height: 68vh;
    border-radius: toRpx(32);
    background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
    overflow: hidden;
  }

  .justify-between {
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
  }
  .align-center {
    align-items: center;
  }
  .uniui-closeempty {
    color: #1a1a1a;
    font-size: toRpx(24);
    font-weight: 600;
  }
  .single-btn {
    width: 100%;
  }

  .popup-top-box {
    padding: 0 toRpx(48);
    height: toRpx(112);
    width: 100%;

    background-color: transparent;
    color: #333333;
    font-size: toRpx(36);
    .popup-top-box-title {
      text-align: center;
    }
    .icon-close {
      text-align: end;
    }
  }
  .end-text {
    color: #999;
    text-align: center;
    padding: toRpx(30) 0;
    font-size: toRpx(24);
  }
  .w-100 {
    width: 100%;
  }
  .h-100 {
    height: 100%;
  }
}
</style>
