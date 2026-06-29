export default {
  inject: ['userInfo', 'baseConfigData'],
  data () {
    return {
      list: [],
      searchStatus: false,
      searchList: [],
      chooseList: [],
      currentId: '',
      currentIds: [],
    }
  },
  props: {
    params: Object,
    data: [Object, Array],
    dataKey: String,
    isDefeatOrder: Boolean,
    positionTypeList: Array,
    reqParams: Object,
  },
  computed: {
    listData () {
      return this.searchStatus ? this.searchList : this.list
    },
    noData () {
      return !this.listData.length
    },
    sceneType(){
      return uni.$storage.get('userInfo').sceneType
    }
  },
  watch: {
    noData: {
      handler (val) {
        let { params } = this
        params.noData = val
        this.updateParams(params)
      },
      deep: true
    }
  },
  methods: {
    updateParams (params, data) {
      if (data) {
        this.initData && this.initData(data)
        params.cacheData = data
      }
      this.$emit('update:params', params)
    },
    componentLoading (params) {
      params.loadComplete = false
      this.$emit('update:params', this.params)
    }
  }

}