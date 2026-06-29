<template>
  <view
    class="uni-calendar-item__weeks-box"
    :class="{
		'uni-calendar-item--disable':weeks.disable,
		'uni-calendar-item--isDay':calendar.fullDate === weeks.fullDate && weeks.isDay,
		'uni-calendar-item--checked':(calendar.fullDate === weeks.fullDate && !weeks.isDay) ,
		'uni-calendar-item--before-checked':weeks.beforeMultiple,
		'uni-calendar-item--multiple': weeks.multiple,
		'uni-calendar-item--after-checked':weeks.afterMultiple,
		}"
    @click="choiceDate(weeks)"
  >
    <view
      class="uni-calendar-item__weeks-box-item"
      :style="calendarItemStyle"
    >
      <text
        v-if="selected&&weeks.extraInfo"
        class="uni-calendar-item__weeks-box-circle"
      ></text>
      <text
        class="uni-calendar-item__weeks-box-text"
        :class="{
				'uni-calendar-item--isDay-text': weeks.isDay,
				'uni-calendar-item--isDay':calendar.fullDate === weeks.fullDate && weeks.isDay,
				'uni-calendar-item--checked':calendar.fullDate === weeks.fullDate && !weeks.isDay,
				'uni-calendar-item--before-checked':weeks.beforeMultiple,
				'uni-calendar-item--multiple': weeks.multiple,
				'uni-calendar-item--after-checked':weeks.afterMultiple,
				'uni-calendar-item--disable':weeks.disable,
				}"
      >{{weeks.date}}</text>
      <text
        v-if="!lunar&&!weeks.extraInfo && weeks.isDay"
        class="uni-calendar-item__weeks-lunar-text"
        :class="{
				'uni-calendar-item--isDay-text':weeks.isDay,
				'uni-calendar-item--isDay':calendar.fullDate === weeks.fullDate && weeks.isDay,
				'uni-calendar-item--checked':calendar.fullDate === weeks.fullDate && !weeks.isDay,
				'uni-calendar-item--before-checked':weeks.beforeMultiple,
				'uni-calendar-item--multiple': weeks.multiple,
				'uni-calendar-item--after-checked':weeks.afterMultiple,
				}"
      >{{todayText}}</text>
      <text
        v-if="lunar&&!weeks.extraInfo"
        class="uni-calendar-item__weeks-lunar-text"
        :class="{
				'uni-calendar-item--isDay-text':weeks.isDay,
				'uni-calendar-item--isDay':calendar.fullDate === weeks.fullDate && weeks.isDay,
				'uni-calendar-item--checked':calendar.fullDate === weeks.fullDate && !weeks.isDay,
				'uni-calendar-item--before-checked':weeks.beforeMultiple,
				'uni-calendar-item--multiple': weeks.multiple,
				'uni-calendar-item--after-checked':weeks.afterMultiple,
				'uni-calendar-item--disable':weeks.disable,
				}"
      >{{weeks.isDay ? todayText : (weeks.lunar.IDayCn === '初一'?weeks.lunar.IMonthCn:weeks.lunar.IDayCn)}}</text>
      <text
        v-if="weeks.extraInfo&&weeks.extraInfo.info"
        class="uni-calendar-item__weeks-lunar-text"
        :class="{
				'uni-calendar-item--extra':weeks.extraInfo.info,
				'uni-calendar-item--isDay-text':weeks.isDay,
				'uni-calendar-item--isDay':calendar.fullDate === weeks.fullDate && weeks.isDay,
				'uni-calendar-item--checked':calendar.fullDate === weeks.fullDate && !weeks.isDay,
				'uni-calendar-item--before-checked':weeks.beforeMultiple,
				'uni-calendar-item--multiple': weeks.multiple,
				'uni-calendar-item--after-checked':weeks.afterMultiple,
				'uni-calendar-item--disable':weeks.disable,
				}"
      >{{weeks.extraInfo.info}}</text>
    </view>
  </view>
</template>

<script>
import { initVueI18n } from '@dcloudio/uni-i18n'
import i18nMessages from './i18n/index.js'
const { t } = initVueI18n(i18nMessages)

export default {
  emits: ['change'],
  props: {
    weeks: {
      type: Object,
      default () {
        return {}
      }
    },
    calendar: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selected: {
      type: Array,
      default: () => {
        return []
      }
    },
    lunar: {
      type: Boolean,
      default: false
    },
    calendarItemStyle: {
      type: Object,
      default () {
        return {}
      }
    },
  },
  computed: {
    todayText () {
      return t("uni-calender.today")
    },
  },
  methods: {
    choiceDate (weeks) {
      this.$emit('change', weeks)
    }
  }
}
</script>

<style lang="scss" scoped>
$uni-font-size-base: 14px;
$uni-text-color: #37393d;
$uni-font-size-sm: 12px;
$uni-color-error: #e43d33;
$uni-opacity-disabled: 0.3;
$uni-text-color-disable: #c0c0c0;
$uni-primary: #4673ff !default;
.uni-calendar-item__weeks-box {
  flex: 1;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.uni-calendar-item__weeks-box-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.uni-calendar-item__weeks-lunar-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
}

.uni-calendar-item__weeks-box-item {
  position: relative;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: toRpx(100);
  height: toRpx(100);
}

.uni-calendar-item__weeks-box-circle {
  position: absolute;
  bottom: toRpx(6);
  left: 50%;
  transform: translate(-50%, -50%);
  width: toRpx(12);
  height: toRpx(12);
  border-radius: 8px;
  background-color: $uni-color-error;
}

.uni-calendar-item--disable {
  // background-color: rgba(249, 249, 249, $uni-opacity-disabled);
  color: $uni-text-color-disable;
}

.uni-calendar-item--isDay-text {
  color: $uni-primary;
}

.uni-calendar-item--isDay {
  background-color: $uni-primary;
  // opacity: 0.8;
  color: #fff;
  border-radius: toRpx(16);
}

.uni-calendar-item--extra {
  color: $uni-color-error;
  opacity: 0.8;
}

.uni-calendar-item--checked {
  background-color: $uni-primary;
  color: #fff;
  border-radius: toRpx(16);
  // opacity: 0.8;
}

.uni-calendar-item--multiple {
  // background-color: rgba($color: $uni-primary, $alpha: 0.8);
  background-color: #ecf1ff;
  // color: #37393D;
  color: #4673ff;
  .uni-calendar-item--multiple {
    background: none;
  }
  // opacity: 0.8;
}
.uni-calendar-item--before-checked {
  background-color: #4673ff;
  color: #fff;
  border-radius: toRpx(16);
}
.uni-calendar-item--after-checked {
  background-color: #4673ff;
  color: #fff;
  border-radius: inherit;
  border-radius: toRpx(16);
}
</style>
