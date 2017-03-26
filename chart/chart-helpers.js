define([
    './chart-formatters'
], function(ChartFormatters){
    'use strict';

    function formatData(rawData, dimensionNumber){
        if(rawData.length === 0){
            return [];
        }
        else{
            var data = [];
            rawData.forEach(record => {
                const row = record.map((item, index) => {
                    if(index < dimensionNumber){
                        return item.qText;
                    }
                    else{
                        return item.qNum;
                    }
                });
                data.push(row);
            });
            return data;
        }
    }
    
    return {
        refreshChart: function(chart, chartType, selectedDimensions, selectedMeasures, rawData){
            chart.destroy();
            var data = formatData(rawData, selectedDimensions.length);
            var options = ChartFormatters.format(chartType, selectedDimensions, selectedMeasures, data);
            
            return window.Highcharts.chart('analysis-studio-chart', options);
        },

        createChart: function(chartType, selectedDimensions, selectedMeasures, rawData){
            var template = getOptionTemplate(chartType);
            var data = formatData(rawData, selectedDimensions.length);
            var options = ChartFormatters.format(chartType, selectedDimensions, selectedMeasures, data);
            
            return window.Highcharts.chart('analysis-studio-chart', options);
        },

        isValidChartType(chartType, selectedDimensions, selectedMeasures){
            return selectedDimensions.length === 1 && selectedMeasures.length > 0;
        }
    };
});