<template>
  <div class="chatwrap">
    <!-- 顶栏 -->
    <header class="appbar chatbar">
      <button class="btn btn--icon btn--ghost btn--sm" @click="router.push('/home')">←</button>
      <div class="grow" style="min-width:0" @click="showSessions = true">
        <div class="appbar__title nowrap" style="overflow:hidden;text-overflow:ellipsis">
          {{ s.assistantName }} · {{ sessionTitle }} <span class="caret-hint">▾</span>
        </div>
        <div class="appbar__sub row" style="gap:6px">
          <span class="badge-dot" :class="keyOk ? '' : 'badge-dot--warn'" />
          {{ keyOk ? s.model : '未配置 Key' }}
          <span v-if="ctxLabel && s.useLessonContext" class="ctxchip">{{ ctxLabel }}</span>
        </div>
      </div>
      <button class="btn btn--icon btn--ghost btn--sm" title="新对话" @click="newChat">＋</button>
    </header>

    <!-- 消息区 -->
    <div ref="scrollEl" class="chat-scroll">
      <!-- 空态：欢迎 + 定级 -->
      <div v-if="!messages.length" class="welcome">
        <div class="welcome__avatar">{{ s.assistantName.slice(0, 1) }}</div>
        <div class="welcome__title">我是{{ s.assistantName }}</div>
        <div class="welcome__sub">
          带你从零学 Python 和 SQLite。<br />
          卡在哪、想学什么，直接说。
        </div>

        <!-- 首次定级：让助教摸清你的基础 -->
        <div v-if="showPlacement" class="placement">
          <div class="placement__head" @click="placementOpen = !placementOpen">
            <span>🎯 先花 30 秒，让{{ s.assistantName }}摸清你的底</span>
            <span class="placement__caret">{{ placementOpen ? '收起' : '开始' }}</span>
          </div>
          <div v-if="placementOpen" class="placement__body">
            <div v-for="(q, qi) in PLACEMENT_QUESTIONS" :key="qi" class="placement__q">
              <div class="placement__qt">{{ qi + 1 }}. {{ q.q }}</div>
              <div class="placement__opts">
                <button
                  v-for="op in q.options"
                  :key="op"
                  class="chip"
                  :class="{ 'chip--on': placement[qi] === op }"
                  @click="placement[qi] = op"
                >{{ op }}</button>
              </div>
            </div>
            <button
              class="btn btn--primary btn--block"
              :disabled="!placementReady"
              @click="applyPlacement"
            >{{ placementReady ? '定好了，开始学' : '三题都选一下' }}</button>
            <div class="placement__foot">也可以跳过 —— 直接跟我聊，我在对话里会先问你。</div>
          </div>
        </div>

        <div class="welcome__grid">
          <button
            v-for="a in QUICK_ACTIONS.slice(0, 6)"
            :key="a.id"
            class="welcome__act"
            @click="useAction(a)"
          >
            <span>{{ a.icon }}</span><span>{{ a.label }}</span>
          </button>
        </div>

        <div class="welcome__note">
          提示：我不会直接把练习答案给你，会先问你思路 —— 这样才记得住。
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="{ 'msg--me': m.role === 'user' }">
        <div class="msg__avatar">{{ m.role === 'user' ? (s.profile?.name || '我').slice(0, 1) : s.assistantName.slice(0, 1) }}</div>
        <div class="msg__body">
          <div class="msg__bubble">
            <div v-if="m.role === 'user'" class="usertext">{{ m.content }}</div>
            <template v-else>
              <div v-if="m.reasoning && showReasoning" class="reasoning">
                <div class="reasoning__head" @click="showReasoning = false">思考过程（点此收起）</div>
                <div class="reasoning__body">{{ m.reasoning }}</div>
              </div>
              <MarkdownLite v-if="m.content" :text="m.content" />
              <div v-else-if="m.streaming" class="typing"><i /><i /><i /></div>
            </template>
          </div>
          <div class="msg__time">
            {{ fmtTime(m.at) }}
            <template v-if="m.role === 'assistant' && !m.streaming && m.content">
              · <a @click="copyText(m.content)" style="cursor:pointer">复制</a>
              <template v-if="i === messages.length - 1">
                · <a @click="regenerate(i)" style="cursor:pointer">重答</a>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- 错误 -->
      <div v-if="errorMsg" class="note note--danger" style="margin-top:6px">
        <span>⚠️</span>
        <div class="grow">
          {{ errorMsg }}
          <div v-if="!keyOk" style="margin-top:8px">
            <button class="btn btn--sm btn--amber" @click="router.push('/settings')">去配置 API Key</button>
          </div>
          <div v-else style="margin-top:8px">
            <button class="btn btn--sm btn--ghost" @click="retry">重试</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷指令 -->
    <div v-if="messages.length" class="quickbar">
      <button
        v-for="a in QUICK_ACTIONS"
        :key="a.id"
        class="chip"
        @click="useAction(a)"
      >{{ a.icon }} {{ a.label }}</button>
    </div>

    <!-- 输入区 -->
    <div class="composer">
      <div v-if="ctxLabel && s.useLessonContext" class="ctxbanner">
        <span>📎 已带上上下文：{{ ctxLabel }}</span>
        <a @click="clearCtx" style="cursor:pointer">移除</a>
      </div>
      <div class="composer__box">
        <textarea
          ref="inputEl"
          v-model="draft"
          class="composer__input"
          rows="1"
          placeholder="问点什么…（Enter 换行，点右侧发送）"
          @keydown.enter.exact.prevent="send"
          @input="autoGrow"
        />
        <button
          class="composer__send"
          :class="{ 'composer__send--stop': streaming }"
          :disabled="!streaming && !draft.trim()"
          @click="streaming ? stop() : send()"
        >
          <span v-if="streaming">■</span>
          <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none"
               stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12h15" /><path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 会话列表弹层 -->
    <div v-if="showSessions" class="sheetmask" @click.self="showSessions = false">
      <div class="sheet">
        <div class="sheet__head">
          <div class="strong">对话历史（{{ sortedSessions.length }}）</div>
          <button class="btn btn--sm btn--ghost" @click="showSessions = false">关闭</button>
        </div>
        <div class="sheet__body">
          <div v-if="!sortedSessions.length" class="empty small">还没有历史对话</div>
          <div
            v-for="x in sortedSessions"
            :key="x.id"
            class="list-item"
            :class="{ 'list-item--active': x.id === state.activeSessionId }"
            @click="renameId !== x.id && switchSession(x.id)"
          >
            <div class="grow" style="min-width:0">
              <template v-if="renameId === x.id">
                <input
                  v-model="renameText"
                  class="rename-input"
                  maxlength="24"
                  placeholder="输入新名称"
                  @click.stop
                  @keyup.enter="commitRename(x.id)"
                  @blur="commitRename(x.id)"
                />
              </template>
              <template v-else>
                <div class="strong nowrap" style="overflow:hidden;text-overflow:ellipsis">{{ x.title }}</div>
                <div class="tiny muted">{{ x.messages.length }} 条消息 · {{ fmtRel(x.at) }}</div>
              </template>
            </div>
            <button class="btn btn--sm btn--ghost" title="重命名" @click.stop="beginRename(x)">✎</button>
            <button
              class="btn btn--sm"
              :class="delId === x.id ? 'btn--amber' : 'btn--ghost'"
              @click.stop="del(x.id)"
            >{{ delId === x.id ? '确认?' : '删' }}</button>
          </div>
        </div>
        <div v-if="sortedSessions.length" class="sheet__foot">
          <button class="btn btn--sm" :class="clearArm ? 'btn--amber' : 'btn--ghost'" @click="clearAll">
            {{ clearArm ? '再点一次，确认清空全部' : '清空全部对话' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 轻提示 -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownLite from '../components/MarkdownLite.vue'
import { state, createSession, deleteSession, startNewSession, renameSession, clearAllSessions, bumpAsk, updateSettings, updateProfile } from '../store/app.js'
import { labBus } from '../store/lab-bus.js'
import { chat } from '../api/llm.js'
import { findLesson, trackOf } from '../data/courses.js'
import { packForProfile, localizeLesson } from '../data/domain-packs.js'
import {
  buildSystemPrompt, QUICK_ACTIONS, PLACEMENT_QUESTIONS, resolveLevelFromPlacement,
} from '../data/prompts.js'

const router = useRouter()
const s = computed(() => state.settings)
const keyOk = computed(() => !!state.settings.apiKey.trim())

const draft = ref('')
const streaming = ref(false)
const errorMsg = ref('')
const showReasoning = ref(false)
const showSessions = ref(false)
const scrollEl = ref(null)
const inputEl = ref(null)

/* ---------- 首次定级问卷 ---------- */
/** 每题选中的选项文本；null 表示还没选 */
const placement = ref(PLACEMENT_QUESTIONS.map(() => null))
const placementOpen = ref(false)
const placementReady = computed(() => placement.value.every((x) => !!x))
/** 是否该展示定级入口：水平还没定（auto）且是这个会话的第一句话之前 */
const showPlacement = computed(
  () => !messages.value.length && s.value.level === 'auto' && !placementAnswered.value
)
const placementAnswered = ref(false)

/** 选完三题 → 写入水平档位 + 把基础情况作为第一条消息发给助教 */
function applyPlacement() {
  if (!placementReady.value) return
  const { level, levelNote } = resolveLevelFromPlacement(placement.value)
  updateSettings({ level })
  const bg = (s.value.profile?.background || '').trim()
  updateProfile({ background: bg ? `${bg}；${levelNote}` : levelNote })
  placementAnswered.value = true
  placementOpen.value = false
  draft.value = `（我的基础情况：${levelNote}）\n\n请按这个基础，告诉我先从哪一节开始、怎么学。`
  send()
}

let controller = null

/* ---------- 会话 ---------- */
/** 当前会话（只读；不存在时由 watcher 负责创建，避免在 computed 里改 state） */
const currentSession = computed(
  () => state.sessions.find((x) => x.id === state.activeSessionId) || null
)
const messages = computed(() => currentSession.value?.messages || [])

/** 会话里只存 { track, lessonId }，在这里解析成课程对象 */
function resolveCtx(ctx) {
  if (!ctx?.track || !ctx?.lessonId) return null
  return findLesson(ctx.track, ctx.lessonId)
}
function localizedCtx(ctx) {
  const lesson = resolveCtx(ctx)
  if (!lesson) return null
  const pack = packForProfile(s.value.profile || {})
  return localizeLesson(lesson, pack, { identifiers: ctx.track === 'sql' })
}
const currentLesson = computed(() => localizedCtx(currentSession.value?.ctx))

/** 确保有一个可用会话，返回它 */
function ensureSession() {
  let s = state.sessions.find((x) => x.id === state.activeSessionId)
  if (!s) s = createSession('新对话')
  if (!Array.isArray(s.messages)) s.messages = []
  if (!('ctx' in s)) s.ctx = null
  return s
}

const sessionTitle = computed(() => currentSession.value?.title || '新对话')

/* ---------- 轻提示 ---------- */
const toast = ref('')
let toastTimer = null
function showToast(t) {
  toast.value = t
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2800)
}

function newChat() {
  if (streaming.value) stop()
  const had = !!currentSession.value?.messages.length
  startNewSession()
  draft.value = ''
  errorMsg.value = ''
  showSessions.value = false
  if (had) showToast('已切到新对话 · 旧对话点顶栏标题可找回')
  nextTick(() => inputEl.value?.focus())
}

function switchSession(id) {
  if (streaming.value) stop()
  state.activeSessionId = id
  draft.value = ''
  errorMsg.value = ''
  showSessions.value = false
  scrollToBottom()
}

/* ---------- 会话历史列表 ---------- */
/** 按最近活跃时间倒序展示 */
const sortedSessions = computed(() =>
  [...state.sessions].sort((a, b) => (b.at || 0) - (a.at || 0))
)

function fmtRel(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (d.toDateString() === now.toDateString()) return `今天 ${hm}`
  const yd = new Date(now)
  yd.setDate(now.getDate() - 1)
  if (d.toDateString() === yd.toDateString()) return `昨天 ${hm}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`
}

/* 重命名 */
const renameId = ref(null)
const renameText = ref('')
function beginRename(x) {
  renameId.value = x.id
  renameText.value = x.title
}
function commitRename(id) {
  if (renameId.value !== id) return
  const t = renameText.value.trim()
  if (t) renameSession(id, t)
  renameId.value = null
}

/* 两步删除：第一次点变"确认?"，3 秒内再点才真删，防误触 */
const delId = ref(null)
let delTimer = null
function del(id) {
  if (delId.value !== id) {
    delId.value = id
    if (delTimer) clearTimeout(delTimer)
    delTimer = setTimeout(() => (delId.value = null), 3000)
    return
  }
  delId.value = null
  deleteSession(id)
  showToast('已删除')
}

/* 清空全部：同样两步确认 */
const clearArm = ref(false)
let clearTimer = null
function clearAll() {
  if (!clearArm.value) {
    clearArm.value = true
    if (clearTimer) clearTimeout(clearTimer)
    clearTimer = setTimeout(() => (clearArm.value = false), 3000)
    return
  }
  clearArm.value = false
  clearAllSessions()
  startNewSession()
  showSessions.value = false
  showToast('已清空全部对话')
}

/* ---------- 上下文 ---------- */
const ctxLabel = computed(() => {
  const l = currentLesson.value
  const ctx = currentSession.value?.ctx
  if (!l || !ctx) return ''
  return `${trackOf(ctx.track).name} · ${l.title}`
})

function clearCtx() {
  if (currentSession.value) currentSession.value.ctx = null
}

/* ---------- 发送 ---------- */
function autoGrow() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 130) + 'px'
}

