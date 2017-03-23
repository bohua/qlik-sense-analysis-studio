define([
    
], function(){
    'use strict';
    var defaultOptions = {
        chart: {
            type: 'area'
        },
        title: {
            text: null
        },
        yAxis: {
            title: {
                text: null
            }
        },
        xAxis: {
            title: {
                text: null
            },
            categories: []
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        series: []
    };
    
    return {
        getOptions: function(selectedDimensions, selectedMeasures, data){
            var options = Object.assign({}, defaultOptions);
            options.xAxis.title.text = selectedDimensions[0].qName;
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
            
            options.xAxis.categories = categories;
            options.series = series;
            return options;
        }
    };
});