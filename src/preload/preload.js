const { contextBridge, ipcRenderer } = require('electron');

// 定义一个白名单，只允许监听这些频道的事件，增强安全性
const validOnChannels = ['add-history', 'update-status'];

// 使用 contextBridge 在渲染进程的 window 对象上暴露一个安全的 API
// 这样渲染进程就可以调用主进程的功能，而无需完全访问 Node.js 环境
contextBridge.exposeInMainWorld('electronAPI', {
  // --- 从渲染进程发送到主进程的单向通信 ---
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  loadURL: (url) => ipcRenderer.send('load-url', url),
  toggleDarkMode: (isDark) => ipcRenderer.send('toggle-dark-mode', isDark),

  // --- 为更新流程添加的通用 send 方法 ---
  send: (channel, data) => {
    // 定义一个白名单，只允许向这些频道发送消息
    const validSendChannels = ['check-for-update', 'install-update'];
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // --- 双向通信 (使用invoke/handle) ---
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
  },

  // --- 从主进程接收事件的监听器 ---
  on: (channel, callback) => {
    if (validOnChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    } else {
      console.warn(`Attempted to listen on invalid channel: ${channel}`);
    }
  },

  // 移除监听器，防止内存泄漏
  removeListener: (channel, callback) => {
    if (validOnChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  }
});
