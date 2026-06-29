const SpritesmithPlugin = require('webpack-spritesmith')
const spritesmithFunction = data => {
  function toRpx(val) {
    return `calc(100vmin * (1173 / 768) * ${val / 2 / 2346})`
  }
  let { spritesheet, sprites } = data,
    spritesheetWidth = toRpx(spritesheet.width),
    spritesheetHeight = toRpx(spritesheet.height)
  let shared = `.sprite-icon { background-image: url(${data.sprites[0].image});background-size: ${spritesheetWidth} ${spritesheetHeight};}`
  let perSprite = sprites
    .map(sprite => {
      let { name, width, height, offset_x, offset_y } = sprite
      ;((width = toRpx(width)), (height = toRpx(height)), (offset_x = toRpx(offset_x)), (offset_y = toRpx(offset_y)))
      return `.icon-${name} { width: ${width}; height: ${height}; 
      background-position: ${offset_x} ${offset_y};}`
    })
    .join('\n')
  // let shared = `.sprite-icon { background-image: url(${
  //   data.sprites[0].image
  // });background-size: ${spritesheet.width / 2}rpx ${
  //   spritesheet.height / 2
  // }rpx;}`;
  // let perSprite = sprites
  //   .map((sprite) => {
  //     let { name, width, height, offset_x, offset_y } = sprite;
  //     return `.icon-${name} { width: ${width / 2}rpx; height: ${
  //       height / 2
  //     }rpx; background-position: ${offset_x / 2}rpx ${offset_y / 2}rpx;}`;
  //   })
  //   .join("\n");
  return `${shared}\n${perSprite}`
}
const path = require('path')
const { domain, djDomain, evaluationDomain, merchantDomain } = require('./env.js')

module.exports = {
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      // SCRM 接口代理
      '^/rop-scrm-': {
        target: 'https://183.62.222.180',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        headers: {
          Host: 'scrm.test.glsx.com.cn'
        }
      },
      // DJ 接口代理（包括 rop-dj-car-boutique、rop-dj-smartcarlife 等）
      '^/rop-dj-': {
        target: 'https://183.62.222.180',  // 使用IP地址替代域名
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug',
        headers: {
          Host: 'dj.test.glsx.com.cn'  // 保持原域名作为Host头
        }
      },
      // DJ PAD 接口代理
      '^/rop-dj-pad/': {
        target: djDomain,
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      },
      // 评估接口代理
      '^/gsc-vcp-': {
        target: evaluationDomain,
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      },
      // 商户接口代理
      '^/rop-merchants/': {
        target: merchantDomain,
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      }
    }
  },
  configureWebpack: {
    plugins: [
      new SpritesmithPlugin({
        // 引入图片文件夹
        src: {
          cwd: path.resolve(__dirname, './assets/spritesmith'),
          glob: ['*.png', '*.jpg']
        },
        // 生成图片的路径
        target: {
          image: path.resolve(__dirname, './assets/images/sprite.png'),
          // 生成SCSS
          css: [
            [
              path.resolve(__dirname, './assets/css/sprite.scss'),
              {
                format: 'function_based_template'
              }
            ]
          ]
        },
        customTemplates: {
          function_based_template: spritesmithFunction
        },
        //background引用路径
        apiOptions: {
          cssImageRef: '@/assets/images/sprite.png'
        },
        // 每个图片间距
        spritesmithOptions: {
          padding: 30
        }
      })
    ]
  },
  transpileDependencies: ['uview-ui']
}
