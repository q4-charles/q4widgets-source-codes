(function ($) {
    /**
     * A Highcharts replacement for Ticker Tech style 5-year stock charts.
     * @class q4.ttChart
     * @version 1.3.2
     * @requires [Highstock](lib/highstock.js)
     * @requires [jQuery_UI_Autocomplete_(optional)](#)
     */
    $.widget('q4.ttChart', /** @lends q4.ttChart */ {
        options: {
            /**
             * The base URL of the Q4 website. If the widget is on the same site, this can be blank.
             * @type {string}
             * @example //feeds.q4websystems.com
             */
            url: '',
            /**
             * Whether to use public feeds for data. This requires the `apiKey` option.
             * @type {boolean}
             * @default
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
             * An array of stocks to compare to.
             * Can be a string in the format `EXCHANGE:SYMBOL`, or an object with these properties:
             *
             * - `exchange` The stock exchange.
             * - `symbol`   The stock ticker symbol.
             * - `name`     An optional display name. Defaults to `[exchange]:[symbol]`.
             * @type {Array<string>|Array<object>}
             */
            compareStocks: [],
            /**
             * A list of friendly names for stocks, indexed to their exchange and symbol.
             * @type {Object}
             * @default
             */
            stockNames: {
                'CBOE_INDEX:SPX': 'S&P 500',
                'INDCBSX:SPX': 'S&P 500',
                'DJ_INDEX:$DJI': 'Dow Jones',
                'IND_DJI:DJI': 'Dow Jones',
                'NASD_IND:COMP': 'Nasdaq Composite',
                'IND_GIDS:COMP': 'Nasdaq Composite',
                'Index:RUT': 'Russell 2000'
            },
            /**
             * A selector for one or more form fields for other stocks to compare against.
             * This is only used when redrawing the chart after clicking the `trigger` element.
             * This can be a text field, a dropdown, or a set of checkboxes or radio buttons.
             * Stocks should be in the format `EXCHANGE:SYMBOL`.
             * @type {?string}
             * @example '.compare'
             */
            compareInput: null,
            /**
             * Whether to redraw the chart immediately when the `compareInput` field changes.
             * Otherwise the `trigger` element must be clicked to trigger a redraw.
             * @type {boolean}
             * @default
             */
            compareTriggerOnChange: true,
            /**
             * A selector for a form field for a comparison stock, which will autocomplete using
             * a list of companies from the Q4 API.
             * @type {?string}
             * @example '.customStock'
             */
            autocompleteInput: null,
            /**
             * A token string for the Q4 company API.
             * @type {?string}
             */
            autocompleteToken: '',
            /**
             * A CSS class to add to the widget while autocomplete data is loading.
             * This can be used to show and hide elements within the widget.
             * @type {string}
             * @example 'autocomplete-loading'
             */
            autocompleteLoadingClass: '',
            /**
             * Whether to graph each stock by price, or by % change from the starting date.
             * The change option is useful for comparing multiple stocks.
             * @type {boolean}
             * @default
             */
            chartByChange: false,
            /**
             * A selector for a form field dictating whether to chart by price or by % change.
             * This is only used when redrawing the chart after clicking the `trigger` element.
             * Possible values are `price` or `change`; the default value is `price`.
             * This can be a dropdown, or a set of checkboxes or radio buttons.
             * Since this is a single value, only the last dropdown or checked input
             * matching this selector will be used.
             * @type {?string}
             * @example '.chartBy'
             */
            chartByInput: null,
            /**
             * Whether to redraw the chart immediately when the `chartByInput` field changes.
             * Otherwise the `trigger` element must be clicked to trigger a redraw.
             * @type {boolean}
             * @default
             */
            chartByTriggerOnChange: true,
            /**
             * A selector for a trigger element that will redraw the chart when clicked.
             * @type {?string}
             * @example '.trigger'
             */
            trigger: null,
            /**
             * An optional selector for the stock chart.
             * If not specified, the root element will be used.
             * @type {?string}
             * @example '.chart'
             */
            chartContainer: null,
            /**
             * Whether to show the navigator pane below the chart.
             * @type {boolean}
             * @default
             */
            navigator: false,
            /**
             * Whether to show a tooltip when hovering over the chart.
             * @type {boolean}
             * @default
             */
            tooltip: false,
            /**
             * A set of options to pass directly to Highstock.
             * @type {Object}
             */
            highstockOpts: {},

            ColorArr: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
            AxisColor: 'CCCCCC',
            BottomBuffer: 30,
            BottomTableHeight: 50,
            ChartBackgroundColor: 'FFFFFF',
            CustomCss: '',
            FillColor: '004973',
            FillColor2: '004973',
            FontFace: 'Arial',
            FontSize: 9,
            GridBackgroundColor: 'FFFFFF',
            GridColor: 'EEEEEE',
            Height: 300,
            IndiceOverride: '',
            InteractiveChart: true,
            LabelColor: '000000',
            LabelSide: 'right',
            LeftBuffer: 20,
            LineColors: '004973',
            LineThicknesses: 1,
            LookupOverride: 'indices',
            OffTabColor: 'FFFFFF',
            Period: '1y',
            RightBuffer: 50,
            ShowLegendTable: 'no',
            ShowVolumeTable: 'yes',
            TabLinkColor: '000000',
            TabRollColor: '000000',
            Type: 'mtn',
            VolumeColor: '004973',
            Width: 500,
        },

        chart: null,

        stockRegex: /^(\S+):(\S+)$/,

        exchangeNames: {
            XNAS: 'NASDAQ',
            XNYS: 'NYSE',
            XTSE: 'TSX',
            XTSX: 'TSX-V'
        },

        exchangeCodes: {
            'NASDAQ': 'XNAS',
            'NYSE': 'XNYS',
            'TSX': 'XTSE',
            'TSX-V': 'XTSX'
        },

        // Hide some features if the main chart's plot height is less than this.
        smallChartCutoff: 120,
        smallChart: false,

        navigatorHeight: 40,
        navigatorMargin: 10,

        ranges: {
            '5y': 5 * 365 * 24 * 60 * 60 * 1000,
            '1y': 365 * 24 * 60 * 60 * 1000,
            '1q': 3 * 30 * 24 * 60 * 60 * 1000,
            '1m': 30 * 24 * 60 * 60 * 1000
        },

        highchartsOpts: {
            lang: {
                rangeSelectorZoom: ''
            }
        },

        _init: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            $e.addClass(o.CustomCss);

            //$e.width(o.Width);
            //$e.height(o.Height);

            // Use a custom exchange/symbol if the override option was passed.
            if (o.IndiceOverride && typeof o.IndiceOverride === 'string') {
                var m = o.IndiceOverride.match(this.stockRegex);
                if (m.length == 2) {
                    o.exchange = m[1];
                    o.symbol = m[2];
                }
            }

            // Draw the chart right away.
            this.drawChart();

            // Set up the autocomplete comparison input.
            this._setupAutocomplete();

            // If a form trigger was specified, set up the event.
            $(o.trigger, $e).click(function (e) {
                e.preventDefault();
                // Update options from form data, then redraw.
                var form = _._getFormData();
                $.extend(o, form);
                // If there are comparison stocks, force charting by % change.
                if (form.compareStocks && form.compareStocks.length) {
                    o.chartByChange = true;
                }
                _.chart.showLoading();
                _.drawChart();
            });

            // If the chartBy input is set to trigger a redraw on change, set up the event.
            if (o.chartByTriggerOnChange) {
                $(o.chartByInput, $e).change(function () {
                    // Get form data and update the compare setting.
                    var form = _._getFormData();
                    if (form.chartByChange !== undefined) {
                        o.chartByChange = form.chartByChange;
                        _.chart.yAxis[0].setCompare(form.chartByChange ? 'percent' : null);
                    }
                });
            }

            if (o.compareTriggerOnChange) {
                $(o.compareInput, $e).change(function () {
                    var form = _._getFormData();
                    o.compareStocks = form.compareStocks;
                    // If there are comparison stocks, force charting by % change.
                    if (form.compareStocks && form.compareStocks.length) {
                        o.chartByChange = true;
                    }
                    _.chart.showLoading();
                    // TODO: add series dynamically instead of redrawing the whole chart
                    _.drawChart();
                });
            }
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

                        if (!Array.isArray(data)) {
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
                form = {};

            // Look for whether to chart by price or % change.
            if (o.chartByInput) {
                $(o.chartByInput, $e).each(function () {
                    var inputType = $(this).attr('type'),
                        tagName = $(this).prop('tagName').toLowerCase();

                    // Look for checkboxes, radio buttons and dropdowns.
                    // Since this is a boolean, only the last checked input found will be used.
                    if (($.inArray(inputType, ['checkbox', 'radio']) > -1 &&
                            $(this).is(':checked')) ||
                            tagName == 'select') {
                        if ($(this).val() == 'change') form.chartByChange = true;
                        if ($(this).val() == 'price') form.chartByChange = false;
                    }
                });
            }

            // Look for comparison stocks.
            if (o.compareInput) {
                form.compareStocks = [];
                $(o.compareInput, $e).each(function () {
                    var inputType = $(this).attr('type'),
                        tagName = $(this).prop('tagName').toLowerCase();

                    // Look for checkboxes, radio buttons, text fields and dropdowns.
                    if (($.inArray(inputType, ['checkbox', 'radio']) > -1 && $(this).is(':checked')) ||
                            inputType == 'text' || tagName == 'select') {
                        form.compareStocks.push($(this).val());
                    }
                });
            }

            return form;
        },

        drawChart: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            var stock = this._formatStock(o.exchange, o.symbol);

            var startDate = new Date(),
                endDate = new Date();
            // Set the start date back 5 years from today.
            startDate.setFullYear(startDate.getFullYear() - 5);
            // Add an extra few days to make sure Highcharts doesn't grey out the 5y nav option.
            startDate.setDate(startDate.getDate() - 7);

            // Format comparison stocks array.
            var compareStocks = o.compareStocks || [];
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

            // Build a list of promises from AJAX calls.
            // At the same time, filter out invalid values from compareStocks.
            var fetchPromises = [
                this._fetchStockQuotes(stock.exchange, stock.symbol, startDate, endDate)];
            compareStocks = $.grep(compareStocks, function (stock) {
                if (stock) {
                    fetchPromises.push(
                        _._fetchStockQuotes(stock.exchange, stock.symbol, startDate, endDate));
                    return true;
                }
            });

            // Fetch all stock quotes.
            $.when.apply(null, fetchPromises).done(function () {
                _.allQuotes = Array.prototype.slice.call(arguments);

                // Filter out comparison stocks with no results.
                compareStocks = $.grep(compareStocks, function (stock, i) {
                    return _.allQuotes[i + 1].length > 0;
                });

                _.smallChart = _.smallChartCutoff > (o.Height - o.BottomBuffer -
                    (o.ShowVolumeTable === 'yes' ? o.BottomTableHeight : 0));

                // Build chart series.
                var series = [_._getPriceSeries(stock.name, _.allQuotes[0], true)];
                $.each(compareStocks, function (i, stock) {
                    series.push(_._getPriceSeries(stock.name, _.allQuotes[i + 1]));
                });
                if (o.ShowVolumeTable === 'yes' && !_.smallChart) {
                    series.push(_._getVolumeSeries(_.allQuotes[0]));
                }

                // Build chart options.
                var options = _._getChartOptions();
                options.series = series;
                // Enable legend if there are comparison series.
                if (compareStocks.length) {
                    options.legend.enabled = true;
                }
                // Override with options passed directly to the widget.
                $.extend(options, o.highstockOpts);

                // Render.
                Highcharts.setOptions(_.highchartsOpts);
                var $container = o.chartContainer ? $(o.chartContainer, $e) : $e;
                if (_.chart) {
                    _.chart.hideLoading();
                }
                _.chart = $container.highcharts('StockChart', options).highcharts();

                // Update the chartBy form field to match the current option.
                $(o.chartByInput, $e).each(function () {
                    var inputType = $(this).attr('type'),
                        tagName = $(this).prop('tagName').toLowerCase();

                    if ($.inArray(inputType, ['checkbox', 'radio']) > -1) {
                        if ($(this).val() == 'price') $(this).prop('checked', !o.chartByChange);
                        if ($(this).val() == 'change') $(this).prop('checked', o.chartByChange);
                    }
                    if (tagName == 'select') $(this).val(o.chartByChange ? 'change' : 'price');
                });
            });
        },

        _formatStock: function (exchange, symbol) {
            var o = this.options;

            if (!exchange || !symbol) return;

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

        _fetchStockQuotes: function (exchange, symbol, startDate, endDate) {
            var o = this.options,
                promise = $.Deferred(),
                apiCall;

            // fetch raw data from either the public or private API
            if (o.usePublic) {
                apiCall = $.ajax({
                    type: 'GET',
                    url: o.url + '/feed/StockQuote.svc/GetStockQuoteHistoricalList',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: {
                        apiKey: o.apiKey,
                        exchange: exchange,
                        symbol: symbol,
                        startDate: $.datepicker.formatDate('M-dd-yy', startDate),
                        endDate: $.datepicker.formatDate('M-dd-yy', endDate)
                    }
                });
            }
            else {
                apiCall = $.ajax({
                    type: 'POST',
                    url: o.url + '/Services/StockQuoteService.svc/GetStockQuoteHistoricalList',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify({
                        exchange: exchange,
                        symbol: symbol,
                        startDate: '/Date(' + startDate.getTime() + ')/',
                        endDate: '/Date(' + endDate.getTime() + ')/',
                        serviceDto: {
                            ViewType: GetViewType(),
                            ViewDate: GetViewDate(),
                            RevisionNumber: GetRevisionNumber(),
                            LanguageId: GetLanguageId(),
                            Signature: GetSignature()
                        }
                    })
                });
            }

            apiCall
                .fail(function (jqxhr, status, message) {
                    console.error('Error fetching stock data: ' + message);
                    promise.resolve(null);
                })
                .done(function (stockData) {
                    promise.resolve(
                        // parse the stock quote data
                        $.map(stockData.GetStockQuoteHistoricalListResult.reverse(), function (quote, i) {
                            return {
                                date: new Date(quote.HistoricalDate).getTime(),
                                price: quote.Last,
                                volume: quote.Volume
                            };
                        })
                    );
                });
            return promise;
        },

        _getPriceSeries: function (name, quotes, isPrimary) {
            var _ = this,
                o = this.options,
                types = {
                    mtn: 'area',
                    line: 'line',
                    point: 'point',
                    column: 'column',
                    candle: 'candlestick'
                };

            return {
                type: isPrimary ? (types[o.Type] || 'area') : 'line',
                name: name,
                id: 'stock',
                color: isPrimary ? '#' + o.LineColors : null,
                fillColor: '#' + o.FillColor,
                lineWidth: o.LineThicknesses,
                negativeFillColor: '#' + o.FillColor2,
                states: {
                    hover: {
                        lineWidth: o.LineThicknesses
                    }
                },
                threshold: null,
                turboThreshold: 0,
                yAxis: 0,
                compare: o.chartByChange ? 'percent' : null,
                data: $.map(quotes, function (quote) {
                    return {
                        x: quote.date,
                        y: quote.price
                    };
                })
            };
        },

        _getVolumeSeries: function (quotes) {
            var _ = this,
                o = this.options;

            return {
                name: 'Volume',
                id: 'volume',
                type: 'column',
                color: '#' + o.VolumeColor,
                turboThreshold: 0,
                showInLegend: false,
                yAxis: 1,
                data: $.map(quotes, function (quote) {
                    return {
                        x: quote.date,
                        y: quote.volume
                    };
                })
            };
        },

        _addCommas: function (val) {
            val = '' + val;
            var rgx = /^(\d+)(\d{3})/;
            while (rgx.test(val)) {
                val = val.replace(rgx, '$1,$2');
            }
            return val;
        },

        _getChartOptions: function () {
            var _ = this,
                o = this.options;

            return $.extend({
                chart: {
                    backgroundColor: '#' + o.ChartBackgroundColor,
                    height: o.Height,
                    ignoreHiddenSeries: false,
                    panning: false,
                    plotBackgroundColor: '#' + o.GridBackgroundColor,
                    spacingBottom: o.BottomBuffer + (o.ShowVolumeTable === 'yes' && !this.smallChart & !o.navigator ? o.BottomTableHeight : 0),
                    spacingLeft: o.LeftBuffer,
                    spacingRight: o.RightBuffer,
                    spacingTop: 0,
                    width: o.Width
                },
                colors: o.ColorArr,
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: o.ShowLegendTable === 'yes' && !this.smallChart,
                    floating: true,
                    verticalAlign: 'top',
                    y: o.InteractiveChart ? 30 : 0 // move down if rangeSelector is enabled
                },
                navigator: {
                    adaptToUpdatedData: false,
                    enabled: o.navigator && !this.smallChart && o.InteractiveChart,
                    height: this.navigatorHeight,
                    margin: (o.ShowVolumeTable === 'yes' && !this.smallChart ? o.BottomTableHeight : 0) + this.navigatorMargin,
                    xAxis: {
                        tickInterval: 365 * 24 * 60 * 60 * 1000
                    }
                },
                plotOptions: {
                    series: {
                        dataGrouping: {
                            enabled: false
                        },
                        enableMouseTracking: o.tooltip
                    }
                },
                rangeSelector: {
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1 Month'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '1 Quarter'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1 Year'
                    }, {
                        type: 'year',
                        count: 5,
                        text: '5 Years'
                    }],
                    buttonTheme: {
                        fill: '#' + o.OffTabColor,
                        stroke: 'none',
                        'stroke-width': 0,
                        width: 75,
                        height: 14,
                        r: 0,
                        style: {
                            padding: '0 5px',
                            color: '#' + o.TabLinkColor,
                            fontFace: o.FontFace
                        },
                        states: {
                            hover: {
                                fill: '#fff',
                                style: {
                                    color: '#' + o.TabRollColor,
                                    fontWeight: 'normal'
                                }
                            },
                            select: {
                                fill: '#' + o.TabLinkColor,
                                style: {
                                    color: '#fff',
                                    fontWeight: 'normal'
                                }
                            }
                        }
                    },
                    enabled: o.InteractiveChart && !this.smallChart,
                    inputEnabled: false,
                    selected: $.inArray(o.Period, ['1m', '1q', '1y', '5y'])
                },
                scrollbar: {
                    enabled: false,
                    // liveRedraw: false
                },
                title: {
                    text: null
                },
                tooltip: {
                    dateTimeLabelFormats: {
                        minute: '%A, %b %e, %Y',
                        hour: '%A, %b %e, %Y'
                    },
                    enabled: o.tooltip,
                    pointFormatter: function () {
                        var value = this.y;
                        if (this.series.name != 'Volume') {
                            // Fix dollar amounts to two decimal places
                            value = value.toFixed(2);
                        }
                        return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>' + _._addCommas(value) + '</b><br/>';
                    }
                },
                yAxis: [
                    this._getStockAxis(),
                    this._getVolumeAxis()
                ],
                xAxis: {
                    align: 'center',
                    dateTimeLabelFormats: {
                        day: '%b %e',
                        week: '%b %e',
                        month: '%b \'%y',
                        year: '%Y'
                    },
                    gridLineColor: '#' + o.GridColor,
                    gridLineWidth: 1,
                    labels: {
                        style: {
                            color: '#' + o.LabelColor,
                            fontSize: o.FontSize + 'px',
                            fontFace: o.FontFace,
                            lineHeight: o.FontSize + 'px'
                        },
                        rotation: 0
                    },
                    lineColor: '#' + o.AxisColor,
                    range: this.ranges[o.Period],
                    tickLength: 5,
                    type: 'datetime'
                }
            }, o.highchartsOpts);
        },

        _getStockAxis: function () {
            var o = this.options;

            return {
                labels: {
                    align: 'left',
                    formatter: function () {
                        return this.value + (o.chartByChange ? '%' : '');
                    },
                    style: {
                        color: '#' + o.LabelColor,
                        fontSize: o.FontSize + 'px',
                        fontFace: o.FontFace,
                        lineHeight: o.FontSize + 'px'
                    }
                },
                title: {
                    text: null
                },
                gridLineColor: '#' + o.GridColor,
                gridLineWidth: 1,
                gridZIndex: 2,
                lineColor: '#' + o.AxisColor,
                opposite: (o.LabelSide === 'right')
            };
        },

        _getVolumeAxis: function () {
            var o = this.options;

            if (o.ShowVolumeTable === 'no' || this.smallChart) return {};

            return {
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
                top: o.Height - o.BottomTableHeight - o.BottomBuffer - (o.navigator ? this.navigatorHeight + this.navigatorMargin : 0),
                height: o.BottomTableHeight,
                offset: 0,
                lineWidth: 0,
                gridLineWidth: 0,
                maxPadding: 0,
                opposite: false
            };
        }
    });
})(jQuery);
