/* ============================================================
   助教提示词组装
   —— 人设（persona）+ 学员背景（profile）+ 水平 + 当前课程
   —— 稳定内容放前面，动态内容放后面，利于模型侧上下文缓存
   ============================================================ */
import { renderPersonaSection } from './persona.js'
import { renderProfileSection } from './profile.js'

/* ============================================================
   学员基础水平 —— 决定"讲多深"的核心开关
   level 由「首次引导」或「我的 → 基础水平」写入，会注入每一条 system prompt
   ============================================================ */
export const LEVEL_PRESETS = {
  zero: {
    label: '完全零基础',
    short: '没写过一行代码',
    rule: '学员**从没写过代码**。每个术语第一次出现都要用大白话解释，不要假设他知道"变量""函数""参数""循环"是什么；例子从 3~5 行起步，能用 print 演示就先 print。**禁止**使用列表推导、装饰器、类、生成器等进阶写法。',
  },
  basic: {
    label: '会一点',
    short: '知道变量/循环，没写过完整程序',
    rule: '学员知道变量、循环、if 大概是干什么的，但**没独立写过完整程序**。讲新概念时先跟他已知的东西搭桥；示例 5~10 行；可以用他会的基础语法解释新知识，但先不要用列表推导、装饰器这类"进阶写法"。',
  },
  intermediate: {
    label: '能写脚本',
    short: '能照教程改代码、写过小脚本',
    rule: '学员**能照着教程改代码、写过能跑起来的小脚本**。可以直接讲写法和取舍；仍要指出"新手容易写出的坏习惯"；可以引入列表推导、字典推导、常用标准库，但**一次只多给一个新东西**。',
  },
  advanced: {
    label: '想进阶/实战',
    short: '基础扎实，冲工程化',
    rule: '学员基础扎实，目标是**工程化与真实项目**。可以讲性能、边界条件、异常处理、代码组织，直接对标生产代码；仍要用学员背景里的真实场景落地，不要讲空泛的最佳实践。',
  },
  auto: {
    label: '让助教探底',
    short: '首次对话由助教判断',
    rule: '学员**还没告诉你他的水平**。第一次对话先别急着开讲：用 2~3 个一句话能答完的小问题快速探底（例如"你写过 for 循环吗""知道字典是什么吗"），根据回答判断深浅，之后一律按判断出的难度讲，并在回复里顺带说一句"我按你现在的基础来"。',
  },
}

/** 把「基础水平」渲染成一段注入 system prompt 的文字 */
export function renderLevelSection(settings) {
  const lv = LEVEL_PRESETS[settings.level] || LEVEL_PRESETS.auto
  return `\n\n## 学员当前基础水平（决定讲多深，务必遵守）
- 自评档位：**${lv.label}**（${lv.short}）
- 讲解要求：${lv.rule}`
}

/** 首次定级问卷：新学员第一次用，30 秒定档 */
export const PLACEMENT_QUESTIONS = [
  {
    q: '变量和数据类型，你大概什么水平？',
    options: ['完全没碰过', '知道 int/str，写过打印', '能熟练用 list/dict', '都懂，想做项目'],
  },
  {
    q: '数据库 / SQL 你接触过吗？',
    options: ['没接触过', '知道 SELECT，写得很生疏', '能写 JOIN 和 GROUP BY', '平时工作就在用数据库'],
  },
  {
    q: '每天大概能挤出多少时间学？',
    options: ['10 分钟（摸鱼式）', '30 分钟（认真学）', '1 小时以上（冲刺）'],
  },
]

/** 第 1 题的答案索引 → 水平档位 */
const LEVEL_BY_Q1 = ['zero', 'basic', 'intermediate', 'advanced']

/**
 * 把定级问卷的答案转成 { level, levelNote }
 * @param {string[]} answers 三题各自选中的选项文本
 */
