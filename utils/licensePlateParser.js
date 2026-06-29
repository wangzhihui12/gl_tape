// 车牌号省市代码映射表
const licenseData = {
  京: { name: '北京', cities: { A: '城区', B: '出租车', C: '城区', E: '城区', F: '城区', G: '远郊区', H: '远郊区', J: '远郊区', K: '城区', L: '城区', M: '城区', N: '城区', P: '城区', Q: '城区' } },
  津: { name: '天津', cities: { A: '公交/公安', B: '城区', C: '城区', D: '城区', E: '出租车', F: '城区', G: '城区', H: '城区' } },
  沪: { name: '上海', cities: { A: '市区', B: '市区', C: '郊区', D: '市区', E: '市区', F: '市区', G: '市区', H: '市区', J: '市区', K: '市区', L: '市区', M: '市区', N: '市区', R: '崇明/长兴/横沙' } },
  渝: { name: '重庆', cities: { A: '市区', B: '万州', C: '永川', D: '市区', F: '涪陵', G: '黔江', H: '武隆' } },
  冀: { name: '河北', cities: { A: '石家庄', B: '唐山', C: '秦皇岛', D: '邯郸', E: '邢台', F: '保定', G: '张家口', H: '承德', J: '沧州', R: '廊坊', T: '衡水' } },
  豫: { name: '河南', cities: { A: '郑州', B: '开封', C: '洛阳', D: '平顶山', E: '安阳', F: '鹤壁', G: '新乡', H: '焦作', J: '濮阳', K: '许昌', L: '漯河', M: '三门峡', N: '商丘', P: '周口', Q: '驻马店', R: '南阳', S: '信阳', U: '济源' } },
  云: { name: '云南', cities: { A: '昆明', C: '昭通', D: '曲靖', E: '楚雄', F: '玉溪', G: '红河', H: '文山', J: '普洱', K: '西双版纳', L: '大理', M: '保山', N: '德宏', P: '丽江', Q: '怒江', R: '迪庆', S: '临沧' } },
  辽: { name: '辽宁', cities: { A: '沈阳', B: '大连', C: '鞍山', D: '抚顺', E: '本溪', F: '丹东', G: '锦州', H: '营口', J: '阜新', K: '辽阳', L: '盘锦', M: '铁岭', N: '朝阳', P: '葫芦岛' } },
  黑: { name: '黑龙江', cities: { A: '哈尔滨', B: '齐齐哈尔', C: '牡丹江', D: '佳木斯', E: '大庆', F: '伊春', G: '鸡西', H: '鹤岗', J: '双鸭山', K: '七台河', L: '松原', M: '绥化', N: '黑河', P: '大兴安岭' } },
  湘: { name: '湖南', cities: { A: '长沙', B: '株洲', C: '湘潭', D: '衡阳', E: '邵阳', F: '岳阳', G: '张家界', H: '益阳', J: '常德', K: '娄底', L: '郴州', M: '永州', N: '怀化', U: '湘西' } },
  皖: { name: '安徽', cities: { A: '合肥', B: '芜湖', C: '蚌埠', D: '淮南', E: '马鞍山', F: '淮北', G: '铜陵', H: '安庆', J: '黄山', K: '阜阳', L: '宿州', M: '滁州', N: '六安', P: '宣城', Q: '池州', R: '亳州' } },
  鲁: { name: '山东', cities: { A: '济南', B: '青岛', C: '淄博', D: '枣庄', E: '东营', F: '烟台', G: '潍坊', H: '济宁', J: '泰安', K: '威海', L: '日照', M: '滨州', N: '德州', P: '聊城', Q: '临沂', R: '菏泽', S: '莱芜', U: '青岛增补', V: '潍坊增补' } },
  新: { name: '新疆', cities: { A: '乌鲁木齐', B: '昌吉', C: '石河子', D: '奎屯', E: '博尔塔拉', F: '伊犁', G: '塔城', H: '阿勒泰', J: '克拉玛依', K: '吐鲁番', L: '哈密', M: '巴音郭楞', N: '阿克苏', P: '克孜勒苏', Q: '喀什', R: '和田' } },
  苏: { name: '江苏', cities: { A: '南京', B: '无锡', C: '徐州', D: '常州', E: '苏州', F: '南通', G: '连云港', H: '淮安', J: '盐城', K: '扬州', L: '镇江', M: '泰州', N: '宿迁', U: '苏州增补' } },
  浙: { name: '浙江', cities: { A: '杭州', B: '宁波', C: '温州', D: '绍兴', E: '湖州', F: '嘉兴', G: '金华', H: '衢州', J: '台州', K: '丽水', L: '舟山' } },
  赣: { name: '江西', cities: { A: '南昌', B: '赣州', C: '宜春', D: '吉安', E: '上饶', F: '抚州', G: '九江', H: '景德镇', J: '萍乡', K: '新余', L: '鹰潭' } },
  鄂: { name: '湖北', cities: { A: '武汉', B: '黄石', C: '十堰', D: '荆州', E: '宜昌', F: '襄阳', G: '鄂州', H: '荆门', J: '黄冈', K: '孝感', L: '咸宁', M: '仙桃', N: '潜江', P: '神农架', Q: '天门', R: '恩施' } },
  桂: { name: '广西', cities: { A: '南宁', B: '柳州', C: '桂林', D: '梧州', E: '北海', F: '崇左', G: '来宾', H: '桂林', J: '贺州', K: '玉林', L: '百色', M: '河池', N: '钦州', P: '防城港', R: '贵港' } },
  甘: { name: '甘肃', cities: { A: '兰州', B: '嘉峪关', C: '金昌', D: '白银', E: '天水', F: '酒泉', G: '张掖', H: '平凉', J: '庆阳', K: '定西', L: '陇南', M: '临夏', N: '甘南' } },
  晋: { name: '山西', cities: { A: '太原', B: '大同', C: '阳泉', D: '长治', E: '晋城', F: '朔州', H: '忻州', J: '吕梁', K: '晋中', L: '临汾', M: '运城' } },
  蒙: { name: '内蒙古', cities: { A: '呼和浩特', B: '包头', C: '乌海', D: '赤峰', E: '呼伦贝尔', F: '兴安盟', G: '通辽', H: '锡林郭勒', J: '乌兰察布', K: '鄂尔多斯', L: '巴彦淖尔', M: '阿拉善' } },
  陕: { name: '陕西', cities: { A: '西安', B: '铜川', C: '宝鸡', D: '咸阳', E: '渭南', F: '汉中', G: '安康', H: '商洛', J: '延安', K: '榆林', V: '杨凌' } },
  吉: { name: '吉林', cities: { A: '长春', B: '吉林', C: '四平', D: '辽源', E: '通化', F: '白山', G: '白城', H: '延边', J: '松原' } },
  闽: { name: '福建', cities: { A: '福州', B: '厦门', C: '宁德', D: '莆田', E: '泉州', F: '漳州', G: '龙岩', H: '三明', J: '南平' } },
  贵: { name: '贵州', cities: { A: '贵阳', B: '六盘水', C: '遵义', D: '安顺', E: '铜仁', F: '毕节', G: '黔西南', H: '黔东南', J: '黔南' } },
  粤: { name: '广东', cities: { A: '广州', B: '深圳', C: '珠海', D: '汕头', E: '佛山', F: '韶关', G: '湛江', H: '肇庆', J: '江门', K: '茂名', L: '惠州', M: '梅州', N: '汕尾', P: '河源', Q: '阳江', R: '清远', S: '东莞', T: '中山', U: '潮州', V: '揭阳', W: '云浮', X: '顺德', Y: '南海', Z: '港澳' } },
  青: { name: '青海', cities: { A: '西宁', B: '海东', C: '海北', D: '黄南', E: '海南州', F: '果洛', G: '玉树', H: '海西' } },
  藏: { name: '西藏', cities: { A: '拉萨', B: '昌都', C: '山南', D: '日喀则', E: '那曲', F: '阿里', G: '林芝' } },
  川: { name: '四川', cities: { A: '成都', B: '绵阳', C: '自贡', D: '攀枝花', E: '泸州', F: '德阳', G: '成都增补', H: '广元', J: '遂宁', K: '内江', L: '乐山', M: '资阳', Q: '宜宾', R: '南充', S: '达州', T: '雅安', U: '阿坝', V: '甘孜', W: '凉山', X: '广安', Y: '巴中', Z: '眉山' } },
  宁: { name: '宁夏', cities: { A: '银川', B: '石嘴山', C: '吴忠', D: '固原', E: '中卫' } },
  琼: { name: '海南', cities: { A: '海口', B: '三亚', C: '三沙', D: '五指山', E: '洋浦', F: '儋州' } }
}

