/**
 * Created by hezhi on 2017/5/27.
 */
'use strict';
const {app,remote, BrowserWindow,ipcMain,autoUpdater} = require('electron');
const session = require('electron').session;
const path = require('path');
let fs = require('fs');
let isDevelopment = true;
const ipc = require('electron').ipcMain;

var mainWnd = null;

function createMainWnd() {
    mainWnd = new BrowserWindow({
        width: 1920,
        height: 1080
    });

    if (isDevelopment) {
        mainWnd.webContents.openDevTools();
    }
    session.defaultSession.allowNTLMCredentialsForDomains('*')//to access internal sites


    mainWnd.loadURL(`file://${__dirname}/index.html`);
    ipc.on('getIp',function (e,data) {
        console.log('getip',data);
        fs.writeFile(path.join(__dirname, "Proxy.pac"), 'function FindProxyForURL(url,host){if(shExpMatch(url,"*jd*")) return "PROXY '+data+'";if(shExpMatch(url,"*chinaz*")) return "PROXY '+data+'"; if(shExpMatch(url,"*baidu*")) return "PROXY '+data+'";return"DIRECT"}', function (err) {
            if (!err){
                console.log("写入成功！")
                mainWnd.webContents.session.setProxy({pacScript:'file://' + __dirname + '/proxy.pac'}, function () {return true;});
            }else{
                console.log("写入失败！",err)
            }

        })
    })

    // mainWnd.webContents.session.setProxy({pacScript:'file://' + __dirname + '/proxy.pac'}, function () {return true;});
    // mainWnd.webContents.session.setProxy({proxyRules:''}, function () {return true;});

    mainWnd.on('closed', () => {
        mainWnd = null;
});
}


app.on('ready', createMainWnd);

app.on('window-all-closed', () => {
    app.quit();
});