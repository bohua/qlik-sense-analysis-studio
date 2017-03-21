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
        './table-helpers',
        './lib/highcharts/highcharts-custom'
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
        Handsontable,
        TableHelpers
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
                    selectedTable: 'All',
                    visualType: 'table'
                };

                $scope.table = null;
                $scope.graph = null;

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
                            $scope.model.qMeasureList.push(createFieldForAnalysis(item, qType));
                            break;
                        default:
                            tableList = [...tableList, ...item.qSrcTables];
                            $scope.model.qDimensionList.push(createFieldForAnalysis(item, qType));
                            break;
                    }
                }
            });
            $scope.model.qTableList = _.uniq(tableList);
        }

        function createFieldForAnalysis(field, qType){
            return {
                qName: field.qName,
                qType: qType,
                qSrcTables: field.qSrcTables,
                selected: false
            };
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
            if($scope.graph === null){
                $scope.graph = window.Highcharts.chart('analysis-studio-graph', {
                    title: {
                        text: 'Solar Employment Growth by Sector, 2010-2016'
                    },
                    subtitle: {
                        text: 'Source: thesolarfoundation.com'
                    },
                    yAxis: {
                        title: {
                            text: 'Number of Employees'
                        }
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle'
                    },
                    plotOptions: {
                        series: {
                            pointStart: 2010
                        }
                    },
                    series: [{
                        name: 'Installation',
                        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
                    }, {
                        name: 'Manufacturing',
                        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
                    }, {
                        name: 'Sales & Distribution',
                        data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
                    }, {
                        name: 'Project Development',
                        data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
                    }, {
                        name: 'Other',
                        data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
                    }]
                });
            }
            var selectedMeasures = [];
            var selectedDimensions = [];
            var data = [];
            var header = [];
            $scope.model.qDimensionList.forEach(item => {
                if(item.selected){
                    selectedDimensions.push(item);
                    header.push(item.qName);
                }
            });
            $scope.model.qMeasureList.forEach(item => {
                if(item.selected){
                    selectedMeasures.push(item);
                    header.push(item.qName);
                }
            });
            if(selectedDimensions.length === 0 && selectedMeasures.length === 0){
                $scope.table.updateSettings({
                    columns: [],
                    colHeaders: []
                });
                $scope.table.loadData([]);
            }
            else{
                CubeHelpers
                    .refreshCube(app, selectedMeasures, selectedDimensions)
                    .then(function(reply){
                        if(reply.qHyperCube.qDataPages && reply.qHyperCube.qDataPages.length > 0 && reply.qHyperCube.qDataPages[0].qMatrix && reply.qHyperCube.qDataPages[0].qMatrix.length > 0){
                            reply.qHyperCube.qDataPages[0].qMatrix.forEach(record => {
                                const row = record.map(item => item.qText);
                                data.push(row);
                            });
                        }
                        if($scope.table === null){
                            $scope.table = TableHelpers.createTable(document.getElementById('analysis-studio-table'), header, selectedDimensions, selectedMeasures, data);
                        }
                        else{
                            $scope.table.updateSettings(TableHelpers.getTableSettings($scope.table.getSettings().colHeaders, selectedDimensions, selectedMeasures));
                            $scope.table.loadData(data);
                        }
                    }, function(){
                        $scope.table.updateSettings(TableHelpers.getTableSettings($scope.table.getSettings().colHeaders, selectedDimensions, selectedMeasures));
                        $scope.table.reloadData(data);
                    });
            }
        }

    });