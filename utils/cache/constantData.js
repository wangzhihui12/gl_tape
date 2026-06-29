/*
 * @Author: yangming@didihu.com.cn yangming@didihu.com.cn
 * @Date: 2024-04-16 09:55:40
 * @LastEditors: yangming@didihu.com.cn yangming@didihu.com.cn
 * @LastEditTime: 2025-05-06 15:56:54
 * @FilePath: \gl-tape\utils\cache\constantData.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// export const IMG_URL = 'https://img02.glsx.com.cn/weapp/resource/miniprogram/store-assistant/'
// import util from '~/utils/util'

export const IMG_URL = 'https://img02.glsx.com.cn/weapp/resource/app-tape/'

// 缓存get方法为空的默认指定值
export const DEFAULT_GET_STORAGEKEY = ['sessionId', 'merchantId', 'userInfo']

// 缓存get方法key的对应才映射值
export const STORAGE_OBJECTKEY = {
  DEFAULT_GET_STORAGEKEY,
  mock_data: 'mock_data',
  storageFile: 'storageFile',
  userInfo: 'userInfo',
  customerInfo: 'customerInfo',
  noSignInUuid: 'noSignInUuid',
  noviceGuideStatus: 'noviceGuideStatus',
  carBrandList: 'carBrandList',
  employeeList: 'employeeList',
  recordList: 'recordList',
  preRecordList: 'preRecordList',
  preRecordId: 'preRecordId',
  preRecord: 'preRecord',
  preAudioList: 'preAudioList',
  recordSuccessList: 'recordSuccessList',
  historyList: 'historyList',
  storageVersion: 'storageVersion',
  clearVersion: 'clearVersion',
  boutique_mock_data: 'boutique_mock_data',
  findReceptionpriproConfigList: 'findReceptionpriproConfigList',
  appInfoList: 'appInfoList',
  leadPage: 'leadPage',
  recordTrackList: 'recordTrackList',
  beisenToken: 'beisenToken',
  noticeTopInfo: 'noticeTopInfo',
  studyCenterPermission: 'studyCenterPermission',
  caseInfo: 'caseInfo',
  boutique_YQorderSetting: 'boutique_YQorderSetting',
  sessionId: 'sessionId',
  createAllGoodsFlag: 'createAllGoodsFlag',
  baseSceneCode: 'baseSceneCode', //员工场景小分类
  storeBaseSceneCode: 'storeBaseSceneCode', //门店场景小分类
}
