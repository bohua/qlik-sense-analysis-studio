define([
    
], function(){
    'use strict';
    var defaultOptions = {
        chart: {
            type: 'bar'
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
    
    return defaultOptions;
});