/* 会话隔离专项：新会话不承接旧消息 / 旧课程上下文；外部入口新建会话；草稿不串 */
import { loadChromium } from './_playwright.mjs'

const chromium = await loadChromium()

const BASE = 'http://127.0.0.1:4173'
const LESSON_TITLE = '第一个程序：print 与注释'
const LESSON_ID = 'py-01'
const results = []
const ok = (name, cond, extra = '') =>
  results.push(`${cond ? '✓' : '✗ P1'} ${name}${extra ? ` — ${extra}` : ''}`)

const settings = {
  apiKey: 'sk-test',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-flash',
  temperature: 0.6,
  teachMode: 'guide',
  stream: false,
  useLessonContext: true,
  myName: '测试学员',
  assistantName: '小坤',
  level: 'basic',
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile',
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.addInitScript((seed) => {
  if (!sessionStorage.getItem('__isolation_seeded')) {
    localStorage.setItem('xiaokun.state.v1', JSON.stringify({
      settings: seed,
      sessions: [],
      activeSessionId: null,
      progress: {},
      notes: {},
      lastLesson: null,
      checkins: {},
      stats: { askCount: 0, runCount: 0, createdAt: Date.now() },
    }))
    sessionStorage.setItem('__isolation_seeded', '1')
  }
}, settings)

const requests = []
await page.route('**/chat/completions', async (route) => {
  const req = route.request()
  if (req.method() === 'OPTIONS') {
    return route.fulfill({
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'authorization, content-type',
      },
    })
  }
  requests.push(req.postDataJSON())
  return route.fulfill({
    status: 200,
    headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-flash',
      choices: [{ message: { role: 'assistant', content: '收到。' } }],
    }),
  })
})

const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('xiaokun.state.v1')))
const sleep = (ms) => page.waitForTimeout(ms)

// ---------- ① 从课程页进助教：新建会话 + 带本节上下文 ----------
await page.goto(`${BASE}/#/learn/python/${LESSON_ID}`, { waitUntil: 'networkidle' })
await page.click('button:has-text("带着本节上下文去问助教")')
await page.waitForSelector('.chatwrap')
await sleep(400)

ok('课程入口出现了本节上下文横幅', (await page.locator('.ctxbanner').innerText()).includes(LESSON_TITLE))
ok('课程入口的草稿是预设问题', (await page.inputValue('.composer__input')).includes('我在看《'))

await page.click('.composer__send')
await page.waitForFunction(() => document.querySelectorAll('.msg').length >= 2)
await sleep(500)

ok('课程入口请求已发出', requests.length === 1)
const sys1 = requests[0]?.messages?.[0]?.content || ''
ok('system prompt 注入了当前课程', sys1.includes(LESSON_TITLE) && sys1.includes('## 学员当前进度'))
ok('首个请求只有 system + 本轮提问', requests[0]?.messages?.length === 2)

let st = await state()
let lessonSession = st.sessions.find((s) => s.ctx)
ok('课程上下文写进了会话（lessonId）', lessonSession?.ctx?.lessonId === LESSON_ID)

// ---------- ② 点＋新对话：不带旧消息、不带旧课程 ----------
await page.click('button[title="新对话"]')
await sleep(300)
ok('新会话没有上下文横幅', (await page.locator('.ctxbanner').count()) === 0)
ok('新会话没有上下文 chip', (await page.locator('.ctxchip').count()) === 0)
ok('新会话输入框是空的', (await page.inputValue('.composer__input')) === '')

await page.fill('.composer__input', '第二个问题：讲讲循环')
await page.press('.composer__input', 'Enter')
await page.waitForFunction(() => document.querySelectorAll('.msg').length >= 2)
await sleep(500)

ok('新会话请求已发出', requests.length === 2)
const sys2 = requests[1]?.messages?.[0]?.content || ''
ok('新会话 system prompt 不含旧课程', !sys2.includes(LESSON_TITLE))
ok('新会话历史不含上一轮对话', !JSON.stringify(requests[1]?.messages || []).includes('我在看《'))

st = await state()
const withCtx = st.sessions.filter((s) => s.ctx)
ok('只有课程入口那个会话带 ctx', withCtx.length === 1 && withCtx[0].id === lessonSession.id)

// ---------- ③ 首页快捷动作：新建会话，不追加到当前会话 ----------
const beforeCount = st.sessions.length
await page.click('.tabbar button:has-text("首页")')
await page.waitForSelector('.hero__hi')
await page.click('button:has-text("出 3 道练习题")')
await page.waitForFunction(() => document.querySelectorAll('.msg').length >= 2)
await sleep(600)

st = await state()
ok('首页动作新建了会话', st.sessions.length === beforeCount + 1)
ok('首页动作请求已发出', requests.length === 3)
const req3 = requests[2]?.messages || []
ok('首页动作历史不含上一会话内容', !JSON.stringify(req3).includes('第二个问题'))
ok('首页动作只带本轮提问', req3.length === 2)

// ---------- ④ 草稿不随会话切换 ----------
await page.fill('.composer__input', '这段草稿不应跟着走')
await sleep(200)
await page.click('button[title="新对话"]')
await sleep(300)
ok('新建会话后草稿被清空', (await page.inputValue('.composer__input')) === '')

// 切回上一个会话，草稿也不应残留
await page.click('.chatbar .grow')
await sleep(300)
const items = page.locator('.sheet .list-item')
const n = await items.count()
ok('历史里能看到刚才的会话', n >= 3)
await items.nth(1).click() // 最近的上一个会话
await sleep(300)
ok('切回旧会话草稿为空', (await page.inputValue('.composer__input')) === '')

// ---------- ⑤ 回到课程会话，上下文还在 ----------
await page.click('.chatbar .grow')
await sleep(300)
const target = page.locator('.sheet .list-item').filter({ hasText: '我在看《' })
ok('课程会话在历史中保留了标题', (await target.count()) === 1)
await target.first().click()
await sleep(400)
ok('切回课程会话后上下文横幅还在', (await page.locator('.ctxbanner').innerText()).includes(LESSON_TITLE))

ok('无页面 JS 错误', errors.length === 0)
if (errors.length) console.log('errors:', errors.slice(0, 4))

console.log(results.join('\n'))
await browser.close()
const fail = results.filter((r) => r.startsWith('✗')).length
console.log(fail ? `\n结论: ${fail} 项失败` : '\n结论: ✅ 会话隔离专项全部通过')
process.exit(fail ? 1 : 0)
