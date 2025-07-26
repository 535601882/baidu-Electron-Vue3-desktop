const { app, BrowserWindow, BrowserView, shell, ipcMain, globalShortcut, Tray, Menu, nativeTheme, Notification } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const Store = require('electron-store');
const log = require('electron-log'); // 引入日志记录

// --- 自动更新配置 ---
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// 开发模式下，强制指向本地的更新描述文件
if (process.env.NODE_ENV === 'development') {
  autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
}

let mainWindow;
let view;
let tray;
const store = new Store(); // 创建electron-store实例

// 百度暗黑模式的CSS (示例，可能需要根据百度页面结构调整)
const BAIDU_DARK_MODE_CSS = `
  body, html, #wrapper, #head, #s_tab, #s_main, #content_left, #page-wrapper, .s-top-wrap, .s-bottom-wrap {
    background-color: #1a1a1a !important;
    color: #e0e0e0 !important;
  }
  #s_tab a, #s_tab span {
    color: #e0e0e0 !important;
  }
  #s_main .s_ipt_wr, #s_main .s_btn_wr {
    background-color: #333 !important;
    border-color: #555 !important;
  }
  #s_main .s_ipt {
    background-color: #333 !important;
    color: #e0e0e0 !important;
  }
  .s-hotsearch-content .hotsearch-item a {
    color: #e0e0e0 !important;
  }
  /* 更多样式调整 */
`;

let injectedCSSKey = null; // 用于存储注入CSS的key，以便移除

// 模拟获取百度热点数据
async function fetchBaiduHotSearch() {
  // 在实际应用中，这里会是一个网络请求，例如：
  // const response = await fetch('https://api.example.com/baidu-hot-search');
  // const data = await response.json();
  // return data.hotTopic;

  const hotTopics = [
    '今日头条：某地发现稀有矿产',
    '科技前沿：AI技术再突破',
    '娱乐八卦：明星新恋情曝光',
    '社会民生：养老金上调方案出炉',
    '体育赛事：奥运会最新战况',
  ];
  const randomIndex = Math.floor(Math.random() * hotTopics.length);
  return hotTopics[randomIndex];
}

function createWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800, // 最小宽度
    minHeight: 600, // 最小高度
    frame: false, // 创建一个无边框窗口
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), // 指定预加载脚本
      nodeIntegration: false, // 为了安全，禁用Node.js集成
      contextIsolation: true, // 开启上下文隔离
    },
  });

  console.log('NODE_ENV:', process.env.NODE_ENV); // 打印当前环境

  // 加载Vue应用 (我们的UI界面)
  if (process.env.NODE_ENV === 'development') {
    // 开发模式下，加载Vite的开发服务器URL
    mainWindow.loadURL('http://localhost:5173');
    // 自动打开开发者工具，并分离窗口
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // 生产模式下，加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  // 在Vue应用加载完成后再创建BrowserView
  mainWindow.webContents.once('did-finish-load', () => {
    // 创建并附加用于显示百度页面的BrowserView
    view = new BrowserView();
    mainWindow.setBrowserView(view);
    // 设置BrowserView的位置和大小，使其位于标题栏下方、侧边栏右侧
    // 初始值，后续会根据窗口大小变化调整
    const { width, height } = mainWindow.getBounds();
    view.setBounds({ x: 200, y: 40, width: width - 200, height: height - 40 });
    // 让BrowserView随窗口大小自动调整
    view.setAutoResize({ width: true, height: true });
    view.webContents.loadURL('https://www.baidu.com');

    // 监听主窗口大小变化，调整BrowserView大小
    mainWindow.on('resize', () => {
      const { width, height } = mainWindow.getBounds();
      view.setBounds({ x: 200, y: 40, width: width - 200, height: height - 40 });
    });

    // 在默认浏览器中打开外部链接
    view.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' }; // 阻止在Electron窗口中打开
    });

    // 监听导航事件以更新历史记录
    view.webContents.on('did-finish-load', () => {
      const url = view.webContents.getURL();
      const title = view.webContents.getTitle();
      // 目前只将百度的搜索结果页添加到历史记录
      if (url.includes('baidu.com/s')) {
         mainWindow.webContents.send('add-history', { url, title });
      }
    });

    // 处理主题切换请求
    ipcMain.on('toggle-dark-mode', (event, isDarkMode) => {
      if (isDarkMode) {
        view.webContents.insertCSS(BAIDU_DARK_MODE_CSS).then(key => {
          injectedCSSKey = key;
        });
      } else {
        if (injectedCSSKey) {
          view.webContents.removeInsertedCSS(injectedCSSKey);
          injectedCSSKey = null;
        }
      }
    });
  });

  // --- IPC 进程间通信监听器 ---

  // 处理来自渲染进程的窗口控制请求
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow.close());

  // 处理来自渲染进程的URL加载请求
  ipcMain.on('load-url', (event, url) => {
    if (view && url) {
      view.webContents.loadURL(url);
    }
  });

  // 持久化数据存储
  ipcMain.handle('store-get', (event, key) => {
    return store.get(key);
  });
  ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value);
  });

  // --- 自动更新相关IPC ---
  // 监听渲染进程的检查更新请求
  ipcMain.on('check-for-update', () => {
    log.info('收到渲染进程的检查更新请求');
    autoUpdater.checkForUpdates();
  });

  // 监听渲染进程的立即安装请求
  ipcMain.on('install-update', () => {
    log.info('收到渲染进程的立即安装请求');
    autoUpdater.quitAndInstall();
  });
}

