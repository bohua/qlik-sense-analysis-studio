define([
        "qlik",
        "underscore",
        "text!./template.html",
        "text!./css/qlik-sense-analysis-studio.css",
        "./cube-helpers",
        './engine-api-helper'
    ],
    function (
        qlik,
        _,
        template,
        cssContent,
        CubeHelpers,
        EngineApiHelper
    ) {
        $("<style>").html(cssContent).appendTo("head");

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
                    qMeasureList: [],
                    qDimensionList: [],
                    selectedDimensions: [],
                    selectedMeasures: [],
                    data: null
                };

                $scope.methods = {
                    selectMeasure: selectMeasure,
                    selectDimension: selectDimension,
                    dimensionSelected: dimensionSelected,
                    measureSelected: measureSelected,
                    removeSelectedMeasure: removeSelectedMeasure,
                    removeSelectedDimension: removeSelectedDimension
                };

                function selectMeasure(measure){
                    $scope.model.selectedMeasures.push(measure);
                    reloadData($scope);
                }

                function selectDimension(dimension){
                    $scope.model.selectedDimensions.push(dimension);
                    reloadData($scope);
                }

                function dimensionSelected(dimension){
                    return $scope.model.selectedDimensions.findIndex(item => item.qName === dimension.qName) > -1;
                }
                
                function measureSelected(measure){
                    return $scope.model.selectedMeasures.findIndex(item => item.qName === measure.qName) > -1;
                }

                function removeSelectedMeasure(measure){
                    var index = $scope.model.selectedMeasures.findIndex(item => item.qName === measure.qName);
                    if(index > -1){
                        $scope.model.selectedMeasures.splice(index, 1);
                        reloadData($scope);
                    }
                }

                function removeSelectedDimension(dimension){
                    var index = $scope.model.selectedDimensions.findIndex(item => item.qName === dimension.qName);
                    if(index > -1){
                        $scope.model.selectedDimensions.splice(index, 1);
                        reloadData($scope);
                    }
                }

                // start point
                getFieldList($scope);
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
                                    });
                            });
                    }
                });

                // EngineApiHelper.getFieldList();
            }]
        };

        //------------------------------
        //Help functions
        //------------------------------
        function getFieldList($scope) {
            app.getList("FieldList", function (reply) {
                $.each(reply.qFieldList.qItems, function (key, value) {
                    var qType = categoryField(value);
                    switch (qType) {
                        case null:
                            break;
                        case "measure":
                            $scope.model.qMeasureList.push({
                                qName: value.qName,
                                qType: qType
                            });
                            break;

                        default:
                            $scope.model.qDimensionList.push({
                                qName: value.qName,
                                qType: qType
                            });
                            break;
                    }
                });
            });
        }

        function categoryField(qField, showKeys) {
            if (_.contains(qField.qTags, "$hidden") || _.contains(qField.qTags, "$system")) {
                return null;
            }

            if (_.contains(qField.qTags, "$key")) {
                return "key";
            }

            if (_.contains(qField.qTags, "$timestamp")) {
                return "timestamp";
            }

            if (_.contains(qField.qTags, "$geoname") || _.contains(qField.qTags, "$geomultipolygon") || _.contains(qField.qTags, "$geopoint")) {
                return "map";
            }

            if (_.contains(qField.qTags, "$text")) {
                return "dimension";
            }

            if (_.contains(qField.qTags, "$numeric")) {
                if (qField.qName.toLowerCase().indexOf("name") > -1) {
                    return "dimension";
                }
                if (qField.qName.toLowerCase().indexOf("amount") > -1) {
                    return "measure";
                }
            }

            return "uncertain";
        }

        function reloadData($scope){
            CubeHelpers
                .refreshCube(app, $scope.model.selectedMeasures, $scope.model.selectedDimensions)
                .then(function(reply){
                    if(reply.qHyperCube.qDataPages && reply.qHyperCube.qDataPages.length > 0 && reply.qHyperCube.qDataPages[0].qMatrix && reply.qHyperCube.qDataPages[0].qMatrix.length > 0){
                        $scope.model.data = reply.qHyperCube;
                    }
                    else{
                        $scope.model.data = null;
                    }
                });
        }

    });