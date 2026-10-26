<template>
  <div>
    <header class="appbar">
      <div class="grow">
        <div class="appbar__title">课程</div>
        <div class="appbar__sub">{{ tracks.length }} 条路线并行，随时切换</div>
      </div>
    </header>

    <div class="page">
      <!-- 路线切换 -->
      <div class="seg" style="margin-bottom:16px">
        <button
          v-for="t in tracks"
          :key="t.id"
          class="seg__item"
          :class="{ 'seg__item--on': active === t.id }"
          @click="active = t.id"
        >
          {{ t.icon }} {{ t.name }}
          <span class="muted"> {{ trackDone(t.id) }}/{{ trackTotal(t.id) }}</span>
        </button>
      </div>

      <!-- 总览 -->
      <div class="card overview">
        <div class="row row--between">
          <div>
            <div class="strong">{{ course.tagline }}</div>
            <div class="small muted" style="margin-top:3px">{{ course.desc }}</div>
          </div>
          <div class="overview__pct">{{ pct }}%</div>
        </div>
        <div class="bar" style="margin-top:11px">
          <div class="bar__fill" :style="{ width: pct + '%' }" />
        </div>
      </div>

      <div v-if="course.notice" class="note note--info" style="margin-top:13px">
        <span>ℹ️</span><span>{{ course.notice }}</span>
      </div>

      <!-- 章节 -->
      <div v-for="ch in course.chapters" :key="ch.id" style="margin-top:22px">
        <div class="chapterhead">
          <span class="chapterhead__no">第 {{ ch.no }} 章</span>
          <span class="chapterhead__title">{{ ch.title }}</span>
          <span class="chip chip--muted">{{ chapterDone(ch) }}/{{ ch.lessons.length }}</span>
        </div>
        <div class="small muted" style="margin:-4px 0 10px 2px">{{ ch.desc }}</div>

        <div class="list">
          <div
            v-for="l in ch.lessons"
            :key="l.id"
            class="list-item"
            :class="{ 'list-item--active': isDone(l.id) }"
            @click="open(l)"
          >
            <div
              class="list-item__idx"
              :class="{
                'list-item__idx--done': isDone(l.id),
                'list-item__idx--now': !isDone(l.id) && isNext(l),
              }"
            >
              {{ isDone(l.id) ? '✓' : l.no }}
            </div>
            <div class="grow">
              <div class="strong">{{ l.title }}</div>
              <div class="small muted" style="margin-top:2px">
                约 {{ l.minutes }} 分钟 · {{ l.level }}
              </div>
            </div>
            <span v-if="isDone(l.id)" class="chip chip--ok">完成</span>
            <span v-else-if="isNext(l)" class="chip chip--amber">下一节</span>
            <span v-else class="chip chip--muted">未学</span>
          </div>
        </div>
      </div>

      <div class="spacer" style="height:20px" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isLessonDone } from '../store/app.js'
import { TRACKS, trackOf } from '../data/courses.js'

const router = useRouter()

const tracks = TRACKS

const active = ref(trackOf(localStorage.getItem('xiaokun.track')).id)
watch(active, (v) => localStorage.setItem('xiaokun.track', v))

const course = computed(() => trackOf(active.value).course)
const lessons = computed(() => trackOf(active.value).lessons)

const pct = computed(() => {
  const d = lessons.value.filter((l) => isLessonDone(l.id)).length
  return Math.round((d / lessons.value.length) * 100)
})

function trackDone(id) {
  return trackOf(id).lessons.filter((l) => isLessonDone(l.id)).length
}
function trackTotal(id) {
  return trackOf(id).lessons.length
}
function chapterDone(ch) {
  return ch.lessons.filter((l) => isLessonDone(l.id)).length
}
function isDone(id) {
  return isLessonDone(id)
}
/** 第一个未完成的小节标成"下一节" */
function isNext(l) {
  const first = lessons.value.find((x) => !isLessonDone(x.id))
  return first && first.id === l.id
}

function open(l) {
  router.push(`/learn/${active.value}/${l.id}`)
}
</script>

<style scoped>
.overview__pct {
  font-size: 26px; font-weight: 800; color: var(--brand);
  line-height: 1; flex: none; margin-left: 12px;
}
.chapterhead {
  display: flex; align-items: center; gap: 9px; margin-bottom: 2px;
}
.chapterhead__no {
  font-size: 11px; font-weight: 800; color: var(--amber);
  background: var(--amber-soft); border-radius: 6px; padding: 3px 8px;
  border: 1px solid #f4dcb2; flex: none;
}
.chapterhead__title { font-size: 15.5px; font-weight: 700; flex: 1; min-width: 0; }
</style>
