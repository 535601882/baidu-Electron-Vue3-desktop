const { contextBridge, ipcRenderer } = require('electron');

// 使用 contextBridge 在渲染进程的 window 对象上暴露一个安全的 API
// 这样渲染进程就可以调用主进程的功能，而无需完全访问 Node.js 环境
contextBridge.exposeInMainWorld('electronAPI', {
  // --- 从渲染进程发送到主进程的单向通信 ---
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  loadURL: (url) => ipcRenderer.send('load-url', url),
  toggleDarkMode: (isDark) => ipcRenderer.send('toggle-dark-mode', isDark),

  // --- 双向通信 (使用invoke/handle) ---
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
  },

  // --- 从主进程接收事件的监听器 ---
  onAddHistory: (callback) => ipcRenderer.on('add-history', (_event, value) => callback(value)),
});