function scrollToBottom() {
  nextTick(() => {
    const el = scrollEl.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function fmtTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function useAction(a) {
  if (a.needsInput) {
    draft.value = a.prompt
    nextTick(() => {
      autoGrow()
      inputEl.value?.focus()
    })
    return
  }
  draft.value = a.prompt
  send()
}

async function send() {
  const text = draft.value.trim()
  if (!text || streaming.value) return

  const sess = ensureSession()
  errorMsg.value = ''

  sess.messages.push({ role: 'user', content: text, at: Date.now() })
  sess.at = Date.now()
  if (sess.messages.filter((m) => m.role === 'user').length === 1) {
    sess.title = text.slice(0, 18) + (text.length > 18 ? '…' : '')
  }
  draft.value = ''
  nextTick(() => {
    if (inputEl.value) inputEl.value.style.height = 'auto'
  })
  scrollToBottom()

  const lesson = s.value.useLessonContext ? localizedCtx(sess.ctx) : null
  const ctx = lesson
    ? { track: sess.ctx.track, lesson, trackName: trackOf(sess.ctx.track).name }
    : {}

  const systemPrompt = buildSystemPrompt(s.value, ctx)

  // 必须在插入 assistant 占位之前取历史：响应式数组会把对象包成代理，
  // 之后再用对象引用去过滤会失效，导致空 assistant 消息混进请求。
  const dialog = sess.messages.slice()
  const recent = dialog.slice(-14)
  let history = recent.map((m) => ({ role: m.role, content: m.content }))
  const firstUser = dialog.find((m) => m.role === 'user')
  if (dialog.length > 14 && firstUser && !recent.includes(firstUser)) {
    history = [{ role: 'user', content: `（本会话最先问的是）${firstUser.content}` }, ...history]
  }

  const assistantMsg = { role: 'assistant', content: '', reasoning: '', at: Date.now(), streaming: true }
  sess.messages.push(assistantMsg)
  streaming.value = true
  bumpAsk()
  scrollToBottom()

  controller = new AbortController()
  const myController = controller

  try {
    await chat({
      messages: [{ role: 'system', content: systemPrompt }, ...history],
      settings: s.value,
      signal: myController.signal,
      onDelta(delta, meta) {
        if (meta?.reasoning) assistantMsg.reasoning += meta.reasoning
        if (delta) {
          assistantMsg.content += delta
          scrollToBottom()
        }
      },
    })
  } catch (e) {
    const msg = String(e?.message || e)
    if (/已取消/.test(msg)) {
      if (!assistantMsg.content) assistantMsg.content = '_（已取消）_'
    } else {
      errorMsg.value = msg
      if (!assistantMsg.content) sess.messages.pop()
    }
  } finally {
    assistantMsg.streaming = false
    // 只有仍是当前请求时才复位全局状态，避免旧请求把新请求的 streaming/controller 清掉
    if (controller === myController) {
      streaming.value = false
      controller = null
    }
    scrollToBottom()
  }
}

function stop() {
  if (controller) controller.abort()
  streaming.value = false
}

function retry() {
  const sess = ensureSession()
  // 去掉最后一条失败的 assistant
  if (sess.messages.at(-1)?.role === 'assistant') sess.messages.pop()
  const lastUser = [...sess.messages].reverse().find((m) => m.role === 'user')
  if (lastUser) {
    sess.messages.pop()
    draft.value = lastUser.content
    send()
  }
}

function regenerate(idx) {
  const sess = ensureSession()
  const target = sess.messages[idx]
  if (!target || target.role !== 'assistant') return
  // 从这条回答开始截断，重新回答它前面的那个提问
  let ui = idx - 1
  while (ui >= 0 && sess.messages[ui].role !== 'user') ui--
  if (ui < 0) return
  const text = sess.messages[ui].content
  sess.messages.splice(ui)
  draft.value = text
  send()
}

async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t)
  } catch (_) {
    const ta = document.createElement('textarea')
    ta.value = t
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

/** 会话被删空 / 首次进入时，补一个可用会话 */
watch(
  () => [state.activeSessionId, state.sessions.length],
  () => {
    if (!state.sessions.find((x) => x.id === state.activeSessionId)) {
      if (!state.sessions.length) createSession('新对话')
      else state.activeSessionId = state.sessions[0].id
    }
  },
  { immediate: true }
)

/* ---------- 外部注入（从首页/课程/实操台跳过来） ---------- */
/** 外部入口一律开新会话：当前会话有内容就新建，空会话则复用并改写上下文 */
function openFromBus() {
  if (!labBus.prompt) return
  const prompt = labBus.prompt
  const ctx = labBus.ctx
  const autoSend = labBus.autoSend
  labBus.prompt = ''
  labBus.ctx = null
  labBus.autoSend = false
  if (streaming.value) stop()
  const sess = startNewSession()
  sess.ctx = ctx ? { ...ctx } : null
  errorMsg.value = ''
  draft.value = prompt
  if (autoSend) {
    send()
  } else {
    nextTick(() => {
      autoGrow()
      inputEl.value?.focus()
    })
  }
}

watch(() => labBus.nonce, openFromBus)

onMounted(() => {
  // 清理旧版本点 ＋ 堆出来的多余空会话：最多保留一个
  const empties = state.sessions.filter((x) => !x.messages.length)
  if (empties.length > 1) {
    const keepId = state.activeSessionId
    state.sessions = state.sessions.filter(
      (x) => x.messages.length || x.id === keepId || x.id === empties[0].id
    )
  }
  if (!state.sessions.length) createSession('新对话')
  if (!state.sessions.find((x) => x.id === state.activeSessionId)) {
    state.activeSessionId = state.sessions[0].id
  }
  openFromBus()
  scrollToBottom()
})

onUnmounted(() => {
  if (controller) controller.abort()
})
</script>

<style scoped>
.chatwrap {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  background: var(--bg);
  padding-bottom: calc(var(--tabbar-h) + var(--safe-b));
}
.chatbar { flex: none; position: static; }
.ctxchip {
  background: var(--brand-soft); color: var(--brand);
  border-radius: 6px; padding: 1px 6px; font-size: 10.5px; font-weight: 700;
}
.chat-scroll { flex: 1; min-height: 0; }

.welcome { padding: 26px 20px 10px; text-align: center; }
.welcome__avatar {
  width: 54px; height: 54px; margin: 0 auto 12px; border-radius: 18px;
  background: linear-gradient(135deg, var(--brand-mid), var(--brand));
  color: #fff; display: grid; place-items: center;
  font-size: 24px; font-weight: 800;
  box-shadow: 0 6px 18px rgba(15,81,50,.2);
}
.welcome__title { font-size: 18px; font-weight: 700; }
.welcome__sub { font-size: 13px; color: var(--muted); margin-top: 7px; line-height: 1.7; }
.welcome__grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 9px;
  margin-top: 20px; text-align: left;
}
.welcome__act {
  display: flex; align-items: center; gap: 7px;
  padding: 11px 12px; border-radius: var(--radius-sm);
  border: 1px solid var(--line); background: var(--surface);
  font-size: 13px; font-weight: 600; cursor: pointer;
  box-shadow: var(--shadow);
}
.welcome__act:active { transform: scale(.98); }
.welcome__note {
  margin-top: 18px; font-size: 11.5px; color: var(--muted);
  border-top: 1px solid var(--line); padding-top: 14px; line-height: 1.7;
}

.placement {
  margin-top: 18px; text-align: left;
  border: 1px solid var(--brand-soft2); background: var(--brand-soft);
  border-radius: var(--radius-sm); overflow: hidden;
}
.placement__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 12px; font-size: 13px; font-weight: 600; color: var(--brand);
  cursor: pointer;
}
.placement__caret { font-size: 12px; font-weight: 700; }
.placement__body { padding: 0 12px 12px; }
.placement__q { margin-bottom: 12px; }
.placement__qt { font-size: 12.5px; font-weight: 600; color: var(--ink-2); margin-bottom: 7px; }
.placement__opts { display: flex; flex-wrap: wrap; gap: 7px; }
.placement__opts .chip { font-size: 12px; padding: 5px 10px; }
.placement__foot { font-size: 11px; color: var(--muted); margin-top: 9px; line-height: 1.6; }

