<template>
  <view class="detail-box">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="back" @click="back">
        <uni-icons type="left" :size="20" color="#000000"></uni-icons>
      </view>
      <view class="title">排行榜</view>
    </view>

    <!-- 左右布局 -->
    <view class="content-layout">
      <!-- 左侧排行榜 -->
      <view class="left-panel">
        <view class="top-image-wrapper">
          <image class="panel-image" :src="require('@/assets/images/studyCenter/Leaderboard-bg.png')"
            mode="scaleToFill" />
        </view>

        <view class="tab-header">
          <view class="tab-list">
            <view v-for="(tab, index) in tabList" :key="index" :class="['tab-item', { 'active': currentTab === index }]"
              @click="switchTab(index)">
              <text class="tab-text">{{ tab.label }}</text>
            </view>
          </view>
          <view class="median-text">学习时长中位数：{{ rank.median == null ? '-' : rank.median  }}小时</view>
        </view>

        <view class="rank-list">
          <view v-if="rank.currentUserRank" class="rank-item current-user">
            <view class="rank-left">
              <view class="rank-badge number has-bg">
                <template v-if="rank.currentUserRank.rank">
                  <text class="rank-number">{{ rank.currentUserRank.rank >= 100 ? '99+' : rank.currentUserRank.rank }}</text>
                </template>
                <text v-else class="rank-number">-</text>
              </view>
              <text class="user-name">{{ rank.currentUserRank.userName }}</text>
            </view>
            <text class="study-time">{{ rank.currentUserRank.duration == null ? '-' : rank.currentUserRank.duration  }}小时</text>
          </view>
          <scroll-view class="rank-scroll" scroll-y="true">
            <view v-for="(item, index) in rank.rankList" :key="index"
              :class="['rank-item']">
              <view class="rank-left">
                <view v-if="item.rank <= 3" class="rank-badge medal">
                  <image class="medal-icon" :src="getMedalIcon(item.rank - 1)" mode="aspectFit" />
                </view>
                <view v-else
                  :class="['rank-badge', 'number', { 'gray-number': item.rank >= 4 }]">
                  <text class="rank-number">{{ item.rank >= 100 ? '99+' : item.rank }}</text>
                </view>
                <text class="user-name">{{ item.userName }}</text>
              </view>
              <text class="study-time">{{ item.duration == null ? '-' : item.duration  }}小时</text>
            </view>
          </scroll-view>
        </view>
      </view>

      <!-- 右侧面板 -->
      <view class="right-panel">
        <view class="developing flex">
          <image class="developing-icon" src="../../../assets/images/common/developing.webp" />
          功能开发中
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LeaderboardPage',
  data() {
    return {
      currentTab: 0,
      tabList: [
        { label: '总榜' },
        { label: '日榜' },
        { label: '周榜' },
        { label: '月榜' }
      ],
      rank: {
        median: 0,
        currentUserRank: {},
        rankList: []
      }
    }
  },
  mounted() {
    // this.generateMockData()
    this.getStudyDurationRank()
  },
  methods: {
    back() {
      uni.navigateBack()
    },
    switchTab(index) {
      this.currentTab = index
      this.getStudyDurationRank()
    },
    getMedalIcon(index) {
      const medals = [
        require('@/assets/images/studyCenter/guan.png'),
        require('@/assets/images/studyCenter/ya.png'),
        require('@/assets/images/studyCenter/ji.png')
      ]
      return medals[index]
    },
    // 获取排行榜
    async getStudyDurationRank() {
      uni.showLoading({
        title: '加载中'
      })
      try {
        const res = await uni.$api.commonApi.getStudyDurationRank({
          periodType: this.currentTab,
          staffPhone: uni.$storage.get('userInfo').phone
        })
        console.log(res, 'res')
        this.rank = res
      } finally {
        uni.hideLoading()
      }
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
      font-weight: 500;
      font-size: toRpx(32);
      color: #1a1a1a;
    }
  }

  .content-layout {
    display: flex;
    gap: toRpx(32);
    padding: 0 toRpx(40);
    // height: calc(100vh - var(--status-bar-height) - toRpx(88) - toRpx(44));

    .left-panel {
      width: toRpx(1084);
      height: toRpx(1312);
      border-radius: toRpx(32);
      background: #ffffff;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      position: relative;
      overflow: hidden;

      .top-image-wrapper {
        width: 100%;
        margin-bottom: toRpx(8);

        .panel-image {
          // width: toRpx(1084);
          width: 100%;
          height: toRpx(128);
          display: block;
          background-color: #ecf2ff;
        }
      }

      .tab-header {
        padding: 0 toRpx(48) 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .tab-list {
          display: flex;
          gap: toRpx(16);

          .tab-item {
            width: toRpx(120);
            height: toRpx(64);
            border-radius: toRpx(48);
            background: #f2f2f2;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;

            .tab-text {
              width: toRpx(56);
              height: toRpx(40);
              color: #6c6f75;
              font-size: toRpx(28);
              font-weight: 400;
              font-family: "HarmonyOSSansSC";
              text-align: center;
              line-height: toRpx(40);
            }

            &.active {
              background: #2d66f71a;

              .tab-text {
                color: #2d66f7;
                font-weight: 500;
              }
            }
          }
        }

        .median-text {
          width: toRpx(428);
          height: toRpx(40);
          color: #999ea8;
          font-size: toRpx(28);
          font-weight: 400;
          font-family: "HarmonyOSSansSC";
          text-align: right;
          line-height: toRpx(40);
        }
      }

      .rank-list {
        margin-top: toRpx(24);
        

        .rank-item {
          box-sizing: border-box;
          margin: 0 toRpx(48);
          // width: toRpx(988);
          width: calc(100% - toRpx(96));
          height: toRpx(128);
          border-radius: toRpx(24);
          background: transparent;
          padding: toRpx(24) toRpx(32);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: toRpx(16);

          &.current-user {
            background: #85a7ff1a;
          }

          .rank-left {
            display: flex;
            align-items: center;

            .rank-badge {
              width: toRpx(80);
              height: toRpx(80);
              border-radius: toRpx(566);
              border: toRpx(2) solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: toRpx(20);
              background-color: #f7f7f7;

              &.medal {
                background: transparent;
                border: none;

                .medal-icon {
                  width: toRpx(80);
                  height: toRpx(80);
                }
              }

              &.number {
                border: none;

                &.has-bg {
                  background: #2d66f71a;
                  border: toRpx(2) solid #ffffff;
                }

                .rank-number {
                  // width: toRpx(40);
                  height: toRpx(40);
                  color: #2d66f7;
                  font-size: toRpx(34);
                  font-weight: 500;
                  font-family: "HarmonyOSSansSC";
                  text-align: center;
                  line-height: toRpx(40);
                }

                &.gray-number .rank-number {
                  color: #999ea8;
                }
              }
            }

            .user-name {
              min-width: toRpx(60);
              height: toRpx(36);
              color: #292d33;
              font-size: toRpx(30);
              font-weight: 400;
              font-family: "HarmonyOSSansSC";
              text-align: left;
            }
          }

          .study-time {
            height: toRpx(38);
            color: #292d33;
            font-size: toRpx(32);
            font-weight: 500;
            font-family: "HarmonyOSSansSC";
            text-align: right;
          }
        }

        .rank-scroll {
          max-height: toRpx(944);
        }

      }
    }

    .right-panel {
      width: toRpx(1084);
      height: toRpx(1312);
      border-radius: toRpx(32);
      opacity: 1;
      background: #ffffff59;
      backdrop-filter: blur(toRpx(16));
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;

      .developing {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #999999;
        font-size: toRpx(28);

        &-icon {
          width: toRpx(344);
          height: toRpx(208);
          margin-bottom: toRpx(16);
        }
      }
    }
  }
}
</style>
