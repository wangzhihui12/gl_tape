<template>
  <view
    class="detail-box"
    @click="closeToolTip"
  >
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
      车主详情
    </view>
    <view class="customer-box box">
      <view class="title">车主信息</view>
      <view class="customer-info">
        <template v-for="(item, index) in customerForm">
          <view
            class="item flex"
            :key="index"
          >
            <view class="label">{{ item.label }}</view>
            <view
              class="value text-hide"
              :id="item.key"
            >
              {{ customerInfo[item.key] }}
            </view>
            <template v-if="item.showTooltipIcon">
              <view
                class="sprite-icon icon-customer-detail"
                @click.stop="showTooltipBox(item)"
              ></view>
              <view
                class="tooltip-box"
                v-if="item.showTooltip"
                @click.stop
              > {{ customerInfo[item.key] }}</view>
            </template>
          </view>
        </template>
      </view>
    </view>
    <view class="case-box box">
      <view class="title flex">推荐套餐</view>
      <scroll-view
        class="case-scroll-box"
        scroll-y
        @scrolltolower="pageonReachBottom"
      >
        <view class="case-list">
          <template v-if="flag">
            <template v-if="list.length && list[0] && list[0].length">
              <template v-for="i in list">
                <template v-for="item in i">
                  <view
                    class="case-item"
                    :key="item.id"
                  >
                    <case-item
                      :item="item"
                      :visitsId="visitsId"
                    />
                  </view>
                </template>
              </template>
            </template>
            <template v-else>
              <view class="nothing flex">
                <view class="icon"></view>
                暂无推荐套餐
              </view>
            </template>
          </template>
          <template v-if="nothing">
            <view class="end-text">-已经到底了-</view>
          </template>
        </view>
      </scroll-view>
    </view>

    <!-- <package-popup
      ref="packageVisible"
      @select="handleSearch"
      @close="arrowPopup = false"
    ></package-popup> -->
  </view>
</template>

