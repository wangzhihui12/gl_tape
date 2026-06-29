export default {
  state() {
    return {
      isInBackgound: false,
      activityWindowPopStatus: 0 , //0 无次数 1 有次数 2打开弹框
    }
  },
  mutations: {
    SET_BACKGROUND_STATE(state, value) {
      state.isInBackgound = value
    },
    SET_ACTIVITY_WINDOW_POP_COUNT(state, value){
      state.activityWindowPopStatus = value
    }
  },
  actions: {
    setBackgroundState({ commit }, value) {
      uni.$logger.local.info(`【==== ${['切回', '切出'][+value]} ====】 APP`)
      commit('SET_BACKGROUND_STATE', value)
    },

    setActivityWindowPopCount({ commit }, value){
      commit('SET_ACTIVITY_WINDOW_POP_COUNT', value)
    }
  }
}
