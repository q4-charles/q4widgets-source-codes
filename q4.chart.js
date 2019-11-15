(function($) {
    /**
     * A preconfigured stock chart, using the Highstock plugin.
     * @class q4.chart
     * @version 1.3.7
     * @requires [Highstock](lib/highstock.4.2.7.min.js)
     */
    $.widget('q4.chart', /** @lends q4.chart */ {
        options: {
            /**
             * The base URL of the Q4 website.
             * @type {string}
             * @example //feeds.q4websystems.com
             */
            url: '',
            /**
             * Whether to use the public feed (true) or the private API (false).
             * @type {boolean}
             * @default
             */
            usePublic: false,
            /**
             * If `usePublic` is `true`, the API key to use for public feeds.
             * @type {string}
             */
            apiKey: '',
            /**
             * A number representing which language to pull data from.
             * By default it auto detects language.
             * @default
             */
            languageId: null,
            /**
             * An array of stock symbols to use on the stock price chart.
             * Each symbol can be a string of the format "EXCHANGE:SYMBOL",
             * or an array containing "EXCHANGE:SYMBOL" and a custom
             * display name.
             * @type {(string|Array<string>)}
             * @example 'NYSE:XXX'
             * @example [['NYSE:XXX', 'NYSE: TEST.XXX']] or [['NYSE:XXX', 'NYSE: TEST.XXX'],['NYSE:YYY','TESTING']] for two indices
             */
            stocks: [],
            /**
             * Whether to prevent stock price charts from being toggled off.
             * @type {boolean}
             * @default
             */
            lockStock: false,
            /**
             * Whether to show the legend.
             * @type {boolean}
             * @default
             */
            legend: true,
            /**
             * Whether to use jQuery datepicker
             * @type {boolean}
             * @default
             */
            useDatepicker: true,
            /**
             * Use to determine when data should populate the chart. By default, it'll use the first data point in historical list.
             * @type {number}
             * @example startDate: new Date("05/22/2013").getTime()
             * @default
             */
            startDate: null,
            /**
             * A set of options to pass directly to the datepicker constructor, it will extend/overwrite the existing default options.
             * @type {Object}
             */
            datepickerOpts: {},
            /**
             * Whether to show the stock quote in the chart legend.
             * @type {boolean}
             * @default
             */
            showSymbolInLegend: true,
            /**
             * The maximum number of data points to fetch for the stock chart.
             * @type {number}
             * @default
             */
            stockLimit: 1500,
            /**
             * Whether to include a volume chart below the stock price chart.
             * @type {boolean}
             * @default
             */
            volume: false,
            /**
             * The height of the volume chart, as a percentage.
             * @type {number}
             * @default
             */
            volumeHeight: null,
            /**
             * Whether to include a series of flags for press releases.
             * @type {boolean}
             * @default
             */
            news: true,
            /**
             * Color used to fill the news dots
             * @type {sting}
             * @default
             */
            newsColor: '#006fba',
            newsBorderColor: '#006fba',
            /**
             * If `news` is true, whether to show news flags on initial load.
             * @type {boolean}
             * @default
             */
            newsOnLoad: false,
            /**
             * If `news` is true, the maximum number of news items to display.
             * @type {number}
             * @default
             */
            newsLimit: 200,
            /**
             * If `news` is true, the maximum length of each news headline.
             * @type {number}
             * @default
             */
            newsLength: 75,
            /**
             * If `news` is true, the news category ID to use.
             * The default is to load all categories.
             * @type {string}
             * @default
             */
            newsCategory: '1cb807d2-208f-4bc3-9133-6a9ad45ac3b0',
            /**
             * If `news` is true, an array of tags to filter news releases by.
             * @type {Array<string>}
             */
            newsTags: [],
            /**
             * Whether to include a series of flags for events.
             * @type {boolean}
             * @default
             */
            events: false,
            /**
             * If `events` is true, whether to show event flags on initial load.
             * @type {boolean}
             * @default
             */
            eventsOnLoad: false,
            /**
             * If `events` is true, the maximum number of events to display.
             * @type {number}
             * @default
             */
            eventsLimit: 100,
            /**
             * If `events` is true, an array of tags to filter events by.
             * @type {Array<string>}
             */
            eventsTags: [],
            /**
             * A set of Highstock options for the stock price series.
             * @type {Object}
             */
            stockOpts: {},
            /**
             * A set of Highstock options for the volume series.
             * @type {Object}
             */
            volumeOpts: {},
            /**
             * A set of Highstock options for the press release series.
             * @type {Object}
             */
            newsOpts: {},
            /**
             * A set of Highstock options for the event series.
             * @type {Object}
             */
            eventsOpts: {},
            /**
             * A set of Highstock options for the chart in general.
             * You can configure the individual chart series with
             * `stockOpts`, `volumeOpts`, `newsOpts` and `eventsOpts`.
             * @type {Object}
             */
            highstockOpts: {},
            /**
             * A set of (non-Highstock) Highcharts options.
             * @type {Object}
             */
            highchartsOpts: {},
            /**
             * Append a static table for accessibility
             * @type {Boolean}
             */
            appendTable: false,
            /**
             * A message or HTML string to display if there is no stock data for current exchange/symbol.
             */
            noDataTpl: 'There is currently no stock data for current exchange/symbol, please check back later.',
            /**
             * A callback that is fired after the chart is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            onComplete: function() {}
        },

        startDate: null,
        chart: null,

        _setDefaults: function() {
            var _ = this,
                o = this.options;

            // general Highcharts options
            this.highchartsDefaults = {
                global: {
                    useUTC: false
                }
            };

            // general Highstock options for the constructor
            this.highstockDefaults = {
                colors: ['#006fba'],
                chart: {
                    height: 450,
                    marginTop: o.legend ? 60 : 0,
                    backgroundColor: 'transparent'
                },
                legend: {
                    enabled: o.legend,
                    borderRadius: 3,
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    align: 'left',
                    verticalAlign: 'top',
                    floating: true,
                    itemStyle: {
                        color: '#333'
                    },
                },
                rangeSelector: {
                    enabled: true,
                    selected: 1
                },
                xAxis: {
                    gridLineColor: "rgba(0, 0, 0, 0.1)",
                    lineColor: 'transparent'
                },
                yAxis: {
                    gridLineColor: "rgba(0, 0, 0, 0.1)",
                    lineColor: 'transparent',
                    labels: {
                        y: -2
                    }
                },
                scrollbar: {
                    barBackgroundColor: '#006fba',
                    barBorderWidth: 1,
                    barBorderColor: '#006fba',
                    buttonBackgroundColor: "rgba(0, 0, 0, 0.1)",
                    rifleColor: '#fff',
                    buttonBorderWidth: 0,
                    trackBorderColor: '#006fba',
                    trackBorderWidth: 0
                },
                navigator: {
                    outlineColor: "rgba(0, 0, 0, 0.1)",
                    outlineWidth: 1,
                    maskFill: "rgba(0, 111, 186, 0.65)",
                    series: {
                        type: 'spline',
                        fillOpacity: 0.05,
                        lineWidth: 1,
                        marker: {
                            enabled: false
                        }
                    }
                },
                credits: {
                    enabled: false
                }
            };

            // options for each stock quote series
            this.stockDefaults = {
                type: 'spline',
                showInLegend: o.showSymbolInLegend,
                turboThreshold: 0,
                tooltip: {
                    valueDecimals: 2
                },
                events: {
                    legendItemClick: function(e) {
                        if (this.name == o.stocks[0]) {
                            return false;
                        } else {
                            _._toggleStock(this);
                        }
                    }
                }
            };

            // options for each stock quote's volume series
            this.volumeDefaults = {
                type: 'column',
                turboThreshold: 0,
                showInLegend: false,
                yAxis: 1
            };

            // options for news flags
            this.newsDefaults = {
                type: 'flags',
                name: 'News Releases',
                id: 'news',
                onSeries: 'price0',
                shape: 'circlepin',
                fillColor: o.newsColor,
                color: o.newsBorderColor,
                width: 3,
                height: 3,
                y: -20,
                turboThreshold: 0,
                visible: o.newsOnLoad,
                point: {
                    events: {
                        click: function() {
                            if ((this.url).indexOf('.aspx') > -1) window.location = this.url;
                            else window.open(this.url, '_blank');
                        }
                    }
                },
                events: {
                    legendItemClick: function() {
                        _._toggleFlags(this);
                    }
                }
            };

            // options for event flags
            this.eventsDefaults = {
                type: 'flags',
                name: 'Events',
                id: 'events',
                onSeries: 'price0',
                shape: 'circlepin',
                width: 3,
                height: 3,
                y: -25,
                turboThreshold: 0,
                visible: o.eventsOnLoad,
                point: {
                    events: {
                        click: function() {
                            // open event url on click
                            window.location = this.url;
                        }
                    }
                },
                events: {
                    legendItemClick: function() {
                        _._toggleFlags(this);
                    }
                }
            };
        },

        _create: function() {
            var _ = this,
                o = this.options,
                $e = this.element;

            // strip trailing slash from domain
            o.url = o.url.replace(/\/$/, '');

            if (o.stocks.length) {
                _._setIndice(o.stocks[0]);
            } else {
                _._getStockIndice().done(function(indices) {
                    $.each(indices.GetLookupListResult, function(i, ticker) {
                        o.stocks.push([ticker.Value, ticker.Text]);
                    });

                    _._setIndice(o.stocks[0]);
                });
            }
        },

        _setIndice: function(indice) {
            var _ = this,
                o = _.options,
                $e = this.element;

            _._getStockData(indice).done(function(data) {
                if (!data.GetStockQuoteHistoricalListResult.length) {
                    $e.html(o.noDataTpl);
                    return;
                }

                if (o.appendTable) {
                    _._buildStockTable(indice, data);
                }

                _._initChart(data);
            });
        },

        _initChart: function(data) {
            var _ = this,
                o = this.options,
                $e = this.element,
                stockStartDate = this.startDate;

            // this should be a 2-tuple of stock price and volume data
            var stockData = this._parseStockData(data);

            // initialize and set options
            this._setDefaults();
            Highcharts.setOptions($.extend(true, {}, this.highchartsDefaults, o.highchartsOpts));
            var highstockOpts = $.extend(true, {}, this.highstockDefaults, o.highstockOpts);

            // build the series objects for stock price, volume, news, events
            highstockOpts.series = this._buildSeries();

            // add the first symbol's stock price data as the first series
            highstockOpts.series[0].data = stockData[0];
            if (o.volume) {
                // add the first symbol's volume data as the second series
                highstockOpts.series[1].data = stockData[1];
                // add a second y-axis
                highstockOpts.yAxis = [highstockOpts.yAxis || {}, {}];
            }

            // initialize Highstock
            this.chart = $e.highcharts('StockChart', highstockOpts).highcharts();

            if (o.volume && o.volumeHeight !== null) {
                // rescale the volume y-axis according to volumeHeight
                var minmax = this.chart.yAxis[1].getExtremes();
                this.chart.yAxis[1].setExtremes(0, minmax.max * 100 / o.volumeHeight, true, false);
            }
            // if enabled, request news/events data after the chart loads
            if (o.news && o.newsOnLoad) {
                this._getNewsData().done(function(data) {
                    _.chart.get('news').setData(_._parseNewsData(data));
                });
            }
            if (o.events && o.eventsOnLoad) {
                this._getEventsData().done(function(data) {
                    _.chart.get('events').setData(_._parseEventsData(data));
                });
            }

            if (o.useDatepicker) {

                // Create individual datepicker instance for each date inputs
                $e.find('input.highcharts-range-selector').each(function() {
                    var defaults = $.extend(true, {
                        dateFormat: 'yy-mm-dd',
                        changeMonth: true,
                        changeYear: true,
                        constrainInput: true,
                        maxDate: '-1d',
                        minDate: o.startDate === null ? new Date(stockStartDate) : new Date(o.startDate),
                        yearRange: o.startDate === null ? new Date(stockStartDate).getFullYear() + ":" + new Date().getFullYear() : new Date(o.startDate).getFullYear() + ":" + new Date().getFullYear(),
                        // Prevents highstock date range from resetting to default values when calendar date is picked.
                        onSelect: function(dateText) {
                            if ( $(this).closest($e).length ) {
                                $e.highcharts().xAxis[0].setExtremes($e.find('input.highcharts-range-selector:eq(0)').datepicker("getDate").getTime(), $e.find('input.highcharts-range-selector:eq(1)').datepicker("getDate").getTime());
                            }
                        }
                    }, o.datepickerOpts);

                    $(this).datepicker(defaults);
                })

                $e.on('keypress', 'input[type="text"]', function(e) {
                    if (e.keyCode == 13) {
                        $(this).blur();
                        return false;
                    }
                });
            }

            // add aria labels for inputs
            $e.find('input.highcharts-range-selector').each(function() {
                $(this).attr('aria-label', $(this).attr('name') + ' date');
            });

            // callback after chart loads
            this._trigger('onComplete');
        },

        _buildSeries: function() {
            var _ = this,
                o = _.options,
                series = [];

            // build stock series without data
            $.each(o.stocks, function(i, stock) {
                if (typeof stock === 'string') stock = [stock];

                var exsymbol = stock.length > 1 ? stock[1].split(':') : stock[0].split(':'),
                    exchange = exsymbol[0],
                    symbol = exsymbol[1],
                    name = stock.length > 1 && stock[1] ? stock[1] : stock[0];

                // stock price series
                series.push($.extend(true, {}, _.stockDefaults, {
                    name: name,
                    id: 'price' + i,
                    visible: i == 0,
                }, o.stockOpts));

                // volume series
                if (o.volume) series.push($.extend(true, {}, _.volumeDefaults, {
                    name: exchange + ':Volume',
                    id: 'volume' + i
                }, o.volumeOpts));
            });

            // news series
            if (o.news) series.push($.extend(true, {}, this.newsDefaults, o.newsOpts));

            // events series
            if (o.events) series.push($.extend(true, {}, this.eventsDefaults, o.eventsOpts));

            return series;
        },

        _getStockIndice: function(stock) {
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

        _getStockData: function(stock) {
            var o = this.options;

            if (typeof stock === 'string') stock = [stock];
            var exsymbol = stock[0].split(':');

            if (o.usePublic) {
                return this._getData(
                    '/feed/StockQuote.svc/GetStockQuoteHistoricalList', {
                        exchange: exsymbol[0],
                        symbol: exsymbol[1]
                    },
                    o.stockLimit
                );
            } else {
                return this._getData(
                    '/Services/StockQuoteService.svc/GetStockQuoteHistoricalList', {
                        exchange: exsymbol[0],
                        symbol: exsymbol[1]
                    },
                    o.stockLimit
                );
            }
        },

        _getNewsData: function() {
            var o = this.options;

            if (o.usePublic) {
                return this._getData(
                    '/feed/PressRelease.svc/GetPressReleaseList', {
                        pressReleaseDateFilter: 3,
                        categoryId: o.newsCategory,
                        tagList: o.newsTags.join('|'),
                        LanguageId: o.languageId ? o.languageId : GetLanguageId()
                    },
                    o.newsLimit
                );
            } else {
                return this._getData(
                    '/Services/PressReleaseService.svc/GetPressReleaseList', {
                        serviceDto: {
                            TagList: o.newsTags,
                            IncludeTags: true
                        },
                        pressReleaseSelection: 3,
                        pressReleaseCategoryWorkflowId: o.newsCategory,
                        LanguageId: o.languageId ? o.languageId : GetLanguageId()
                    },
                    o.newsLimit
                );
            }
        },

        _getEventsData: function() {
            var o = this.options;

            if (o.usePublic) {
                return this._getData(
                    '/feed/Event.svc/GetEventList', {
                        eventDateFilter: 3,
                        tagList: o.eventsTags.join('|')
                    },
                    o.eventsLimit
                );
            } else {
                return this._getData(
                    '/Services/EventService.svc/GetEventList', {
                        serviceDto: {
                            TagList: o.eventsTags,
                            IncludeTags: true
                        },
                        eventSelection: 3
                    },
                    o.eventsLimit
                );
            }
        },

        _getData: function(url, params, limit) {
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

        _buildStockTable: function(company, data) {
            var row = '';

            $.each(data.GetStockQuoteHistoricalListResult, function(i, val) {
                if (i > 100) return false;

                row += (
                    '<tr>' +
                    '<td>' + $.datepicker.formatDate('MM dd, yy', new Date(val.HistoricalDate)) + '</td>' +
                    '<td>$' + val.Last + '</td>' +
                    '</tr>'
                )
            })

            var table = (
                '<div class="module-highcharts" aria-hidden="true" style="margin:0; padding:0; width: 0px; height: 0px; overflow: hidden;">' +
                    '<table class="table table--accessible">' +
                        '<caption>' + company + ' historical stock data</caption>' +
                        '<thead>' +
                            '<tr>' +
                                '<th scope="col">Stock Date</th>' +
                                '<th scope="col">Stock Price</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            row +
                        '</tbody>' +
                    '</table>' +
                '</div>'
            );

            $(table).insertAfter(this.element);
        },

        _parseStockData: function(data) {
            var _ = this,
                o = this.options,
                $e = this.element,
                stockData = [],
                volumeData = [];

            if (data.GetStockQuoteHistoricalListResult.length && this.startDate === null && o.startDate === null) {
                // Store the earliest date from the first stock series.
                // This will be used later for news so dots don't fall off the chart
                this.startDate = (new Date(data.GetStockQuoteHistoricalListResult.slice(-1)[0].HistoricalDate)).getTime();
            } else {
                this.startDate = o.startDate;
            }

            $.each(data.GetStockQuoteHistoricalListResult, function(i, quote) {
                var price = quote.Last;

                if (price > 0) {
                    var time = (new Date(quote.HistoricalDate)).getTime();

                    if (time >= _.startDate) {
                        stockData.push({
                            x: time,
                            y: price,
                            high: quote.High,
                            low: quote.Low,
                            open: quote.Open
                        });
                        volumeData.push({
                            x: time,
                            y: quote.Volume,
                            high: quote.High,
                            low: quote.Low,
                            open: quote.Open
                        });
                    }
                }
            });

            return [stockData.reverse(), volumeData.reverse()];
        },

        _parseNewsData: function(data) {
            var _ = this,
                o = this.options,
                prData = [];

            $.each(data.GetPressReleaseListResult, function(i, item) {
                var headline = item.Headline.length > (o.newsLength + 10) ? item.Headline.substring(0, o.newsLength) + '...' : item.Headline,
                    details = o.url + item.LinkToDetailPage,
                    time = (new Date(item.PressReleaseDate)).getTime();

                if (time >= _.startDate) {
                    prData.push({
                        x: time,
                        title: ' ',
                        text: headline,
                        url: details
                    });
                }
            });

            return prData.reverse();
        },

        _parseEventsData: function(data) {
            var _ = this,
                o = this.options,
                eventData = [];

            $.each(data.GetEventListResult, function(i, item) {
                var details = o.url + item.LinkToDetailPage,
                    time = (new Date(item.StartDate)).getTime();

                if (time >= _.startDate) {
                    eventData.push({
                        x: time,
                        title: ' ',
                        text: item.Title,
                        url: details
                    });
                }
            });

            return eventData.sort(function(a, b) {
                if (a.x < b.x) return -1;
                if (a.x > b.x) return 1;
                return 0;
            });
        },

        _toggleStock: function(series) {
            var _ = this,
                o = this.options,
                i = o.volume ? series._i / 2 : series._i;

            if (o.lockStock) return false;

            // Load the stock price/volume data if it hasn't been already
            if (!series.data.length) {
                this.chart.showLoading();
                this._getStockData(o.stocks[i]).done(function(data) {
                    // this should be a 2-tuple of stock price and volume data
                    var stockData = _._parseStockData(data);

                    // load data into this symbol's price/volume series
                    series.setData(stockData[0]);
                    if (o.volume) {
                        _.chart.get('volume' + i).setData(stockData[1]);
                    }

                    _.chart.hideLoading();
                });

            } else {
                // Toggle the volume chart along with the stock price chart
                if (o.volume) {
                    var volSeries = this.chart.get('volume' + i);
                    if (volSeries.visible) {
                        volSeries.hide();
                    } else {
                        volSeries.show();
                    }
                }
            }
        },

        _toggleFlags: function(series) {
            var _ = this,
                o = this.options;

            // Load the news/event data if it hasn't been already
            if (!series.data.length) {
                this.chart.showLoading();

                if (series.options.id == 'news') {
                    this._getNewsData().done(function(data) {
                        _.chart.get('news').setData(_._parseNewsData(data));
                        _.chart.hideLoading();
                    });

                } else {
                    this._getEventsData().done(function(data) {
                        _.chart.get('events').setData(_._parseEventsData(data));
                        _.chart.hideLoading();
                    });
                }
            }
        },

        setStock: function(value) {
            var inst = this, o = this.options;
            $.extend( o, { stocks: value});
            inst._create();
        },
    });
})(jQuery);