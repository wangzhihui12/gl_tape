<template>
  <view class="daily-report">
    <view class="common-title">
      基础信息
    </view>
    <template v-if="loadComplete">
      <template v-if="list.length">
        <view class="daily-report-container">
          <template v-for="(i, index) in list">
            <view
              :class="['list-item', { 'block': ['subform', 'divider'].includes(i.type) }, { 'list-box': i.type == 'subform' }, { 'no-child': i.children && !i.children.length }]"
              :key="index" v-if="itemShow(i)">
              <template v-if="i.type != 'subform'">
                <template v-if="i.type == 'divider'">
                  <view class="divider flex">
                    <view class="text">{{ i.label }}</view>
                  </view>
                </template>
                <template v-else>
                  <FormItem class="form-item" :formItem="i" :rules="i.rules" @onSelect="onSelect($event, index)"
                    @onInput="onInput($event, index)" @openSelect="openSelect(...arguments, index)"
                    :disabled="itemDisabled(i)" :readonly="!saveBtn" />
                </template>
              </template>
              <template v-else>
                <view class="list-title flex">
                  {{ i.label }}
                  <template v-if="!i.children.length">
                    <view :class="['add flex', { 'disabled': !saveBtn }]" @click="addItem(index)">
                      <view class="add-icon"></view>
                      新增
                    </view>
                  </template>
                </view>
                <template v-if="i.children.length">
                  <Table :columns="i.children[0]" :data="i.children" titleKey="label" tableStyle="padding-right:32rpx"
                    customTable cornerText="序号" LeftWidth="104rpx" @rowClick="handleRowClick" :tableIndex="index"
                    hasFooter @clickAdd="addItem(index)" :disabled="!saveBtn">
                    <template v-slot:customCell="{ row, colIndex }">
                      <text>{{ formatValue(row[colIndex].value) }}</text>
                    </template>
                  </Table>
                </template>
              </template>
            </view>
          </template>
        </view>
        <view class="footer">
          <Footer>
            <view class="btn default-btn" @click="$emit('showNegotiationList')">查看洽谈明细表汇总</view>
            <view class="btn default-btn" @click="saveBtn = true" v-if="!saveBtn">编辑</view>
            <view class="btn default-btn" @click="$emit('saveReport', list)" v-else>保存</view>
            <view class="btn" @click="$emit('submitReport', list)">提交</view>
          </Footer>
        </view>
      </template>
      <nothing v-else />
    </template>
    <EditForm ref="editForm" @onDel="delItem" @onConfirm="confirm" />
    <DailyPopup ref="dailyPopup" @onConfirm="onPopupConfirm" />
  </view>
</template>

<script type='text/ecmascript-6'>
import Nothing from '../components/Nothing'
import Table from '../components/Table'
import Footer from '../components/Footer'
import utils from '@/utils/utils'
import EditForm from '../components/EditForm'
import FormItem from '../components/FormItem.vue'
import DailyPopup from '../components/DailyPopup/index.vue'

