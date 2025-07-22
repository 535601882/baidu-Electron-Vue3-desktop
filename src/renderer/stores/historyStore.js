import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    items: [],
  }),
  actions: {
    async loadHistory() {
      const storedHistory = await window.electronAPI.store.get('historyItems');
      if (storedHistory) {
        this.items = storedHistory;
      }
    },
    async addHistory(item) {
      // 避免添加重复项
      if (!this.items.find(i => i.url === item.url)) {
        this.items.unshift(item) // 添加到顶部
        // 可选：限制历史记录大小
        if (this.items.length > 50) {
          this.items.pop()
        }
        // 在保存前，将响应式数据转换为普通对象，避免克隆错误
        await window.electronAPI.store.set('historyItems', JSON.parse(JSON.stringify(this.items)));
      }
    },
    async clearHistory() {
      this.items = []
      // 在保存前，将响应式数据转换为普通对象，避免克隆错误
      await window.electronAPI.store.set('historyItems', JSON.parse(JSON.stringify(this.items)));
    },
  },
})
