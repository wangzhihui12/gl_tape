import http from '../request/http'
import { env } from '../../env'

const ENV = env == 'ip' ? 'develop' : env,
  serverConfig = {
    mockRequestCount: null,
    mockTimer: {},
    mockCache: null
  },
  boutiqueServerConfig = {
    mockRequestCount: null,
    mockTimer: {},
    mockCache: null
  },
  configModule = 'app-tape',
  boutiqueConfigModule = 'boutique-pad-config',
  configUrl = `https://config-center-backend.glsx.com.cn/glsxAdmin/config?moduleUrl=${configModule}&env=${ENV}`,
  boutiqueConfigUrl = `https://config-center-backend.glsx.com.cn/glsxAdmin/config?moduleUrl=${boutiqueConfigModule}&env=${ENV}`
/**获取APP配置 */
const getMockData = async (immediate = false) => {
  const MOCKDATA = uni.$storage.get('mock_data')
  try {
    if (!immediate && MOCKDATA && Date.now() - MOCKDATA.createTime < 5 * 60e3) {
      return Promise.resolve(MOCKDATA)
    } else {
      if (!serverConfig.mockRequestCount || immediate) {
        serverConfig.mockCache = null
        serverConfig.mockRequestCount = Date.now()
        const data = await http.uni_request({ url: configUrl })
        data.createTime = Date.now()
        serverConfig.mockCache = data
        uni.$storage.set('mock_data', data)
        return Promise.resolve(data)
      } else {
        const key = Date.now()
        return new Promise(resolve => {
          serverConfig.mockTimer[key] = setInterval(() => {
            if (serverConfig.mockCache) {
              clearInterval(serverConfig.mockTimer[key])
              serverConfig.mockRequestCount = null
              resolve(serverConfig.mockCache)
            }
          }, 1e3)
        })
      }
    }
  } catch (error) {
    if (serverConfig.mockTimer[key]) clearInterval(serverConfig.mockTimer[key])
    serverConfig.mockRequestCount = null
    return Promise.reject(error)
  }
}
/**
 *权益配置
 */
const findReceptionpriproConfigList = data => {
  return http.post({
    method: 'dj.api.smartcarlife.recepiton.customer.findReceptionpriproConfigList',
    projectName: 'boutique',
    ...data
  })
}
/**
 *获取后台延保素材ID
 */
const getEquityMaterialId = data => {
  return http.post({
    method: 'dj.api.smartcarlife.reception.home.page.material.view',
    projectName: 'boutique',
    ...data
  })
}
/**
 *获取后台延保素材配置
 */
const getEquityMaterialConfig = data => {
  return http.post({
    method: 'dj.api.car.boutique.reception.home.page.entrance.material.detail',
    projectName: 'boutique',
    ...data
  })
}
/**
 *获取轻改配置
 */
const getBoutiqueMockData = async (immediate = false) => {
  const MOCKDATA = uni.$storage.get('boutique_mock_data')
  try {
    if (!immediate && MOCKDATA && Date.now() - MOCKDATA.createTime < 5 * 60e3) {
      return Promise.resolve(MOCKDATA)
    } else {
      if (!boutiqueServerConfig.mockRequestCount || immediate) {
        boutiqueServerConfig.mockCache = null
        boutiqueServerConfig.mockRequestCount = Date.now()
        const data = await http.uni_request({ url: boutiqueConfigUrl })
        data.createTime = Date.now()
        boutiqueServerConfig.mockCache = data
        uni.$storage.set('boutique_mock_data', data)
        return Promise.resolve(data)
      } else {
        const key = Date.now()
        return new Promise(resolve => {
          boutiqueServerConfig.mockTimer[key] = setInterval(() => {
            if (boutiqueServerConfig.mockCache) {
              clearInterval(boutiqueServerConfig.mockTimer[key])
              boutiqueServerConfig.mockRequestCount = null
              resolve(boutiqueServerConfig.mockCache)
            }
          }, 1e3)
        })
      }
    }
  } catch (error) {
    if (boutiqueServerConfig.mockTimer[key]) clearInterval(boutiqueServerConfig.mockTimer[key])
    boutiqueServerConfig.mockRequestCount = null
    return Promise.reject(error)
  }
}

