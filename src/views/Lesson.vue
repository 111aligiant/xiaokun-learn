<template>
  <div v-if="lesson">
    <header class="appbar">
      <button class="btn btn--icon btn--ghost btn--sm" @click="back">←</button>
      <div class="grow" style="min-width:0">
        <div class="appbar__title nowrap" style="overflow:hidden;text-overflow:ellipsis">
          {{ lesson.title }}
        </div>
        <div class="appbar__sub">
          第 {{ lesson.no }} 节 · 约 {{ lesson.minutes }} 分钟 · {{ lesson.level }}
        </div>
      </div>
      <button
        class="btn btn--sm"
        :class="done ? 'btn--primary' : 'btn--ghost'"
        @click="toggleDone"
      >
        {{ done ? '✓ 已完成' : '标记完成' }}
      </button>
    </header>

    <div class="page">
      <!-- 学习目标 -->
      <div class="card card--flat objectives">
        <div class="tiny strong" style="color:var(--brand);letter-spacing:.08em">本节目标</div>
        <ul>
          <li v-for="(o, i) in lesson.objectives" :key="i">{{ o }}</li>
        </ul>
      </div>

      <!-- 正文 -->
      <div style="margin-top:18px">
        <ContentBlocks :blocks="lesson.blocks" @run="runInLab" />
      </div>

      <!-- 练习题 -->
      <div v-if="lesson.exercise" class="exercise">
        <div class="exercise__head">
          <span class="chip chip--amber">✍️ 动手练习</span>
          <span class="tiny muted">约 {{ Math.max(3, Math.round(lesson.minutes / 3)) }} 分钟</span>
        </div>

        <p class="exercise__task">{{ lesson.exercise.task }}</p>

        <div class="row wrap" style="gap:8px;margin-bottom:11px">
          <button class="btn btn--sm btn--ghost" @click="showHint = !showHint">
            {{ showHint ? '收起提示' : '看提示' }}
          </button>
          <button class="btn btn--sm btn--ghost" @click="showAnswer = !showAnswer">
            {{ showAnswer ? '收起答案' : '看参考答案' }}
          </button>
        </div>

        <div v-if="showHint" class="note note--warn" style="margin-bottom:11px">
          <span>💡</span><span>{{ lesson.exercise.hint }}</span>
        </div>

        <CodeEditor
          v-model="userCode"
          :filename="fileName"
          placeholder="先自己写一遍，再对照答案…"
        />

        <div class="row wrap" style="gap:8px;margin-top:11px">
          <button class="btn btn--sm btn--amber" @click="runCurrent">
            ▶ 运行我的代码
          </button>
          <button class="btn btn--sm btn--ghost" @click="askTutorAboutCode">
            🤖 让助教点评
          </button>
          <button class="btn btn--sm btn--ghost" @click="userCode = lesson.exercise.starter || ''">
            恢复初始代码
          </button>
        </div>

        <div v-if="showAnswer" style="margin-top:14px">
          <div class="tiny strong" style="margin-bottom:7px;color:var(--ok)">参考答案</div>
          <ContentBlocks
            :blocks="[['code', lang, lesson.exercise.answer]]"
            @run="runInLab"
          />
          <div v-if="lesson.exercise.note" class="note" style="margin-top:2px">
            <span>📌</span><span>{{ lesson.exercise.note }}</span>
          </div>
        </div>
      </div>

      <!-- 小测验 -->
      <div v-if="lesson.quiz && lesson.quiz.length" class="quiz">
        <div class="chip chip--brand" style="margin-bottom:12px">🧠 自测</div>

        <div v-for="(q, qi) in lesson.quiz" :key="qi" class="quiz__item">
          <div class="quiz__q">{{ qi + 1 }}. {{ q.q }}</div>
          <button
            v-for="(opt, oi) in q.options"
            :key="oi"
            class="quiz__opt"
            :class="optionClass(q, qi, oi)"
            @click="pick(qi, oi)"
          >
            <span class="quiz__mark">{{ mark(q, qi, oi) }}</span>
            <span class="grow">{{ opt }}</span>
          </button>
          <div v-if="picked[qi] !== undefined" class="quiz__explain">
            {{ q.explain }}
          </div>
        </div>
      </div>

      <!-- 笔记 -->
      <div class="section-title">我的笔记</div>
      <textarea
        class="textarea"
        v-model="noteText"
        placeholder="记下这一节的关键点、踩过的坑…（自动保存）"
        @input="saveNote"
      />

      <!-- 助教入口 -->
      <div class="card card--brand" style="margin-top:18px">
        <div class="strong">这里没看懂？</div>
        <div class="small" style="color:rgba(242,251,245,.78);margin:4px 0 11px">
          {{ s.assistantName }}已经知道你在学这一节，直接问就行。
        </div>
        <button class="btn btn--amber btn--sm" @click="askAboutLesson">
          带着本节上下文去问助教
        </button>
      </div>

      <!-- 上一节 / 下一节 -->
      <div class="navrow">
        <button class="btn btn--ghost grow" :disabled="!prev" @click="goLesson(prev)">
          ← {{ prev ? prev.title : '已经是第一节' }}
        </button>
        <button class="btn btn--primary grow" :disabled="!next" @click="goLesson(next)">
          {{ next ? next.title : '最后一节' }} →
        </button>
      </div>
    </div>
  </div>

  <div v-else class="page">
    <div class="empty">
      <div class="empty__icon">🔍</div>
      <div>没找到这一节</div>
      <button class="btn btn--ghost" style="margin-top:14px" @click="back">返回课程列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentBlocks from '../components/ContentBlocks.vue'
