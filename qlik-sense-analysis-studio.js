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
        './chart/chart-definitions',
        './chart/chart-helpers',
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
        TableHelpers,
        ChartDefs,
        ChartHelpers
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
                    chartType: 'line',
                    chartTypes: ChartDefs.getChartList(),
                    data: []
                };

                $scope.table = null;
                $scope.chart = null;

                $scope.clsMethods = {
                    getFieldIcon: getFieldIcon
                };

                $scope.methods = {
                    selectField: selectField,
                    deselectField: deselectField,
                    switchChartType: switchChartType
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

                function switchChartType(type){
                    $scope.model.chartType = type;
                    var selectedDimensions = getSelectedDimensions($scope);
                    var selectedMeasures = getSelectedMeasures($scope);
                    if(ChartHelpers.isValidChartType(
                        $scope.model.chartType,
                        selectedDimensions,
                        selectedMeasures)
                    ){
                        if($scope.chart !== null){
                            $scope.chart = ChartHelpers
                                .refreshChart(
                                    $scope.chart,
                                    $scope.model.chartType,
                                    selectedDimensions,
                                    selectedMeasures,
                                    $scope.model.data
                                );
                        }
                    }
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

        function getSelectedDimensions($scope){
            var selectedDimensions = [];
            $scope.model.qDimensionList.forEach(item => {
                if(item.selected){
                    selectedDimensions.push(item);
                }
            });
            return selectedDimensions;
        }

        function getSelectedMeasures($scope){
            var selectedMeasures = [];
            $scope.model.qMeasureList.forEach(item => {
                if(item.selected){
                    selectedMeasures.push(item);
                }
            });
            return selectedMeasures;
        }

        function reloadData($scope){
            $scope.model.data = [];
            var selectedMeasures = getSelectedMeasures($scope);
            var selectedDimensions = getSelectedDimensions($scope);
            if(selectedDimensions.length === 0 && selectedMeasures.length === 0){
                $scope.table.updateSettings({
                    columns: [],
                    colHeaders: []
                });
                TableHelpers.loadData($scope.table, $scope.model.data);
            }
            else{
                CubeHelpers
                    .refreshCube(app, selectedMeasures, selectedDimensions)
                    .then(function(reply){
                        if(reply.qHyperCube.qDataPages
                            && reply.qHyperCube.qDataPages.length > 0
                            && reply.qHyperCube.qDataPages[0].qMatrix
                            && reply.qHyperCube.qDataPages[0].qMatrix.length > 0
                        ){
                            $scope.model.data = reply.qHyperCube.qDataPages[0].qMatrix;
                        }
                        if($scope.table === null){
                            $scope.table = TableHelpers
                                .createTable(
                                    document.getElementById('analysis-studio-table'),
                                    selectedDimensions,
                                    selectedMeasures,
                                    $scope.model.data
                                );
                        }
                        else{
                            $scope.table.updateSettings(
                                TableHelpers.getTableSettings(
                                    $scope.table.getSettings().colHeaders,
                                    selectedDimensions,
                                    selectedMeasures
                                )
                            );
                            TableHelpers.loadData($scope.table, $scope.model.data);
                        }

                        if(ChartHelpers.isValidChartType(
                            $scope.model.chartType,
                            selectedDimensions,
                            selectedMeasures)
                        ){
                            if($scope.chart === null){
                                $scope.chart = ChartHelpers
                                    .createChart(
                                        $scope.model.chartType,
                                        selectedDimensions,
                                        selectedMeasures,
                                        $scope.model.data
                                    );
                            }
                            else{
                                $scope.chart = ChartHelpers
                                    .refreshChart(
                                        $scope.chart,
                                        $scope.model.chartType,
                                        selectedDimensions,
                                        selectedMeasures,
                                        $scope.model.data
                                    );
                            }
                        }
                    }, function(){
                        $scope.table.updateSettings(
                            TableHelpers.getTableSettings(
                                $scope.table.getSettings().colHeaders,
                                selectedDimensions,
                                selectedMeasures
                            )
                        );
                        $scope.table.reloadData([]);
                    });
            }
        }

    });