/* ============================================================
   领域包（domain packs）
   —— 画像里的「举例取材」决定课程、练习、实操台和 SQLite 演示库
   —— 课程源文件以一套内部模板编写，渲染时按领域包实时改写
   —— 不依赖模型和网络，切换画像立即生效
   ============================================================ */

/** 内部模板的商品表（用户看不到这些原始值） */
const CANON_ITEMS = [
  { code: 'SKU-001', name: '蓝牙耳机', spec: 'TWS-40h', brand: '声阔', amount: 128000, category: '智能穿戴', date: '2023-04-12', status: '在用' },
  { code: 'SKU-002', name: '智能手表', spec: 'Watch S2', brand: '索尼', amount: 456000, category: '数码配件', date: '2022-11-03', status: '在用' },
  { code: 'SKU-003', name: '便携音箱', spec: 'SoundBox mini', brand: '小米', amount: 86000, category: '智能穿戴', date: '2021-06-20', status: '维修' },
  { code: 'SKU-004', name: '机械键盘', spec: 'ES-20-240', brand: '苏州苏试', amount: 372000, category: '电脑外设', date: '2023-09-15', status: '在用' },
  { code: 'SKU-005', name: '无线耳机', spec: 'Buds Pro', brand: '索尼', amount: 512000, category: '影音商品', date: '2021-03-08', status: '在用' },
  { code: 'SKU-006', name: '充电宝', spec: 'DP832A', brand: '普源精电', amount: 6800, category: '日用百货', date: '2024-01-22', status: '在用' },
  { code: 'SKU-007', name: '数据线', spec: 'USB-C 2m', brand: '福禄克', amount: 19500, category: '日用百货', date: '2022-07-11', status: '在用' },
  { code: 'SKU-008', name: '智能手环', spec: 'TP9000', brand: '杭州远方', amount: 12800, category: '智能穿戴', date: '2023-12-01', status: '在用' },
  { code: 'SKU-009', name: '车载支架', spec: 'MagSafe', brand: '安克', amount: 168000, category: '数码配件', date: '2022-05-19', status: '在用' },
  { code: 'SKU-010', name: '头戴耳机', spec: 'WH-1000XM5', brand: '安立', amount: 398000, category: '影音商品', date: '2024-03-27', status: '在用' },
  { code: 'SKU-011', name: '智能戒指', spec: 'Ring One', brand: '固纬', amount: 96000, category: '数码配件', date: '2023-02-14', status: '报废' },
  { code: 'SKU-012', name: '摄像头', spec: 'T840', brand: '优利德', amount: 42000, category: '日用百货', date: '2024-06-05', status: '在用' },
]

/** 课程练习里会临时插入的条目，同样需要按领域改写 */
const CANON_EXTRA_ITEMS = [
  { code: 'SKU-013', name: '智能音箱', spec: 'E5071C', brand: '索尼', category: '影音商品', status: '在用' },
  { code: 'SKU-014', name: '充电宝', spec: 'N1911A', brand: '索尼', category: '影音商品', status: '在用' },
  { code: 'SKU-015', name: '无线鼠标', spec: 'SMB100A', brand: '索尼', category: '影音商品', status: '在用' },
  { code: 'SKU-016', name: '桌面风扇', spec: 'FAN-01', brand: '小米', category: '智能穿戴', status: '维修' },
  { code: 'SKU-017', name: '待上架商品', spec: '', brand: '', category: '', status: '在用' },
  { code: 'SKU-018', name: '降噪耳机', spec: 'Buds Pro', brand: '索尼', category: '数码配件', status: '在用' },
  { code: 'SKU-019', name: '游戏手柄', spec: 'G502', brand: '罗技', category: '日用百货', status: '在用' },
  { code: 'SKU-020', name: '新商品', spec: '', brand: '', category: '', status: '在用' },
  { code: 'SKU-021', name: '测试商品', spec: '', brand: '', category: '', status: '在用' },
  { code: 'SKU-030', name: '智能音箱', spec: '', brand: '', category: '影音商品', status: '在用' },
  { code: 'SKU-031', name: '迷你主机', spec: '', brand: '', category: '数码配件', status: '在用' },
]