<script type="text/ecmascript-6">
import dayjs from 'dayjs'
import PackagePopup from './components/PackagePopup.vue'
import CaseItem from '@/components/HomeFrame/components/ReceptionCenter/CaseItem.vue'
export default {
  components: {
    PackagePopup,
    CaseItem
  },
  data () {
    return {
      customerForm: [{
        label: '车主姓名',
        key: 'ownerName',
      },
      {
        label: '车主电话',
        key: 'ownerPhone',
      },
      {
        label: '品牌车型',
        key: 'brandModel',
      },
      {
        label: '接待场景',
        key: 'receptionSceneName',
      },
      {
        label: '到店日期',
        key: 'arrivalDate',
      },
      {
        label: '客户标签',
        key: 'customerTagName',
        hasTooltip: true
      }],
      caseInfo: [
        {
          label: '业务场景',
          class: 'text-hide',
          format: (val) => {
            // 业务场景：0-会员权益/升级；1-精品升级；2-次新车转化；3-售后众筹；4-积分商城
            return val ? {
              0: '会员权益/升级',
              1: '精品升级',
              2: '次新车转化',
              3: '售后众筹',
              4: '积分商城'
            }[val.scene] : '--'
          }
        },
        {
          label: '客户标签',
          key: 'tags',
          class: 'text-hide'
        },
        {
          label: '适用套餐',
          key: 'goods',
          class: 'text-two-line'
        },
      ],
      customerInfo: {},
      arrowPopup: false,
      nothing: true,
      list: [],
      currentPage: 1,
      total: 0,
      flag: false,
      nothing: false,
      pageSize: 8
    }
  },
  onLoad (options) {
    if (options.id) {
      this.findVisitsInfo(options.id)
      this.visitsId = options.id
    }
    else {
      uni.showToast({
        title: '客户id为空',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack({
          delta: 1,
          animationType: 'pop-out',
          animationDuration: 200
        })
      }, 1e3)
    }
  },
  mounted () {
  },
  methods: {
    async findVisitsInfo (id) {
      const customerInfo = await uni.$api.customerApi.findVisitsInfo({
        id
      }),
        { customerForm } = this
      customerInfo.customerTagName = customerInfo.customerTagName.replace(/,/g, '｜')
      customerInfo.arrivalDate = dayjs(customerInfo.arrivalDate).format("YYYY.MM.DD")
      this.customerInfo = customerInfo
      this.getMaterialResponsePage()
      this.$nextTick(() => {
        this.checkTextWidth(customerForm.find(e => e.hasTooltip))
      })
    },
    showPopup () {
      this.arrowPopup = true
      this.$refs.packageVisible.open()
    },
    async getMaterialResponsePage () {
      try {
        uni.showLoading({
          mask: true
        })
        let { shopMerchantId, sceneType } = uni.$storage.get("userInfo"),
          { customerInfo: { receptionScene, customerTag }, pageSize, currentPage } = this,
          customerLabelList = []
        customerTag.split(',')?.map(e => customerLabelList.push({
          labelId: e
        }))
        let params = {
          currentPage,
          pageSize,
          receptionScene,
          status: 1,
          receptionSceneInfoList: [
            { receptionSceneId: receptionScene }
          ],
          customerLabelList,
          merchantId: shopMerchantId,
          showChannel: 2,
          scene: sceneType
        }
        const { list, total } = await uni.$api.customerApi.getMaterialResponsePage(params)
        uni.hideLoading()
        list.map(e => {
          let tags = [],
            goods = []
          e.customerLabelInfoList?.map(item => {
            tags.push(item.labelName)
          })
          e.productPackageInfoList?.map(item => {
            goods.push(item.upgradeGoodsName)
          })
          e.tags = tags.join('、')
          e.goods = goods.join('、')
        })
        this.list[currentPage - 1] = list
        this.flag = true
        this.total = total
        this.$forceUpdate()
      } catch (error) {
        uni.hideLoading()
        this.flag = true
      }
    },
    back () {
      uni.navigateBack({
        delta: 1,
        animationType: 'pop-out',
        animationDuration: 100
      })
    },
    pageonReachBottom () {
      let { currentPage, total, nothing, pageSize } = this
      if (!nothing) nothing = 'nothing'
      if (Math.ceil(total / pageSize) > currentPage) {
        this.currentPage += 1
        this.getMaterialResponsePage()
      } else this.nothing = true
    },
    checkTextWidth (item) {
      if (!item) return
      let query = uni.createSelectorQuery().in(this)
      query.select(`#${item.key}`).boundingClientRect((data) => {
        if (data.width > 410) item.showTooltipIcon = true
        this.$forceUpdate()
      }).exec()
    },
    showTooltipBox (item) {
      item.showTooltip = !item.showTooltip
      this.$forceUpdate()
    },
    closeToolTip () {
      let item = this.customerForm.find(e => e.hasTooltip)
      if (item.showTooltipIcon) {
        item.showTooltip = false
        this.$forceUpdate()
      }
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
  padding-top: toRpx(160);
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
  .box {
    width: toRpx(2218);
    background: #ffffff59;
    box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
    border-radius: toRpx(48);
    backdrop-filter: blur(toRpx(8));
    margin: 0 auto;
    box-sizing: border-box;
    .title {
      font-weight: 500;
      font-size: toRpx(32);
      color: #333333;
      line-height: toRpx(44);
      padding: toRpx(32) toRpx(48) toRpx(28);
      .search-btn {
        margin-left: auto;
        position: relative;
        &::after {
          content: '';
          display: block;
          border: toRpx(16) solid transparent;
          border-left-width: toRpx(12);
          border-right-width: toRpx(12);
          border-top-color: #000000e6;
          position: relative;
          top: toRpx(8);
          margin-left: toRpx(20);
          transition: all 0.15s;
        }
      }
      .arrow-popup {
        &::after {
          transform: rotate(180deg);
          top: toMinusRpx(8);
        }
      }
    }
  }
  .customer-box {
    height: toRpx(292);
    margin-bottom: toRpx(32);
    position: relative;
    z-index: 2;
    .customer-info {
      display: flex;
      flex-wrap: wrap;
      padding: 0 toRpx(48);
      gap: toRpx(12) toRpx(38);
      .item {
        width: toRpx(1042);
        flex-shrink: 0;
        font-size: toRpx(28);
        line-height: toRpx(44);
        position: relative;
        .label {
          color: #292d3399;
          width: toRpx(160);
          flex-shrink: 0;
        }
        .value {
          color: #292d33;
        }
        .icon-customer-detail {
          flex-shrink: 0;
          margin-left: toRpx(16);
        }
        .tooltip-box {
          position: absolute;
          right: 0;
          top: toRpx(60);
          width: toRpx(792);
          background: #ffffffcc;
          box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
          border-radius: toRpx(16);
          backdrop-filter: blur(toRpx(8));
          box-sizing: border-box;
          padding: toRpx(24) toRpx(28);
          font-size: toRpx(28);
          color: #292d33;
          line-height: toRpx(44);
          max-height: 50vh;
          overflow-y: scroll;
          word-break: break-all;
        }
      }
    }
  }
  .case-box {
    height: toRpx(1020);
    padding: 0 !important;
    .case-scroll-box {
      height: calc(100% - #{toRpx(104)});
    }
    .case-list {
      display: flex;
      flex-wrap: wrap;
      gap: toRpx(32) toRpx(46);
      padding: 0 toRpx(48);
      .case-item {
        width: toRpx(496);
        height: toRpx(588);
      }
    }
  }
}
.nothing {
  width: 100%;
  flex-direction: column;
  margin-top: toRpx(112);
  font-size: toRpx(28);
  color: #999999;
  .icon {
    width: toRpx(676);
    height: toRpx(284);
    margin-bottom: toRpx(24);
    background-image: url('@/assets/images/home/nothing.webp');
    background-size: 100% 100%;
  }
}
.end-text {
  width: 100%;
  text-align: center;
  color: #999;
  text-align: center;
  padding: toRpx(50) 0;
  font-size: toRpx(24);
}
</style>
