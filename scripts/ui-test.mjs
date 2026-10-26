/* ============================================================
   UI 巡检脚本：真实 Chromium 逐页检测（mobile viewport）
   运行：PLAYWRIGHT_NODE_MODULES=<workspace>/node_modules node scripts/ui-test.mjs
   检测：JS 错误 / 请求失败 / 关键元素 / 核心交互链路
   ============================================================ */
import { loadChromium } from './_playwright.mjs'

const chromium = await loadChromium()

const BASE = 'http://127.0.0.1:4173'
const issues = []
const P0 = [], P1 = [], P2 = []
function report(level, msg) {
  issues.push({ level, msg })
  ;(level === 'P0' ? P0 : level === 'P1' ? P1 : P2).push(msg)
  console.log(`  [${level}] ${msg}`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Xiaomi 14) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36',
  deviceScaleFactor: 2.75, isMobile: true, hasTouch: true,
})
const page = await ctx.newPage()

// 巡检不测首次引导：预置 onboarded，避免向导遮挡页面元素
await page.addInitScript(() => {
  if (!localStorage.getItem('xiaokun.state.v1')) {
    localStorage.setItem('xiaokun.state.v1', JSON.stringify({ onboarded: true }))
  }
})

const consoleErrors = []
const pageErrors = []
const failedReqs = []
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 220))
})
page.on('pageerror', (e) => pageErrors.push(String(e?.message || e).slice(0, 220)))
page.on('requestfailed', (r) => {
  const url = r.url()
  if (!url.includes('deepseek')) failedReqs.push(`${r.failure()?.errorText} ${url.slice(0, 120)}`)
})
const sawPageErrors = () => pageErrors.length

async function go(hash, name) {
  pageErrors.length = 0
  await page.goto(`${BASE}/#${hash}`, { waitUntil: 'load' })
  await page.waitForTimeout(650)
  const n = sawPageErrors()
  if (n) report('P0', `${name} 页面运行时错误: ${pageErrors[0]}`)
  return n
}

/* ---------- 1. 首页 ---------- */
console.log('\n== 首页 ==')
await go('/home', '首页')
for (const [sel, desc] of [
  ['.hero__hi', '问候卡片'],
  ['.note--warn', '未配Key提醒'],
  ['.trackcard', '路线卡片'],
]) {
  const c = await page.locator(sel).count()
  if (!c) report('P1', `首页缺「${desc}」(${sel})`)
}

/* ---------- 2. 课程列表 ---------- */
console.log('\n== 课程列表 ==')
await go('/learn', '课程列表')
if (!(await page.locator('.list-item').count())) report('P0', '课程列表为空')
if (!(await page.locator('.chapterhead').count())) report('P1', '课程列表缺章节头')

/* ---------- 3. 课时页（重点：quiz 曾崩溃）---------- */
console.log('\n== 课时页 ==')
await page.locator('.list-item').first().click()
await page.waitForTimeout(700)
if (!page.url().includes('/learn/python/')) report('P0', `课时路由异常: ${page.url()}`)
if (sawPageErrors()) report('P0', `课时页错误: ${pageErrors[0]}`)
if (!(await page.locator('.objectives').count())) report('P1', '课时页缺学习目标')
const hasQuiz = await page.locator('.quiz__item').count()
console.log(`  自测题数: ${hasQuiz}`)
if (!hasQuiz) report('P1', '第一节没有自测题（零基础需要即时反馈）')
else {
  // 点第一题的第一个选项 → 验证 qi 修复后能正常反馈
  await page.locator('.quiz__opt').first().click()
  await page.waitForTimeout(300)
  if (sawPageErrors()) report('P0', `自测题交互崩溃(qi bug 未修净): ${pageErrors[0]}`)
  else if (!(await page.locator('.quiz__explain').count()))
    report('P1', '选了选项但没出现解析')
  else console.log('  ✓ 自测题交互正常（qi 修复生效）')
}
// 练习区
if (!(await page.locator('.exercise').count())) report('P1', '课时页缺练习区')
// 下一节导航
const hasNext = await page.locator('.navrow .btn--primary').isEnabled()
if (!hasNext) report('P2', '下一节按钮不可用')

/* ---------- 4. 实操台 SQL（快速验证核心功能）---------- */
console.log('\n== 实操台 ==')
await go('/lab', '实操台')
await page.locator('.seg__item', { hasText: 'SQL' }).click()
await page.waitForTimeout(400)
// 点执行 → 需下载 1.2MB 引擎
try {
  await page.locator('button', { hasText: '执行' }).first().click({ timeout: 3000 })
  await page.waitForSelector('.tablewrap table', { timeout: 45000 })
  const rows = await page.locator('.tablewrap tbody tr').count()
  console.log(`  ✓ SQL 执行成功，返回 ${rows} 行`)
} catch {
  report('P1', `SQL 执行失败或超时（控制台: ${consoleErrors.slice(-1)[0] || '无'}）`)
}

