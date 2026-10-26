/* ============================================================
   QA 校验脚本：课程包完整性 + prompts 逻辑单测
   运行：node scripts/qa-check.mjs
   ============================================================ */
import { TRACKS } from '../src/data/courses.js'
import {
  LEVEL_PRESETS, buildSystemPrompt, resolveLevelFromPlacement,
} from '../src/data/prompts.js'
import { PROVIDERS, providerOfBaseUrl } from '../src/data/providers.js'
import { validateTracks } from './course-schema.mjs'

const problems = []
const P0 = [], P1 = [], P2 = []
function report(level, msg) {
  problems.push({ level, msg })
  if (level === 'P0') P0.push(msg); else if (level === 'P1') P1.push(msg); else P2.push(msg)
}

// ---------- 课程包 ----------
validateTracks(TRACKS, report)

// ---------- prompts 单测 ----------
const baseSettings = {
  apiKey: 'sk-test', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat',
  temperature: 0.6, teachMode: 'guide', assistantName: '小坤',
  level: 'zero', personaId: 'tutor',
  profile: {
    name: '阿丘', goal: '转行做数据分析', background: '会 Excel',
    exampleDomain: 'data', weeklyMinutes: 120, style: '', constraints: '', language: 'zh-CN',
  },
}
// 5 个档位都能产出 system prompt 且包含对应规则
for (const lv of Object.keys(LEVEL_PRESETS)) {
  const p = buildSystemPrompt({ ...baseSettings, level: lv }, {})
  if (!p.includes('学员当前基础水平')) report('P0', `档位 ${lv} 的 system prompt 缺水平段落`)
  if (!p.includes(LEVEL_PRESETS[lv].label)) report('P0', `档位 ${lv} 的 system prompt 未包含档位名`)
  if (p.length < 500) report('P1', `档位 ${lv} 的 system prompt 异常短: ${p.length}`)
}
// 带课程上下文
const p2 = buildSystemPrompt(baseSettings, {
  track: 'python', lesson: { no: 1, title: '测试课', objectives: ['a'], summary: 'b'.repeat(700) },
})
if (!p2.includes('第 1 节')) report('P1', '课程上下文未注入 no')
if (!p2.includes('bbb')) report('P1', '课程上下文 summary 未截断注入')
// 定级问卷映射
const cases = [
  [['完全没碰过', '没接触过', '10 分钟（摸鱼式）'], 'zero'],
  [['知道 int/str，写过打印', '知道 SELECT，写得很生疏', '30 分钟（认真学）'], 'basic'],
  [['能熟练用 list/dict', '能写 JOIN 和 GROUP BY', '1 小时以上（冲刺）'], 'intermediate'],
  [['都懂，想做项目', '平时工作就在用数据库', '1 小时以上（冲刺）'], 'advanced'],
  [[undefined, undefined, undefined], 'auto'],
]
for (const [ans, expect] of cases) {
  const r = resolveLevelFromPlacement(ans)
  if (r.level !== expect) report('P0', `定级映射错误: ${JSON.stringify(ans)} → ${r.level}（期望 ${expect}）`)
  if (expect !== 'auto' && !r.levelNote) report('P1', '定级后 levelNote 为空')
}
// 学员画像注入
const p3 = buildSystemPrompt(baseSettings, {})
for (const [label, text] of [
  ['称呼', '称呼：阿丘'],
  ['目标', '学习目标：转行做数据分析'],
  ['基础', '已有基础与经历：会 Excel'],
  ['举例领域', '举例优先用数据分析场景'],
  ['每周时间', '每周 120 分钟'],
]) {
  if (!p3.includes(text)) report('P1', `学员画像未注入：${label}`)
}
// 画像留空 → 明确要求模型先问，不猜
const pEmpty = buildSystemPrompt({ ...baseSettings, profile: {} }, {})
if (!pEmpty.includes('第一次对话先用 1~2 个')) report('P1', '画像留空时未提示先探底')
// 自定义举例领域优先于预设
const pCustomDomain = buildSystemPrompt({
  ...baseSettings,
  profile: { ...baseSettings.profile, exampleDomain: 'data', exampleDomainText: '通用电子' },
}, {})
if (!pCustomDomain.includes('通用电子')) report('P0', '自定义举例领域未注入')
if (pCustomDomain.includes('举例优先用数据分析场景')) report('P0', '自定义举例领域未覆盖预设')
// 多平台预设：任意 OpenAI 兼容服务可手填，预设只做快捷填充
if (PROVIDERS.some((pv) => !pv.baseUrl || !pv.model)) report('P0', '平台预设缺 baseUrl/model')
if (providerOfBaseUrl('https://api.openai.com/v1/chat/completions')?.id !== 'openai')
  report('P0', '按 base_url 识别平台失效')
// 人设切换
const pInterview = buildSystemPrompt({ ...baseSettings, personaId: 'interviewer' }, {})
if (!pInterview.includes('负责技术面试的面试官')) report('P0', 'persona 切换失效')
if (!pInterview.includes('评分')) report('P1', '面试官人设缺少评分要求')
// 引导式 vs 直接讲
const pg = buildSystemPrompt({ ...baseSettings, teachMode: 'guide' }, {})
const pd = buildSystemPrompt({ ...baseSettings, teachMode: 'direct' }, {})
if (!pg.includes('引导优先') || !pd.includes('直接讲透')) report('P0', 'teachMode 分支失效')

// ---------- 输出 ----------
console.log(`\n===== 课程数据规模 =====`)
for (const t of TRACKS) {
  console.log(`${t.name.padEnd(6)} ${t.lessons.length} 节 / ${t.course.chapters.length} 章`)
}
const allLessons = TRACKS.flatMap((t) => t.lessons)
const quizCount = allLessons.filter((l) => l.quiz?.length).length
const exCount = allLessons.filter((l) => l.exercise).length
console.log(`带自测题的课时: ${quizCount}，带练习的课时: ${exCount}`)

if (!problems.length) {
  console.log('\n✅ 全部通过，未发现问题')
} else {
  console.log(`\n===== 发现问题 ${problems.length} 个（P0:${P0.length} P1:${P1.length} P2:${P2.length}）=====`)
  for (const [lv, arr] of [['P0', P0], ['P1', P1], ['P2', P2]]) {
    if (!arr.length) continue
    console.log(`\n--- ${lv} (${arr.length}) ---`)
    arr.forEach((m) => console.log(`  ${m}`))
  }
  process.exitCode = 1
}
