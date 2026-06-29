/*
 * @Author: 前端 qianduan01@didihu.com.cn
 * @Date: 2024-12-26 10:03:54
 * @LastEditors: cenchengwei@foreverht.com
 * @LastEditTime: 2026-04-08 15:23:08
 * @FilePath: /gl_tape/mixin/record/recorder.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import RecordService from '../../utils/recordManager/RecordService'
import { mapMutations, mapState, mapGetters } from 'vuex'
export default {
  provide() {
    return {
      getRecorder: () => this.recordService?.getRecorder()
    }
  },
  data() {
    return {
      recordService: null
    }
  },
  async mounted() {
    // 获取 RecordService 单例 (已在构造函数中自动初始化)
    this.recordService = RecordService.getInstance()
  },
  methods: {
    ...mapMutations('audio', ['setReceptionStatus', 'setBooks']),
    //开始录音
    async startAudio(isInitData = true) {
      return this.recordService.startAudio(isInitData)
    },

    //结束接待
    async stopAudio(isNotSave = false) {
      return this.recordService.stopAudio(isNotSave)
    },
    stop() {
      this.recordService.stop()
    },
    // 代理权限检查
    async isPermission(hintText) {
      return await this.recordService.isPermission(hintText)
    },
    updateCustomerInfo(data){
      this.recordService.updateCustomerInfo(data)
    }
  }
}
