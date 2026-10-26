/* 专项测试：首次引导（profile）+ 人设（persona）+ 提示词组装 + 设置页编辑 */
import { readFile } from 'node:fs/promises'
import { loadChromium } from './_playwright.mjs'

const chromium = await loadChromium()

const BASE = 'http://127.0.0.1:4173'
const results = []
const ok = (name, cond, extra = '') =>
  results.push(`${cond ? '✓' : '✗ P1'} ${name}${extra ? ` — ${extra}` : ''}`)

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile',
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

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
      model: 'deepseek-chat',
      choices: [{ message: { role: 'assistant', content: '收到。' } }],
    }),
  })
})

const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('xiaokun.state.v1')))
const sleep = (ms) => page.waitForTimeout(ms)

// ---------- ① 首次进入：出现引导向导 ----------
await page.goto(`${BASE}/#/home`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('.wiz')
ok('首次进入弹出引导向导', (await page.locator('.wiz').count()) === 1)
ok('向导分 3 步', (await page.locator('.wiz__step').innerText()).includes('1 / 3'))

// ---------- ② 第 1 步：称呼 / 目标 / 水平 / 基础 ----------
await page.fill('.wiz input[placeholder*="可留空"]', '阿丘')
await page.fill('.wiz textarea[placeholder*="转行做 AI 应用"]', '转行做数据分析')
await page.click('.wiz__card:has-text("会一点")')
await page.fill('.wiz textarea[placeholder*="VBA"]', '会 Excel，没写过 Python')
await page.click('.wiz__foot button:has-text("下一步")')
await sleep(200)

// ---------- ③ 第 2 步：举例领域 / 时间 / 偏好 ----------
ok('进入第 2 步', (await page.locator('.wiz__step').innerText()).includes('2 / 3'))
await page.click('.wiz__card:has-text("数据分析")')
await page.fill('.wiz input[placeholder*="也可以直接写"]', '通用电子')
await page.click('.wiz .chip:has-text("每周 2 小时")')
await page.fill('.wiz input[placeholder*="先看原理"]', '先看原理再看代码')
await page.click('.wiz__foot button:has-text("下一步")')
await sleep(200)

// ---------- ④ 第 3 步：人设 / 名字 / 教学方式 / Key ----------
ok('进入第 3 步', (await page.locator('.wiz__step').innerText()).includes('3 / 3'))
await page.click('.wiz__card:has-text("陪练搭子")')
await page.fill('.wiz input[placeholder="小坤"]', '小豆')
await page.click('.wiz .seg__item:has-text("直接讲")')
await page.fill('.wiz input[placeholder="sk-..."]', 'sk-test-phase2')
await page.fill('.wiz input[placeholder*="https://api.deepseek.com"]', 'https://api.openai.com/v1')
await page.fill('.wiz input[placeholder*="gpt-4o-mini"]', 'gpt-4o-mini')
await page.click('.wiz__foot button:has-text("开始学习")')
await sleep(500)

ok('完成后向导消失', (await page.locator('.wiz').count()) === 0)

let st = await state()
ok('onboarded 已置为 true', st.onboarded === true)
ok('profile.name 写入', st.settings.profile?.name === '阿丘')
ok('profile.goal 写入', st.settings.profile?.goal === '转行做数据分析')
ok('profile.background 写入', (st.settings.profile?.background || '').includes('Excel'))
ok('profile.exampleDomain 写入', st.settings.profile?.exampleDomain === 'custom')
ok('profile.exampleDomainText 写入', st.settings.profile?.exampleDomainText === '通用电子')
ok('profile.weeklyMinutes 写入', st.settings.profile?.weeklyMinutes === 120)
ok('profile.style 写入', st.settings.profile?.style === '先看原理再看代码')
ok('level 写入', st.settings.level === 'basic')
ok('personaId 写入', st.settings.personaId === 'buddy')
ok('assistantName 写入', st.settings.assistantName === '小豆')
ok('teachMode 写入', st.settings.teachMode === 'direct')
ok('apiKey 写入', st.settings.apiKey === 'sk-test-phase2')
ok('baseUrl 写入', st.settings.baseUrl === 'https://api.openai.com/v1')
ok('model 写入', st.settings.model === 'gpt-4o-mini')

// ---------- ⑤ 提示词组装：人设 + 背景 + 水平 ----------
await page.click('.tabbar button:has-text("助教")')
await page.waitForSelector('.composer__input')
await page.fill('.composer__input', '你好，先认识一下')
await page.press('.composer__input', 'Enter')
await page.waitForFunction(() => document.querySelectorAll('.msg').length >= 2)
await sleep(500)

ok('请求已发出', requests.length === 1)
const sys = requests[0]?.messages?.[0]?.content || ''
ok('提示词含助教名字', sys.includes('你是「小豆」'))
ok('提示词含学员称呼', sys.includes('称呼：阿丘'))
ok('提示词含学习目标', sys.includes('学习目标：转行做数据分析'))
ok('提示词含已有基础', sys.includes('会 Excel，没写过 Python'))
ok('提示词含每周时间', sys.includes('每周 120 分钟'))
ok('提示词含学习偏好', sys.includes('先看原理再看代码'))
ok('提示词含自定义举例领域', sys.includes('通用电子') && !sys.includes('举例优先用数据分析场景'))
ok('提示词含水平档位', sys.includes('会一点') && sys.includes('学员当前基础水平'))
ok('提示词含人设语气', sys.includes('一位坐在旁边陪你写代码的编程搭子'))
ok('提示词含人设强调', sys.includes('先给能跑的最小例子'))
ok('提示词含"直接讲透"契约', sys.includes('直接讲透'))
ok('提示词含诚实边界', sys.includes('绝不编造'))
ok('稳定段落在课程上下文之前', sys.indexOf('学员背景') < sys.indexOf('学员当前进度') || !sys.includes('学员当前进度'))

// ---------- ⑥ 设置页：背景摘要 + 人设切换 ----------
await page.click('.tabbar button:has-text("我的")')
await page.waitForSelector('.page')
const pageText = await page.locator('.page').innerText()
ok('设置页显示称呼', pageText.includes('阿丘'))
ok('设置页显示目标', pageText.includes('转行做数据分析'))
ok('设置页显示举例领域', pageText.includes('通用电子'))
ok('设置页显示每周投入', pageText.includes('120 分钟'))
ok('设置页显示三个人设', (await page.locator('.persongrid .levelcard').count()) === 3)
ok('当前人设高亮为陪练搭子', (await page.locator('.persongrid .levelcard--on').innerText()).includes('陪练搭子'))

await page.click('.persongrid .levelcard:has-text("面试官")')
await page.click('button:has-text("保存全部设置")')
await sleep(400)
st = await state()
ok('切换人设后落盘', st.settings.personaId === 'interviewer')

// ---------- ⑥b 导出备份：不含 Key；导入后沿用本机 Key ----------
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('button:has-text("导出我的数据")'),
])
const backupText = await readFile(await download.path(), 'utf-8')
const backup = JSON.parse(backupText)
ok('备份不含 API Key', backup.settings?.apiKey === '')
ok('备份包含进度字段', typeof backup.progress === 'object')
ok('备份包含会话字段', Array.isArray(backup.sessions))