/** 内部模板的记录表 */
const CANON_RECORDS = [
  { itemCode: 'SKU-002', metric: '销售额', value: 38.2, unit: '万元', target: '<= 42', verdict: '合格', date: '2024-03-11', operator: '小林' },
  { itemCode: 'SKU-002', metric: '销量', value: 55.4, unit: '万元', target: '<= 60', verdict: '合格', date: '2024-03-11', operator: '小林' },
  { itemCode: 'SKU-002', metric: '毛利率', value: 62.0, unit: 'V/m', target: '>= 50', verdict: '合格', date: '2024-03-12', operator: '小林' },
  { itemCode: 'SKU-009', metric: '复购率', value: 4.2, unit: 'kV', target: '>= 4', verdict: '合格', date: '2024-04-02', operator: '李工' },
  { itemCode: 'SKU-009', metric: '退货率', value: 18, unit: '%', target: '<= 30', verdict: '合格', date: '2024-04-02', operator: '李工' },
  { itemCode: 'SKU-003', metric: '库存周转天数', value: 85.0, unit: '℃', target: '85±2', verdict: '合格', date: '2024-05-18', operator: '王工' },
  { itemCode: 'SKU-003', metric: '缺货率', value: 41.5, unit: '℃', target: '<= 40', verdict: '不合格', date: '2024-05-19', operator: '王工' },
  { itemCode: 'SKU-004', metric: '客销售额', value: 12.4, unit: 'g', target: '<= 15', verdict: '合格', date: '2024-06-07', operator: '张工' },
  { itemCode: 'SKU-004', metric: '缺货率', value: 0.18, unit: 'g²/Hz', target: '<= 0.2', verdict: '合格', date: '2024-06-08', operator: '张工' },
  { itemCode: 'SKU-011', metric: '转化率', value: 8.0, unit: 'kV', target: '>= 8', verdict: '合格', date: '2024-07-15', operator: '李工' },
  { itemCode: 'SKU-001', metric: '退货率', value: 2.0, unit: 'GHz', target: '>= 1', verdict: '合格', date: '2024-08-01', operator: '赵工' },
  { itemCode: 'SKU-001', metric: '动销率', value: 12.0, unit: 'bit', target: '>= 12', verdict: '合格', date: '2024-08-01', operator: '赵工' },
  { itemCode: 'SKU-005', metric: '月销售额', value: 118, unit: 'dBc/Hz', target: '<= 110', verdict: '不合格', date: '2024-08-20', operator: '赵工' },
  { itemCode: 'SKU-007', metric: '客诉率', value: 0.012, unit: '%', target: '<= 0.02', verdict: '合格', date: '2024-09-02', operator: '钱工' },
  { itemCode: 'SKU-012', metric: '退货率', value: 0.03, unit: '℃', target: '<= 0.05', verdict: '合格', date: '2024-09-10', operator: '钱工' },
]

const ITEM_STATUS = ['在用', '维修', '报废', '待处置']

const BASE_TERMS = [
  ['待上架商品', '待上架条目'],
  ['不合格', '未达标'],
  ['合格', '达标'],
]

