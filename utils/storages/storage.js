export default {
  // 设置永久缓存
  set(key, value) {
    uni.setStorageSync(key, value);
  },
  // 获取永久缓存
  get(key) {
    return uni.getStorageSync(key);
  },
  // 移除永久缓存
  remove(key) {
    uni.removeStorageSync(key);
  },
  // 移除全部永久缓存
  clear() {
    uni.clearStorageSync();
  },
};