export default {
  state () {
    return {
      status: false
    };
  },
  mutations: {
  },
  actions: {
    openUpdateModal ({ state }) {
      state.status = true
    },
  },
};
