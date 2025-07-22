import { defineStore } from 'pinia'

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    items: [],
  }),
  actions: {
    async loadBookmarks() {
      const storedBookmarks = await window.electronAPI.store.get('bookmarkItems');
      if (storedBookmarks) {
        this.items = storedBookmarks;
      }
    },
    async addBookmark(item) {
      if (!this.items.find(i => i.url === item.url)) {
        this.items.push(item)
        // 在保存前，将响应式数据转换为普通对象，避免克隆错误
        await window.electronAPI.store.set('bookmarkItems', JSON.parse(JSON.stringify(this.items)));
      }
    },
    async removeBookmark(url) {
      this.items = this.items.filter(i => i.url !== url)
      // 在保存前，将响应式数据转换为普通对象，避免克隆错误
      await window.electronAPI.store.set('bookmarkItems', JSON.parse(JSON.stringify(this.items)));
    },
  },
})
