import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    // For now, the main component is just App.vue
    // We can add more routes for settings etc. later
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