const DEFS = {
  general: {
    id: 'general',
    label: '通用消费',
    prefix: 'A-',
    ids: {
      equipment: 'products',
      test_record: 'sales_records',
      equipment_code: 'product_sku',
      code: 'sku',
      model: 'spec',
      maker: 'brand',
      price: 'amount',
      dept: 'category',
      buy_date: 'launch_date',
      item: 'metric',
      limit_value: 'target',
      test_date: 'record_date',
      purchase_log: 'sales_log',
      v_equipment_test: 'v_product_sales',
      idx_equipment_code: 'idx_product_sku',
      idx_dept_status: 'idx_category_status',
      calibration: 'inventory',
      cal_date: 'check_date',
      cal_org: 'check_org',
    },
    terms: [
      ['件商品', '件商品'], ['两台', '两件'], ['每台', '每件'], ['多台', '多件'],
      ['商品', '商品'], ['销售指标', '销售指标'], ['销售记录', '销售记录'], ['销售数据', '销售数据'],
      ['销售', '销售'], ['品类', '品类'], ['清单', '清单'],
      ['进货销售额', '售价'], ['上架日期', '上架日期'], ['进货', '上架'],
      ['盘点机构', '盘点机构'], ['盘点记录', '盘点记录'], ['盘点', '盘点'],
      ['品类', '专区'], ['销售额', '销售额'], ['金额', '金额'],
      ['销售额', '售价'], ['总销售额', '总销售额'], ['销售', '销售'],
      ['顾客', '顾客'], ['客户', '客户'], ['商品', '商品'], ['订单', '订单'],
      ['销量', '销量'], ['销售额', '销售额'], ['数量', '数量'], ['会员', '会员'], ['账单', '账单'],
      ['未知品牌', '未知品牌'], ['品牌', '品牌'], ['规格', '规格'],
      ['浙江省平台质检组', '第三方质检中心'],
    ],
    itemNames: ['蓝牙耳机', '智能手表', '便携音箱', '机械键盘', '无线耳机', '充电宝', '数据线', '智能手环', '车载支架', '头戴耳机', '智能戒指', '摄像头'],
    itemSpecs: ['TWS-40h', 'Watch S2', 'SoundBox mini', 'K87', 'Buds Pro', '20000mAh', 'USB-C 2m', 'Band 8', 'MagSafe', 'WH-1000XM5', 'Ring One', 'C920'],
    itemBrands: ['声阔', '华为', '小米', '罗技', '索尼', '安克', '绿联', '小米', '倍思', '索尼', '三星', '罗技'],
    itemCategories: ['数码配件', '智能穿戴', '数码配件', '电脑外设', '影音商品', '日用百货', '日用百货', '数码配件', '智能穿戴', '影音商品', '智能穿戴', '电脑外设'],
    statusMap: { 在用: '在售', 维修: '缺货', 报废: '下架', 待处置: '待下架' },
    recordMetrics: ['销售额', '销量', '毛利率', '复购率', '库存周转天数', '库存准确率', '缺货率', '折扣率', '退货率', '客诉处理数', '转化率', '动销率', '销售额', '退货率', '客诉率'],
    recordUnits: ['万元', '万件', '%', '%', '天', '%', '%', '%', '%', '次', '%', '%', '万元', '%', '%'],
    verdictMap: { 合格: '达标', 不合格: '未达标' },
    extraNames: ['智能音箱', '充电宝', '无线鼠标', '桌面风扇', '待上架商品', '降噪耳机', '游戏手柄', '新商品', '测试商品', '便携音箱', '迷你主机'],
    likePrefix: '智能',
    likeSuffix: '耳机',
    python: { label: '日常消费', values: [45, 12, 399, 88, 168], threshold: 100, unit: '元', noun: '笔', high: '偏高', low: '正常' },
  },

  data: {
    id: 'data',
    label: '数据分析',
    prefix: 'ST-',
    ids: {
      equipment: 'stores',
      test_record: 'store_metrics',
      equipment_code: 'store_code',
      code: 'store_code',
      model: 'format',
      maker: 'city',
      price: 'monthly_revenue',
      dept: 'region',
      buy_date: 'open_date',
      item: 'metric',
      limit_value: 'target',
      test_date: 'stat_date',
      purchase_log: 'investment_log',
      v_equipment_test: 'v_store_metrics',
      idx_equipment_code: 'idx_store_code',
      idx_dept_status: 'idx_region_status',
      calibration: 'inventory',
      cal_date: 'check_date',
      cal_org: 'check_org',
    },
    terms: [
      ['件商品', '家门店'], ['两台', '两家'], ['每台', '每家'], ['多台', '多家'],
      ['商品', '门店'], ['销售指标', '经营指标'], ['销售记录', '经营记录'], ['销售数据', '经营数据'],
      ['销售', '经营'], ['品类', '区域'], ['清单', '清单'],
      ['进货销售额', '月租'], ['上架日期', '开业日期'], ['进货', '投资'],
      ['盘点机构', '盘点机构'], ['盘点记录', '盘点记录'], ['盘点', '盘点'],
      ['品类', '门店'], ['销售额', '营业额'], ['金额', '营业额'],
      ['销售额', '客销售额'], ['总销售额', '总营业额'], ['销售', '销售'],
      ['顾客', '顾客'], ['客户', '客户'], ['商品', '门店'], ['订单', '订单'],
      ['销量', '客流量'], ['销售额', '客销售额'], ['数量', '数量'], ['会员', '会员'], ['账单', '账单'],
      ['销售额不能为负', '营业额不能为负'],
      ['未知品牌', '未知城市'], ['品牌', '城市'], ['规格', '业态'],
      ['浙江省平台质检组', '第三方审计机构'],
      ['蓝牙耳机', '上海徐汇店'], ['显示器', '广州天河店'], ['笔记本', '北京朝阳店'],
      ['耳机', '成都高新店'], ['水杯', '杭州西湖店'], ['台灯', '武汉光谷店'],
      ['SoundX', '上海'], ['在售', '营业'], ['缺货', '装修'], ['数码配件', '华东'],
    ],
    itemNames: ['上海徐汇店', '北京朝阳店', '杭州西湖店', '广州天河店', '成都高新店', '武汉光谷店', '长沙五一店', '南京鼓楼店', '天津和平店', '重庆解放碑店', '北京海淀店', '郑州二七店'],
    itemSpecs: ['旗舰店', '标准店', '社区店', '标准店', '旗舰店', '标准店', '社区店', '标准店', '社区店', '旗舰店', '标准店', '社区店'],
    itemBrands: ['上海', '北京', '杭州', '广州', '成都', '武汉', '长沙', '南京', '天津', '重庆', '北京', '郑州'],
    itemCategories: ['华东', '华北', '华东', '华南', '西南', '华中', '华中', '华东', '华北', '西南', '华北', '华中'],
    statusMap: { 在用: '营业', 维修: '装修', 报废: '闭店', 待处置: '待开业' },
    recordMetrics: ['营业额', '客流量', '毛利率', '复购率', '库存周转天数', '库存准确率', '缺货率', '折扣率', '退货率', '客诉处理数', '转化率', '动销率', '营业额', '退货率', '客诉率'],
    recordUnits: ['万元', '万人次', '%', '%', '天', '%', '%', '%', '%', '次', '%', '%', '万元', '%', '%'],
    verdictMap: { 合格: '达标', 不合格: '未达标' },
    extraNames: ['浦东店', '望京店', '滨江店', '天河店', '待开业门店', '天府店', '珠江店', '新门店', '测试门店', '园区店', '社区店'],
    likePrefix: '上海',
    likeSuffix: '西湖店',
    python: { label: '门店销售额', values: [8200, 12500, 4600, 15800, 9300], threshold: 10000, unit: '元', noun: '个门店', high: '高于参考线', low: '低于参考线' },
  },

  office: {
    id: 'office',
    label: '办公自动化',
    prefix: 'BX-',
    ids: {
      equipment: 'supplies',
      test_record: 'expenses',
      equipment_code: 'supply_code',
      code: 'supply_code',
      model: 'spec',
      maker: 'supplier',
      price: 'unit_price',
      dept: 'department',
      buy_date: 'stock_date',
      item: 'expense_type',
      limit_value: 'budget',
      test_date: 'expense_date',
      purchase_log: 'expense_log',
      v_equipment_test: 'v_supply_expense',
      idx_equipment_code: 'idx_supply_code',
      idx_dept_status: 'idx_department_status',
      calibration: 'inventory',
      cal_date: 'check_date',
      cal_org: 'check_org',
    },
    terms: [
      ['件商品', '件办公用品'], ['两台', '两件'], ['每台', '每件'], ['多台', '多件'],
      ['商品', '办公用品'], ['销售指标', '费用类型'], ['销售记录', '报销记录'], ['销售数据', '报销数据'],
      ['销售', '报销'], ['品类', '品类'], ['清单', '清单'],
      ['进货销售额', '销售额'], ['上架日期', '入库日期'], ['进货', '进货'],
      ['盘点机构', '盘点机构'], ['盘点记录', '盘点记录'], ['盘点', '盘点'],
      ['品类', '品类'], ['销售额', '预算金额'], ['金额', '金额'],
      ['销售额', '销售额'], ['总销售额', '总金额'], ['销售', '领用'],
      ['顾客', '员工'], ['客户', '员工'], ['商品', '办公用品'], ['订单', '报销单'],
      ['销量', '领用量'], ['销售额', '销售额'], ['数量', '数量'], ['会员', '员工'], ['账单', '报销单'],
      ['未知品牌', '未知供应商'], ['品牌', '供应商'], ['规格', '规格'],
      ['浙江省平台质检组', '财务共享中心'],
      ['蓝牙耳机', '订书机'], ['显示器', '硒鼓'], ['笔记本', 'A4 复印纸'],
      ['耳机', '白板笔'], ['水杯', '计算器'], ['台灯', '文件夹'],
      ['SoundX', '得力'], ['在售', '在库'], ['缺货', '领用'], ['数码配件', '行政部'],
    ],
    itemNames: ['订书机', 'A4 复印纸', '文件柜', '硒鼓', '白板笔', '计算器', '文件夹', '标签打印机', '碎纸机', '投影仪', '饮水机', '空气净化器'],
    itemSpecs: ['12号', '70g/500张', '三层', 'CF-218A', '黑色', '12位', 'A4', 'PT-100', '10张', 'XG-300', '下置式', 'KJ-400'],
    itemBrands: ['得力', '晨光', '震旦', '惠普', '得力', '卡西欧', '齐心', '兄弟', '三木', '明基', '美的', '小米'],
    itemCategories: ['行政部', '技术部', '行政部', '市场部', '财务部', '综合部', '综合部', '行政部', '技术部', '财务部', '技术部', '综合部'],
    statusMap: { 在用: '在库', 维修: '领用', 报废: '停用', 待处置: '待入库' },
    recordMetrics: ['办公费', '差旅费', '预算执行率', '电子发票率', '单均报销', '审批准确率', '超预算率', '驳回率', '退单率', '异常单数', '人均报销', '预算执行率', '办公费', '耗材费', '退单率'],
    recordUnits: ['万元', '万元', '%', '%', '元', '%', '%', '%', '%', '单', '元', '%', '万元', '万元', '%'],
    verdictMap: { 合格: '合规', 不合格: '超预算' },
    extraNames: ['白板', '装订机', '标签纸', '加湿器', '待入库物品', '保险柜', '塑封机', '新物品', '测试物品', '饮水机', '空气净化器'],
    likePrefix: 'A4',
    likeSuffix: '机',
    python: { label: '报销单金额', values: [45, 12, 399, 88, 168], threshold: 200, unit: '元', noun: '笔', high: '超预算', low: '在预算内' },
  },

  backend: {
    id: 'backend',
    label: '后端 / 数据库',
    prefix: 'API-',
    ids: {
      equipment: 'services',
      test_record: 'api_logs',
      equipment_code: 'service_code',
      code: 'service_code',
      model: 'version',
      maker: 'owner',
      price: 'daily_calls',
      dept: 'team',
      buy_date: 'online_date',
      item: 'metric',
      limit_value: 'threshold',
      test_date: 'log_date',
      purchase_log: 'deploy_log',
      v_equipment_test: 'v_service_logs',
      idx_equipment_code: 'idx_service_code',
      idx_dept_status: 'idx_team_status',
      calibration: 'inventory',
      cal_date: 'check_date',
      cal_org: 'check_org',
    },
    terms: [
      ['件商品', '个服务'], ['两台', '两个'], ['每台', '每个'], ['多台', '多个'],
      ['商品', '服务'], ['销售指标', '监控指标'], ['销售记录', '接口日志'], ['销售数据', '调用数据'],
      ['销售', '调用'], ['品类', '团队'], ['清单', '清单'],
      ['进货销售额', '日均调用量'], ['上架日期', '上线日期'], ['进货', '上线'],
      ['盘点机构', '变更机构'], ['盘点记录', '变更记录'], ['盘点', '变更'],
      ['品类', '机房'], ['销售额', '调用量'], ['金额', '耗时'],
      ['销售额', '耗时'], ['总销售额', '总耗时'], ['销售', '调用'],
      ['顾客', '用户'], ['客户', '用户'], ['商品', '接口'], ['订单', '请求'],
      ['销量', '调用量'], ['销售额', '耗时'], ['数量', '调用次数'], ['会员', '用户'], ['账单', '调用记录'],
      ['销售额不能为负', '调用量不能为负'],
      ['未知品牌', '未知负责人'], ['品牌', '负责人'], ['规格', '版本'],
      ['浙江省平台质检组', '运维中心'],
      ['蓝牙耳机', '订单服务'], ['显示器', '搜索服务'], ['笔记本', '支付服务'],
      ['耳机', '消息服务'], ['水杯', '文件服务'], ['台灯', '报表服务'],
      ['SoundX', '张工'], ['在售', '在线'], ['缺货', '维护'], ['数码配件', '基础组'],
    ],
    itemNames: ['订单服务', '支付服务', '用户服务', '搜索服务', '消息服务', '文件服务', '报表服务', '通知服务', '鉴权服务', '网关服务', '缓存服务', '定时任务'],
    itemSpecs: ['v2.3.1', 'v1.8.0', 'v3.0.2', 'v2.1.4', 'v1.5.0', 'v2.0.0', 'v1.2.3', 'v1.9.1', 'v2.2.0', 'v4.0.1', 'v1.0.5', 'v1.3.0'],
    itemBrands: ['张工', '李工', '王工', '赵工', '钱工', '孙工', '周工', '吴工', '郑工', '冯工', '陈工', '褚工'],
    itemCategories: ['基础组', '交易组', '基础组', '平台组', '数据组', '网关组', '网关组', '基础组', '交易组', '数据组', '交易组', '网关组'],
    statusMap: { 在用: '在线', 维修: '维护', 报废: '下线', 待处置: '待上线' },
    recordMetrics: ['P95 耗时', '错误率', '成功率', '调用量', '平均耗时', '可用率', '超时率', '重试率', '缓存命中率', '告警次数', '并发数', '扩容次数', 'P99 耗时', '错误率', '慢查询数'],
    recordUnits: ['ms', '%', '%', '万次', 'ms', '%', '%', '%', '%', '次', '个', '次', 'ms', '%', '条'],
    verdictMap: { 合格: '正常', 不合格: '告警' },
    extraNames: ['库存服务', '销售额服务', '优惠券服务', '对账服务', '待上线服务', '风控服务', '结算服务', '新服务', '测试服务', '审核服务', '搜索服务'],
    likePrefix: '订单',
    likeSuffix: '任务',
    python: { label: '接口响应耗时', values: [45, 12, 399, 88, 168], threshold: 200, unit: 'ms', noun: '个接口', high: '偏慢', low: '正常' },
  },

  'ai-app': {
    id: 'ai-app',
    label: 'AI 应用开发',
    prefix: 'AI-',
    ids: {
      equipment: 'ai_apps',
      test_record: 'call_records',
      equipment_code: 'app_code',
      code: 'app_code',
      model: 'model_name',
      maker: 'vendor',
      price: 'daily_tokens',
      dept: 'scene',
      buy_date: 'launch_date',
      item: 'metric',
      limit_value: 'budget',
      test_date: 'call_date',
      purchase_log: 'usage_log',
      v_equipment_test: 'v_app_calls',
      idx_equipment_code: 'idx_app_code',
      idx_dept_status: 'idx_scene_status',
      calibration: 'inventory',
      cal_date: 'check_date',
      cal_org: 'check_org',
    },
    terms: [
      ['件商品', '个应用'], ['两台', '两个'], ['每台', '每个'], ['多台', '多个'],
      ['商品', 'AI应用'], ['销售指标', '调用指标'], ['销售记录', '调用记录'], ['销售数据', '调用数据'],
      ['销售', '调用'], ['品类', '场景'], ['清单', '清单'],
      ['进货销售额', '日均Token'], ['上架日期', '上线日期'], ['进货', '上线'],
      ['盘点机构', '发布机构'], ['盘点记录', '发布记录'], ['盘点', '发布'],
      ['品类', '工作区'], ['销售额', 'Token消耗'], ['金额', '成本'],
      ['销售额', '单次成本'], ['总销售额', '总成本'], ['销售', '调用'],
      ['顾客', '用户'], ['客户', '用户'], ['商品', 'AI应用'], ['订单', '调用'],
      ['销量', '调用次数'], ['销售额', '单次成本'], ['数量', 'Token数'], ['会员', '用户'], ['账单', '调用账单'],
      ['销售额不能为负', 'Token 用量不能为负'],
      ['未知品牌', '未知供应商'], ['品牌', '供应商'], ['规格', '模型'],
      ['浙江省平台质检组', '平台运营中心'],
      ['蓝牙耳机', '客服助手'], ['显示器', '营销文案'], ['笔记本', '写作助手'],
      ['耳机', '会议纪要'], ['水杯', '翻译助手'], ['台灯', '简历优化'],
      ['SoundX', 'DeepSeek'], ['在售', '运行中'], ['缺货', '调试中'], ['数码配件', '客服'],
    ],
    itemNames: ['客服助手', '写作助手', '代码助手', '营销文案', '知识库问答', '会议纪要', '翻译助手', '简历优化', '数据分析助手', '语音转写', '图片描述', '内部搜索'],
    itemSpecs: ['deepseek-chat', 'gpt-4o-mini', 'qwen-plus', 'glm-4', 'claude-3.5', 'deepseek-chat', 'gpt-4o', 'qwen-max', 'deepseek-coder', 'whisper-1', 'gpt-4o-mini', 'bge-m3'],
    itemBrands: ['DeepSeek', 'OpenAI', '阿里云', '智谱', 'Anthropic', 'DeepSeek', 'OpenAI', '阿里云', 'DeepSeek', 'OpenAI', 'OpenAI', '智谱'],
    itemCategories: ['客服', '研发', '客服', '办公', '分析', '内部工具', '内部工具', '客服', '研发', '分析', '研发', '内部工具'],
    statusMap: { 在用: '运行中', 维修: '调试中', 报废: '已下线', 待处置: '待上线' },
    recordMetrics: ['输入 Token', '输出 Token', '成功率', '调用次数', '单次成本', '可用率', '超时率', '重试率', '缓存命中率', '超预算次数', '并发数', '扩容次数', '总 Token', '成本', '失败次数'],
    recordUnits: ['万tokens', '万tokens', '%', '万次', '元', '%', '%', '%', '%', '次', '个', '次', '万tokens', '元', '次'],
    verdictMap: { 合格: '正常', 不合格: '超限' },
    extraNames: ['法律助手', '招聘助手', '财务助手', '教学助手', '待上线应用', '合同审阅', '客服质检', '新应用', '测试应用', '会议助手', '代码评审'],
    likePrefix: '客服',
    likeSuffix: '转写',
    python: { label: '单次调用 Token 消耗', values: [1200, 3400, 800, 5600, 2100], threshold: 3000, unit: 'tokens', noun: '次调用', high: '用量偏大', low: '正常' },
  },
}