/* Python 引擎较大，验证加载启动即可（60s 上限） */
await page.locator('.seg__item', { hasText: 'Python' }).click()
await page.locator('button', { hasText: '运行' }).first().click({ timeout: 3000 }).catch(() => {})
try {
  await page.waitForSelector('pre.console', { timeout: 60000 })
  const out = (await page.locator('pre.console').first().textContent()) || ''
  console.log(`  ✓ Python 执行成功，输出 ${out.length} 字符`)
  if (!out.includes('超限')) report('P2', 'Python 示例输出与预期不符')
} catch {
  report('P1', `Python 引擎加载/执行超时（最后一次控制台: ${consoleErrors.slice(-1)[0] || '无'}）`)
}

/* ---------- 5. 对话页：定级问卷 ---------- */
console.log('\n== 对话页 ==')
await go('/chat', '对话页')
if (!(await page.locator('.placement').count())) {
  report('P0', '首次使用未出现定级问卷（level 应默认 auto）')
} else {
  await page.locator('.placement__head').click()
  await page.waitForTimeout(250)
  const qs = await page.locator('.placement__q').count()
  if (qs !== 3) report('P1', `定级问卷题目数异常: ${qs}`)
  // 三题各选第一项（→ zero 档）
  for (let i = 0; i < 3; i++) {
    await page.locator('.placement__q').nth(i).locator('button.chip').first().click()
  }
  await page.locator('button', { hasText: '定好了' }).click()
  await page.waitForTimeout(600)
  // 未配 Key → 应显示友好错误而不是崩溃
  if (sawPageErrors()) report('P0', `定级提交后崩溃: ${pageErrors[0]}`)
  else if (!(await page.locator('.note--danger').count()))
    report('P1', '未配Key提交后没有友好错误提示')
  else console.log('  ✓ 定级问卷 → 提交 → 未配Key友好报错，链路正常')
  // 验证 level 已写入 localStorage
  const saved = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('xiaokun.state.v1') || '{}')
    return { level: s.settings?.level, note: s.settings?.profile?.background }
  })
  if (saved.level !== 'zero') report('P0', `定级结果未持久化: level=${saved.level}`)
  else console.log(`  ✓ 水平已持久化: level=${saved.level}, 背景="${(saved.note || '').slice(0, 30)}…"`)
}

/* ---------- 6. 设置页：基础水平 + 学员背景 + 人设 ---------- */
console.log('\n== 设置页 ==')
await go('/settings', '设置页')
if (!(await page.locator('.levelgrid .levelcard').count())) report('P0', '设置页缺「基础水平」卡片')
else {
  const n = await page.locator('.levelgrid .levelcard').count()
  console.log(`  ✓ 基础水平卡片渲染 ${n} 个档位`)
  if (n !== 5) report('P1', `档位数量应为 5，实际 ${n}`)
}
if ((await page.locator('.persongrid .levelcard').count()) !== 3) report('P1', '人设预设应为 3 个')
if (!(await page.locator('button', { hasText: '编辑学员背景' }).count())) report('P1', '缺「编辑学员背景」入口')
const pageText = await page.locator('.page').innerText()
if (!pageText.includes('变量/数据类型')) report('P1', '定级写入的学员背景未在设置页摘要显示')
// 导出/导入按钮存在
if (!(await page.locator('button', { hasText: '导出我的数据' }).count())) report('P2', '缺导出按钮')

/* ---------- 7. 深链守卫 ---------- */
console.log('\n== 路由守卫 ==')
await go('/learn/python/not-exist-id', '不存在的课时')
if (!(await page.locator('.empty').count())) report('P1', '无效课时 ID 没有兜底空态')
await go('/whatever', '未知路由')
if (!page.url().includes('/home')) report('P1', '未知路由未重定向到首页')

/* ---------- 汇总 ---------- */
console.log('\n===== 网络失败请求 =====')
failedReqs.slice(0, 8).forEach((r) => console.log('  ', r))
console.log('===== 控制台错误（去重前 8 条）=====')
;[...new Set(consoleErrors)].slice(0, 8).forEach((e) => console.log('  ', e))

console.log(`\n===== UI 巡检结论: ${issues.length ? `${issues.length} 个问题 (P0:${P0.length} P1:${P1.length} P2:${P2.length})` : '✅ 全部通过'} =====`)
await browser.close()
process.exitCode = issues.length ? 1 : 0
