/* ============================================================
   全局状态：设置 / 学习进度 / 对话历史
   持久化：localStorage（App 本地，不上传任何服务器）
   ============================================================ */
import { reactive, watch, computed } from 'vue'
import { DEFAULT_PROFILE } from '../data/profile.js'

const LS_KEY = 'xiaokun.state.v1'

const DEFAULT_SETTINGS = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-flash',
  temperature: 0.6,
  /** 'guide' = 引导式（不直接给答案，先提问引导） | 'direct' = 直接讲透 */
  teachMode: 'guide',
  /** 是否开启流式输出 */
  stream: true,
  /** 对话里是否自动带上当前课程上下文 */
  useLessonContext: true,
  /** 学员背景画像，见 data/profile.js */
  profile: { ...DEFAULT_PROFILE },
  /** 助教人设预设 id，见 data/persona.js */
  personaId: 'tutor',
  /** 助教名字 */
  assistantName: '小坤',
  /**
   * 学员基础水平：'zero' | 'basic' | 'intermediate' | 'advanced' | 'auto'
   * 会注入每一条 system prompt，决定讲多深。'auto' = 首次由助教探底。
   */
  level: 'auto',
}

const DEFAULT_STATE = {
  /** 是否完成首次引导（学员背景 + 人设 + 模型） */
  onboarded: false,
  settings: { ...DEFAULT_SETTINGS },
  /** lessonId -> { done: true, at: 时间戳 } */
  progress: {},
  /** lessonId -> 学习笔记 */
  notes: {},
  /** 最近打开的课程 */
  lastLesson: null,
  /** 打卡记录：'2026-09-14' -> true */
  checkins: {},
  /** 对话会话 */
  sessions: [],
  activeSessionId: null,
  /** 统计 */
  stats: { askCount: 0, runCount: 0, createdAt: Date.now() },
}

function normalizeState(parsed = {}) {
  const base = JSON.parse(JSON.stringify(DEFAULT_STATE))
  const settings = {
    ...base.settings,
    ...(parsed.settings || {}),
    profile: { ...base.settings.profile, ...(parsed.settings?.profile || {}) },
  }

  // 旧版本字段迁移：myName → profile.name，levelNote → profile.background
  if (!settings.profile.name && parsed.settings?.myName) {
    settings.profile.name = parsed.settings.myName
  }
  if (!settings.profile.background && parsed.settings?.levelNote) {
    settings.profile.background = parsed.settings.levelNote
  }
  // 旧默认名跟随模板改名；用户自己改过的名字不动
  if (settings.assistantName === '小鲲' || settings.assistantName === '坤坤') {
    settings.assistantName = '小坤'
  }
  delete settings.myName
  delete settings.levelNote

  const merged = {
    ...base,
    ...parsed,
    settings,
    stats: { ...base.stats, ...(parsed.stats || {}) },
  }
  delete merged.exportedAt

  // 老用户（已有 Key / 进度 / 会话）不弹首次引导
  if (parsed.onboarded === undefined) {
    merged.onboarded = !!(
      settings.apiKey ||
      (parsed.sessions && parsed.sessions.length) ||
      (parsed.progress && Object.keys(parsed.progress).length)
    )
  }
  return merged
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return normalizeState({})
    return normalizeState(JSON.parse(raw))
  } catch (e) {
    console.warn('读取本地状态失败，使用默认值', e)
    return normalizeState({})
  }
}

export const state = reactive(load())

let saveTimer = null
function persist() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('保存失败', e)
    }
  }, 220)
}
watch(state, persist, { deep: true })

/** 立即落盘：App 切后台/关闭时调用，消除 220ms 防抖窗口内丢消息的风险 */
export function flushPersist() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('立即保存失败', e)
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushPersist()
})
window.addEventListener('pagehide', flushPersist)

/* ---------------- 设置 ---------------- */
export const hasApiKey = computed(() => !!state.settings.apiKey.trim())

export function updateSettings(patch) {
  Object.assign(state.settings, patch)
}

/** 只改学员背景，避免覆盖其它设置 */
export function updateProfile(patch) {
  Object.assign(state.settings.profile, patch)
}

export function resetSettings() {
  const profile = { ...state.settings.profile }
  Object.assign(state.settings, DEFAULT_SETTINGS, { profile })
}

/* ---------------- 学习进度 ---------------- */
export function markLessonDone(lessonId) {
  state.progress[lessonId] = { done: true, at: Date.now() }
  checkin()
}

