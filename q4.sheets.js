(function($) {
    /**
     * <p>The Q4 Sheets widget utilizes Google Sheet's API to pull table data into Q4 Websites.</p>
     * <p>Q4 Sheets Widget Features:</p>
     * <ul>
     *   <li style="display: block;"><strong>Instant Update</strong> - No need to go into the CMS for any quick updates within the table body. Will only need access to the source sheet.</li>
     *   <li style="display: block;"><strong>Preview Mode</strong> - Ability to make updates on Google Sheet and only view it for the preview site.</li>
     *   <li style="display: block;"><strong>Total Class</strong> - Automatically add total class for rows with a word Total.</li>
     *   <li style="display: block;"><strong>Data row</strong> - Ability to differentiate header rows and table data.</li>
     *   <li style="display: block;"><strong>Responsive</strong> - Create a separate template specifically for mobile views.</li>
     * </ul>
     * @class q4.sheets
     * @version 2.0.3
     * @example
     * When creating a new google sheet, make sure to clone from the blank sheet. Blank sheet already has the sync script added
     * Blank sheet can be found in ID's drive.
     *
     * <div class='module-sheet'>
     *      <div class='module-sheet_container'></div>
     * </div>
     *
     * <script>
     * $('.module-sheet').sheets({
     *     container: '.module-sheet_container',
     *     apiKey: 'APIKEY',
     *     range: 'Example_Live!A:Z',
     *     previewRange: 'Example_Preview!A:Z',
     *     sheetId: 'SHEETID',
     *     totalClass: 'total',
     *     dataRow: 3,
     *     template: (
     *         '<table>' +
     *             '<thead>' +
     *                 '<tr>' +
     *                     '<th></th>' +
     *                     '<th></th>' +
     *                     '<th colspan="3">Header1</th>' +
     *                     '<th colspan="3">Header2</th>' +
     *                     '<th colspan="3">Header3</th>' +
     *                     '<th colspan="3">Header4</th>' +
     *                 '</tr>' +
     *                 '<tr>' +
     *                     '{{#headers.1}} ' +
     *                         '<th>{{.}}</th> ' +
     *                     '{{/headers.1}}' +
     *                 '</tr>' +
     *             '</thead>' +
     *             '<tbody>' +
     *                 '{{#items}}' +
     *                     '<tr class="{{alt}} {{total}}"> ' +
     *                         '{{#row}}<td>{{.}}</td>{{/row}} ' +
     *                     '</tr> ' +
     *                 '{{/items}} ' +
     *             '</tbody>' +
     *         '</table>'
     *     ),
     *     beforeRender: function(e, tplData) {},
     *     complete: function() {}
     * });
     * </script>
     */
    $.widget('q4.sheets', /** @lends q4.sheets */ {
        options: {
            /**
             * API End Point (Defaults to v4)
             * @type {string}
             * @default
             */
            api: 'https://sheets.googleapis.com/v4/spreadsheets/',
            /**
             * API Key (Required). Refer to Google Developer Console.
             * @type {string}
             */
            apiKey: '',
            /**
             * The Google Sheet's ID (Required) you wish to display.
             * @type {string}
             */
            sheetId: '',
            /**
             * The range of data you wish to display from the sheet. If previewRange is undefined this sheet will be used for both preview and live. Make sure the naming convention of this sheet matches the previewRange's before the underscore.
             * @type {string}
             * @default
             */
            range: 'Sheet_Live!A:Z',
            /**
             * The range of data you wish to display from the sheet, only visible in preview site. Make sure the naming convention of this sheet matches the range's before the underscore.
             * @type {string}
             * @default
             */
            previewRange: 'Sheet_Preview!A:Z',
            /**
             * The class for rows with the word total.
             * @type {string}
             * @default
             */
            totalClass: 'total',
            /**
             * The row number where headers end and table data begins.
             * @type {number}
             * @default
             */
            dataRow: 1,
            /**
             * The class for alternating table rows.
             * @type {string}
             * @default
             */
            altClass: 'row-alt',
            /**
             * The class selector for the table's container (Required).
             * @type {string}
             */
            container: '',
            /**
             * A Mustache.js template to generate the table.
             *
             * The following tags are available:
             *
             * - '{{#headers}}' An array of header rows
             * - '{{#items}}' An array of data items for the table body
             * - '{{alt}}' A string for the alt class
             * - '{{total}}' A string for the total class
             * - '{{#row}}' An array of cell data
             * - '{{.}}' Indicator for the value of an array
             *
             * @type {string}
             * @example
             *'<table>' +
             *    '<thead>' +
             *        '<tr>' +
             *            '<td colspan="2">&nbsp;</td>' +
             *            '<td colspan="3">Proven</td>' +
             *            '<td colspan="3">Probable</td>' +
             *            '<td colspan="3">Proven & Probable</td> ' +
             *        '</tr>' +
             *        '<tr>' +
             *            '{{#headers.1}} ' +
             *                '<td>{{.}}</td> ' +
             *            '{{/headers.1}}' +
             *        '</tr>' +
             *    '</thead>' +
             *    '<tbody>' +
             *        '{{#items}}' +
             *            '<tr class="{{alt}} {{total}}""> ' +
             *                '{{#row}}<td>{{.}}</td>{{/row}} ' +
             *            '</tr> ' +
             *        '{{/items}} ' +
             *    '</tbody>' +
             *'</table>'
             */
            template: (
                '<table class="module-sheets module-sheets--desktop">' +
                    '<thead class="module-sheets_header">' +
                        '<tr>' +
                            '{{#headers.0}} ' +
                                '<td>{{.}}</td> ' +
                            '{{/headers.0}}' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody class="module-sheets_body">' +
                        '{{#items}}' +
                            '<tr class="module-sheets_row {{alt}} {{total}}""> ' +
                                '{{#row}}<td class="module-sheets_value">{{.}}</td>{{/row}} ' +
                            '</tr> ' +
                        '{{/items}} ' +
                    '</tbody>' +
                '</table>'
            ),
            /**
             * A boolean to use responsive template which will be appended after the desktop template.
             * @type {boolean}
             * @default
             */
            responsive: false,
            /**
             * If `responsive` is set to true, this template will also rendered below the desktop template.
             * @type {string}
             */
            responsiveTemplate: '',
            /**
             * A Mustache.js template to generate the message if there are no items pulled.
             * @type {string}
             */
            noItemsTemplate: '',
            /**
             * A callback that fires before the full widget is rendered.
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] The complete template data.
             */
            beforeRender: function(e, tpl) {},
            /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function(e) {}
        },
        _create: function() {
            var inst = this,
                o = this.options;

            inst._createTable();
        },
         _createTable: function() {
            var inst = this,
                o = this.options;

            inst._getData();
        },
        _getData: function() {
            var inst = this,
                o = this.options;

            var url = [o.api];
            url.push(o.sheetId);

            // if viewing in preview, get data from previewRange
            GetViewType() !== '0' || o.previewRange === '' ? url.push('/values/'+o.range) : url.push('/values/'+o.previewRange);
            url.push('?key='+o.apiKey);

            $.ajax({
                url: url.join(''),
                dataType: 'jsonp',
                success: function(data) {
                    if (data !== undefined) {
                        inst._normalizeData(data);
                    } else {
                        console.log("Google Sheet did not load");
                    }
                }
            });
        },
        _normalizeData: function(sheetData) {
            var inst = this,
                o = this.options,
                tplData = {
                    headers: {},
                    items: [],
                };
            $.each(sheetData.values, function(i, value) {
                // push index to headers object if it's less than dataRow
                if (i < o.dataRow - 1) {
                    tplData.headers[i] = value;
                } else {
                    tplData.items.push({row: value});
                }
            });
            $.each(tplData.items, function(i, item) {
                if (i % 2) {
                    item.alt = o.altClass;
                }
                // crude way to detect if a row is a total row
                if (o.totalClass.length && item.row.join(' ').toLowerCase().indexOf('total') > -1) {
                    item.total = o.totalClass;
                }
            });
            this._trigger('beforeRender', null, tplData);
            inst._renderTable(tplData, o.container, o.template);
        },
        _renderTable: function(data, container, template) {
            var inst = this,
                o = this.options,
                $e = this.element,
                $container = $(container, $e);

            $container.empty();

            if (data.items.length) {
                $container.append(Mustache.render(template, data));
                if (o.responsive) {
                    $container.append(Mustache.render(o.responsiveTemplate, data));
                }
            } else {
                $container.append(Mustache.render(o.noItemsTemplate));
            }
            this._trigger('complete');
        },
        destroy: function() {
            this.element.html('');
        },
        _setOption: function(option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);