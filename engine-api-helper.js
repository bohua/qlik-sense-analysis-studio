define([
    'qlik',
], function (qlik) {
    'use strict';
    var socket;
    var appId;
    var requestId = 1;
    var handle = null;
    // var requestId = 1;
    // var requestSucceed = false;
    // var appId = location.pathname.split('/app/')[1];
    // if (location.hostname == 'localhost') {
    //     socket = new WebSocket('ws://localhost:4848/app');
    //     appId = unescape(appId).replace(/\\/g, '\\\\');
    // } else {
    //     socket = new WebSocket('wss://' + location.hostname + '/qrsData');
    // }

    return {
        connect: function(id){
            var requestSucceed = false;
            appId = id;
            console.log(appId);
            if (location.hostname == 'localhost') {
                socket = new WebSocket('ws://localhost:4848/app');
                // appId = unescape(appId).replace(/\\/g, '\\\\');
            } else {
                socket = new WebSocket('wss://' + location.hostname + '/qrsData');
            }
            return socket;
        },
        openDoc: function(){
            var openDocRequest = {
                "method": "OpenDoc",
                "handle": -1,
                "params": [
                    appId
                ],
                "delta": false,
                "outKey": -1,
                "jsonrpc": "2.0",
                "id": requestId++
            };
            return new qlik.Promise(function(resolve, reject){
                socket.onmessage = function(e){
                    var response = JSON.parse(e.data);
                    handle = response.result.qReturn.qHandle;
                    resolve();
                }
                socket.send(JSON.stringify(openDocRequest));
            });
        },
        getFieldList: function () {
            return new qlik.Promise(function(resolve, reject){
                var createSessionObjectRequest = {
                    'jsonrpc': '2.0',
                    'id': requestId++,
                    'method': 'CreateSessionObject',
                    'handle': handle,
                    'params': [{
                        'qInfo': {
                            'qId': '',
                            'qType': 'FieldList'
                        },
                        'qFieldListDef': {
                            'qShowSystem': true,
                            'qShowHidden': true,
                            'qShowSemantic': true,
                            'qShowSrcTables': true
                        }
                    }]
                };
                socket.onmessage = function(e){
                    var response = JSON.parse(e.data);
                    var qHandle = response.result.qReturn.qHandle;

                    var getFieldListRequest = {
                        "jsonrpc": "2.0",
                        "id": requestId++,
                        "method": "GetLayout",
                        "handle": qHandle,
                        "params": []
                    };

                    socket.onmessage = function(e){
                        var response = JSON.parse(e.data);
                        resolve(response.result);
                    }

                    socket.send(JSON.stringify(getFieldListRequest));
                };
                socket.send(JSON.stringify(createSessionObjectRequest));
            });
        }
    };
});