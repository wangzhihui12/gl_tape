const target = ['ip', 'dev', 'uat', 'prod', 'beta']
const index = 3
/**
 * 
0本地 
1开发 
2测试
3生产
4预发布
 */
const secretKey = {
  ip: {},
  dev: {
    sso: {
      appKey: '8b31ae1009ccb0f96130ca4bd90e3d89',
      secret: '02d60f17ae714872845d2aa9d3b087e109ccb0f96130ca4b'
    }
  },
  uat: {
    sso: {
      appKey: '8b31ae1009ccb0f96130ca4bd90e3d89',
      secret: '02d60f17ae714872845d2aa9d3b087e109ccb0f96130ca4b'
    }
  },
  prod: {
    sso: {
      appKey: '8b31ae1009ccb0f96130ca4bd90e3d89',
      secret: '02d60f17ae714872845d2aa9d3b087e109ccb0f96130ca4b'
    }
  },
  beta: {
    sso: {
      appKey: '8b31ae1009ccb0f96130ca4bd90e3d89',
      secret: '02d60f17ae714872845d2aa9d3b087e109ccb0f96130ca4b'
    }
  }
}[target[index]]

const domain = {
  // ip: 'http://192.168.2.94:8558',
  // ip: 'http://192.168.2.3:8315',
  ip: 'http://192.168.1.104:8292',
  /**登录： 192.168.2.3:8315
  商城： 192.168.2.3:8558 */
  dev: 'https://scrm.dev.glsx.com.cn',
  uat: 'https://scrm.test.glsx.com.cn',
  beta: 'https://scrm.beta.glsx.com.cn',
  prod: 'https://scrm.glsx.com.cn'
}[target[index]]

const djDomain = {
  // ip: 'http://dj.dev.glsx.com.cn',
  ip: 'http://192.168.1.96:8292',
  dev: 'http://dj.dev.glsx.com.cn',
  beta: 'https://dj.beta.glsx.com.cn', //预发布 appid: wx9f91c1ec493eb425
  uat: 'https://dj.test.glsx.com.cn', //测试 appid: wxe10067a63c1856ac
  prod: 'https://dj.glsx.com.cn',
  pet: 'https://cdptest.glsx.com.cn' //压测 appid: wx7ce755e425603084
}[target[index]]

const evaluationDomain = {
  ip: 'http://192.168.1.221:5003',
  // ip: 'http://192.168.2.80:8558',
  dev: 'http://gsc.dev.glsx.com.cn',
  beta: 'https://gsc.beta.glsx.com.cn', //预发布 appid: wx9f91c1ec493eb425
  uat: 'http://gsc.test.glsx.com.cn', //测试 appid: wxe10067a63c1856ac
  prod: 'https://gsc.glsx.com.cn',
  pet: 'https://cdptest.glsx.com.cn' //压测 appid: wx7ce755e425603084
}[target[index]]

const merchantDomain = {
  ip: 'http://rop-merchant.dev.glsx.com.cn',
  dev: 'http://rop-merchant.dev.glsx.com.cn',
  beta: 'https://rop-merchant.beta.glsx.com.cn',
  uat: 'https://rop-merchant.test.glsx.com.cn',
  prod: 'https://commodity.glsx.com.cn',
  pet: ''
}[target[index]]

/** 二手车检测报告 WebView H5 入口（与 target / index 一致：0 本地 1 开发 2 测试 3 生产 4 预发布） */
const venusUsedcarH5BaseUrl = {
  ip: 'http://192.168.1.139:8082/home',
  dev: 'http://192.168.1.139:8082/home',
  uat: 'https://aus.test.glsx.com.cn/venus-usedcar-h5/home',
  beta: 'https://aus.test.glsx.com.cn/venus-usedcar-h5/home',
  prod: 'https://aus.glsx.com.cn/venus-usedcar-h5/home'
}[target[index]]

/** 二手车车况信息 WebView H5（vehicle-list 查询参数在 inspectionReport 页拼接） */
const venusUsedcarH5CarInfoBaseUrl = {
  ip: 'http://192.168.1.139:8082/vehicle-list',
  dev: 'http://192.168.1.139:8082/vehicle-list',
  uat: 'https://aus.test.glsx.com.cn/venus-usedcar-h5/vehicle-list',
  beta: 'https://aus.test.glsx.com.cn/venus-usedcar-h5/vehicle-list',
  prod: 'https://aus.glsx.com.cn/venus-usedcar-h5/vehicle-list'
}[target[index]]

