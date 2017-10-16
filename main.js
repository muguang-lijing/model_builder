const electron = require('electron');

// 控制应用生命周期的模块。
const {app} = electron;
// 创建原生浏览器窗口的模块。
const {BrowserWindow} = electron;
// 保持一个对于 window 对象的全局引用,如果你不这样做,
// 当 JavaScript 对象被垃圾回收, window 会被自动地关闭
let mainWindow;
function createWindow() {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({width: 1100, height: 800});
    // mainWindow.setMenu(null);
    // frame:false,
    // 加载应用的 index.html。
    // mainWindow.loadURL(`file://${__dirname}/public/static/electron.html`);
    mainWindow.loadURL(`http://127.0.0.1:5500/static/electron.html`);
    // 启用开发工具。
    // mainWindow.webContents.openDevTools();
    // 当 window 被关闭,这个事件会被触发。
    mainWindow.on('closed', () => {
    // 取消引用 window 对象,如果你的应用支持多窗口的话,
    // 通常会把多个 window 对象存放在一个数组里面,
    // 与此同时,你应该删除相应的元素。
    mainWindow = null;

  
   
    });

    mainWindow.on('resize',function(event){
        event.sender.send('winresize','窗口发生变化')
    }) 

}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});


//文件对话框
electron.ipcMain.on('open-file-dialog',function(event){ 
    electron.dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
    },function (files) {
        if (files) event.sender.send('selected-directory', files)
    })
})



// //窗口最大化
// electron.ipcMain.on('show-window', () => {
//     mainWindow.maximize();
//     console.log();
// });

// //最小化

// electron.ipcMain.on('hide-window', () => {
//     mainWindow.minimize();
// electron});

// //退出

// electron.ipcMain.on('window-all-closed', () => {
//     app.quit();
// });

module.exports = electron;