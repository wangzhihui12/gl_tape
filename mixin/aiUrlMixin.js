export default {
  data () {
    return {
      AIUrl: ''
    }
  },
  mounted () {
  },
  methods: {
    async getAiagent (options, agentCode = 'AI6') {
      const { phone } = uni.$storage.get('userInfo'),
        [data] = await uni.$api.sceneMarketApi.getAiagent({
          ownerShipType: 1,
          accountPhone: phone,
          agentCode
        })
      if (data) {
        const { sceneType, uuid, phone, channelType = 1 } = uni.$storage.get('userInfo'),
          bussinessType = sceneType == 0 ? 1 : 2,// sceneType 0延保 1精品。 bussinessType 1.延保 2.轻改
          brand = {
            1: '问界',
            2: '比亚迪',
            3: '其他'
          }[channelType]
        let title = options.directoryName
        if(options.title) title += `-${options.title}`
        let { agentUrl, domainName } = data,
          url = `${agentUrl}?no_header=1&business_type=${bussinessType}&phone=${phone}&brand=${brand}&one_id=${uuid}&platformType=1&domain=${domainName}&presuppositionProblem=${title}`
        if (options.id) url += `&enter_id=${options.id}`
        this.AIUrl = url
        this.setWebviewStyle()
      } else uni.showToast({
        title: '获取智能体失败',
        icon: 'error'
      })
    },
    setWebviewStyle () {
      const setWebviewStyleWithRetry = () => {
        const currentWebview = this.$scope.$getAppWebview()
        let [wv1, wv2] = currentWebview.children()
        let wv1Flag = false,
          wv2Flag = false
        if (wv2) {
          if (wv1) {
            wv1.setStyle({
              left: '0',
              top: '9.37%',
              height: '90.63%',
              width: '71.36%'
            });
            wv1Flag = true;
          }
          if (wv2) {
            wv2.setStyle({
              left: '71.9%',
              top: '17.18%',
              height: '82.82%',
              width: '28.3%'
            });
            wv2Flag = true;
          }
        } else {
          if (wv1) {
            wv1.setStyle({
              left: '71.9%',
              top: '17.18%',
              height: '82.82%',
              width: '28.3%'
            });
            wv1Flag = true;
            wv2Flag = true;
          }
        }

        return wv1Flag && wv2Flag
      };

      const retrySetWebviewStyle = () => {
        if (!setWebviewStyleWithRetry()) {
          // 如果未成功，继续重试
          setTimeout(retrySetWebviewStyle, 50);
        } else {
          // 成功设置样式，结束循环
          console.log('Webview样式设置成功');
        }
      };

      setTimeout(retrySetWebviewStyle, 100);
    }
  }
}