export function resolveLevelFromPlacement(answers) {
  const idx = PLACEMENT_QUESTIONS[0].options.indexOf(answers?.[0])
  const level = LEVEL_BY_Q1[idx] || 'auto'
  const parts = []
  if (answers?.[0]) parts.push(`变量/数据类型：${answers[0]}`)
  if (answers?.[1]) parts.push(`数据库/SQL：${answers[1]}`)
  if (answers?.[2]) parts.push(`每天可投入：${answers[2]}`)
  return { level, levelNote: parts.join('；') }
}

/** 主动出题 / 批改 / 复习等快捷指令 */
export const QUICK_ACTIONS = [
  {
    id: 'explain_code',
    label: '逐行讲代码',
    icon: '📖',
    prompt: '请把我下面这段代码逐行讲清楚（每一行在做什么、为什么这么写），最后指出其中最容易犯错的地方：\n\n```\n\n```',
    needsInput: true,
  },
  {
    id: 'quiz3',
    label: '出3道题',
    icon: '✍️',
    prompt: '根据我当前正在学的进度，出 3 道难度递进的练习题（不要给答案，我做完再发给你批改）。每题说明考察的知识点。场景按「学员背景 → 举例取材」来选；如果我还没填背景，就用购物、订单、记账这类通用场景，不要套用某个特定行业设定。',
  },
  {
    id: 'review_code',
    label: '批改我的代码',
    icon: '🔍',
    prompt: '请批改我下面的代码。按这个结构回答：①能跑通吗 ②逻辑对不对 ③命名/风格问题 ④更 Pythonic 的写法 ⑤我需要补的知识点。\n\n```\n\n```',
    needsInput: true,
  },
  {
    id: 'debug',
    label: '帮我找 bug',
    icon: '🐞',
    prompt: '我的代码报错了，我贴出代码和报错信息。请先猜最可能的 3 个原因，再告诉我怎么一步步定位（不要直接给修好的代码）：\n\n```\n\n```\n\n报错信息：\n\n```\n\n```',
    needsInput: true,
  },
  {
    id: 'real_case',
    label: '给个真实案例',
    icon: '🤖',
    prompt: '用我所在领域（见学员背景里的"举例取材"）的真实场景举一个例子，说明这个知识点能解决什么实际问题。给出可运行的代码。',
  },
  {
    id: 'interview',
    label: '面试会怎么问',
    icon: '💼',
    prompt: '把这个知识点在面试中的典型问法列出来（3～5 个），按"初级→资深"排序，每个给出加分回答的要点。',
  },
  {
    id: 'summarize',
    label: '总结成卡片',
    icon: '🗂️',
    prompt: '把我们刚才讨论的内容压缩成一张"速查卡"：核心概念（≤3 条）、必背语法（代码）、3 个易错点、1 个练习。要能贴在手机备忘录里随时看。',
  },
  {
    id: 'stuck',
    label: '我卡住了',
    icon: '🆘',
    prompt: '我卡住了，完全不知道从哪下手。请只给我"下一步该做什么"（1 条，具体到今天就能动手的动作），不要讲大道理。',
  },
]

function renderLessonSection(ctx) {
  if (!ctx?.lesson || !ctx.track) return ''
  const trackName = ctx.trackName || ctx.track
  return `\n\n## 学员当前进度
- 正在学：**${trackName} 路线 · 第 ${ctx.lesson.no} 节《${ctx.lesson.title}》**
- 本节学习目标：${(ctx.lesson.objectives || []).join('；') || '见正文'}
- 回答时默认假设学员刚学到这里，不要跳到他没学过的语法（如装饰器、生成器等）。

本节正文摘要（供你判断学员已知什么）：
"""
${(ctx.lesson.summary || '').slice(0, 600)}
"""`
}

/** 组装 system prompt */
export function buildSystemPrompt(settings, ctx = {}) {
  let p = renderPersonaSection(settings)
  p += renderProfileSection(settings.profile)
  p += renderLevelSection(settings)
  p += renderLessonSection(ctx)
  if (ctx.extra) p += `\n\n## 本次额外要求\n${ctx.extra}`
  return p
}
