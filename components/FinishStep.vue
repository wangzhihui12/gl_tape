<template>
  <view class="step">
    <MessageBox
      ref="formRef"
      @cancel="cancel"
      @confirm="submit"
      :cancelBtnText="`${step == 1 ? '取消' : '上一步'}`"
      :confirmBtnText="`${sceneType == 0 ? (step == 1 ? '下一步' : '完成接待') : '完成接待'}`"
      :title="`${step == 1 ? '客户信息完善' : '结果反馈'}`"
      :popupW="820"
      :maxHeight="820"
      :isAutoClose="false"
    >
      <view
        name="content"
        :key="updateViewKey"
      >
        <template v-if="step == 1">
          <template v-if="!check(true)">
            <view
              class="error-tip"
              v-if="errorTip"
            >以下信息不能为空，请完善信息后保存</view>
            <view
              class="pop-tips"
              v-else
            >{{ tips }}</view>
          </template>
          <view class="form">
            <template v-for="(i, index) in formObject">
              <view
                class="form-item"
                :key="index"
              >
                <view :class="['label', { required: i.required }]">{{ i.label }}</view>
                <view :class="['value', { error: showError(i.key) && i.required }, { disabled: customerType == 0 || i.disabled }]">
                  <template v-if="i.type == 'input'">
                    <input
                      :type="i.inputType"
                      :maxlength="i.maxlength"
                      v-model="formData[i.key]"
                      class="input"
                      :placeholder="i.placeholder"
                      :disabled="customerType == 0"
                      @input="inputCustomer"
                      placeholder-style="color:#c9c9c9;"
                    />
                  </template>
                  <template v-else>
                    <view
                      :class="['select', `${formData[i.key] ? '' : 'placeholder'}`]"
                      @click="showPopup(i)"
                      :key="selectKey"
                    >
                      {{ formData[i.key] || i.placeholder }}
                      <uni-icons
                        class="arrow"
                        type="down"
                        :size="16"
                      ></uni-icons>
                    </view>
                  </template>
                </view>
              </view>
            </template>
          </view>
        </template>
        <template v-else>
          <view class="pop-tips">请完善本次接待结果</view>
          <view class="choose-box">
            <template v-for="(i, index) in resultList">
              <view
                :class="['choose-item', `${i.status == receptionStatus ? (i.status == 1 ? 'success' : 'error') : ''}`]"
                :key="index"
                @click="chooseResult(i.status)"
              >
                <view :class="['sprite-icon', `icon-face-${i.status == receptionStatus ? `${i.icon}-active` : i.icon}`]"></view>
                {{ i.text }}
              </view>
            </template>
          </view>
        </template>
      </view>
    </MessageBox>
    <car-brands
      ref="carBrandListVisible"
      @select="handleSelect($event, 'carBrandListVisible')"
    />
    <employee
      ref="employeeBoxVisible"
      @select="handleSelect($event, 'employeeBoxVisible')"
    />
    <uni-popup
      ref="successRef"
      type="message"
    >
      <uni-popup-message
        type="success"
        message="数据保存成功"
        :duration="1500"
      ></uni-popup-message>
    </uni-popup>
  </view>
</template>

