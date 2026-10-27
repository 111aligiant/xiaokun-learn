<template>
  <div class="page">
    <!-- 顶部问候 -->
    <div class="card card--brand hero">
      <div class="row row--between">
        <div>
          <div class="hero__hi">{{ greeting }}<template v-if="s.profile?.name">，{{ s.profile.name }}</template></div>
          <div class="hero__sub">
            {{ streakDays > 0 ? `已连续学习 ${streakDays} 天` : '今天开个头吧' }}
          </div>
        </div>
        <div class="hero__avatar">{{ s.assistantName.slice(0, 1) }}</div>
      </div>

      <div class="hero__bar">
        <div class="hero__barfill" :style="{ width: overallPct + '%' }" />
      </div>
      <div class="row row--between hero__barinfo">
        <span>总进度 {{ doneCount }}/{{ totalLessons }} 节</span>
        <span>{{ overallPct }}%</span>
      </div>
    </div>

    <!-- 未配置 Key 的提醒 -->
    <div v-if="!hasKey" class="note note--warn" style="margin-top:14px">
      <span>🔑</span>
      <span>
        还没配置 API Key，助教暂时不能回答。
        <a @click="router.push('/settings')" style="text-decoration:underline;cursor:pointer">去设置 →</a>
      </span>
    </div>

    <!-- 继续学习 -->
    <div class="section-title">继续</div>
    <div v-if="nextLesson" class="list-item" style="align-items:center" @click="openLesson(nextLesson)">
      <div class="list-item__idx list-item__idx--now">{{ nextTrack.icon }}</div>
      <div class="grow">
        <div class="strong">{{ nextLesson.title }}</div>
        <div class="small muted">
          {{ nextTrack.name }} · 第 {{ nextLesson.no }} 节 · 约 {{ nextLesson.minutes }} 分钟
          <span v-if="resume">（上次学到这）</span>
        </div>
      </div>
      <span class="chip chip--amber">继续</span>
    </div>
    <div v-else class="card card--flat center muted small">
      所有课程都学完了，去实操台写点真东西吧。
    </div>

    <!-- 双轨进度 -->
    <div class="section-title">学习路线</div>
    <div class="trackgrid">
      <div
        v-for="c in courseList"
        :key="c.id"
        class="trackcard"
        :class="{ 'trackcard--done': c.pct >= 100 }"
        @click="router.push('/learn')"
      >
        <div class="trackcard__icon">{{ c.icon }}</div>
        <div class="trackcard__name">{{ c.name }}</div>
        <div class="trackcard__num">{{ c.done }}<span>/{{ c.total }}</span></div>
        <div class="bar bar--thin"><div class="bar__fill" :style="{ width: c.pct + '%' }" /></div>
        <div class="tiny muted" style="margin-top:6px">{{ c.pct }}% 完成</div>
      </div>
    </div>

    <!-- 快捷动作 -->
    <div class="section-title">快捷动作</div>
    <div class="col">
      <button class="btn btn--ghost btn--block" @click="goChat('我今天有时间，帮我安排一个 20 分钟能学完的知识点。', { autoSend: true })">
        ⏱️ 帮我安排今天学什么
      </button>
      <button class="btn btn--ghost btn--block" @click="goChat('针对我当前的学习进度，出 3 道练习题，不要给答案。', { autoSend: true })">
        ✍️ 出 3 道练习题
      </button>
      <button class="btn btn--ghost btn--block" @click="goChat('我贴一段代码请你批改。\n\n```\n\n```')">
        🔍 批改我的代码
      </button>
      <button class="btn btn--ghost btn--block" @click="router.push('/lab')">
        🧪 打开实操台（跑 Python / SQL）
      </button>
    </div>

    <!-- 统计 -->
    <div class="section-title">我的数据</div>
    <div class="statgrid">
      <div class="stat"><div class="stat__n">{{ doneCount }}</div><div class="stat__l">完成小节</div></div>
      <div class="stat"><div class="stat__n">{{ streakDays }}</div><div class="stat__l">连续天数</div></div>
      <div class="stat"><div class="stat__n">{{ state.stats.askCount }}</div><div class="stat__l">提问次数</div></div>
      <div class="stat"><div class="stat__n">{{ state.stats.runCount }}</div><div class="stat__l">运行代码</div></div>
    </div>

    <div class="tiny muted center" style="margin-top:22px;line-height:1.7">
      所有数据只存在这台手机上，不会上传。<br />
      {{ s.assistantName }} · v{{ version }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  state, hasApiKey, streakDays, doneCount, isLessonDone, setLastLesson,
} from '../store/app.js'
import { sendToChat } from '../store/lab-bus.js'
import { TRACKS, trackOf, findTrackByLesson, totalLessonCount } from '../data/courses.js'
import { packForProfile, localizeText } from '../data/domain-packs.js'

