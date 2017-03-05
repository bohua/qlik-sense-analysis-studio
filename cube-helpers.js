define([
    "qlik",
], function (qlik) {
    'use strict';
    var initialQHyperCubeDef = {
        qDimensions: [],
        qMeasures: [],
        qInitialDataFetch: [{
            qWidth: 10,
            qHeight: 50
        }]
    }
    return {
        getInitialCubeDef(){
            var cubeDef = Object.assign({}, initialQHyperCubeDef);
            return cubeDef;
        },

        refreshCube(app, selectedMeasures, selectedDimensions){
            return new qlik.Promise(function(resolve, reject){
                var cubeDef = Object.assign({}, initialQHyperCubeDef);
                if(selectedMeasures.length > 0){
                    cubeDef.qMeasures = selectedMeasures.map(measure => {
                        return {
                            qDef: {
                                qDef: measure.qName
                            }
                        };
                    });
                }

                if(selectedDimensions.length > 0){
                    cubeDef.qDimensions = selectedDimensions.map(dimension => {
                        return {
                            qDef: {
                                qFieldDefs: [dimension.qName]
                            }
                        };
                    });
                }

                app.createCube(cubeDef, function(reply){
                    console.log(reply);
                    resolve(reply);
                });
            });
        }
    };
});