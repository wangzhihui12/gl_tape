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
              :class="['list-item', { 'block': ['group', 'divider', 'textarea'].includes(i.type) }, { 'list-box': i.type == 'group' }]"
              :key="index" v-if="itemShow(i)">
              <template v-if="i.type != 'group'">
                <template v-if="i.type == 'divider'">
                  <view class="divider flex">
                    <view class="text">{{ i.label }}</view>
                  </view>
                </template>
                <template v-else>
                  <FormItem :formItem="i" :rules="i.rules" @onSelect="onSelect($event, index)"
                    @onInput="onInput($event, index)" :disabled="itemDisabled(i)" :readonly="!saveBtn" />
                </template>
              </template>
              <template v-else>
                <template v-if="i.children.length">
                  <view class="list-title flex">
                    {{ i.label }}
                  </view>
                  <template v-if="i.children.length">
                    <template v-for="(c, c_index) in i.children">
                      <FormItem class="form-item" :formItem="c" :key="c_index" :rules="i.childrenRules[c.key]"
                        @onSelect="onSelect($event, index, c_index)" @onInput="onInput($event, index, c_index)"
                        :disabled="itemDisabled(c)" :readonly="!saveBtn" />
                    </template>
                  </template>
                </template>
              </template>
            </view>
          </template>
        </view>
        <view class="footer">
          <Footer>
            <view class="btn default-btn" @click="saveBtn = true" v-if="!saveBtn">编辑</view>
            <view class="btn" @click="$emit('submitReport', list)" v-else>保存</view>
          </Footer>
        </view>
      </template>
      <nothing v-else />
    </template>
    <EditForm ref="editForm" @onDel="delItem" @onConfirm="confirm" />
  </view>
</template>

<script type='text/ecmascript-6'>
import Nothing from '../components/Nothing'
import Table from '../components/Table'
import Footer from '../components/Footer'
import utils from '@/utils/utils'
import EditForm from '../components/EditForm'
import FormItem from '../components/FormItem.vue'
export default {
  name: 'StoreDailyReport',
  components: { Table, Nothing, Footer, EditForm, FormItem },
  props: {
    templateData: {
      type: Array,
      default: () => []
    },
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
        }, 200)
      },
      immediate: true,
      deep: true
    },
    ReportStatus: {
      handler(val) {
        this.saveBtn = val != 1
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
          if (!i.show) {
            if (i.type == 'group') i.children.map(c => {
              if (c.value != null) c.value = null
            })
            else {
              if (i.value) i.value = null
            }
          }
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
      let { templateData } = this
      this.list[index].children.push(templateData[index].children[0])
      let data = this.list[index].children[this.list[index].children.length - 1],
        c_index = this.list[index].children.length - 1,
        parent = this.list[index]
      this.$refs.editForm.open(data, c_index, index, parent)
    },
    confirm(data, c_index, index) {
      this.$set(this.list[index].children, c_index, utils.deepClone(data))
    },
    onInput(val, index, c_index = -1) {
      if (c_index == -1) this.$set(this.list[index], 'value', val)
      else this.$set(this.list[index].children[c_index], 'value', val)
    },
    onSelect(val, index, c_index = -1) {
      if (c_index == -1) this.$set(this.list[index], 'value', val)
      else this.$set(this.list[index].children[c_index], 'value', val)
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

    .list-item,
    .form-item {
      width: calc((100% - 32rpx) / 2);
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
      }

      &::before,
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        border-top: 1px dashed #999999;
        width: calc(50% - #{toRpx(72)});
        height: 0;
      }

      &::before {
        left: 0;
      }

      &::after {
        right: 0;
      }
    }

    .list-box {
      width: 100%;
      border-radius: 32rpx;
      display: flex;
      flex-wrap: wrap;
      gap: 24rpx 32rpx;

      .list-title {
        color: #333333;
        width: 100%;
        font-size: 32rpx;
        font-weight: 500;
        line-height: 48rpx;
        padding: 8rpx 32rpx 0 0;
      }
    }

    .no-child {
      padding-bottom: 0;
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

    .btn {
      margin: 0 168rpx;
      width: 100%;
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