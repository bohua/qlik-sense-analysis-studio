define([
    './formatters/line-formatter',
    './formatters/area-formatter',
    './formatters/bar-formatter',
    './formatters/column-formatter'
], function(LineFormatter, AreaFormatter, BarFormatter, ColumnFormatter){
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
    
    function getOptions(chartType, selectedDimensions, selectedMeasures, data){
        var formatter;
        switch (chartType) {
            case 'line':
                formatter = LineFormatter;
                break;
            case 'area':
                formatter = AreaFormatter;
                break;
            case 'bar':
                formatter = BarFormatter;
                break;
            case 'column':
                formatter = ColumnFormatter;
                break;
            default:
                formatter = LineFormatter;
                break;
        }
        return formatter.getOptions(selectedDimensions, selectedMeasures, data);
    }
    return {
        refreshChart: function(chart, chartType, selectedDimensions, selectedMeasures, rawData){
            var options = getOptions(
                chartType,
                selectedDimensions,
                selectedMeasures,
                formatData(rawData)
            );
            chart.update(options);
        },

        createChart: function(chartType, selectedDimensions, selectedMeasures, rawData){
            var options = getOptions(
                chartType,
                selectedDimensions,
                selectedMeasures,
                formatData(rawData)
            );
            return window.Highcharts.chart('analysis-studio-chart', options);
        },

        isValidChartType(chartType, selectedDimensions, selectedMeasures){
            return selectedDimensions.length === 1 && selectedMeasures.length > 0;
        }
    };
});