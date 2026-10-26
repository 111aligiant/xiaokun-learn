import { loadChromium } from './_playwright.mjs'

const chromium = await loadChromium()

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 200)))
page.on('pageerror', (e) => console.log('[pageerror]', String(e?.message || e).slice(0, 300)))
page.on('requestfailed', (r) => console.log('[reqfail]', r.url().slice(0, 140), r.failure()?.errorText))

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' })
const result = await page.evaluate(async () => {
  const log = []
  const t0 = Date.now()
  const base = 'https://registry.npmmirror.com/pyodide/0.26.2/files/'
  try {
    await new Promise((res, rej) => {
      const s = document.createElement('script')
      s.src = base + 'pyodide.js'
      s.onload = res
      s.onerror = () => rej(new Error('load fail'))
      document.head.appendChild(s)
    })
    log.push(`script loaded @${Date.now() - t0}ms, loadPyodide=${typeof window.loadPyodide}`)
    const inst = await window.loadPyodide({ indexURL: base })
    log.push(`pyodide ready @${Date.now() - t0}ms, version=${inst.runPython('import sys; sys.version.split()[0]')}`)
    const out = inst.runPython(`print("hello from py")`)
    log.push(`runPython ok @${Date.now() - t0}ms`)
    return { ok: true, log }
  } catch (e) {
    log.push('ERROR: ' + String(e?.message || e).slice(0, 400))
    return { ok: false, log }
  }
}, { timeout: 120000 })

console.log('\n===== 结果 =====')
result.log.forEach((l) => console.log(' ', l))
await browser.close()
