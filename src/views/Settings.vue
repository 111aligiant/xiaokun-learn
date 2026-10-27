<template>
  <div>
    <header class="appbar">
      <div class="grow">
        <div class="appbar__title">我的</div>
        <div class="appbar__sub">设置、数据与关于</div>
      </div>
    </header>

    <div class="page">
      <!-- 状态卡 -->
      <div class="card" :class="keyOk ? 'card--flat' : 'card--brand'">
        <div class="row row--between">
          <div class="grow">
            <div class="strong">{{ keyOk ? 'API 已配置' : '还差一步：配置 API Key' }}</div>
            <div class="small" :class="keyOk ? 'muted' : ''" style="margin-top:3px">
              {{ keyOk ? `当前模型：${s.model}` : '配置后助教才能回答问题' }}
            </div>
          </div>
          <span class="badge-dot" :class="keyOk ? '' : 'badge-dot--warn'" />
        </div>
      </div>

      <!-- ============ API 设置 ============ -->
      <div class="section-title">模型接入</div>

      <div class="field">
        <label class="field__label">常用平台（可选）</label>
        <div class="scroll-x">
          <button
            v-for="pv in PROVIDERS"
            :key="pv.id"
            class="chip"
            :class="{ 'chip--on': activeProvider?.id === pv.id }"
            @click="applyProvider(pv)"
          >{{ pv.label }}</button>
        </div>
        <div class="field__hint">点一下自动填接口地址和模型；下面三项都可以手改，任意 OpenAI 兼容服务都行。</div>
      </div>

      <div class="field">
        <label class="field__label">API Key</label>
        <div class="row">
          <input
            class="input grow"
            :type="showKey ? 'text' : 'password'"
            v-model="form.apiKey"
            placeholder="sk-..."
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <button class="btn btn--sm btn--ghost" @click="showKey = !showKey">
            {{ showKey ? '隐藏' : '显示' }}
          </button>
        </div>
        <div class="field__hint">
          去你所用平台的开放平台创建 Key。Key 只保存在这台手机上，不会发给任何第三方。
        </div>
      </div>

      <div class="field">
        <label class="field__label">接口地址 base_url</label>
        <input class="input" v-model="form.baseUrl" placeholder="https://api.deepseek.com" />
        <div class="field__hint">
          填服务商给的接口地址，通常以 <code class="code--inline">/v1</code> 结尾；
          DeepSeek 可填 <code class="code--inline">https://api.deepseek.com</code>。
        </div>
      </div>

      <div class="field">
        <label class="field__label">模型</label>
        <input class="input" v-model="form.model" placeholder="例如 deepseek-flash / gpt-4o-mini" />
        <div class="field__hint">
          填服务商文档里的模型 ID。不同平台的速度和价格不同，日常学习用便宜的即可。
        </div>
      </div>

      <div class="field">
        <label class="field__label">回答随机性 temperature：{{ form.temperature }}</label>
        <input
          class="input"
          type="range" min="0" max="1.5" step="0.1"
          v-model.number="form.temperature"
          style="padding:0"
        />
        <div class="field__hint">
          学知识建议 0.3~0.6（稳、准确）；想要更多思路和联想可以调到 0.9 以上。
        </div>
      </div>

      <div class="field">
        <label class="row" style="gap:9px;cursor:pointer">
          <input type="checkbox" v-model="form.stream" style="width:18px;height:18px" />
          <span>流式输出（打字机效果，推荐开启）</span>
        </label>
      </div>

      <div class="row" style="gap:9px;margin-bottom:8px">
        <button class="btn btn--primary grow" :disabled="testing || !form.apiKey" @click="doTest">
          {{ testing ? '测试中…' : '测试连接' }}
        </button>
        <button class="btn btn--ghost" @click="saveApi">保存</button>
      </div>

      <div v-if="testResult" class="note" :class="testResult.ok ? 'note--ok' : 'note--danger'">
        <span>{{ testResult.ok ? '✓' : '⚠️' }}</span>
        <div class="grow">
          {{ testResult.ok ? `连接成功，模型 ${testResult.model} 可用。` : testResult.msg }}
        </div>
      </div>

      <!-- ============ 基础水平 ============ -->
      <div class="section-title">基础水平（决定助教讲多深）</div>

      <div class="field">
        <div class="levelgrid">
          <button
            v-for="l in LEVEL_LIST"
            :key="l.id"
            class="levelcard"
            :class="{ 'levelcard--on': form.level === l.id }"
            @click="form.level = l.id"
          >
            <span class="levelcard__t">{{ l.label }}</span>
            <span class="levelcard__s">{{ l.short }}</span>
          </button>
        </div>
        <div class="field__hint">
          选中的档位会写进每一条对话的设定：决定助教用不用术语、代码写几行、要不要解释基础概念。改完立即生效。
        </div>
      </div>

      <!-- ============ 学员背景 ============ -->
      <div class="section-title">学员背景（决定助教怎么讲、拿什么举例）</div>

      <div class="card card--flat">
        <div class="kvrow"><span class="muted small">称呼</span><span class="strong">{{ p.name || '未填写' }}</span></div>
        <div class="kvrow"><span class="muted small">学习目标</span><span class="strong kvrow__v">{{ p.goal || '未填写' }}</span></div>
        <div class="kvrow"><span class="muted small">举例取材</span><span class="strong">{{ p.exampleDomainText || domainOf(p).label }}</span></div>
        <div class="kvrow">
          <span class="muted small">每周投入</span>
          <span class="strong">{{ p.weeklyMinutes > 0 ? `${p.weeklyMinutes} 分钟` : '未填写' }}</span>
        </div>
        <div class="kvrow"><span class="muted small">已有基础</span><span class="strong kvrow__v">{{ p.background || '未填写' }}</span></div>
      </div>
      <button class="btn btn--ghost btn--block" style="margin-top:10px" @click="editingProfile = true">
        编辑学员背景
      </button>
      <div class="field__hint" style="margin-top:8px">
        背景会写进每一条对话的设定：目标、基础、举例领域、每周时间。留空的部分助教不会瞎猜。
      </div>

      <!-- ============ 教学方式 ============ -->
      <div class="section-title">教学方式</div>

      <div class="field">
        <label class="field__label">助教人设</label>
        <div class="persongrid">
          <button
            v-for="p2 in PERSONAS"
            :key="p2.id"
            class="levelcard"
            :class="{ 'levelcard--on': form.personaId === p2.id }"
            @click="form.personaId = p2.id"
          >
            <span class="levelcard__t">{{ p2.label }}</span>
            <span class="levelcard__s">{{ p2.short }}</span>
          </button>
        </div>
        <div class="field__hint">人设决定语气与推进方式；真正"讲多深"由上面的基础水平决定。</div>
      </div>

      <div class="field">
        <label class="field__label">助教风格</label>
        <div class="seg">
          <button
            class="seg__item"
            :class="{ 'seg__item--on': form.teachMode === 'guide' }"
            @click="form.teachMode = 'guide'"
          >引导式</button>
          <button
            class="seg__item"
            :class="{ 'seg__item--on': form.teachMode === 'direct' }"
            @click="form.teachMode = 'direct'"
          >直接讲</button>
        </div>
        <div class="field__hint">
          <b>引导式</b>：练习不给答案，先反问你思路（学得快、记得牢，推荐）<br />
          <b>直接讲</b>：直接给完整解法并逐行解释（赶时间、对答案时用）
        </div>
      </div>

      <div class="field">
        <label class="row" style="gap:9px;cursor:pointer">
          <input type="checkbox" v-model="form.useLessonContext" style="width:18px;height:18px" />
          <span>对话时自动带上"我正在学的这一节"</span>
        </label>
        <div class="field__hint">开启后助教会知道你学到哪，不会超前讲没学过的语法。</div>
      </div>

      <div class="row" style="gap:10px">
        <div class="field grow" style="margin-bottom:0">
          <label class="field__label">助教叫什么</label>
          <input class="input" v-model="form.assistantName" placeholder="小鲲" />
        </div>
        <div class="field grow" style="margin-bottom:0">
          <label class="field__label">怎么称呼你</label>
          <input class="input" v-model="profileName" placeholder="可留空" />
        </div>
      </div>

      <button class="btn btn--primary btn--block" style="margin-top:16px" @click="saveAll">
        保存全部设置
      </button>
      <div v-if="savedTip" class="note note--ok" style="margin-top:10px">
        <span>✓</span><span>已保存</span>
      </div>

      <!-- ============ 数据 ============ -->
      <div class="section-title">我的数据</div>

      <div class="card card--flat">
        <div class="kvrow"><span class="muted small">完成小节</span><span class="strong">{{ doneCount }} 节</span></div>
        <div class="kvrow"><span class="muted small">连续学习</span><span class="strong">{{ streakDays }} 天</span></div>
        <div class="kvrow"><span class="muted small">累计提问</span><span class="strong">{{ state.stats.askCount }} 次</span></div>
        <div class="kvrow"><span class="muted small">运行代码</span><span class="strong">{{ state.stats.runCount }} 次</span></div>
        <div class="kvrow"><span class="muted small">对话会话</span><span class="strong">{{ state.sessions.length }} 个</span></div>
        <div class="kvrow"><span class="muted small">本地存储</span><span class="strong">{{ storageKB }} KB</span></div>
      </div>

      <div class="col" style="margin-top:12px">
        <button class="btn btn--ghost btn--block" @click="exportData">导出我的数据（JSON）</button>
        <button class="btn btn--ghost btn--block" @click="showImport = !showImport">导入数据</button>
        <div class="field__hint" style="margin-top:2px">
          备份包含进度、笔记和对话，<b>不包含 API Key</b>；导入后沿用本机已配置的 Key。
        </div>
        <textarea
          v-if="showImport"
          class="textarea"
          v-model="importText"
          placeholder="把之前导出的 JSON 粘到这里，然后点下面的「确认导入」"
          style="font-family:var(--mono);font-size:12px"
        />
        <button v-if="showImport" class="btn btn--amber btn--block" @click="doImport">确认导入</button>
      </div>

      <div class="section-title">危险操作</div>
      <div class="col">
        <button class="btn btn--block" style="color:var(--danger);border-color:#f0cdc9" @click="clearChats">
          清空所有对话记录（保留课程进度）
        </button>
        <button class="btn btn--block" style="color:var(--danger);border-color:#f0cdc9" @click="wipe">
          重置全部数据（清空进度、笔记、对话）
        </button>
      </div>

      <!-- ============ 关于 ============ -->
      <div class="section-title">关于</div>
      <div class="card card--flat">
        <div class="strong">{{ s.assistantName }} · 学编程</div>
        <div class="small muted" style="margin-top:5px;line-height:1.75">
          一个跑在你手机上的 AI 私教，课程和人设都可替换。<br />
          界面与课程完全离线；只有向模型提问时才联网。<br />
          Python 代码用 Pyodide（WebAssembly 版 CPython）在本机执行，
          SQL 用 SQLite 内核在本机执行 —— 你的代码不经过任何服务器。
        </div>
        <hr class="hr" />
        <div class="kvrow"><span class="muted small">版本</span><span class="strong">{{ version }}</span></div>
        <div class="kvrow"><span class="muted small">课程量</span><span class="strong">{{ courseSummary }}</span></div>
        <div class="kvrow"><span class="muted small">API 提供商</span><span class="strong">任意 OpenAI 兼容服务</span></div>
      </div>

      <div class="tiny muted center" style="margin:22px 0 6px;line-height:1.8">
        有问题先问{{ s.assistantName }}：它知道自己是谁、也知道<br />你的学习进度。
      </div>
    </div>

    <ProfileWizard v-if="editingProfile" edit @close="onWizardClose" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  state, updateSettings, updateProfile, doneCount, streakDays, exportState, importState, wipeAll, clearAllSessions,
} from '../store/app.js'
import { testConnection } from '../api/llm.js'
import { LEVEL_PRESETS } from '../data/prompts.js'
import { domainOf } from '../data/profile.js'
import { PROVIDERS, providerOfBaseUrl } from '../data/providers.js'
import { PERSONA_PRESETS } from '../data/persona.js'
import { TRACKS } from '../data/courses.js'
import ProfileWizard from '../components/ProfileWizard.vue'

