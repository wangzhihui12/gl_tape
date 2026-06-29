<template>
  <view class="daily-report">
    <view class="common-title">
    </view>
    <template v-if="loadComplete">
      <template v-if="list.length">
        <view class="daily-report-container">
          <template v-for="(i, index) in list">
            <view :class="['list-box', { 'no-child': !i.children.length }]" :key="index">
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
                  hasFooter @clickAdd="addItem(index)" :maxLength="i.rules.maxLength">
                  <template v-slot:customCell="{ row, colIndex }">
                    <text>{{ formatValue(row[colIndex].value) }}</text>
                    <template v-if="row[colIndex].unit && formatValue(row[colIndex].value) != '-'">
                      <text class="unit">{{ row[colIndex].unit }}</text>
                    </template>
                  </template>
                </Table>
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
import Table from '../components/Table'
import Nothing from '../components/Nothing'
import Footer from '../components/Footer'
import utils from '@/utils/utils'
import EditForm from '../components/EditForm'
export default {
  components: { Table, Nothing, Footer, EditForm },
  name: 'edit',
  inject: ['sceneType'],
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
    handleRowClick(row, rowIndex, index) {
      let parent = this.list[index]
      this.$refs.editForm.open(row, rowIndex, index, parent)
    },
    delItem(c_index, index) {
      this.list[index].children.splice(c_index, 1)
    },
    addItem(index) {
      let { templateData, saveBtn } = this,
        parent = this.list[index]
      if(!saveBtn) return
      this.list[index].children.push(templateData[index].origin_children)
      let data = this.list[index].children[this.list[index].children.length - 1],
        c_index = this.list[index].children.length - 1
      this.$refs.editForm.open(data, c_index, index, parent)
    },
    confirm(data, c_index, index) {
      this.$set(this.list[index].children, c_index, utils.deepClone(data))
    },
    formatValue(value) {
      return value !== null && value !== '' && value !== undefined ? value : '-'
    }
  }
}
</script>

<style scoped lang='scss'>
.daily-report {
  height: 100%;
  position: relative;

  &-container {
    height: calc(100% - #{toRpx(184)});
    padding: 0 48rpx;
    box-sizing: border-box;
    overflow-y: auto;
    transform: translateY(48rpx);
  }

  .common-title {
    position: absolute;
    top: 0;
    left: 0;
  }

  .list-box {
    width: 100%;
    border-radius: 16rpx;
    background: #fff;
    padding: 0 0 32rpx 32rpx;
    margin-bottom: 32rpx;

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
      .disabled{
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

  .footer {
    transform: translateY(48rpx);
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