// 图片版本号
const getImageVersion = async () => {
  const accountInfo = await getMockData()
  return accountInfo?.version || Date.now()
}
/**获取素材配置 */
const getSoureData = async (shopMerchantId, sceneType, params = {}) => {
  try {
    const res = await getEquityMaterialId({
      merchantId: shopMerchantId,
      ...params
    })
    if (res && res.id) {
      console.log(res.id, 'res.idres.idres.idres.id')
      let data = await getEquityMaterialConfig({
        id: res.id
      })
      if (data) {
        let { toolList, materialInfoList } = data,
          storageName = `source_${sceneType}_${shopMerchantId}`
        if (params.brandId && params.subBrandId) storageName += `_${params.brandId}_${params.subBrandId}`
        let insurance = materialInfoList.find(e => e.componentName == 'insurance'),
          hasEquity = toolList.find(e => e.id == insurance.id)
        if (insurance && hasEquity) {
          let configList
          try {
            configList = await findReceptionpriproConfigList({})
            uni.$storage.set('findReceptionpriproConfigList', configList)
          } catch (error) {
            configList = uni.$storage.get('findReceptionpriproConfigList')
          }
          const toolOtherList = configList.map(i => {
            return {
              id: hasEquity.id + 100 + i.id,
              shortTitle: i.productName,
              shortTitleUrl: i.procuctLog
            }
          })
          toolList = toolList.concat(toolOtherList)
          const moduleOtherList = configList.map(i => {
            return {
              id: hasEquity.id + 100 + i.id,
              title: i.productName,
              shortTitleUrl: i.procuctLog,
              productPoster: i.productPoster,
              showAlt: false,
              componentName: 'CaseCenter',
              receptionpriproCusCaseList: i.receptionpriproCusCaseList,
              hide: true,
              detailTitle: i.productName,
              thumbnail: 'https://img02.glsx.com.cn/weapp/resource/app-tape/common/qsyw.webp'
            }
          })
          materialInfoList = materialInfoList.concat(moduleOtherList)
        }
        data.toolList = await imgTransformBase64(toolList, ['shortTitleUrl'])
        data.moduleList = await imgTransformBase64(materialInfoList, ['thumbnail', 'receptionSourceDetailList', 'screenList'])
        uni.setStorageSync(storageName, {
          moduleList: data.moduleList,
          toolList: data.toolList,
          id: res.id
        })
        return Promise.resolve(data)
      } else throw false
    } else throw false
  } catch (error) {
    uni.hideLoading()
    if (error)
      uni.showToast({
        title: error,
        icon: 'none',
        duration: 2000
      })
  }
}
/**批量图片转base64 */
const imgTransformBase64 = async (imgList = [], keyList = []) => {
  return await Promise.all(
    imgList?.map(async e => {
      await Promise.all(
        Object.keys(e).map(async key => {
          if (keyList.includes(key)) {
            let isArray = Array.isArray(e[key])
            if (isArray) {
              await Promise.all(
                e[key].map(async i => {
                  await Promise.all(
                    Object.keys(i).map(async k => {
                      // i[`original_${k}`] = JSON.parse(JSON.stringify(i[k]))
                      if (k == 'detailUrl' && i[k]) i[k] = await getBase64(i[k])
                    })
                  )
                })
              )
            } else {
              if (typeof e[key] === 'string' && e[key]) {
                // e[`original_${key}`] = JSON.parse(JSON.stringify(e[key]))
                e[key] = await getBase64(e[key])
              }
              if (e[key] && typeof e[key] === 'object') {
                await Promise.all(
                  Object.keys(e[key]).map(async k => {
                    // e[key][`original_${k}`] = JSON.parse(JSON.stringify(e[key][k]))
                    if (e[key][k]) e[key][k] = await getBase64(e[key][k])
                  })
                )
              }
            }
          }
        })
      )
      return e
    })
  )
}
/**转base64 */
const getBase64 = async url => {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      success: res => {
        const base64 = `data:image/png;base64,${uni.arrayBufferToBase64(res.data)}`
        resolve(base64)
      },
      fail: err => {
        resolve(url)
        // reject(err)
      }
    })
  })
}
module.exports = {
  getImageVersion,
  getMockData,
  getBoutiqueMockData,
  findReceptionpriproConfigList,
  getSoureData,
  getEquityMaterialId,
  getEquityMaterialConfig
}