const s = computed(() => state.settings)
const p = computed(() => state.settings.profile || {})
const version = __APP_VERSION__
const courseSummary = TRACKS.map((t) => `${t.name} ${t.lessons.length} 节`).join(' + ')

const PERSONAS = Object.values(PERSONA_PRESETS)

/** 基础水平档位（来自 prompts.js，保证与提示词规则同源） */
const LEVEL_LIST = Object.entries(LEVEL_PRESETS).map(([id, v]) => ({ id, ...v }))

const form = reactive({
  apiKey: '',
  baseUrl: '',
  model: '',
  temperature: 0.6,
  stream: true,
  teachMode: 'guide',
  useLessonContext: true,
  personaId: 'tutor',
  assistantName: '小鲲',
  level: 'auto',
})

const activeProvider = computed(() => providerOfBaseUrl(form.baseUrl))

const showKey = ref(false)
const testing = ref(false)
const testResult = ref(null)
const savedTip = ref(false)
const showImport = ref(false)
const importText = ref('')
const editingProfile = ref(false)
const keyOk = computed(() => !!form.apiKey.trim())

const profileName = computed({
  get: () => p.value.name || '',
  set: (v) => updateProfile({ name: v }),
})

const storageKB = ref(0)

function syncForm() {
  Object.keys(form).forEach((k) => {
    if (s.value[k] !== undefined) form[k] = s.value[k]
  })
}

