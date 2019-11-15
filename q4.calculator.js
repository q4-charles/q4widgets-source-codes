(function ($) {
    /**
     * Calculates the growth of an investment in a company's stock over a set time period.
     * @class q4.calculator
     * @version 1.4.6
     * @requires [Fancybox_(optional)](#)
     * @requires [Highstock](lib/highstock.4.2.7.min.js)
     * @requires [jQuery_UI_Autocomplete_(optional)](#)
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget('q4.calculator', /** @lends q4.calculator */ {
        options: {
            /**
             * The base URL of the Q4 website. If the widget is on the same site, this can be blank.
             * @type {string}
             * @example //feeds.q4websystems.com
             */
            url: '',
            /**
             * The Q4 API key. Required.
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
             * If no symbol or exchange are provided in the `stock` option, the widget will fall back to using the indices lookup list.
             * The `lookupIndex` option will allow you to target which lookup entry you wish to use for this widget, based on it's index number.
             * The default value is 1, meaning it will load the first lookup entry (ie. the one at the top of the list).
             * @default
             * @type {interger}
             */
            lookupIndex: 1,
            /**
             * A selector for an input element for the investment amount.
             * @type {?string}
             * @example '.amount'
             */
            amountInput: '.module-calculator_amount .module_input',
            /**
             * The default investment amount to use in case an invalid amount is passed.
             * @type {number}
             * @default
             */
            defaultAmount: 10000,
            /**
             * A selector for the element to use as the dividend checkbox. Usually an `<input type="checkbox">`.
             * @type {string}
             * @example '.calc-reinvest-dividends'
            */
            dividendCheckboxSelector: '.module-calculator_reinvest-dividends input',
            /**
             * Used as a control flag to decide to show/hide the reinvest dividends option on the calculator
             * @type {boolean}
             * @default true
            */
            reinvestDividendsOption: true,
            /**
             * A selector for the element to use as the start date picker. Usually an `<input>`.
             * @type {?string}
             * @example '.startDate'
             */
            startDatepicker: '.module-calculator_start-date .module_input',
            /**
             * A selector for the element to use as the end date picker. Usually an `<input>`.
             * @type {?string}
             * @example '.endDate'
             */
            endDatepicker: '.module-calculator_end-date .module_input',
            /**
             * A set of options to pass directly to the datepicker constructor.
             * @type {Object}
             */
            datepickerOpts: {},
            /**
             * A set of options to pass directly to the fancybox constructor.
             * @type {Object}
             */
            fancyOpts: {},
            /**
             * A date format string to use with jQuery UI's Datepicker.
             * @type {string}
             * @default
             */
            dateFormat: 'MM d, yy',
            /**
             * A date format string to use with jQuery UI's Datepicker.
             * @type {string}
             * @default
             */
            shortDateFormat: 'M d, yy',
            /**
             * The default length of time, in years, to use for the calculation
             * in case invalid dates are passed.
             * @type {number}
             * @default
             */
            defaultYears: 8,
            /**
             * The earliest date that will be available as an option. Default is 20 years ago.
             * @type {Date}
             * @type {string}
             */
            minDate: null,
            /**
             * The message displayed if the user did not provide to date exceeding the minimum amount
             * @type {string}
             */
            invalidDateRangeMessage: 'Date range must exceed 10 days',
            /**
             * The latest date that will be available as an option. Default is the current day.
             * @type {Date}
             * @type {string}
             */
            maxDate: null,
            /**
             * A list of friendly names for stocks, indexed to their exchange and symbol.
             * @type {Object}
             * @default
             */
            stockNames: {
                'CBOE_INDEX:SPX': 'S&P 500',
                'INDCBSX:SPX': 'S&P 500',
                'DJ_INDEX:$DJI': 'Dow 30',
                'IND_DJI:DJI': 'Dow 30',
                'NASD_IND:COMP': 'Nasdaq 100',
                'IND_GIDS:COMP': 'Nasdaq 100',
                'Index:RUT': 'Russell 2000'
            },
            /**
             * A selector for one or more form fields for other stocks to compare against.
             * This can be a text field, a dropdown, or a set of checkboxes or radio buttons.
             * Stocks should be in the format `EXCHANGE:SYMBOL`.
             * @type {?string}
             * @example '.compare'
             */
            compareInput: '.module-calculator_compare .module_input',
            /**
             * A selector for row elements containing the stock comparison checkboxes.
             * @type {string}
             * @example '.module-calculator_input-row'
             */
            compareInputRow: '.module-calculator_input-row',
            /**
             * A selector for a form field for a comparison stock, which will autocomplete using
             * a list of companies from the Q4 API.
             * @type {?string}
             * @example '.customStock'
             */
            autocompleteInput: '.module_input--autocomplete',
            /**
             * A token string for the Q4 company API.
             * @type {?string}
             */
            autocompleteToken: '0bcba1e2-6403-46ad-aaf2-f833bde4183f',
            /**
             * A CSS class to add to the widget while autocomplete data is loading.
             * This can be used to show and hide elements within the widget.
             * @type {string}
             * @example 'autocomplete-loading'
             */
            autocompleteLoadingClass: '',
            /**
             * A selector for a trigger element that will perform the calculation when clicked.
             * @type {?string}
             * @example '.trigger'
             */
            trigger: '.module-calculator_button',
            /**
             * A CSS class to add to the widget while data is loading.
             * This can be used to show and hide elements within the widget.
             * @type {string}
             * @example 'loading'
             */
            loadingClass: 'js--loading',
            /**
             * A selector for an element inside the main widget to contain
             * the investment results and/or the chart.
             * @type {?string}
             * @example '.info'
             */
            infoContainer: null,
            /**
             * A Mustache template used to render the investment results in the quote container.
             * The following tags are available:
             *
             * - `{{exchange}}`    The company's stock exchange.
             * - `{{symbol}}`      The company's stock symbol.
             * - `{{startDate}}`   The initial date of the investment.
             * - `{{endDate}}`     The final date of the investment.
             * - `{{startPrice}}`  The price per share at time of investment.
             * - `{{endPrice}}`    The final price per share.
             * - `{{totalReturn}}` The total gain as a percentage of the initial investment.
             * - `{{cagr}}`        The compounded annual growth rate.
             * - `{{startAmount}}` The initial amount of the investment.
             * - `{{endAmount}}`   The final amount of the investment.
             * - `{{shares}}`      The number of shares purchased.
             * - `{{years}}`       The number of years invested.
             * @type {string}
             * @example
             * '<div>' +
             *     'Starting date: {{startDate}}<br>' +
             *     'Ending date: {{endDate}}<br>' +
             *     'Starting price/share: ${{startPrice}}<br>' +
             *     'Ending price/share: ${{endPrice}}<br>' +
             *     'Total return: {{totalReturn}}%<br>' +
             *     'Compound annual growth rate: {{cagr}}%<br>' +
             *     'Starting investment: ${{startAmount}}<br>' +
             *     'Ending investment: ${{endAmount}}<br>' +
             *     'Years: {{years}}<br>' +
             * '</div>' +
             * '<div class="chart"></div>'
             */
            infoTemplate: '',
            /**
             * A Mustache template for a popup window containing the results and/or the chart.
             * The popup window will only open if this template is specified.
             * If `chartContainer` points to an element in this template,
             * the chart will be drawn in the popup window.
             * Available tags are the same as for `infoTemplate`.
             *
             * Note: Highcharts will not draw the chart in both the original window and the popup.
             * @type {string}
             * @example
             * '<div>' +
             *     'Starting date: {{startDate}}<br>' +
             *     'Ending date: {{endDate}}<br>' +
             *     'Starting price/share: ${{startPrice}}<br>' +
             *     'Ending price/share: ${{endPrice}}<br>' +
             *     'Total return: {{totalReturn}}%<br>' +
             *     'Compound annual growth rate: {{cagr}}%<br>' +
             *     'Starting investment: ${{startAmount}}<br>' +
             *     'Ending investment: ${{endAmount}}<br>' +
             *     'Years: {{years}}<br>' +
             * '</div>' +
             * '<div class="chart"></div>'
             */
            popupTemplate: (
                '<div class="module-calculator_title">' +
                    '<h3>Growth of ${{startAmount}} Investment</h3>' +
                    '{{^reinvestDividends}}<h4>Growth without Dividends Reinvested</h4>{{/reinvestDividends}}' +
                    '{{#reinvestDividends}}<h4>Growth with Dividends Reinvested</h4>{{/reinvestDividends}}' +
                    '<p>(in thousands)</p>' +
                '</div>' +
                '<div class="module-calculator_chart"></div>' +
                '<div class="module-calculator_info">' +
                    '<table class="table table--responsive" width="100%">' +
                        '<thead>' +
                            '<tr>' +
                                '<th>Breakdown</th>' +
                                '<th>{{name}}</th>' +
                                '{{#compare}}<th>{{name}}</th>{{/compare}}' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '<tr>' +
                                '<td>Start Date</td>' +
                                '<td data-heading="{{name}}">{{startDate}}</td>' +
                                '{{#compare}}<td data-heading="{{name}}">{{startDate}}</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>End Date</td>' +
                                '<td data-heading="{{name}}">{{endDate}}</td>' +
                                '{{#compare}}<td data-heading="{{name}}">{{endDate}}</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Start Price/Share</td>' +
                                '<td data-heading="{{name}}">${{startPrice}}</td>' +
                                '{{#compare}}<td data-heading="{{name}}">${{startPrice}}</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>End Price/Share</td>' +
                                '<td data-heading="{{name}}">${{endPrice}}</td>' +
                                '{{#compare}}<td data-heading="{{name}}">${{endPrice}}</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Total Return</td>' +
                                '<td data-heading="{{name}}">{{totalReturn}}%</td>' +
                                '{{#compare}}<td data-heading="{{name}}">{{totalReturn}}%</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Compound Annual Growth Rate</td>' +
                                '<td data-heading="{{name}}">{{cagr}}%</td>' +
                                '{{#compare}}<td data-heading="{{name}}">{{cagr}}%</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Starting Investment</td>' +
                                '<td data-heading="{{name}}">${{startAmount}}</td>' +
                                '{{#compare}}<td data-heading="{{name}}">${{startAmount}}</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Ending Investment</td>' +
                                '<td data-heading="{{name}}">${{endAmount}}</td>' +
                                '{{#compare}}<td data-heading="{{name}}">${{endAmount}}</td>{{/compare}}' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Years</td>' +
                                '<td data-heading="{{name}}">{{years}}</td>' +
                                '{{#compare}}<td data-heading="{{name}}">{{years}}</td>{{/compare}}' +
                            '</tr>' +
                        '</tbody>' +
                    '</table>' +
                '</div>'
            ),
            /**
             * The colour of the main stock symbol in the chart.
             * @type {?string}
             * @example 'blue'
             * @default
             */
            chartColour: 'green',
            /**
             * The width of the line for the main stock symbol in the chart. Only applicable for line-based chart types.
             * @type {?number}
             * @example '2
             * @default
             */
            chartLineWidth: 0,
            /**
             * The type of chart to use for the main stock symbol.
             * @type {?string}
             * @example 'line'
             * @default
             */
            chartType: 'area',
            /**
             * Toggle whether to colour the main stock symbol in red when dipping below the threshold.
             * @type {?boolean}
             * @default
             */
            showNegativeColour: true,
             /**
             * A selector for the stock chart. This should point to an element in the widget,
             * or in `infoTemplate` or `popupTemplate`.
             * @type {?string}
             * @example '.chart'
             */
            chartContainer: '.module-calculator_chart',
            /**
             * A Mustache template for the title of the stock chart.
             * Available tags are the same as for `infoTemplate`.
             * @type {string}
             * @example 'Growth of ${{startAmount}} investment in {{exchange}}:{{symbol}} over {{years}} years'
             */
            chartTitleTemplate: '',
            /**
             * A set of options to pass directly to Highcharts.
             * @type {Object}
             */
            highstockOpts: {},
            /**
             * A callback that fires before the full widget is rendered.
             * @type {function}
             * @param {Event}  [event] The event object.
             * @param {Object} [data]  A data object with these properties:
             * - `tplData` The complete template data that will be passed to Mustache.
             * - `series`  The data series objects that will be passed to Highcharts.
             */
            beforeRender: function (e, data) { },
            /**
             * A callback that is fired after the calculation is complete
             * and the chart has been rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            calculateComplete: function (e) { },
            /**
             * A callback that is fired after the widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function (e) { }
        },

        popup: null,

        stockRegex: /^(\S+):(\S+)$/,

        exchangeNames: {
            XNAS: 'NASDAQ',
            XNYS: 'NYSE',
            XTSE: 'TSX',
            XTSX: 'TSX-V'
        },

        exchangeCodes: {
            'NASDAQ': 'XNAS',
            'NASD': 'XNAS',
            'NYSE': 'XNYS',
            'TSX': 'XTSE',
            'TSX-V': 'XTSX'
        },

        stockIndiceText: null,

        _init: function () {
            var _ = this,
                o = this.options,
                $e = this.element,
                datepickerOpts = $.extend({}, {
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: o.dateFormat,
                    weekHeader: "W",
                    minDate: o.minDate ? new Date(o.minDate) : '-20y',
                    maxDate: o.maxDate ? new Date(o.maxDate) : 0,
                    yearRange: (
                        (o.minDate ? new Date(o.minDate).getFullYear() : '-20') + ':' +
                        (o.maxDate ? new Date(o.maxDate).getFullYear() : '-0')
                    ),
                    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
                    onClose: function (selectedDate) {
                        $('.calc-widget-investment-calculator .hasDatepicker').removeClass('focused');
                    },
                    onChangeMonthYear: function (year, month, datepicker) {
                        // Set the date to the new month/year and the current day,
                        // clamping to the number of days in the new month.
                        // Datepicker will automatically clamp to minDate and maxDate.
                        // Note the callback passes a 1-based month, but Date takes 0-based.
                        var lastDayOfMonth = new Date(year, month, 0).getDate();
                        var newDay = Math.min(datepicker.currentDay, lastDayOfMonth);
                        $(this).datepicker('setDate', new Date(year, month - 1, newDay));
                    }
                }, o.datepickerOpts),
                $startpicker = $(o.startDatepicker, $e).datepicker(datepickerOpts),
                $endpicker = $(o.endDatepicker, $e).datepicker(datepickerOpts);

            if ( !o.exchange || !o.symbol ) {
                _._getStockIndice().done(function (stockIndice) {
                    if (stockIndice.GetLookupListResult.length) {
                        var useIndice = stockIndice.GetLookupListResult[o.lookupIndex - 1].Value,
                            useIndiceText = stockIndice.GetLookupListResult[o.lookupIndex - 1].Text;

                        _.stockIndiceText = useIndiceText;
                        o.exchange = useIndice.split(':')[0];
                        o.symbol = useIndice.split(':')[1];
                    }
                }).fail(function (jqxhr, status, message){
                    console.error('Error fetching stock data: ' + message);
                });
            }

            // Set default form values.
            if (o.defaultAmount) $(o.amountInput, $e).val(o.defaultAmount);
            if (o.defaultYears) $startpicker.datepicker('setDate', '-' + o.defaultYears + 'y');
            $endpicker.datepicker('setDate', '0');

            // Add commas for amount
            $(o.amountInput).on('blur',function(event){
                var $this = $(this);
                $this.val(_._addCommas($this.val().replace(/\D+/g, '')));
            }).val(_._addCommas(o.defaultAmount));

            // Set up the autocomplete comparison input.
            this._setupAutocomplete();

            // If a form trigger was specified, set up the event.
            $(o.trigger, $e).click(function (e) {
                e.preventDefault();

                if ( o.exchange && o.symbol ) {
                    _.stockIndiceText = _.exchangeNames[o.exchange] ? _.exchangeNames[o.exchange] +':'+o.symbol : o.exchange +':'+o.symbol;
                    // Check that a chart isn't already loading
                    if ($e.hasClass(o.loadingClass)) return

                    // Get form data and run the calculator with it.
                    var form = _._getFormData();

                    if ( Math.round((form.endDate - form.startDate)/(1000*60*60*24)) > 10 ) {
                        _.calculate(form.amount, form.startDate, form.endDate, form.compareStocks, form.reinvestDividends);
                    } else {
                        $.fancybox.open({
                            content: '<p>'+ o.invalidDateRangeMessage +'</p>'
                        });
                    }
                } else {
                    $.fancybox.open({
                        content: '<p>There are no active indices</p>'
                    });
                }
            });

            this._trigger('complete');
        },

        _getStockIndice: function (stock) {
            var o = this.options;

            if (o.usePublic) {
                return this._getData(
                    '/feed/Lookup.svc/GetLookupList', {
                        lookupType: 'indices'
                    }
                );
            } else {
                return this._getData(
                    '/Services/LookupService.svc/GetLookupList', {
                        lookupType: 'indices'
                    }
                );
            }
        },

        _getData: function (url, params, limit) {
            var o = this.options,
                opts;

            if (o.usePublic) {
                opts = {
                    type: 'GET',
                    url: o.url + url,
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: $.extend(true, {
                        apiKey: o.apiKey,
                        pageSize: limit
                    }, params)
                };
            } else {
                opts = {
                    type: 'POST',
                    url: o.url + url,
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify($.extend(true, {
                        serviceDto: {
                            ViewType: GetViewType(),
                            ViewDate: GetViewDate(),
                            RevisionNumber: GetRevisionNumber(),
                            LanguageId: GetLanguageId(),
                            Signature: GetSignature(),
                            StartIndex: 0,
                            ItemCount: limit
                        }
                    }, params))
                };
            }

            return $.ajax(opts);
        },

        _setupAutocomplete: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            if (!o.autocompleteInput) return;

            $(o.autocompleteInput, $e).autocomplete({
                source: function (request, response) {
                    $e.addClass(o.autocompleteLoadingClass);
                    $.ajax({
                        url: 'https://api.q4touch.com/symbols',
                        dataType: 'json',
                        data: {
                            search: request.term,
                            token: o.autocompleteToken
                        }
                    })
                    .fail(function () {
                        $e.removeClass(o.autocompleteLoadingClass);
                        response([]);
                    })
                    .done(function (data) {
                        $e.removeClass(o.autocompleteLoadingClass);

                        if ($.isArray(!Array)) {
                            return response([]);
                        }

                        response($.map(data, function (company) {
                            var exchangeName = _.exchangeNames[company.Exchange] || company.Exchange;

                            return {
                                value: exchangeName + ':' + company.Symbol,
                                label: company.Name + ' (' + exchangeName + ':' + company.Symbol + ')'
                            };
                        }));
                    });
                },
                select: function (e, ui) {
                    // Update the value manually, since autocomplete seems to do it too late.
                    // Then trigger a change event with the new value.
                    $(this).val(ui.item.value).change().blur();
                }
            });
        },

        _getFormData: function () {
            var o = this.options,
                $e = this.element,
                amount = Number($(o.amountInput, $e).val().replace(/\D+/g, '')),
                startDate = $(o.startDatepicker, $e).datepicker('getDate'),
                endDate = $(o.endDatepicker, $e).datepicker('getDate'),
                reinvestDividends = false,
                compareStocks = [];

            if ( o.reinvestDividendsOption &&  $(o.dividendCheckboxSelector).length ) {
                reinvestDividends = $(o.dividendCheckboxSelector, $e).prop('checked');
            }

            // Get all comparison stocks.
            $(o.compareInput, $e).each(function () {
                var inputType = $(this).attr('type'),
                    tagName = $(this).prop('tagName').toLowerCase();

                // Look for checkboxes, radio buttons and dropdowns.
                if (($.inArray(inputType, ['checkbox', 'radio']) > -1 && $(this).is(':checked')) || tagName == 'select') {
                    compareStocks.push($(this).val());
                }
                // Look for the 'other' checkbox. If checked, add the value of the text box to the array
                if ($(this).is(':checked') && $(this).closest(o.compareInputRow).find(o.autocompleteInput).attr('type') == 'text') {
                    compareStocks.push($(this).closest(o.compareInputRow).find(o.autocompleteInput).val());
                }
            });

            return {
                amount: amount,
                startDate: startDate,
                endDate: endDate,
                compareStocks: compareStocks,
                reinvestDividends: reinvestDividends
            };
        },

        /**
         * Calculate the growth of `amount` dollars invested in our stock on `startDate`,
         * as of `endDate`, optionally comparing our stock's performance against one or more
         * comparison stocks.
         *
         * If a `trigger` element is specified, then clicking it runs this function,
         * using values from `amountInput`, `startDatepicker` and `endDatepicker`,
         * or the relevant default values.
         * @param {number} amount    The dollar amount of the initial investment.
         * @param {Date}   startDate The starting date of the investment.
         * @param {Date}   endDate   The final date of the investment.
         * @param {(Array<string>|Array<object>)} [compareStocks] An array of comparison stocks.
         *   Stocks can be either strings in `EXCHANGE:SYMBOL` format,
         *   or objects with `exchange`, `symbol` and optional `name` properties.
         */
        calculate: function (amount, startDate, endDate, compareStocks, reinvestDividends) {
            var _ = this,
                o = this.options,
                $e = this.element;

            var stock = this._formatStock(o.exchange, o.symbol);

            // Check for invalid values and substitute defaults.
            amount = Number(amount);
            if (!amount) {
                amount = Number(o.defaultAmount);
                if (!amount) throw new Error('Invalid investment amount.');
            }

            // Validate start and end date, falling back to defaults.
            startDate = new Date(startDate);
            if (startDate.toString() == 'Invalid Date') {
                var years = Number(o.defaultYears);
                if (!years) throw new Error('Invalid start date, and no default number of years.');
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - years);
            }
            endDate = new Date(endDate || Date.now());
            if (startDate > endDate) throw new Error('Start date must precede end date.');

            // Clear the element and add a loading class.
            $e.addClass(o.loadingClass);
            $(o.infoContainer, $e).empty();
            $(o.chartContainer, $e).empty();

            // Format comparison stocks array.
            if (!compareStocks) compareStocks = [];
            if (!$.isArray(compareStocks)) compareStocks = [compareStocks];
            compareStocks = $.map(compareStocks, function (stock) {
                // Look for a string in EXCHANGE:SYMBOL format, and convert it to an object.
                if (typeof stock === 'string') {
                    var m = stock.match(_.stockRegex);
                    if (m) {
                        stock = {
                            exchange: m[1],
                            symbol: m[2]
                        };
                    }
                }

                // Look for an object with exchange and symbol properties.
                if (stock.exchange && stock.symbol) {
                    return _._formatStock(stock.exchange, stock.symbol);
                };
            });

            this._fetchCalculator(stock, compareStocks, startDate, endDate, amount, reinvestDividends)
                .done(function(calculatorDto) {
                    if (!calculatorDto || calculatorDto.length < 1) {
                        console.error('Error parsing calculator dto');
                    } else {
                        if (calculatorDto[0] && calculatorDto[0].returns.length) {
                            stock.results = calculatorDto[0];

                            // All stocks after the first are comparison stocks.
                            var compareStocksWithResults = [];
                            $.each(compareStocks,
                                function(i, stock) {
                                    var quote = calculatorDto[i + 1];
                                    if (quote && quote.returns.length > 0) {
                                        stock.results = quote;
                                        compareStocksWithResults.push(stock);
                                    }
                                });

                            _._render(stock, compareStocksWithResults, reinvestDividends);
                        } else {
                            $(o.chartContainer, $e).html('No stock data available.');
                        }
                    }

                    // Remove the loading class.
                    $e.removeClass(o.loadingClass);
                });
        },

        _formatStock: function (exchange, symbol) {
            var o = this.options;

            if (!exchange || !symbol) return;

            exchange = exchange.toUpperCase();
            symbol = symbol.toUpperCase();

            var exchangeName = this.exchangeNames[exchange] || exchange;
            var exchangeCode = this.exchangeCodes[exchange] || exchange;

            return {
                exchange: exchangeCode,
                exchangeName: exchangeName,
                symbol: symbol,
                name: o.stockNames[exchangeName + ':' + symbol] ||
                    o.stockNames[exchange + ':' + symbol] ||
                    exchangeName + ':' + symbol
            };
        },

        _formatStockForServer: function(stock) {
            return {
                Exchange: stock.exchange,
                Symbol: stock.symbol
            };
        },

        _fetchCalculator: function (clientStock, compareStocks, startDate, endDate, initialInvestment, reinvestDividends) {
            var _ = this,
                o = this.options,
                promise = $.Deferred(),
                apiCall,
                //acceptable date string format for InvestmentCalculator API
                startDateString = $.datepicker.formatDate('yy-mm-dd', startDate), 
                endDateString = $.datepicker.formatDate('yy-mm-dd', endDate);

            // fetch raw data from either the public or private API

            apiCall = $.getJSON(o.url + '/api/InvestmentCalculator/',
            {
                apiKey: o.apiKey,
                clientStock: _._formatStockForServer(clientStock),
                compareStocks: $.map(compareStocks,
                    function(stock) {
                        return _._formatStockForServer(stock)
                    }),
                startDate: startDateString,
                endDate: endDateString,
                initialInvestment: initialInvestment,
                reinvestDividends: reinvestDividends
            });

            apiCall
                .fail(function (jqxhr, status, message) {
                    console.error('Error fetching stock data: ' + message);
                    promise.reject(message);
                })
                .done(function (stockData) {
                    promise.resolve(_._parseCalculatorObject(stockData));
                });
            return promise;
        },

        _parseCalculatorObject: function (calculatorDto) {
            if (calculatorDto) {
                // Parse the server object into a javascript object and do any final calculations needed with the results

                if (!calculatorDto ||
                    !calculatorDto.companyInvestments ||
                    calculatorDto.companyInvestments.length < 1) {
                    return null;
                }

                return $.map(calculatorDto.companyInvestments,
                    function(companyInvestment) {

                        if (!companyInvestment ||
                            !companyInvestment.dailyInvestments ||
                            companyInvestment.dailyInvestments.length < 1) {
                            return null
                        }

                        return {
                            startDate: new Date(companyInvestment.startingDate).getTime(),
                            startPrice: companyInvestment.startingPrice,
                            startShares: companyInvestment.startingShares,
                            startAmount: companyInvestment.startingInvestment,

                            endDate: new Date(companyInvestment.endingDate).getTime(),
                            endPrice: companyInvestment.endingPrice,
                            endShares: companyInvestment.endingShares,
                            endAmount: companyInvestment.endingInvestment,

                            totalReturn: companyInvestment.totalReturn,
                            dividendReinvested: companyInvestment.dividendReinvestedPerShare,
                            years: companyInvestment.years,
                            cagr: companyInvestment.compoundAnnualGrowthRate,

                            returns: $.map(companyInvestment.dailyInvestments,
                                function(dailyValue) {
                                    return {
                                        date: new Date(dailyValue.date).getTime(),
                                        investmentValue: dailyValue.investmentValue
                                    };
                                })
                        };
                    });
            }
        },

        _addCommas: function (val) {
            val = '' + val;
            var rgx = /^(\d+)(\d{3})/;
            while (rgx.test(val)) {
                val = val.replace(rgx, '$1,$2');
            }
            return val;
        },

        _round: function (val, decimals) {
            var exp = Math.pow(10, decimals);
            return Math.round(val * exp) / exp;
        },

        _parseReturnsForChart: function (quotes) {
            return $.map(quotes,
                function (returns) {
                    return [
                        [
                            returns.date,
                            returns.investmentValue
                        ]
                    ];
                });
        },

        _render: function (stock, compareStocks, reinvestDividends) {
            var _ = this,
                o = this.options,
                $e = this.element,
                tplData = {
                    startDate: $.datepicker.formatDate(
                        o.shortDateFormat, new Date(stock.results.startDate)),
                    endDate: $.datepicker.formatDate(
                        o.shortDateFormat, new Date(stock.results.endDate)),
                    years: this._round(stock.results.years, 1),
                    exchange: stock.exchangeName,
                    symbol: stock.symbol,
                    name: _.stockIndiceText,
                    startAmount: this._addCommas(stock.results.startAmount.toFixed(2)),
                    startPrice: this._addCommas(stock.results.startPrice.toFixed(2)),
                    endPrice: this._addCommas(stock.results.endPrice.toFixed(2)),
                    reinvestDividends: reinvestDividends,
                    dividendReinvested: stock.results.dividendReinvested.toFixed(2),
                    shares: this._round(this._addCommas(stock.results.shares), 1),
                    endAmount: this._addCommas(stock.results.endAmount.toFixed(2)),
                    totalReturn: this._addCommas(stock.results.totalReturn.toFixed(2)),
                    cagr: stock.results.cagr.toFixed(2),
                    compare: []
                },
                series = [{
                    color: o.chartColour,
                    data: _._parseReturnsForChart(stock.results.returns),
                    lineWidth: o.chartLineWidth,
                    name: _.stockIndiceText,
                    negativeColor: o.showNegativeColour ? 'red' : null,
                    threshold: stock.results.startAmount,
                    type: o.chartType
                }];

            $.each(compareStocks, function (i, stock) {
                tplData.compare.push({
                    exchange: stock.exchangeName,
                    symbol: stock.symbol,
                    name: stock.name,
                    startPrice: _._addCommas(stock.results.startPrice.toFixed(2)),
                    endPrice: _._addCommas(stock.results.endPrice.toFixed(2)),
                    dividendReinvested: stock.results.dividendReinvested.toFixed(2),
                    shares: _._round(_._addCommas(stock.results.shares), 1),
                    endAmount: _._addCommas(stock.results.endAmount.toFixed(2)),
                    totalReturn: _._addCommas(stock.results.totalReturn.toFixed(2)),
                    cagr: stock.results.cagr.toFixed(2)
                });
                series.push({
                    data: _._parseReturnsForChart(stock.results.returns),
                    lineWidth: 1,
                    name: stock.name,
                    type: 'line'
                });
            });
            // Fire a pre-render callback, passing template and stock chart series data.
            this._trigger('beforeRender', null, {
                tplData: tplData,
                series: series
            });

            // Create a popup window, if specified.
            var $popup = $();
            if (o.popupTemplate) {
                var fancyOpts = $.extend(true, {
                    slideClass: 'fancybox-container--calculator',
                    modal: true,
                    closeBtn: false,
                    fullScreen: false
                }, o.fancyOpts);

                $popup = $('<div><div class="module-calculator_popup-container"></div></div>');
                $popup.html(Mustache.render(o.popupTemplate, tplData));

                $.fancybox.open({
                    src: '<div class="module-calculator_popup-container">'+$popup.html()+'</div>',
                    type: 'inline'
                }, fancyOpts);
            }

            // Render info area.
            $(o.infoContainer, $e).html(Mustache.render(o.infoTemplate, tplData));

            // Render stock chart.
            var highstockOpts = $.extend(true, {
                chart: {
                    backgroundColor: '#f9f9f9',
                    height: 300,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                credits: {
                    enabled: false
                },
                legend: {
                    align: 'center',
                    enabled: true,
                    floating: false,
                    verticalAlign: 'top'
                },
                navigator: {
                    enabled: false
                },
                rangeSelector: {
                    enabled: false,
                    selected: 5  // default to "All"
                },
                scrollbar: {
                    enabled: false
                },
                series: series,
                title: {
                    text: Mustache.render(o.chartTitleTemplate, tplData)
                },
                tooltip: {
                    dateTimeLabelFormats: {
                        minute: '%A, %b %e, %Y',
                        hour: '%A, %b %e, %Y'
                    },
                    pointFormatter: function () {
                        return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>$' + _._addCommas(this.y.toFixed(2)) + '</b><br/>';
                    }

                },
                xAxis: {
                    tickWidth: 0
                }
            }, o.highstockOpts);
            // Render to both the main widget and the popup window.
            // FIXME: Currently Highcharts won't render to both for some reason.
            $(o.chartContainer, $e).add(o.chartContainer, $.fancybox.getInstance().current.$content).each(function () {
                $(this).highcharts('StockChart', highstockOpts);
            });

            this._trigger('calculateComplete');
        }
    });
})(jQuery);