import CodeEditor from '../components/CodeEditor.vue'
import {
  state, isLessonDone, toggleLessonDone, setNote, setLastLesson, markLessonDone,
} from '../store/app.js'
import { sendToLab, sendToChat } from '../store/lab-bus.js'
import { trackOf, findLesson } from '../data/courses.js'
import { packForProfile, localizeLesson, localizeText } from '../data/domain-packs.js'

const route = useRoute()
const router = useRouter()

const track = computed(() => trackOf(route.params.track).id)
const trackObj = computed(() => trackOf(track.value))
const pack = computed(() => packForProfile(state.settings.profile || {}))
const localizeOptions = computed(() => ({ identifiers: track.value === 'sql' }))
const lesson = computed(() =>
  localizeLesson(findLesson(track.value, route.params.lessonId), pack.value, localizeOptions.value)
)
const list = computed(() =>
  trackObj.value.lessons.map((l) => ({
    ...l,
    title: localizeText(l.title, pack.value, { identifiers: false }),
  }))
)
const lang = computed(() => trackObj.value.lang)
const fileName = computed(() => `practice.${trackObj.value.extension}`)

const s = computed(() => state.settings)
const done = computed(() => (lesson.value ? isLessonDone(lesson.value.id) : false))

const showHint = ref(false)
const showAnswer = ref(false)
const userCode = ref('')
const noteText = ref('')
const picked = ref({})

const idx = computed(() => list.value.findIndex((l) => l.id === lesson.value?.id))
const prev = computed(() => (idx.value > 0 ? list.value[idx.value - 1] : null))
const next = computed(() =>
  idx.value >= 0 && idx.value < list.value.length - 1 ? list.value[idx.value + 1] : null
)

function syncLesson() {
  const l = lesson.value
  if (!l) return
  showHint.value = false
  showAnswer.value = false
  picked.value = {}
  userCode.value = l.exercise?.starter || ''
  noteText.value = state.notes[l.id] || ''
  setLastLesson(track.value, l.id)
}

watch(() => route.fullPath, syncLesson)
onMounted(syncLesson)

