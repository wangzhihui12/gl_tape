<template>
  <GeneralPopup ref="cityPopup" popupClass="cityPopup" :list="list" :title="title" @confirm="handleConfirm" :autoClose="false">
    <template v-slot:content>
      <view v-if="isLoading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else class="content-container">
        <StepTab :steps="dynamicSteps" :currentStep="currentStep" :clickable="true" @step-change="onStepChange" :isShowStepNumber="false"></StepTab>
        <view class="listComponent">
          <SortByNameList :items="currentStepData" :activeValue="currentSelectedId" :activeField="'code'" :itemNameField="'name'" :groupKeyField="'letter'" :itemsPerRow="3" :itemSpacing="32" @item-click="handleItemClick" />
        </view>
      </view>
    </template>
  </GeneralPopup>
</template>
<script>
import GeneralPopup from './GeneralPopup.vue'
import SortByNameList from './SortByNameList.vue'
import StepTab from './StepTab.vue'
import { sign, md532, md516 } from 'utils/common'
import pinyin from 'pinyin.js'
export default {
  name: 'SelectCity',
  components: {
    GeneralPopup,
    SortByNameList,
    StepTab
  },
  props: {
    title: {
      type: String,
      default: '选择城市'
    },
    list: {
      type: Array,
      default: () => []
    },
    defaultProvince: {
      type: Object,
      default: null
    },
    defaultCity: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentStep: 0,
      currentSelectedId: null,
      steps: [
        { label: '选择省份', number: 1 },
        { label: '选择市', number: 2 }
      ],
      provinceData: [],
      selectedProvince: null,
      selectedCity: null,
      selectionResult: null,
      isLoading: true
    }
  },
  created() {
    this.loadCityData()
  },
  computed: {
    dynamicSteps() {
      const newSteps = [...this.steps]
      if (this.selectedProvince && this.selectedProvince.name) {
        newSteps[0].label = this.selectedProvince.name
      } else {
        newSteps[0].label = '选择省份'
      }
      if (this.currentStep >= 1) {
        if (this.selectedCity && this.selectedCity.name) {
          newSteps[1].label = this.selectedCity.name
        } else {
          newSteps[1].label = '选择市'
        }
      }
      return newSteps
    },
    currentStepData() {
      let data = []
      switch (this.currentStep) {
        case 0:
          data = this.provinceData.map(item => this.addLetterToItem(item))
          break
        case 1:
          data = (this.selectedProvince?.districts || []).map(item => this.addLetterToItem(item))
          break
        default:
          data = []
      }
      console.log(`Step ${this.currentStep} data:`, data.length, 'items')
      return data
    }
  },
  methods: {
    loadCityData() {
      let that = this
      this.isLoading = true
      uni.$api.evaluationApi
        .apiRegion({
          keyword: '全国',
          sub_admin: 3,
          extensions_code: 1
        })
        .then(res => {
          console.log('请求结果:', res)
          let { data } = res
          if (data.code == 0) {
            console.log('请求结果:', JSON.parse(data.data))
            let { status, districts } = JSON.parse(data.data)
            if (status === 0 && districts) {
              that.provinceData = districts[0].districts
              const chongqingProvince = that.provinceData.find(province => province.code === '500000')
              if (chongqingProvince && chongqingProvince.districts && chongqingProvince.districts.length > 1) {
                chongqingProvince.districts = [chongqingProvince.districts[0]]
              }

              console.log('provinceData', that.provinceData)
              that.updateSelectionWithLoadedData()
            } else {
              console.error('Invalid city data format:', result)
            }
            that.isLoading = false
          } else {
            that.isLoading = false
          }
        })
    },
    updateSelectionWithLoadedData() {
      console.log('Updating selection with loaded data...', this.defaultProvince)
      console.log('Updating selection with loaded data...', this.defaultCity)
      console.log('Updating selection with loaded data...', this.provinceData)
      if (this.defaultProvince && (this.defaultProvince.code || this.defaultProvince.id)) {
        const defaultProvinceCode = String(this.defaultProvince.code || this.defaultProvince.id)
        const foundProvince = this.provinceData.find(p => String(p.code) === defaultProvinceCode || String(p.id) === defaultProvinceCode)
        console.log('foundProvince', foundProvince)
        if (foundProvince) {
          this.selectedProvince = foundProvince
          const defaultCityCode = this.defaultCity ? String(this.defaultCity.code || this.defaultCity.id) : null
          if (defaultCityCode) {
            const foundCity = foundProvince.districts?.find(c => String(c.code) === defaultCityCode || String(c.id) === defaultCityCode)
            if (foundCity) {
              this.selectedCity = foundCity
              this.currentStep = 1
              this.currentSelectedId = foundCity.code
            }
          }
          this.selectionResult = {
            province: this.selectedProvince,
            city: this.selectedCity
          }
        }
      }
    },
    open() {
      if (!this.defaultProvince) {
        this.resetSelection()
      }
      this.$nextTick(() => {
        if (this.$refs.cityPopup) {
          this.$refs.cityPopup.open()
        }
      })
    },
    resetSelection() {
      this.currentStep = 0
      this.currentSelectedId = null
      this.selectedProvince = null
      this.selectedCity = null
      this.selectionResult = null
    },
    onStepChange(index) {
      console.log(`Changing step from ${this.currentStep} to ${index}`)
      if (index === 0) {
        this.currentStep = 0
        this.currentSelectedId = this.selectedProvince?.code || null
      } else if (index === 1 && this.selectedProvince) {
        this.currentStep = 1
        this.currentSelectedId = this.selectedCity?.code || null
      }
    },
    handleItemClick(item) {
      console.log('Clicked item:', item)
      this.currentSelectedId = item.code
      if (this.currentStep === 0) {
        this.selectedProvince = item
        this.selectedCity = null
        this.currentStep = 1
        // this.$emit('province-selected', item)
      } else if (this.currentStep === 1) {
        this.selectedCity = item
        // this.$emit('city-selected', item)
      }
      this.selectionResult = {
        province: this.selectedProvince,
        city: this.selectedCity
      }
      console.log('Selection result:', this.selectionResult)
    },
    addLetterToItem(item) {
      if (!item || !item.name) {
        return { ...item, letter: '#' }
      }
      try {
        const firstChar = item.name.charAt(0)
        if (/[一-龥]/.test(firstChar)) {
          let pinyinResult
          try {
            pinyinResult = pinyin(firstChar)
          } catch (e1) {
            console.warn('pinyin without options failed:', e1)
            try {
              pinyinResult = pinyin(firstChar, { style: 0 })
            } catch (e2) {
              console.warn('pinyin with simple options failed:', e2)
              const simplePinyinMap = {
                安: 'A',
                北: 'B',
                重: 'C',
                川: 'C',
                大: 'D',
                东: 'D',
                福: 'F',
                甘: 'G',
                广: 'G',
                贵: 'G',
                海: 'H',
                河: 'H',
                黑: 'H',
                湖: 'H',
                吉: 'J',
                江: 'J',
                辽: 'L',
                内: 'N',
                宁: 'N',
                青: 'Q',
                山: 'S',
                陕: 'S',
                上: 'S',
                四: 'S',
                台: 'T',
                天: 'T',
                西: 'X',
                新: 'X',
                云: 'Y',
                浙: 'Z'
              }
              return {
                ...item,
                letter: simplePinyinMap[firstChar] || '#'
              }
            }
          }
          let letter = '#'
          if (pinyinResult && pinyinResult.length > 0) {
            if (Array.isArray(pinyinResult[0])) {
              letter = pinyinResult[0][0].charAt(0).toUpperCase()
            } else if (typeof pinyinResult[0] === 'string') {
              letter = pinyinResult[0].charAt(0).toUpperCase()
            } else if (typeof pinyinResult === 'string') {
              letter = pinyinResult.charAt(0).toUpperCase()
            }
          }
          if (/^[A-Z]$/.test(letter)) {
            return { ...item, letter }
          } else {
            const simplePinyinMap = {
              安: 'A',
              阿: 'A'
            }
            return {
              ...item,
              letter: simplePinyinMap[firstChar] || '#'
            }
          }
        } else {
          const letter = firstChar.toUpperCase()
          return { ...item, letter: /^[A-Z]$/.test(letter) ? letter : '#' }
        }
      } catch (error) {
        console.error('获取首字母失败:', error)
        return { ...item, letter: '#' }
      }
    },
    closePopup() {
      this.$refs.cityPopup.closePopup()
    },
    handleConfirm() {
      if (this.selectedCity) {
        this.$emit('city-selected', this.selectionResult)
        this.$refs.cityPopup.closePopup()
      } else {
        uni.showToast({
          title: '请选择城市',
          icon: 'none'
        })
      }
    }
  }
}
</script>
<style scoped lang="scss">
// 只保留内容区域的必要样式
::v-deep .cityPopup {
  .content {
    width: 100%;
    height: toRpx(764);
    background-color: #fff;
    box-sizing: border-box;
    overflow: hidden;
    .listComponent {
      width: 100%;
      height: calc(100% - #{toRpx(100)});
    }
  }
}

// 新增：确保标题在pad端居中的样式
::v-deep .customPopup.cityPopup .uni-popup__wrapper.bottom {
  .popup-top-box {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    padding: 0 !important;

    .popup-top-box-title {
      flex: none !important;
      text-align: center !important;
      width: auto !important;
      max-width: 80% !important;
    }

    // 处理中间占位元素
    view:nth-child(2) {
      display: none !important;
    }

    // 处理关闭按钮位置
    view:nth-child(3) {
      position: absolute !important;
      right: toRpx(48) !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
    }
  }
}

.content-container {
  width: 100%;
  height: 100%;
}

.loading-container {
  width: 100%;
  height: toRpx(764);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}
.loading-spinner {
  width: toRpx(60);
  height: toRpx(60);
  border: toRpx(6) solid #f3f3f3;
  border-top: toRpx(6) solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.loading-text {
  margin-top: toRpx(20);
  color: #666;
  font-size: toRpx(28);
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
