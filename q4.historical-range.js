(function ($) {
    /**
     * Retrieves price and volume information for a stock quote historical range.
     * @class q4.historicalRange
     * @version 2.1.9
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.historicalRange", /** @lends q4.historicalRange */ {
        options: {
            /**
             * The base URL to use for API calls.
             * By default, calls go to the current domain, so this option is usually unnecessary.
             * @type {string}
             * @default
             */
            url: '',
            /**
             * Use Public API
             * @type {boolean}
             * @default
             */
            usePublic: false,
            /**
             * Api Key for use with the public api
             * @type {string}
             * @default
             */
            apiKey: '',
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
             * A message or HTML string to display while first loading the widget.
             * @type {?string}
             * @default
             */
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading historical data...</span></p>',
            /**
             * A message or HTML string to display in the container if no items are found.
             * @type {string}
             * @default
             */
            itemNotFoundMessage: '<p><i class="q4-icon_warning-line"></i> There is no data for the selected date.</p>',
            /**
             * Whether to show a single date selection or a date range selection.
             * @type {boolean}
             * @default
             */
            range: false,
            /**
             * The Number of items the API should return. -1 is all.
             * @type {interger}
             * @default -1
             */
            maxItems: -1,
            /**
             * The Number of items the API should return
             * @type {interger}
             * @default
             */
            loadItems: 1,
            /**
             * A date format string, which can be used in the template as `{{date}}`.
             * By default, dates are formatted using jQuery UI's datepicker.
             * @example 'MM d, yy'
             * @type {string}
             * @default
             */
            dateFormat: 'mm/dd/yy',
            /**
             * Options and templates for each of the selects. Most of these options should not be changed.
             * Note that the option 'btnCls' needs to have classes separated by space.
             * @example
             * {
             *     startYear: new Date().getFullYear() - 10,
             *     btnCls: 'module_options-submit button--inverted'
             * }
             * @type {Object}
             */
            selects: {
                startYear: new Date().getFullYear() - 10,
                btnCls: 'module_options-submit',
                data: [
                    {name: 'Jan', num: 1, days: 31},
                    {
                        name: 'Feb', num: 2, days: function (year) {
                            if (new Date(year, 1, 29).getMonth() == 1) {
                                return 29;
                            } else {
                                return 28;
                            }
                        }
                    },
                    {name: 'Mar', num: 3, days: 31},
                    {name: 'Apr', num: 4, days: 30},
                    {name: 'May', num: 5, days: 31},
                    {name: 'Jun', num: 6, days: 30},
                    {name: 'Jul', num: 7, days: 31},
                    {name: 'Aug', num: 8, days: 31},
                    {name: 'Sep', num: 9, days: 30},
                    {name: 'Oct', num: 10, days: 31},
                    {name: 'Nov', num: 11, days: 30},
                    {name: 'Dec', num: 12, days: 31}
                ],
                monthTpl: (
                    '<select aria-label="month" class="dropdown module_options-select module_options-select--month">' +
                        '{{#data}}' +
                            '<option value="{{num}}">' +
                                '{{name}}' +
                            '</option>' +
                        '{{/data}}' +
                    '</select>'
                ),
                onMonthChange: function (inst) {
                    var o = inst.options,
                        $select = o.range ? [inst.element.find('.stock-start select'), inst.element.find('.stock-end select')] : [inst.element.find('.module_options select')];

                    $.each($select, function (i, selector) {
                        selector.not('.module_options-select--day').on('change', function () {
                            var n = o.selects.data[parseInt(selector.filter('.module_options-select--month').val()) - 1];

                            if (n.days !== undefined && typeof (n.days) === 'function') {
                                n = n.days(selector.filter('.module_options-select--year').val());
                            } else {
                                n = n.days;
                            }

                            selector.filter('select.module_options-select--day').html(Mustache.render(o.selects.dayTpl.contents, inst._buildArrayAdd(1, n)));

                            if (inst.options.onSelectUpdate !== undefined && typeof (inst.options.onSelectUpdate) === 'function') {
                                inst.options.onSelectUpdate(inst);
                            }
                        });
                    });
                },
                dayTpl: {
                    container: function () {
                        return '<select aria-label="day" class="dropdown module_options-select module_options-select--day">' + this.contents + '</select>';
                    },
                    contents: (
                        '{{#count}}' +
                            '<option value="{{.}}">' +
                                '{{.}}' +
                            '</option>' +
                        '{{/count}}'
                    )
                },
                yearTpl: (
                    '<select aria-label="year" class="dropdown module_options-select module_options-select--year">' +
                        '{{#count}}' +
                            '<option value="{{.}}">' +
                                '{{.}}' +
                            '</option>' +
                        '{{/count}}' +
                    '</select>'
                )
            },
            /**
             * The class for the element containing the table. Do not include periods!
             * @example 'stock-table-container'
             * @type {string}
             */
            stockTableClass: 'module_container--content grid--no-gutter grid--no-space',
            /**
             * The template for the date selection when using the date range setup.
             * @type {function}
             * @param {string} [month]  Month select HTML
             * @param {string} [day]    Day select HTML
             * @param {string} [year]   Year select HTML
             */
            rangeTpl: function (month, day, year, exchange, symbol) {
                return '<div class="stock-historical">' +
                        '<div class="module_options">' +
                            '<div class="stock-start">' +
                                '<span class="text">Start Date:</span>' +
                                year + month + day +
                            '</div>' +
                            '<div class="stock-end">' +
                                '<span class="text">End Date:</span>' +
                                year + month + day +
                            '</div>' +
                            '<button class="' + this.selects.btnCls + '">Look Up</button>' +
                        '</div>' +
                        '<div class="' + this.stockTableClass + '">' + this.loadingMessage + '</div>' +
                    '</div>';
            },
            /**
             * The template for the date selection when using the single date setup.
             * @type {function}
             * @param {string} [month]  Month select HTML
             * @param {string} [day]    Day select HTML
             * @param {string} [year]   Year select HTML
             */
            moduleTpl: function (month, day, year, exchange, symbol) {
                return '<div class="module_options">' +
                        '<label class="module_options-label">Lookup Date: </label>' +
                        year + month + day +
                        '<button class="button ' + this.selects.btnCls + '">Look Up</button>' +
                    '</div>' +
                    '<h4 class="module-stock_lookup-title">' +
                        '<span class="module-stock_lookup-title-text">Stock Quote: </span>' +
                        '<span class="module-stock_indice">' + exchange + ': ' + symbol + '</span>' +
                    '</h4>' +
                    '<div class="' + this.stockTableClass + '">' + this.loadingMessage + '</div>';
            },
            /**
             * The HTML template structure for the table header, if desired.
             * @type {string}
             */
            stockHeader: '',
            /**
             * The template for the table content. Variable options:
             * @param {string}  '{{day}}'       The date, displayed in the format specified by the 'dateFormat' option.
             * @param {string}  '{{open}}'      The opening price.
             * @param {string}  '{{last}}'      The last close price.
             * @param {string}  '{{high}}'      The high.
             * @param {string}  '{{low}}'       The low.
             * @param {string}  '{{volume}}'    The volume.
             * @type {string}
             */
            stockTpl: (
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
                '<div class="module-stock_label grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                    '<span class="module-stock_low">Closing Price</span>' +
                '</div>' +
                '<div class="module-stock_value grid_col grid_col--1-of-4 grid_col--md-1-of-2 grid_col--sm-1-of-2">' +
                    '<span class="module-stock_low">{{last}}</span>' +
                '</div>'
            ),
            /**
             * A callback that fires each time the data is loaded.
             * @type {function}
             * @param {Event}  [e]  The event object.
             * @param {Object} [data]   Historical data.
             */
            onDataLoad: function (e, data) {},
            /**
             * A callback that fires when the widget first renders the selects from the template.
             * @type {function}
             */
            onFirstLoad: function (inst) {},
            /**
             * A callback that fires when the month or year selects have changed (this does not mean a lookup has been triggered).
             * @type {function}
             */
            onSelectUpdate: function (inst) {} ,
            /**
             * A callback that fires when the widget is first created. It is run after 'onFirstLoad'.
             * @type {function}
             */
            onWidgetLoad: function (inst) {},
            /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
             complete: function(event) {}
        },

        _loaded: false,

        _create: function () {
            var _ = this, o = _.options;

            if (o.onWidgetLoad !== undefined && typeof (o.onWidgetLoad) === 'function') {
                o.onWidgetLoad(_);
            }
        },

            _init: function () {
            var _ = this, o = _.options;

            if (!o.stock.length) {
                _._getStockIndice().done(function (stockIndice) {
                    if (stockIndice.GetLookupListResult.length) {
                        var useIndice = stockIndice.GetLookupListResult[o.lookupIndex - 1].Value,
                            useIndiceText = stockIndice.GetLookupListResult[o.lookupIndex - 1].Text;

                        o.stock = [useIndice, useIndiceText];

                        _._buildHTML();
                        _._getHistoricalData();
                        _._onSelectChange();
                    } else {
                        if (o.usePublic) {
                            if (o.url.length && o.apiKey.length) {
                                console.log('There are no active indices on ' + o.url);
                            } else {
                                console.log('Check that you have configured a valid url and apiKey');
                            }
                        } else {
                            console.log('There are no active indices');
                        }
                    }
                }).fail(function (jqxhr, status, message) {
                    console.error('Error fetching indice: ' + message);
                });
            } else {
                _._buildHTML();
                _._getHistoricalData();
                _._onSelectChange();
            }

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

        _onSelectChange: function () {
            var _ = this, o = _.options;

            _.element.find('.module_options select').on('change', function () {
                _.element.find('button.' + o.selects.btnCls.replace(/ /g, '.')).removeClass('js--disabled');
            });
        },

        _addCommas: function (nStr) {
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

        _queryStringToObj: function (query) {
            var qryStringArr = query.split('&');
            var obj = {}, paramvalue = '';
            for (i = 0; i < qryStringArr.length; i++) {
                paramvalue = qryStringArr[i].split('=');
                obj[paramvalue[0]] = paramvalue[1];
            }
            return obj;
        },

        _onRangeRefresh: function (date) {
            var _ = this, o = _.options,
                $select = o.range ? [_.element.find('.stock-start'), _.element.find('.stock-end')] : [_.element.find('.module_options')];

            _.element.find('button.' + o.selects.btnCls.replace(/ /g, '.')).on('click', function (e) {
                e.preventDefault();

                if (!$(this).hasClass('js--disabled')) {
                    var dates = [];

                    _.element.find('.' + o.stockTableClass.replace(/ /g, '.')).html(o.loadingMessage);
                    _.element.find('button.' + o.selects.btnCls.replace(/ /g, '.')).addClass('js--disabled');

                    $.each($select, function (i, selector) {
                        var selectDate = new Date($(this).find('.module_options-select--month').val() + '/' + $(this).find('.module_options-select--day').val() + '/' + $(this).find('.module_options-select--year').val()),
                            utcDate = Date.UTC(selectDate.getFullYear(), selectDate.getMonth(), selectDate.getDate());

                        if (o.usePublic) { // quick fix for server time issues between public / private api
                            dates.push(selectDate);
                        } else {
                            dates.push(utcDate);
                        }
                    });

                    if (o.range) {
                        _._getHistoricalData(dates[0], dates[1]);
                    } else {
                        _._getHistoricalData(dates[0], dates[0]);
                    }
                }
            });
        },

        _setSelectDate: function (date) {
            var _ = this, o = _.options;

            _.element.find('select.module_options-select--month').val(parseInt(date.split('/')[0])).change();
            _.element.find('select.module_options-select--day').val(parseInt(date.split('/')[1]));
            _.element.find('select.module_options-select--year').val(parseInt(date.split('/')[2]));
            _.element.find('button.' + o.selects.btnCls.replace(/ /g, '.')).addClass('js--disabled');

            if (o.onSelectUpdate !== undefined && typeof (o.onSelectUpdate) === 'function') {
                o.onSelectUpdate(_);
            }
        },

        _buildArrayAdd: function (first, last) {
            var num = [];

            for (i = first; i <= last; i++) {
                num.push(i);
            }

            return data = {
                count: num
            };
        },

        _buildArraySub: function (first, last) {
            var num = [];

            for (i = first; i >= last; i--) {
                num.push(i);
            }

            return data = {
                count: num
            };
        },

        _dataDto: function () {
            var _ = this, o = _.options,
                exchange = o.stock[0].split(':')[0],
                symbol = o.stock[0].split(':')[1];

            return dataObj = {
                serviceDto: {
                    RevisionNumber: GetRevisionNumber(),
                    LanguageId: GetLanguageId(),
                    Signature: GetSignature(),
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
                    StartIndex: 0,
                    ItemCount: 1
                },
                exchange: exchange,
                symbol: symbol
            };
        },

        _buildHTML: function () {
            var _ = this, o = _.options,
                day = new Date().getMonth(),
                month = Mustache.render(o.selects.monthTpl, o.selects),
                year = Mustache.render(o.selects.yearTpl, _._buildArraySub(new Date().getFullYear(), o.selects.startYear)),
                exchange = o.stock.length > 1 ? o.stock[1].split(':')[0] : o.stock[0].split(':')[0],
                symbol = o.stock.length > 1 ? o.stock[1].split(':')[1] : o.stock[0].split(':')[1];

            if (day == 1) { // check if feb
                day = Mustache.render(o.selects.dayTpl.container(), _._buildArrayAdd(1, o.selects.data[day].days()));
            } else {
                day = Mustache.render(o.selects.dayTpl.container(), _._buildArrayAdd(1, o.selects.data[day].days));
            }

            if (o.range) {
                _.element.html(o.rangeTpl(month, day, year, exchange, symbol));
            } else {
                _.element.html(o.moduleTpl(month, day, year, exchange, symbol));
            }

            o.selects.onMonthChange(_);

            if (o.onFirstLoad !== undefined && typeof (o.onFirstLoad) === 'function') {
                o.onFirstLoad(_);
            }
        },

        _getHistoricalData: function (startDate, endDate) {
            var _ = this,
                o = _.options,
                stockData = {},
                query = _._queryStringToObj(location.href.toLowerCase().split('?').pop());

            // Overwrite the default indice if one is set through a query string ?Indice=EX:SYM

            /*if (query.indice !== undefined){
                stockData.exchange = query.indice.split(':').shift()
                stockData.symbol = query.indice.split(':').pop()
            }*/
            var exchange = o.stock[0].split(':')[0],
                symbol = o.stock[0].split(':')[1];

            if (o.usePublic) {
                var dataObj = {
                    exchange: exchange,
                    symbol: symbol,
                    apiKey: o.apiKey,
                    pageSize: _._loaded ? o.maxItems : o.loadItems
                };

                if (startDate !== undefined) {
                    var s = startDate.toString().split(' '),
                        e = endDate.toString().split(' ');

                    dataObj.startDate = s[1] + '-' + s[2] + '-' + s[3],
                        dataObj.endDate = e[1] + '-' + e[2] + '-' + e[3]
                }

                $.ajax({
                    type: "GET",
                    url: o.url + "/feed/StockQuote.svc/GetStockQuoteHistoricalList",
                    data: dataObj,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data) {
                    data = data.GetStockQuoteHistoricalListResult;

                    _._buildStockTable(data);

                    if (!_._loaded && data.length) {
                        _._loaded = true;
                        _._setSelectDate(data[0].HistoricalDate.split(' ').shift());
                        _._onRangeRefresh();
                    }

                    if (o.onDataLoad !== undefined && typeof (o.onDataLoad) === 'function') {
                        o.onDataLoad(_, data);
                    }

                });
            } else {

                stockData = $.extend(_._dataDto(), stockData);

                if (startDate !== undefined) {
                    stockData.startDate = '/Date(' + startDate + ')/';
                    stockData.endDate = '/Date(' + endDate + ')/';
                }

                stockData.serviceDto.ItemCount = _._loaded ? o.maxItems : o.loadItems

                $.ajax({
                    type: "POST",
                    url: "/services/StockQuoteService.svc/GetStockQuoteHistoricalList",
                    data: JSON.stringify(stockData),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data) {
                    data = data.GetStockQuoteHistoricalListResult;

                    _._buildStockTable(data);

                    if (!_._loaded && data.length) {
                        _._loaded = true;
                        _._setSelectDate(data[0].HistoricalDate.split(' ').shift());
                        _._onRangeRefresh();
                    }

                    if (o.onDataLoad !== undefined && typeof (o.onDataLoad) === 'function') {
                        o.onDataLoad(_, data);
                    }
                });
            }
        },

        _buildStockTable: function (data) {
            var _ = this, o = _.options, table = o.stockHeader;

            if (data !== undefined && data.length) {
                $.each(data, function (i, stock) {
                    var stockData = {
                        day: $.datepicker.formatDate(o.dateFormat, new Date(stock.HistoricalDate)),
                        high: _._addCommas(stock.High.toFixed(2)),
                        last: _._addCommas(stock.Last.toFixed(2)),
                        low: _._addCommas(stock.Low.toFixed(2)),
                        open: _._addCommas(stock.Open.toFixed(2)),
                        volume: _._addCommas(stock.Volume)
                    };

                    table += Mustache.render(o.stockTpl, stockData);
                });
            } else {
                table = o.itemNotFoundMessage;
            }

            _.element.find('.' + o.stockTableClass.replace(/ /g, '.')).html(table);
            this._trigger('complete');
        },

        setStock: function(value) {
            var inst = this, o = this.options;
            $.extend( o, { stock: value});
            inst._loaded = false;
            inst._init();
        },

        destroy: function () {
            this.element.html('');
        },

        _setOption: function (option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);