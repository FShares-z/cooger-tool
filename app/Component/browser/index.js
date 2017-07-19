/**
 * Created by hezhi on 2017/5/27.
 */
import React from "react";
const fs = window.require('fs');
const path = window.require('path');
let ipc = window.require('electron').ipcRenderer;


const excel=window.require('node-xlsx');

class Browser extends React.Component{
    constructor(props){
        super()
        this.state={
            num:0,
            ip:'',
            address:'',
            list:[]
        };
    }
    componentWillMount(){

        let obj=excel.parse(path.dirname(window.require.main.filename)+`/excel/list.xlsx`);
        console.log('obj',obj);
        this.setState({
            list:obj[0]['data']
        })
        this.refs['list']
        this.resetIp();
    }
    resetIp(){
        ipc.send("clear-cookie");
        ipc.send("setIp");
    }
    getLocalIp(){
        let self=this;
        var xhr = new XMLHttpRequest();
        xhr.open("get", "http://ip.chinaz.com/getip.aspx", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let obj=eval('('+xhr.responseText+')');
                self.state.ip=obj.ip;
                self.state.address=obj.address;
                self.forceUpdate();
            }
        };
        xhr.send(null);
    }
    componentDidMount(){
        let webview=this.refs['browserContent'];
        let self=this;
        ipc.on('errMsg',function (e,arg) {
            alert(arg);
        })
        webview.addEventListener('dom-ready', (e) => {
            // webview.openDevTools();
            webview.insertCSS('.login-box{display:block !important;}.item.item-fore1,.item.item-fore2,.item.item-fore4,.item.item-fore5{visibility:visible !important;}.qrcode-login{display:none !important;}');
            this.refs['search'].value=this.refs['browserContent'].src;
            this.getLocalIp();
        })
        webview.addEventListener('new-window', (e) => {
            this.refs['browserContent'].src=e.url;
        })
    }
    _getHandleCode(user,pwd){
        return "document.querySelector('#loginname').value='"+user+"';document.querySelector('#nloginpwd').value='"+pwd+"';";
    }
    _clickHandle(e){
        console.log(e.target.nodeName);
        let webview=this.refs['browserContent'];
        // webview.reload();
        this.resetIp();
        this.getLocalIp();
        let dom;
        if(e.target.className.indexOf('account')>0){
            dom=e.target.parentNode;
            dom.className+=' red';
            webview.executeJavaScript(this._getHandleCode(dom.childNodes[0].innerText,dom.childNodes[1].innerText));
        }
    }
    _clickSearch(e){
        this.refs['browserContent'].src=this.refs['search'].value;
    }
    _changeListNum(key,num,e){
        this.state.list[key][num]=e.target.value;
        this.forceUpdate();
        console.log(this.state);
    }
    _saveXlsx(){
        let buffer = excel.build([
            {
                name:'sheet1',
                data:this.state.list
            }
        ]);
        fs.writeFileSync(path.dirname(window.require.main.filename)+`/excel/list.xlsx`,buffer,{'flag':'w'});
    }
    render(){
        let self=this;
        return(
            <div className="container">
                <div className="flex-row" style={{'width':'100%'}}>
                    <div className="flex-column">
                        <div className="loginContent">
                            <div className="flex-row">
                                <div className="thread item">帐号</div>
                                <div className="thread item">密码</div>
                                <div className="thread item">订单号</div>
                                <div className="thread item">手机号</div>
                            </div>
                            <div className="list-content" ref="list" onClick={this._clickHandle.bind(this)}>
                                {
                                    Object.keys(this.state.list).map(function (k) {
                                        if(k>0)
                                            return <div className="flex-row" key={k}>
                                                <div className="item account">{self.state.list[k][1]}</div>
                                                <div className="item pwd">{self.state.list[k][2]?self.state.list[k][2]:self.state.list[0][2].split('：')[1]}</div>
                                                <div className="item"><input type="text" className="listid" value={self.state.list[k][3]?self.state.list[k][3]:''} onChange={self._changeListNum.bind(self,k,3)} /></div>
                                                <div className="item"><input type="text" className="listid" value={self.state.list[k][4]?self.state.list[k][4]:''} onChange={self._changeListNum.bind(self,k,4)} /></div>
                                            </div>;

                                    })
                                }
                            </div>
                        </div>
                        <button onClick={this._saveXlsx.bind(this)}>生成订单</button>
                        <h4>在程序根目录excel下list文件</h4>
                    </div>
                    <div className="flex-column" style={{'flex':'1'}}>
                        <div className="flex-row"><h5>本机ip地址：</h5><h5 ref='h_ip'>{this.state.ip}</h5><h5 ref='address' style={{'textIndent':'10px'}}>{this.state.address}</h5></div>
                        <div className="flex-row"><input type="text" ref="search" /><button onClick={this._clickSearch.bind(this)}>刷新页面</button></div>
                        <webview src='https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fz.jd.com%2FsceneIndex.html' ref="browserContent" className="browserContent" data-plugins></webview>
                    </div>
                </div>
            </div>
        )
    }
}

export default Browser;
