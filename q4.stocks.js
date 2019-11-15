(function ($) {
    /**
     * Base widget for accessing the new Q4 Stocks API
     * @class q4.stocks
     * @version 1.0.4
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [Moment.js_(optional)](lib/moment.min.js)
     */
    $.widget('q4.stocks', /** @lends q4.stocks */ {
        options: {
            url: 'https://stock.q4api.com/v1',
            apiKey: '',
            symbol: ['NKE.XNYS','ABX.XNYS'],
            startYear: null,
            dateFormat: 'mm/dd/yy',
            datepickerOpts: {

            },
            noItemsMessage: 'There are no stock items for the selected day',
            chartType: 'line',
            template: '',
            activeClass: 'js--active',
            loadingClass: 'js--loading',
            beforeRender: function (e, tplData) {},
            itemsComplete: function (e) {},
            complete: function (e) {}
        },

        $widget: null,

        years: null,

        _setOption: function (key, value) {
            this._super(key, value);
            this._normalizeOptions();
        },

        _normalizeOptions: function () {
            var o = this.options;
            o.url = o.url.replace(/\/$/, '');
            if (typeof o.startYear == 'string' && o.startYear.length) {
                o.startYear = parseInt(o.startYear);
            }
        },

        _init: function () {
            var inst = this,
                o = this.options,
                $el = this.element;

            if (inst.widgetName == 'stocks') throw new Error("Please use a child widget of q4.stock.js");

            inst._normalizeOptions();
            inst.contentType = inst.contentTypes[inst.widgetName];

            if (inst.widgetName == 'quote') {
                inst.contentType.api = inst.contentType.api + '/' + o.symbol[0];
            }

            inst._callApi(inst.contentType.api, {
                'identifier': o.symbol[0],
            }).done(function (stockData) {
                $el.removeClass( o.loadingClass );
                inst._trigger('beforeRender', null, { items: stockData });

                if (inst.widgetName == 'chart') {
                    inst._buildChart( inst.contentType.parseItem.call( inst, stockData ) );
                } 
                else if (inst.widgetName == 'historical') {
                    $el.html( Mustache.render( o.lookupTpl, {
                        date: $.datepicker.formatDate(o.dateFormat, new Date( stockData[0].DateUTC ))
                    })).find('input').datepicker( $.extend(o.datepickerOpts, {
                        maxDate: new Date(stockData[0].DateUTC),
                        beforeShowDay: $.datepicker.noWeekends
                    })).on("input change", function (e) {
                        inst.updateHistorical( $.datepicker.formatDate('mm/dd/yy', new Date( $(this).val() ) ) );
                    });

                    $el.find(o.itemsContainer).html( Mustache.render( o.template, inst.contentType.parseItem.call( inst, stockData ) ) );
                }
                else {
                    $el.html( Mustache.render( o.template, inst.contentType.parseItem.call( inst, stockData ) ) );
                }

                inst._trigger('complete');
            }).fail(function( jqXHR, textStatus, errorThrown ) { 
                console.log( jqXHR, textStatus, errorThrown )
            });
        },

        updateHistorical: function( date ) {
            var inst = this, o = inst.options;

            inst._callApi(inst.contentType.api, {
                'start_date': date,
                'end_date': date
            }).done(function (stockData) {
                if (stockData.length){
                    inst.element.find(o.itemsContainer).html(
                        Mustache.render( o.template, inst.contentType.parseItem.call( inst, stockData[0] ) )
                    );
                } else {
                    inst.element.find(o.itemsContainer).html( o.noItemsMessage );
                }
            });
        },

        _callApi: function (service, data) {
            var o = this.options;

            return $.ajax({
                method: "GET",
                url: o.url + service,
                data: $.extend(this.contentType.data, data),
                dataType: "json",
                contentType: "application/json",
                headers: { "x-api-key": o.apiKey },
            });
        },

        _formatDate: function (date) {
            return $.datepicker.formatDate( this.options.dateFormat, new Date( date ) );
        },

        _buildChart: function ( stockData ) {
            var inst = this, o = inst.options,
                chartData = $.extend( o.config, {
                    series: [{
                        //type: 'line',
                        type: o.chartType,
                        name: 'Stock Data',
                        data: stockData.price,
                        events: {
                            legendItemClick: function (e) {
                                if ( this.name == "Stock Data" ) {
                                    return false;
                                }
                            }
                        }
                    }, {
                        type: 'column',
                        name: 'Volume',
                        showInLegend: false,
                        data: stockData.volume,
                        yAxis: 1
                    }]
                });

            Highcharts.stockChart( this.options.container, chartData );
        },

        contentTypes: {
            quote: {
                api: '/stockquote',
                data: {},
                parseItem: function (result) {
                    return {
                        symbol: result.ID,
                        price: result.Last,
                        open: result.Open,
                        high: result.High,
                        low: result.Low,
                        volume: result.Volume,
                        change: result.ChangeFromPreviousClose,
                        changePercent: result.PercentChangeFromPreviousClose,
                        high52: result.High52Weeks,
                        low52: result.Low52Weeks,
                        close: result.PreviousClose,
                        date: this._formatDate( result.TradeDate ),
                        time: result.Time,
                        currency: result.Currency,
                        state: result.ChangeFromPreviousClose.toString().charAt(0) == '-' ? 'stock-price_down' : 'stock-price_up'
                    };
                }
            },
            historical: {
                api: '/stockhistorical',
                data: {
                    'fields': '["DateUTC", "Last", "Open", "High", "Low", "Volume", "LastClose"]',
                    'limit': 5,
                    'start_date': $.datepicker.formatDate('mm/dd/yy', new Date( new Date().setDate( new Date().getDate() - 7)))
                    //'sort' : 'ASC'
                },
                parseItem: function (result) {
                    if (result.length > 1) {
                        result = result[0];
                    }

                    if (result !== undefined) {
                        return {
                            price: result.LastClose,
                            open: result.Open,
                            high: result.High,
                            low: result.Low,
                            volume: result.Volume
                        };
                    }
                }
            },
            chart: {
                api: '/stockhistorical',
                data: {
                    'start_date': '01/01/2000',
                    //'end_date': '01/01/2017',
                    'sort': 'ASC',
                    'fields': '["DateUTC", "Last", "Open", "High", "Low", "Volume", "LastClose"]'
                },
                parseItem: function (results) {
                    var inst = this,
                        stockData = {
                            price: [],
                            volume: []
                        };

                    $.each(results, function(i, result){
                        var date = new Date(result.DateUTC).getTime();
                        //console.log(this.options.chartType)
                        /*if (this.options.chartType == "candlestick") {

                            stockData.price.push([
                                date, // the date
                                result.Open, // open
                                result.High, // high
                                result.Low, // low
                                result.LastClose //close
                            ]);
                        } else {*/
                            stockData.price.push([
                                date, // the date
                                result.Last //close
                            ]);
                        //}

                        stockData.volume.push([
                            date, // the date
                            result.Volume // the volume
                        ]);
                    });

                    return stockData;
                }
            }
        }
    });


    /* Stock Quote Widget */

    /**
     * Fetches and displays Stock Quote data
     * @class q4.quote
     * @extends q4.stocks
     */
    $.widget('q4.quote', $.q4.stocks, /** @lends q4.quote */ {
        options: {
            /**
             * A Mustache.js template.
             *
             *<pre>
             * - `{{symbol}}`:        The Xignite stock symbol,
             * - `{{price}}`:         The last known price,
             * - `{{open}}`:          The open price,
             * - `{{high}}`:          The daily high,
             * - `{{low}}`:           The daily low,
             * - `{{volume}}`:        The current volume,
             * - `{{change}}`:        The change from previous close,
             * - `{{changePercent}}`: The change percent from previous close,
             * - `{{high52}}`:        The 52 week high,
             * - `{{low52}}`:         The 52 week low,
             * - `{{close}}`:         The previous close price,
             * - `{{date}}`:          The date in the format provided in `dateFormat`,
             * - `{{time}}`:          The time,
             * - `{{currency}}`:      The trade currency
             *</pre>
             * @type {string}
             */
            template: (
                '<div class="module_container--outer">' +
                    '<div class="module_container--inner">' +
                        '<h4 class="module-stock_lookup-title"><span class="module-stock_indice">{{symbol}}</span></h4>' +
                        '<div class="module_container--content grid--no-gutter">' +
                            '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                                '<span class="module-stock_price">Price</span>' +
                            '</div>' +
                            '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                                '<span class="module-stock_price">{{price}}</span>' +
                            '</div>' +
                            '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                                '<span class="module-stock_change">Change</span>' +
                            '</div>' +
                            '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                                '<span class="module-stock_change {{state}}">{{change}}</span>' +
                            '</div>' +
                            '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                                '<span class="module-stock_volume">Volume</span>' +
                            '</div>' +
                            '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                                '<span class="module-stock_volume">{{volume}}</span>' +
                            '</div>' +
                            '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                                '<span class="module-stock_percent-change">% Change</span>' +
                            '</div>' +
                            '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">       '  +
                                '<span class="module-stock_percent-change {{state}}">{{changePercent}}</span>' +
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
                                '<span lass="module-stock_week-low">52 Week Low</span>' +
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
                                '<span class="module-stock_previous-close">{{close}}</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="module-stock_date">' +
                            '<span class="module-stock_date-text">{{date}} {{time}}</span>' +
                            '<span class="module-stock_delay-text">Pricing delayed by 20 minutes</span>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            )
        }
    });

    /* Stock Historical Widget */

    /**
     * Fetches and displays Historical Stock data
     * @class q4.historicalLookup
     * @extends q4.stocks
     */
    $.widget('q4.historicalLookup', $.q4.stocks, /** @lends q4.historicalLookup */ {
        options: {
            /**
             * A Mustache.js template.
             *
             *<pre>
             * - `{{symbol}}`:        The Xignite stock symbol,
             * - `{{price}}`:         The last known price,
             * - `{{open}}`:          The open price,
             * - `{{high}}`:          The daily high,
             * - `{{low}}`:           The daily low,
             * - `{{volume}}`:        The current volume,
             * - `{{change}}`:        The change from previous close,
             * - `{{changePercent}}`: The change percent from previous close,
             * - `{{high52}}`:        The 52 week high,
             * - `{{low52}}`:         The 52 week low,
             * - `{{close}}`:         The previous close price,
             * - `{{date}}`:          The date in the format provided in `dateFormat`,
             * - `{{time}}`:          The time,
             * - `{{currency}}`:      The trade currency
             *</pre>
             * @type {string}
             */
            itemsContainer: '.module_container--content',
            template: (
                '<div class="module_container--outer">' +
                    '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_open">Day\'s Open</span>' +
                    '</div>' +
                    '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_open">{{open}}</span>' +
                    '</div>' +
                    '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_volume">Volume</span>' +
                    '</div>' +
                    '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_volume">{{volume}}</span>' +
                    '</div>' +
                    '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_high">Intraday High</span>' +
                    '</div>' +
                    '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_high">{{high}}</span>' +
                    '</div>' +
                    '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_low">Intraday Low</span>' +
                    '</div>' +
                    '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                        '<span class="module-stock_low">{{low}}</span>' +
                    '</div>' +
                '</div>'
            ),
            lookupTpl: (
                '<div class="module_datepicker module_datepicker--start"><label>Select a date:</label><input type="text" placeholder="{{date}}"></div>' +
                '<div class="module_container--content grid--no-gutter grid--no-space"></div>'
            )
        }
    });

    /* Stock Chart Widget */

    /**
     * Fetches and displays stock date using HighStock
     * @class q4.historicalChart
     * @extends q4.stocks
     */
    $.widget('q4.historicalChart', $.q4.stocks, /** @lends q4.historicalChart */ {
        options: {
            container: 'chart',
            config: {
                colors: ['#006fba'],
                chart: {
                    height: 450,
                    marginTop: 60,
                    backgroundColor: '#fff'
                },
                tooltip: {
                    split: true
                },
                legend: {
                    enabled: true,
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
                yAxis: [{
                    gridLineColor: "rgba(0, 0, 0, 0.1)",
                    lineColor: 'transparent',
                    /*labels: {
                        y: -25
                    },*/
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'OHLC'
                    },
                    height: '75%',
                    lineWidth: 2
                }, {
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'Volume'
                    },
                    top: '80%',
                    height: '20%',
                    offset: 0,
                    lineWidth: 2
                }],
                xAxis: {
                    gridLineColor: "rgba(0, 0, 0, 0.1)",
                    lineColor: 'transparent'
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
            },
            compare: []
        }
    });

    /* Stock Chart Widget */

    /**
     * Fetches and displays stock date using HighStock
     * @class q4.intradayChart
     * @extends q4.stocks
     */
    $.widget('q4.intradayChart', $.q4.stocks, /** @lends q4.intradayChart */ {
        options: {
            container: 'intraday-chart',
            config: {
                colors: ['#006fba'],
                chart: {
                    height: 450,
                    marginTop: 60,
                    backgroundColor: 'transparent'
                },
                tooltip: {
                    split: true
                },
                legend: {
                    enabled: true,
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
                yAxis: [{
                    gridLineColor: "rgba(0, 0, 0, 0.1)",
                    lineColor: 'transparent',
                    /*labels: {
                        y: -25
                    },*/
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'OHLC'
                    },
                    height: '75%',
                    lineWidth: 2
                }],
                xAxis: {
                    gridLineColor: "rgba(0, 0, 0, 0.1)",
                    lineColor: 'transparent'
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
            }
        }
    });

})(jQuery);