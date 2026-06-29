<template>
  <view class="goods-list is-defeat-order">
    <template v-if="params.loadComplete">
      <template v-if="categoryList.length">
        <view v-for="(category, index) in categoryList" :key="index" class="item-box">
          <view class="goods-title flex">{{ category.categoryName }}</view>
          <view class="defeat-goods-list">
            <view v-for="(subItem, subIndex) in category.subItems" :key="`${index}_${subIndex}`" :class="['item flex', { active: checkActive(subItem) }]" @click="choose(subItem)">
              <view class="sprite-icon icon-tag-checked"></view>
              <text class="goods-name text-hide">{{ subItem.categoryName }}</text>
            </view>
          </view>
        </view>
      </template>
    </template>
  </view>
</template>

<script>
import popupmixin from './popupmixin'
export default {
  mixins: [popupmixin],
  name: 'GoodsCategory',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      categoryList: [],
      currentIds: [],
      chooseList: []
    }
  },
  mounted() {
    this.getList()
  },
  watch: {
    data: {
      handler(newVal) {
        console.log(newVal)
        if (newVal && newVal.length > 0) {
          if (this.categoryList.length > 0) {
            this.restoreSelectedState()
          }
        }
      },
      deep: true,
      immediate: true
    },
    categoryList: {
      handler(newVal) {
        if (newVal && newVal.length > 0 && this.data && this.data.length > 0) {
          this.restoreSelectedState()
        }
      },
      deep: true
    }
  },
  methods: {
    async getList(searchValue) {
      await this.getGoodsCategoryList()

      if (searchValue) {
        this.handleSearch(searchValue)
      }
      if (this.data && this.data.length > 0) {
        this.restoreSelectedState()
      }
    },
    reset() {
      this.currentIds = []
      this.chooseList = []
    },

    restoreSelectedState() {
      console.log(this.data)
      console.log(this.categoryList)
      if (!this.data || !this.categoryList.length) return

      this.currentIds = []
      this.chooseList = []
      this.categoryList.forEach(category => {
        category.subItems.forEach(item => {
          const isSelected = this.data.some(selectedItem => selectedItem.id === item.id)
          console.log(isSelected)
          if (isSelected) {
            this.currentIds.push(item.id)
            this.chooseList.push(item)
          }
        })
      })
    },

    async getGoodsCategoryList() {
      let params = {
        categoryType: ''
      }
      let res = await uni.$api.boutiqueApi.getGoodsCategoryList(params)
      console.log(res)

      if (res && res.children) {
        this.categoryList = this.processCategoryData(res.children)
      }
      console.log(this.categoryList)
      this.$emit('onComplete')
    },

    processCategoryData(children) {
      return children.map(category => {
        let subItems = []
        if (category.children && category.children.length > 0) {
          subItems = category.children
        } else {
          subItems = [category]
        }

        return {
          categoryName: category.categoryName,
          subItems: subItems
        }
      })
    },

    handleSearch(searchValue) {
      if (!searchValue) {
        this.searchStatus = false
        return
      }

      let filteredList = []
      this.categoryList.forEach(category => {
        if (category.categoryName.indexOf(searchValue) !== -1) {
          filteredList.push(category)
        } else {
          const filteredSubItems = category.subItems.filter(item => item.categoryName.indexOf(searchValue) !== -1)
          if (filteredSubItems.length > 0) {
            filteredList.push({
              ...category,
              subItems: filteredSubItems
            })
          }
        }
      })

      this.searchList = filteredList
      this.searchStatus = true
    },

    choose(item) {
      let id = item.id
      let index = this.currentIds.indexOf(id)

      if (index === -1) {
        this.currentIds.push(id)
        this.chooseList.push(item)
      } else {
        this.currentIds.splice(index, 1)
        this.chooseList.splice(index, 1)
      }
      console.log(this.chooseList)
      this.$emit('choose', this.chooseList)
    },

    checkActive(item) {
      return this.currentIds.includes(item.id)
    }
  }
}
</script>

<style scoped lang="scss">
.goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: toRpx(32);
  margin: 0 toRpx(48);
  overflow: hidden;
  .item {
    justify-content: center;
    height: toRpx(72);
    border-radius: toRpx(8);
    border: toRpx(2) solid #dce0e6;
    box-sizing: border-box;
    position: relative;
    color: #333333;
    font-size: toRpx(32);
    box-sizing: border-box;
    padding: 0 toRpx(32);
    text-align: center;
    .no-postion {
      color: #f24724;
      margin-left: toRpx(10);
      font-size: toRpx(22);
    }
    .sprite-icon {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
    }
    .price {
      margin-left: auto;
    }
    .goods-name {
      max-width: toRpx(600);
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
.is-defeat-order {
  display: block;
  margin: 0;
  .item-box {
    margin-bottom: toRpx(32);
    .goods-title {
      color: #888888;
      font-size: toRpx(28);
      height: toRpx(40);
      background: #f5f7fa;
      padding-left: toRpx(48);
      margin-bottom: toRpx(16);
    }
    .defeat-goods-list {
      gap: toRpx(32);
      display: flex;
      flex-wrap: wrap;
      margin: 0 toRpx(48);
      .item {
        width: calc((100% - #{toRpx(32)}) / 2);
        justify-content: center;
        min-height: toRpx(72);
        border-radius: toRpx(8);
        border: toRpx(2) solid #dce0e6;
        box-sizing: border-box;
        position: relative;
        color: #333333;
        font-size: toRpx(32);
        padding: toRpx(14) toRpx(32);
        word-break: break-all;
        text-align: center;
        .sprite-icon {
          display: none;
          position: absolute;
          top: 0;
          right: 0;
        }
      }
      .disabled {
        border: toRpx(2) solid #dce0e666;
        color: #3333331a;
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
}
</style>
