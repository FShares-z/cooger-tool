/**
 * Created by hezhi on 2017/5/27.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Router,Route,IndexRoute,hashHistory} from 'react-router';
import Browser from './Component/browser/index';
class App extends React.Component {
    constructor() {
        super()
    }
    render() {
        return (
            <div>
                <Browser/>
            </div>
        )
    }
}


ReactDOM.render(
    <App/>
    ,document.getElementById("content")
);
