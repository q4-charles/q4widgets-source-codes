(function($) {
    /**
     * Add a dividends table to your website
     * @class q4.dividends
     * @version 1.3.0
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [Highcharts.js(optional)](lib/highcharts-7.1.2.min.js)
     * @requires [Highcharts-Drilldown.js(optional)](lib/highcharts_drilldown-7.1.2.min.js)
     *
     **/
    $.widget("q4.dividends", /** @lends q4.dividends */ {
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
            dateFormat: 'mm/dd/yy',
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
            itemNotFoundMessage: '<p><i class="q4-icon_warning-line"></i> No dividends found.</p>',
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
            fixedDecimalPoints: 2,
            /**
             * If set to true, a Highchart will be rendered to the `chartContainer`.
             * @type {boolean}
             * @default false
             */
            renderChart: false,
            /**
             * Basic chart configuration options
             * @type {object}
             * @default ''
             */
            chart: {
                id: 'chart',
                color: '66, 139, 202',
                title: 'Common Equity Dividends',
                type: 'column',
                xAxisText: 'Payout Period/Date',
                yAxisText: 'Actual Dividend Paid',
                seriesName: 'Common Equity Dividend ($)',
                drillUpText: "◁"
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

        _create: function() {
            var inst = this, o = inst.options;

            inst.element.addClass(o.loadingClass);

            if (o.itemContainer) {
                inst.element.find(o.itemContainer).html(o.itemLoadingMessage);
            } else {
                inst.element.html(o.loadingMessage);
            }

            if ( o.stock.length ) {
                inst._getDividends();
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
                    Signature: GetSignature()
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
                    $.extend( inst._buildParams() , {
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

                    inst._getDividends();
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

        _getDividends: function(ticker){
            var inst = this, o = inst.options, dividend,
                useStock = o.stock[0],
                useExchange = useStock.split(':')[0],
                useSymbol = useStock.split(':')[1];

            if (o.usePublic) {
                dividend = inst._getData( o.url + '/feed/StockQuote.svc/GetDividendList', {
                    exchange: useExchange,
                    symbol: useSymbol,
                    apiKey: o.apiKey,
                    pageSize: o.pageSize
                });
            } else {
                dividend = inst._getData( '/services/StockQuoteService.svc/GetDividendList',
                    $.extend(inst._buildParams(), {
                        exchange: useExchange,
                        symbol: useSymbol
                    })
                );
            }

            dividend.done(function(data) {

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

                    $.each(dividendData, function(i, divData){
                        var item = {
                            Code: divData.Code,
                            Currency: divData.Currency,
                            DeclaredDate: $.datepicker.formatDate(o.dateFormat, new Date(divData.DeclaredDate)),
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

                            if ( dividends[year] === undefined) {
                                dividends[year] = []
                            }

                            dividends[year].push(item);
                        } else {
                            dividends.push(item);
                        }
                    });
                    inst._trigger('beforeRender', null, {items: dividends});
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

        _buildDividends: function(dividendData) {
            var inst = this,
                o = inst.options;

            if (o.itemContainer) {
                if (o.yearSelect) {
                    $.each(dividendData, function(i, dataByYear) {
                        $(o.yearSelect).prepend(Mustache.render(o.yearTemplate, {
                            year: i
                        }));
                    });
                    // o.startYear = o.startYear ? o.startYear :
                    $(o.yearSelect).val(o.startYear).on('change', function() {
                        inst.element.find(o.itemContainer).html(inst._buildYear($(this).val(), dividendData));
                        inst._trigger('itemsComplete');
                    });
                    inst.element.find(o.itemContainer).html(inst._buildYear(o.startYear, dividendData));
                    inst._trigger('itemsComplete');
                } else {
                    var dividendHTML = '';
                    $.each(dividendData, function(i, dataByYear) {
                        dividendHTML += inst._buildYear(i, dividendData);
                    });
                    inst.element.find(o.itemContainer).html(dividendHTML);
                }
            } else {
                inst.element.html(Mustache.render(o.template, {
                    items: dividendData
                }));
            }

            inst.element.removeClass(o.loadingClass);
            inst._trigger('complete');
        },

        _formatChartData: function(dividendData) {
            var inst = this;

            var data = $.map(dividendData, function(n) {
                var date = n.ExDate.split(' ')[0];
                return {
                    year: parseInt(date.split('/').pop(), 10),
                    date: date,
                    value: n.DividendAmount
                }
            });

            var reducedData = data.reduce(function (r, a) {
                r[a.year] = r[a.year] || [];
                r[a.year].push({
                    y:a.value,
                    name: a.date
                });
                return r;
            }, Object.create(null));

            inst._buildChart(reducedData);
        },

        _buildChart: function(data) {
            var inst = this;
            var o = inst.options;
            var chartData = [];
            var drilldownData = [];
            var currentYear = new Date().getFullYear().toString();

            $.each(data, function(year, val){
                chartData.push({
                    name: 'FY '+ year,
                    drilldown: 'FY '+ year,
                    color: currentYear === year ? 'rgba(' + o.chart.color + ', 0.50)' : 'rgba(' + o.chart.color + ', 1)',
                    y: val.reduce(function (accumulator, currentValue) {
                        return accumulator + currentValue.y;
                    }, 0)
                });

                drilldownData.push({
                    name: 'FY '+ year + o.chart.seriesName,
                    id: 'FY '+ year,
                    data: val
                })
            });

            var step = Math.round(chartData.length / 7);
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
                    name: o.chart.seriesName,
                    data: chartData
                }]
            });
        },

        _buildYear: function(year, dividendData) {
            var inst = this,
                o = inst.options;

            return Mustache.render(o.itemTemplate, {
                year: year,
                items: dividendData[year],
                yearlyDividend: inst._getYearlyDividend(dividendData[year])
            });
        },

        _getYearlyDividend: function(dataByYear) {
            var inst = this,
                o = inst.options,
                yearlyDiv = 0;

            $.each(dataByYear, function( i, data){
                yearlyDiv = yearlyDiv + parseFloat(data.DividendAmount);
            });

            // IE11 Polyfill
            Number.isInteger = Number.isInteger || function(value) {
              return typeof value === 'number' &&
                isFinite(value) &&
                Math.floor(value) === value;
            };

            if( Number.isInteger( yearlyDiv ) ){
                return yearlyDiv
            } else {
                return yearlyDiv.toFixed(o.fixedDecimalPoints);
            }
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }

    });
})(jQuery);
