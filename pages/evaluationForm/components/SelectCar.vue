<template>
  <GeneralPopup ref="carPopup" popupClass="carPopup" :list="list" :title="title" @confirm="confirm" :loading="loading">
    <template v-slot:content>
      <StepTab
        :steps="
          steps.map(step => ({
            label: step.selectedText || step.label,
            number: step.number
          }))
        "
        :currentStep="currentStep"
        :clickable="true"
        @step-change="onStepChange"
        :isShowStepNumber="false"
      ></StepTab>
      <view v-if="carTips" class="carTips">{{ carTips }}</view>
      <view class="list-component">
        <!-- 修复activeValue绑定，统一使用currentSelectedId -->
        <SortByNameList :items="currentStepData" :activeValue="currentSelectedId" :activeField="'id'" :itemNameField="'name'" :groupKeyField="'letter'" :itemsPerRow="3" :itemSpacing="32" @item-click="handleItemClick" :enableFastScroll="false" />
      </view>
    </template>
  </GeneralPopup>
</template>
<script>
import GeneralPopup from './GeneralPopup.vue'
import SortByNameList from './SortByNameList.vue'
import StepTab from './StepTab.vue'
export default {
  name: 'SelectCar',
  components: {
    GeneralPopup,
    SortByNameList,
    StepTab
  },
  props: {
    title: {
      type: String,
      default: '选择车型'
    },
    list: {
      type: Array,
      default: () => []
    },
    carBrandData: {
      type: Array,
      default: () => []
    },
    onLoadYearData: {
      type: Function,
      default: () => Promise.resolve([])
    },
    carTips: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentStep: 0,
      stepSelectedIds: [null, null, null, null],
      steps: [
        { label: '主品牌', number: 1, selectedText: '' },
        { label: '子品牌', number: 2, selectedText: '' },
        { label: '车系', number: 3, selectedText: '' },
        { label: '车型', number: 4, selectedText: '' }
      ],
      selectedBrand: null,
      selectedSeries: null,
      selectedModel: null,
      selectedYear: null,
      loadingYearData: false,
      selectionResult: null,
      lastSelectedResult: null,
      // 标记当前是否为编辑模式
      isEditMode: false,
      loading: false,
      selectedFlag: false
    }
  },
  computed: {
    currentStepData() {
      let data = []

      if (this.loading && !this.isEditMode) {
        return []
      }

      switch (this.currentStep) {
        case 0:
          data = this.carBrandData || []
          break
        case 1:
          data = this.selectedBrand?.childs || []
          break
        case 2:
          data = this.selectedSeries?.childs || []
          break
        case 3:
          data = this.selectedModel?.childs || []
          break
        default:
          data = []
      }
      if (!Array.isArray(data)) {
        data = []
      }

      return data
    },
    currentSelectedId() {
      console.log('currentStep', this.currentStep)
      console.log('currentSelectedId', this.stepSelectedIds[this.currentStep])
      return this.stepSelectedIds[this.currentStep]
    }
  },
  methods: {
    open(carInfo = null) {
      // 重置状态
      this.selectedBrand = null
      this.selectedSeries = null
      this.selectedModel = null
      this.selectedYear = null
      this.stepSelectedIds = [null, null, null, null]
      this.steps.forEach(step => (step.selectedText = ''))
      this.currentStep = 0
      this.isEditMode = false
      this.loading = true
      this.selectedFlag = false

      setTimeout(() => {
        if (this.$refs.carPopup) {
          this.$refs.carPopup.open()
        }
      }, 50)
      this._processOpenData(carInfo)
    },

    async _processOpenData(carInfo) {
      // 确保数据加载完成
      if (this.carBrandData.length === 0) {
        // 显示加载中状态
        this.loading = true
        await this._waitForDataLoad()
      }

      // 编辑模式 - 传入了完整的车型信息对象
      if (carInfo && typeof carInfo === 'object' && carInfo.brand) {
        this.isEditMode = true
        this._handleEditMode(carInfo)
      }
      // 识别模式 - 传入了品牌名称字符串
      else if (carInfo && typeof carInfo === 'string') {
        this._handleIdentifyMode(carInfo)
      }
      //重复打开/新增模式 - 无参数或使用上次选择结果
      else if (!carInfo && this.lastSelectedResult) {
        this._handleRepeatOpenMode()
      }

      // 数据处理完成后关闭loading
      this.loading = false
    },

    // 等待数据加载完成的辅助方法
    _waitForDataLoad() {
      return new Promise(resolve => {
        if (this.carBrandData.length > 0) {
          resolve()
          return
        }

        // 添加计数器，显示加载尝试次数
        let attemptCount = 0
        const maxAttempts = 30 // 3秒，每100ms检查一次

        const checkInterval = setInterval(() => {
          attemptCount++

          if (this.carBrandData.length > 0) {
            clearInterval(checkInterval)
            resolve()
          } else if (attemptCount >= maxAttempts) {
            clearInterval(checkInterval)
            console.warn('数据加载超时，显示空列表')
            resolve()
          }
        }, 100)
      })
    },

    async _handleEditMode(carInfo) {
      try {
        // 设置品牌信息
        if (carInfo.brand && Array.isArray(this.carBrandData)) {
          const fullBrand = this.carBrandData.find(item => item.id === carInfo.brand.id || item.name === carInfo.brand.name)
          if (fullBrand) {
            this.selectedBrand = fullBrand
            this.stepSelectedIds[0] = fullBrand.id
            this.steps[0].selectedText = fullBrand.name
          } else {
            this.selectedBrand = { ...carInfo.brand, childs: [] }
            this.stepSelectedIds[0] = carInfo.brand.id
            this.steps[0].selectedText = carInfo.brand.name
          }
        }

        // 设置系列信息
        if (carInfo.series && this.selectedBrand) {
          if (!this.selectedBrand.childs) {
            this.selectedBrand.childs = []
          }
          const fullSeries = this.selectedBrand.childs.find(item => item.id === carInfo.series.id || item.name === carInfo.series.name)
          if (fullSeries) {
            this.selectedSeries = fullSeries
            this.stepSelectedIds[1] = fullSeries.id
            this.steps[1].selectedText = fullSeries.name
            this.currentStep = 1
          } else {
            this.selectedSeries = { ...carInfo.series, childs: [] }
            this.stepSelectedIds[1] = carInfo.series.id
            this.steps[1].selectedText = carInfo.series.name
            this.currentStep = 1
          }
        }

        // 设置车型信息
        if (carInfo.model && this.selectedSeries) {
          if (!this.selectedSeries.childs) {
            this.selectedSeries.childs = []
          }
          const fullModel = this.selectedSeries.childs.find(item => item.id === carInfo.model.id || item.name === carInfo.model.name)
          if (fullModel) {
            this.selectedModel = fullModel
            this.stepSelectedIds[2] = fullModel.id
            this.steps[2].selectedText = fullModel.name
            this.currentStep = 2

            // 加载年份数据
            if (!this.selectedModel.childs || this.selectedModel.childs.length === 0) {
              await this.loadYearDataForModel(this.selectedModel)
            }
          } else {
            this.selectedModel = { ...carInfo.model, childs: [] }
            this.stepSelectedIds[2] = carInfo.model.id
            this.steps[2].selectedText = carInfo.model.name
            this.currentStep = 2
          }
        }

        // 设置年份信息
        if (carInfo.year && this.selectedModel) {
          if (!this.selectedModel.childs) {
            this.selectedModel.childs = []
          }
          const fullYear = this.selectedModel.childs.find(item => item.id === carInfo.year.id || item.name === carInfo.year.name)
          if (fullYear) {
            this.selectedYear = fullYear
            this.stepSelectedIds[3] = fullYear.id
            this.steps[3].selectedText = fullYear.name
            this.currentStep = 3
          } else {
            this.selectedYear = { ...carInfo.year }
            this.stepSelectedIds[3] = carInfo.year.id
            this.steps[3].selectedText = carInfo.year.name
            this.currentStep = 3
          }
        }
        // 强制更新UI以确保选中状态正确显示
        this.$nextTick(() => {
          this.$forceUpdate()
        })
      } catch (error) {
        console.error('处理编辑模式数据时出错:', error)
        // 出错时确保loading状态正确
        this.loading = false
      }
    },

    // 处理识别模式
    _handleIdentifyMode(brandName) {
      const matchedBrand = this.carBrandData.find(item => (item.name && brandName && item.name.includes(brandName)) || item.name === brandName)

      if (matchedBrand) {
        this.selectedBrand = matchedBrand
        this.stepSelectedIds[0] = matchedBrand.id
        this.steps[0].selectedText = matchedBrand.name
        this.selectedSeries = null
        this.selectedModel = null
        this.selectedYear = null
        this.stepSelectedIds[1] = this.stepSelectedIds[2] = this.stepSelectedIds[3] = null
        this.steps[1].selectedText = this.steps[2].selectedText = this.steps[3].selectedText = ''
      }
    },

    // 处理重复打开模式
    _handleRepeatOpenMode() {
      this._handleEditMode(this.lastSelectedResult)
    },

    // 通过props调用父组件方法加载年份数据
    async loadYearDataForModel(model) {
      if (model.childs && model.childs.length > 0) {
        return model.childs
      }

      this.loadingYearData = true
      try {
        const yearData = await this.onLoadYearData(model.id)
        model.childs = yearData || []
        return model.childs
      } catch (error) {
        console.error('加载年份数据失败:', error)
        model.childs = []
        return []
      } finally {
        this.loadingYearData = false
      }
    },

    confirm() {
      this.lastSelectedResult = this.selectionResult
      this.$emit('car-selected', this.selectionResult)
      if (this.$refs.carPopup) {
        this.$refs.carPopup.close()
      }
    },

    onStepChange(index) {
      // 限制只能前进到已选择的下一级
      if (index === 0) {
        this.currentStep = 0
      } else if (index === 1 && this.selectedBrand) {
        this.currentStep = 1
        // 确保selectedBrand有childs属性
        if (!this.selectedBrand.childs) {
          this.selectedBrand.childs = []
        }
      } else if (index === 2 && this.selectedSeries) {
        this.currentStep = 2
        // 确保selectedSeries有childs属性
        if (!this.selectedSeries.childs) {
          this.selectedSeries.childs = []
        }
      } else if (index === 3 && this.selectedModel) {
        // 如果还没有年份数据，则加载
        if (!this.selectedModel.childs || this.selectedModel.childs.length === 0) {
          this.loadingYearData = true
          this.loadYearDataForModel(this.selectedModel).then(() => {
            this.loadingYearData = false
            this.currentStep = 3
            // 强制更新UI以确保年份列表正确显示
            this.$nextTick(() => {
              this.$forceUpdate()
            })
          })
        } else {
          this.currentStep = 3
        }
      }
      // 强制更新UI以确保步骤切换正确显示
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },

    // 处理项目点击事件
    handleItemClick(item) {
      const isSameItem = this.stepSelectedIds[this.currentStep] === item.id
      this.$set(this.stepSelectedIds, this.currentStep, item.id)

      if (!isSameItem) {
        if (this.currentStep === 0) {
          this.selectedBrand = item
          this.selectedSeries = null
          this.selectedModel = null
          this.selectedYear = null
          this.steps[1].selectedText = ''
          this.steps[2].selectedText = ''
          this.steps[3].selectedText = ''
        } else if (this.currentStep === 1) {
          this.selectedSeries = item
          this.selectedModel = null
          this.selectedYear = null
          this.steps[2].selectedText = ''
          this.steps[3].selectedText = ''
        } else if (this.currentStep === 2) {
          this.selectedModel = item
          this.selectedYear = null
          this.steps[3].selectedText = ''
        } else if (this.currentStep === 3) {
          // 修复第四步选择逻辑，加强UI更新
          this.selectedYear = item
          this.selectionResult = {
            brand: this.selectedBrand,
            series: this.selectedSeries,
            model: this.selectedModel,
            year: this.selectedYear
          }
          // 使用一个标记变量切换来强制响应式更新
          this.selectedFlag = !this.selectedFlag
          // 双重保险，确保UI更新
          this.$nextTick(() => {
            this.$forceUpdate()
          })
        }
      }

      this.steps[this.currentStep].selectedText = item.name

      if (this.currentStep < 3) {
        // 如果是第三步，需要加载年份数据并等待完成后再进入第四步
        if (this.currentStep === 2) {
          this.loadingYearData = true
          this.loadYearDataForModel(this.selectedModel).then(() => {
            this.loadingYearData = false
            this.currentStep = 3
            // 强制更新UI以确保年份列表正确显示
            this.$nextTick(() => {
              this.$forceUpdate()
            })
          })
        } else {
          this.currentStep++
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .carPopup {
  .content {
    width: 100%;
    height: toRpx(764);
    background-color: #fff;
    box-sizing: border-box;
    overflow: hidden;
    .list-component {
      width: 100%;
      height: calc(100% - #{toRpx(100)});
    }
  }
}

// 增强选中状态的样式
::v-deep .carPopup .content .list-component {
  .sort-by-name-list {
    .item-active {
      background-color: #e6f7ff !important;
      color: #1890ff !important;
      border-color: #1890ff !important;
    }
  }
}
.carTips {
  border-radius: toRpx(16);
  background: #fef4e8;
  padding: toRpx(16) 0;
  color: #f59619;
  font-size: toRpx(26);
  font-weight: 400;
  text-align: center;
  margin: 0 toRpx(48) toRpx(16);
}
</style>
