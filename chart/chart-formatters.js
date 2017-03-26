define([
    './chart-definitions',
    './templates/line-template',
    './templates/area-template',
    './templates/bar-template',
    './templates/column-template',
    './templates/stack-bar-template',
    './templates/pie-template'
], function(ChartDefs, LineTemplate, AreaTemplate, BarTemplate, ColumnTemplate, StackBarTemplate, PieTemplate){
    'use strict';
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
            case 'stack-bar':
                template = StackBarTemplate;
                break;
            case 'pie':
                template = PieTemplate;
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

    function pieFormatter(template, selectedDimensions, selectedMeasures, data){
        var series = data.map(record => {
           return {
               name: record[0],
               y: record[1]
           }; 
        });
        template.series = series;
        return template;
    }

    var formatters = {
        defaultFormatter: defaultFormatter,
        pieFormatter: pieFormatter
    };
    
    return {
        format: function(chartType, selectedDimensions, selectedMeasures, data){
            var template = getOptionTemplate(chartType);
            var chartDef = ChartDefs.getChartDef(chartType);
            return formatters[chartDef.formatter](template, selectedDimensions, selectedMeasures, data);
        }
    };
});