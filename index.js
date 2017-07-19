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
const http = require('http');


var mainWnd = null;

let iplist=[];

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

    getIp();

    let ses= mainWnd.webContents.session;
    ses.disableNetworkEmulation()
    ipc.on('clear-cookie',function () {
        session.defaultSession.cookies.get({}, (error, cookies) => {
            ses.clearStorageData([{},function (error,success) {

            }])
        })
        let cookieNull = [];
        let cookieNullString = JSON.stringify(cookieNull);
        fs.writeFile("cookie.txt",cookieNullString,function (err) {
            if (err) throw err ;
            // console.log("保存成功");
        });
    })

    ipc.on('setIp',function (e) {
        let retIp='';
        if(isUse()){
            getIp();
        }
        for(let i=0;i<iplist.length;i++){
            if(!iplist[i].isUse){
                retIp=iplist[i].ip+':'+iplist[i].port;
                iplist[i].isUse=true;
                break;
            }
        }

        fs.writeFile(path.join(__dirname, "Proxy.pac"), 'function FindProxyForURL(url,host){ return "PROXY '+retIp+'";return"PROXY"}', function (err) {
            if (!err){
                console.log("写入成功！")
                console.log(iplist)
                mainWnd.webContents.session.setProxy({pacScript:'file://' + __dirname + '/proxy.pac'}, function () {return true;});
            }else{
                console.log("写入失败！",err)
            }
        })
        function isUse() {
            let num=0;
            for(let i=0;i<iplist.length;i++){
                if(iplist[i].isUse){
                    num+=1;
                }
            }
            if(num==20){
                console.log('ip池已消耗完');
                return true;//ip池已消耗完
            }
            return false;
        }
    })

    // mainWnd.webContents.session.setProxy({pacScript:'file://' + __dirname + '/proxy.pac'}, function () {return true;});
    // mainWnd.webContents.session.setProxy({proxyRules:''}, function () {return true;});

    mainWnd.on('closed', () => {
        mainWnd = null;
});
}

function getIp() {
    http.get("http://www.3jiaoxing.com/api/cooger/getip", function(res) {
        var size = 0;
        var chunks = [];
        res.on('data', function(chunk){
            size += chunk.length;
            chunks.push(chunk);
        });
        res.on('end', function(){
            let data = JSON.parse(Buffer.concat(chunks, size).toString());
            if(data.code==0){
                data=JSON.parse(data.data);
                if(data.ERRORCODE==0){
                    iplist=data.RESULT;
                    console.log(iplist);
                }else if(data.ERRORCODE==10032){
                    mainWnd.webContents.send('errMsg','今日提取已达上限');
                }else{
                    mainWnd.webContents.send('errMsg','请求频繁，请5秒后再试！');
                }
            }
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}


app.on('ready', createMainWnd);

app.on('window-all-closed', () => {
    app.quit();
});