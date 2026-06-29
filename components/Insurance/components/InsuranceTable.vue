<template>
  <view :class="['views-box', {'preview':isPreview}]">
    <view class="views-title-box flex">
      <template v-for="(i,index) in viewsTitle">
        <view
          v-if="showRow(index)"
          :class="['title-item flex',`row-${index + 1}`]"
          :key="index"
        >{{i}}</view>
      </template>
    </view>
    <view class="views-content">
      <view
        class="main"
        v-if="flag && check"
      >商业险</view>
      <scroll-view
        class="table"
        scroll-y
        :scroll-top="scrollTop"
      >
        <template v-if="flag">
          <template v-if="check">
            <template v-for="(i,index) in insuranceList">
              <view
                :class="['insurance-item flex',{'disabled':!i.show},{'disabled-input':!i.checked}]"
                :key="index"
                v-if="showInsurance(i)"
              >
                <view class="row-1 flex">
                  <view :class="['block',defaultBlock(i)]"></view>
                  <view
                    class="name flex"
                    @click="choose(i,index)"
                  >
                    <template v-if="!isPreview">
                      <view :class="['check-box flex',{'checked':i.checked}]">
                        <uni-icons
                          type="checkmarkempty"
                          :size="14"
                          color="#fff"
                        ></uni-icons>
                      </view>
                    </template>
                    <view class="text-two-line">{{i.itemName}}</view>
                  </view>
                </view>
                <view
                  class="range row-2"
                  @click="showDetail(i)"
                >
                  <view class="text-two-line">
                    <rich-text :nodes="i.itemDesc"></rich-text>
                  </view>
                </view>
                <view class="cost row-3">
                  <view class="cost-input">
                    <input
                      type="digit"
                      maxlength="9"
                      v-model="i.cost"
                      class="input"
                      placeholder="输入金额"
                      :disabled="!i.show || !i.checked"
                      :placeholder-style="`color:${i.show && i.checked?'#999':'#ccc'}`"
                      @blur="handleInput"
                      :data-index="index"
                    />
                    <view class="unit">元</view>
                  </view>
                </view>
                <view
                  class="show row-4"
                  @click="setItemDisabled(i,index)"
                >
                  <view :class="['sprite-icon',`${i.show ? 'icon-visible' : 'icon-invisible'}`]"></view>
                </view>
              </view>
            </template>
          </template>
          <template v-else>
            <view class="nothing flex">
              <view class="sprite-icon icon-no-insurance-data"></view>
              暂无数据{{!isPreview?'，请进入预览模式，开启相关车险及权益内容':''}}
            </view>
          </template>
        </template>
      </scroll-view>
    </view>

    <view class="views-footer flex">
      <view class="sprite-icon icon-total"></view>
      合计
      <view class="total">{{total}}</view>
      <view class="util">元</view>
    </view>
    <insurance-popup
      ref="popupRef"
      :item="currentItem"
    ></insurance-popup>
  </view>
</template>