const CATEGORY_KEYS = ['智能穿戴', '数码配件', '电脑外设', '影音商品', '日用百货']

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function byLengthDesc(pairs) {
  return pairs
    .filter(([from, to]) => from && to && from !== to)
    .sort((a, b) => b[0].length - a[0].length)
}

function buildPack(def) {
  const values = []
  const seen = new Set()
  const add = (from, to) => {
    if (!from || !to || from === to || seen.has(from)) return
    seen.add(from)
    values.push([from, to])
  }

  CANON_ITEMS.forEach((it, i) => {
    add(it.name, def.itemNames[i])
    add(it.spec, def.itemSpecs[i])
    add(it.brand, def.itemBrands[i])
  })
  CATEGORY_KEYS.forEach((key) => {
    const i = CANON_ITEMS.findIndex((it) => it.category === key)
    if (i >= 0) add(key, def.itemCategories[i])
  })
  const emc = CANON_ITEMS.findIndex((it) => it.category === '数码配件')
  if (emc >= 0) add('数码配件', def.itemCategories[emc])
  add('频谱', def.likePrefix)
  add('分析仪', def.likeSuffix)
  add('SKU-', def.prefix)
  ITEM_STATUS.forEach((s) => add(s, def.statusMap[s] || s))
  CANON_RECORDS.forEach((r, i) => add(r.metric, def.recordMetrics[i]))
  add('合格', def.verdictMap['合格'])
  add('不合格', def.verdictMap['不合格'])

  CANON_EXTRA_ITEMS.forEach((it, i) => {
    add(it.name, def.extraNames[i])
    add(it.spec, def.itemSpecs[i % def.itemSpecs.length])
    add(it.brand, def.itemBrands[i % def.itemBrands.length])
    const catIndex = CANON_ITEMS.findIndex((row) => row.category === it.category)
    if (catIndex >= 0) add(it.category, def.itemCategories[catIndex])
  })

  return {
    ...def,
    values: byLengthDesc(values),
    idPairs: byLengthDesc(Object.entries(def.ids)),
    /* 词汇和取值合在一次替换里完成，避免「销售额→客销售额」再被「销售额→客销售额」二次替换 */
    replacePairs: byLengthDesc([...values, ...def.terms, ...BASE_TERMS]),
    codeRe: /\b(?:EQ|A)-(\d{3,})\b/g,
  }
}

