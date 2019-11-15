(function($) {
    /**
     * Stock Quote using Euro Data
     * @class q4.eiStockQuote
     * @version 1.1.5
     */

    $.widget("q4.eiStockQuote", /** @lends q4.eiStockQuote */ {
        options: {
            /**
             * Client name, based on EuroInvestor
             * @type {string}
             * @example 'gruposupervielle'
             */
            customerKey: '',
            solutionID: 0,
            showAll: false,
            /**
             * Date format using datepicker
             * @type {string}
             * @example 'mm/dd/yy'
             */
            dateFormat: 'mm/dd/yy',
            /**
             * Additional class added if the price is up or down
             * @type {array}
             */
            changeCls: ['StockPriceDown', 'no-change', 'StockPriceUp'],
            /**
             * Container class for tabs
             * @type {string}
             */
            tabCls: 'euro-legend',
            /**
             * Container class for the Stock Quote
             * @type {string}
             */
            stockCls: 'q4-stock-quote',
            /**
             * Mustache Template for the stock
             * @type {string}
             * @param symbol
             * @param exchange
             * @param change
             * @param percChange
             * @param tradePrice
             * @param high
             * @param low
             * @param high52
             * @param low52
             * @param open
             * @param previousClose
             * @param tradeDate
             * @param volume
             * @param tradeTime
             * @param uod
             */
            stockTpl: (
                '<ul class="grid-no-gutter">' +
                    '<li class="col col-1-of-1"><span class="col col-1-of-2">Exchange:</span><span class="col col-1-of-2">{{exchange}} ({{currency}})</span></li>' +
                    '<li class="col col-1-of-2"><span class="col col-1-of-2">Price:</span><span class="col col-1-of-2">{{currency}} ${{tradePrice}}</span></li>' +
                    '<li class="col col-1-of-2"><span class="col col-1-of-2">Volume:</span><span class="col col-1-of-2">{{volume}}</span></li>' +
                    '<li class="col col-1-of-2 highlight"><span class="col col-1-of-2">Change:</span><span class="col col-1-of-2">{{currency}} ${{change}}</span></li>' +
                    '<li class="col col-1-of-2 highlight"><span class="col col-1-of-2">Change (%)</span><span class="col col-1-of-2">{{percChange}}%</span></li>' +
                    '<li class="col col-1-of-2"><span class="col col-1-of-2">Today\'s Open</span><span class="col col-1-of-2">{{currency}} ${{open}}</span></li>' +
                    '<li class="col col-1-of-2"><span class="col col-1-of-2">Previous Close</span><span class="col col-1-of-2">{{currency}} ${{previousClose}}</span></li>' +
                    '<li class="col col-1-of-2 highlight"><span class="col col-1-of-2">Intraday High</span><span class="col col-1-of-2">{{currency}} ${{high}}</span></li>' +
                    '<li class="col col-1-of-2 highlight"><span class="col col-1-of-2">Intraday Low</span><span class="col col-1-of-2">{{currency}} ${{open}}</span></li>' +
                    '<li class="col col-1-of-2"><span class="col col-1-of-2">52 Week High</span><span class="col col-1-of-2">{{currency}} ${{high52}}</span></li>' +
                    '<li class="col col-1-of-2"><span class="col col-1-of-2">52 Week Low</span><span class="col col-1-of-2">{{currency}} ${{low52}}</span></li>' +
                    '<li class="col col-1-of-1">' +
                        '<p>Data as of {{tradeDate}} {{tradeTime}}</p>' +
                        '<p>Minimum 20 minute delay</p>' +
                   '</li>' +
                '</ul>'
            ),
            multiStockTpl: function() {
                return '{{#.}}' + this.stockTpl + '{{/.}}';
            },
            /**
             * Template for tabs
             * @type {string}
             */
            tabTpl: (
                '<ul class="q4-stock-tabs">' +
                    '{{#.}}' +
                        '<li class="col col-1-of-{{length}}">{{name}}</li>' +
                    '{{/.}}' +
                '</ul>' 
            ),
            /**
             * Map Full exchange names to an acronym.
             * @type {object}
             */
            exchangeMap: {
                /*'Buenos Aires Stock Exchange' : 'BASE',
                'New York Stock Exchange' : 'NYSE'*/
            },
            /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function (e) {}
        },

        _create: function() {
            var inst = this, o = inst.options;

            inst.element.append(
                '<div class="'+ o.tabCls +'"></div>' +
                '<div class="'+ o.stockCls +'"></div>'
            );

            inst._getData().done(function(stockData){
                inst.stockData = stockData.data;

                if (o.showAll) {
                    var allStockData = [];

                    $.each(inst.stockData, function(i, stock){
                        allStockData.push( inst._buildQuote( stock ) );
                    });

                    inst.element.find( '.' + o.stockCls ).html( Mustache.render( inst.options.multiStockTpl(), allStockData ) );
                } else {
                    inst.element.find( '.' + o.stockCls ).html( Mustache.render( inst.options.stockTpl, inst._buildQuote( inst.stockData[0] ) ) );
                    inst._createTabs();
                }

                inst._trigger('complete');
            });
        },

        _getData: function (url, params) {
            return $.ajax({
                url: '//ir.q4europe.com/ServiceEngine/api/json/reply/RequestStockDataBundle',
                data: {
                    apiVersion: 1,
                    customerKey: this.options.customerKey,
                    solutionID: this.options.solutionID,
                    instrumentTypes: 'Listing'
                }
            });
        },

        _createTabs: function() {
            var inst = this, o = inst.options,
                $tabs = inst.element.find( '.' + o.tabCls ),
                tabData = [];

            $.each( inst.stockData, function(i, indice){
                tabData.push({
                    length: inst.stockData.length,
                    name: o.exchangeMap[ indice.exchangeName ] !== undefined ? o.exchangeMap[ indice.exchangeName ] + ' : ' + indice.symbol : indice.exchangeName + ' : ' + indice.symbol,
                    exchange: o.exchangeMap[ indice.exchangeName ] !== undefined ? o.exchangeMap[ indice.exchangeName ] : indice.exchangeName
                });
            });

            $tabs.html( Mustache.render( o.tabTpl, tabData ) ).on('click', 'li', function(){
                $tabs.find('li').removeClass('active');
                $(this).addClass('active');

                inst.element.find( '.' + o.stockCls ).html( Mustache.render( inst.options.stockTpl, inst._buildQuote( inst.stockData[ $(this).index() ] ) ) );
            }).find('li:first').addClass('active');
        },

        _buildQuote: function( stockQuote ) {
            var inst = this, o = inst.options,
                tradeDate = new Date( stockQuote.timestamp ),
                tradeTime = stockQuote.timestamp.split('T').pop(),
                clsName;

            tradeDate = new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate());

            if ( stockQuote.change.toString().charAt(0) == '-' ) {
                clsName = o.changeCls[0];
            } else if ( stockQuote.change === 0  ) {
                clsName = o.changeCls[1];
            } else {
                clsName = o.changeCls[2];
            }

            return {
                currency: stockQuote.currency,
                symbol: stockQuote.symbol,
                exchange: o.exchangeMap[ stockQuote.exchangeName ] !== undefined ? o.exchangeMap[ stockQuote.exchangeName ] : stockQuote.exchangeName,
                ticker: o.exchangeMap[ stockQuote.exchangeName ] !== undefined ? o.exchangeMap[ stockQuote.exchangeName ] + ' : ' + stockQuote.symbol : stockQuote.exchangeName + ' : ' + stockQuote.symbol,
                change: stockQuote.change.toFixed(2),
                percChange: stockQuote.changePercent.toFixed(2),
                tradePrice: stockQuote.lastTradePrice.toFixed(2),
                high: stockQuote.high.toFixed(2),
                low: stockQuote.low.toFixed(2),
                high52: stockQuote.high52Week.toFixed(2),
                low52: stockQuote.low52Week.toFixed(2),
                marketcap: stockQuote.marketCap,
                open: stockQuote.open.toFixed(2),
                previousClose: stockQuote.prevClose.toFixed(2),
                tradeDate: $.datepicker.formatDate( o.dateFormat, tradeDate ),
                tradeTime: tradeTime,
                //timeZone: stockQuote.timestamp.toString().match(/\(([^)]+)\)/)[1],
                volume: inst._addCommas(stockQuote.volume),
                uod: clsName,
            };
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

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);