<script type='text/ecmascript-6'>
import NP from 'number-precision'
import InsurancePopup from './InsurancePopup'
export default {
  props: {
    isPreview: Boolean,
    show: Boolean,
  },
  components: { InsurancePopup },
  data () {
    return {
      viewsTitle: ['险种及权益', '主要保障范围', '费用', '是否显示'],
      currentItem: {},
      insuranceList: [],
      scrollTop: 0,
      storageKey: '',
      flag: false
    }
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.$refs.popupRef?.close()
        this.flag = false
        this.scrollTop = -1
        setTimeout(() => {
          this.scrollTop = 0
        }, 100);
        const storageKey = this.getStorageKey(),
          insuranceList = uni.getStorageSync(storageKey)
        if (insuranceList) {
          insuranceList.map(e => e.cost = '')
          this.insuranceList = JSON.parse(JSON.stringify(insuranceList))
          this.flag = true
        }

      }
    },
    show (n) {
      if (n) {
        this.getMerchantInsuranceList()
      }
    },
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    total () {
      return this.insuranceList.reduce((pre, cur) => {
        return NP.plus(pre, NP.times(cur.cost, (this.isPreview ? cur.show : cur.checked) ? 1 : 0))
      }, 0)
    },
    check () {
      return this.isPreview ? this.insuranceList.length : this.insuranceList.filter(item => item.show).length
    }
  },
  mounted () {
    this.getStorageKey()
  },
  methods: {
    getStorageKey () {
      const { phone, shopMerchantId } = uni.$storage.get("userInfo"),
        storageKey = `${shopMerchantId}_${phone}_insurance_list`
      this.storageKey = storageKey
      return storageKey
    },
    showRow (index) {
      let flag = true
      if (index == this.viewsTitle.length - 1 && !this.isPreview) flag = false
      return flag
    },
    showDetail (e) {
      this.currentItem = e
      this.$refs.popupRef.open()
    },
    handleInput (event) {
      let value = event.target.value,
        { index } = event.currentTarget.dataset
      if (value.length == 0) return
      value = Number(value) > 999999 ? 999999 : value
      if (!Number.isInteger(value)) value = String(value).replace(/(\d*\.?\d{0,2})\d*/, '$1')
      value = Number(String(value).replace(/^0+/, ''))
      this.insuranceList[index].cost = Number(value).toFixed(2) ? Number(value).toFixed(2) >= 0 ? value : '' : ''
    },
    defaultBlock (item) {
      return item.main == '交强险' ? (this.isPreview ? 'has-default' : item.show ? 'has-default' : '') : ''
    },
    showInsurance (item) {
      return this.isPreview ? true : item.show ? true : false
    },
    setItemDisabled (item, index) {
      const { storageKey } = this
      this.insuranceList[index].show = !item.show
      uni.setStorageSync(storageKey, this.insuranceList);
    },
    /**
     * 查询门店保险权益
     */
    async getMerchantInsuranceList () {
      try {
        const { storageKey } = this,
          { shopMerchantId } = uni.$storage.get("userInfo"),
          storageInsuranceList = uni.getStorageSync(storageKey),
          list = await uni.$api.userApi.getMerchantInsuranceList({
            merchantId: shopMerchantId,
          })
        list?.map(e => {
          e.cost = ''
          e.checked = true
          e.main = e.itemName == '交强险' ? '交强险' : '商业险'
          e.show = false
          e.itemDesc = e.itemDesc ? this.processHtmlString(e.itemDesc) : ''
        })
        if (!storageInsuranceList) {
          uni.showLoading({
            mask: true
          })
          this.setInsuranceList(storageKey, list || [])
        }
        else {
          let { insuranceList } = this,
            combinedList = [...insuranceList, ...list]
          const deduplicatedList = combinedList.reduce((acc, item) => {
            const existingItem = acc.find(existing => String(existing.id) === String(item.id));
            if (existingItem) {
              existingItem.itemName = item.itemName || ''
              existingItem.itemDesc = item.itemDesc || ''
              if (this.currentItem.id == existingItem.id) this.currentItem = existingItem
            } else acc.push(item)
            return acc;
          }, [])
          let arr = []
          deduplicatedList.map(e => {
            let index = list.findIndex(item => String(item.id) === String(e.id))
            if (index != -1) arr.push(e)
          })
          this.setInsuranceList(storageKey, arr)
        }
      } catch (error) {
        this.flag = true
      }
    },
    setInsuranceList (storageKey, value) {
      uni.hideLoading()
      this.insuranceList = JSON.parse(JSON.stringify(value))
      value.map(e => e.checked = true)
      uni.setStorageSync(storageKey, value);
      this.flag = true
    },
    processHtmlString (htmlString) {
      // 移除 `<br>` 及其变体，并用 `<div></div>` 替换
      let processedString = htmlString.replace(/<\/?br\s*\/?>|\n/g, '<div></div>')
      // 移除 `style` 属性
      processedString = processedString.replace(/style="[^"]*"/g, '');
      // 移除 `<strong>`, `</strong>`, `<em>`, `</em>` 和孤立的 `<` 标签
      processedString = processedString.replace(/<strong>|<\/strong>|<em>|<\/em>|<>/g, '');
      // 替换非 `div` 和非 `span` 的 HTML 标签
      processedString = processedString.replace(/<(?!div|span|p)[^>]*>/g, '</div>');

      return processedString
    },
    choose (item, index) {
      if (this.isPreview) return
      this.insuranceList[index].checked = !item.checked
    },
  }
}
</script>

