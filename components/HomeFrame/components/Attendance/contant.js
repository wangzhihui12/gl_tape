export const TYPE_LIST = [
  {
    value: '-1',
    name: '异常',
    class: 'red'
  },
  {
    value: 1,
    name: '正常',
    class: ''
  },
  {
    value: 2,
    name: '加班',
    class: 'blue'
  },
  {
    value: 3,
    name: '有请假',
    class: 'purple'
  },
  {
    value: 4,
    name: '请休假',
    class: 'gray'
  }
]
export const DAY_STATE = {
  '-1': '异常',
  '1': '正常',
  '2': '加班',
  '3': '有请假',
  '4': '请休假'
}
export const CLOCK_STATE = {
  0: '正常',
  1: '迟到',
  2: '早退',
  3: '缺卡'
}
export const ABNORMAL_LIST = [
  {
    value: 0,
    name: '正常',
    class: 'normal'
  },
  {
    value: 1,
    name: '迟到',
    class: 'late'
  },
  {
    value: 2,
    name: '早退',
    class: 'late'
  },
  {
    value: 3,
    name: '缺卡',
    class: 'missing-card'
  }
]