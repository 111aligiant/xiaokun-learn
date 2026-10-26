/* 统一加载 Playwright：
   ① 优先用当前项目安装的 playwright；
   ② 没有时从 PLAYWRIGHT_NODE_MODULES 指定的 node_modules 加载。
   开源环境：npm i -D playwright && npx playwright install chromium */
import { createRequire } from 'node:module'

export async function loadChromium() {
  try {
    const m = await import('playwright')
    return m.chromium
  } catch (_) { /* 继续尝试环境变量 */ }

  const dir = process.env.PLAYWRIGHT_NODE_MODULES
  if (!dir) {
    throw new Error(
      '找不到 playwright。请先 npm i -D playwright && npx playwright install chromium，'
      + '或设置 PLAYWRIGHT_NODE_MODULES 指向包含 playwright 的 node_modules 目录'
    )
  }
  const req = createRequire(dir.endsWith('/') || dir.endsWith('\\') ? dir : dir + '/')
  return req('playwright').chromium
}
