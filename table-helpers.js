define([
    './lib/handsontable/handsontable.full'
], function (Handsontable) {
    'use strict';
    return {
        createTable: function(element, header, selectedDimensions, selectedMeasures, data){
            var tableSettings = this.getTableSettings(header, selectedDimensions, selectedMeasures);
            var table = new Handsontable(element, {
                data: data,
                columnSorting: true,
                sortIndicator: true,
                colHeaders: tableSettings.colHeaders,
                rowHeaders: true,
                manualColumnResize: true,
                manualColumnMove: true,
                columns: tableSettings.columns
            });
            return table;
        },

        getTableSettings: function(header, selectedDimensions, selectedMeasures){
            var dataColumns = {};
            var dataIndex = 0;
            selectedDimensions.forEach(field => {
                dataColumns[field.qName] = {
                    type: 'text',
                    data: dataIndex
                };
                dataIndex++;
                if(header.indexOf(field.qName) === -1){
                    header.push(field.qName);
                }
            });
            selectedMeasures.forEach(field => {
                dataColumns[field.qName] = {
                    type: 'numeric',
                    data: dataIndex
                };
                dataIndex++;
                if(header.indexOf(field.qName) === -1){
                    header.push(field.qName);
                }
            });
            var columns = header.map(column => {
                return dataColumns[column];
            });
            return {
                columns:columns,
                colHeaders: header
            };
        }
    };
});