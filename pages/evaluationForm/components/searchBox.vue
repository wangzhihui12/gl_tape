<template>
  <view class="search-box mt-8 ml-8">
    <view class="form">
      <template v-for="(i, index) in formObject">
        <view :class="['form-item', { active: focusIndex == index }]" :key="index">
          <view class="form-item-box">
            <template v-if="i.type == 'input'">
              <input :type="i.inputType" :maxlength="i.maxlength" v-model="customerInfo[i.popKey]" class="input" :placeholder="i.placeholder" @focus="focusIndex = index" @blur="resetFocusIndex" />
            </template>
            <template v-else>
              <view :class="['select flex', { placeholderStyle: !customerInfo[i.key] }]" @click.stop="showPopup(i.popKey, index)">
                <view class="value text-hide">{{ customerInfo[i.key] || i.placeholder }}</view>
                <uni-icons class="arrow" type="right" :size="16"></uni-icons>
              </view>
            </template>
          </view>
        </view>
      </template>
      <template>
        <view class="form-btn flex align-center">
          <view class="btn search mr-12" @click.stop="search">查询</view>
          <view class="btn" @click.stop="resetForm">重置</view>
        </view>
      </template>
    </view>
  </view>
</template>
<script>
export default {
  name: 'searchBox',
  watch: {
    searchValue: {
      handler(newVal) {
        this.customerInfo = { ...newVal }
      },
      immediate: true
    }
  },
  data() {
    return {
      focusIndex: -1,
      formObject: [
        {
          placeholder: '车主姓名',
          key: 'carModel',
          type: 'input',
          popKey: 'previousOwnerName'
        },
        {
          placeholder: '车主电话',
          key: 'carModel',
          type: 'input',
          popKey: 'previousOwnerPhone'
        },
        {
          placeholder: '车牌号',
          key: 'carModel',
          type: 'input',
          popKey: 'licensePlate'
        },
        {
          placeholder: '工单编号',
          key: 'carModel',
          type: 'input',
          popKey: 'evalOrderNo'
        }
      ],
      customerInfo: {
        previousOwnerName: '',
        previousOwnerPhone: '',
        vin: '',
        evalOrderNo: ''
      }
    }
  },
  methods: {
    showError(key) {
      let flag = !this.customerInfo[key]
      if (key == 'phoneNumber' && this.customerInfo[key]) flag = !phoneRex.test(this.customerInfo[key])
      return flag
    },
    showPopup(e, index) {
      this.focusIndex = index
    },
    search() {
      this.$emit('update:searchValue', this.customerInfo)
      this.$emit('search')
    },
    resetFocusIndex() {
      this.focusIndex = -1
      this.errorTip = false
    },
    resetForm() {
      this.customerInfo = {
        previousOwnerName: '',
        previousOwnerPhone: '',
        licensePlate: '',
        evalOrderNo: ''
      }
      this.$emit('update:searchValue', this.customerInfo)
      this.$emit('reset')
    }
  }
}
</script>
<style scoped lang="scss">
.search-box {
  position: relative;
  width: 100%;
  .form {
    display: flex;
    gap: 0 toRpx(24);
    height: 100%;

    &-item {
      width: toRpx(424);
      height: 100%;
      position: relative;
      &-box {
        position: relative;
        width: 100%;
        height: 100%;
        background: #ffffff;
        border: toRpx(3) solid #a8c1ff;
        border-radius: toRpx(16);
        box-sizing: border-box;
        padding: 0 toRpx(24);
        z-index: 2;
        .input,
        .select {
          width: 100%;
          height: toRpx(72);
          border: none !important;
          outline: none;
          font-size: toRpx(28);
          color: #333333;
          border-radius: toRpx(16);
          box-sizing: border-box;
          line-height: toRpx(80);
          padding: 0 !important;
          &::placeholder {
            color: #999999;
          }
        }

        .placeholderStyle {
          color: #999999;
        }

        .arrow {
          color: #999 !important;
          margin-left: auto;
          flex-shrink: 0;
        }
      }
    }
    .active {
      &::after {
        position: absolute;
        left: toMinusRpx(2);
        top: toMinusRpx(2);
        width: calc(100% + #{toRpx(4)});
        height: calc(100% + #{toRpx(6)});
        content: '';
        background-image: linear-gradient(#75bcff, #2f6af7);
        box-shadow: 0 0 0 toRpx(8) #2c66f71a;
        border-radius: toRpx(16);
      }
    }
    .btn {
      width: toRpx(120);
      height: toRpx(72);
      border-radius: toRpx(12);
      font-size: toRpx(28);
      font-weight: 400;
      background: #f0f1f5;
      text-align: center;
      line-height: toRpx(76);
    }
    .search {
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
    }
  }
}
</style>
