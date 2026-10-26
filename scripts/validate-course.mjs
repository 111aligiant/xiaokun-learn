/* ============================================================
   课程包校验 CLI
   用法：
     node scripts/validate-course.mjs                  # 校验内置课程
     node scripts/validate-course.mjs my-course.json   # 校验外部课程包
   JSON 可以是单包 { name, course, lessons }，也可以是 { tracks: [...] }
   ============================================================ */
import { readFileSync } from 'node:fs'
import { TRACKS } from '../src/data/courses.js'
import { validateTracks, validateCourse } from './course-schema.mjs'

const problems = []
const report = (level, msg) => problems.push({ level, msg })

const files = process.argv.slice(2)

if (!files.length) {
  validateTracks(TRACKS, report)
  console.log(`校验内置课程：${TRACKS.map((t) => `${t.name} ${t.lessons.length} 节`).join(' / ')}`)
} else {
  for (const file of files) {
    let data
    try {
      data = JSON.parse(readFileSync(file, 'utf-8'))
    } catch (e) {
      report('P0', `${file} 读取或解析失败：${e.message}`)
      continue
    }
    if (Array.isArray(data.tracks)) {
      validateTracks(data.tracks, report)
    } else if (data.course && data.lessons) {
      validateCourse({ name: data.name || file, course: data.course, lessons: data.lessons }, report)
    } else {
      report('P0', `${file} 结构不对：需要 { course, lessons } 或 { tracks: [] }`)
    }
  }
}

const order = ['P0', 'P1', 'P2']
if (!problems.length) {
  console.log('\n✅ 课程包校验通过')
  process.exit(0)
}

console.log(`\n发现 ${problems.length} 个问题：`)
for (const level of order) {
  const list = problems.filter((p) => p.level === level)
  if (!list.length) continue
  console.log(`\n--- ${level} (${list.length}) ---`)
  for (const p of list) console.log(`  ${p.msg}`)
}
process.exit(1)
