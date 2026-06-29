<template>
  <view class="record-box">
    <view class="record-content">

      <view class="data-container">
        <view class="control-box flex">
          <view class="tabs">
            <page-tabs
              :list="dateList"
              @changeTab="changeIndex"
            />
          </view>
          <view class="select-box-list select-component flex">
            <view
              class="add-btn flex"
              @click="editItem(false)"
            >
              <view class="sprite-icon icon-customer-add"></view>
              预录信息
            </view>
          </view>
        </view>
        <scroll-view
          :class="['record-list']"
          scroll-y
          @scrolltolower="pageonReachBottom"
        >
          <view class="list">
            <template v-if="flag">
              <template v-if="list.length && list[0] && list[0].length">
                <template v-for="(i,index) in list">
                  <template v-for="(item,cindex) in i">
                    <view
                      class="item"
                      :key="item.id"
                      @longpress="longPress(item,index,cindex)"
                      @click="jumpDetail(item.id)"
                    >
                      <view class="name">
                        {{ item.ownerName }}
                      </view>
                      <template v-for="(k, ind) in itemObject">
                        <view
                          class="info flex"
                          :key="`${item.id}-${ind}`"
                          v-if="showItem(k.key)"
                        >
                          <view class="label">{{ k.label }}</view>
                          <view class="value text-hide">{{ item[k.key] || "-" }}</view>
                        </view>
                      </template>

                      <view
                        :class="['mask',{'show-mask':item.maskStatus}]"
                        @click.stop
                      >
                        <view
                          class="mask-close"
                          @click.stop="closeMask(index,cindex)"
                        >
                          <uni-icons
                            type="closeempty"
                            :size="16"
                            color="#fff"
                          ></uni-icons>
                        </view>
                        <template v-if="item.showDel">
                          <view class="mask-del-box flex">
                            是否删除该客户档案
                            <view class="btns flex">
                              <view
                                class="btn cancel"
                                @click.stop="switchDel(index,cindex)"
                              >取消</view>
                              <view
                                class="btn"
                                @click.stop="delItem(item.id,index,cindex)"
                              >确定</view>
                            </view>
                          </view>
                        </template>
                        <template v-else>
                          <view class="mask-box flex">
                            <view
                              class="mask-item"
                              @click="editItem(item)"
                            >
                              <view class="sprite-icon icon-mask-edit"></view>
                              编辑
                            </view>
                            <view
                              class="mask-item"
                              @click.stop="switchDel(index,cindex, true)"
                            >
                              <view class="sprite-icon icon-mask-del"></view>
                              删除
                            </view>
                          </view>
                        </template>
                      </view>
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
                  暂无预录记录
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

  </view>
