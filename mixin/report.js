export default {
  data () {
    return {
      goodsId: '',
      visitsId: '',
      source: ''
    }
  },
  onLoad (options) {
    this.visitsId = options.visitsId || ''
    this.goodsId = options.id
    if (options.source) this.source = options.source
    this.addRecord()
  },
  methods: {
    addRecord () {
      const { shopMerchantId: merchantId, shopMerchantName: merchantName } = uni.$storage.get('userInfo')
      if (!merchantId || !this.goodsId) return
      const params = {
        goodsId: this.goodsId,
        goodsType: 0,
        merchantId,
        merchantName,
      }
      if (this.visitsId) params.visitsId = this.visitsId
      if (this.source) params.searchSource = this.source
      uni.$api.commonApi.addRecord(params).then(res => {
        this.addId = res
      })
    }
  },
  onUnload () {
    if (!this.addId) return
    const params = {
      id: this.addId
    }
    if (this.visitsId) params.visitsId = this.visitsId
    uni.$api.commonApi.leaveRecord(params).then(res => {
    })
  }
}
