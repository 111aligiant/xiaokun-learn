<template>
  <div>
    <header class="appbar">
      <div class="grow">
        <div class="appbar__title">实操台</div>
        <div class="appbar__sub">
          <template v-if="tab === 'python'">
            真 Python 在你手机上跑，代码不上传
          </template>
          <template v-else>
            SQL 引擎在手机上跑（SQLite 内核）
          </template>
        </div>
      </div>
    </header>

    <div class="page">
      <!-- 引擎切换 -->
      <div class="seg" style="margin-bottom:14px">
        <button class="seg__item" :class="{ 'seg__item--on': tab === 'python' }" @click="switchTab('python')">
          🐍 Python
        </button>
        <button class="seg__item" :class="{ 'seg__item--on': tab === 'sql' }" @click="switchTab('sql')">
          🗄️ SQL
        </button>
      </div>

      <!-- 引擎状态 -->
      <div
        v-if="engineState.status !== 'ready'"
        class="note"
        :class="engineState.status === 'error' ? 'note--danger' : ''"
        style="margin-bottom:13px"
      >
        <span>{{ engineState.status === 'error' ? '⚠️' : '⏳' }}</span>
        <div class="grow">
          <template v-if="engineState.status === 'idle'">
            {{ tab === 'python' ? 'Python' : 'SQL' }} 引擎还没启动。点「运行」会自动下载（首次约需几秒到几十秒，之后走缓存）。
          </template>
          <template v-else-if="engineState.status === 'loading'">{{ engineState.progress || '正在加载…' }}</template>
          <template v-else>
            {{ engineState.error }}
            <div style="margin-top:8px">
              <button class="btn btn--sm btn--ghost" @click="preload">重试</button>
            </div>
          </template>
        </div>
      </div>
      <div v-else class="row" style="margin-bottom:11px;gap:8px">
        <span class="chip chip--ok"><span class="badge-dot" /> 引擎就绪</span>
        <span class="tiny muted">{{ engineState.progress }}</span>
      </div>

      <!-- ============ Python ============ -->
      <template v-if="tab === 'python'">
        <div class="tiny muted" style="margin-bottom:6px">
          🎯 示例取材：{{ pySampleLabel }}（可在「设置 → 学员背景」里调整）
        </div>
        <CodeEditor
          v-model="pyCode"
          filename="main.py"
          placeholder="print('你好')"
          :dot-color="'#f0a622'"
          @reset="onEditorReset"
        />

        <!-- 输入面板 -->
        <div v-if="inputCount > 0" class="inputpanel">
          <div class="row row--between" style="margin-bottom:7px">
            <span class="tiny strong">这段代码需要 {{ inputCount }} 行输入</span>
            <span class="tiny muted">每行一个值，按顺序喂给 input()</span>
          </div>
          <textarea
            v-model="stdinText"
            class="textarea"
            style="min-height:62px;font-family:var(--mono);font-size:13px"
            placeholder="第一行&#10;第二行"
          />
        </div>

        <div class="row wrap" style="gap:8px;margin-top:11px">
          <button class="btn btn--primary btn--sm" :disabled="running" @click="runPy">
            {{ running ? '运行中…' : '▶ 运行' }}
          </button>
          <button class="btn btn--sm btn--ghost" @click="pyCode = ''">清空</button>
          <button class="btn btn--sm btn--ghost" @click="loadSample('python')">示例代码</button>
          <button class="btn btn--sm btn--ghost" @click="askAboutCode('python')">🤖 讲代码 / 找bug</button>
        </div>

        <div v-if="pyOutput" class="section-title">输出</div>
        <pre v-if="pyOutput" class="console" :class="{ 'console--err': !pyOk }">{{ pyOutput }}</pre>
        <div v-else-if="!running" class="tiny muted" style="margin-top:12px">
          运行结果会显示在这里。
        </div>
      </template>

      <!-- ============ SQL ============ -->
      <template v-else>
        <div v-if="tables.length" class="tablelist">
          <span class="tiny muted" style="margin-right:2px">现有表：</span>
          <button
            v-for="t in tables"
            :key="t.name"
            class="chip"
            @click="insertText(t.name)"
          >{{ t.name }} ({{ t.count }})</button>
        </div>

        <CodeEditor
          v-model="sqlCode"
          filename="practice.sql"
          :placeholder="sqlPlaceholder"
          :dot-color="'#1a7a4a'"
          @reset="onEditorReset"
        />

        <div class="row wrap" style="gap:8px;margin-top:11px">
          <button class="btn btn--primary btn--sm" :disabled="sqlRunning" @click="runSqlNow">
            {{ sqlRunning ? '执行中…' : '▶ 执行' }}
          </button>
          <button class="btn btn--sm btn--ghost" @click="sqlCode = ''">清空</button>
          <button class="btn btn--sm btn--ghost" @click="loadSample('sql')">示例查询</button>
          <button class="btn btn--sm btn--ghost" @click="resetDemoDb">重置演示库</button>
          <button class="btn btn--sm btn--ghost" @click="askAboutCode('sql')">🤖 讲这条 SQL</button>
        </div>

        <!-- 结果 -->
        <template v-if="sqlResult">
          <div class="section-title">结果</div>

          <div v-if="!sqlResult.ok" class="note note--danger">
            <span>⚠️</span>
            <div class="grow">
              <div class="strong small">执行出错</div>
              <div class="tiny" style="margin-top:4px;word-break:break-word">{{ sqlResult.error }}</div>
            </div>
          </div>

          <template v-else>
            <div class="row row--between" style="margin-bottom:9px">
              <span class="tiny muted">耗时 {{ sqlResult.ms }} ms</span>
              <span v-if="sqlResult.rowsModified" class="chip chip--ok">
                影响 {{ sqlResult.rowsModified }} 行
              </span>
            </div>

            <div v-for="(b, bi) in sqlResult.blocks" :key="bi" style="margin-bottom:12px">
              <template v-if="b.type === 'rows'">
                <div class="tiny muted" style="margin-bottom:6px">返回 {{ b.rowCount }} 行</div>
                <div class="tablewrap">
                  <table>
                    <thead>
                      <tr><th v-for="(c, ci) in b.columns" :key="ci">{{ c }}</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, ri) in b.values" :key="ri">
                        <td v-for="(v, vi) in row" :key="vi">{{ v === null ? 'NULL' : v }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <div v-else class="note note--ok"><span>✓</span><span>{{ b.text }}</span></div>
            </div>
          </template>
        </template>

        <div class="note" style="margin-top:4px">
          <span>ℹ️</span>
          <span>
            这里是真实的 SQLite 内核（sql.js/WASM），和 Python 的 sqlite3 语法一致：
            SELECT / WHERE / JOIN / GROUP BY / 增删改 / 建表 / 事务都能跑。
            数据存在内存里，点「重置演示库」可恢复初始数据。
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import CodeEditor from '../components/CodeEditor.vue'
import { labBus, sendToChat } from '../store/lab-bus.js'
import { state, bumpRun, markLessonDone } from '../store/app.js'
import { packForProfile, localizeText, SQL_SAMPLE_TEMPLATE } from '../data/domain-packs.js'
import {
  ensurePyodide, runPython, countInputs, pyState,
} from '../runtime/python.js'
import {
  ensureSql, runSql, listTables, resetDemo, emptyDb, setSqlPack, sqlState,
} from '../runtime/sql.js'

const router = useRouter()

const tab = ref(localStorage.getItem('xiaokun.lab') || 'python')

/** 示例主题、演示库、课程正文都来自同一个领域包，随画像实时切换 */
const pack = computed(() => packForProfile(state.settings.profile || {}))

function buildPySample() {
  const p = pack.value
  const t = p.python
  const custom = (state.settings.profile?.exampleDomainText || '').trim()
  const title = p.isCustom
    ? `通用场景（你的举例领域：${custom.replace(/\n/g, ' ')}）`
    : p.label
  const values = `[${t.values.join(', ')}]`
  return `# 示例：${title}（单位：${t.unit}）—— 改改数字再运行
values = ${values}

over = [v for v in values if v > ${t.threshold}]
print(f"全部数据：{values}")
print(f"${t.high}：{over}")
print(f"平均值：{sum(values) / len(values):.2f} ${t.unit}")

for i, v in enumerate(values, start=1):
    flag = "${t.high}" if v > ${t.threshold} else "${t.low}"
    print(f"  第 {i} ${t.noun}：{v:>7} ${t.unit}  {flag}")

# 试试自己加一句：打印最大值和它的下标
`
}

const pySampleLabel = computed(() => pack.value.label)

const sqlSample = computed(() => localizeText(SQL_SAMPLE_TEMPLATE, pack.value))
const sqlPlaceholder = computed(() => `SELECT * FROM ${pack.value.ids.equipment} LIMIT 5;`)

const pyCode = ref(buildPySample())
const sqlCode = ref(sqlSample.value)
const stdinText = ref('')
const pyOutput = ref('')
const pyOk = ref(true)
const running = ref(false)
const sqlCodeRunning = ref(false)
const sqlResult = ref(null)
const tables = ref([])

const sqlRunning = computed(() => sqlCodeRunning.value)
const inputCount = computed(() => countInputs(pyCode.value))
const engineState = computed(() => (tab.value === 'python' ? pyState : sqlState))

async function refreshTables() {
  if (sqlState.status !== 'ready') return
  tables.value = await listTables()
}

function switchTab(t) {
  tab.value = t
  localStorage.setItem('xiaokun.lab', t)
  if (t === 'sql') refreshTables()
}

async function preload() {
  try {
    if (tab.value === 'python') await ensurePyodide()
    else {
      await ensureSql()
      await refreshTables()
    }
  } catch (e) {
    /* 状态已在 pyState / sqlState 中体现 */
  }
}

/* ---------------- Python ---------------- */
async function runPy() {
  if (running.value) return
  const code = pyCode.value
  if (!code.trim()) return

  running.value = true
  pyOutput.value = ''
  pyOk.value = true

  const lines = stdinText.value ? stdinText.value.split('\n') : []

  try {
    await ensurePyodide()
    const res = await runPython(code, { stdinLines: lines })
    pyOutput.value = res.stdout || '（这段代码没有产生任何输出）\n'
    pyOk.value = res.ok
    if (res.ok) bumpRun()
  } catch (e) {
    pyOutput.value = String(e?.message || e)
    pyOk.value = false
  } finally {
    running.value = false
  }
}

/* ---------------- SQL ---------------- */
async function runSqlNow() {
  if (sqlCodeRunning.value) return
  const code = sqlCode.value
  if (!code.trim()) return

  sqlCodeRunning.value = true
  sqlResult.value = null
  try {
    await ensureSql()
    const r = await runSql(code)
    sqlResult.value = r
    if (r.ok) bumpRun()
    await refreshTables()
  } catch (e) {
    sqlResult.value = { ok: false, blocks: [], error: String(e?.message || e), rowsModified: 0, ms: 0 }
  } finally {
    sqlCodeRunning.value = false
  }
}

async function resetDemoDb() {
  try {
    await ensureSql()
    await resetDemo()
    await refreshTables()
    const msg = localizeText('已重置为初始演示库（12 件商品 + 15 条销售记录）', pack.value)
    sqlResult.value = { ok: true, blocks: [{ type: 'info', text: msg }], rowsModified: 0, ms: 0 }
  } catch (e) {
    sqlResult.value = { ok: false, blocks: [], error: String(e?.message || e), rowsModified: 0, ms: 0 }
  }
}

function insertText(t) {
  const cur = sqlCode.value
  sqlCode.value = cur ? cur.replace(/;\s*$/, '') + `\n\nSELECT * FROM ${t} LIMIT 20;\n` : `SELECT * FROM ${t} LIMIT 20;`
}

/* ---------------- 通用 ---------------- */
function onEditorReset(kind) {
  if (kind === 'run') {
    if (tab.value === 'python') runPy()
    else runSqlNow()
    return
  }
  if (tab.value === 'python') {
    pyCode.value = buildPySample()
    pyOutput.value = ''
  } else {
    sqlCode.value = sqlSample.value
    sqlResult.value = null
  }
}

function loadSample(kind) {
  if (kind === 'python') {
    pyCode.value = buildPySample()
    pyOutput.value = ''
  } else {
    sqlCode.value = sqlSample.value
    sqlResult.value = null
  }
}

function askAboutCode(lang) {
  const code = lang === 'sql' ? sqlCode.value : pyCode.value
  const out = lang === 'sql'
    ? (sqlResult.value?.error || JSON.stringify(sqlResult.value?.blocks || [], null, 1).slice(0, 1200))
    : pyOutput.value
  const prompt = `我在实操台写了这段${lang === 'sql' ? ' SQL' : ' Python'}，请帮我逐行讲清楚，并指出可能的问题：\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n我运行后的输出/报错是：\n\n\`\`\`\n${out}\n\`\`\`\n\n请按：①这段代码想做什么 ②逐行解释 ③有什么坑或可改进处 ④我该补哪个知识点，来回答。`
  sendToChat(prompt, { autoSend: true })
  router.push('/chat')
}

/* ---------------- 课程页传过来的代码 ---------------- */
watch(() => labBus.nonce, () => {
  if (!labBus.code) return
  const lang = labBus.lang || 'python'
  tab.value = lang === 'sql' ? 'sql' : 'python'
  localStorage.setItem('xiaokun.lab', tab.value)
  if (tab.value === 'sql') {
    sqlCode.value = labBus.code
    sqlResult.value = null
  } else {
    pyCode.value = labBus.code
    pyOutput.value = ''
  }
  labBus.code = ''
  nextTick(() => {
    if (tab.value === 'sql') runSqlNow()
    else runPy()
  })
})

/* 画像里的举例领域变了：示例代码、演示库一起换 */
watch(pack, (p) => {
  setSqlPack(p)
  pyCode.value = buildPySample()
  pyOutput.value = ''
  sqlCode.value = sqlSample.value
  sqlResult.value = null
  refreshTables()
})

onMounted(async () => {
  setSqlPack(pack.value)
  if (labBus.code) {
    const lang = labBus.lang || 'python'
    tab.value = lang === 'sql' ? 'sql' : 'python'
    if (tab.value === 'sql') sqlCode.value = labBus.code
    else pyCode.value = labBus.code
    labBus.code = ''
  }
  if (pyState.status === 'ready' || sqlState.status === 'ready') {
    await refreshTables()
  }
})
</script>

<style scoped>
.inputpanel {
  margin-top: 11px; padding: 11px 12px;
  border: 1px dashed var(--amber-bright); border-radius: var(--radius-sm);
  background: var(--amber-soft);
}
.tablelist { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 11px; }
.tablewrap table { width: auto; min-width: 100%; }
.tablewrap th, .tablewrap td { white-space: nowrap; font-family: var(--mono); font-size: 12px; padding: 6px 9px; }
.tablewrap th { background: var(--brand-soft); color: var(--brand-deep); }
</style>
