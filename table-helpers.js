define([
    './lib/handsontable/handsontable.full'
], function (Handsontable) {
    'use strict';

    return {
        createTable: function(element, header, columns, data){
            var table = new Handsontable(element, {
                data: data,
                columnSorting: true,
                sortIndicator: true,
                colHeaders: header,
                rowHeaders: true,
                manualColumnResize: true,
                columns: columns
            });
            return table;
        },

        getColumns: function(selectedDimensions, selectedMeasures){
            var columns = [];
            selectedDimensions.forEach(field => {
                columns.push({
                    type: 'text'
                });
            });
            selectedMeasures.forEach(field => {
                columns.push({
                    type: 'numeric'
                });
            });
            return columns;
        }
    };
});