.usertext { white-space: pre-wrap; word-break: break-word; }

.reasoning {
  margin-bottom: 9px; border-radius: 9px; overflow: hidden;
  border: 1px solid var(--line); background: var(--surface-2);
}
.reasoning__head {
  padding: 6px 10px; font-size: 11.5px; font-weight: 700;
  color: var(--muted); cursor: pointer; background: #f1efe8;
}
.reasoning__body {
  padding: 9px 10px; font-size: 12px; color: var(--ink-2);
  white-space: pre-wrap; max-height: 200px; overflow-y: auto; line-height: 1.6;
}

.ctxbanner {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; color: var(--brand);
  background: var(--brand-soft); border: 1px solid var(--brand-soft2);
  border-radius: 9px; padding: 5px 10px; margin-bottom: 7px;
}
.composer__send--stop { background: var(--danger); }

.sheetmask {
  position: fixed; inset: 0; z-index: 60;
  background: rgba(20,32,28,.36);
  display: flex; align-items: flex-end;
  backdrop-filter: blur(2px);
}
.sheet {
  width: 100%; max-height: 72vh;
  background: var(--surface);
  border-radius: 20px 20px 0 0;
  padding: 14px 14px calc(18px + var(--safe-b));
  display: flex; flex-direction: column;
}
.sheet__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.sheet__body { overflow-y: auto; }
.sheet__foot {
  border-top: 1px solid var(--line);
  margin-top: 10px; padding-top: 10px;
  display: flex; justify-content: center;
}
.caret-hint { font-size: 11px; opacity: .55; }
.rename-input {
  width: 100%;
  border: 1px solid var(--brand-soft2);
  border-radius: 8px;
  padding: 6px 9px;
  font-size: 13.5px;
  background: var(--surface);
  color: var(--ink);
  outline: none;
}
.toast {
  position: fixed; left: 50%;
  bottom: calc(var(--tabbar-h) + var(--safe-b) + 78px);
  transform: translateX(-50%);
  background: rgba(28,40,35,.92); color: #fff;
  font-size: 12.5px; padding: 8px 15px; border-radius: 20px;
  z-index: 80; max-width: 86vw; text-align: center;
  box-shadow: 0 6px 18px rgba(0,0,0,.18);
  pointer-events: none;
}
</style>
