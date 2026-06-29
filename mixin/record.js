export default {
  data () {
    return {
      list: [],
      dateIndex: 0,
      pageNum: 1,
      total: 0,
      flag: true,
      nothing: false,
      pageSize: 18,
      total: 0,
      isEnd: false
    };
  },
  mounted () { },
  methods: {
    async getList (api, params) {
      try {
        uni.showLoading({
          mask: true
        });
        const { list, total } = await uni.$api.boutiqueApi[api](params);
        uni.hideLoading();
        this.list = [...(params.pageNum == 1 ? [] : this.list), ...list];
        this.flag = true;
        this.total = total;
      } catch (error) {
        uni.hideLoading()
        this.flag = true;
        this.isEnd = true
        throw error;
      }
    },
  },
};
