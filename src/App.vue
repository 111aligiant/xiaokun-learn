<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <ProfileWizard v-if="!state.onboarded" @close="onboarded" />

  <nav class="tabbar" v-if="showTabbar">
    <button
      v-for="t in tabs"
      :key="t.path"
      class="tabbar__item"
      :class="{ 'tabbar__item--on': activePath === t.path }"
      @click="go(t.path)"
    >
      <span class="tabbar__iconwrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
             stroke-linecap="round" stroke-linejoin="round" v-html="t.icon" />
        <span v-if="t.badge && badgeCount" class="tabbar__badge">{{ badgeCount }}</span>
      </span>
      <span>{{ t.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { state } from './store/app.js'
import ProfileWizard from './components/ProfileWizard.vue'

const route = useRoute()
const router = useRouter()

const I = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 5.5v15"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
  lab: '<path d="M9 3h6"/><path d="M10 3v6.5L5.5 18A2 2 0 0 0 7.3 21h9.4a2 2 0 0 0 1.8-3L14 9.5V3"/>',
  me: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
}

const tabs = [
  { path: '/home', label: '首页', icon: I.home },
  { path: '/learn', label: '课程', icon: I.book },
  { path: '/chat', label: '助教', icon: I.chat },
  { path: '/lab', label: '实操', icon: I.lab },
  { path: '/settings', label: '我的', icon: I.me },
]

const showTabbar = computed(() => true)

const activePath = computed(() => {
  const p = route.path
  if (p.startsWith('/learn')) return '/learn'
  return p
})

/* 未配置 Key 时，在"我的"上挂个提醒 */
const badgeCount = computed(() => (state.settings.apiKey ? 0 : 1))

function go(path) {
  if (route.path !== path) router.push(path)
}

function onboarded() {
  state.onboarded = true
}
</script>
