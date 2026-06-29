import utils from '@/utils/utils.js'
import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update-nvue.js'
export default {
  methods: {
    checkVersion(ver = plus?.runtime?.version) {
      const { textList, tempFileURL, version } = uni.$storage.get('mock_data')
      const res = utils.compareVersions(ver, version)
      if (res > -1) {
        return res
      }
      const e = {
        result: {
          is_silently: false,
          is_mandatory: true,
          name: '',
          title: '',
          contents: textList.join('\n'),
          version: version,
          url: tempFileURL,
          stable_publish: true
        }
      }
      checkUpdate(e)
      return res
    }
  }
}
