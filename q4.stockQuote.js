(function($) {
     /**
     * A mustache widget using the Q4 Stock api.
     * @class q4.stockQuote
     * @version 1.0.13
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.stockQuote", /** @lends q4.stockQuote */ {
        options: {
            /**
             * The Number of items the API should return
             * @default
             * @type {interger}
             */
            items: 1,
            /**
             * The Stock Exchange the corresponding `symbol` belongs to, in the following format: 'Exchange:Symbol'.
             * If a custom name should be used visibly on the site, list this after the value. This will load the data using the first string,
             * but allow you to control the appearance of the exchange/symbol text that is rendered using the second string.
             *
             * If no value is provided for this array, the widget will attempt to use an entry from the indices lookup list. More info under `lookupIndex` option.
             * @example stock: ['NYSE:GDDY']
             * @example stock: ['NYSE:GDDY', 'CoolExchangeName:CoolSymbolName']
             * @type {Array<string>}
             */
            stock: [],
            /**
             * If no symbol or exchange are provided in the `stock` option, the widget will fall back to using the indices lookup list.
             * The `lookupIndex` option will allow you to target which lookup entry you wish to use for this widget, based on it's index number.
             * The default value is 1, meaning it will load the first lookup entry (ie. the one at the top of the list).
             * @default
             * @type {interger}
             */
            lookupIndex: 1,
            /**
             * If time is required in the widget template, change this option to <code>true</code>. This will mean the widget uses Moment.js to format dates and
             * times instead of datepicker. Note that this option will only work if the Moment.js library has been included on the page.
             * <strong>If true, the <code>dateFormat</code> option must be changed to use MomentJS date format naming rules.</strong>
             * @type {boolean}
             * @default
             */
            useMoment: false,
            /**
             * <div style="background:none;">
             *    A date format string, which can be used in the template as <code>{{date}}</code>.
             *    Can alternately be an object of format strings, which can be accessed with <code>{{date.key}}</code> (where key is the
             *    object key corresponding to the string you want to use). In a widget which requires a date and time you would want to enable the <code>useMoment</code> option
             *    and render the time as <code>{{date.time}}</code> in the template.
             *    <ul>
             *          <li>If <code>useMoment</code> is false (default value), dates are formatted using <a href="http://api.jqueryui.com/datepicker/" target="_blank">jQuery UI's datepicker rules</a>.</li>
             *          <li>If <code>useMoment</code> is true, the date will be formatted using <a href="https://momentjs.com/docs/#/displaying/" target="_blank">MomentJS rules</a>.</li>
             *    </ul>
             * </div>
             * <div style="display:inline-block; width: 49.9%; vertical-align: top; background:none;">
             *          <strong>Common Datepicker Format options:</strong>
             *          <ul>
             *            <li>d = day of month (no leading zero)</li>
             *            <li>dd = day of month (two digit)</li>
             *            <li>D = day name short</li>
             *            <li>DD = day name long</li>
             *            <li>m = month of year (no leading zero)</li>
             *            <li>mm = month of year (two digit)</li>
             *            <li>M = month name short</li>
             *            <li>MM = month name long</li>
             *            <li>y = year (two digit)</li>
             *            <li>yy = year (four digit)</li>
             *            <li>@ = Unix timestamp (milliseconds since 01/01/1970)</li>
             *          </ul>
             * </div>
             * <div style="display:inline-block; width: 45%; vertical-align: top; background:none;">
             *          <strong>Common MomentJS Format options:</strong>
             *          <ul>
             *            <li>D = day of month (no leading zero)</li>
             *            <li>DD = day of month (two digit)</li>
             *            <li>ddd = day name short</li>
             *            <li>dddd = day name long</li>
             *            <li>M = month of year (no leading zero)</li>
             *            <li>MM = month of year (two digit)</li>
             *            <li>MMM = month name short</li>
             *            <li>MMMM = month name long</li>
             *            <li>YY = year (two digit)</li>
             *            <li>YYYY = year (four digit)</li>
             *            <li>x = Unix timestamp (milliseconds since 01/01/1970)</li>
             *            <li>h = hour (12hr, no leading zero)</li>
             *            <li>hh = hour (12hr, two digit)</li>
             *            <li>mm = minute (two digit)</li>
             *            <li>A = AM/PM</li>
             *            <li>a = am/pm</li>
             *          </ul>
             * </div>
             * @example 'MM d, yy' // datepicker format
             * @example
             * {
             *     date: 'MM D, YYYY',
             *     time: 'hh:mm a'
             * }
             * @type {string|Object}
             * @default
             */
            dateFormat: 'MM d, yy',
            /**
             * Includes additional fields of data
             * <ul>
             *     <li>CompanyName</li>
             *     <li>DivAmount</li>
             *     <li>DivFrequency</li>
             *     <li>DivYield</li>
             *     <li>EPS</li>
             *     <li>ExDivDate</li>
             *     <li>Exchange</li>
             *     <li>MarketCap</li>
             *     <li>PeRatio</li>
             *     <li>ShareOut</li>
             *     <li>ShareTraded</li>
             *     <li>Symbol</li>
             *     <li>TickerSymbol</li>
             * </ul>
             * @default
             * @type {boolean}
             */
            useFullStockQuote: true,
            /**
             * Required for any client not under the Q4 Portfolio
             */
            useXignite: false,
            /**
             * For use outside the Q4 CMS
             */
            usePublic: false,
            /**
             * API Key is required when `usePublic` is set to true
             */
            apiKey: '',
            /**
             * Additional class added if the price is up or down
             */
            changeCls: ['module-stock_down', 'module-stock_up'],
            /**
             * A message or HTML string to display while first loading the widget.
             * See also `itemLoadingMessage`.
             * @type {?string}
             * @default
             */
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading ...</span></p>',
            /**
             * Public API URL is required when `usePublic` is set to true
             */
            url: '',
            /**
             * A message or HTML string to display if there is no stock data for current exchange/symbol.
             */
            noDataTpl: 'There are no results for current exchange/symbol',
            /**
             * Template used to render stock data as HTML
             * <p><strong>Default Stock Quote Template includes</strong></p>
             * <ul>
             *    <li>change</li>
             *    <li>high</li>
             *    <li>high52</li>
             *    <li>low</li>
             *    <li>low52</li>
             *    <li>open</li>
             *    <li>percChange</li>
             *    <li>previousClose</li>
             *    <li>tradeDate</li>
             *    <li>tradeTime</li>
             *    <li>tradePrice</li>
             *    <li>uod - {string} - Returns a class name with the word `up` or `down` (defined in `changeCls` option)</li>
             *    <li>uodSymbol - {string} - Returns '-' or '+'</li>
             *    <li>volume</li>
             * </ul>
             * <p><strong>Additional items can be added to the template when `useFullStockQuote` is set to true (it is true by default).</strong></p>
             * <ul>
             *    <li>companyName</li>
             *    <li>divAmount</li>
             *    <li>divFrequency</li>
             *    <li>divYield</li>
             *    <li>eps</li>
             *    <li>exDivDate</li>
             *    <li>exchange</li>
             *    <li>marketCap</li>
             *    <li>peRatio</li>
             *    <li>shareOut</li>
             *    <li>shareTraded</li>
             *    <li>symbol</li>
             *    <li>tickerSymbol</li>
             * </ul>
             * <pre><code>Example: (
             * '{{#.}}' +
             *     '&lt;h4 class="module-stock_lookup-title"&gt;' +
             *         '&lt;span class="module-stock_indice"&gt;{{exchange}}: {{symbol}}&lt;/span&gt;' +
             *     '&lt;/h4&gt;' +
             *     '&lt;div class="module_container module_container--content grid--no-gutter grid--no-space"&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_price"&gt;Price&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_price"&gt;{{tradePrice}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_change"&gt;Change&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_change {{uod}}"&gt;' +
             *                 '&lt;span class="module-stock_indicator"&gt;{{uodSymbol}}&lt;/span&gt;{{change}}&lt;/span&gt;' +
             *             '&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *            ' &lt;span class="module-stock_volume"&gt;Volume&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_volume"&gt;{{volume}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_percent-change"&gt;% Change&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_percent-change {{uod}}"&gt;' +
             *                 '&lt;span class="module-stock_indicator"&gt;{{uodSymbol}}&lt;/span&gt;{{percChange}}%' +
             *             '&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_high"&gt;Intraday High&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_high"&gt;{{high}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_week-high"&gt;52 Week High&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_week-high"&gt;{{high52}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_low"&gt;Intraday Low&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_low"&gt;{{low}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_week-low"&gt;52 Week Low&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_week-low"&gt;{{low52}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_open"&gt;Today\'s Open&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_open"&gt;{{open}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_previous-close"&gt;Previous Close&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *         '&lt;div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2"&gt;' +
             *             '&lt;span class="module-stock_previous-close"&gt;{{previousClose}}&lt;/span&gt;' +
             *         '&lt;/div&gt;' +
             *     '&lt;/div&gt;' +
             *     '&lt;div class="module-stock_date"&gt;' +
             *         '&lt;span class="module-stock_date-text"&gt;{{tradeDate}} {{tradeTime}}&lt;/span&gt;' +
             *     '&lt;/div&gt;' +
             * '{{/.}}'
             * )</code></pre>
             */
            stockTpl: (
                '{{#.}}' +
                    '<h4 class="module-stock_lookup-title">' +
                        '<span class="module-stock_indice">{{exchange}}: {{symbol}}</span>' +
                    '</h4>' +
                    '<div class="module_container module_container--content grid--no-gutter grid--no-space">' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_price">Price</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_price">{{tradePrice}}</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_change">Change</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_change {{uod}}">' +
                                '<span class="module-stock_indicator">{{uodSymbol}}</span>{{change}}' +
                            '</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                           ' <span class="module-stock_volume">Volume</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_volume">{{volume}}</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_percent-change">% Change</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_percent-change {{uod}}">' +
                                '<span class="module-stock_indicator">{{uodSymbol}}</span>{{percChange}}%' +
                            '</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_high">Intraday High</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_high">{{high}}</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_week-high">52 Week High</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_week-high">{{high52}}</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_low">Intraday Low</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_low">{{low}}</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_week-low">52 Week Low</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_week-low">{{low52}}</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_open">Today\'s Open</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_open">{{open}}</span>' +
                        '</div>' +
                        '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_previous-close">Previous Close</span>' +
                        '</div>' +
                        '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                            '<span class="module-stock_previous-close">{{previousClose}}</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="module-stock_date">' +
                        '<span class="module-stock_date-text">{{tradeDate}} {{tradeTime}}</span>' +
                    '</div>' +
                '{{/.}}'
            ),
            /**
             * A callback that fires before the full widget is rendered.
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [stockData] The complete template data.
             */
             beforeRender: function(event, stockData){},
             /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
             complete: function(event){}
        },

        exchangeCodes: {
            'NASDAQ': 'XNAS',
            'NASD': 'XNAS',
            'NYSE': 'XNYS',
            'TSE': 'XTSE',
            'TSX': 'XTSE',
            'TSX-V': 'XTSX'
        },

        _create: function() {
            var inst = this, o = inst.options;

            this.element.html(o.loadingMessage || '');

            if (o.stock.length){
                inst._getStockQuote();
            } else {
                inst._getStockIndice();
            }
        },

        _buildParams: function () {
            return {
                serviceDto: {
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
                    StartIndex: 0,
                    RevisionNumber: GetRevisionNumber(),
                    LanguageId: GetLanguageId(),
                    Signature: GetSignature(),
                    ItemCount: this.options.items
                }
            };
        },

        _getStockIndice: function() {
            var inst = this, o = inst.options, indice;

            if (typeof o.stock === 'string') o.stock = [o.stock];

            if (o.usePublic) {
                indice = inst._getData( o.url + '/feed/Lookup.svc/GetLookupList', {
                    apiKey: o.apiKey,
                    lookupType: 'indices'
                });
            } else {
                indice = inst._getData('/Services/LookupService.svc/GetLookupList',
                    $.extend( inst._buildParams(), {
                        lookupType: 'indices'
                    })
                );
            }

            indice.fail(function (jqxhr, status, message) {
                console.error('Error fetching indice: ' + message);
            }).done(function (stockIndice) {
                if (stockIndice.GetLookupListResult.length){
                    var useIndice = stockIndice.GetLookupListResult[o.lookupIndex - 1].Value,
                        useIndiceText = stockIndice.GetLookupListResult[o.lookupIndex - 1].Text;

                    o.stock = [useIndice, useIndiceText];

                    inst._getStockQuote();
                } else {
                    if (o.usePublic) {
                        if (o.url.length && o.apiKey.length){
                            console.log('There are no active indices on ' + o.url);
                        } else {
                            console.log('Check that you have configured a valid url and apiKey');
                        }
                    } else {
                        console.log('There are no active indices');
                    }
                }
            });
        },

        _addCommas: function(nStr) {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        _convertTime: function (time) {
            var militaryTime = time.split(':'),
            hours = militaryTime[0],
            suffix = "AM";

            if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
            }
            if (hours === 0)
            hours = 12;

            return hours + ':' + militaryTime[1] + ' ' + suffix;
        },

        _getData: function (url, params) {
            if (this.options.usePublic) {
                return $.ajax({
                    type: 'GET',
                    url: url,
                    data: params,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                });
            } else {
                return $.ajax({
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(params),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                });
            }
        },

        _getStockQuote: function(){
            var inst = this, o = inst.options, stockQuote,

                useStock = o.stock[0],
                useExchange = useStock.split(':')[0],
                useSymbol = useStock.split(':')[1],
                xignite = inst.exchangeCodes[useExchange] !== undefined ? inst.exchangeCodes[useExchange] : useExchange,
                service = o.useFullStockQuote ? 'GetFullStockQuoteList' : 'GetStockQuoteList';

            if (o.usePublic) {
                stockQuote = inst._getData( o.url + '/feed/StockQuote.svc/' + service, {
                    apiKey: o.apiKey,
                    exchange: o.useXignite ? xignite : useExchange,
                    symbol: useSymbol,
                    pageSize: o.items
                });
            } else {
                stockQuote = inst._getData('/services/StockQuoteService.svc/' + service,
                    $.extend( inst._buildParams(), {
                        exchange: o.useXignite ? xignite : useExchange,
                        symbol: useSymbol
                    })
                );
            }

            stockQuote.fail(function (jqxhr, status, message) {
                console.error('Error fetching stock data: ' + message);
            }).done(function (stockQuote) {
                if (stockQuote[ service  + 'Result' ].length && stockQuote[ service + 'Result' ][0] != null ) {
                    inst.element.html( inst._normalizeData( stockQuote[ service  + 'Result' ]) );
                    inst._trigger('complete');
                } else {
                    inst.element.html(inst.options.noDataTpl);
                }
            });
        },

        _normalizeData: function( stockQuote ) {
            var inst = this, o = inst.options,
                fullStockQuote = { items: [] };


            $.each(stockQuote, function(i, item){

                var quote = {
                    change: inst._addCommas(item.Change.toFixed(2)),
                    high: inst._addCommas(item.High.toFixed(2)),
                    high52: inst._addCommas(item.High52.toFixed(2)),
                    low: inst._addCommas(item.Low.toFixed(2)),
                    low52: inst._addCommas(item.Low52.toFixed(2)),
                    open: inst._addCommas(item.Open.toFixed(2)),
                    percChange: item.PercChange.toFixed(2),
                    previousClose: inst._addCommas(item.PreviousClose.toFixed(2)),
                    tradeDate: inst._formatDate(item.TradeDate),
                    tradeTime: inst._convertTime(item.TradeDate.split(' ').pop()),
                    tradePrice: inst._addCommas(item.TradePrice.toFixed(2)),
                    uod: item.Change.toString().charAt(0) == '-' ? o.changeCls[0] : o.changeCls[1],
                    uodSymbol: item.Change.toString().charAt(0) == '-' ? '' : '+',
                    volume: inst._addCommas(item.Volume)
                };

                if (o.useFullStockQuote) {

                    var useName = o.stock.length > 1 ? o.stock[1] : o.stock[0],
                        useExchangeName = useName.split(':')[0],
                        useSymbolName = useName.split(':')[1];

                    $.extend(quote, {
                        companyName: item.CompanyName,
                        divAmount: item.DivAmount,
                        divFrequency: item.DivFrequency,
                        divYield: item.DivYield,
                        eps: item.EPS.toFixed(2),
                        exDivDate: item.ExDivDate,
                        exchange: useExchangeName,
                        marketCap: item.MarketCap,
                        peRatio: item.PeRatio,
                        shareOut: item.ShareOut,
                        shareTraded: item.ShareTraded,
                        symbol: useSymbolName,
                        tickerSymbol: item.TickerSymbol,
                    });
                }

                fullStockQuote.items.push( quote );
            });

            inst._trigger('beforeRender', null, fullStockQuote);

            return Mustache.render( inst.options.stockTpl, fullStockQuote.items );
        },

        _formatDate: function (dateString) {
            var o = this.options,
                date = new Date(dateString),
                useMoment = o.useMoment && typeof moment != 'undefined';

            if (typeof o.dateFormat == 'string') {
                // if o.dateFormat is a format string, return a formatted date string
                return useMoment ? moment(date).format(o.dateFormat) :
                    $.datepicker.formatDate(o.dateFormat, date);
            } else if (typeof o.dateFormat == 'object') {
                // if o.dateFormat is an object of names to format strings,
                // return an object of names to formatted date strings
                var dates = {};
                for (name in o.dateFormat) {
                    dates[name] = useMoment ? moment(date).format(o.dateFormat[name]) : $.datepicker.formatDate(o.dateFormat[name], date);
                }

                return dates;
            }
        },

        setStock: function(value) {
            var inst = this, o = this.options;
            $.extend( o, { stock: value});
            inst._create();
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);