/**
 * 解析车牌省市
 * @param {string} plateStr - 车牌号 (如: "粤B12345")
 * @returns {object} { province, city, success }
 */
export function getPlateLocation(plateStr) {
  // 基础校验
  if (!plateStr || typeof plateStr !== 'string' || plateStr.length < 2) {
    return { province: '', city: '', success: false }
  }

  const pChar = plateStr.charAt(0) // 提取省份简称：粤
  const cChar = plateStr.charAt(1).toUpperCase() // 提取地市代码：B

  const provinceInfo = licenseData[pChar]

  if (provinceInfo) {
    const cityName = provinceInfo.cities[cChar]
    if (cityName) {
      // 处理省份名称，添加"省"或"市"后缀
      let province = provinceInfo.name
      // 直辖市不需要加"省"，只需要加"市"
      const municipalities = ['北京', '上海', '天津', '重庆']
      if (municipalities.includes(province)) {
        province = province + '市'
      } else if (province === '内蒙古') {
        province = province + '自治区'
      } else if (province === '新疆' || province === '西藏' || province === '广西' || province === '宁夏') {
        // 其他自治区，根据习惯可能需要加"自治区"或"省"，这里统一加"省"
        province = province + '省'
      } else {
        province = province + '省'
      }

      // 处理城市名称，添加"市"后缀（如果还没有）
      let city = cityName
      // 特殊情况：不需要加"市"的情况
      // 1. 已经以"市"结尾
      // 2. 包含特殊关键词：城区、市区、郊区、出租车、公交、增补
      // 3. 包含斜杠（如：崇明/长兴/横沙）
      const specialKeywords = ['城区', '市区', '郊区', '出租车', '公交', '增补']
      const isSpecialCase = specialKeywords.some(keyword => city.includes(keyword)) || city.includes('/')

      // 普通城市名称添加"市"后缀
      if (!city.endsWith('市') && !isSpecialCase) {
        city = city + '市'
      }

      return {
        province: province,
        city: city,
        success: true
      }
    }
  }

  return { province: '', city: '', success: false }
}
