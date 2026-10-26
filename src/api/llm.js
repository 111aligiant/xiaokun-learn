/* ============================================================
   OpenAI 兼容对话接口（DeepSeek / OpenAI / 通义 / 智谱 等）
   - 流式（SSE）优先，自动降级为非流式
   - 友好错误提示
   ============================================================ */

/** 把各种失败翻译成人话 */
export function humanizeError(errOrRes, status) {
  const s = status || errOrRes?.status
  if (s === 401) return 'API Key 无效或已过期。到「我的 → 模型接入」检查一下 Key 有没有复制完整（前后不要有空格）。'
  if (s === 402) return '账户余额不足，去所用模型平台的控制台充值。'
  if (s === 429) return '请求太频繁，被限流了。等 10 秒再发，或换一个更轻量的模型。'
  if (s === 400) return `请求被拒绝（400）。通常是模型名写错，或上下文太长了。${errOrRes?.message ? ' 详情：' + errOrRes.message : ''}`
  if (s === 403) return '没有权限访问该模型，检查一下模型名是否开通了。'
  if (s === 404) return `接口地址可能不对（404）。检查 base_url 是否少了 /v1，或路径写错了。${errOrRes?.message ? ' 详情：' + errOrRes.message : ''}`
  if (s >= 500) return '模型服务端出错了，稍等片刻重试。'
  const m = String(errOrRes?.message || errOrRes || '')
  if (/Failed to fetch|NetworkError|Load failed|ERR_/i.test(m)) {
    return '网络连不上模型服务。检查：①手机有没有网 ②接口地址是否写对 ③是否开着 VPN/代理。'
  }
  if (/aborted|AbortError/i.test(m)) return '已取消。'
  return m || '未知错误'
}

/**
 * 发起一次对话
 * @param {object} opts
 * @param {Array}  opts.messages   [{role, content}]
 * @param {object} opts.settings   {apiKey, baseUrl, model, temperature, stream}
 * @param {Function} opts.onDelta  (增量文本) => void
 * @param {AbortSignal} opts.signal
 * @returns {Promise<string>} 完整回复文本
 */
export async function chat({ messages, settings, onDelta, signal }) {
  if (!settings.apiKey || !settings.apiKey.trim()) {
    throw new Error('还没有配置 API Key。到「我的 → 模型接入」里填一下。')
  }

  const url = normalizeBase(settings.baseUrl) + '/chat/completions'
  const body = {
    model: settings.model || 'deepseek-chat',
    messages,
    temperature: typeof settings.temperature === 'number' ? settings.temperature : 0.6,
    stream: !!settings.stream,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    let detail = null
    try {
      detail = await res.json()
    } catch (_) { /* ignore */ }
    const msg = detail?.error?.message || detail?.message || ''
    throw new Error(humanizeError({ message: msg }, res.status))
  }

  const ct = res.headers.get('content-type') || ''

  // ---- 非流式 ----
  if (!settings.stream || !ct.includes('text/event-stream') || !res.body) {
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || ''
    if (onDelta && text) onDelta(text)
    return text
  }

  // ---- 流式 ----
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let full = ''
  let reasoning = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n')
    buffer = parts.pop() || ''

    for (const rawLine of parts) {
      const line = rawLine.trim()
      if (!line || line.startsWith(':')) continue
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') continue
      let json
      try {
        json = JSON.parse(payload)
      } catch (_) {
        continue
      }
      const delta = json?.choices?.[0]?.delta || {}
      if (delta.reasoning_content) {
        reasoning += delta.reasoning_content
        if (onDelta) onDelta('', { reasoning: delta.reasoning_content })
      }
      if (delta.content) {
        full += delta.content
        if (onDelta) onDelta(delta.content)
      }
    }
  }

  return full || reasoning
}

function normalizeBase(base) {
  let b = (base || 'https://api.deepseek.com').trim().replace(/\/+$/, '')
  // 允许用户只填域名
  if (!/\/v\d+$/.test(b) && !/\/chat\/completions$/.test(b)) {
    // DeepSeek 兼容不带 /v1；OpenAI 风格一般带 /v1。让用户自己决定，
    // 这里只在用户填的是裸域名时补 /v1
    if (/^https?:\/\/[^/]+$/.test(b)) {
      b += /deepseek\.com/.test(b) ? '' : '/v1'
    }
  }
  if (/\/chat\/completions$/.test(b)) b = b.replace(/\/chat\/completions$/, '')
  return b
}

/** 连通性测试：花最少的 token 验证 Key 是否可用 */
export async function testConnection(settings) {
  const url = normalizeBase(settings.baseUrl) + '/chat/completions'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(settings.apiKey || '').trim()}`,
    },
    body: JSON.stringify({
      model: settings.model || 'deepseek-chat',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 4,
      stream: false,
    }),
  })
  if (!res.ok) {
    let d = null
    try { d = await res.json() } catch (_) {}
    throw new Error(humanizeError({ message: d?.error?.message || '' }, res.status))
  }
  const data = await res.json()
  return {
    ok: true,
    model: data?.model || settings.model,
    usage: data?.usage || null,
  }
}

/** 估算 token（粗略：中文约 1.6 字/token，英文约 4 字符/token） */
export function estTokens(text) {
  if (!text) return 0
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const other = text.length - cjk
  return Math.ceil(cjk / 1.6 + other / 4)
}