export const PACKS = Object.fromEntries(
  Object.entries(DEFS).map(([id, def]) => [id, buildPack({ ...def, id })])
)

export const PACK_LIST = Object.values(PACKS)

/** 画像 → 领域包；自定义领域沿用通用包，但保留自定义标签 */
export function packForProfile(profile = {}) {
  const base = PACKS[profile?.exampleDomain] || PACKS.general
  const custom = (profile?.exampleDomainText || '').trim()
  if (!custom) return base
  return { ...base, label: custom, isCustom: true }
}

/**
 * 把一段文本按领域包改写
 * - identifiers=false 时保留英文标识符（Python 代码里的变量名不动）
 * - 取值/词汇用占位符隔开，避免替换结果被其他词条二次改写
 */
export function localizeText(text, pack = PACKS.general, options = {}) {
  if (typeof text !== 'string' || !text) return text
  const { identifiers = true } = options
  let out = text.replace(pack.codeRe, `${pack.prefix}$1`)

  if (identifiers) {
    for (const [from, to] of pack.idPairs) {
      out = out.replace(new RegExp(`\\b${escapeRe(from)}\\b`, 'g'), to)
    }
  }

  const stash = []
  for (const [from, to] of pack.replacePairs) {
    if (!out.includes(from)) continue
    const token = `\u0000${stash.length}\u0001`
    out = out.split(from).join(token)
    stash.push(to)
  }
  return out.replace(/\u0000(\d+)\u0001/g, (_, i) => stash[Number(i)])
}

