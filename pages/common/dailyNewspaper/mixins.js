import dayjs from 'dayjs'
import { buildAppNormalizedListsFromJsonContent } from './subform'
import utils from '@/utils/utils'

export default {
  inject: ['sceneType', 'userInfo', 'templateType', 'dailyReportRecordId', 'reportStatus'],
  data() {
    return {
      dayjs,
      nowDate: dayjs().format('YYYY-MM-DD'),
      saveBtnStatus: false
    }
  },
  props: {
    currentDate: String,
    templateData: {
      type: Array,
      default: () => []
    },
    ReportStatus: null
  },
  computed: {
    /**可编辑日期 */
    editableDate() {
      let lastDay = dayjs().subtract(7, 'day'),
        { currentDate } = this
      return lastDay.isBefore(dayjs(currentDate), 'day')
    },
    isToday() {
      return this.currentDate == this.nowDate
    },
    reportParams() {
      let { shopMerchantId, shopMerchantName, uuid, name, merchantId, merchantName } = this.userInfo,
        { currentDate, templateType, dailyReportRecordId, sceneType } = this,
        params = {
          merchantId: shopMerchantId,
          merchantName: shopMerchantName,
          reportDate: currentDate,
          staffUuid: uuid,
          staffName: name,
          dailyReportSource: 2, //1：生意助手员工版小程序，2：平板电脑
          templateType: templateType(),
          yqMerchantId: merchantId,
          yqMerchantName: merchantName,
          sceneType
        }
      if (dailyReportRecordId()) params.dailyReportRecordId = dailyReportRecordId()
      return params
    }
  },
  watch: {},
  methods: {
    itemShow(item, parent, data) {
      try {
        let childrenShowRules = parent.childrenShowRules || null
        if (childrenShowRules) {
          if (Object.keys(childrenShowRules).includes(item.key)) {
            let { keys, result } = childrenShowRules[item.key],
              params = keys.map((i, index) => `val${index + 1}`),
              // 将 new Function 改为 eval 方式
              func = eval(`(function(${params.join(',')}) { return ${result}; })`),
              value = []
            keys.map(key => {
              let item = data.find(i => i.key == key)
              if (item) value.push(item.value || null)
            })
            let show = func(...value)
            return show
          } else {
            return true
          }
        } else {
          return true
        }
      } catch (error) {
        console.log(error)
      }
    },
    async saveReport(res) {
      try {
        uni.showLoading({ title: '提交中...', mask: true })
        let { reportParams } = this,
          list = utils.deepClone(res)
        let jsonContent = JSON.stringify(list)
        let requestJson = buildAppNormalizedListsFromJsonContent(jsonContent)
        list.map(e => {
          let childrenValue = []
          if (e.children && e.children.length)
            e.children.map((c, cIndex) => {
              let isArray = Array.isArray(c)
              if (isArray) {
                childrenValue.push({
                  [e.key]: {}
                })
                c.map(i => {
                  let value = i.value
                  if (i[i.key])
                    childrenValue[cIndex][e.key][i.key] = {
                      text: value,
                      value: i[i.key]
                    }
                  else childrenValue[cIndex][e.key][i.key] = value
                })
              }
            })
          e.childrenValue = childrenValue
          if (e.type == 'subform') delete e.children
        })
        reportParams.jsonContent = JSON.stringify(list)
        reportParams.requestJson = JSON.stringify(requestJson)
        console.log('保存草稿', reportParams)
        const data = await uni.$api.dailyTemplateApi.saveDraft(reportParams)
        uni.hideLoading()
        if (data) {
          uni.showToast({ title: '操作成功', icon: 'success', mask: true })
          this.$emit('saveReportStatus', data)
        } else uni.showToast({ title: '操作失败', icon: 'none', mask: true })
        console.log(data)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: error, icon: 'none', mask: true })
      }
    },
    async submitReport(res) {
      try {
        const phoneRegex = /^1[3456789]\d{9}$/
        uni.showLoading({ title: '提交中...', mask: true })
        let { reportParams } = this,
          list = utils.deepClone(res)
        let jsonContent = JSON.stringify(list)
        let requestJson = buildAppNormalizedListsFromJsonContent(jsonContent)
        list.map(e => {
          let childrenValue = []
          if (e.children && e.children.length)
            e.children.map((c, cIndex) => {
              let isArray = Array.isArray(c)
              if (isArray) {
                childrenValue.push({
                  [e.key]: {}
                })
                c.forEach(i => {
                  i.show = this.itemShow(i, e, c)
                  let hasShow = Object.prototype.hasOwnProperty.call(i, 'show'),
                    show = hasShow ? i.show : true
                  if (i.required && show) {
                    if (i.value === null || i.value === '' || i.value === undefined) throw `${e.label}第${cIndex + 1}行${i.label}不能为空`
                    if (i.type == 'phoneInput') {
                      // 验证手机号
                      if (!phoneRegex.test(i.value)) throw `${e.label}第${cIndex + 1}行${i.label}格式不正确`
                    }
                  }
                  let value = i.value
                  if (i[i.key])
                    childrenValue[cIndex][e.key][i.key] = {
                      text: value,
                      value: i[i.key]
                    }
                  else childrenValue[cIndex][e.key][i.key] = value
                })
              } else {
                if (e.show && c.required) {
                  if (c.value == null || c.value === '' || c.value == undefined) throw `${e.label}:${c.label}不能为空`
                  if (c.type == 'phoneInput') {
                    // 验证手机号
                    if (!phoneRegex.test(c.value)) throw `${e.label}:${c.label}格式不正确`
                  }
                }
              }
            })
          e.childrenValue = childrenValue
          if (e.show && e.required && e.type != 'subform') {
            if (e.value == null || e.value == undefined || e.value === '') throw `${e.label}不能为空`
            if (e.type == 'phoneInput') {
              // 验证手机号
              if (!phoneRegex.test(e.value)) throw `${e.label}格式不正确`
            }
          }

          if (e.type == 'subform') delete e.children
        })
        const { shopMerchantId } = this.userInfo,
          { sceneType } = this,
          carBrandList = await uni.$api.boutiqueApi.getDailyReportCarBrand({
            merchantId: shopMerchantId,
            sceneType
          }) || []
        requestJson.carBrandList = carBrandList.map(({ firstBrandId, firstBrandName, brandId, brandName }) => ({
          firstBrandId,
          firstBrandName,
          brandId,
          brandName
        }))
        reportParams.jsonContent = JSON.stringify(list)
        reportParams.requestJson = JSON.stringify(requestJson)
        console.log('提交日报', reportParams)
        uni.hideLoading()
        this.$emit('submitReport', reportParams)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: error, icon: 'none', mask: true })
      }
    }
  }
}
