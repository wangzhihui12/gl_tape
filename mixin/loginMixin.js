export default {
  methods: {
    // 获取园区店下4s店数据
    get4SStoreList (loginUserObj) {
      console.log(loginUserObj, '-=-')
      try {
        let { merchantId, isSuper, uuid } = loginUserObj
        if (isSuper) {
          this.$emit('chooseAccount', loginUserObj)
          return
        }
        uni.$api.userApi.getSceneMerchantRefStoreList({
          merchantId,
          staffUUID: uuid
        }).then(result => {
          console.log(result, 'result')
          // 仅一家4s店
          if (result?.length == 1) {
            let { merchantName, merchantId } = result[0]
            this.$emit('chooseAccount', {
              ...loginUserObj,
              shopMerchantName: merchantName,
              shopMerchantId: merchantId,
              default4SStoreInfo: {
                merchantId: merchantId,
                merchantName: merchantName
              },
              default4SStoreInfo_crowdFunding: {
                merchantId: merchantId,
                merchantName: merchantName
              },
              default4SStoreInfo_newCarConversion: {
                merchantId: merchantId,
                merchantName: merchantName
              }
            })
          } else if (!result?.length) {
            return uni.showToast({
              title: '园区店关联的4s店商户账号无效，请联系总部管理员',
              icon: 'none',
            })
          } else {
            this.$emit('chooseAccount', loginUserObj)
          }
        })
      } catch (error) {
        console.log(error)
      }
    },
  }
}