<script type="text/ecmascript-6">
import Employee from '@/components/Employee.vue'
import CarBrands from '@/components/CarBrands.vue'
import { mapMutations } from "vuex";
const phoneRex = /^[1]([3-9])[0-9]{9}$/;
const formObject_boutique = [{
  label: "车主姓名",
  key: "customerName",
  type: "input",
  inputType: "text",
  maxlength: 20,
  placeholder: '请输入车主姓名',
  required: true
},
{
  label: "品牌车型",
  key: "carModel",
  type: "select",
  popKey: "carBrandListVisible",
  placeholder: '请选择品牌车型',
  disabled: true
},
{
  label: "车主电话",
  key: "phoneNumber",
  type: "input",
  inputType: "tel",
  maxlength: 11,
  placeholder: '请输入车主电话',
  required: true
},
{
  label: "交付专员",
  key: "staffName",
  type: "select",
  popKey: "employeeBoxVisible",
  placeholder: '请选择交付专员',
  required: true
},]
export default {
  components: { Employee, CarBrands },
  name: 'FinishStep',
  props: {
    sceneType: {
      type: Number,
      default: 0
    },
    customerType: {
      type: Number,
      default: 1
    },
    titleTips: String
  },
  data () {
    return {
      step: 1,
      formObject: [
        {
          label: "车主姓名",
          key: "customerName",
          type: "input",
          inputType: "text",
          maxlength: 50,
          placeholder: '请输入车主姓名',
          required: true
        },
        {
          label: "车主电话",
          key: "phoneNumber",
          type: "input",
          inputType: "tel",
          maxlength: 11,
          placeholder: '请输入车主电话',
          required: true
        },
        {
          label: "品牌车型",
          key: "carModel",
          type: "select",
          popKey: "carBrandListVisible",
          placeholder: '请选择品牌车型',
          required: true
        },
        {
          label: "销售姓名",
          key: "staffName",
          type: "select",
          popKey: "employeeBoxVisible",
          placeholder: '请选择销售',
          required: true
        },
      ],
      formData: {
        customerName: "",
        carModel: "",
        phoneNumber: "",
        salesUuid: "",
        staffName: "",
      },
      resultList: [
        {
          icon: 'success',
          text: '结果完美，成交了',
          status: 1

        },
        {
          icon: 'error',
          text: '仍需努力，战败了',
          status: 0
        }
      ],
      errorTip: false,
      receptionStatus: -1,
      updateViewKey: Date.now(),
      selectKey: Date.now(),
    }
  },
  computed: {
    watchStatus () {
      return this.$store.state.user.historyStatus
    },
    tips () {
      let { sceneType, titleTips } = this,
        text = titleTips || '检测到“交车告知书”中未填写客户档案，请填写后再完成接待。'
      if (sceneType == 1) text = '请确认“车型加装选购页”中的客户信息，并点击「完成接待」结束客户接待。'
      return text
    }
  },
  watch: {
    watchStatus: {
      immediate: true,
      handler (newval) {
        this.receptionStatus = -1
        this.errorTip = false
        this.$refs?.formRef?.close()
      }
    },
  },
  mounted () {

  },
  methods: {
    ...mapMutations("audio", ["setReceptionStatus"]),
    showError (key) {
      let flag = !this.formData[key]
      if (key == 'phoneNumber' && this.formData[key]) flag = !phoneRex.test(this.formData[key])
      return this.errorTip && flag
    },
    showPopup ({ popKey, disabled }) {
      let { customerType } = this
      if (customerType == 0 || disabled) return
      this.$refs[popKey].open();
    },
    // 取消
    cancel () {
      if (this.step == 1) this.close()
      else this.step = 1
    },
    close () {
      this.errorTip = false
      this.receptionStatus = -1
      this.$refs.formRef.close()
    },
    check (all = false) {
      let flag = true
      try {
        this.formObject.map(e => {
          if (e.required) {
            if (!this.formData[e.key]) throw false
            if (!all && e.key == 'phoneNumber' && !phoneRex.test(this.formData[e.key])) {
              uni.showToast({
                title: "请输入正确的车主电话",
                icon: "none",
              });
              throw false
            }
          }
        })
      } catch (error) {
        flag = error
      }
      return flag
    },
    // 保存
    submit () {
      let { receptionStatus } = this
      if (this.step == 1) {
        this.errorTip = true;
        if (this.check()) {
          const { sceneType } = this
          if (sceneType == 0) this.step = 2
          else {
            receptionStatus = 1
            this.success(receptionStatus)
          }
        }
      } else {
        let { receptionStatus } = this
        if (receptionStatus == -1) return uni.showToast({
          title: '请完善本次接待结果',
          icon: 'none'
        })
        this.success(receptionStatus)
      }
    },
    success (receptionStatus) {
      this.$refs.successRef.open();
      this.$emit('submit', receptionStatus)
    },
    inputCustomer () {
      this.$store.dispatch('setCustomerInfo', this.formData)
    },
    handleSelect (item, popkey) {
      this.$refs[popkey].close();
      if (popkey == "employeeBoxVisible") {
        this.formData.salesUuid = item.uuid;
        this.formData.staffName = item.staffName;
      } else {
        this.$refs.carBrandListVisible.close();
        this.formData.carModel = item.name;
        this.formData.carModelId = item.id
      }
      this.$store.dispatch("setCustomerInfo", this.formData);
      this.selectKey = Date.now()
    },
    open () {
      this.$store.dispatch('getCustomerInfo').then((customerInfo) => {
        this.formData = customerInfo
        let { sceneType, customerType } = this,
          step = Object.values(customerInfo).every((value) => !!value) ? 2 : 1
        this.errorTip = false
        if (sceneType == 1) {
          step = 1
          this.formObject = formObject_boutique
          if (customerType == 0 && !this.check()) {
            this.$emit('back')
            return
          }
        }
        if (step == 2 && !this.check()) {
          this.errorTip = true
          step = 1
        }
        this.step = step
        this.$refs.formRef.open()
        this.updateViewKey = Date.now()
      })
    },
    chooseResult (val) {
      this.receptionStatus = val
      this.setReceptionStatus(val);
    }
  }
}
</script>

<style scoped lang="scss">
.pop-tips {
  background: rgba(44, 102, 247, 0.1);
  color: #2c66f7;
  font-size: toRpx(28);
  padding: toRpx(24) toRpx(80) toRpx(24);
  margin-top: toRpx(30);
  text-align: center;
}
.error-tip {
  font-size: toRpx(28);
  padding: toRpx(32) toRpx(60) toRpx(24);
  margin-top: toRpx(30);
  text-align: center;
  background-color: rgb(254, 237, 234);
  color: #f45c3d;
}
.form {
  display: flex;
  flex-wrap: wrap;
  gap: toRpx(24) 0;
  padding-top: toRpx(30);
  &-item {
    // flex: 50%;
    display: flex;
    align-items: center;
    color: #6c6c70;
    font-size: toRpx(30);
    box-sizing: border-box;
    margin: 0 auto;
    .label {
      position: relative;
      margin-left: auto;
      flex-shrink: 0;
      width: toRpx(124);
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
      width: toRpx(520);
      height: toRpx(80);
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
        &::placeholder {
          color: #c9c9c9;
        }
      }
      .select {
        display: flex;
        align-items: center;
        .arrow {
          margin-left: auto;
        }
      }
      /deep/ .placeholder {
        font-size: toRpx(30);
        color: #c9c9c9;
      }
    }
    .disabled {
      background: #f4f4f4;
      .select {
        .arrow {
          display: none;
        }
      }
    }
  }
}
.choose-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  .choose-item {
    width: 100%;
    height: toRpx(128);
    border: toRpx(2) solid #e8e8e8;
    border-radius: toRpx(16);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: toRpx(24);
    .sprite-icon {
      margin-right: toRpx(16);
    }
  }
  .success {
    background: #14cc681a;
    border-color: #14cc681a;
  }
  .error {
    background: #f247241a;
    border-color: #f247241a;
  }
}
</style>
