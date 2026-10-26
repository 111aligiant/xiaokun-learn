/* 课程内容 → 实操台的代码搬运通道 */
import { reactive } from 'vue'

export const labBus = reactive({
  code: '',
  lang: '',      // 'python' | 'sql'
  nonce: 0,
  /** 送给助教的预设问题（课程页点"问助教"时用） */
  prompt: '',
  /** 随问题带过去的课程上下文：{ track, lessonId } */
  ctx: null,
  /** 跳转后是否直接发送（true）还是先放进输入框（false） */
  autoSend: false,
})

export function sendToLab(code, lang) {
  labBus.code = code
  labBus.lang = lang
  labBus.nonce++
}

/**
 * 从其它页面打开助教：总是开一个新会话，不承接当前会话。
 * @param {string} prompt
 * @param {{ ctx?: {track:string, lessonId:string}|null, autoSend?: boolean }} options
 */
export function sendToChat(prompt, { ctx = null, autoSend = false } = {}) {
  labBus.prompt = prompt
  labBus.ctx = ctx ? { ...ctx } : null
  labBus.autoSend = !!autoSend
  labBus.nonce++
}