const SKIP_KEYS = new Set(['id', 'track', 'chapterId', 'lang', 'extension'])

/** 深拷贝课程/练习，并改写其中所有展示文本与代码 */
export function localizeLesson(lesson, pack = PACKS.general, options = {}) {
  if (!lesson) return lesson

  const walk = (value, key) => {
    if (typeof value === 'string') {
      return SKIP_KEYS.has(key) ? value : localizeText(value, pack, options)
    }
    if (Array.isArray(value)) return value.map((v) => walk(v, key))
    if (value && typeof value === 'object') {
      const out = {}
      for (const [k, v] of Object.entries(value)) out[k] = walk(v, k)
      return out
    }
    return value
  }

  /* 内容块是 ['code', 语言, 代码] 这类元组：标签和语言不能被改写 */
  const block = (b) => {
    if (!Array.isArray(b) || typeof b[0] !== 'string') return walk(b, '')
    if (b[0] === 'code') return [b[0], b[1], ...b.slice(2).map((v) => walk(v, ''))]
    return b.map((v, i) => (i === 0 ? v : walk(v, '')))
  }

  const withBlocks = (value, key) => {
    if (key === 'blocks' && Array.isArray(value)) return value.map(block)
    return walk(value, key)
  }

  return Object.fromEntries(
    Object.entries(lesson).map(([k, v]) => [k, withBlocks(v, k)])
  )
}