page.once('dialog', (d) => d.accept())
await page.click('button:has-text("导入数据")')
await page.fill('.page textarea[placeholder*="导出的 JSON"]', backupText)
await page.click('button:has-text("确认导入")')
await sleep(500)
st = await state()
ok('导入后沿用本机 Key', st.settings.apiKey === 'sk-test-phase2')

// ---------- ⑦ 编辑背景：改称呼后摘要立即更新 ----------
await page.click('button:has-text("编辑学员背景")')
await page.waitForSelector('.wiz')
ok('编辑模式复用向导', (await page.locator('.wiz__title').innerText()).includes('编辑学员背景'))
await page.fill('.wiz input[placeholder*="可留空"]', '阿丘2')
await page.click('.wiz__foot button:has-text("保存")')
await sleep(400)
ok('编辑后向导关闭', (await page.locator('.wiz').count()) === 0)
st = await state()
ok('编辑后称呼已更新', st.settings.profile?.name === '阿丘2')
ok('摘要同步新称呼', (await page.locator('.page').innerText()).includes('阿丘2'))

// ---------- ⑧ 刷新后不再弹向导 ----------
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('.page')
ok('刷新后不再弹引导', (await page.locator('.wiz').count()) === 0)

ok('无页面 JS 错误', errors.length === 0)
if (errors.length) console.log('errors:', errors.slice(0, 4))

console.log(results.join('\n'))
await browser.close()
const fail = results.filter((r) => r.startsWith('✗')).length
console.log(fail ? `\n结论: ${fail} 项失败` : '\n结论: ✅ 引导/人设/提示词专项全部通过')
process.exit(fail ? 1 : 0)
