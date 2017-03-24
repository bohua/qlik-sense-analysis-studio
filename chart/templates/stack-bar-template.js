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
        plotOptions: {
            series: {
                stacking: 'normal'
            }
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
            reversed: true
        },
        series: []
    };
    
    return defaultOptions;
});