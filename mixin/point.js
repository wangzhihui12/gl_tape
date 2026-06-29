import dayjs from 'dayjs'
export default {
  data() {
    return {
      IncomeList: [
        {
          label: '基本工资',
          icon: 'jbgz-icon',
          content: '实发底薪=应发底薪÷应出勤天数x实际出勤天数',
          value: 'actualBasicSalary',
          recordKey: 'refundOffsetRecords',
          showNext: true,
          sort: 1,
          base: true,
          customize: true,
          basicList: [
            {
              label: '应发底薪',
              tips: '',
              prop: 'basicSalary',
              actualProp: 'actualBasicSalary',
              value: 3000
            },
            {
              label: '应出勤天数',
              value: 27,
              prop: 'shouldWorkDay',
              unit: '天'
            },
            {
              label: '实际出勤天数',
              value: 22,
              prop: 'actualWorkDay',
              unit: '天'
            }
          ],
          performance: {
            label: '绩效工资',
            prop: 'performanceSalary',
            actualProp: 'actualPerformanceSalary',
          },
        },
        {
          label: '退单冲减',
          icon: 'tdcj-icon',
          content: '历史已发放提成订单客户本月退单，当月冲减该月提成',
          value: 'refundOffset',
          recordKey: 'refundOffsetRecords',
          sort: 4,
          tabelTh: [
            {
              title: '序号',
              width: 10
            },
            {
              title: '退单记录描述'
            },
            {
              title: '提成',
              width: 20
            }
          ],
          tabelTr: [
            'remark',
            {
              key: 'deduction',
              format: val => {
                return '-' + val
              }
            }
          ],
          showUnit: '-'
        },
        {
          label: '会员权益/升级',
          icon: 'qytc-icon',
          content: '权益提成 = 权益产值 × 提成系数 × 提成比例',
          subContent: '延保提成 = 售前延保产值×提成系数×安心包Max考核系数×提成比例 +售后延保产值×提成比例 +安心包Max产值×提成系数×提成比例',
          warnList: [
            { style: 'font-size: 28rpx;color: #808291;line-height: 48rpx;', message: '当安心包Max渗透率＜15%，安心包Max考核系数为 0.8' },
            {
              style: 'font-size: 28rpx;color: #808291;line-height: 48rpx;',
              message: '当安心包Max渗透率＞15%，安心包Max考核系数为 1.0'
            },
            {
              style: 'font-size: 28rpx;color: #F47F13;line-height: 48rpx;',
              message: '问界安心包、安心包PRO、轮胎服务，三项合计交付渗透率>15%  的部分，可以计入安心包Max渗透率；如三项渗透率为20%，其中5%计入安心包Max考核。'
            }
          ],
          value: 'equityCommission',
          recordKey: 'equityMerchantCommissions',
          sort: 2,
          tabelTh: [
            {
              title: '序号',
              width: 10
            },
            {
              title: '门店名称'
            },
            {
              title: '提成',
              width: 20
            }
          ],
          tabelTr: [
            {
              name: val => {
                const typeName = val.thirdLevelGoodsTypeName || val.secondaryGoodsTypeName || val.goodsTypeName
                return `${val.merchantName}${typeName ? `-${typeName}` : ''}`
              },
              style: val => {
                return val == 1 ? 'color: #3773F8;background-color:rgba(55, 115, 248, .2)' : 'color: #7C2CF5;background-color: rgba(124, 44, 245, .2);'
              },
              type: 'configCarType',
              text: val => {
                const typeMap = {
                  1: '问界',
                  2: '其他', 
                  3: '鸿蒙'
                }
                return typeMap[val] || ''
              }
            },
            'commission'
          ]
        },
        {
          label: '日报扣款',
          icon: 'rbkk-icon',
          content: '日报填写错误或未在约定时间内填写日报',
          value: 'dailyDeductMoney',
          recordKey: 'dailyDeductionRecords',
          sort: 5,
          tabelTh: [
            {
              title: '序号',
              width: 10
            },
            {
              title: '日期'
            },
            {
              title: '扣款',
              width: 20
            }
          ],
          tabelTr: [
            'deductDate',
            {
              key: 'deductMoney',
              format: val => {
                return '-' + val
              }
            }
          ],
          showUnit: '-'
        },
        {
          label: '轻改提成',
          icon: 'qgtc-icon',
          content: '轻改产值x提成系数x提成比例',
          value: 'lightCommission',
          recordKey: 'lightMerchantCommissions',
          sort: 3,
          tabelTh: [
            {
              title: '序号',
              width: 10
            },
            {
              title: '门店名称'
            },
            {
              title: '提成',
              width: 20
            }
          ],
          tabelTr: [
            {
              name: val => {
                const typeName = val.thirdLevelGoodsTypeName || val.secondaryGoodsTypeName || val.goodsTypeName
                return `${val.merchantName}${typeName ? `-${typeName}` : ''}`
              }
            },
            'commission'
          ]
        },
        {
          label: '平板接待扣款',
          icon: 'pbjd-icon',
          content: '无效或虚假平板接待以及未使用平板接待',
          value: 'padDeductMoney',
          recordKey: 'padDeductionRecords',
          sort: 6,
          tabelTh: [
            {
              title: '序号',
              width: 10
            },
            {
              title: '日期'
            },
            {
              title: '扣款',
              width: 20
            }
          ],
          tabelTr: [
            'deductDate',
            {
              key: 'deductMoney',
              format: val => {
                return '-' + val
              }
            }
          ],
          showUnit: '-'
        },
        {
          label: '本月递延金',
          icon: 'bydyj-icon',
          content: '本月递延金 = 本月提成 × 10%',
          desc: '递延金将于6个月后提成发放时返还',
          value: 'deferExpenses',
          sort: 7,
          showUnit: '-'
        },
        {
          label: '返还递延金',
          icon: 'ffdyj-icon',
          content: '本月递延金 = 提成（M-6）× 10%',
          desc: '6个月前提成递延金在本月返还',
          value: 'deferIncome',
          sort: 8
        },
        {
          label: '其他',
          icon: 'qt-icon',
          content: '其他扣款、奖励事项',
          recordKey: 'otherDeductionRecords',
          sort: 9,
          tabelTh: [
            {
              title: '序号',
              width: 10
            },
            {
              title: '日期'
            },
            {
              title: '备注'
            },
            {
              title: '金额',
              width: 20
            }
          ],
          tabelTr: [
            {
              key: 'createdDate',
              format: val => {
                return dayjs(val).format('YYYY-MM-DD')
              }
            },
            'remark',
            'deduction'
          ],
          value: 'otherDeduction'
        }
      ],
      year: '',
      month: '',
      currentMonth: '',
      date: ''
    }
  },
  mounted() {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    const day = new Date().getDate()
    this.year = year
    this.month = month
    this.day = day
    this.currentMonth = month
    this.getDetail && this.getDetail(`${this.year}-${this.month}`, day)
    this.date = `${this.year}-${this.month}-${day}`
  },
  methods: {
    formatNumber(num, decimalPlaces = 2) {
      // 保证小数部分精度
      let [integer, decimal] = Number(num).toFixed(decimalPlaces).split('.')

      // 格式化整数部分（千分位）
      integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

      // 如果有小数部分，则保留小数部分
      return decimal ? `${integer}.${decimal}` : integer
    },

    back() {
      console.log(88)
      this.$emit('backHome')
    },
    prevTab() {
      this.month = this.month - 1
      if (this.month < 1) {
        this.month = 12
        this.year = this.year - 1
      }
      this.updateDetail && this.updateDetail(`${this.year}-${this.month}`)
    },
    nextTab() {
      this.month = this.month + 1
      // if (this.month < 1) {
      //   this.month = 12
      //   this.year = this.year - 1
      // }
      this.updateDetail && this.updateDetail(`${this.year}-${this.month}`)
    }
  }
}
