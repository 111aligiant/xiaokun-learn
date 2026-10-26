/* 专项测试：对话会话管理（新对话/切回/空会话清理/持久化） */
import { loadChromium } from './_playwright.mjs'

const chromium = await loadChromium()

const BASE = 'http://127.0.0.1:4173'
const results = []
const ok = (name, cond) => results.push(`${cond ? '✓' : '✗ P1'} ${name}`)

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile',
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(`${BASE}/#/chat`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
// 首次进入会弹引导向导，这里跳过（会话管理测试不关心引导）
await page.waitForTimeout(300)
if (await page.locator('.wiz').count()) {
  await page.click('.wiz__skip')
  await page.waitForTimeout(300)
}

// ① 发一条消息（无 Key，报错路径，但用户消息会入会话）
await page.fill('.composer__input', '帮我讲讲什么是变量')
await page.press('.composer__input', 'Enter')
await page.waitForTimeout(600)
const msgCount1 = await page.locator('.msg').count()
ok('消息入会话', msgCount1 >= 1)

// ② 点 ＋ 新对话 → 界面清空，旧会话保留
await page.click('button[title="新对话"]')
await page.waitForTimeout(300)
const msgCount2 = await page.locator('.msg').count()
ok('新对话界面为空', msgCount2 === 0)

// ③ 点顶栏标题 → 历史弹层，应有 2 个会话，旧的 1 条消息
await page.click('.chatbar .grow')
await page.waitForTimeout(300)
const items = await page.locator('.sheet .list-item').count()
ok('历史里保留旧会话（共 2 个）', items === 2)
const hasOld = await page.locator('.sheet .list-item', { hasText: '帮我讲讲什么是变量' }).count()
ok('旧会话标题为首轮提问', hasOld === 1)

// ④ 切回旧会话 → 消息回来
await page.locator('.sheet .list-item', { hasText: '帮我讲讲什么是变量' }).first().click()
await page.waitForTimeout(300)
const msgCount3 = await page.locator('.msg').count()
ok('切回后旧消息还在', msgCount3 >= 1)

// ⑤ 再点 ＋：会新建；再点 ＋：空会话应复用不堆积
await page.click('button[title="新对话"]')
await page.click('button[title="新对话"]')
await page.waitForTimeout(300)
await page.click('.chatbar .grow')
await page.waitForTimeout(300)
const items2 = await page.locator('.sheet .list-item').count()
ok('空会话复用不堆积（仍 2 个）', items2 === 2)
await page.click('.sheet__head .btn') // 关闭

// ⑥ 刷新 → 全部持久化
await page.reload({ waitUntil: 'networkidle' })
const state = await page.evaluate(() => JSON.parse(localStorage.getItem('xiaokun.state.v1')))
const persistOk = state.sessions.length === 2 && state.sessions.some((x) => x.messages.length >= 1)
ok('刷新后 localStorage 仍保留 2 个会话', persistOk)

// ⑦ 两步删除：旧会话删除需确认
await page.click('.chatbar .grow')
await page.waitForTimeout(300)
const delBtn = page.locator('.sheet .list-item', { hasText: '帮我讲讲什么是变量' }).locator('button').last()
await delBtn.click()
await page.waitForTimeout(200)
const confirmText = await delBtn.textContent()
ok('删除需二次确认', /确认/.test(confirmText))
await delBtn.click()
await page.waitForTimeout(200)
const items3 = await page.locator('.sheet .list-item').count()
ok('确认后删除成功', items3 === 1)

// ⑧ 页面错误
ok('无页面 JS 错误', errors.length === 0)
if (errors.length) console.log('errors:', errors.slice(0, 4))

console.log(results.join('\n'))
await browser.close()
const fail = results.filter((r) => r.startsWith('✗')).length
console.log(fail ? `\n结论: ${fail} 项失败` : '\n结论: ✅ 会话管理专项全部通过')
process.exit(fail ? 1 : 0)
