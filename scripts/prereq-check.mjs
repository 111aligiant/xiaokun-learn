/* 零基础适配性启发式检查：语法特征在"教学之前"是否被正文/练习代码使用 */
import { PY_LESSONS } from '../src/data/python-course.js'
import { SQL_LESSONS } from '../src/data/sql-course.js'

// 特征 → 首次正式教学的课时号（按上方 objectives 大纲）
const FEATURES = [
  { name: 'f-string', re: /\bf['"]/ , taughtAt: 3 },
  { name: 'input()', re: /(?<![\w.])input\s*\(/, taughtAt: 4 },
  { name: 'int()/float() 转换', re: /(?<![\w.])(int|float)\s*\(/, taughtAt: 4 },
  { name: 'if/elif', re: /(^|\n)\s*(if|elif)\s+/, taughtAt: 5 },
  { name: 'for 循环', re: /(^|\n)\s*for\s+\w+\s+in\s/, taughtAt: 6 },
  { name: 'while', re: /(^|\n)\s*while\s+/, taughtAt: 6 },
  { name: 'break/continue', re: /\b(break|continue)\b/, taughtAt: 7 },
  { name: 'enumerate', re: /\benumerate\s*\(/, taughtAt: 6 },
  { name: 'range()', re: /\brange\s*\(/, taughtAt: 6 },
  { name: '列表索引/切片 [..]', re: /\]\[|\[\s*-?\d+\s*(?::|])|\[:/, taughtAt: 8, skipIf: /(^|\n)\s*(kv|ul)/ },
  { name: '列表方法 append', re: /\.append\s*\(/, taughtAt: 8 },
  { name: '字典', re: /\{\s*['"][^'"]+['"]\s*:/, taughtAt: 9 },
  { name: '列表推导式', re: /\[\s*\w+\s+for\s+/, taughtAt: 10 },
  { name: 'zip', re: /\bzip\s*\(/, taughtAt: 10 },
  { name: 'strip/split/join', re: /\.(strip|split|join|replace)\s*\(/, taughtAt: 11 },
  { name: 'def 函数', re: /(^|\n)\s*def\s+\w+\s*\(/, taughtAt: 12 },
  { name: 'try/except', re: /(^|\n)\s*(try|except)\b/, taughtAt: 13 },
  { name: 'with open', re: /\bwith\s+open\s*\(/, taughtAt: 14 },
  { name: 'import', re: /(^|\n)\s*import\s+\w+/m, taughtAt: 15 },
  { name: 'class', re: /(^|\n)\s*class\s+\w+/, taughtAt: 16 },
]

const problems = []
for (const l of PY_LESSONS) {
  // 收集本课所有代码：正文 + 练习 starter/answer
  const codeBlocks = []
  for (const b of l.blocks) if (b[0] === 'code' && b[1] === 'python') codeBlocks.push(b[2])
  if (l.exercise?.starter) codeBlocks.push(l.exercise.starter)
  if (l.exercise?.answer) codeBlocks.push(l.exercise.answer)
  const code = codeBlocks.join('\n')
  if (!code.trim()) continue

  for (const f of FEATURES) {
    if (f.taughtAt <= l.no) continue // 本课或之前已教 → 合法
    if (f.re.test(code)) {
      problems.push(`Py 第${l.no}节《${l.title}》用了「${f.name}」（第${f.taughtAt}节才教）`)
    }
  }
}
// SQL: 检查 SQL 代码是否用了尚未教的子句（粗粒度）
const SQL_FEATURES = [
  { name: 'JOIN', re: /\bJOIN\b/i, taughtAt: 5 },
  { name: 'GROUP BY', re: /\bGROUP\s+BY\b/i, taughtAt: 9 },
  { name: '子查询', re: /\(\s*SELECT\b/i, taughtAt: 12 },
  { name: 'CASE WHEN', re: /\bCASE\b/i, taughtAt: 9 },
  { name: 'HAVING', re: /\bHAVING\b/i, taughtAt: 10 },
  { name: 'UPDATE', re: /\bUPDATE\b/i, taughtAt: 8 },
  { name: 'CREATE TABLE', re: /\bCREATE\s+TABLE\b/i, taughtAt: 3 },
]
for (const l of SQL_LESSONS) {
  const codeBlocks = []
  for (const b of l.blocks) if (b[0] === 'code' && b[1] === 'sql') codeBlocks.push(b[2])
  if (l.exercise?.starter) codeBlocks.push(l.exercise.starter)
  if (l.exercise?.answer) codeBlocks.push(l.exercise.answer)
  const code = codeBlocks.join('\n')
  if (!code.trim()) continue
  for (const f of SQL_FEATURES) {
    if (f.taughtAt <= l.no) continue
    if (f.re.test(code)) problems.push(`SQL 第${l.no}节《${l.title}》用了「${f.name}」（第${f.taughtAt}节才教）`)
  }
}

console.log(`概念前置检查：${problems.length} 处疑似"未教先用"`)
problems.forEach((p) => console.log('  -', p))
