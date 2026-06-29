// store/plugins/activityTracker.js
import utils from '@/utils/utils'

/**
 * 自动监听用户活跃状态的 Vuex 插件
 * 当指定的 mutation 发生时，触发 reset_timeout 事件
 */
export default function createActivityTracker(mutationsToWatch = []) {
  // 使用 utils.throttle 限制触发频率，避免高频 mutation 导致过多 emit
  const notifyActivity = utils.throttle(() => {
    uni.$emit('reset_timeout')
  }, 1000)

  return store => {
    store.subscribe((mutation, state) => {
      // 如果 mutation 在监控列表中，则触发活跃通知
      if (mutationsToWatch.includes(mutation.type)) {
        notifyActivity()
      }
    })
  }
}
