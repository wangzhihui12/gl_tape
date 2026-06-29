<template>
  <view class="data-container">
    <view class="nav-bar" @click="$emit('cancel')">
      <view class="back" @click="$emit('update:showPayPage', false)">
        <uni-icons type="left" :size="20" color="#000"></uni-icons>
      </view>
      <view class="title">接待记录</view>
    </view>
    <view class="error-tip" v-if="errorTip">以下信息不能为空，请完善信息后保存</view>
    <view class="form">
      <template v-for="(i, index) in formObject">
        <view :class="['form-item', { active: focusIndex == index }]" :key="index">
          <view class="label required">{{ i.label }}</view>
          <view :class="['value', { error: showError(i.key) }]">
            <template v-if="i.type == 'input'">
              <input :type="i.inputType" :maxlength="i.maxlength" v-model="customerInfo[i.key]" class="input" :placeholder="i.placeholder" @focus="focusIndex = index" @blur="resetFocusIndex" />
            </template>
            <template v-else>
              <view :class="['select flex', { placeholderStyle: !customerInfo[i.key] }]" @click="showPopup(i.popKey, index)">
                <view class="text-hide">{{ customerInfo[i.key] || i.placeholder }}</view>
                <uni-icons class="arrow" type="right" :size="16"></uni-icons>
              </view>
            </template>
          </view>
        </view>
      </template>
    </view>
    <view class="footer-box">
      <view class="cancel-btn" @click="$emit('cancel')">取消</view>
      <view class="submit-btn" @click="handleSave">提交</view>
    </view>
    <car-brands ref="carBrandListVisible" @select="handleSelect($event, 'carBrandListVisible')" />
    <employee ref="employeeBoxVisible" :salesPropsUuid="customerInfo.salesUuid" @select="handleSelect($event, 'employeeBoxVisible')" />
    <MessageBox ref="receptionStatusVisible" position="bottom" :isFooter="false" title="请选择接待结果" :maxHeight="1000">
      <view class="select-box">
        <view class="select-item" :class="{ checked: customerInfo.receptionStatus == item.label }" @click="selectReception(item.label)" v-for="(item, index) in receptionList" :key="index">
          {{ item.label }}
        </view>
      </view>
    </MessageBox>
  </view>
</template>

<script type="text/ecmascript-6">
import CarBrands from '@/components/CarBrands.vue'
import Employee from '@/components/Employee.vue'
import CustomerAutocomplete from '@/components/CustomerAutocomplete.vue'
const phoneRex = /^[1]([3-9])[0-9]{9}$/;
import utils from "@/utils/utils";
export default {
	components: {
		CarBrands,
		Employee,
		CustomerAutocomplete
	},
	props: {
		customerInfoVal: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
      errorTip:false,
			receptionList:  Object.freeze([{
					label: '成交',
					value: 1
				},
				{
					label: '战败',
					value: 0
				}
			]),
			formObject: Object.freeze([{
					label: "车主姓名",
					placeholder: '车主姓名',
					key: 'customerName',
					type: 'input',
					inputType: 'text',
					maxlength: 50
				},
				{
					label: "车主电话",
					placeholder: '车主电话',
					key: 'phoneNumber',
					type: 'input',
					inputType: 'tel',
					maxlength: 11
				},
				{
					label: "品牌车型",
					placeholder: '品牌车型',
					key: 'carModel',
					type: 'select',
					popKey: 'carBrandListVisible'
				},
				{
					label: "接待结果",
					key: "receptionStatus",
					type: "select",
					popKey: "receptionStatusVisible",
					placeholder: '请选择',
				},
				{
					label: "销售姓名",
					key: "salesName",
					type: "select",
					popKey: "employeeBoxVisible",
					placeholder: '请选择',
				},
			]),
			focusIndex: -1,
      customerInfo:{}
		}
	},
	mounted() {
    this.customerInfo = utils.deepClone(this.customerInfoVal)
		const i = this.receptionList.findIndex(e => e.value === this.customerInfo.receptionStatus)
    this.$set(this.customerInfo, 'receptionStatus', i == -1?'':this.receptionList[i].label)
	},
	methods: {
		selectReception(value) {
			this.customerInfo.receptionStatus = value
			this.$refs.receptionStatusVisible.close()

		},
		showError(key) {
			let flag = !this.customerInfo[key]
			if (key == 'phoneNumber' && this.customerInfo[key]) flag = !phoneRex.test(this.customerInfo[key])
			return flag
		},
		handleSave() {
			const result = this.check(true)
			if (!result) return this.errorTip = true
			const i = this.receptionList.findIndex(e => e.label == this.customerInfo.receptionStatus)
			this.customerInfo.receptionStatus = this.receptionList[i].value
			this.$emit('submit',this.customerInfo)
		},
		check(all = false) {
			let flag = true
			try {
				this.formObject.map(e => {
					if (!this.customerInfo[e.key]) throw false
					if (!all && e.key == 'phoneNumber' && !phoneRex.test(this.customerInfo[e.key])) {
						uni.showToast({
							title: "请输入正确的车主电话",
							icon: "none",
						});
						throw false
					}
				})
			} catch (error) {
				flag = error
			}
			return flag
		},
		handleSelect(item, popkey) {
			this.$refs[popkey].close()
			if (popkey == 'employeeBoxVisible') {
				this.customerInfo.salesUuid = item.uuid
				this.customerInfo.salesName = item.staffName
			} else {
				this.$refs.carBrandListVisible.close()
				this.customerInfo.carModel = item.name
        this.customerInfo.carBrand = item.carChildsBrandName
        this.customerInfo.carBrandId = item.carChildsBrandId
        this.customerInfo.oneCarBrand = item.carBrand
        this.customerInfo.oneCarBrandId = item.carBrandId
			}
			this.resetFocusIndex()
      this.errorTip = false
		},
		showPopup(e, index) {
			this.focusIndex = index
			this.$refs[e].open()
		},
		resetFocusIndex() {
			this.focusIndex = -1
      this.errorTip = false
		}
	}
}
</script>

