define(['qvangular',
    'text!QlikActionConnector.webroot/connectdialog.ng.html',
    'css!QlikActionConnector.webroot/bootstrap.css',
    'css!QlikActionConnector.webroot/connectdialog.css'
], function (qvangular, template) {
    return {
        template: template,
        controller: ['$scope', 'input', function ($scope, input) {
            function init() {
                $scope.isEdit = input.editMode;
                $scope.id = input.instanceId;
                $scope.titleText = $scope.isEdit ? "Save Connection (Qlik Action Connector)" : "Add new Connection (Qlik Action Connector)";
                $scope.saveButtonText = $scope.isEdit ? "Save changes" : "Create";

                $scope.action = "Sas2Qvd";
                $scope.folderConnectionList;

                $scope.srcFolderConnectionId = "";
                $scope.destFolderConnectionId = "";

                $scope.name = "";
                $scope.username = "user";
                $scope.password = "password";

                $scope.provider = "QlikActionConnector.exe"; // Connector filename
                $scope.connectionInfo = "";
                $scope.connectionSuccessful = false;

                if ($scope.isEdit) {
                    input.serverside.getConnection($scope.id).then(function (result) {
                        $scope.name = result.qName;
                    });
                }
            }


            /* Event handlers */
            $scope.onOKClicked = function () {
                if ($scope.isEdit) {
                    //var overrideCredentials = ($scope.username !== "" && $scope.password !== "");
                    input.serverside.modifyConnection($scope.id,
                        $scope.name,
                        createCustomConnectionString(),
                        $scope.provider,
                        false, //overrideCredentials,
                        $scope.username,
                        $scope.password).then(function (result) {
                        if (result) {
                            $scope.destroyComponent();
                        }
                    });
                } else {
                    input.serverside.createNewConnection(
                        $scope.name,
                        createCustomConnectionString(),
                        $scope.username,
                        $scope.password
                    );
                    $scope.destroyComponent();
                }
            };

            $scope.onEscape = $scope.onCancelClicked = function () {
                $scope.destroyComponent();
            };

            $scope.validateConfig = function () {
                return $(".connectdialogcontainer .ng-invalid").length == 0;
            }

            var socket;
            var requestId = 1;
            var requestSucceed = false;
            var appId = location.pathname.split('/app/')[1];
            if (location.hostname == 'localhost') {
                socket = new WebSocket("ws://localhost:4848/app");
                appId = unescape(appId).replace(/\\/g, '\\\\');
            } else {
                socket = new WebSocket("wss://" + location.hostname + "/qrsData");
            }

            socket.onmessage = onMessage;
            setTimeout(openDoc, 500);

            init();

            /* Helper functions */

            function createCustomConnectionString() {
                var srcConn = getConnectionById($scope.srcFolderConnectionId);
                var destConn = getConnectionById($scope.destFolderConnectionId);

                var str = "CUSTOM CONNECT TO " + "\"provider=QlikActionConnector.exe;"
                str += "action=" + $scope.action + ";";
                str += "srcId=" + srcConn.qId + ";";
                str += "srcName=" + srcConn.qName + ";";
                str += "src=" + srcConn.qLocation + ";";
                str += "destId=" + destConn.qId + ";";
                str += "destName=" + destConn.qName + ";";
                str += "dest=" + destConn.qLocation + ";";
                str += "\"";

                return str;
            }

            function getConnectionById(qId) {
                for (var i = 0; i < $scope.folderConnectionList.length; i++) {
                    var conn = $scope.folderConnectionList[i];

                    if (conn.qId == qId) {
                        return conn;
                    }
                }

                return null;
            }

            function onMessage(e) {

                var response = JSON.parse(e.data);

                //Open Doc return
                if (response.result.qReturn && response.result.qReturn.qType == 'Doc') {
                    getConnections();

                    return;
                }

                //Get Connection return
                if (response.result.qConnections && response.result.qConnections.length > 0) {
                    $scope.folderConnectionList = getFolderConnectionList(response.result.qConnections[0].value);
                    $scope.$apply();

                    return;
                }
            }

            function openDoc() {
                var openDocRequest = {
                    "method": "OpenDoc",
                    "handle": -1,
                    "params": [
                        appId,
                        "",
                        "",
                        "",
                        false
                    ],
                    "delta": false,
                    "outKey": -1,
                    "jsonrpc": "2.0",
                    "id": requestId++
                };
                socket.send(JSON.stringify(openDocRequest));
            }

            function getConnections() {
                var getConnectionRequest = {
                    "method": "GetConnections",
                    "handle": 1,
                    "params": [],
                    "delta": true,
                    "outKey": "qConnections",
                    "jsonrpc": "2.0",
                    "id": requestId++
                }

                socket.send(JSON.stringify(getConnectionRequest));
            }

            function getFolderConnectionList(connectionList) {
                var folderConnectionList = [];

                for (var i = 0; i < connectionList.length; i++) {
                    var conn = connectionList[i];
                    if (conn.qType == "folder") {
                        folderConnectionList.push({
                            qId: conn.qId,
                            qName: conn.qName,
                            qLocation: conn.qConnectionString
                        });
                    }
                }
                return folderConnectionList;
            }

        }]
    };
});