export default {
  name: 'StoreDailyReport',
  components: { Table, Nothing, Footer, EditForm, FormItem, DailyPopup },
  inject: ['userInfo','sceneType'],
  props: {
    templateData: {
      type: Array,
      default: () => []
    },
    reportDate: String,
    ReportStatus: null
  },
  data() {
    return {
      loadComplete: false,
      list: [],
      saveBtn: true
    }
  },
  watch: {
    templateData: {
      handler(val) {
        this.loadComplete = false
        this.list = utils.deepClone(val)
        setTimeout(() => {
          this.loadComplete = true
          if (val.length) this.getMonthlyPendingCount()
        }, 200)
      },
      immediate: true,
      deep: true
    },
    ReportStatus: {
      handler(val) {
        this.saveBtn = val !== 0
      },
      immediate: true,
      deep: true
    },
    saveBtn: {
      handler(val) {
        this.$emit('getSaveBtnStatus', val)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
  },
  methods: {

    itemShow(i) {
      if (i.rules) {
        let { keys, result } = i.rules,
          { list } = this
        if (keys && result) {
          let params = keys.map((c, index) => `val${index + 1}`),
            // 将 new Function 改为 eval 方式
            func = eval(`(function(${params.join(',')}) { return ${result}; })`),
            value = []
          keys.map(key => {
            let item = list.find(i => i.key == key)
            if (item) value.push(item.value || null)
          })
          let show = func(...value)
          i.show = show
          return show
        } else {
          i.show = true
          return true
        }
      } else {
        i.show = true
        return true
      }
    },
    handleRowClick(row, rowIndex, index) {
      let parent = this.list[index]
      this.$refs.editForm.open(row, rowIndex, index, parent)
    },
    delItem(c_index, index) {
      this.list[index].children.splice(c_index, 1)
    },
    addItem(index) {
      let { templateData, saveBtn } = this
      if (!saveBtn) return
      this.list[index].children.push(templateData[index].origin_children)
      let data = this.list[index].children[this.list[index].children.length - 1],
        c_index = this.list[index].children.length - 1,
        parent = this.list[index]
      this.$refs.editForm.open(data, c_index, index, parent)
    },
    confirm(data, c_index, index) {
      this.$set(this.list[index].children, c_index, utils.deepClone(data))
    },
    onInput(val, index) {
      this.$set(this.list[index], 'value', val)
    },
    onSelect(val, index) {
      this.$set(this.list[index], 'value', val)
    },
    itemDisabled(i) {
      let disabled = i.disabled
      if (i.disabledFun) {
        let { keys, result } = i.disabledFun,
          { list } = this,
          params = keys.map((i, index) => `val${index + 1}`),
          // 将 new Function 改为 eval 方式
          func = eval(`(function(${params.join(',')}) { return ${result}; })`),
          value = []
        keys.map(key => {
          let item = list.find(i => i.key == key)
          if (item) value.push(item.value || null)
        })
        return func(...value)
      }
      return disabled
    },
    formatValue(value) {
      return value != null ? value : '-'
    },
    openSelect(item, type, index) {
      this.$refs.dailyPopup.open(item, type, index)
    },
    onPopupConfirm(data) {
      const { popupType, chooseContent, itemIndex } = data
      if (popupType == 2) {
        let { key, completeFun } = this.list[itemIndex]
        this.$set(this.list[itemIndex], 'value', chooseContent.map(e => e.staffName).join('/'))
        this.$set(this.list[itemIndex], key, chooseContent.map(e => e.uuid))
        if (completeFun) {
          let { key, result } = completeFun,
            index = this.list.findIndex(i => i.key == key),
            func = eval(`(function(list) { return ${result}; })`)
          this.$set(this.list[index], 'value', func(chooseContent))
        }

      }

    },
    async getMonthlyPendingCount() {
      let { reportDate, userInfo, list, sceneType } = this,
        { shopMerchantId } = userInfo
      const res = await uni.$api.dailyTemplateApi.getMonthlyPendingCount({
        merchantId: shopMerchantId,
        sceneType,
        reportDate
      })
      let index = list.findIndex(i => i.key == 'F2-24')
      if (index == -1) return
      if (this.list[index].value == null || this.list[index].value == '' || this.list[index].value == undefined) {
        if (res) this.$set(this.list[index], 'value', res.pendingCount)
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.daily-report {
  height: 100%;
  position: relative;

  &-container {
    height: calc(100% - #{toRpx(256)});
    padding: 0 48rpx;
    box-sizing: border-box;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx 32rpx;
    align-content: start;
    .list-item {
      width: calc(50% - 16rpx);
    }

    .block {
      width: 100%;
    }

    .divider {
      color: #999999;
      font-size: 24rpx;
      line-height: 32rpx;
      position: relative;
      justify-content: center;

      .text {
        position: relative;
        padding: 0 24rpx;
        flex-shrink: 0;
      }

      &::before,
      &:after {
        content: '';
        border-top: 1px dashed #999999;
        width: calc(50% - #{toRpx(72)});
        height: 0;
        display: block;
      }
    }

    .list-box {
      width: 100%;
      border-radius: 16rpx;
      background: #fff;
      padding: 0 0 32rpx 32rpx;
      margin-top: 8rpx;

      .list-title {
        font-size: 32rpx;
        font-weight: 600;
        line-height: 44rpx;
        padding: 32rpx 32rpx 24rpx 0;
        transition: all .25s ease-in-out;

        .add {
          margin-left: auto;
          height: 64rpx;
          padding: 20rpx 32rpx;
          justify-content: center;
          align-items: center;
          border-radius: 32rpx;
          background: #2c66f71a;
          font-size: 30rpx;
          font-weight: 500;
          color: #2c66f7;

          &-icon {
            position: relative;
            width: 28rpx;
            height: 28rpx;
            margin-right: 10rpx;

            &::before,
            &::after {
              position: absolute;
              content: '';
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: #4673ff;
              border-radius: 4rpx;
            }

            &::before {
              width: 4rpx;
              height: 28rpx;
            }

            &::after {
              width: 28rpx;
              height: 4rpx;
            }
          }
        }
        .disabled {
          opacity: .5;
        }
      }
    }

    .no-child {
      padding-bottom: 0;

      .list-title {
        padding-bottom: 32rpx;
      }
    }
  }

  &-box {
    position: absolute;
    width: calc(100% - #{toRpx(96)});
    height: calc(100% - #{toRpx(80)});
    border-radius: 32rpx;
    background: #fff;
    top: 48rpx;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 0 32rpx 32rpx;
    overflow-x: auto;

    .list-title {
      font-size: 32rpx;
      font-weight: 600;
      line-height: 44rpx;
      padding: 32rpx 0 24rpx;
      position: sticky;
      top: 0;
      z-index: 50;
      background: #fff;
    }
  }

  .footer {
    height: 136rpx;

    .footer-container {
      justify-content: space-between;
    }

    .btn {
      width: calc(100% / 3 - #{toRpx(32)});
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 80rpx;
      background: linear-gradient(0deg, #2c66f7 0%, #48a6ff 100%);
      color: #ffffff;
      font-size: 28rpx;
      font-weight: 500;
    }

    .default-btn {
      background: #3b73ff1a;
      color: #4673ff;
    }
  }
}
</style>