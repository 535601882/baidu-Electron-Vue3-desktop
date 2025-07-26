<template>
  <div class="common-layout">
    <el-container>
      <el-header class="title-bar" height="40px">
        <TitleBar />
      </el-header>
      <el-container>
        <el-aside width="200px" style="background-color: #e6f7ff;"> <!-- 添加背景色 -->
          <SideBar />
        </el-aside>
        <el-main>
          <!-- BrowserView 由主进程控制，此区域仅作为占位符 -->
          <div class="content-placeholder">
             <!-- 可以在这里添加前进、后退、刷新等控制按钮 -->
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 更新通知 -->
    <div v-if="updateInfo.visible" class="update-notification">
      <div v-if="updateInfo.status === 'available'">
        <span>发现新版本 v{{ updateInfo.version }}！</span>
        <el-button type="primary" size="small" @click="downloadUpdate">立即下载</el-button>
      </div>
      <div v-if="updateInfo.status === 'downloading'">
        <span>正在下载新版本... {{ updateInfo.progress.percent.toFixed(1) }}%</span>
        <el-progress :percentage="updateInfo.progress.percent" :stroke-width="10" striped />
      </div>
      <div v-if="updateInfo.status === 'downloaded'">
        <span>新版本已下载完成！</span>
        <el-button type="success" size="small" @click="installUpdate">立即重启并安装</el-button>
      </div>
       <div v-if="updateInfo.status === 'error'">
        <span>更新出错: {{ updateInfo.error }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TitleBar from './components/TitleBar.vue'
import SideBar from './components/SideBar.vue'

const updateInfo = ref({
  visible: false,
  status: 'init', // init, checking, available, downloading, downloaded, error
  version: '',
  progress: { percent: 0 },
  error: null
});

// 在发现新版本后，用户点击下载
const downloadUpdate = () => {
  // 这个函数在当前实现下是可选的，因为主进程发现新版后通常会自动开始下载
  // 但保留这个按钮可以给用户一个明确的“开始”操作
  // 也可以在这里触发一个ipc事件，如果主进程逻辑需要的话
  console.log('用户点击了下载按钮，主进程应该已经在自动下载了。');
  // 如果主进程没有自动下载，可以在这里触发
  // window.electronAPI.send('download-update'); 
};

// 触发安装
const installUpdate = () => {
  window.electronAPI.send('install-update');
};

const handleUpdateStatus = (data) => {
  console.log('Update status received:', data);
  updateInfo.value.status = data.status;

  if (data.status !== 'checking') {
      updateInfo.value.visible = true;
  }

  if (data.status === 'available') {
    updateInfo.value.version = data.info.version;
  }
  if (data.status === 'downloading') {
    updateInfo.value.progress = data.progress;
  }
  if (data.status === 'error') {
    updateInfo.value.error = data.error;
    // 5秒后自动隐藏错误消息
    setTimeout(() => { updateInfo.value.visible = false; }, 5000);
  }
  if (data.status === 'not-available') {
    // 如果没有新版本，2秒后自动隐藏
    setTimeout(() => { updateInfo.value.visible = false; }, 2000);
  }
};

onMounted(() => {
  // 监听主进程的更新状态
  window.electronAPI.on('update-status', handleUpdateStatus);
});

onUnmounted(() => {
  // 组件卸载时移除监听器，防止内存泄漏
  window.electronAPI.removeListener('update-status', handleUpdateStatus);
});

</script>

<style>
/* 基础样式，使应用界面整洁 */
body, html, #app, .common-layout, .el-container {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.title-bar {
  -webkit-app-region: drag; /* 允许拖动窗口 */
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.el-aside {
  border-right: 1px solid #e0e0e0;
}

.el-main {
  padding: 0;
}

.content-placeholder {
  height: 100%;
  width: 100%;
  background-color: #fff;
}

/* 更新通知样式 */
.update-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 15px;
}
</style>