function back() {
  router.push('/learn')
}

function toggleDone() {
  if (!lesson.value) return
  toggleLessonDone(lesson.value.id)
}

function goLesson(l) {
  if (!l) return
  router.push(`/learn/${track.value}/${l.id}`)
}

function saveNote() {
  if (lesson.value) setNote(lesson.value.id, noteText.value)
}

function runInLab(code, codeLang) {
  sendToLab(code, codeLang)
  markLessonDone(lesson.value?.id)
  router.push('/lab')
}

function runCurrent() {
  if (!userCode.value.trim()) return
  sendToLab(userCode.value, lang.value)
  router.push('/lab')
}

function askTutorAboutCode() {
  const prompt = `我在学《${lesson.value.title}》，这是我写的练习代码，请批改：\n\n\`\`\`${lang.value}\n${userCode.value}\n\`\`\`\n\n按这个结构回答：①能跑通吗 ②逻辑对不对 ③还能怎么改进 ④我需要补哪个知识点。`
  sendToChat(prompt, { ctx: { track: track.value, lessonId: lesson.value.id } })
  router.push('/chat')
}

function askAboutLesson() {
  sendToChat(`我在看《${lesson.value.title}》这一节，有几个地方想弄清楚。`, {
    ctx: { track: track.value, lessonId: lesson.value.id },
  })
  router.push('/chat')
}

function pick(qi, oi) {
  picked.value = { ...picked.value, [qi]: oi }
}

function optionClass(q, qi, oi) {
  if (picked.value[qi] === undefined) return ''
  if (oi === q.answer) return 'quiz__opt--right'
  if (picked.value[qi] === oi) return 'quiz__opt--wrong'
  return 'quiz__opt--dim'
}

function mark(q, qi, oi) {
  if (picked.value[qi] === undefined) return ''
  if (oi === q.answer) return '✓'
  if (picked.value[qi] === oi) return '✗'
  return ''
}
</script>

<style scoped>
.objectives {
  background: linear-gradient(180deg, var(--brand-soft), var(--surface));
  border-color: var(--brand-soft2);
}
.objectives ul { margin: 8px 0 0; padding-left: 19px; }
.objectives li { font-size: 13.5px; margin-bottom: 4px; color: var(--ink-2); }

.exercise, .quiz {
  margin-top: 24px; padding: 15px 14px;
  border: 1px solid var(--line); border-radius: var(--radius);
  background: var(--surface-2);
}
.exercise__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.exercise__task { font-size: 14.5px; font-weight: 600; margin: 0 0 12px; }

.quiz { background: var(--surface); }
.quiz__item { margin-bottom: 20px; }
.quiz__item:last-child { margin-bottom: 0; }
.quiz__q { font-weight: 600; font-size: 14.5px; margin-bottom: 9px; }
.quiz__opt {
  display: flex; align-items: center; gap: 9px; width: 100%;
  text-align: left; padding: 10px 12px; margin-bottom: 7px;
  border: 1px solid var(--line-strong); border-radius: var(--radius-sm);
  background: var(--surface); font-size: 14px; cursor: pointer;
  transition: background .16s, border-color .16s;
}
.quiz__opt:active { transform: scale(.99); }
.quiz__mark { width: 14px; flex: none; font-weight: 800; }
.quiz__opt--right { background: var(--ok-soft); border-color: #a8d5bd; color: var(--ok); }
.quiz__opt--wrong { background: var(--danger-soft); border-color: #eeb3ad; color: var(--danger); }
.quiz__opt--dim { opacity: .55; }
.quiz__explain {
  margin-top: 8px; padding: 10px 12px; font-size: 13px; line-height: 1.65;
  background: var(--info-soft); color: var(--info);
  border-radius: var(--radius-sm); border: 1px solid #cfe0ee;
}

.navrow { display: flex; gap: 10px; margin-top: 22px; }
.navrow .btn { text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
</style>