const djSecretKey = {
  ip: { appKey: '48e5e13229b82c1b4e6e8c96151f0637', secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b' },
  dev: {
    appKey: '48e5e13229b82c1b4e6e8c96151f0637',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b'
  },
  uat: {
    appKey: '48e5e13229b82c1b4e6e8c96151f0637',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b'
  },
  beta: {
    appKey: '48e5e13229b82c1b4e6e8c96151f0637',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b'
  },
  prod: {
    appKey: 'd7ffc3346fc9a45bccaaa35300d59022',
    secret: '4bc07f8868374c49a4661d603377e3106fc9a45bccaaa353'
  },
  pet: {
    appKey: 'd7ffc3346fc9a45bccaaa35300d59022',
    secret: '4bc07f8868374c49a4661d603377e3106fc9a45bccaaa353'
  }
}[target[index]]

const signSecretKey = {
  ip: {
    appKey: 'App_PromoteBusiness',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b',
    carBasrUrl: 'http://qcdidicb.glsx.com.cn/router',
    pdfUrl: 'https://jinrong-huidan-test.oss-cn-shenzhen.aliyuncs.com/testdev/8981c8ca-8b30-436e-bb17-82fb6a53a3c4%E4%BA%8C%E6%89%8B%E8%BD%A6%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE.pdf'
  },
  dev: {
    appKey: 'App_PromoteBusiness',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b',
    carBasrUrl: 'http://qcdidicb.glsx.com.cn/router',
    pdfUrl: 'https://jinrong-huidan-test.oss-cn-shenzhen.aliyuncs.com/testdev/8981c8ca-8b30-436e-bb17-82fb6a53a3c4%E4%BA%8C%E6%89%8B%E8%BD%A6%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE.pdf'
  },
  uat: {
    appKey: 'App_PromoteBusiness',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b',
    carBasrUrl: 'http://qcdidicb.glsx.com.cn/router',
    pdfUrl: 'https://jinrong-huidan-test.oss-cn-shenzhen.aliyuncs.com/testdev/8981c8ca-8b30-436e-bb17-82fb6a53a3c4%E4%BA%8C%E6%89%8B%E8%BD%A6%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE.pdf'
  },
  beta: {
    appKey: 'App_PromoteBusiness',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b',
    carBasrUrl: 'http://didicb.glsx.com.cn/router',
    pdfUrl: 'https://dj-oss-fastdfs-release.oss-cn-shenzhen.aliyuncs.com/release/3b7558fa-8b73-48ce-af40-7b853b0ea7de%E4%BA%8C%E6%89%8B%E8%BD%A6%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE.pdf?wework_cfm_code=MvGt9rGpf0SNZt3fX0sBRZyHAe4qyfG0tz%2BFurp9RbBYoiLzPGcBycaKYEJM76NISOqT4SHJWZi8VU6YBosMk4ZDmdsk7bDma%2FQOkR8GLN7rZHtT3dOTFpQSKB3yR45vv%2BxKpsogpxQr7pO%2BtIwK6JWcEobZT%2FYnTEzlDwnhdbAt2emEro5iNhhuIIqDJiTM9pmgchS7G%2F77HbSGCNpq7oI%3D'
  },
  prod: {
    appKey: 'App_PromoteBusiness',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b',
    carBasrUrl: 'http://didicb.glsx.com.cn/router',
    pdfUrl: 'https://dj-oss-fastdfs-release.oss-cn-shenzhen.aliyuncs.com/release/3b7558fa-8b73-48ce-af40-7b853b0ea7de%E4%BA%8C%E6%89%8B%E8%BD%A6%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE.pdf?wework_cfm_code=MvGt9rGpf0SNZt3fX0sBRZyHAe4qyfG0tz%2BFurp9RbBYoiLzPGcBycaKYEJM76NISOqT4SHJWZi8VU6YBosMk4ZDmdsk7bDma%2FQOkR8GLN7rZHtT3dOTFpQSKB3yR45vv%2BxKpsogpxQr7pO%2BtIwK6JWcEobZT%2FYnTEzlDwnhdbAt2emEro5iNhhuIIqDJiTM9pmgchS7G%2F77HbSGCNpq7oI%3D'
  },
  pet: {
    appKey: 'App_PromoteBusiness',
    secret: 'c24619ed7fef02a0ae16328146bca5f97cc6493957a2137b',
    carBasrUrl: 'http://qcdidicb.glsx.com.cn/router',
    pdfUrl: 'https://jinrong-huidan-test.oss-cn-shenzhen.aliyuncs.com/testdev/8981c8ca-8b30-436e-bb17-82fb6a53a3c4%E4%BA%8C%E6%89%8B%E8%BD%A6%E8%BD%AC%E8%AE%A9%E5%8D%8F%E8%AE%AE.pdf'
  }
}[target[index]]

const pathEnum = {
  sso: '/rop-scrm-sso/',
  shopmall: '/rop-scrm-shopmall/',
  coupon: '/rop-scrm-coupon/',
  carlife: '/rop-scrm-carlife/',
  live: '/rop-scrm-live/',
  equity: '/rop-scrm-equity/',
  entmicro: '/rop-scrm-entmicro/',
  wechat: '/rop-scrm-wechat/',
  boutiquecoupon: '/rop-scrm-boutiquecoupon/',
  material: '/rop-scrm-marketing/', //素材
  sop: '/rop-scrm-sop/',
  customercollect: '/rop-scrm-bigdatautil/',
  mindworkplate: '/rop-dj-smartcarlife/',
  drac: '/rop-scrm-entmicro/',
  busassistant: '/rop-scrm-busassistant/',
  boutique: '/rop-dj-car-boutique/',
  merchants: '/rop-merchants/',
  pad: '/rop-dj-pad/',
  clue: '/rop-scrm-clue/',
  evaluation: '/gsc-vcp-pad-facade',
  staffMiniprogram: '/rop-dj-staff-miniprogram/'
}
const CONFIG_ENV_MAP = {
  0: 'ip',
  1: 'develop',
  2: 'test',
  3: 'production',
  4: 'beta'
}
module.exports = {
  index,
  domain,
  pathEnum,
  secretKey,
  env: CONFIG_ENV_MAP[index],
  djDomain,
  merchantDomain,
  djSecretKey,
  signSecretKey,
  evaluationDomain,
  venusUsedcarH5BaseUrl,
  venusUsedcarH5CarInfoBaseUrl
}
