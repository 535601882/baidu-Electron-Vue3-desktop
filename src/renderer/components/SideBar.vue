<template>
  <div class="sidebar-container" style="background-color: #f8f8f8;"> <!-- 添加背景色 -->
    <el-tabs v-model="activeTab" class="sidebar-tabs">
      <el-tab-pane label="历史记录" name="history">
        <div class="tab-content">
          <el-button @click="historyStore.clearHistory()" size="small" type="danger" plain>清空历史</el-button>
          <el-empty v-if="!historyStore.items.length" description="暂无历史记录" :image-size="60" />
          <ul v-else class="item-list">
            <li v-for="item in historyStore.items" :key="item.url" @click="navigateTo(item.url)" :title="item.url">
              <span class="item-title">{{ item.title }}</span>
            </li>
          </ul>
        </div>
      </el-tab-pane>
      <el-tab-pane label="书签" name="bookmarks">
        <div class="tab-content">
          <el-button @click="addCurrentPageAsBookmark" size="small">收藏当前页</el-button>
          <el-empty v-if="!bookmarkStore.items.length" description="暂无书签" :image-size="60" />
           <ul v-else class="item-list">
            <li v-for="item in bookmarkStore.items" :key="item.url" @click="navigateTo(item.url)" :title="item.url">
              <span class="item-title">{{ item.title }}</span>
              <el-icon class="delete-icon" @click.stop="bookmarkStore.removeBookmark(item.url)"><Close /></el-icon>
            </li>
          </ul>
        </div>
      </el-tab-pane>
      <el-tab-pane label="设置" name="settings">
        <div class="tab-content">
          <el-switch
            v-model="isDarkMode"
            style="--el-switch-on-color: #333; --el-switch-off-color: #ccc"
            active-text="暗黑模式"
            inactive-text="亮色模式"
            @change="toggleDarkMode"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useHistoryStore } from '../stores/historyStore.js'
import { useBookmarkStore } from '../stores/bookmarkStore.js'
import { Close } from '@element-plus/icons-vue'

const activeTab = ref('history')
const historyStore = useHistoryStore()
const bookmarkStore = useBookmarkStore()
const isDarkMode = ref(false) // 默认亮色模式

// 控制 BrowserView 加载指定 URL
const navigateTo = (url) => {
  window.electronAPI.loadURL(url)
}

// 将当前页面添加为书签
const addCurrentPageAsBookmark = () => {
  // 在真实的应用中，我们应该从主进程获取当前页面的标题和URL
  // 此处为了演示，我们添加一个固定的示例
  bookmarkStore.addBookmark({ title: '百度新闻', url: 'http://news.baidu.com/' })
}

// 切换暗黑模式
const toggleDarkMode = (value) => {
  window.electronAPI.toggleDarkMode(value)
}

const handleAddHistory = (item) => {
  historyStore.addHistory(item);
};

// 监听从主进程发送过来的历史记录更新事件
onMounted(() => {
  window.electronAPI.on('add-history', handleAddHistory);
});

onUnmounted(() => {
  window.electronAPI.removeListener('add-history', handleAddHistory);
});
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sidebar-tabs {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__content) {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}
.item-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}
.item-list li {
  font-size: 14px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-list li:hover {
  background-color: #ecf5ff;
}
.item-title {
  overflow: hidden;
  text-overflow: ellipsis;
}
.delete-icon {
  cursor: pointer;
  margin-left: 8px;
}
.delete-icon:hover {
  color: #f56c6c;
}
</style>
