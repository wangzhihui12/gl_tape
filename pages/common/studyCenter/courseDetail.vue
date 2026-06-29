<template>
  <view class="detail-box">
    <view class="nav-bar">
      <view class="back" @click="backPage">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">课程详情</view>
    </view>
    <view class="detail-content">
      <view class="detail-content-left">
        <view class="title">课程列表</view>
        <view class="scroll-view-box">
          <scroll-view class="scroll-view" scroll-y @scrolltolower="pageonReachBottom">
            <view :class="['scroll-view-item', selectedIndex == index ? 'active' : '']"
              v-for="(item, index) in courseList" :key="index" @click="openCourse(index, item)">
              <image class="recommendation-img" src="../../../assets/images/common/recommend-course-default2.webp"
                mode="scaleToFill" />
              <view class="item-content">
                <view class="recommendation-title">{{ item.title }}</view>
                <view class="item-info">
                  <view class="item-info-label">{{ (item.totalDuration || item.totalDuration === 0) ?
                    `${item.totalDuration}min` : '-' }}</view>
                </view>
              </view>
              <view class="item-btn">
                学习
              </view>
            </view>
            <template v-if="nothing">
              <view class="end-text">到底了！</view>
            </template>
          </scroll-view>
        </view>
      </view>
      <view class="detail-content-right">
        <view class="web-view-box">
          <web-view ref="studyWebview" v-if="jumpUrl" :src="jumpUrl"></web-view>
        </view>
      </view>
    </view>
  </view>

</template>

