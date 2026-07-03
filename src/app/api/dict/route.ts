import { NextRequest, NextResponse } from 'next/server';

const DICT_MAP: Record<string, string[]> = {
  insuranceCompanies: ['中国人保', '中国平安', '人保财险', '太平洋保险'],
  insuranceProductTypes: ['国内运输险', '进口运输险', '出口运输险'],
  transportModes: ['公路运输', '水路运输', '航空运输'],
  containerTypes: ['普通集装箱', '开顶集装箱', '框架集装箱', '冷藏集装箱', '平板卡车', '其他'],
  transportRequirements: ['防震', '防倾斜', '防尘', '温控', '无'],
  containerOptions: ['是', '否'],
  packageTypes: ['散装', '裸装', '球状罐类', '包/袋', '纸制或纤维板制盒/箱', '木制或竹藤等植物性材料制盒/箱', '其他材料制盒/箱', '纸制或纤维板制桶', '木制或竹藤等植物性材料制桶', '其他材料制桶', '再生木托', '天然木托', '植物性辅垫材料', '其他包装'],
  goodsNatures: ['新货', '旧货', '危险货物'],
  insuranceCategories: ['保税返库', '非保入库', '保税流转入库', '进境申报入库', '实物出库'],
  insurancePolicyStatuses: ['已承保', '已批改', '待承保'],
  approvalStatuses: ['草稿', '待发起', '待审批', '审批通过', '审批拒绝'],
  claimStatuses: ['待审批', '审批通过', '审批拒绝', '已确认'],
  currencies: ['人民币', '美元', '欧元', '英镑', '日元', '港元', '台币', '韩元', '新加坡元', '加拿大元', '澳大利亚元', '瑞士法郎', '澳门元', '马来西亚林吉特'],
  countries: ['中国', '美国', '日本', '韩国', '德国', '英国', '新加坡', '马来西亚', '澳大利亚', '加拿大'],
  countryCodes: ['国内(Domestic)', '国际(International)'],
  markupRatios: ['发票金额原值100%', '发票金额原值110%'],
  ports: ['广州白云国际机场（中国）', '上海浦东国际机场（中国）', '深圳宝安国际机场（中国）', '连云港（中国）', '首尔（韩国）', '天津新港（中国）', '宁波舟山港（中国）', '青岛港（中国）'],
  provinces: ['上海市', '广东省', '辽宁省', '安徽省', '北京市', '江苏省', '浙江省', '湖北省', '福建省'],
  cities: ['上海市', '深圳市', '广州市', '东莞市', '大连市', '沈阳市', '合肥市', '芜湖市', '北京市', '南京市', '苏州市', '昆山市', '杭州市', '宁波市', '武汉市', '厦门市', '福州市'],
  districts: ['浦东新区', '黄浦区', '徐汇区', '南山区', '福田区', '宝安区', '天河区', '白云区', '长安镇', '金州区', '甘井子区', '铁西区', '蜀山区', '包河区', '镜湖区', '海淀区', '朝阳区', '江宁区', '工业园区', '玉山镇', '滨江区', '北仑区', '洪山区', '光谷区', '思明区', '鼓楼区'],
};

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  if (!type || !DICT_MAP[type]) {
    return NextResponse.json({ success: true, data: Object.keys(DICT_MAP) });
  }
  return NextResponse.json({ success: true, data: DICT_MAP[type] });
}
