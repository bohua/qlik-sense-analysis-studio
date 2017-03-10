define([
        'qlik',
        'jquery',
        'underscore',
        'text!./template.html',
        'text!./css/qlik-sense-analysis-studio.css',
        'text!./lib/handsontable/handsontable.full.css',
        './cube-helpers',
        './engine-api-helper',
        './lib/handsontable/handsontable.full',
    ],
    function (
        qlik,
        $,
        _,
        template,
        cssContent,
        handsontableCssContent,
        CubeHelpers,
        EngineApiHelper,
        Handsontable
    ) {
        $('<style>').html(cssContent).appendTo('head');
        $('<style>').html(handsontableCssContent).appendTo('head');

        var app = qlik.currApp();

        return {
            template: template,
            support: {
                snapshot: true,
                export: true,
                exportData: false
            },
            initialProperties: {
                qHyperCubeDef: CubeHelpers.getInitialCubeDef()
            },
            paint: function () {
                return qlik.Promise.resolve();
            },
            controller: ['$scope', function ($scope) {
                $scope.model = {
                    qTableList: [],
                    qMeasureList: [],
                    qDimensionList: [],
                    selectedDimensions: [],
                    selectedMeasures: [],
                    data: null,
                    selectedTable: 'All'
                };

                $scope.table = null;

                $scope.clsMethods = {
                    getFieldIcon: getFieldIcon
                };

                $scope.methods = {
                    selectField: selectField,
                    deselectField: deselectField
                };

                function selectField(field){
                    field.selected = true;
                    reloadData($scope);
                }

                function deselectField(field){
                    field.selected = false;
                    reloadData($scope);
                }

                function getFieldIcon(field){
                    return {
                        'icon-text-image': field.qType=='dimension' || field.qType=='uncertain',
                        'lui-icon--key': field.qType=='key',
                        'icon-map': field.qType=='map',
                        'icon-date': field.qType=='timestamp'
                    };
                }

                // start point
                console.log($scope);
                console.log(app);

                var socket = EngineApiHelper.connect(app.id);
                $scope.$watch(function(){
                    return socket.readyState;
                }, function(newValue, oldValue){
                    if(newValue || oldValue){
                        EngineApiHelper
                            .openDoc(app.model.handle)
                            .then(function(){
                                EngineApiHelper
                                    .getFieldList()
                                    .then(function(qLayout){
                                        console.log(qLayout);
                                        getInitConf($scope, qLayout);
                                    });
                            });
                    }
                });
            }]
        };

        //------------------------------
        //Help functions
        //------------------------------
        function getInitConf($scope, qLayout){
            var tableList = [];
            qLayout.qFieldList.qItems.forEach(item => {
                if(item.qIsHidden === undefined && item.qSrcTables.length > 0){
                    var qType = categoryField(item);
                    switch(qType){
                        case null:
                            break;
                        case 'measure':
                            tableList = [...tableList, ...item.qSrcTables];
                            $scope.model.qMeasureList.push({
                                qName: item.qName,
                                qType: qType,
                                qSrcTables: item.qSrcTables,
                                selected: false
                            });
                            break;
                        default:
                            tableList = [...tableList, ...item.qSrcTables];
                            $scope.model.qDimensionList.push({
                                qName: item.qName,
                                qType: qType,
                                qSrcTables: item.qSrcTables,
                                selected: false
                            });
                            break;
                    }
                }
            });
            $scope.model.qTableList = _.uniq(tableList);
        }

        function categoryField(qField, showKeys) {
            if (_.contains(qField.qTags, '$hidden') || _.contains(qField.qTags, '$system')) {
                return null;
            }

            if (_.contains(qField.qTags, '$key')) {
                return 'key';
            }

            if (_.contains(qField.qTags, '$timestamp')) {
                return 'timestamp';
            }

            if (_.contains(qField.qTags, '$geoname') || _.contains(qField.qTags, '$geomultipolygon') || _.contains(qField.qTags, '$geopoint')) {
                return 'map';
            }

            if (_.contains(qField.qTags, '$text')) {
                return 'dimension';
            }

            if (_.contains(qField.qTags, '$numeric')) {
                if (qField.qName.toLowerCase().indexOf('name') > -1) {
                    return 'dimension';
                }
                if (qField.qName.toLowerCase().indexOf('amount') > -1) {
                    return 'measure';
                }
            }

            return 'uncertain';
        }

        function reloadData($scope){
            var selectedMeasures = [];
            var data = [];
            var header = [];
            $scope.model.qMeasureList.forEach(item => {
                if(item.selected){
                    selectedMeasures.push(item);
                    header.push(item.qName);
                }
            });
            var selectedDimensions = [];
            $scope.model.qDimensionList.forEach(item => {
                if(item.selected){
                    selectedDimensions.push(item);
                    header.push(item.qName);
                }
            });
            if(selectedDimensions.length === 0 && selectedMeasures.length === 0){
                $scope.model.data = data;
            }
            else{
                data.push(header);
                CubeHelpers
                    .refreshCube(app, selectedMeasures, selectedDimensions)
                    .then(function(reply){
                        if(reply.qHyperCube.qDataPages && reply.qHyperCube.qDataPages.length > 0 && reply.qHyperCube.qDataPages[0].qMatrix && reply.qHyperCube.qDataPages[0].qMatrix.length > 0){
                            $scope.model.data = reply.qHyperCube;
                            reply.qHyperCube.qDataPages[0].qMatrix.forEach(record => {
                                const row = record.map(item => item.qText);
                                data.push(row);
                            });
                        }
                        $scope.model.data = data;
                        if($scope.table === null){
                            $scope.table = new Handsontable(document.getElementById('analysis-studio-table'), {
                                data: $scope.model.data
                            });
                        }
                        else{
                            $scope.table.loadData($scope.model.data);
                        }
                    });
            }
        }

    });