<script>
const statusMap = {
  1: '未学习',
  2: '未完成',
  3: '待考核',
  4: '未通过',
  5: '已完成'
}
export default {
  data() {
    return {
      statusMap,
      courseList: [],
      recommendCourseList: [],
      apiType: '',
      selectedIndex: 0,
      jumpUrl: '',
      webviewHistory: [],
      pageData: {},
      nothing: false,
      tokenUrl: '',
      otherParams: {}
    }
  },
  onLoad(options) {
    this.apiType = options.apiType;
    this.pageData = {
      pageNum: options.pageNum,
      pageSize: options.pageSize,
      total: options.total
    }
    if (options.apiType == 'getMyCourseList') {
      this.otherParams = {
        learnStatus: options.learnStatus
      }
    }
    this.selectedIndex = options.index;
    let courseId = null;
    if (options.courseList) {
      this.courseList = JSON.parse(decodeURIComponent(options.courseList));
      courseId = this.courseList[options.index].courseId;
    }
    console.log(this.courseList, 'this.courseList')
    this.handleOperation(courseId);
    // 只在页面初始化时设置webview的样式
    this.setWebviewStyle();
  },
  onBackPress(options) {
    if (options.from === "backbutton") {
      // 物理返回按钮触发
      // 阻止默认行为，即不执行页面返回
      this.backPage();
      return true;
    }
    // 其他情况允许正常返回
    return false;
  },
  methods: {
    backPage() {
      const currentWebview = this.$scope.$getAppWebview().children()[0];
      if(currentWebview){
        currentWebview.close()
      }
      uni.navigateBack()
    },
    async openCourse(index, item) {
      console.log(index, 'index')
      this.selectedIndex = index;
      this.tokenUrl = await this.findBeiSenSSOToken()  // 每次都重新获取token，防止过期
      // const arr = ['80cb90d7-1609-4360-8f23-6c47ddba41c0', '17983a1a-5bcd-4e7d-a180-061ef3f9a49d']
      // 只更换url
      this.handleOperation(item.courseId);

      // if (this.type === 'recommendation') {
      //   uni.$track.add({ eventCode: 'app_recommend_course', businessId: item.id, pagePath: '/pages/common/studyDetail/detail' })
      // } else if (this.type === 'long') {
      //   uni.$track.add({ eventCode: 'app_long_course', businessId: item.id, pagePath: '/pages/common/studyDetail/detail' })
      // }
    },
    findBeiSenSSOToken() {
      return new Promise(resolve => {
        uni.$api.commonApi.findBeiSenSSOToken({}).then(res => {
          uni.$storage.set('beisenToken', res.data)
          resolve(res.data)
        })
      })
    },
    handleOperation(courseId) {
      // 只处理课程详情，设置jumpUrl
      const COURSE_ID = courseId;
      const baseUrl = 'https://cloud.italent.cn/PageHome/Index';
      const params = {
        product: 'Learning',
        keyName: 'Nusion',
        pageCode: 'LearningCourseTraineeDetailPage',
        appCode: 'Learning',
        id: COURSE_ID
      };
      this.jumpUrl = ''
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      const tokenUrl = this.tokenUrl || uni.$storage.get('beisenToken')
      // this.setWebviewStyle()
      const url = encodeURIComponent(`${baseUrl}?${queryString}#/viewDynamic?1=1`);
      this.jumpUrl = `${tokenUrl}&return_url=${url}`;

    },
    setWebviewStyle() {
      // 只在页面初始化时设置webview的样式
      // plus.navigator.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0') 
      const setWebviewStyleWithRetry = () => {
        console.log(this.$scope.$getAppWebview(), 'this.$parent.$scope')
        const currentWebview = this.$scope.$getAppWebview();
        const wv = currentWebview.children()[0];
        console.log(wv, 'wv')
        if (wv) {
          wv.setStyle({
            left: '470',
            top: '100',
            height: '620',
            width: '653',
            borderRadius: '24',
            overflow: 'hidden'
          });
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
    pageonReachBottom() {
      console.log('到底了', this.pageData, pageNum < Math.ceil(total / pageSize));
      const { pageNum, pageSize, total } = this.pageData;
      if (pageNum < Math.ceil(total / pageSize)) {
        this.pageData.pageNum = Number(this.pageData.pageNum) + 1;
        this.getCourseTaskPage();
      } else {
        this.nothing = true;
      }
    },
    // 获取我的任务接口, completeStatus: 完成状态 0=待完成 1=已完成, courseType: 课程类型 1=短课程 2=长课程
    async getCourseTaskPage() {
      try {
        uni.showLoading({
          mask: true
        })
        const { apiType } = this
        const { pageNum, pageSize } = this.pageData
        const params = {
          pageNum,
          pageSize,
          staffPhone: uni.$storage.get('userInfo').phone
        }
        const res = await uni.$api.commonApi[apiType]({...params, ...this.otherParams})
        if (pageNum == 1) {
          this.courseList = res.list
        } else {
          this.courseList = this.courseList.concat(res.list)
        }
        uni.hideLoading()
        this.total = res.total
        this.nothing = res.length ? true : false
      } catch (error) {
        uni.showToast({
          title: error,
          icon: "none",
        });
      }
    },
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
  height: calc(100vh - #{toRpx(214)});

  .detail-content-left {
    width: toRpx(800);
    height: 100%;
    background: #fff;
    border-radius: toRpx(32);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    margin-right: toRpx(32);
    z-index: 999999;

    .title {
      font-size: toRpx(34);
      color: #292D33;
      font-weight: 700;
      padding: toRpx(32) toRpx(48);
    }

    .scroll-view-box {
      display: flex;
      padding: 0 toRpx(32) toRpx(32);
      height: calc(100% - #{toRpx(110)});
    }

    .scroll-view {
      border-radius: toRpx(24);
      background-color: #fff;
      height: 100%;

      .scroll-view-item {
        position: relative;
        display: flex;
        padding: toRpx(24);
        align-items: center;

        &:first-child {
          border-radius: toRpx(24) toRpx(24) 0 0;
        }

        &:last-child {
          border-radius: 0 0 toRpx(24) toRpx(24);
        }

        &:first-child:last-child {
          /* 只有一个元素时，四个角都圆角 */
          border-radius: toRpx(24);
        }


        &.active {
          background: #EBF0FF;
        }

        .item-img {
          width: toRpx(128);
          height: toRpx(160);
          border-radius: toRpx(16);
        }

        .recommendation-img {
          width: toRpx(128);
          height: toRpx(144);
          border-radius: toRpx(16);
        }

        .item-content {
          display: flex;
          flex-direction: column;
          margin-left: toRpx(24);
          width: toRpx(364);

          .item-title {
            font-size: toRpx(30);
            color: #333333;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            margin-bottom: toRpx(16);
          }

          .recommendation-title {
            color: #292D33;
            font-size: toRpx(30);
            margin-bottom: toRpx(8);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
          }

          .item-info {
            display: flex;
            align-items: center;
            font-size: toRpx(24);

            &:not(:last-child) {
              margin-bottom: toRpx(10);
            }

            .item-info-label {
              color: #999EA8;
              margin-right: toRpx(24);
            }

            .item-info-value {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #666666;

              &.orange {
                color: #F59619;
              }

              &.green {
                color: #2CCA74;
              }

              .dot-value {
                width: toRpx(12);
                height: toRpx(12);
                border-radius: 50%;
                background: #F59619;
                margin-right: toRpx(8);
              }
            }
          }
        }

        .item-btn {
          margin-left: auto;
          width: toRpx(148);
          height: toRpx(64);
          border-radius: toRpx(24);
          background: #F1F7FE;
          font-size: toRpx(26);
          color: #3B73FF;
          text-align: center;
          line-height: toRpx(64);
        }

        .completed-bg {
          width: toRpx(112);
          height: toRpx(112);
          position: absolute;
          bottom: toRpx(56);
          right: toRpx(40);
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }

  .detail-content-right {
    flex: 1;
    background: #fff;
    border-radius: toRpx(32);
    background: #ffffff;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;

    .web-view-box {
      border-radius: toRpx(32);
      overflow: hidden;
    }
  }
}

.end-text {
  color: #999;
  text-align: center;
  padding: toRpx(30) 0;
  font-size: toRpx(24);
}
</style>