const router = useRouter()
const s = computed(() => state.settings)
const hasKey = hasApiKey
const version = __APP_VERSION__

const courseList = computed(() => TRACKS.map((t) => {
  const done = t.lessons.filter((l) => isLessonDone(l.id)).length
  return {
    id: t.id, name: t.name, icon: t.icon,
    total: t.lessons.length,
    done,
    pct: Math.round((done / t.lessons.length) * 100),
  }
}))

const totalLessons = computed(() => totalLessonCount())
const overallPct = computed(() => Math.round((doneCount.value / totalLessons.value) * 100) || 0)

/** 推荐下一节：优先"上次学到的"，否则第一条未完成的，按 Python → SQLite 顺序 */
const resume = computed(() => !!state.lastLesson)

const nextPick = computed(() => {
  if (state.lastLesson && state.settings.useLessonContext !== false) {
    const { track, lessonId } = state.lastLesson
    const list = trackOf(track).lessons
    const idx = list.findIndex((l) => l.id === lessonId)
    if (idx >= 0) {
      // 如果这一节已完成，就推下一节
      const nxt = list[idx + 1] || list[idx]
      return { track, lesson: nxt }
    }
  }
  for (const t of TRACKS) {
    const l = t.lessons.find((x) => !isLessonDone(x.id))
    if (l) return { track: t.id, lesson: l }
  }
  return null
})

const nextLesson = computed(() => {
  const l = nextPick.value?.lesson
  if (!l) return null
  return { ...l, title: localizeText(l.title, packForProfile(s.value.profile || {}), { identifiers: false }) }
})
const nextTrack = computed(() => {
  const t = trackOf(nextPick.value?.track)
  return { name: t.name, icon: t.icon }
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 23) return '晚上好'
  return '夜深了'
})

function openLesson(item) {
  if (!item) return
  const track = findTrackByLesson(item.id)?.id || TRACKS[0].id
  setLastLesson(track, item.id)
  router.push(`/learn/${track}/${item.id}`)
}

function goChat(prompt, options) {
  sendToChat(prompt, options)
  router.push('/chat')
}
</script>

<style scoped>
.hero { padding: 17px 18px 15px; }
.hero__hi { font-size: 18px; font-weight: 700; }
.hero__sub { font-size: 12.5px; color: rgba(242,251,245,.75); margin-top: 2px; }
.hero__avatar {
  width: 40px; height: 40px; border-radius: 13px;
  background: rgba(255,255,255,.16); color: #fff;
  display: grid; place-items: center; font-size: 18px; font-weight: 800;
}
.hero__bar {
  height: 6px; border-radius: 99px; background: rgba(255,255,255,.2);
  margin-top: 14px; overflow: hidden;
}
.hero__barfill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #f0a622, #ffd48a);
  transition: width .5s cubic-bezier(.22,.8,.3,1);
}
.hero__barinfo {
  font-size: 11.5px; color: rgba(242,251,245,.8); margin-top: 7px;
}

.trackgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
.trackcard {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 14px; cursor: pointer;
  box-shadow: var(--shadow); transition: transform .14s;
}
.trackcard:active { transform: scale(.98); }
.trackcard--done { border-color: var(--brand-soft2); background: var(--brand-soft); }
.trackcard__icon { font-size: 22px; }
.trackcard__name { font-weight: 700; font-size: 14px; margin: 5px 0 8px; }
.trackcard__num { font-size: 21px; font-weight: 800; color: var(--brand); margin-bottom: 7px; }
.trackcard__num span { font-size: 12px; color: var(--muted); font-weight: 600; }

.statgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }
.stat {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-sm); padding: 11px 6px; text-align: center;
}
.stat__n { font-size: 19px; font-weight: 800; color: var(--brand-deep); line-height: 1.2; }
.stat__l { font-size: 10.5px; color: var(--muted); margin-top: 3px; }
</style>
