/* ============================================================
   课程包校验规则
   —— qa-check 与 validate-course 共用，避免两套标准
   —— 课程包结构：{ id, name, icon, lang, extension, course, lessons }
   ============================================================ */

export const BLOCK_TYPES = ['h', 'p', 'code', 'ul', 'ol', 'tip', 'warn', 'note', 'kv', 'table']
export const CODE_LANGS = ['python', 'sql', 'bash', 'text']
export const TRACK_LANGS = ['python', 'sql']

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

/** 校验课时与章节，report(level, msg) 由调用方提供 */
export function validateCourse({ name, course, lessons }, report) {
  if (!course || !Array.isArray(course.chapters)) {
    report('P0', `[${name}] course.chapters 不是数组`)
    return
  }
  if (!Array.isArray(lessons) || !lessons.length) {
    report('P0', `[${name}] lessons 为空`)
    return
  }

  // 1. 课时 id 唯一
  const ids = new Set()
  for (const l of lessons) {
    if (ids.has(l.id)) report('P0', `[${name}] 课时 id 重复: ${l.id}`)
    ids.add(l.id)
  }

  // 2. 章节覆盖：所有课时必须挂在某个章节下
  const inChapters = new Set(course.chapters.flatMap((c) => (c.lessons || []).map((l) => l.id)))
  for (const l of lessons) {
    if (!inChapters.has(l.id)) report('P1', `[${name}] 课时不在任何章节里: ${l.id} 《${l.title}》`)
  }
  const chapterLessonIds = course.chapters.flatMap((c) => (c.lessons || []).map((l) => l.id))
  if (chapterLessonIds.length !== new Set(chapterLessonIds).size) {
    report('P1', `[${name}] 章节里有重复课时`)
  }
  if (chapterLessonIds.length !== lessons.length) {
    report('P1', `[${name}] 章节课时数(${chapterLessonIds.length}) != 课时总数(${lessons.length})`)
  }

  // 3. 章节字段
  const chapterIds = new Set()
  for (const ch of course.chapters) {
    if (!ch?.id) report('P0', `[${name}] 章节缺 id`)
    else if (chapterIds.has(ch.id)) report('P0', `[${name}] 章节 id 重复: ${ch.id}`)
    chapterIds.add(ch?.id)
    if (!isNonEmptyString(ch?.title)) report('P1', `[${name}] 章节 ${ch?.id} 缺 title`)
    if (!Array.isArray(ch?.lessons) || !ch.lessons.length) report('P1', `[${name}] 章节 ${ch?.id} 没有课时`)
  }

  // 4. 课时内容
  for (const l of lessons) {
    const tag = `[${name} 第${l.no}节 ${l.title}]`
    if (!isNonEmptyString(l.id)) report('P0', `${tag} 缺 id`)
    if (!Number.isInteger(l.no) || l.no < 1) report('P2', `${tag} no 应为正整数`)
    if (!isNonEmptyString(l.title)) report('P0', `${tag} 缺 title`)
    if (!Array.isArray(l.objectives) || !l.objectives.length) report('P1', `${tag} 缺 objectives`)
    if (!isNonEmptyString(l.summary)) report('P1', `${tag} 缺 summary（助教课程上下文会为空）`)
    if (!Array.isArray(l.blocks) || !l.blocks.length) report('P1', `${tag} blocks 为空`)
    if (!l.minutes || !l.level) report('P2', `${tag} 缺 minutes/level`)

    ;(l.blocks || []).forEach((b, i) => {
      if (!Array.isArray(b) || !BLOCK_TYPES.includes(b[0])) {
        report('P0', `${tag} blocks[${i}] 类型非法: ${JSON.stringify(b?.[0])}`)
        return
      }
      if (b[0] === 'code') {
        if (!CODE_LANGS.includes(b[1])) report('P1', `${tag} blocks[${i}] code 语言异常: ${b[1]}`)
        if (!isNonEmptyString(b[2])) report('P1', `${tag} blocks[${i}] 代码为空`)
      } else if (['h', 'p', 'tip', 'warn', 'note'].includes(b[0])) {
        // NaN 通常是"单引号字符串里又出现单引号"把表达式劈成 'A' / 'B' 造成的
        if (b[1] === null || (typeof b[1] === 'number' && Number.isNaN(b[1])) || b[1] === undefined) {
          report('P0', `${tag} blocks[${i}] ${b[0]} 内容为 NaN/null —— 八成是字符串引号嵌套错误`)
        } else if (!isNonEmptyString(b[1])) {
          report('P1', `${tag} blocks[${i}] ${b[0]} 内容为空`)
        }
      } else if (b[0] === 'ul' || b[0] === 'ol') {
        if (!Array.isArray(b[1]) || !b[1].length) report('P1', `${tag} blocks[${i}] 列表为空`)
      } else if (b[0] === 'kv') {
        if (!Array.isArray(b[1]) || !b[1].length) report('P1', `${tag} blocks[${i}] kv 为空`)
        else if (b[1].some((r) => !Array.isArray(r) || r.length < 2)) report('P1', `${tag} blocks[${i}] kv 行结构错`)
      } else if (b[0] === 'table') {
        if (!Array.isArray(b[1]) || !b[1].length) report('P1', `${tag} blocks[${i}] 表头为空`)
        const rows = b.slice(2)
        const bad = rows.find((r) => !Array.isArray(r) || r.length !== b[1].length)
        if (bad) report('P1', `${tag} blocks[${i}] 表格某行列数与表头不一致`)
      }
    })

    if (l.quiz && l.quiz.length) {
      l.quiz.forEach((q, qi) => {
        if (!Array.isArray(q.options) || q.options.length < 2) report('P0', `${tag} quiz[${qi}] 选项不足 2 个`)
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length || 0)) {
          report('P0', `${tag} quiz[${qi}] answer 索引越界: ${q.answer}（选项数 ${q.options?.length}）`)
        }
        if (!q.explain) report('P2', `${tag} quiz[${qi}] 缺 explain`)
      })
    }

    if (l.exercise) {
      const ex = l.exercise
      if (!isNonEmptyString(ex.task)) report('P1', `${tag} exercise 缺 task`)
      if (!isNonEmptyString(ex.hint)) report('P2', `${tag} exercise 缺 hint`)
      if (!isNonEmptyString(ex.answer)) report('P1', `${tag} exercise 缺 answer`)
    }
  }
}

/** 校验注册表层面的元信息 + 全局 id 唯一 */
export function validateTracks(tracks, report) {
  if (!Array.isArray(tracks) || !tracks.length) {
    report('P0', '课程注册表为空')
    return
  }
  const trackIds = new Set()
  const lessonIds = new Set()
  for (const t of tracks) {
    if (!isNonEmptyString(t?.id)) report('P0', '课程缺 id')
    else if (trackIds.has(t.id)) report('P0', `课程 id 重复: ${t.id}`)
    trackIds.add(t?.id)

    if (!isNonEmptyString(t?.name)) report('P0', `[${t?.id}] 缺 name`)
    if (!TRACK_LANGS.includes(t?.lang)) report('P0', `[${t?.id}] lang 必须是 ${TRACK_LANGS.join(' / ')}`)
    if (!isNonEmptyString(t?.extension)) report('P1', `[${t?.id}] 缺 extension（练习文件后缀）`)

    for (const l of t.lessons || []) {
      if (lessonIds.has(l.id)) report('P0', `课时 id 跨课程重复: ${l.id}`)
      lessonIds.add(l.id)
    }
    validateCourse({ name: t.name || t.id, course: t.course, lessons: t.lessons }, report)
  }
}
