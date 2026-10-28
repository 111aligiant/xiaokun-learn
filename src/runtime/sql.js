/* ============================================================
   SQL 运行时（sql.js → SQLite 编译成 WebAssembly）
   说明：手机上直接跑真实 SQLite 内核，与 Python 的 sqlite3 语法一致。
   演示库按学员画像的领域包实时生成，重置演示库即可恢复初始数据。
   ============================================================ */

import { PACKS, demoRows } from '../data/domain-packs.js'

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
let activePack = PACKS.general

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

/* ---------------- 演示库：按领域包生成 ---------------- */
function col(pack, key) {
  return pack.ids[key] || key
}

function literal(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return String(value)
  return `'${String(value).replace(/'/g, "''")}'`
}

export function buildDemoSql(pack) {
  const { items, records } = demoRows(pack)
  const tItems = col(pack, 'equipment')
  const tRecords = col(pack, 'test_record')
  const tLog = col(pack, 'purchase_log')

  const itemCols = [
    'id', col(pack, 'code'), 'name', col(pack, 'model'), col(pack, 'maker'),
    col(pack, 'price'), col(pack, 'dept'), col(pack, 'buy_date'), 'status',
  ]
  const itemTypes = [
    'INTEGER PRIMARY KEY', 'TEXT NOT NULL', 'TEXT NOT NULL', 'TEXT', 'TEXT',
    'REAL', 'TEXT', 'TEXT', 'TEXT',
  ]
  const recordCols = [
    'id', col(pack, 'equipment_code'), col(pack, 'item'), 'value', 'unit',
    col(pack, 'limit_value'), 'verdict', col(pack, 'test_date'), 'operator',
  ]
  const recordTypes = [
    'INTEGER PRIMARY KEY', 'TEXT', 'TEXT', 'REAL', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'TEXT',
  ]

  const ddl = (table, cols, types) =>
    `CREATE TABLE ${table} (\n${cols.map((c, i) => `  ${c.padEnd(14)} ${types[i]}`).join(',\n')}\n);`

  const itemRows = items.map((it) => `(${[
    it.id, it.code, it.name, it.spec, it.brand, it.amount, it.category, it.date, it.status,
  ].map(literal).join(', ')})`)

  const recordRows = records.map((r) => `(${[
    r.id, r.itemCode, r.metric, r.value, r.unit, r.target, r.verdict, r.date, r.operator,
  ].map(literal).join(', ')})`)

  return `${ddl(tItems, itemCols, itemTypes)}

INSERT INTO ${tItems} (${itemCols.join(', ')}) VALUES
${itemRows.join(',\n')};

${ddl(tRecords, recordCols, recordTypes)}

INSERT INTO ${tRecords} (${recordCols.join(', ')}) VALUES
${recordRows.join(',\n')};

-- 进货/流水表：留给事务章节练习，初始为空
${ddl(tLog, ['id', col(pack, 'equipment_code'), 'amount', 'created_at'], [
    'INTEGER PRIMARY KEY', 'TEXT', 'REAL', 'TEXT',
  ])}`
}

function buildDemoSchema(instance, pack = activePack) {
  try {
    instance.exec(buildDemoSql(pack))
  } catch (e) {
    console.warn('[sql] 演示库初始化失败', e)
  }
}

/** 切换领域包：下一次 ensure 或立即重建演示库 */
export function setSqlPack(pack) {
  if (!pack) return false
  const changed = pack.id !== activePack.id || pack.label !== activePack.label
  activePack = pack
  if (changed && db && SQL) {
    db = new SQL.Database()
    buildDemoSchema(db)
  }
  return changed
}

/** 重置为当前领域包的初始演示库 */
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
