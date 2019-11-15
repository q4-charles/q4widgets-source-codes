(function($) {
    /**
     * A preconfigured stock chart, using the Highstock plugin and Euro Investor data.
     * @class q4.eiStockChart
     * @version 1.0.9
     * @requires [Highstock](lib/highstock.js)
     */
    $.widget("q4.eiStockChart", /** @lends q4.eiStockChart */ {
        options: {
            tplData: {
                id: 'euro-chart',
                type: 'euro-type',
                legend: 'chart-legend'
            },
            /**
             * Adds datepicker to the range selector
             * @type {string}
             * @default false
             */
            datepicker: true,
            /**
             * If set to true @typeTpl will be rendered allowing the change type to be changed dynamically
             * @type {string}
             * @default false
             */
            toggleType: false,
            /**
             * A interger required for the EI API. Seems to change based off customerKey
             * @type {string}
             * @example gruposupervielle
             */
            solutionID: 0,
            /**
             * Provided by Euro Investor in lieu of exchange / symbol. Can map to a number of stock quotes
             * @type {string}
             * @example gruposupervielle
             */
            customerKey: '',
            /**
             * The date format to use for the chart tooltip. This should use Highstock's date format.
             * More information on available formats can be found here: http://php.net/manual/en/function.strftime.php
             * @type {string}
             * @example '%A, %b %e, %Y' // ex. Thursday, Dec. 22, 2016
             * @default '%A, %b %e, %Y'
             */
            tooltipDateFormat: '%A, %b %e, %Y',
            /**
             * The name of the volume series. This will appear in the chart tooltip, and can be changed to support other languages or a client's word preference.
             * @type {string}
             * @example 'Volume'
             * @default 'Volume'
             */
            volumeName: 'Volume',
            /**
             * Global series config
             * @type {object}
             * @example {
             *     type: 'line'
             * },
             */
            seriesOpts: {
                type: 'area',
                threshold: null
            },
            /**
             * Default template rendered when the widget is loaded. Uses @tplData.
             * id is required to draw the chart
             * type is required if @toggleType is set to true
             * 
             * @type {string}
             * @default false
             */
            tpl: (
                '<div class="{{type}}"></div>' +
                '<div class="{{legend}}"></div>' +
                '<div id="{{id}}" class="euro-chart"></div>'
            ),
            legendTpl: (
                '<ul class="q4-stock-tabs">' +
                    '{{#.}}' +
                        '<li class="col col-1-of-6">{{.}}</li>' +
                    '{{/.}}' +
                '</ul>'
            ),
            typesTpl: (
                '<select>' +
                    '<option value="areaspline">Areaspline</option>' +
                    '<option value="bar">Bar</option>' +
                    '<option value="line">Line</option>' +
                    //'<option value="candlestick">Candlestick</option>' + requires open, high, low, close
                '</select>'
            ),
            /**
             * Highstock options
             * @type {object}
             */
            highstockOpts: {
                title: {
                    text: ''
                },
                yAxis: [{
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'Price'
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
                rangeSelector: {
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'year',
                        count: 5,
                        text: '5y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
                }
            },

            /**
             * The Legend will display Exchange:Symbol by default. You can map this to whatever you want
             * @type {object}
             * @example {
             *   'Toronto Stock Exchange:MFC'  : 'MFC.TO (TOR)',
             *   'New York Stock Exchange:MFC' : 'MFC (NYSE)'
             * }
             */
            exchangeMap: { },
            onComplete: function(){ }
        },

        _create: function() {
            var inst = this, o = inst.options;

            inst.element.html( Mustache.render( o.tpl, o.tplData) );

            if (o.toggleType) {
                inst._chartType();
            }

            inst._getData().done(function(stockData){
                inst._dataByExchange(stockData.data);
            });
        },

        _getData: function (url, params) {
            return $.ajax({
                url: '//ir.q4europe.com/ServiceEngine/api/json/reply/RequestClosePriceBundle_OHLC',
                data: {
                    apiVersion: 1,
                    customerKey: this.options.customerKey,
                    solutionID: this.options.solutionID,
                    numberOfYears: 10,
                    instrumentTypes: 'Listing'
                }
            });
        },

        _chartType: function() {
            var inst = this, o = inst.options;

            inst.element.find( '.' + o.tplData.type ).html( o.typesTpl ).on('change', function(){
                var $this = $(this).find('option:selected');

                $.each(inst.chart.series, function (key, series) {
                    series.update( {type: $this.val()}, false );
                });

                inst.chart.redraw();
            });
        },

        _buildLegend: function(legend) {
            var inst = this, o = inst.options,
                $legend = inst.element.find('.' + o.tplData.legend );

            $legend.html( Mustache.render( inst.options.legendTpl, legend ) ).on('click', 'li', function(){
                $legend.find('li').removeClass('active');
                $(this).addClass('active');

                inst.chart.series[0].setData( inst.seriesData[ $(this).index()].data[0] );
                inst.chart.series[0].name = $(this).text();
                inst.chart.series[0].tooltipOptions.valuePrefix = inst.seriesData[ $(this).index()].currency + ' $';

                inst.chart.series[1].setData( inst.seriesData[ $(this).index()].data[1] );
            }).find('li:first').addClass('active');
        },

        _dataByExchange: function(stockData) {
            var inst = this, o = inst.options,
                stockLegend = [];
            
            inst.seriesData = []

            $.each(stockData, function(i, stock){
                var seriesName = o.exchangeMap[ stock.exchangeName + ':' + stock.symbol ] !== undefined ? o.exchangeMap[ stock.exchangeName+ ':' +stock.symbol ] : stock.exchangeName + ':' + stock.symbol;
                
                inst.seriesData.push( {
                    currency: stock.currency,
                    name: seriesName,
                    data: inst._normalizeStockData( stock.data ) 
                });
                stockLegend.push( seriesName );
            });

            inst._buildLegend( stockLegend );
            inst._buildChart( inst.seriesData[0], stockLegend[0] );
        },

        _normalizeStockData: function( stockData, seriesName ) {
            var stock = [],
                volume = [];

            $.each(stockData, function(i, day){
                var time = $.datepicker.parseDate( "yy-mm-dd", day.date.split('T').shift() ).getTime();
                stock.push([
                    time,
                    day.closePrice
                ]);
                volume.push([
                    time,
                    day.volume
                ]);
            });

            return [stock, volume];
        },

        _buildChart: function( stockSeries, seriesName ) {
            var inst = this;
            var seriesData = [
                $.extend( {}, { 
                    name: seriesName,
                    data: stockSeries.data[0],
                    yAxis: 0,
                    tooltip: {
                        valueDecimals: 2,
                        valuePrefix: stockSeries.currency + ' $',
                        xDateFormat: inst.options.tooltipDateFormat
                    },
                }, inst.options.seriesOpts ), 
                {
                    type: 'areaspline',
                    name: inst.options.volumeName,
                    data: stockSeries.data[1],
                    yAxis: 1
                }
            ];

            inst.chart = Highcharts.stockChart( inst.options.tplData.id, $.extend({},{
                series: seriesData
            }, inst.options.highstockOpts) );

            if (inst.options.datepicker) {
                $('input.highcharts-range-selector', $('#' + inst.options.tplData.id)).datepicker()
            }

            inst._trigger('onComplete');
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);