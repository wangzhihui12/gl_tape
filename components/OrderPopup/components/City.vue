<template>
  <view class="city-list-box">
    <view class="step-box flex">
      <view
        :class="['step flex',{'step-active':currentStep == 1}]"
        @click="currentStep = 1"
      >
        {{currentIds[0] ||  '选择省份'}}
      </view>
      <view :class="['step flex',{'step-active':currentStep == 2}]">{{currentIds[1]||'选择城市'}}</view>
    </view>
    <scroll-view
      class="scroll-view"
      scroll-y
      :scroll-into-view="letter"
      :scroll-top="scrollTop"
    >
      <template v-if="listData.length">
        <template v-for="(i, index) in viewList">
          <view
            class="item-box"
            :key="index"
            :id="i.letter"
          >
            <view class="letter-title flex">{{i.letter}}</view>
            <view class="city-list">
              <template v-for="(c,cindex) in i.list">
                <view
                  :class="['item flex',{
                    active: currentIds.length ? c.name == currentIds[c.level - 1] : c.name == data[params.idKeys[c.level - 1]]
                  }]"
                  :key="cindex"
                  @click="choose(c)"
                >
                  {{c.name}}
                  <view class="sprite-icon icon-tag-checked"></view>
                </view>
              </template>
            </view>
          </view>
        </template>
      </template>
    </scroll-view>
    <view class="letter-list">
      <template v-for="(i, index) in viewList">
        <view
          class="letter-item"
          :key="index"
          @click="letter = i.letter"
        >
          {{i.letter}}
        </view>
      </template>
    </view>
  </view>
</template>

<script type='text/ecmascript-6'>
import popupmixin from './popupmixin'
import pinyin from 'pinyin.js'
export default {
  mixins: [popupmixin],
  name: 'City',
  data () {
    return {
      letter: 'A',
      scrollTop: 0,
      currentStep: 1
    }
  },
  computed: {
    viewList () {
      let { listData, currentStep, currentIds } = this,
        childList = null
      if (currentStep == 2) listData.map(e => {
        let item = e.list.find(i => i.name == currentIds[0])
        if (!childList && item) childList = item.list
      })
      return currentStep == 1 ? listData : childList
    },
  },
  mounted () {
  },
  methods: {
    async getList () {
      const { params } = this,
        { cacheData } = params
      this.currentId = ''
      if (cacheData && cacheData.length) {
        this.initData(cacheData)
        return
      }
      try {
        const { data: {
          code,
          data,
          msg
        } } = await uni.$api.evaluationApi
          .apiRegion({
            keyword: '全国',
            sub_admin: 3,
            extensions_code: 1
          })
        if (code == 0) {
          let { status, districts } = JSON.parse(data)
          if (status === 0 && districts && districts.length) {
            let provinceData = districts[0].districts
            provinceData = provinceData.map(item => {
              item.districts = item.districts.map(e => this.addLetterToItem(e))
              return this.addLetterToItem(item)
            })
            this.formatCityData(provinceData)
          } else throw '加载数据失败'
        } else throw msg
      } catch (error) {
        this.updateParams(params, [])
        if (error) uni.showToast({
          title: error,
          icon: 'none',
          mask: true
        })
      }

    },
    formatCityData (data) {
      const { params } = this
      let letterList = Array.from(new Set([...data.map((e) => e.letter)])).sort(),
        province = letterList.map(e => {
          let list = []
          data.map(i => {
            if (i.letter == e) {
              let childLetterList = Array.from(new Set([...i.districts.map((e) => e.letter)])).sort()
              i.list = childLetterList.map(c => {
                let districts = []
                i.districts.map(d => {
                  if (d.letter == c) {
                    districts.push(d)
                  }
                })
                const uniqueDistricts = districts.filter((item, index, self) =>
                  index === self.findIndex(obj => obj.name === item.name)
                )
                return {
                  letter: c,
                  list: uniqueDistricts
                }
              })
              list.push(i)
            }
          })
          return {
            letter: e,
            list,
          }
        })
      this.updateParams(params, province)
    },
    initData (listData) {
      let { data, params: { idKeys } } = this,
        [provinceKey, cityKey] = idKeys
      if (data[cityKey]) {
        this.currentIds = [data[provinceKey], data[cityKey]]
        this.currentStep = 2
        this.$emit('choose', {
          province: data[provinceKey],
          city: data[cityKey]
        })
      }
      this.list = listData
      this.$emit('onComplete')
    },
    choose (item) {
      let { level, name } = item,
        { currentIds } = this
      if (level == 2) {
        this.currentIds = [currentIds[0], name]
        let chooseItem = {
          province: currentIds[0],
          city: name
        }
        this.$emit('choose', chooseItem)
      } else {
        this.currentIds = [name]
        this.currentStep = 2
        this.scrollTop = 1
        setTimeout(() => {
          this.scrollTop = 0
        }, 100)
      }
    },
    addLetterToItem (item) {
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
  }
}
</script>

<style scoped lang='scss'>
.city-list-box {
  position: relative;
  height: 100%;
  width: 100%;
  .step-box {
    height: toRpx(64);
    justify-content: center;
    gap: 0 toRpx(96);
    position: relative;
    margin-bottom: toRpx(16);
    .step {
      height: toRpx(64);
      border-radius: toRpx(12);
      background: #f2f2f2;
      justify-content: center;
      padding: 0 toRpx(32);
      color: #666666;
      font-size: toRpx(28);
    }
    .step-active {
      background: #dee7ff;
      color: #347bff;
    }
    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      content: '';
      width: toRpx(16);
      height: toRpx(2);
      background: #cccccc;
    }
  }
  .scroll-view {
    height: calc(100% - #{toRpx(80)});
  }
  .letter-list {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    color: #888888;
    font-size: toRpx(28);
    line-height: toRpx(40);
    padding: 0 toRpx(18);
    text-align: center;
  }
  .item-box {
    margin-bottom: toRpx(32);
    .letter-title {
      color: #888888;
      font-size: toRpx(28);
      height: toRpx(40);
      background: #f5f7fa;
      padding-left: toRpx(48);
      margin-bottom: toRpx(16);
    }
    .city-list {
      margin: 0 toRpx(48);
      .brand-name {
        color: #333333;
        font-size: toRpx(32);
        line-height: toRpx(44);
        margin: toRpx(16) 0;
      }
      .sub-brand-name {
        color: #888888;
        font-size: toRpx(28);
        line-height: toRpx(40);
        width: 100%;
        flex-shrink: 0;
      }
    }
  }
  .city-list {
    // display: grid;
    // grid-template-columns: repeat(4, 1fr);
    gap: toRpx(32);
    display: flex;
    // gap: toRpx(32) 0;
    flex-wrap: wrap;
    .item {
      width: calc((100% - #{toRpx(96)}) / 4);
      justify-content: center;
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
    .active {
      border-color: #2c66f7;
      background: #ecf1ff;
      color: #2c66f7;
      .sprite-icon {
        display: block;
      }
    }
  }
}
</style>