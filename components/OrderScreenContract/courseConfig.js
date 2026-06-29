const screenList = [
  {
    title: '选必修',
    componentName: 'CourseOptionList',
    params: {
      idKey: 'required',
      options: [
        { label: '必修', value: 'required' },
        { label: '选修', value: 'optional' }
      ]
    }
  },
  {
    title: '课程类型',
    componentName: 'CourseOptionList',
    params: {
      idKey: 'courseType',
      options: [
        { label: '视频', value: 'video' },
        { label: '文档', value: 'document' }
      ]
    }
  },
  {
    title: '评分',
    componentName: 'CourseOptionList',
    params: {
      idKey: 'rating',
      options: [
        { label: '4星以上', value: '4' },
        { label: '3星以上', value: '3' }
      ]
    }
  }
]

export default { screenList }

