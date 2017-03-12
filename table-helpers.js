define([
    './lib/handsontable/handsontable.full'
], function (Handsontable) {
    'use strict';

    // function to render table header
    function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        td.style.fontWeight = 'bold';
        td.style.color = 'green';
        td.style.background = '#CEC';
    }

    return {
        createTable: function(element, data){
            var table = new Handsontable(element, {
                data: data,
                cells: function (row, col, prop) {
                    var cellProperties = {};

                    if (row === 0 || this.instance.getData()[row][col] === 'readOnly') {
                        cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
                    }
                    if (row === 0) {
                        cellProperties.renderer = firstRowRenderer; // uses function directly
                    }

                    return cellProperties;
                }
            });
            return table;
        }
    };
});