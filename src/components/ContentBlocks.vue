<template>
  <div class="blocks">
    <template v-for="(b, idx) in blocks" :key="idx">
      <!-- 小标题 -->
      <h3 v-if="b[0] === 'h'" class="blk-h">{{ b[1] }}</h3>

      <!-- 段落 -->
      <p v-else-if="b[0] === 'p'" class="blk-p">{{ b[1] }}</p>

      <!-- 代码 -->
      <div v-else-if="b[0] === 'code'" class="codeblock">
        <div class="codeblock__bar">
          <span>{{ b[1] }}</span>
          <button class="codeblock__btn" @click="copy(b[2])">{{ copiedIdx === idx ? '已复制' : '复制' }}</button>
        </div>
        <pre class="code" :id="`blk-${_uid}-${idx}`">{{ b[2] }}</pre>
        <div v-if="canRun(b)" class="codeblock__run">
          <button class="btn btn--sm btn--amber" @click="$emit('run', b[2], b[1])">
            ▶ 在实操台运行这段代码
          </button>
        </div>
      </div>

      <!-- 无序列表 -->
      <ul v-else-if="b[0] === 'ul'" class="blk-ul">
        <li v-for="(x, i2) in b[1]" :key="i2" v-html="inline(x)" />
      </ul>

      <!-- 有序列表 -->
      <ol v-else-if="b[0] === 'ol'" class="blk-ol">
        <li v-for="(x, i2) in b[1]" :key="i2" v-html="inline(x)" />
      </ol>

      <!-- 提示 / 警示 / 备注 -->
      <div v-else-if="b[0] === 'tip'" class="note note--ok">
        <span class="note__icon">💡</span><span v-html="inline(b[1])" />
      </div>
      <div v-else-if="b[0] === 'warn'" class="note note--warn">
        <span class="note__icon">⚠️</span><span v-html="inline(b[1])" />
      </div>
      <div v-else-if="b[0] === 'note'" class="note">
        <span class="note__icon">📌</span><span v-html="inline(b[1])" />
      </div>

      <!-- 术语对照 -->
      <div v-else-if="b[0] === 'kv'" class="kvcard">
        <div v-for="(row, i2) in b[1]" :key="i2" class="kvcard__row">
          <code class="kvcard__k">{{ row[0] }}</code>
          <span class="kvcard__v" v-html="inline(row[1])" />
        </div>
      </div>

      <!-- 表格 -->
      <div v-else-if="b[0] === 'table'" class="tablewrap">
        <table>
          <thead>
            <tr><th v-for="(c, i2) in b[1]" :key="i2" v-html="inline(c)" /></tr>
          </thead>
          <tbody>
            <tr v-for="(row, i2) in b.slice(2)" :key="i2">
              <td v-for="(c, i3) in row" :key="i3" v-html="inline(c)" />
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  blocks: { type: Array, default: () => [] },
  runnable: { type: Boolean, default: true },
})
defineEmits(['run'])

const _uid = Math.random().toString(36).slice(2, 7)
const copiedIdx = ref(-1)

function canRun(b) {
  return props.runnable && (b[1] === 'python' || b[1] === 'sql')
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function inline(s) {
  let t = escapeHtml(s)
  const codes = []
  t = t.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c)
    return `\u0000C${codes.length - 1}\u0000`
  })
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/\u0000C(\d+)\u0000/g, (_, i) => `<code class="code--inline">${codes[+i]}</code>`)
  return t
}

async function copy(text) {
  const idx = props.blocks.findIndex((b) => b[0] === 'code' && b[2] === text)
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
  copiedIdx.value = idx
  setTimeout(() => (copiedIdx.value = -1), 1400)
}
</script>

<style scoped>
.blocks { font-size: 14.5px; line-height: 1.72; }
.blk-h {
  font-size: 15.5px; font-weight: 700; color: var(--brand-deep);
  margin: 20px 0 8px; padding-left: 10px;
  border-left: 3px solid var(--amber-bright);
}
.blk-h:first-child { margin-top: 4px; }
.blk-p { margin: 0 0 12px; color: var(--ink); }
.blk-ul, .blk-ol { margin: 0 0 12px; padding-left: 20px; }
.blk-ul li, .blk-ol li { margin-bottom: 5px; }

.codeblock {
  margin: 0 0 13px; border-radius: 12px; overflow: hidden;
  border: 1px solid #16241f; background: var(--code-bg);
}
.codeblock__bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; background: #16241f;
  font-family: var(--mono); font-size: 11px; color: #8fb3a2;
}
.codeblock__btn {
  border: 1px solid #2a3f37; background: #1d2c26; color: #a8c9b8;
  border-radius: 7px; padding: 3px 9px; font-size: 11px; cursor: pointer;
}
.codeblock .code { margin: 0; border: none; border-radius: 0; }
.codeblock__run {
  padding: 8px 10px; background: #12201b; border-top: 1px solid #1d2c26;
}
.note__icon { flex: none; }
.kvcard {
  border: 1px solid var(--line); border-radius: var(--radius-sm);
  overflow: hidden; margin: 0 0 13px; background: var(--surface-2);
}
.kvcard__row {
  display: flex; gap: 10px; padding: 9px 11px;
  border-bottom: 1px solid var(--line); align-items: baseline;
}
.kvcard__row:last-child { border-bottom: none; }
.kvcard__k {
  flex: none; min-width: 96px; font-family: var(--mono); font-size: 12.5px;
  color: var(--brand); font-weight: 600;
}
.kvcard__v { font-size: 13.5px; color: var(--ink-2); line-height: 1.6; }
.tablewrap { overflow-x: auto; margin: 0 0 13px; }
.tablewrap table { width: 100%; border-collapse: collapse; font-size: 13px; }
.tablewrap th, .tablewrap td {
  border: 1px solid var(--line); padding: 8px 10px;
  text-align: left; white-space: nowrap;
}
.tablewrap th { background: var(--surface-2); font-weight: 700; }
</style>