// --- 自动更新事件监听 ---
autoUpdater.on('checking-for-update', () => {
  log.info('正在检查更新...');
  mainWindow.webContents.send('update-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  log.info('发现新版本:', info);
  mainWindow.webContents.send('update-status', { status: 'available', info });
});

autoUpdater.on('update-not-available', (info) => {
  log.info('当前已是最新版本:', info);
  mainWindow.webContents.send('update-status', { status: 'not-available' });
});

autoUpdater.on('error', (err) => {
  log.error('更新出错:', err);
  mainWindow.webContents.send('update-status', { status: 'error', error: err.message });
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`下载进度: ${progressObj.percent}%`);
  mainWindow.webContents.send('update-status', { status: 'downloading', progress: progressObj });
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('新版本下载完成:', info);
  mainWindow.webContents.send('update-status', { status: 'downloaded' });
});


// Electron应用准备就绪后执行
app.whenReady().then(() => {
  createWindow();

  // 延迟检查更新，给窗口一点时间加载
  setTimeout(() => {
    log.info('应用启动，开始自动检查更新...');
    autoUpdater.checkForUpdates();
  }, 5000);

  // 注册全局快捷键 Ctrl+Alt+B
  globalShortcut.register('CommandOrControl+Alt+B', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
      // 尝试聚焦BrowserView中的搜索框
      view.webContents.executeJavaScript(`
        const searchInput = document.querySelector('#kw'); // 百度搜索框的ID
        if (searchInput) {
          searchInput.focus();
        }
      `);
    }
  });

  // 创建系统托盘图标
  const iconPath = path.join(__dirname, '../../assets/icon.png'); // 确保有这个图标文件
  tray = new Tray(iconPath);

  // 托盘右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏窗口',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { label: '检查更新', click: () => autoUpdater.checkForUpdates() },
    { label: '退出', click: () => app.quit() },
  ]);
  tray.setToolTip('百度增强桌面版');
  tray.setContextMenu(contextMenu);

  // 点击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // 每日热点通知
  const sendHotSearchNotification = async () => {
    const hotTopic = await fetchBaiduHotSearch();
    new Notification({
      title: '百度热点',
      body: hotTopic,
      icon: iconPath,
    }).show();
  };

  // 应用启动时立即发送一次
  sendHotSearchNotification();

  // 之后每24小时发送一次通知
  setInterval(sendHotSearchNotification, 1000 * 60 * 60 * 24); 

  app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用和它们的菜单栏通常会保持活动状态，直到用户使用 Cmd + Q 显式退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在应用退出时注销所有快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
