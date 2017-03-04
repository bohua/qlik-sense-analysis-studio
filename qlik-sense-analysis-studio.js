define([
        "qlik",
        "underscore",
        "text!./template.html",
        "text!./css/qlik-sense-analysis-studio.css"
    ],
    function (
        qlik,
        _,
        template,
        cssContent
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
            paint: function () {
                return qlik.Promise.resolve();
            },
            controller: ['$scope', function ($scope) {
                $scope.model = {
                    qMeasureList: [],
                    qDimensionList: [],
                    selectedDimensions: [],
                    selectedMeasures: []
                };

                $scope.methods = {
                    selectMeasure: selectMeasure,
                    selectDimension: selectDimension,
                    dimensionSelected: dimensionSelected,
                    measureSelected: measureSelected
                };

                function selectMeasure(measure){
                    $scope.model.selectedMeasures.push(measure);
                }

                function selectDimension(dimension){
                    $scope.model.selectedDimensions.push(dimension);
                }

                function dimensionSelected(dimension){
                    return $scope.model.selectedDimensions.findIndex(item => item.qName === dimension.qName) > -1;
                }
                
                function measureSelected(measure){
                    return $scope.model.selectedMeasures.findIndex(item => item.qName === meausre.qName) > -1;
                }

                // start point
                getFieldList($scope);
                console.log($scope);
                console.log(app);
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

        

    });