function onWizardClose() {
  editingProfile.value = false
  syncForm()
}

onMounted(() => {
  syncForm()
  try {
    const raw = localStorage.getItem('xiaokun.state.v1') || ''
    storageKB.value = Math.round((raw.length / 1024) * 10) / 10
  } catch (_) {}
})

function applyProvider(pv) {
  form.baseUrl = pv.baseUrl
  form.model = pv.model
}

function saveApi() {
  const baseUrl = form.baseUrl.trim() || 'https://api.deepseek.com'
  updateSettings({
    apiKey: form.apiKey.trim(),
    baseUrl,
    model: form.model.trim() || providerOfBaseUrl(baseUrl)?.model || 'deepseek-flash',
    temperature: form.temperature,
    stream: form.stream,
  })
  flash()
}

function saveAll() {
  updateSettings({ ...form })
  flash()
}

function flash() {
  savedTip.value = true
  setTimeout(() => (savedTip.value = false), 1600)
}

async function doTest() {
  testing.value = true
  testResult.value = null
  saveApi()
  try {
    const r = await testConnection({
      apiKey: form.apiKey,
      baseUrl: form.baseUrl,
      model: form.model,
    })
    testResult.value = { ok: true, model: r.model }
  } catch (e) {
    testResult.value = { ok: false, msg: String(e?.message || e) }
  } finally {
    testing.value = false
  }
}

