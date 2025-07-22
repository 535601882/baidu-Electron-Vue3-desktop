import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { useHistoryStore } from './stores/historyStore.js'
import { useBookmarkStore } from './stores/bookmarkStore.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 在应用挂载前加载持久化数据
app.mount('#app')

// 获取store实例并加载数据
const historyStore = useHistoryStore()
historyStore.loadHistory()

const bookmarkStore = useBookmarkStore()
bookmarkStore.loadBookmarks()
