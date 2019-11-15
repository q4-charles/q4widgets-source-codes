(function($) {
    /**
     * Retrieves price and volume information for a stock on a specific date.
     * @class q4.historical
     * @version 2.2.4
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget('q4.historical', /** @lends q4.historical */ {
        options: {
            /**
             * The base URL of the Q4 website.
             * @type {string}
             * @example //feeds.q4websystems.com
             */
            url: '',
            /**
             * Whether to use public feeds for data. This requires the `apiKey` option.
             * @type {boolean}
             */
            usePublic: false,
            /**
             * The Q4 API key. Required if `usePublic` is `true`, otherwise ignored.
             * @type {string}
             */
            apiKey: '',
            /**
             * The stock exchange to use.
             * If this is not specified, the widget will look for `?Indice=EXCH:SYM` in the URL.
             * @type {string}
             */
            exchange: '',
            /**
             * The stock symbol to use.
             * If this is not specified, the widget will look for `?Indice=EXCH:SYM` in the URL.
             * @type {string}
             */
            symbol: '',
            /**
             * A date format string to use with jQuery UI's Datepicker.
             * @type {string}
             * @default
             */
            dateFormat: 'M d, yy',
            /**
             * The earliest date that will be available as an option. Default is Jan 1, 1970.
             * @type {Date}
             * @type {string}
             */
            startDate: null,
            /**
             * The latest date that will be available as an option. Default is the current day.
             * @type {Date}
             * @type {string}
             */
            endDate: null,
            /**
             * A selector for the element to use as a datepicker. Usually an `<input>`.
             * @type {string}
             * @default
             */
            datepicker: 'input:first',
            /**
             * A set of options to pass directly to the datepicker constructor.
             * @type {Object}
             */
            datepickerOpts: {},
            /**
             * Whether to update the datepicker field after fetching the stock quote.
             * If there is no data for the selected date, this option will clear the field.
             * @type {boolean}
             * @default
             */
            updateDatepicker: true,
            /**
             * Whether to fetch today's stock quote when the table is initialized.
             * @type {boolean}
             * @default
             */
            fetchOnInit: true,
            /**
             * A selector for a trigger element that will perform the lookup when clicked.
             * If this is not specified, the lookup will occur when the `datepicker` element's
             * value changes.
             * @type {string}
             */
            trigger: '',
            /**
             * A selector for the container that will be filled with the lookup results.
             * @type {string}
             * @default
             */
            quoteContainer: '.quote',
            /**
             * A Mustache template used to render the lookup results in the quote container.
             * The following tags are available:
             *
             * - `{{date}}`   The date of the historical stock quote.
             * - `{{volume}}` The trading volume of the stock on that date.
             * - `{{open}}`   The opening stock price on that date.
             * - `{{close}}`  The closing stock price on that date.
             * - `{{high}}`   The stock's highest trading price on that date.
             * - `{{low}}`    The stock's lowest trading price on that date.
             * @type {string}
             * @example
             * 'Date: {{date}}<br>' +
             * 'Volume: {{volume}}<br>' +
             * 'Open: {{open}}<br>' +
             * 'Close: {{close}}<br>' +
             * 'High: {{high}}<br>' +
             * 'Low: {{low}}'
             */
            quoteTemplate: '',
            /**
             * A message to display in the quote container in case no results were found.
             * @type {string}
             * @default
             */
            notFoundMessage: 'No stock data is available for this date.',
            /**
             * A CSS class to add to the widget while data is loading.
             * This can be used to show and hide elements within the widget.
             * @type {string}
             */
            loadingClass: '',
        },

        _init: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // strip trailing slash from domain
            o.url = o.url.replace(/\/$/, '');

            // get exchange and symbol from query string if not in options
            if (!o.exchange || !o.symbol) {
                var m = document.location.search.match(/(?:^|&)Indice=([a-z]+):([a-z]+)(?:$|&)/i);
                if (!m) {
                    console.log('Error initializing stock historical chart: no exchange/symbol found.');
                    return;
                }
                o.exchange = o.exchange || m[1];
                o.symbol = o.symbol || m[2];
            }

            // set up the date picker
            var $picker = $(o.datepicker, $e).val('').datepicker($.extend({}, {
                minDate: o.startDate === null ? null : new Date(o.startDate),
                maxDate: o.endDate === null ? 0 : new Date(o.endDate),
                dateFormat: o.dateFormat,
                changeMonth: true,
                changeYear: true
            }, o.datepickerOpts));

            // fetch and render
            function updateQuote(date) {
                $e.addClass(o.loadingClass);
                _._fetchQuote(date).done(function (data) {
                    _._renderQuote(data);
                    $e.removeClass(o.loadingClass);
                });
            }

            // event handler
            function handleEvent(e) {
                e.preventDefault();
                var date = $picker.datepicker('getDate');
                if (date === null) return;
                updateQuote(date);
            }

            // assign a click event if a trigger has been specified; otherwise use a change event
            var $trigger = $(o.trigger, $e);
            if (o.trigger && $trigger.length) $trigger.click(handleEvent);
            else $picker.change(handleEvent);

            // fetch and render today's quote
            if (o.fetchOnInit) updateQuote(new Date());
        },

        _fetchQuote: function (date) {
            var o = this.options;

            utcDate = Date.UTC( date.getFullYear(), date.getMonth(), date.getDate() );

            if (o.usePublic) {
                return $.ajax({
                    type: 'GET',
                    url: o.url + '/feed/StockQuote.svc/GetStockQuoteHistoricalList',
                    data: {
                        apiKey: o.apiKey,
                        pageSize: 1,
                        exchange: o.exchange,
                        symbol: o.symbol,
                        endDate: $.datepicker.formatDate('M-dd-yy', new Date(date) )
                    },
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                });
            }
            else {
                return $.ajax({
                    type: 'POST',
                    url: o.url + '/services/StockQuoteService.svc/GetStockQuoteHistoricalList',
                    data: JSON.stringify({
                        serviceDto: {
                            RevisionNumber: GetRevisionNumber(),
                            LanguageId: GetLanguageId(),
                            Signature: GetSignature(),
                            ViewType: GetViewType(),
                            ViewDate: GetViewDate(),
                            StartIndex: 0,
                            ItemCount: 1
                        },
                        exchange: o.exchange,
                        symbol: o.symbol,
                        endDate: '/Date(' + utcDate + ')/'
                    }),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                });
            }
        },

        _renderQuote: function (data) {
            var o = this.options,
                $e = this.element;

            if (!data.GetStockQuoteHistoricalListResult.length) {
                $(o.quoteContainer, $e).html(o.notFoundMessage);
                if (o.correctDatepicker) {
                    $(o.datepicker, $e).datepicker('setDate', null);
                }
                return;
            }

            data = data.GetStockQuoteHistoricalListResult[0];

            var date = new Date(data.HistoricalDate);

            $(o.quoteContainer, $e).html(Mustache.render(o.quoteTemplate, {
                date: $.datepicker.formatDate(o.dateFormat, date),
                high: Number(data.High).toFixed(2),
                low: Number(data.Low).toFixed(2),
                open: Number(data.Open).toFixed(2),
                close: Number(data.Last).toFixed(2),
                volume: this._addCommas(data.Volume)
            }));

            if (o.updateDatepicker) {
                $(o.datepicker, $e).datepicker('setDate', date);
            }
        },

        _addCommas: function (val) {
            val = '' + val;
            var rgx = /^(\d+)(\d{3})/;
            while (rgx.test(val)) {
                val = val.replace(rgx, '$1,$2');
            }
            return val;
        }
    });
})(jQuery);
