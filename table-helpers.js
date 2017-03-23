define([
    './lib/handsontable/handsontable.full'
], function (Handsontable) {
    'use strict';

    function formatData(rawData){
        if(rawData.length === 0){
            return [];
        }
        else{
            var data = [];
            rawData.forEach(record => {
                const row = record.map(item => item.qText);
                data.push(row);
            });
            return data;
        }
    }
    
    return {
        createTable: function(element, selectedDimensions, selectedMeasures, rawData){
            var headers = [...selectedDimensions, ...selectedMeasures].map(item => item.qName);
            var tableSettings = this.getTableSettings(headers, selectedDimensions, selectedMeasures);
            var table = new Handsontable(element, {
                data: formatData(rawData),
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
        },

        loadData: function(table, rawData){
            table.loadData(formatData(rawData));
        }
    };
});