<template>
  <div class="md" v-html="html" @click="onClick"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
})

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 代码块右上角的复制按钮（v-html 里的节点无法挂 Vue 事件，用事件委托） */
async function onClick(e) {
  const btn = e.target.closest?.('[data-copy]')
  if (!btn) return
  const id = btn.getAttribute('data-copy')
  const pre = document.getElementById(id)
  if (!pre) return
  const text = pre.textContent || ''
  try {
    await navigator.clipboard.writeText(text)
  } catch (_) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  btn.textContent = '已复制'
  setTimeout(() => { btn.textContent = '复制' }, 1400)
}

/** 行内语法：`code`、**粗体**、*斜体*、[文字](链接) */
function inline(s) {
  let t = escapeHtml(s)
  // 行内代码先抽出来，避免内部被其他规则干扰
  const codes = []
  t = t.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c)
    return `\u0000C${codes.length - 1}\u0000`
  })
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  t = t.replace(/\u0000C(\d+)\u0000/g, (_, i) => `<code class="code--inline">${codes[+i]}</code>`)
  return t
}

const html = computed(() => {
  const src = props.text || ''
  if (!src) return ''

  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0

  const flushList = (items, ordered) => {
    if (!items.length) return
    const tag = ordered ? 'ol' : 'ul'
    out.push(`<${tag}>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</${tag}>`)
    items.length = 0
  }

  let ul = []
  let ol = []

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trimEnd()

    /* --- 代码围栏 --- */
    const fence = line.match(/^\s*```(\w*)\s*$/)
    if (fence) {
      flushList(ul, false)
      flushList(ol, true)
      const lang = fence[1] || ''
      const buf = []
      i++
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++ // 跳过结束的 ```
      const codeId = `c${out.length}`
      out.push(
        `<div class="codeblock">` +
          `<div class="codeblock__bar"><span>${lang || 'code'}</span>` +
          `<button class="codeblock__copy" data-copy="${codeId}">复制</button></div>` +
          `<pre class="code" id="${codeId}">${escapeHtml(buf.join('\n'))}</pre>` +
        `</div>`
      )
      continue
    }

    /* --- 表格 --- */
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      flushList(ul, false)
      flushList(ol, true)
      const rows = []
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i])
        i++
      }
      const cells = (r) =>
        r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
      const head = cells(rows[0])
      const body = rows.slice(2).map(cells)
      out.push(
        `<div class="tablewrap"><table><thead><tr>` +
          head.map((h) => `<th>${inline(h)}</th>`).join('') +
          `</tr></thead><tbody>` +
          body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('') +
          `</tbody></table></div>`
      )
      continue
    }

    /* --- 标题 --- */
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      flushList(ul, false)
      flushList(ol, true)
      const lv = Math.min(h[1].length + 1, 4)
      out.push(`<h${lv}>${inline(h[2])}</h${lv}>`)
      i++
      continue
    }

    /* --- 分隔线 --- */
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flushList(ul, false)
      flushList(ol, true)
      out.push('<hr />')
      i++
      continue
    }

    /* --- 引用 --- */
    if (/^\s*>\s?/.test(line)) {
      flushList(ul, false)
      flushList(ol, true)
      const buf = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      out.push(`<blockquote>${buf.map(inline).join('<br />')}</blockquote>`)
      continue
    }

    /* --- 列表 --- */
    const li = line.match(/^\s*[-*+]\s+(.*)$/)
    const loi = line.match(/^\s*\d+[.)]\s+(.*)$/)
    if (li) {
      flushList(ol, true)
      ul.push(li[1])
      i++
      continue
    }
    if (loi) {
      flushList(ul, false)
      ol.push(loi[1])
      i++
      continue
    }

    /* --- 空行 --- */
    if (!line.trim()) {
      flushList(ul, false)
      flushList(ol, true)
      i++
      continue
    }

    /* --- 段落 --- */
    flushList(ul, false)
    flushList(ol, true)
    const para = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*(```|#{1,4}\s|\||>|[-*+]\s|\d+[.)]\s|([-*_])\2{2,}\s*$)/.test(lines[i])
    ) {
      para.push(lines[i])
      i++
    }
    out.push(`<p>${para.map(inline).join('<br />')}</p>`)
  }

  flushList(ul, false)
  flushList(ol, true)
  return out.join('')
})
</script>

<style scoped>
/* 注意：MarkdownLite 的内容是 v-html 注入的，不会带 scoped 属性，
   所以这里所有选择器都必须用 :deep() 才能命中。 */
.md :deep(.codeblock) {
  margin: 0 0 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #16241f;
  background: var(--code-bg);
}
.md :deep(.codeblock__bar) {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px;
  background: #16241f;
  font-family: var(--mono);
  font-size: 11px;
  color: #8fb3a2;
}
.md :deep(.codeblock__copy) {
  border: 1px solid #2a3f37;
  background: #1d2c26;
  color: #a8c9b8;
  border-radius: 7px;
  padding: 3px 9px;
  font-size: 11px;
  cursor: pointer;
}
.md :deep(.codeblock .code) {
  margin: 0;
  border: none;
  border-radius: 0;
  max-height: 60vh;
}
.md :deep(.tablewrap) { overflow-x: auto; margin-bottom: 12px; }
</style>
