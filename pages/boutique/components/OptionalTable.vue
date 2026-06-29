<template>
  <view class="views-box">
    <view class="views-title-box flex">
      <template v-for="(i,index) in viewsTitle">
        <view
          :class="['title-item flex row',`row-${index + 1}`]"
          :key="index"
        >
          <template v-if="!i">
            <view
              :class="['check-box flex',{'checked':allChecked}]"
              @click="chooseAll"
            >
              <uni-icons
                type="checkmarkempty"
                :size="10"
                :color="`${allChecked?'#fff':'transparent'}`"
              ></uni-icons>
            </view>
          </template>
          <template v-else>
            {{i}}
          </template>
        </view>

      </template>
    </view>
    <view class="views-content">
      <scroll-view
        class="table"
        scroll-y
        :scroll-top="scrollTop"
      >
        <!-- <template v-if="optionals[this.currentCar].length"> -->
        <template v-for="(i,index) in optionalsList">
          <view
            class="optional-item"
            :key="index"
          >
            <view
              class="row-1 flex"
              @click="choose(i,index)"
            >
              <view :class="['check-box flex',{'checked':i.checked}]">
                <uni-icons
                  type="checkmarkempty"
                  :size="10"
                  :color="`${i.checked?'#fff':'transparent'}`"
                ></uni-icons>
              </view>
            </view>
            <view class="row row-2">
              {{i.name}}
            </view>
            <view class="row row-3">
              <rich-text :nodes="i.warranty"></rich-text>
            </view>
            <view class="row row-4">
              {{i.price}}
            </view>
          </view>
        </template>
        <!-- </template>
        <template v-else>
          <view class="nothing flex">
            <view class="sprite-icon icon-no-insurance-data"></view>
            暂无数据
          </view>
        </template> -->
      </scroll-view>
    </view>

    <view class="views-footer">
      <view class="price flex">
        总价：¥
        <view class="total">{{total}}</view>
      </view>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import NP from 'number-precision'
export default {
  props: {
    currentCar: [Number, String],
    show: Boolean
  },
  data () {
    return {
      viewsTitle: ['', '产品名称', '质保', '售价'],
      scrollTop: 0,
      optionalsList: []
    }
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.optionalsList = []
      }
    },
    currentCar: {
      immediate: true,
      handler (newval) {
        this.optionalsList = []
        this.init()
      }
    },
    show: {
      immediate: true,
      handler (newval) {
        if (newval) {
          if (this.optionalsList.length) return
          this.init()
        } else this.optionalsList = []
      }
    },
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    allChecked () {
      let flag = false
      if (this.show) flag = this.optionalsList.filter(item => item.checked).length == this.optionalsList.length
      return flag
    },
    total () {
      let total = 0
      if (this.show) total = Number(this.optionalsList.reduce((pre, cur) => {
        return NP.plus(pre, NP.times(cur.price, cur.checked ? 1 : 0))
      }, 0))
      return total ? total.toFixed(2) : '0.00'
    },
    boutiqueMediaConfig () {
      return this.$store.state.user.boutiqueMediaConfig
    },
  },
  mounted () {
  },
  methods: {
    init () {
      if (!this.show) return
      let { optionals } = this.boutiqueMediaConfig[this.currentCar]
      optionals.map(e => e.checked = false)
      this.optionalsList = optionals
      console.log(this.optionalsList)
      this.scrollTop = -1
      setTimeout(() => {
        this.scrollTop = 0
      }, 100);
      this.$forceUpdate()
    },
    chooseAll () {
      let { allChecked } = this
      this.optionalsList.map(e => {
        e.checked = allChecked ? false : true
      })
    },
    choose (item, index) {
      this.optionalsList[index].checked = !item.checked
    },
  }
}
</script>

<style scoped lang='scss'>
.views-box {
  width: toRpx(2186);
  height: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  padding-top: toRpx(236);
  animation: show-view-opacity 0.15s forwards;
  .views-title-box {
    height: toRpx(96);
    background: #edf2ff;
    border-radius: toRpx(16);
    margin-bottom: toRpx(16);
    .title-item {
      height: toRpx(96);
      box-sizing: border-box;
      flex-shrink: 0;
      font-size: toRpx(26);
      color: #666666;
    }
  }
  .check-box {
    width: toRpx(32);
    height: toRpx(32);
    background: transparent;
    border: toRpx(3) solid #999;
    border-radius: toRpx(6);
    box-sizing: border-box;
    justify-content: center;
    overflow: hidden;
    transition: all 0.25s;
    flex-shrink: 0;
  }
  .checked {
    background: #2c66f7;
    border-color: #2c66f7;
  }
  .row {
    padding: toRpx(26) toRpx(32);
    display: flex;
    align-items: center;
  }
  .row-1 {
    width: toRpx(96);
    justify-content: center;
    padding: toRpx(26) 0;
  }
  .row-2 {
    width: toRpx(1380);
    border-right: toRpx(2) solid #fff;
    border-left: toRpx(2) solid #fff;
  }
  .row-3 {
    width: toRpx(400);
  }
  .row-4 {
    border-left: toRpx(2) solid #fff;
    width: toRpx(304);
  }
  .views-content {
    height: calc(100% - #{toRpx(292)});
    display: flex;
    box-sizing: border-box;
    position: relative;
    background: #f7f7f7;
    border-radius: toRpx(16);
    .table {
      height: 100%;
      .optional-item {
        border-bottom: toRpx(2) solid #ffffff;
        position: relative;
        display: flex;
        font-size: toRpx(28);
        color: #333333;
        // &:last-child {
        //   border: none;
        // }
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
    height: toRpx(180);
    background: #ffffff;
    box-sizing: border-box;
    font-weight: 500;
    font-size: toRpx(32);
    color: #333333;
    line-height: toRpx(44);
    display: flex;
    align-items: flex-start;
    .price {
      margin-top: toRpx(44);
      align-items: baseline;
    }
    .total {
      font-weight: 700;
      font-size: toRpx(48);
      line-height: toRpx(64);
      margin-left: toRpx(8);
    }
    .total-btn {
      margin: toRpx(16) 0 0 auto;
      width: toRpx(480);
      height: toRpx(96);
      background-image: linear-gradient(180deg, #61c0ff 0%, #2c66f7 100%);
      box-shadow: inset 0 0 toRpx(32) 0 #ffffff;
      border-radius: toRpx(16);
      font-weight: 500;
      font-size: toRpx(36);
      color: #ffffff;
      line-height: toRpx(44);
      justify-content: center;
    }
  }
}
</style>