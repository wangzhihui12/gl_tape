<template>
  <view class="list">
    <view
      @click="currentId = ''"
      :class="['item flex',{active:!currentId}]"
    >
      <view class="sprite-icon icon-tag-checked"></view>
      全部
    </view>
    <template v-for="(i, index) in list">
      <view
        :key="index"
        @click="choose(i.id)"
        :class="['item flex',{active:currentId == i.id}]"
      >
        <view class="sprite-icon icon-tag-checked"></view>
        {{i.name}}
      </view>
    </template>
    <template v-if="currentId == 3 && customDate.startDate && customDate.endDate">
      <view
        class="calendar flex"
        @click="$refs.calendar.open()"
      >
        <view class="item flex active">
          {{customDate.startDate}}
        </view>
        <view class="splice">-</view>
        <view class="item flex active">
          {{customDate.endDate}}
        </view>
      </view>
    </template>
    <template v-else>
      <view
        @click="$refs.calendar.open()"
        :class="['item flex']"
      >
        自定义
      </view>
    </template>
    <uni-calendar
      ref="calendar"
      :insert="false"
      range
      :clearDate="false"
      startDate="2020-10-01"
      :endDate="endDate"
      @confirm="confirmCalendar"
      :rangeValue="rangeValue"
      hideMask
      showBottomBtn
    />
  </view>
</template>

<script type='text/ecmascript-6'>
import dayjs from 'dayjs'
export default {
  name: 'TimeList',
  inject: ['userInfo'],
  data () {
    return {
      list: Object.freeze([
        {
          name: '今日',
          startDate: dayjs().format('YYYY-MM-DD'),
          endDate: dayjs().format('YYYY-MM-DD'),
          id: 1
        }, {
          name: '本月',
          startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
          endDate: dayjs().format('YYYY-MM-DD'),
          id: 2
        }
      ]),
      currentId: '',
      endDate: dayjs().format('YYYY-MM-DD'),
      customDate: {
        startDate: '',
        endDate: ''
      },
      rangeValue: {}
    }
  },
  props: {
    params: Object,
    data: [Array, Object],
  },
  watch: {
    currentId: {
      handler (val) {
        let { params: { idKey, currentIdKey } } = this
        let { list } = this,
          value = {}
        if (val) {
          let [startDateName, endDateName] = idKey
          if (val == 3) {
            value = {
              [startDateName]: this.customDate.startDate,
              [endDateName]: this.customDate.endDate
            }
          } else {
            let item = list.find(e => e.id == val)
            value = {
              [startDateName]: item.startDate,
              [endDateName]: item.endDate
            }
          }
        }
        this.$emit('choose', {
          currentIdKey,
          currentId: val,
          keys: idKey,
          value
        })

      },
      deep: true
    }
  },
  mounted () {
    this.initList()
  },
  methods: {
    async initList () {
      let { data, params: { idKey, currentIdKey } } = this
      if (data[currentIdKey] == 3) {
        this.customDate = {
          startDate: data[idKey[0]],
          endDate: data[idKey[1]]
        }
        this.rangeValue = {
          before: data[idKey[0]],
          after: data[idKey[1]]
        }
      }
      this.currentId = data[currentIdKey]
      this.$emit('onComplete')
    },
    choose (i) {
      this.currentId = i
    },
    confirmCalendar ({range}) {
      let { data } = range
      this.customDate = {
        startDate: data[0] || dayjs().format('YYYY-MM-DD'),
        endDate: data[data.length - 1] || dayjs().format('YYYY-MM-DD')
      }
      this.rangeValue = range
      if (this.currentId == 3) {
        let { params: { idKey } } = this,
          [startDateName, endDateName] = idKey
        this.$emit('choose', {
          currentId: 3,
          keys: idKey,
          value: {
            [startDateName]: this.customDate.startDate,
            [endDateName]: this.customDate.endDate
          }
        })
      } else this.currentId = 3
    }
  }
}
</script>

<style scoped lang='scss'>
.list {
  display: flex;
  gap: toRpx(32);
  margin: 0 toRpx(48);
  .item {
    justify-content: center;
    width: toRpx(348);
    height: toRpx(72);
    border-radius: toRpx(8);
    border: toRpx(2) solid #dce0e6;
    box-sizing: border-box;
    position: relative;
    color: #333333;
    font-size: toRpx(32);
    .sprite-icon {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  .splice {
    color: #333333;
    font-size: toRpx(32);
    margin: 0 toRpx(8);
  }
  .active {
    border-color: #2c66f7;
    background: #ecf1ff;
    color: #2c66f7;
    .sprite-icon {
      display: block;
    }
  }
}
</style>