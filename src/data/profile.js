/* ============================================================
   学员背景画像（profile）
   —— 开源模板的核心：所有个人化信息都在这里，不写死在提示词里
   —— 所有字段都可留空；空字段不会注入提示词
   ============================================================ */

export const DEFAULT_PROFILE = {
  /** 称呼，空 = 不显示具体称呼 */
  name: '',
  /** 学习目标：决定选题方向与鼓励方式 */
  goal: '',
  /** 已有基础/经历：会什么、不会什么 */
  background: '',
  /** 举例取材领域：预设 id，或 'custom' 表示用下面的自由输入 */
  exampleDomain: 'general',
  /** 学员自由填写的举例领域，非空时优先于预设 */
  exampleDomainText: '',
  /** 每周可投入分钟数，0 = 未填 */
  weeklyMinutes: 0,
  /** 学习偏好，例如"先原理后代码" */
  style: '',
  /** 现实约束，例如"手机为主、碎片时间" */
  constraints: '',
  /** 输出语言 */
  language: 'zh-CN',
}

export const EXAMPLE_DOMAINS = [
  {
    id: 'ai-app',
    label: 'AI 应用开发',
    hint: '调模型 API、RAG、智能体',
    rule: '举例优先用 AI 应用开发场景：调用大模型 API、解析模型返回的 JSON、批量处理文本、prompt 模板组装、知识库检索、Token/成本统计。',
  },
  {
    id: 'data',
    label: '数据分析',
    hint: '表格、统计、报表',
    rule: '举例优先用数据分析场景：读取表格、清洗数据、分组统计、生成报表、把结果画成图。',
  },
  {
    id: 'office',
    label: '办公自动化',
    hint: '文件批处理、表格汇总',
    rule: '举例优先用办公自动化场景：批量改文件名、汇总多个 Excel、核对清单、按模板生成文档。',
  },
  {
    id: 'backend',
    label: '后端 / 数据库',
    hint: '接口、SQL、服务',
    rule: '举例优先用后端与数据库场景：接口参数校验、SQL 查询、数据一致性、日志排查、定时任务。',
  },
  {
    id: 'general',
    label: '通用',
    hint: '不绑定行业',
    rule: '用日常生活和通用软件场景举例，不要绑定某个具体行业。',
  },
]

export const WEEKLY_TIME_OPTIONS = [
  { value: 60, label: '每周 1 小时内' },
  { value: 120, label: '每周 2 小时' },
  { value: 210, label: '每周 3~4 小时' },
  { value: 420, label: '每周 7 小时以上' },
  { value: 0, label: '还没定' },
]

export function domainOf(profile) {
  return EXAMPLE_DOMAINS.find((d) => d.id === profile?.exampleDomain) || EXAMPLE_DOMAINS[4]
}

/** 把学员画像渲染成 system prompt 的一段 */
export function renderProfileSection(profile = DEFAULT_PROFILE) {
  const p = { ...DEFAULT_PROFILE, ...profile }
  const lines = []

  if (p.name) lines.push(`- 称呼：${p.name}`)
  if (p.goal) lines.push(`- 学习目标：${p.goal}`)
  if (p.background) lines.push(`- 已有基础与经历：${p.background}`)
  if (p.weeklyMinutes > 0) {
    lines.push(`- 可投入时间：约每周 ${p.weeklyMinutes} 分钟。安排学习量和练习量时按这个节奏来。`)
  }
  if (p.style) lines.push(`- 学习偏好：${p.style}`)
  if (p.constraints) lines.push(`- 现实约束：${p.constraints}`)
  if (p.language) {
    const lang = p.language === 'zh-CN' ? '简体中文' : p.language
    lines.push(`- 输出语言：${lang}`)
  }
  const customDomain = (p.exampleDomainText || '').trim()
  lines.push(
    `- 举例取材：${customDomain
      ? `优先用「${customDomain}」领域的场景举例；找不到合适类比时，再用通用软件场景。`
      : domainOf(p).rule}`
  )

  let out = `\n\n## 学员背景（用它来决定讲什么、怎么举例）\n${lines.join('\n')}`
  if (!customDomain && domainOf(p).id === 'general') {
    out += '\n- 学员没有指定行业：出题和举例一律用通用场景（购物、订单、记账、成绩、天气、文件整理），**不要**默认绑定某个特定行业。'
  }
  if (!p.goal || !p.background) {
    out += '\n- 学员还没填写完整的目标或基础：第一次对话先用 1~2 个一句话能答完的问题补齐，别假设。'
  }
  return out
}
