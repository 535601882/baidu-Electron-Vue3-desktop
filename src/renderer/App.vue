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
  </div>
</template>

<script setup>
import TitleBar from './components/TitleBar.vue'
import SideBar from './components/SideBar.vue'
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
</style>
