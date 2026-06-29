import dayjs from 'dayjs'
export default {
  data () {
    return {
      systemInfo: {},
      timer: null,
      id: null
    }
  },
  onLoad (options) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const { row } = options
    const _row = JSON.parse(row)
    console.log(_row)
    this.systemInfo = _row
    if (_row.actualSendTime) this.systemInfo.time = dayjs(new Date(_row.actualSendTime)).format("YYYY-MM-DD HH:mm:ss")
    if (_row.moduleType != 8) { // 策略企业通知不需要埋点
      this.addTrack(_row)
      this.timer = setInterval(() => {
        this.leaveTrack(this.id)
      }, 3000)
    }
    
  },
  methods: {
     // 进入埋点事件
     addTrack(row) {
      try {
        const {phone} = uni.$storage.get("userInfo")
        const entryData = {
          taskId: row.id,
          phoneNumber: phone
        }
        uni.$api.commonApi.addSystemInfo(entryData).then(res => {
          if (res) {
            this.leaveTrack(res)
            this.id = res
          }
        })
      } catch (error) {
        console.error('进入埋点发生错误', error);
      }
    },
    // 离开埋点事件
    async leaveTrack(id) {
      if (!id) return
      await uni.$api.commonApi.leaveSystemInfo({id})
    }
  },
  onUnload () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