<style scoped lang='scss'>
.views-box {
  width: toRpx(2090);
  height: toRpx(1080);
  box-sizing: border-box;
  border: toRpx(4) solid #ffffff;
  border-radius: toRpx(40);
  margin: toRpx(56) auto 0;
  .views-title-box {
    height: toRpx(96);
    background-image: linear-gradient(92deg, #d0e6fecc 0%, #c2dbffcc 33%, #d1e4ffcc 77%, #bdd6ffcc 100%);
    backdrop-filter: blur(toRpx(6));
    border-radius: toRpx(40) toRpx(40) 0 0;
    font-weight: 500;
    font-size: toRpx(26);
    color: #292d33;
    line-height: toRpx(40);
    .title-item {
      height: toRpx(96);
      justify-content: center;
      box-sizing: border-box;
      flex-shrink: 0;
    }
  }
  .row-1 {
    width: toRpx(470);
  }
  .row-2 {
    width: toRpx(1092);
    border-right: toRpx(4) solid #fff;
    border-left: toRpx(4) solid #fff;
  }
  .row-3 {
    width: toRpx(528);
  }
  .views-content {
    height: calc(100% - #{toRpx(192)});
    display: flex;
    box-sizing: border-box;
    border-top: toRpx(4) solid #ffffff;
    border-bottom: toRpx(4) solid #ffffff;
    position: relative;
    .main {
      position: absolute;
      top: toRpx(120);
      left: 0;
      width: toRpx(108);
      height: toRpx(748);
      font-weight: 500;
      font-size: toRpx(26);
      color: #292d33;
      display: flex;
      align-items: center;
      justify-content: center;
      writing-mode: vertical-lr;
      text-orientation: upright;
      letter-spacing: toRpx(32);
      z-index: 2;
    }
    .table {
      height: 100%;
      .insurance-item {
        background-color: #f7f9ff;
        border-bottom: toRpx(4) solid #ffffff;
        position: relative;
        .name,
        .range,
        .cost,
        .show {
          min-height: toRpx(120);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s;
        }
        .name,
        .range {
          font-size: toRpx(26);
          color: #292d33;
          padding: toRpx(40) 0;
        }
        .block {
          position: absolute;
          width: toRpx(104);
          height: calc(100% + #{toRpx(4)});
          background: #cfe3fe;
          top: 0;
          left: 0;
        }
        .name {
          width: toRpx(366);
          margin-left: toRpx(108);
          justify-content: flex-start;
          padding: 0 toRpx(40);
          .check-box {
            width: toRpx(32);
            height: toRpx(32);
            background: #ffffff;
            border: toRpx(3) solid #a8c1ff;
            border-radius: toRpx(4);
            box-sizing: border-box;
            margin-right: toRpx(32);
            justify-content: center;
            overflow: hidden;
            font-weight: 700;
            transition: all 0.25s;
            flex-shrink: 0;
          }
          .checked {
            background: #2c66f7;
            border-color: #2c66f7;
          }
        }
        .range {
          padding: toRpx(40) toRpx(64);
          box-sizing: border-box;
          text-align: center;
        }
        .cost {
          &-input {
            position: relative;
            width: toRpx(368);
            height: toRpx(72);
            background: #ffffff;
            border: toRpx(3) solid #a8c1ff;
            border-radius: toRpx(12);
            box-sizing: border-box;
            padding: 0 toRpx(24);
            .input {
              width: 100%;
              height: 100%;
              font-size: toRpx(28);
              border: none !important;
              outline: none;
              color: #292d33;
              line-height: toRpx(72);
              &::placeholder {
                padding: 0 !important;
              }
            }
            .unit {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              right: toRpx(24);
              font-weight: 300;
              font-size: toRpx(28);
              color: #292d33;
              line-height: toRpx(36);
            }
          }
        }
        &:nth-child(even) {
          background: #ebf1ff;
        }
        &:last-child {
          border: none;
          .block {
            height: 100%;
          }
        }
        .has-default {
          box-sizing: border-box;
          border-bottom: toRpx(4) solid #ffffff;
        }
      }
      .disabled {
        .name,
        .range {
          color: #999999;
        }
        .cost {
          &-input {
            border-color: #d8dce6;
            .input,
            .unit {
              color: #cccccc;
            }
          }
        }
      }
      .disabled-input {
        .cost {
          &-input {
            border-color: #d8dce6;
            .input,
            .unit {
              color: #cccccc;
            }
          }
        }
      }
    }
    &::before {
      position: absolute;
      left: toRpx(100);
      top: 0;
      width: toRpx(4);
      height: 100%;
      background: #fff;
      content: '';
      z-index: 2;
    }
    &::after {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: toRpx(104);
      background: #cfe3fe;
      content: '';
      z-index: -1;
    }

    .nothing {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      justify-content: center;
      flex-direction: column;
      font-size: toRpx(26);
      color: #808291;
      .sprite-icon {
        margin-bottom: toRpx(24);
      }
    }
  }
  .views-footer {
    height: toRpx(96);
    background-image: linear-gradient(92deg, #d1e7ffcc 0%, #c2dbffcc 33%, #d1e4ffcc 77%, #bdd6ffcc 100%);
    backdrop-filter: blur(toRpx(6));
    border-radius: 0 0 toRpx(40) toRpx(40);
    justify-content: flex-end;
    box-sizing: border-box;
    padding-right: toRpx(104);
    font-weight: 500;
    font-size: toRpx(28);
    color: #292d33;
    line-height: toRpx(40);
    .sprite-icon {
      margin-right: toRpx(14);
    }
    .total {
      color: #2c66f7;
      font-size: toRpx(48);
      margin: 0 toRpx(16) 0 toRpx(32);
      line-height: toRpx(64);
    }
    .util {
      color: #2c66f7;
    }
  }
}
//预览模式样式
.preview {
  .row-1,
  .row-2,
  .row-3,
  .row-4 {
    flex-shrink: 0;
  }
  .row-1 {
    width: toRpx(404);
  }
  .row-2 {
    width: toRpx(1052);
  }
  .row-3 {
    width: toRpx(465);
  }
  .row-4 {
    border-left: toRpx(4) solid #fff;
    width: toRpx(158);
  }
  .insurance-item {
    position: relative;
    .name {
      width: toRpx(296) !important;
      padding: 0 toRpx(24) !important;
    }
    .show {
      border-left: none;
    }
    &::after {
      position: absolute;
      top: 0;
      right: toRpx(158);
      width: toRpx(4);
      height: 100%;
      background: #fff;
      content: '';
    }
  }
}
</style>