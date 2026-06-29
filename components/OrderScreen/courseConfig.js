const screenList = [
  {
    title: '选必修',
    componentName: 'CourseOptionList',
    params: {
      idKey: 'planCourseType',
      options: [
        { label: '必修', value: 1 },
        { label: '选修', value: 2 }
      ]
    }
  },
  {
    title: '课程类型',
    componentName: 'CourseOptionList',
    params: {
      idKey: 'courseFileType',
      options: [
        { label: '视频', value: 10 },
        { label: '音频', value: 80 },
        { label: '混合', value: 20 },
        { label: '文档', value: 30 },
        { label: 'H5', value: 40 },
        { label: 'URL', value: 70 },
        { label: '图文', value: 120 }
      ]
    }
  },
  {
    title: '评分',
    componentName: 'CourseOptionList',
    params: {
      idKey: 'totalStar',
      options: [
        { label: '4星以上', value: 8 },
        { label: '3星以上', value: 6 }
      ]
    }
  }
]

export default { screenList }