</template>
<script type="text/ecmascript-6">
import dayjs from 'dayjs'
import PageTabs from '@/components/PageTabs.vue'
export default {
  components: {
    PageTabs
  },
  name: '',
  props: {
    show: Boolean
  },
  data () {
    return {
      dateList: [
        { text: '今日到店' },
        { text: '全部客户' },
      ],
      itemObject: [
        { label: '车主电话', key: 'ownerPhone' },
        { label: '品牌车型', key: 'brandModel' },
        { label: '客户标签', key: 'customerTagName' },
        { label: '到店日期', key: 'arrivalDate' },
        { label: '接待时间', key: 'receptionTime' },
        { label: '接待人员', key: 'receptionist' },
      ],
      dateIndex: 0,
      pageNum: 1,
      total: 0,
      list: [],
      flag: false,
      nothing: false,
      pageSize: 10,
      loaded: false
    }
  },
  computed: {
    activeBtnStyle () {
      let { dateIndex } = this,
        val = dateIndex * 184
      return {
        transform: `translate(toRpx(${val}), -50%)`
      }
    },
  },
  watch: {
    show: {
      immediate: true,
      handler (newval) {
        if (newval && !this.loaded) {
          this.init()
          this.loaded = true
        }
      }
    }
  },
  mounted () {

  },
  methods: {
    refresh () {
      this.flag = false
      this.list = []
      this.pageNum = 1;
      this.nothing = false
      this.getReceptionList()
    },
    init () {
      this.dateList.map((e, index) => {
        const tatget = ['day', 'all'][index]
        const {
          startTime,
          endTime
        } = this.getDateRange(tatget)
        e.startTime = startTime
        e.endTime = endTime
      })
      this.getReceptionList()
    },
    async getReceptionList () {
      try {
        uni.showLoading({
          mask: true
        })
        let { dateList, dateIndex, pageNum, pageSize } = this,
          { shopMerchantId, sceneType } = uni.$storage.get("userInfo"),
          { startTime, endTime } = dateList[dateIndex],
          params = {
            pageNum,
            pageSize,
            receptionStatus: 1,
            merchantId: shopMerchantId,
            bussinessScene: sceneType == 0 ? 1 : 2 // 1.延保 2.轻改
          }
        if (startTime && endTime) {
          params.startTime = startTime
          params.endTime = endTime
        }
        const { list, total } = await uni.$api.customerApi.getCustomerFileList(params)
        uni.hideLoading()
        list?.length && list.map(e => {
          let ownerPhone = e.ownerPhone
          e.arrivalDate = dayjs(e.arrivalDate).format("YYYY.MM.DD")
          e.receptionTime = dayjs(e.receptionTime).format("YYYY.MM.DD HH:mm")
          e.ownerPhone = ownerPhone.slice(0, 3) + " " + ownerPhone.slice(3, 7) + " " + ownerPhone.slice(7)
          e.customerTagName = e.customerTagName ? e.customerTagName.replace(/,/g, '｜') : ''
          e.maskStatus = false
        })
        this.list[pageNum - 1] = list
        this.flag = true
        this.total = total
      } catch (error) {
        uni.hideLoading()
        this.flag = true
      }
    },
    changeIndex (index) {
      if (this.dateIndex == index) return
      this.dateIndex = index
      this.refresh()
    },
    pageonReachBottom () {
      let { pageNum, total, nothing, pageSize } = this
      if (!nothing) nothing = 'nothing'
      if (Math.ceil(total / pageSize) > pageNum) {
        this.pageNum += 1
        this.getReceptionList()
      } else this.nothing = true
    },
    getDateRange (type) {
      let now = new Date();
      let startTime, endTime;
      if (type === 'day') {
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else {
        startTime = null
        endTime = null
      }
      return {
        startTime: startTime ? dayjs(startTime).format("YYYY-MM-DD") + ' 00:00:00' : '',
        endTime: endTime ? dayjs(endTime).format("YYYY-MM-DD") + ' 23:59:59' : ''
      };
    },
    showItem (key) {
      let flag = true
      if (['receptionTime', 'receptionist'].includes(key)) flag = false
      return flag
    },
    longPress (item, index, ind) {
      if (item.maskStatus) return
      this.list[index][ind].maskStatus = true
      this.$forceUpdate()
    },
    closeMask (index, ind) {
      this.list[index][ind].maskStatus = false
      this.switchDel(index, ind, false)
    },
    switchDel (index, ind, result) {
      this.list[index][ind].showDel = result
      this.$forceUpdate()
    },
    editItem (item) {
      this.$emit('editCustomer', item.id || '')
    },
    async delItem (id, index, ind) {
      try {
        const res = await uni.$api.customerApi.delCustomerFile({ id })
        if (res) {
          this.list[index].splice(ind, 1)
          this.$forceUpdate()
          this.$emit('showSuccess')
        }
      } catch (error) {
        uni.showToast({
          title: error,
          icon: 'none'
        })
      }
    },
    jumpDetail (id) {
      uni.navigateTo({
        url: `/pages/common/customerDetail?id=${id}`,
        animationType: 'pop-in',
        animationDuration: 100
      })
    },
  }
}
</script>
<style scoped lang="scss">
.record-box {
  box-sizing: border-box;
  height: 100%;
  .record-content {
    height: 100%;
    box-sizing: border-box;
    .data-container {
      background: #ffffff;
      border-radius: toRpx(48);
      height: 100%;
      box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      .control-box {
        height: toRpx(164);
        .tabs {
          width: toRpx(392);
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
  }
  .record-list {
    height: calc(100% - #{toRpx(164)});
    box-sizing: border-box;
    position: relative;
    z-index: 4;
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
      .status {
        position: absolute;
        top: toRpx(24);
        right: toRpx(32);
        width: toRpx(88);
        height: toRpx(44);
        background: #fdece9;
        color: #f24724;
        border-radius: toRpx(4);
        font-weight: 500;
        font-size: toRpx(24);
        justify-content: center;
      }
      .deal {
        background: #eaf9f1;
        color: #35c376;
      }
      .name {
        font-weight: 500;
        font-size: toRpx(32);
        color: #292d33;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: toRpx(44);
        max-width: 100%;
      }
      .info {
        margin-top: toRpx(12);
        font-size: toRpx(24);
        color: #999ea8;
        .value {
          margin-left: auto;
          color: #666666;
          max-width: toRpx(388);
        }
      }
      .mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        border-radius: toRpx(16);
        opacity: 0;
        pointer-events: none;
        &-close {
          position: absolute;
          right: toRpx(16);
          top: toRpx(16);
          z-index: 8;
        }
        &-box {
          width: 100%;
          height: 100%;
          justify-content: center;
          gap: 0 toRpx(96);

          .mask-item {
            font-size: toRpx(26);
            color: #ffffff;
            text-align: center;
            line-height: toRpx(36);
            .sprite-icon {
              margin-bottom: toRpx(8);
            }
          }
        }
        &-del-box {
          width: 100%;
          height: 100%;
          justify-content: center;
          font-size: toRpx(28);
          color: #ffffff;
          line-height: toRpx(36);
          flex-direction: column;
          animation: opacity-0-1 0.5s forwards;
          .btns {
            justify-content: center;
            gap: 0 toRpx(16);
            margin-top: toRpx(56);
            .btn {
              width: toRpx(192);
              height: toRpx(64);
              background-image: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
              border-radius: toRpx(32);
              box-sizing: border-box;
              text-align: center;
              line-height: toRpx(64);
              font-size: toRpx(26);
              color: #ffffff;
            }
            .cancel {
              border: toRpx(2) solid #ffffff;
              background-image: none;
            }
          }
        }
      }
      .show-mask {
        pointer-events: auto;
        opacity: 1;
      }
    }
    .case-item {
      width: 22.8%;
      height: toRpx(552);
    }
  }
}
.add-btn {
  width: toRpx(244);
  height: toRpx(72);
  border-radius: toRpx(16);
  background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
  font-size: toRpx(30);
  color: #ffffff;
  justify-content: center;
  .sprite-icon {
    margin-right: toRpx(8);
    zoom: 2;
  }
}
.tabs-bottom {
  background: #fff;
  height: toRpx(48);
  position: relative;
  border-radius: toRpx(48) toRpx(48) 0 0;
  position: absolute;
  width: 100%;
  top: toRpx(128);
}
.data-tabs-box {
  position: relative;
  top: 0;
  margin-top: toMinusRpx(8);
  .data-tabs {
    display: flex;
    justify-content: space-between;
    width: fit-content;
    height: toRpx(68);
    background-color: #f2f2f2;
    border-radius: toRpx(16);
    margin-left: toRpx(64);
    position: relative;
    padding: toRpx(4);
    box-sizing: content-box;
    &::after {
      position: absolute;
      z-index: -2;
      background: #ffffff;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      content: '';
    }
    .tab {
      width: toRpx(184);
      height: toRpx(68);
      justify-content: center;
      font-size: toRpx(28);
      color: #1f2133;
      z-index: 10;
      opacity: 0.7;
    }
    .active {
      opacity: 1;
      font-weight: 500;
    }
    .active-btn {
      position: absolute;
      width: toRpx(184);
      height: toRpx(68);
      background: #ffffff;
      top: 50%;
      transform: translateY(-50%);
      border-radius: toRpx(16);
      transition: all 0.15s;
    }
    .active-btn-0 {
      left: toRpx(4);
    }
    .active-btn-1 {
      left: toRpx(188);
    }
    .active-btn-2 {
      left: toRpx(372);
    }
    .active-btn-3 {
      left: toRpx(556);
    }
  }
}
.scene-box {
  position: relative;
  top: 0;
  z-index: 3;
  margin-top: toMinusRpx(8);
  padding: 0 toRpx(64);
  .scene-tabs {
    gap: 0 toRpx(24);
    .tab {
      height: toRpx(80);
      background: #f2f2f2;
      border-radius: toRpx(16);
      padding: 0 toRpx(32);
      justify-content: center;
      font-size: toRpx(28);
      color: #666666;
      transition: all 0.15s;
    }
    .active {
      font-weight: 500;
      color: #2d66f7;
      background: #2d66f71a;
    }
  }
  .btn-list {
    margin-left: auto;
    gap: 0 toRpx(48);
    line-height: toRpx(48);
    .search-btn {
      &::after {
        content: '';
        border: toRpx(12) solid transparent;
        border-left-color: #000;
        margin-left: toRpx(12);
        transform: translateY(toMinusRpx(2));
      }
    }
    .check-box {
      width: toRpx(32);
      height: toRpx(32);
      background: #ffffff;
      border: toRpx(3) solid #999;
      border-radius: toRpx(6);
      box-sizing: border-box;
      margin-right: toRpx(16);
      justify-content: center;
      overflow: hidden;
      transition: all 0.25s;
      flex-shrink: 0;
      transform: translateY(toMinusRpx(2));
    }
    .checked {
      background: #2c66f7;
      border-color: #2c66f7;
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
    width: toRpx(676);
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
@keyframes opacity-0-1 {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
