// utils/debounce.js
const debounce = {
  bind(el, binding) {
    // 支持函数、数组[函数, 参数...]或对象{fn: 函数, params: 参数数组, delay: 延迟时间}格式
    if (typeof binding.value !== 'function' && !Array.isArray(binding.value) && (!binding.value || typeof binding.value !== 'object')) {
      console.warn('v-debounce binding value must be a function, array or object')
      return
    }

    // 解析参数
    let fn,
      params = [],
      delay = 300
    const stopPropagation = binding.modifiers && binding.modifiers.stop

    if (typeof binding.value === 'function') {
      fn = binding.value
    } else if (Array.isArray(binding.value)) {
      ;[fn, ...params] = binding.value
    } else if (typeof binding.value === 'object') {
      fn = binding.value.fn
      params = binding.value.params || []
      delay = binding.value.delay || delay
    }

    // 如果没有提供函数，直接返回
    if (typeof fn !== 'function') {
      console.warn('v-debounce: function is required')
      return
    }

    // 获取延迟时间
    if (binding.arg) {
      delay = parseInt(binding.arg) || delay
    }

    let timer = null
    const debounceFn = function (event) {
      // 处理.stop修饰符
      if (stopPropagation && event && typeof event.stopPropagation === 'function') {
        event.stopPropagation()
      }

      if (timer) {
        clearTimeout(timer)
      }

      // 收集事件参数
      const eventArgs = arguments.length ? Array.from(arguments) : []

      timer = setTimeout(() => {
        // 合并预设参数和事件参数
        const allParams = [...params, ...eventArgs]
        fn.apply(this, allParams)
        timer = null
      }, delay)
    }

    el._debounceFn = debounceFn
    el.addEventListener('click', debounceFn)
  },

  update(el, binding) {
    // 当绑定值发生变化时重新绑定
    if (binding.value !== binding.oldValue) {
      // 移除旧的事件监听
      if (el._debounceFn) {
        el.removeEventListener('click', el._debounceFn)
        el._debounceFn = null
      }

      // 重新绑定，逻辑与bind相同
      if (typeof binding.value !== 'function' && !Array.isArray(binding.value) && (!binding.value || typeof binding.value !== 'object')) {
        console.warn('v-debounce binding value must be a function, array or object')
        return
      }

      let fn,
        params = [],
        delay = 300
      const stopPropagation = binding.modifiers && binding.modifiers.stop

      if (typeof binding.value === 'function') {
        fn = binding.value
      } else if (Array.isArray(binding.value)) {
        ;[fn, ...params] = binding.value
      } else if (typeof binding.value === 'object') {
        fn = binding.value.fn
        params = binding.value.params || []
        delay = binding.value.delay || delay
      }

      if (typeof fn !== 'function') {
        console.warn('v-debounce: function is required')
        return
      }

      if (binding.arg) {
        delay = parseInt(binding.arg) || delay
      }

      let timer = null
      const debounceFn = function (event) {
        if (stopPropagation && event && typeof event.stopPropagation === 'function') {
          event.stopPropagation()
        }

        if (timer) {
          clearTimeout(timer)
        }

        const eventArgs = arguments.length ? Array.from(arguments) : []

        timer = setTimeout(() => {
          const allParams = [...params, ...eventArgs]
          fn.apply(this, allParams)
          timer = null
        }, delay)
      }

      el._debounceFn = debounceFn
      el.addEventListener('click', debounceFn)
    }
  },

  unbind(el) {
    if (el._debounceFn) {
      el.removeEventListener('click', el._debounceFn)
      el._debounceFn = null
    }
  }
}

export default debounce
