define([
    
], function(){
    'use strict';
    
    var chartDefinitions = [{
        name: 'grid',
        display: 'Grid',
        icon: 'grid',
        active: false,
        formatter: '',
        dimensions: [],
        measures: []
    }, {
        name: 'bar',
        display: 'Bar',
        icon: 'bar',
        active: true,
        formatter: 'defaultFormatter',
        dimensions: [1, 1],
        measures: [1, 100]
    }, {
        name: 'column',
        display: 'Column',
        icon: 'column',
        active: true,
        formatter: 'defaultFormatter',
        dimensions: [1, 1],
        measures: [1, 100]
    }, {
        name: 'line',
        display: 'Line',
        icon: 'line',
        active: true,
        formatter: 'defaultFormatter',
        dimensions: [1, 1],
        measures: [1, 100]
    }, {
        name: 'area',
        display: 'Area',
        icon: 'area',
        active: true,
        formatter: 'defaultFormatter',
        dimensions: [1, 1],
        measures: [1, 100]
    }, {
        name: 'pie',
        display: 'Pie',
        icon: 'pie',
        active: true,
        formatter: 'pieFormatter',
        dimensions: [1, 1],
        measures: [1, 1]
    }, {
        name: 'combo',
        display: 'Combo',
        icon: 'combo',
        active: false,
        formatter: 'defaultFormatter',
        dimensions: [],
        measures: []
    }, {
        name: 'stack-bar',
        display: 'Stack Bar',
        icon: 'stack-bar',
        active: true,
        formatter: 'defaultFormatter',
        dimensions: [1, 1],
        measures: [1, 100]
    }, {
        name: 'sparkline',
        display: 'Sparkline',
        icon: 'stack-bar',
        active: true,
        formatter: 'sparklineFormatter',
        dimensions: [2, 100],
        measures: [1, 100]
    }];
    
    return {
        getChartList: function(){
            return chartDefinitions.filter(item => item.active === true);
        },

        getChartDef: function(chartType){
            return chartDefinitions.find(item => item.name === chartType);
        },

        isValid: function(chartType, selectedDimensions, selectedMeasures){
            var chartDefinition = this.getChartDef(chartType);
            if(chartDefinition === undefined){
                return false;
            }
            else{
                var dimensionNum = selectedDimensions.length;
                var measureNum = selectedMeasures.length;
                var dimensionRange = chartDefinition.dimensions;
                var measureRange = chartDefinition.measures;
                var dimensionValid = dimensionNum >= dimensionRange[0] && dimensionNum <= dimensionRange[1];
                var measureValid = measureNum >= measureRange[0] && measureNum <= measureRange[1];
                return dimensionValid && measureValid;
            }
        }
    };
});