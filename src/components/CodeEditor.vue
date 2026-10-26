<template>
  <div class="editor">
    <div class="editor__bar">
      <span class="editor__dot" :style="{ background: dotColor }" />
      <span class="editor__file">{{ filename }}</span>
      <span class="spacer" />
      <span class="editor__meta">第 {{ lineNo }} 行 · {{ charCount }} 字</span>
      <button class="editor__act" @click="onReset">重置</button>
    </div>
    <textarea
      ref="ta"
      class="editor__area"
      :value="modelValue"
      :placeholder="placeholder"
      spellcheck="false"
      autocapitalize="off"
      autocorrect="off"
      @input="onInput"
      @keydown="onKeydown"
      @click="updateCursor"
      @keyup="updateCursor"
      @scroll="() => {}"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  filename: { type: String, default: 'main.py' },
  placeholder: { type: String, default: '在这里写代码…' },
  dotColor: { type: String, default: '#f0a622' },
})
const emit = defineEmits(['update:modelValue', 'reset'])

const ta = ref(null)
const lineNo = ref(1)

const charCount = computed(() => (props.modelValue || '').length)

function onInput(e) {
  emit('update:modelValue', e.target.value)
  updateCursor()
}

function updateCursor() {
  const el = ta.value
  if (!el) return
  const upto = el.value.slice(0, el.selectionStart || 0)
  lineNo.value = upto.split('\n').length
}

/** Tab 键插入 4 个空格，不跳走焦点 */
function onKeydown(e) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const el = e.target
    const s = el.selectionStart
    const en = el.selectionEnd
    const val = el.value
    const next = val.slice(0, s) + '    ' + val.slice(en)
    emit('update:modelValue', next)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = s + 4
    })
  }
  // Ctrl/Cmd + Enter 触发运行（由父组件监听）
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    emit('reset', 'run')
  }
}

function onReset() {
  emit('reset', 'reset')
}

defineExpose({ focus: () => ta.value?.focus() })
</script>

<style scoped>
.editor { border-radius: 12px; overflow: hidden; border: 1px solid #16241f; background: var(--code-bg); }
.editor__bar {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; background: #16241f; border-bottom: 1px solid #1d2c26;
  font-family: var(--mono); font-size: 11px; color: #8fb3a2;
}
.editor__dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.editor__file { font-weight: 600; }
.editor__meta { color: #63806f; }
.editor__act {
  border: 1px solid #2a3f37; background: #1d2c26; color: #a8c9b8;
  border-radius: 7px; padding: 2px 8px; font-size: 11px; cursor: pointer;
}
.editor__area {
  width: 100%; border: none; outline: none; background: transparent;
  color: var(--code-ink); font-family: var(--mono);
  font-size: 13px; line-height: 1.72; padding: 12px;
  resize: vertical; min-height: 168px; max-height: 55vh;
  tab-size: 4; caret-color: var(--amber-bright);
  white-space: pre; overflow-x: auto; overflow-y: auto;
  -webkit-text-size-adjust: 100%;
}
.editor__area::placeholder { color: #4e6357; }
</style>
