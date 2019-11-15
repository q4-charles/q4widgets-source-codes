(function ($) {
    /**
     * Add a dividends table to your website
     * @class q4.indexDividends
     * @version 1.0.0
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [Highcharts.js(optional)](lib/highcharts-7.1.2.min.js)
     * @requires [Highcharts-Drilldown.js(optional)](lib/highcharts_drilldown-7.1.2.min.js)
     *
     **/
    $.widget("q4.indexDividends", /** @lends q4.indexDividends */ {
        options: {
            /**
             * Domain name where api exists
             */
            url: '',
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
             * Set to true to use outside the Q4 platform
             * requires `apiKey` and `url`
             * @type {boolean}
             */
            usePublic: false,
            /**
             * The Q4 API key. Required if `usePublic` is `true`, otherwise ignored.
             * @type {string}
             */
            apiKey: '',
            /**
             * All items will be loaded, this options will only limit the rendered results
             * @type {interger}
             */
            pageSize: -1,
            /**
             * A date format string to use with jQuery UI's Datepicker.
             * @type {string}
             * @default
             */
            dateFormat: 'm/d/yy',
            /**
             * Whether to sort items in ascending chronological order.
             * @type {boolean}
             * @default false
             */
            sortAscending: false,
            /**
             * A CSS selector for a year select element.
             * @type {string}
             * @default null
             */
            yearSelect: null,
            /**
             * A Mustache.js template for a single year rendered within the yearSelect element.
             * @type {string}
             * @default '<option value="{{year}}">{{year}}</option>'
             */
            yearTemplate: '<option value="{{year}}">{{year}}</option>',
            /**
             * A CSS selector for the items container.
             * @type {string}
             * @default null
             */
            itemContainer: null,
            /**
             * If itemContainer is defined, the template used to render each dividend year.
             * The following template data is available:
             * <pre>
             * {{year}}
             * {{yearlyDividend}}
             * {{Code}}
             * {{Currency}}
             * {{DeclaredDate}}
             * {{DividendAmount}}
             * {{ExDate}}
             * {{PayDate}}
             * {{PaymentFrequency}}
             * {{RecordDate}}
             * {{Type}}
             * </pre>
             * @type {string}
             */
            itemTemplate: (
                // @formatter:off
                /* beautify preserve:start */
                '<table class="table table--responsive">' +
                    '<thead>' +
                        '<tr>' +
                            '<th>Ex-Dividend Date</th>' +
                            '<th>Record Date</th>' +
                            '<th>Payable Date</th>' +
                            '<th>Amount Per Share</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '{{#items}}' +
                            '<tr>' +
                                '<td data-heading="Ex-Dividend Date">{{ExDate}}</td>' +
                                '<td data-heading="Record Date">{{RecordDate}}</td>' +
                                '<td data-heading="Payable Date">{{PayDate}}</td>' +
                                '<td data-heading="Amount Per Share">${{DividendAmount}}</td>' +
                            '</tr>' +
                        '{{/items}}' +
                    '</tbody>' +
                '</table>' +
                '<p>Paid a yearly dividend of ${{yearlyDividend}} for the year of {{year}}.</p>'
                // @formatter:on
                /* beautify preserve:end */
            ),
            /**
             * A message or HTML string to display while first loading the dividend year items.
             * @type {string}
             * @default '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading items...</span></p>'
             */
            itemLoadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading items...</span></p>',
            /**
             * A message or HTML string to display in the <code>itemContainer</code> if no items are found.
             * @type {string}
             * @default
             */
            itemNotFoundMessage: '<div class="col-xs-12"><p><strong>No dividends found.</strong></p></div>',
            /**
             * If yearSelect is defined, determines which dividend year will be rendered first.
             * @type {interger}
             * @default new Date().getFullYear()
             */
            startYear: null,
            /**
             * The amount of decimal points for the dividend amount
             * @type {interger}
             * @default 2
             */
            fixedDecimalPoints: 4,
            /**
             * If set to true, a Highchart will be rendered to the `chartContainer` using `chartTpl`.
             * @type {boolean}
             * @default true
             */
            renderChart: true,
            /**
             * Renders a basic calculator that will use the most recent dividend `calculatorTpl`
             * @type {boolean}
             * @default true
             */
            renderCalculator: true,
            /**
             * Renders dividends for the current year `currentDividendTpl`
             * @type {boolean}
             * @default true
             */
            renderCurrentDividends: true,
            /**
             * Renders dividends for past years `pastDividendTpl`
             * @type {boolean}
             * @default true
             */
            renderPastDividends: true,
            /**
             * Basic chart configuration options
             * @type {object}
             * @default ''
             */
            chart: {
                id: 'chart',
                color: '66, 139, 202',
                colorSpecial: '26, 188, 156',
                title: 'Common Equity Dividends',
                type: 'column',
                xAxisText: 'Payout Period/Date',
                yAxisText: 'Actual Dividend Paid',
                standardSeriesName: 'Common Equity Dividend ($)',
                specialSeriesName: 'Special Dividend ($)',
                drillUpText: '◁'
            },

            /**
             * The "master" template to be appended onto the page.
             * If `groupByYears` is set to true, this template will render for each year.
             * The following data is available:
             * <pre>
             * {{Code}}
             * {{Currency}}
             * {{DeclaredDate}}
             * {{DividendAmount}}
             * {{ExDate}}
             * {{PayDate}}
             * {{PaymentFrequency}}
             * {{RecordDate}}
             * {{Type}}
             * </pre>
             */
            template: (
                // @formatter:off
                /* beautify preserve:start */
                '<table class="table table--responsive">' +
                    '<thead>' +
                        '<tr>' +
                            '<th>Ex-Dividend Date</th>' +
                            '<th>Record Date</th>' +
                            '<th>Payable Date</th>' +
                            '<th>Amount Per Share</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '{{#items}}' +
                            '<tr>' +
                                '<td data-heading="Ex-Dividend Date">{{ExDate}}</td>' +
                                '<td data-heading="Record Date">{{RecordDate}}</td>' +
                                '<td data-heading="Payable Date">{{PayDate}}</td>' +
                                '<td data-heading="Amount Per Share">${{DividendAmount}}</td>' +
                            '</tr>' +
                        '{{/items}}' +
                    '</tbody>' +
                '</table>'
                /* beautify preserve:end */
                // @formatter:on
            ),

            calculatorTpl: (
                // @formatter:off
                /* beautify preserve:start */
                '<div class="irwDivCalc col-xs-12">' +
                    '<div class="row">' +
                        '<div id="dividendCalculatorPanel" class="irwDivCalc col-sm-12">' +
                            '<div class="irwBoxWrapper">' +
                                '<div class="irwBoxHeader bg-default irwBoxTrigger">' +
                                    '<div class="pull-left irwBoxLabel">' +
                                        '<h5 class="text-primary">Dividend Calculator</h5>' +
                                    '</div>' +
                                    '<div class="pull-right irwBoxTools">' +
                                        '<a href="javascript:;" class="showHistoric"><span class="fa fa-plus"></span></a>' +
                                    '</div>' +
                                    '<div class="clearfix"></div>' +
                                '</div>' +
                                '<div class="irwBoxBody irwHistoricBody hidden" id="dividendCalculator">' +
                                    '<p>Enter the number of shares you own and click calculate to find out how much the selected dividend payment was worth to you.</p>' +
                                    '<div class="row Data_calculatorKeyFndg">' +
                                        '<div class="col-xs-12 col-sm-5 Data_calculatorPeriod">' +
                                            '<select id="calculatorPeriod" class="form-control input-xs">' +
                                                '<option value="{{annualized}}">Annualized ({{annualized}})</option>' +
                                                '<option value="{{mostRecent}}">Most Recent ({{mostRecent}})</option>' +
                                                '<option value="{{ytd}}">YTD</option>' +
                                            '</select>' +
                                        '</div>' +
                                        '<div class="col-xs-12 col-sm-5">' +
                                            '<input id="calculatorShares" class="form-control input-xs" type="text" value="Value">' +
                                        '</div>' +
                                        '<div class="col-xs-12 col-sm-2">' +
                                            '<button id="calculatorCalculate" type="button" class="btn btn-primary">Calculate</button>' +
                                        '</div>' +
                                    '</div>' +
                                    '<br>' +
                                    '<div class="row"></div>' +
                                    '<br>' +
                                    '<div class="row">' +
                                        '<div class="col-xs-12">' +
                                            '<div class="irwDivCalResult bg-default text-center">' +
                                                '<div id="calculatorResultsPanel" class="row">' +
                                                    '<div id="calculatorResultsInnerPanel">' +
                                                        '<div id="calculatorDividendPerSharePanel" class="irwResultCurrent text-center col-sm-12 col-md-6">' +
                                                            'Dividend per Share<br>' +
                                                            '<span id="calculatorDividendPerShare" class="text-xlarge">-</span>' +
                                                        '</div>' +
                                                        '<div id="calculatorTotalDividendPaymentPanel" class="irwResultCalc text-center col-sm-12 col-md-6">' +
                                                            'Total Dividend Payment<br>' +
                                                            '<span id="calculatorTotalDividendPayment" class="text-xlarge">-</span>' +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div id="calculatorErr" class="col-xs-12" style="display:none;">' +
                                                        'Please enter numeric characters only.' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
                /* beautify preserve:end */
                // @formatter:on
            ),

            chartTpl: (
                // @formatter:off
                /* beautify preserve:start */
                '<div id="DividendChartContainer" class="irwDivChart col-xs-12">' +
                    '<div class="irwBoxWrapper">' +
                        '<div class="irwBoxHeader bg-primary">' +
                            '<div class="pull-left irwBoxLabel">' +
                                '<h5>Dividend Chart</h5>' +
                            '</div>' +
                            '<div class="pull-right irwSwitch irwPendingHide">' +
                                '<ul>' +
                                    '<li class="first"><a href="#" title="Switch to Graph"><span class="fa fa-bar-chart-o"></span></a></li>' +
                                    '<li><a href="#" title="Switch to Table"><span class="fa fa-table"></span></a></li>' +
                                    '<li class="last"><a href="#" title="Fullscreen"><span class="fa fa-arrows-alt"></span></a></li>' +
                                '</ul>' +
                            '</div>' +
                            '<div class="clearfix"></div>' +
                        '</div>' +
                        '<div class="irwBoxBody">' +
                            '<div id="chart" class="dividend-chart"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
                /* beautify preserve:end */
                // @formatter:on
            ),

            currentDividendTpl: (
                // @formatter:off
                /* beautify preserve:start */
                '<div class="irwBoxWrapperSecondary module-dividends--current">' +
                    '<div class="irwBoxHeader bg-default">' +
                        '<div class="irwBoxLabel">' +
                            '<h5 class="text-primary">Current Year - {{currentYear}}</h5>' +
                        '</div>' +
                    '</div>' +
                    '<table class="table tableGrid irwResponsiveTable ui-iggrid-table ui-widget-content footable-loaded footable default">' +
                        '<thead>' +
                            '<tr>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible footable-first-column"><a href="#">Ex-Dividend Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Record Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Announce Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Pay Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Amount</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Frequency</a></th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '{{#items}}' +
                                '{{#current}}' +
                                    '<tr class="dividend-row" data-year="{{year}}">' +
                                        '<td data-heading="Ex-Dividend Date">{{#ExDate}}{{ExDate}}{{/ExDate}}</td>' +
                                        '<td data-heading="Record Date">{{#RecordDate}}{{RecordDate}}{{/RecordDate}}</td>' +
                                        '<td data-heading="Announce Date">{{#DeclaredDate}}{{DeclaredDate}}{{/DeclaredDate}}</td>' +
                                        '<td data-heading="Pay Date">{{PayDate}}</td>' +
                                        '<td class="dividend_amount" data-heading="Amount">{{DividendAmount}}</td>' +
                                        '<td data-heading="Frequency">{{PaymentFrequency}}</td>' +
                                    '</tr>' +
                                    '{{#last}}' +
                                        '<tr class="dividend-row irwDivTotal" data-year="{{year}}">' +
                                            '<td class="footable-visible footable-first-column">' +
                                                '<span class="footable-toggle"></span>' +
                                                '<div class="irwTotalDivPane">' +
                                                    '<strong>Total dividends paid in {{year}}</strong>' +
                                                '</div>' +
                                            '</td>' +
                                            '<td class="footable-visible"></td>' +
                                            '<td class="footable-visible"></td>' +
                                            '<td class="footable-visible"></td>' +
                                            '<td class="footable-visible">' +
                                                '<strong class="dividends_paid text-primary"></strong>' +
                                            '</td>' +
                                            '<td class="footable-visible footable-last-column"></td>' +
                                        '</tr>' +
                                    '{{/last}}' +
                                '{{/current}}' +
                            '{{/items}}' +
                        '</tbody>' +
                    '</table>' +
                '</div>'
                /* beautify preserve:end */
                // @formatter:on
            ),

            pastDividendTpl: (
                // @formatter:off
                /* beautify preserve:start */
                '<div class="irwBoxWrapperSecondary module-dividends--past">' +
                    '<div class="irwBoxHeader bg-default">' +
                        '<div class="irwBoxLabel">' +
                            '<div class="dividend-slider">' +
                                '<div class="pull-left">' +
                                    '<h5 class="text-primary text-withFormControl">' +
                                        'Previous Year(s) <span class="irwDivsYears ">(<span class="irwDivsYearsFrom">{{endYear}} - {{endYear}}</span>)</span>' +
                                    '</h5>' +
                                '</div>' +
                                '<div class="col-md-8 col-sm-8 pull-left">' +
                                    '<input type="text" class="span2 irwRangeSlider" value="" data-slider-min="{{startYear}}" data-slider-max="{{endYear}}" data-slider-step="1" data-slider-value="[{{endYear}},{{endYear}}]" />' +
                                    '<button class="btn btn-primary" style="margin-left:10px;" type="button">Apply</button>' +
                                '</div>' +
                            '</div>' +
                            '<div class="clearfix"></div>' +
                        '</div>' +
                    '</div>' +
                    '<table class="table tableGrid irwResponsiveTable ui-iggrid-table ui-widget-content footable-loaded footable default">' +
                        '<thead>' +
                            '<tr>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible footable-first-column"><a href="#">Ex-Dividend Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Record Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Announce Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Pay Date</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Amount</a></th>' +
                                '<th class="ui-iggrid-header ui-widget-header footable-visible"><a href="#">Frequency</a></th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '{{#items}}' +
                                '{{#past}}' +
                                    '<tr class="dividend-row" style="display:none;" data-year="{{year}}">' +
                                        '<td data-heading="Ex-Dividend Date">{{#ExDate}}{{ExDate}}{{/ExDate}}</td>' +
                                        '<td data-heading="Record Date">{{#RecordDate}}{{RecordDate}}{{/RecordDate}}</td>' +
                                        '<td data-heading="Announce Date">{{#DeclaredDate}}{{DeclaredDate}}{{/DeclaredDate}}</td>' +
                                        '<td data-heading="Pay Date">{{PayDate}}</td>' +
                                        '<td class="dividend_amount" data-heading="Amount">{{DividendAmount}}</td>' +
                                        '<td data-heading="Frequency">{{PaymentFrequency}}</td>' +
                                    '</tr>' +
                                    '{{#last}}' +
                                        '<tr class="dividend-row irwDivTotal" style="display:none;" data-year="{{year}}">' +
                                            '<td class="footable-visible footable-first-column">' +
                                                '<span class="footable-toggle"></span>' +
                                                '<div class="irwTotalDivPane">' +
                                                    '<strong>Total dividends paid in {{year}}</strong>' +
                                                '</div>' +
                                            '</td>' +
                                            '<td class="footable-visible"></td>' +
                                            '<td class="footable-visible"></td>' +
                                            '<td class="footable-visible"></td>' +
                                            '<td class="footable-visible">' +
                                                '<strong class="dividends_paid text-primary"></strong>' +
                                            '</td>' +
                                            '<td class="footable-visible footable-last-column"></td>' +
                                        '</tr>' +
                                    '{{/last}}' +
                                '{{/past}}' +
                            '{{/items}}' +
                        '</tbody>' +
                    '</table>' +
                '</div>'
                /* beautify preserve:end */
                // @formatter:on
            ),
            /**
             * A CSS class to add to the widget while data is loading. This can be used to show and hide elements within the widget.
             * @type {string}
             */
            loadingClass: '',
            /**
             * A message or HTML string to display while first loading the widget.
             * @type {string}
             * @default '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading items...</span></p>'
             */
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading items...</span></p>',
            /**
             * A callback that fires before the full widget is rendered.
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] The complete template data.
             */
            beforeRender: function (e, tplData) {},
            /**
             * A callback that fires after yearly items are rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            itemsComplete: function (e) {},
            /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function (e) {}
        },

        _create: function () {
            var inst = this,
                o = inst.options;
            var stock = Q4Settings && Q4Settings.indices;

            inst.element.addClass(o.loadingClass);

            if (o.itemContainer) {
                inst.element.find(o.itemContainer).html(o.itemLoadingMessage);
            } else {
                inst.element.html(o.loadingMessage);
            }

            if (!Q4Settings || !Q4Settings.indices) {
                inst.element.find(o.itemContainer).html('Failed to load');
            } else {
                inst._getDividends(stock);
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
                    Signature: GetSignature()
                }
            };
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

        _getDividends: function (ticker) {
            var inst = this,
                o = inst.options,
                dividend,
                useStock = ticker[0].value,
                useExchange = useStock.split(':')[0],
                useSymbol = useStock.split(':')[1];

            if (o.usePublic) {
                dividend = inst._getData(o.url + '/feed/StockQuote.svc/GetDividendList', {
                    exchange: useExchange,
                    symbol: useSymbol,
                    apiKey: o.apiKey,
                    pageSize: o.pageSize
                });
            } else {
                dividend = inst._getData('/services/StockQuoteService.svc/GetDividendList',
                    $.extend(inst._buildParams(), {
                        exchange: useExchange,
                        symbol: useSymbol
                    })
                );
            }

            dividend.done(function (data) {

                var dividends = o.itemContainer ? {} : [],
                    dividendData = data.GetDividendListResult;

                if (dividendData.length) {
                    if (!o.sortAscending) {
                        dividendData = dividendData.reverse();
                        o.startYear = o.startYear ? o.startYear : new Date(dividendData[0].DeclaredDate).getFullYear();
                    } else {
                        o.startYear = o.startYear ? o.startYear : new Date(dividendData[dividendData.length - 1].DeclaredDate).getFullYear();
                    }

                    if (o.pageSize > 0) {
                        dividendData = dividendData.slice(0, o.pageSize);
                    }

                    $.each(dividendData, function (i, divData) {
                        var item = {
                            Code: divData.Code,
                            Currency: divData.Currency,
                            DeclaredDate: divData.DeclaredDate ? $.datepicker.formatDate(o.dateFormat, new Date(divData.DeclaredDate)) : '-',
                            DividendAmount: divData.DividendAmount.toFixed(o.fixedDecimalPoints),
                            ExDate: $.datepicker.formatDate(o.dateFormat, new Date(divData.ExDate)),
                            PayDate: $.datepicker.formatDate(o.dateFormat, new Date(divData.PayDate)),
                            PaymentFrequency: divData.PaymentFrequency,
                            RecordDate: $.datepicker.formatDate(o.dateFormat, new Date(divData.RecordDate)),
                            Type: divData.Type
                        };

                        if (o.itemContainer) {
                            //Separate the items out by year
                            var year = new Date(divData.RecordDate).getFullYear();

                            if (dividends[year] === undefined) {
                                dividends[year] = []
                            }

                            dividends[year].push(item);
                        } else {
                            dividends.push(item);
                        }
                    });
                    inst._trigger('beforeRender', null, {
                        items: dividends
                    });
                    inst._buildDividends(dividends);

                    if (o.renderChart) {
                        inst._formatChartData(dividendData);
                    }
                } else {
                    if (o.itemContainer) {
                        inst.element.find(o.itemContainer).html(o.itemNotFoundMessage || '');
                    } else {
                        inst.element.html(o.itemNotFoundMessage || '');
                    }
                }
            });
        },

        _getAnnualizedType: function (latest, freq) {
            var multiplier;

            switch (freq) {
                case 'Quarterly':
                    multiplier = 4;
                    break;
                case 'Monthly':
                    multiplier = 12;
                    break;
                default:
                    multiplier = 1
            }

            return (latest * multiplier).toFixed(4);
        },

        _buildDividends: function (dividendData) {
            var inst = this,
                o = inst.options;

            var ticker = Q4Settings.indices[0];

            if (o.itemContainer) {
                if (o.yearSelect) {
                    $.each(dividendData, function (i, dataByYear) {
                        $(o.yearSelect).prepend(Mustache.render(o.yearTemplate, {
                            year: i
                        }));
                    });

                    $(o.yearSelect).val(o.startYear).on('change', function () {
                        inst.element.find(o.itemContainer).html(inst._buildYear($(this).val(), dividendData));
                        inst._trigger('itemsComplete');
                    });

                    inst.element.find(o.itemContainer).html(inst._buildYear(o.startYear, dividendData));
                    inst._trigger('itemsComplete');
                } else {
                    var dividendHTML = '';
                    $.each(dividendData, function (i, dataByYear) {
                        dividendHTML += inst._buildYear(i, dividendData);
                    });
                    inst.element.find(o.itemContainer).html(dividendHTML);
                }
            } else {
                var templates = {
                    chart: o.renderChart ? Mustache.render(o.chartTpl, {}) : '',
                    calculator: o.renderCalculator ? Mustache.render(o.calculatorTpl,
                        $.extend(inst._mapCalcData(dividendData), {
                            exchange: ticker.exchange,
                            symbol: ticker.symbol
                        })
                    ) : '',
                    currentDividends: o.renderCalculator ? Mustache.render(o.currentDividendTpl, {
                        currentYear: new Date().getFullYear(),
                        items: dividendData
                    }) : '',
                    pastDividends: o.renderCalculator ? Mustache.render(o.pastDividendTpl, {
                        currentYear: new Date().getFullYear(),
                        items: dividendData,
                        endYear: new Date().getFullYear() - 1,
                        startYear: parseInt(dividendData[dividendData.length - 1].RecordDate.split('/').pop(), 10)
                    }) : '',
                    exchange: ticker.exchange,
                    symbol: ticker.symbol
                };
                inst.element.html(Mustache.render(o.template, templates));
            }

            inst.element.removeClass(o.loadingClass);

            if (o.renderCalculator) {
                inst._onCalculate();
            }

            if (o.renderPastDividends) {
                inst._onRangeChange();
            }

            inst._trigger('complete');
        },

        _onRangeChange: function () {
            var endYear = new Date().getFullYear() - 1;
            var yearSelection = [endYear, endYear];

            $(".irwRangeSlider").slider({
                tooltip: "show"
            });

            // save latest year selection
            $(".irwRangeSlider").on("slide", function (e) {
                yearSelection = e.value;
            });

            // show default year
            $('.dividend-row[data-year="' + endYear + '"]').show();

            $('.dividend-slider button').on('click', function () {
                var $rows = $('.module-dividends--past .dividend-row');
                $rows.hide();

                $('.irwDivsYearsFrom').html(yearSelection[0] + ' - ' + yearSelection[1]);

                for (var i = yearSelection[0]; i <= yearSelection[1]; i++) {
                    $rows.filter('[data-year="' + i + '"]').show();
                }
            });
        },

        _mapCalcData: function (dividendData) {
            var mostRecent = dividendData[0] && dividendData[0].DividendAmount;
            var frequency = dividendData[0] && dividendData[0].PaymentFrequency;

            var ytd = $.map(dividendData, function (dividend) {
                var currentYear = new Date().getFullYear().toString();
                var dividendYear = dividend.DeclaredDate.split('/').pop();

                if (dividendYear === currentYear) {
                    return parseFloat(dividend.DividendAmount)
                }
            });

            return {
                frequency: frequency,
                mostRecent: mostRecent,
                annualized: this._getAnnualizedType(mostRecent, frequency),
                ytd: ytd.reduce(function (a, b) {
                    return a + b
                }, 0),
            }
        },

        _onCalculate: function () {
            $('#calculatorCalculate').on('click', function (e) {
                e.preventDefault();
                var val = parseFloat($('#calculatorPeriod option:selected').val());
                var shares = $('#calculatorShares').val();

                $('#calculatorErr, #calculatorResultsInnerPanel').hide();

                if (shares && /^\d+$/.test(shares)) {
                    $('#calculatorResultsInnerPanel').show();
                    $('#calculatorDividendPerShare').html('$' + val.toFixed(2));
                    $('#calculatorTotalDividendPayment').html('$' + (parseFloat(shares) * val).toFixed(2));
                } else {
                    $('#calculatorErr').show();
                }
            });
        },

        _reduceData: function (data) {
            return data.reduce(function (r, a) {
                r[a.year] = r[a.year] || [];
                r[a.year].push({
                    y: a.value,
                    name: a.date,
                    type: a.type
                });
                return r;
            }, Object.create(null));
        },

        _formatChartData: function (dividendData) {
            var inst = this;
            var data = $.map(dividendData, function (n) {
                var date = n.ExDate.split(' ')[0];

                return {
                    year: parseInt(date.split('/').pop(), 10),
                    date: date,
                    value: n.DividendAmount,
                    type: n.Type
                }
            });

            inst._buildChart(inst._reduceData(data));
        },

        _buildChart: function (data) {
            var inst = this;
            var o = inst.options;
            var chartData = {
                common: [],
                special: []
            };
            var drilldownData = [];
            var currentYear = new Date().getFullYear().toString();

            // Standard

            $.each(data, function (year, val) {
                var ordinaryDividend = $.map(val, function (item) {
                    if (item.type === "OrdinaryDividend") {
                        return item;
                    }
                });

                var specialDividend = $.map(val, function (item) {
                    if (item.type !== "OrdinaryDividend") {
                        return item;
                    }
                });

                chartData.common.push({
                    name: 'FY ' + year,
                    drilldown: 'FY ' + year,
                    color: currentYear === year ? 'rgba(' + o.chart.color + ', 0.50)' : 'rgba(' + o.chart.color + ', 1)',
                    y: ordinaryDividend.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue.y;
                    }, 0)
                });

                chartData.special.push({
                    name: 'FY ' + year,
                    drilldown: 'FY ' + year,
                    color: currentYear === year ? 'rgba(' + o.chart.colorSpecial + ', 0.50)' : 'rgba(' + o.chart.colorSpecial + ', 1)',
                    y: specialDividend.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue.y;
                    }, 0)
                });

                drilldownData.push({
                    name: 'FY ' + year + ' Dividend',
                    id: 'FY ' + year,
                    data: val
                })
            });

            var step = Math.round(chartData.common.length / 7);
            console.log(step);
            var chart = Highcharts.chart(o.chart.id, {
                chart: {
                    type: o.chart.type,
                    events: {
                        drilldown: function (e) {
                            chart.xAxis[0].options.labels.step = 1;
                        },
                        drillup: function (e) {
                            chart.xAxis[0].options.labels.step = step;
                        }
                    }
                },
                colors: o.chart.colors,
                lang: {
                    drillUpText: o.chart.drillUpText
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: o.chart.title
                },
                tooltip: {
                    formatter: function () {
                        var price = this.y;
                        var year = this.key;

                        return '<strong>' + this.series.name + '</strong><br/>' + year + ': <strong>' + price.toFixed(4) + '</strong>';
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },
                drilldown: {
                    activeAxisLabelStyle: {
                        color: '#666'
                    },
                    series: drilldownData
                },
                xAxis: {
                    type: "category",
                    labels: {
                        autoRotationLimit: 0,
                        step: step
                    },
                    title: {
                        text: o.chart.xAxisText
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: o.chart.yAxisText
                    }
                },
                series: [{
                    name: o.chart.standardSeriesName,
                    data: chartData.common,
                    color: 'rgb('+ o.chart.color +')',
                }, {
                    name: o.chart.specialSeriesName,
                    data: chartData.special,
                    color: 'rgb('+ o.chart.colorSpecial +')',
                }]
            });
        },

        _buildYear: function (year, dividendData) {
            var inst = this,
                o = inst.options;

            return Mustache.render(o.itemTemplate, {
                year: year,
                items: dividendData[year],
                yearlyDividend: inst._getYearlyDividend(dividendData[year])
            });
        },

        _getYearlyDividend: function (dataByYear) {
            var inst = this,
                o = inst.options,
                yearlyDiv = 0;

            $.each(dataByYear, function (i, data) {
                yearlyDiv = yearlyDiv + parseFloat(data.DividendAmount);
            });

            // IE11 Polyfill
            Number.isInteger = Number.isInteger || function (value) {
                return typeof value === 'number' &&
                    isFinite(value) &&
                    Math.floor(value) === value;
            };

            if (Number.isInteger(yearlyDiv)) {
                return yearlyDiv
            } else {
                return yearlyDiv.toFixed(o.fixedDecimalPoints);
            }
        },

        destroy: function () {
            this.element.html('');
        },

        _setOption: function (option, value) {
            this._superApply(arguments);
        }

    });
})(jQuery);

// required for the range slider
! function (t) {
    var i = function (i, e) {
        var s;
        switch (this.element = t(i), this.picker = t('<div class="irwRangeSlider"><div class="slider-track"><div class="slider-selection bg-primary"></div><div class="slider-handle btn-primary"></div><div class="slider-handle btn-primary"></div></div><div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div></div>').insertBefore(this.element).append(this.element), this.id = this.element.data("slider-id") || e.id, this.id && (this.picker[0].id = this.id), "undefined" != typeof Modernizr && Modernizr.touch && (this.touchCapable = !0), s = this.element.data("slider-tooltip") || e.tooltip, this.tooltip = this.picker.find(".tooltip"), this.tooltipInner = this.tooltip.find("div.tooltip-inner"), this.orientation = this.element.data("slider-orientation") || e.orientation, this.orientation) {
            case "vertical":
                this.picker.addClass("slider-vertical"), this.stylePos = "top", this.mousePos = "pageY", this.sizePos = "offsetHeight", this.tooltip.addClass("right")[0].style.left = "100%";
                break;
            default:
                this.picker.addClass("slider-horizontal").css("width", this.element.outerWidth()), this.orientation = "horizontal", this.stylePos = "left", this.mousePos = "pageX", this.sizePos = "offsetWidth", this.tooltip.addClass("top")[0].style.top = -this.tooltip.outerHeight() - 14 + "px"
        }
        switch (this.min = this.element.data("slider-min") || e.min, this.max = this.element.data("slider-max") || e.max, this.step = this.element.data("slider-step") || e.step, this.value = this.element.data("slider-value") || e.value, this.value[1] && (this.range = !0), this.selection = this.element.data("slider-selection") || e.selection, this.selectionEl = this.picker.find(".slider-selection"), "none" === this.selection && this.selectionEl.addClass("hide"), this.selectionElStyle = this.selectionEl[0].style, this.handle1 = this.picker.find(".slider-handle:first"), this.handle1Stype = this.handle1[0].style, this.handle2 = this.picker.find(".slider-handle:last"), this.handle2Stype = this.handle2[0].style, this.element.data("slider-handle") || e.handle) {
            case "round":
                this.handle1.addClass("round"), this.handle2.addClass("round");
                break;
            case "triangle":
                this.handle1.addClass("triangle"), this.handle2.addClass("triangle")
        }
        this.range ? (this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0])), this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]))) : (this.value = [Math.max(this.min, Math.min(this.max, this.value))], this.handle2.addClass("hide"), this.value[1] = "after" == this.selection ? this.max : this.min), this.diff = this.max - this.min;
        var h = 100 * (this.value[0] - this.min) / this.diff,
            a = 100 * (this.value[1] - this.min) / this.diff,
            o = 100 * this.step / this.diff;
        isNaN(parseInt(h)) && (h = 0), isNaN(parseInt(a)) && (a = 0), this.percentage = [h, a, o], this.offset = this.picker.offset(), this.size = this.picker[0][this.sizePos], this.formater = e.formater, this.layout(), this.touchCapable ? this.picker.on({
            touchstart: t.proxy(this.mousedown, this)
        }) : this.picker.on({
            mousedown: t.proxy(this.mousedown, this)
        }), "show" === s ? this.picker.on({
            mouseenter: t.proxy(this.showTooltip, this),
            mouseleave: t.proxy(this.hideTooltip, this)
        }) : this.tooltip.addClass("hide")
    };
    i.prototype = {
        constructor: i,
        over: !1,
        inDrag: !1,
        showTooltip: function () {
            this.tooltip.addClass("in"), this.over = !0
        },
        hideTooltip: function () {
            !1 === this.inDrag && this.tooltip.removeClass("in"), this.over = !1
        },
        layout: function () {
            this.handle1Stype[this.stylePos] = this.percentage[0] + "%", this.handle2Stype[this.stylePos] = this.percentage[1] + "%", "vertical" == this.orientation ? (this.selectionElStyle.top = Math.min(this.percentage[0], this.percentage[1]) + "%", this.selectionElStyle.height = Math.abs(this.percentage[0] - this.percentage[1]) + "%") : (this.selectionElStyle.left = Math.min(this.percentage[0], this.percentage[1]) + "%", this.selectionElStyle.width = Math.abs(this.percentage[0] - this.percentage[1]) + "%"), this.range ? (this.tooltipInner.text(this.formater(this.value[0]) + " - " + this.formater(this.value[1])), this.tooltip[0].style[this.stylePos] = this.size * (this.percentage[0] + (this.percentage[1] - this.percentage[0]) / 2) / 100 - ("vertical" === this.orientation ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + "px") : (this.tooltipInner.text(this.formater(this.value[0])), this.tooltip[0].style[this.stylePos] = this.size * this.percentage[0] / 100 - ("vertical" === this.orientation ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + "px")
        },
        mousedown: function (i) {
            var e, s, h, a;
            return this.touchCapable && "touchstart" === i.type && (i = i.originalEvent), this.offset = this.picker.offset(), this.size = this.picker[0][this.sizePos], e = this.getPercentage(i), this.range ? (s = Math.abs(this.percentage[0] - e), h = Math.abs(this.percentage[1] - e), this.dragged = s <= h ? 0 : 1) : this.dragged = 0, this.percentage[this.dragged] = e, this.layout(), this.touchCapable ? t(document).on({
                touchmove: t.proxy(this.mousemove, this),
                touchend: t.proxy(this.mouseup, this)
            }) : t(document).on({
                mousemove: t.proxy(this.mousemove, this),
                mouseup: t.proxy(this.mouseup, this)
            }), this.inDrag = !0, a = this.calculateValue(), this.element.trigger({
                type: "slideStart",
                value: a
            }).trigger({
                type: "slide",
                value: a
            }), !1
        },
        mousemove: function (t) {
            var i, e;
            return this.touchCapable && "touchmove" === t.type && (t = t.originalEvent), i = this.getPercentage(t), this.range && (0 === this.dragged && this.percentage[1] < i ? (this.percentage[0] = this.percentage[1], this.dragged = 1) : 1 === this.dragged && this.percentage[0] > i && (this.percentage[1] = this.percentage[0], this.dragged = 0)), this.percentage[this.dragged] = i, this.layout(), e = this.calculateValue(), this.element.trigger({
                type: "slide",
                value: e
            }).data("value", e).prop("value", e), !1
        },
        mouseup: function () {
            this.touchCapable ? t(document).off({
                touchmove: this.mousemove,
                touchend: this.mouseup
            }) : t(document).off({
                mousemove: this.mousemove,
                mouseup: this.mouseup
            }), this.inDrag = !1, 0 == this.over && this.hideTooltip(), this.element;
            var i = this.calculateValue();
            return this.element.trigger({
                type: "slideStop",
                value: i
            }).data("value", i).prop("value", i), !1
        },
        calculateValue: function () {
            var t;
            return this.range ? (t = [this.min + Math.round(this.diff * this.percentage[0] / 100 / this.step) * this.step, this.min + Math.round(this.diff * this.percentage[1] / 100 / this.step) * this.step], this.value = t) : (t = this.min + Math.round(this.diff * this.percentage[0] / 100 / this.step) * this.step, this.value = [t, this.value[1]]), this.layout(), t
        },
        getPercentage: function (t) {
            this.touchCapable && (t = t.touches[0]);
            var i = 100 * (t[this.mousePos] - this.offset[this.stylePos]) / this.size;
            return i = Math.round(i / this.percentage[2]) * this.percentage[2], isNaN(parseInt(i)) && (i = 0), Math.max(0, Math.min(100, i))
        },
        getValue: function () {
            return this.range ? this.value : this.value[0]
        },
        setValue: function (t) {
            this.value = t, this.range ? (this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0])), this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]))) : (this.value = [Math.max(this.min, Math.min(this.max, this.value))], this.handle2.addClass("hide"), this.value[1] = "after" == this.selection ? this.max : this.min), this.diff = this.max - this.min, this.percentage = [100 * (this.value[0] - this.min) / this.diff, 100 * (this.value[1] - this.min) / this.diff, 100 * this.step / this.diff], this.layout()
        }
    }, t.fn.slider = function (e, s) {
        return this.each(function () {
            var h = t(this),
                a = h.data("slider"),
                o = "object" == typeof e && e;
            a || h.data("slider", a = new i(this, t.extend({}, t.fn.slider.defaults, o))), "string" == typeof e && a[e](s)
        })
    }, t.fn.slider.defaults = {
        min: 0,
        max: 10,
        step: 1,
        orientation: "horizontal",
        value: 5,
        selection: "before",
        tooltip: "show",
        handle: "round",
        formater: function (t) {
            return t
        }
    }, t.fn.slider.Constructor = i
}(window.jQuery);