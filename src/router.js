import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'home', component: () => import('./views/Home.vue') },
  { path: '/learn', name: 'learn', component: () => import('./views/Learn.vue') },
  { path: '/learn/:track/:lessonId', name: 'lesson', component: () => import('./views/Lesson.vue') },
  { path: '/chat', name: 'chat', component: () => import('./views/Chat.vue') },
  { path: '/lab', name: 'lab', component: () => import('./views/Lab.vue') },
  { path: '/settings', name: 'settings', component: () => import('./views/Settings.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