function exportData() {
  const json = exportState()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  a.href = url
  a.download = `xiaokun-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}

function doImport() {
  try {
    importState(importText.value)
    importText.value = ''
    showImport.value = false
    syncForm()
    alert('导入成功')
  } catch (e) {
    alert('导入失败：JSON 格式不对\n' + String(e?.message || e))
  }
}

function clearChats() {
  if (confirm('确定清空所有对话记录？此操作不可恢复。')) clearAllSessions()
}

function wipe() {
  if (confirm('确定重置全部数据？进度、笔记、对话都会清空，API Key 也会被清除。此操作不可恢复。')) {
    wipeAll()
    syncForm()
  }
}
</script>

<style scoped>
.kvrow {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 0; border-bottom: 1px solid var(--line);
}
.kvrow:last-child { border-bottom: none; }
.kvrow__v {
  max-width: 62%; text-align: right; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.levelgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.persongrid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.persongrid .levelcard { padding: 9px 10px; }
.levelcard {
  display: flex; flex-direction: column; gap: 3px; text-align: left;
  padding: 10px 12px; border-radius: var(--radius-sm);
  border: 1px solid var(--line); background: var(--surface);
  cursor: pointer;
}
.levelcard--on { border-color: var(--brand); background: var(--brand-soft); }
.levelcard__t { font-size: 13px; font-weight: 700; color: var(--ink); }
.levelcard__s { font-size: 11px; color: var(--muted); line-height: 1.5; }
.levelcard--on .levelcard__t { color: var(--brand); }
</style>
