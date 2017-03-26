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
        plotOptions: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        },
        series: []
    };
    
    return defaultOptions;
});