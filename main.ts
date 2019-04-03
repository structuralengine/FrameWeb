import { app, Menu, BrowserWindow, screen, ipcMain, shell, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import { reject } from 'q';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  const template = [
    {
      label: "メニュー",
      submenu: [
        { label: "Print", click: () => print_to_pdf() },
        { label: "Debug", click: () => win.webContents.openDevTools() },
        { label: "Save Log File", click: () => save_log_file() }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  //win.webContents.openDevTools();


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

function print_to_pdf() :void {

  const pdfPath = path.join(__dirname, 'print.pdf')

  win.webContents.printToPDF({}, function (error, data) {
    if (error) throw error
    fs.writeFile(pdfPath, data, function (error) {
      if (error) {
        throw error
      }
      shell.openExternal('file://' + pdfPath)
    })
  })
}

// ログを保持する ///////////////////////////////
let log = new Array();
ipcMain.on('set_log_file', function (event, arg) {
  log.push(arg);
  console.log(arg)
  event.returnValue = null;
});

// ログをファイルに保存する ///////////////////////////////
function save_log_file() {
  const file = dialog.showSaveDialog(
    {
      title: "save",
      filters: [{ name: "log file", extensions: ["json"] }]
    }
  );
  if (file) {
    let filePath: string = path.dirname(file);
    let fileName: string = path.basename(file);
    for (let i = 0; i < log.length; i++) {
      const file_name = path.join(filePath, (i+1).toString()+ '_' + fileName);
      fs.writeFile(file_name, JSON.stringify(log[i]), function (error) {
         if (error) {
           throw error
         }
       })    
     }
  }
  else {
    reject();
  }
}

export default save_log_file;