export function toggleLessonDone(lessonId) {
  if (state.progress[lessonId]?.done) {
    delete state.progress[lessonId]
  } else {
    state.progress[lessonId] = { done: true, at: Date.now() }
    checkin()
  }
}

export function isLessonDone(lessonId) {
  return !!state.progress[lessonId]?.done
}

export function setLastLesson(track, lessonId) {
  state.lastLesson = { track, lessonId, at: Date.now() }
}

export function setNote(lessonId, text) {
  if (text && text.trim()) state.notes[lessonId] = text
  else delete state.notes[lessonId]
}

/* ---------------- 打卡 ---------------- */
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function checkin() {
  state.checkins[todayKey()] = true
}

export const todayChecked = computed(() => !!state.checkins[todayKey()])

/** 连续打卡天数（从今天/昨天往前数） */
export const streakDays = computed(() => {
  const keys = Object.keys(state.checkins)
  if (!keys.length) return 0
  const set = new Set(keys)
  const d = new Date()
  const fmt = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  if (!set.has(fmt(d))) {
    d.setDate(d.getDate() - 1)
    if (!set.has(fmt(d))) return 0
  }
  let n = 0
  const cur = new Date(d)
  while (set.has(fmt(cur))) {
    n++
    cur.setDate(cur.getDate() - 1)
  }
  return n
})

export const doneCount = computed(() => Object.values(state.progress).filter((x) => x?.done).length)

/* ---------------- 对话会话 ---------------- */
let seq = 0

/**
 * ctx: { track: 'python'|'sql', lessonId } 或 null
 * 课程上下文属于单个会话，不全局共享——新会话默认不带任何上下文。
 */
export function createSession(title = '新对话', ctx = null) {
  const s = {
    id: `s_${Date.now()}_${(seq++).toString(36)}`,
    title,
    messages: [],
    at: Date.now(),
    ctx: ctx ? { ...ctx } : null,
  }
  state.sessions.unshift(s)
  state.activeSessionId = s.id
  return s
}

/**
 * 「新对话」按钮的正确行为：
 * ① 当前已是空会话 → 直接复用，不重复创建
 * ② 顺带清掉其它空的"新对话"，避免历史列表被垃圾填满、旧对话被淹没
 * ③ 创建新会话（旧的有消息的会话原样保留，随时可从历史切回）
 */
export function startNewSession() {
  const cur = state.sessions.find((x) => x.id === state.activeSessionId)
  if (cur && !(cur.messages && cur.messages.length)) return cur
  state.sessions = state.sessions.filter(
    (x) => (x.messages && x.messages.length) || x.id === cur?.id
  )
  return createSession('新对话')
}

export function renameSession(id, title) {
  const s = state.sessions.find((x) => x.id === id)
  if (s && title) s.title = title
}

export function deleteSession(id) {
  const i = state.sessions.findIndex((x) => x.id === id)
  if (i >= 0) state.sessions.splice(i, 1)
  if (state.activeSessionId === id) state.activeSessionId = state.sessions[0]?.id || null
}

export function clearAllSessions() {
  state.sessions = []
  state.activeSessionId = null
}

/* ---------------- 统计 ---------------- */
export function bumpAsk() {
  state.stats.askCount++
}
export function bumpRun() {
  state.stats.runCount++
}

/* ---------------- 备份 / 恢复 ---------------- */
/**
 * 导出不含 API Key 的快照：备份文件经常被传到网盘/聊天工具，
 * Key 不应该跟着离开这台设备。
 */
export function exportState() {
  const snapshot = JSON.parse(JSON.stringify(state))
  if (snapshot.settings) snapshot.settings.apiKey = ''
  snapshot.exportedAt = Date.now()
  return JSON.stringify(snapshot, null, 2)
}

export function importState(json) {
  const parsed = JSON.parse(json)
  const next = normalizeState(parsed)
  // 备份里通常不带 Key；为空时保留当前设备上的 Key，避免导入后突然不能用
  if (!next.settings.apiKey) next.settings.apiKey = state.settings.apiKey
  Object.assign(state, next)
}

export function wipeAll() {
  Object.keys(state).forEach((k) => delete state[k])
  Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_STATE)))
}

/* ---------------- 课程上下文 ---------------- */
/** 会话上下文只存 { track, lessonId }，由视图层按课程数据解析成课程对象 */
