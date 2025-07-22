<template>
  <div class="title-bar-content" style="background-color: #f0f0f0;"> <!-- 添加背景色 -->
    <div class="title">百度增强桌面版</div>
    <div class="window-controls">
      <el-button :icon="Minus" circle size="small" @click="minimize" />
      <el-button :icon="FullScreen" circle size="small" @click="maximize" />
      <el-button :icon="Close" circle size="small" type="danger" @click="close" />
    </div>
  </div>
</template>

<script setup>
import { Minus, FullScreen, Close } from '@element-plus/icons-vue'

// 最小化窗口
const minimize = () => {
  window.electronAPI.minimizeWindow();
}

// 最大化/恢复窗口
const maximize = () => {
  window.electronAPI.maximizeWindow();
}

// 关闭窗口
const close = () => {
  window.electronAPI.closeWindow();
}
</script>

<style scoped>
.title-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  -webkit-app-region: no-drag; /* 确保控制按钮可点击 */
}

.title {
  font-size: 14px;
  font-weight: bold;
  margin-left: 8px;
  -webkit-app-region: drag; /* 允许拖动标题栏来移动窗口 */
  flex-grow: 1;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
