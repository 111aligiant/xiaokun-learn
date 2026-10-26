/* ============================================================
   SQL 运行时（sql.js → SQLite 编译成 WebAssembly）
   说明：手机上直接跑真实 SQLite 内核，与 Python 的 sqlite3 语法一致。
   数据保存在内存中，重置演示库即可恢复初始数据。
   ============================================================ */

/* 本地内置源优先（public/sqljs/），APK 内完全离线；缺失时自动落到 CDN */
const SQL_CDN_LIST = [
  { base: typeof location !== 'undefined' ? location.origin + '/sqljs/' : '/sqljs/', label: '内置' },
  { base: 'https://registry.npmmirror.com/sql.js/1.10.3/files/dist/', label: 'npmmirror' },
  { base: 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/', label: 'jsdelivr' },
  { base: 'https://fastly.jsdelivr.net/npm/sql.js@1.10.3/dist/', label: 'fastly' },
  { base: 'https://unpkg.com/sql.js@1.10.3/dist/', label: 'unpkg' },
]

let SQL = null
let db = null
let loading = null

export const sqlState = {
  status: 'idle', // idle | loading | ready | error
  progress: '',
  source: '',
  error: null,
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('脚本加载失败: ' + src))
    document.head.appendChild(s)
  })
}

export function ensureSql(onProgress) {
  if (SQL) return Promise.resolve(SQL)
  if (loading) return loading

  sqlState.status = 'loading'
  const report = (m) => {
    sqlState.progress = m
    if (onProgress) onProgress(m)
  }

  loading = (async () => {
    let lastErr = null
    for (const cdn of SQL_CDN_LIST) {
      try {
        report(`正在连接 ${cdn.label}…`)
        await loadScript(cdn.base + 'sql-wasm.js')
        if (typeof window.initSqlJs !== 'function') throw new Error('initSqlJs 未就绪')
        report('正在下载 SQL 引擎（约 1.2MB）…')
        SQL = await window.initSqlJs({
          locateFile: (file) => cdn.base + file,
        })
        db = new SQL.Database()
        buildDemoSchema(db)
        sqlState.status = 'ready'
        sqlState.source = cdn.label
        report('就绪')
        return SQL
      } catch (e) {
        lastErr = e
        report('该源不可用，换下一个…')
        console.warn('[sql] 源失败:', cdn.base, e)
      }
    }
    sqlState.status = 'error'
    sqlState.error = lastErr?.message || '无法加载 SQL 引擎'
    loading = null
    throw new Error('SQL 引擎加载失败（网络问题）。联网后重试即可。')
  })()

  return loading
}

export function isReady() {
  return !!db
}

/* ---------------- 演示库：贴合通用行业销售场景 ---------------- */
const DEMO_SQL = `
CREATE TABLE equipment (
  id           INTEGER PRIMARY KEY,
  code         TEXT    NOT NULL,   -- 商品编号
  name         TEXT    NOT NULL,   -- 商品名称
  model        TEXT,               -- 规格规格
  maker        TEXT,               -- 制造品牌
  price        REAL,               -- 进货销售额（元）
  dept         TEXT,               -- 使用品类
  buy_date     TEXT,               -- 上架日期
  status       TEXT                -- 状态：在用/维修/报废
);

INSERT INTO equipment (id, code, name, model, maker, price, dept, buy_date, status) VALUES
 (1,  'SKU-001', '蓝牙耳机',       'TWS-40h',    '声阔',       128000, '智能穿戴', '2023-04-12', '在用'),
 (2,  'SKU-002', '智能手表',   'Watch S2',     '索尼', 456000, '数码配件',  '2022-11-03', '在用'),
 (3,  'SKU-003', '便携音箱',     'SoundBox mini',   '小米',    86000, '智能穿戴', '2021-06-20', '维修'),
 (4,  'SKU-004', '机械键盘',           'ES-20-240', '苏州苏试',   372000, '电脑外设', '2023-09-15', '在用'),
 (5,  'SKU-005', '无线耳机',       'Buds Pro',     '索尼', 512000, '影音商品', '2021-03-08', '在用'),
 (6,  'SKU-006', '充电宝',     'DP832A',    '普源精电',     6800, '日用百货', '2024-01-22', '在用'),
 (7,  'SKU-007', '数据线',           'USB-C 2m',    '索尼',    19500, '日用百货', '2022-07-11', '在用'),
 (8,  'SKU-008', '智能手环',       'TP9000',    '杭州远方',    12800, '智能穿戴', '2023-12-01', '在用'),
 (9,  'SKU-009', '车载支架',       'MagSafe',  '安克',    168000, '数码配件',  '2022-05-19', '在用'),
 (10, 'SKU-010', '无线耳机',       'WH-1000XM5',     '索尼', 398000, '影音商品', '2024-03-27', '在用'),
 (11, 'SKU-011', '智能戒指',   'Ring One',   '安克',     96000, '数码配件',  '2023-02-14', '报废'),
 (12, 'SKU-012', '摄像头',       'T840',      '福禄克',       42000, '日用百货', '2024-06-05', '在用');

CREATE TABLE test_record (
  id             INTEGER PRIMARY KEY,
  equipment_code TEXT,     -- 关联 equipment.code
  item           TEXT,     -- 销售指标
  value          REAL,     -- 实测值
  unit           TEXT,     -- 单位
  limit_value    TEXT,     -- 目标值要求
  verdict        TEXT,     -- 结论：合格/不合格
  test_date      TEXT,     -- 销售日期
  operator       TEXT      -- 销售人
);

INSERT INTO test_record (id, equipment_code, item, value, unit, limit_value, verdict, test_date, operator) VALUES
 (1, 'SKU-002', '销售额',  38.2, '万元', '<= 42',   '合格',   '2024-03-11', '小林'),
 (2, 'SKU-002', '销量',  55.4, '万元',   '<= 60',   '合格',   '2024-03-11', '小林'),
 (3, 'SKU-002', '毛利率', 62.0, 'V/m',   '>= 50',   '合格',   '2024-03-12', '小林'),
 (4, 'SKU-009', '复购率',       4.2, 'kV',     '>= 4',    '合格',   '2024-04-02', '李工'),
 (5, 'SKU-009', '退货率',          18, '%',      '<= 30',   '合格',   '2024-04-02', '李工'),
 (6, 'SKU-003', '库存周转天数',          85.0, '℃',     '85±2',    '合格',   '2024-05-18', '王工'),
 (7, 'SKU-003', '缺货率',         -41.5, '℃',     '-40±2',   '不合格', '2024-05-19', '王工'),
 (8, 'SKU-004', '客销售额',          12.4, 'g',      '<= 15',   '合格',   '2024-06-07', '张工'),
 (9, 'SKU-004', '缺货率',          0.18, 'g²/Hz',  '<= 0.2',  '合格',   '2024-06-08', '张工'),
 (10,'SKU-011', '转化率',          8.0,  'kV',     '>= 8',    '合格',   '2024-07-15', '李工'),
 (11,'SKU-001', '退货率',          2.0,  'GHz',    '>= 1',    '合格',   '2024-08-01', '赵工'),
 (12,'SKU-001', '动销率',        12.0, 'bit',    '>= 12',   '合格',   '2024-08-01', '赵工'),
 (13,'SKU-005', '月销售额',         -118,  'dBc/Hz', '<= -110', '合格',   '2024-08-20', '赵工'),
 (14,'SKU-007', '客诉率',      0.012, '%',     '<= 0.02', '合格',   '2024-09-02', '钱工'),
 (15,'SKU-012', '退货率',        0.03, '℃',      '<= 0.05', '合格',   '2024-09-10', '钱工');
`

