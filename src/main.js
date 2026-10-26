import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './style.css'

createApp(App).use(router).mount('#app')

// 生产环境注册 Service Worker：第二次打开即可离线加载界面与已缓存资源
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
