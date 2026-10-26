/* ============================================================
   模型平台快捷预设
   —— 只是帮你把 base_url 和模型名填进去，三项都还能手改
   —— 任何 OpenAI 兼容服务都可以直接填地址和模型
   ============================================================ */

export const PROVIDERS = [
  {
    id: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  {
    id: 'dashscope',
    label: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
  },
  {
    id: 'zhipu',
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
  },
  {
    id: 'moonshot',
    label: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
  },
  {
    id: 'siliconflow',
    label: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V3',
  },
]

/** 按 base_url 的域名反查预设，用于高亮当前平台 */
export function providerOfBaseUrl(baseUrl) {
  let host = ''
  try {
    host = new URL((baseUrl || '').trim()).host.toLowerCase()
  } catch (_) {
    return null
  }
  if (!host) return null
  return PROVIDERS.find((p) => {
    try {
      return new URL(p.baseUrl).host.toLowerCase() === host
    } catch (_) {
      return false
    }
  }) || null
}