function buildDemoSchema(instance) {
  try {
    instance.exec(DEMO_SQL)
  } catch (e) {
    console.warn('[sql] 演示库初始化失败', e)
  }
}

/** 重置为初始演示库 */
export async function resetDemo() {
  const inst = await ensureSql()
  db = new inst.Database()
  buildDemoSchema(db)
  return true
}

/** 清空成一个空库（从零练建表） */
export async function emptyDb() {
  const inst = await ensureSql()
  db = new inst.Database()
  return true
}

/**
 * 执行 SQL 脚本
 * @returns {Promise<{ok:boolean, blocks:Array, error:string, rowsModified:number, ms:number}>}
 */
export async function runSql(sql) {
  await ensureSql()
  const t0 = performance.now()
  const blocks = []
  let rowsModified = 0

  try {
    const trimmed = sql.trim()
    if (!trimmed) return { ok: false, blocks: [], error: '请输入 SQL 语句', rowsModified: 0, ms: 0 }

    const results = db.exec(trimmed)
    for (const r of results) {
      blocks.push({
        type: 'rows',
        columns: r.columns,
        values: r.values,
        rowCount: r.values.length,
      })
    }

    try {
      rowsModified = db.getRowsModified()
    } catch (_) {}

    // 如果既没有结果集，也没有影响行数，说明是 DDL
    if (!blocks.length) {
      blocks.push({ type: 'info', text: '执行成功，没有返回结果集。' })
    }

    return {
      ok: true,
      blocks,
      error: '',
      rowsModified,
      ms: Math.round(performance.now() - t0),
    }
  } catch (e) {
    return {
      ok: false,
      blocks: [],
      error: String(e?.message || e).replace(/^Error:\s*/, ''),
      rowsModified,
      ms: Math.round(performance.now() - t0),
    }
  }
}

/** 当前库里有哪些表、各多少行 */
export async function listTables() {
  try {
    await ensureSql()
    const res = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    if (!res.length) return []
    return res[0].values.map(([name]) => {
      let count = 0
      try {
        const c = db.exec(`SELECT COUNT(*) FROM "${name}"`)
        count = c[0]?.values?.[0]?.[0] ?? 0
      } catch (_) {}
      return { name, count }
    })
  } catch (_) {
    return []
  }
}

/** 取某张表的字段定义，用于"表结构"速查 */
export async function tableSchema(name) {
  try {
    await ensureSql()
    const res = db.exec(`PRAGMA table_info("${name}")`)
    if (!res.length) return []
    return res[0].values.map((r) => ({
      name: r[1],
      type: r[2],
      notnull: !!r[3],
      pk: !!r[5],
    }))
  } catch (_) {
    return []
  }
}