<style scoped lang="scss">
.error-tip {
  font-size: toRpx(28);
  padding: toRpx(32) toRpx(60) toRpx(24);
  margin-top: toRpx(100);
  margin-bottom: toMinusRpx(80);
  text-align: center;
  background-color: rgb(254, 237, 234);
  color: #f45c3d;
}
.data-container {
  background: #ffffff59;
  border-radius: toRpx(48);
  margin: toRpx(80) toRpx(66) toRpx(80) 0;
  height: calc(100% - #{toRpx(160)});
  box-shadow: inset 0 0 toRpx(16) 0 #ffffff;
  border: toRpx(2) solid #fff;
  box-sizing: border-box;
  position: relative;

  .nav-bar {
    position: absolute;
    width: 100%;
    height: toRpx(96);
    left: 0;
    top: toRpx(28);
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

  .form {
    display: flex;
    flex-wrap: wrap;
    gap: toRpx(80) toRpx(160);
    padding: toRpx(80);
    margin-top: toRpx(60);

    &-item {
      width: calc(50% - #{toRpx(80)});
      display: flex;
      align-items: center;
      color: #6c6c70;
      font-size: toRpx(30);
      height: toRpx(80);
      box-sizing: border-box;

      .label {
        position: relative;
        margin-left: auto;
        flex-shrink: 0;
        width: toRpx(124);
        margin-right: toRpx(30);
      }

      .required {
        &::before {
          content: '*';
          color: #ff0000;
          position: absolute;
          left: toMinusRpx(20);
          top: 50%;
          transform: translate(0, -50%);
        }
      }

      .value {
        height: toRpx(80);
        flex: 1;
        border: toRpx(2) solid #e8e8ea;
        background: #ffffff;
        margin-left: toRpx(32);
        box-sizing: border-box;
        padding: 0 toRpx(40);
        border-radius: toRpx(8);

        &.error {
          border: toRpx(2) solid #f24724;
          border-radius: toRpx(8);
        }

        .input,
        .select {
          width: 100%;
          height: 100%;
          border: none !important;
          outline: none;
          padding: 0 !important;
          font-size: toRpx(30);
          color: #333;

          &::placeholder {
            color: #c9c9c9;
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
  }

  .footer-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: toRpx(34);
    padding: 0 toRpx(280);

    .cancel-btn {
      height: toRpx(80);
      background: #dae9ff;
      border-radius: toRpx(48);
      line-height: toRpx(80);
      text-align: center;
      color: #2c66f7;
      flex: 1;
    }

    .submit-btn {
      height: toRpx(80);
      background-image: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      border-radius: toRpx(48);
      line-height: toRpx(80);
      text-align: center;
      flex: 1;
      color: #ffffff;
    }
  }
}

.select-box {
  margin: toRpx(40) 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: toRpx(20);
  overflow-y: scroll;
  max-height: 50vh;
  padding-bottom: toRpx(60);

  .select-item {
    text-align: center;
    height: toRpx(68);
    line-height: toRpx(68);
    opacity: 1;
    border: toRpx(2) solid #dce0e6;
    color: #292d33;
    font-size: toRpx(28);
    border-radius: toRpx(8);

    &.checked {
      border: toRpx(2) solid #292d33;
    }
  }
}
</style>
