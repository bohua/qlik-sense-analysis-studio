define([
    './templates/line-template',
    './templates/area-template',
    './templates/bar-template',
    './templates/column-template'
], function(LineTemplate, AreaTemplate, BarTemplate, ColumnTemplate){
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
    
    function getOptionTemplate(chartType){
        var template;
        switch (chartType) {
            case 'line':
                template = LineTemplate;
                break;
            case 'area':
                template = AreaTemplate;
                break;
            case 'bar':
                template = BarTemplate;
                break;
            case 'column':
                template = ColumnTemplate;
                break;
            default:
                template = LineTemplate;
                break;
        }
        return Object.assign({}, template);
    }

    function defaultFormatter(template, selectedDimensions, selectedMeasures, data){
        template.xAxis.title.text = selectedDimensions[0].qName;
        var series = [];
        var categories = [];

        data.forEach(record => {
            record.forEach((value, index) => {
                if(index === 0){
                    categories.push(value);
                }
                else{
                    if(series[index - 1] === undefined){
                        series[index - 1] = {
                            name: selectedMeasures[index - 1].qName,
                            data: []
                        };
                    }
                    series[index - 1].data.push(value);
                }
            });
        });
        
        template.xAxis.categories = categories;
        template.series = series;
        return template;
    }
    
    return {
        refreshChart: function(chart, chartType, selectedDimensions, selectedMeasures, rawData){
            var template = getOptionTemplate(chartType);
            var data = formatData(rawData);
            var options = defaultFormatter(template, selectedDimensions, selectedMeasures, data);
            chart.update(options);
        },

        createChart: function(chartType, selectedDimensions, selectedMeasures, rawData){
            var template = getOptionTemplate(chartType);
            var data = formatData(rawData);
            var options = defaultFormatter(template, selectedDimensions, selectedMeasures, data);
            return window.Highcharts.chart('analysis-studio-chart', options);
        },

        isValidChartType(chartType, selectedDimensions, selectedMeasures){
            return selectedDimensions.length === 1 && selectedMeasures.length > 0;
        }
    };
});