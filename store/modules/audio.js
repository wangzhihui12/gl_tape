/*
 * @Description:
 * @Author: huyue
 * @Date: 2024-04-07 18:15:11
 * @LastEditors: limin
 * @LastEditTime: 2025-01-03 21:26:31
 */
// import { setToken, getToken, removeToken } from '@/utils/token';;
import utils from '@/utils/utils'
// const recorderManager = uni.getRecorderManager();
export default {
  namespaced: true,
  state() {
    return {
      booksList: [],
      audioList: [],
      receptionStatus: '',
      endReasonType: 0,
      perRecordNumber: 0,
      audioInfo: {
        audioStatus: '',
        endReasonType: 0,
        receptionStartTime: '',
        receptionEndTime: ''
      }
    }
  },
  mutations: {
    setAudioInfo(state, data) {
      if (data.audioStatus == 'start') {
        data.receptionStartTime = utils.convertDateTimeFormat(new Date(), '/')
        data.receptionEndTime = ''
      }
      if (data.audioStatus == 'end') {
        data.receptionEndTime = utils.convertDateTimeFormat(new Date(), '/')
      }
      state.audioInfo = Object.assign(state.audioInfo, data)
    },
    setReceptionStatus(state, data) {
      console.log(data,'===')
      state.receptionStatus = data
    },
    setAudioList(state, data) {
      state.audioList = data
    },
    setBooks(state, data) {
      state.booksList = data
    },
    setPerRecordNumber(state, data) {
      state.perRecordNumber = data
    }
  },
  actions: {
    setPerRecordNumber({ commit }, value) {
      commit('setPerRecordNumber', value)
    }
    // startAudio({ commit, state, dispatch }) {
    //   if (state.isStart) return;
    //   commit("setAudioStart", true);
    //   commit("setAudioList", []);
    //   commit("setAudioEnd", false);
    //   recorderManager.start({
    //     duration: 20000,
    //   });
    //   recorderManager.onStop(async (res) => {
    //     console.log("结束录音");
    //     console.log(state.isEnd, "this.isEnd");
    //     if (!state.isEnd) {
    //       uni.getRecorderManager().start({
    //         duration: 20000,
    //       });
    //     }
    //     const result = await upload(res.tempFilePath);
    //     const storageFile = [...state.audioList, result];
    //     uni.$storage.set("storageFile", storageFile);
    //     commit("setAudioList", storageFile);
    //     if (state.isEnd) {
    //       console.log("上传语音");
    //       dispatch("uploadVoice", storageFile);
    //     }
    //     return true;
    //   });
    // },
    // stopAudio({ commit, state }) {
    //   commit("setAudioStart", false);
    //   commit("setAudioEnd", true);
    //   recorderManager.stop();
    // },
    // async uploadVoice({ commit, state }, tempFilePath) {
    //   const { shopMerchantId, phone } = uni.$storage.get("userInfo"),
    //     { customerName, phoneNumber, salesUuid, carModel } =
    //       store.state.user.customerInfo,
    //     receptionCustomerPaySourceList = state.booksList.map((item) => {
    //       return {
    //         id: item.id,
    //         sourceType: item.id,
    //         sourceUrl: item.imgUrl,
    //       };
    //     }),
    //     params = {
    //       carModel,
    //       endReasonType: state.endReasonType, //原因 1.异常 0.正常
    //       customerName,
    //       phoneNumber,
    //       loginPhone: phone,
    //       salesUuid,
    //       receptionStatus: state.receptionStatus, //接待结果 1.成交 0.战败
    //       recordUrlList: tempFilePath,
    //       receptionStartTime: state.receptionStartTime,
    //       receptionEndTime: state.receptionEndTime,
    //       receptionCustomerPaySourceList, //1.付款凭证文件路径 2.客户购车发票文件路径 3.客户延保合同文件路径
    //       merchantId: shopMerchantId,
    //     };
    //   commit("setBooks", []);
    //   console.log(params);
    //   if (customerName && phoneNumber && salesUuid && carModel)
    //     uni.$api.commonApi.saveRecCustomer(params).then((res) => {
    //       console.log(res);
    //     });
    //   store.dispatch("clearCustomerInfo");
    //   commit("setReceptionStatus", 1);
    //   commit("setReceptionStatus", 0);
    //   uni.$storage.set("storageFile", "");
    // },
  }
}