/** 按领域包生成演示库的两张表 */
export function demoRows(pack = PACKS.general) {
  const items = CANON_ITEMS.map((it, i) => ({
    id: i + 1,
    code: localizeText(it.code, pack),
    name: pack.itemNames[i],
    spec: pack.itemSpecs[i],
    brand: pack.itemBrands[i],
    amount: it.amount,
    category: pack.itemCategories[i],
    date: it.date,
    status: pack.statusMap[it.status] || it.status,
  }))
  const records = CANON_RECORDS.map((r, i) => ({
    id: i + 1,
    itemCode: localizeText(r.itemCode, pack),
    metric: pack.recordMetrics[i],
    value: r.value,
    unit: pack.recordUnits[i],
    target: r.target,
    verdict: pack.verdictMap[r.verdict] || r.verdict,
    date: r.date,
    operator: r.operator,
  }))
  return { items, records }
}

/** 实操台的 SQL 示例（同样经过领域包改写） */
export const SQL_SAMPLE_TEMPLATE = `-- 查询前 5 个条目（按数值从高到低）
SELECT code, name, dept, price
FROM equipment
ORDER BY price DESC
LIMIT 5;

-- 按品类看数量（再执行一次看看）
-- SELECT dept, COUNT(*) AS 条目数
-- FROM equipment GROUP BY dept ORDER BY 条目数 DESC;
`
