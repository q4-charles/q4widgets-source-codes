(function($) {
    /**
     * Simple SEC Filing Widgets for Public Sites.
     * @class q4.secfilings
     * @version 1.0.1
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.secfilings", {
        options: {
            /*
             * Public site url
             * @type {string}
             * @default
             */
            site: '',
            /*
             * Date format
             * @type {string}
             * @default
             */
            dateFormat: 'MM dd, yy',
            /*
             * Loading image / text to display during Ajax calls.
             * @type {string}
             * @default
             */
            loading: '<img src="img/ajax-loader.gif" alt="loading..." />',
            /*
             * Message to display when no items are found
             * @type {string}
             * @default
             */
            noItemsTpl: 'There are no items available',
            /*
             * Public API Parameters
             * Requires apiKey, symbol & exchange
             * @type {object}
             * @default
             */
            params: {
                'apiKey': '',
                'symbol': '',
                'exchange': 'CIK'
            },
            /*
             * Template used for filters. Currently only supports a select
             * @type {object}
             * @default
             */
            filingTypeTpl: (
                '<select class="q4-type">' +
                    '<option selected="selected" value="">All Form Types</option>' +
                    '<option value="1,4">Annual Filings</option>' +
                    '<option value="2">Quarterly Filings</option>' +
                    '<option value="9,40">Current Reports</option>' +
                    '<option value="11,17">Proxy Filings</option>' +
                    '<option value="41">Registration Statements</option>' +
                    '<option value="13">Section 16 Filings</option>' +
                    '<option value="3,20,21,30,33,34,35,36,37,42">Other Filings</option>' +
                '</select>'
            ),
            /*
             * Mustache Template to build year options. Currently only supports a select
             * @type {object}
             * @default
             */
            filingYearTpl: (
                '<select class="q4-years">' +
                    '{{#.}}' +
                        '<option value="{{.}}">{{.}}</option>' +
                    '{{/.}}' +
                '</select>'
            ),
            /*
             * Template for all Fillings list items
             * @type {object}
             * @default
             */
            filingListTpl: (
                '<div class="q4-filing-item q4-header">' +
                    '<span class="q4-date">Date</span>' +
                    '<span class="q4-type">Filing Type</span>' +
                    '<span class="q4-desc">Filing Description</span>' +
                    '<span class="q4-docs">Download / View</span>' +
                '</div>' +
                '{{#.}}' +
                    '<div class="q4-filing-item">' +
                        '<span class="q4-date">{{date}}</span>' +
                        '<span class="q4-type">{{type}}</span>' +
                        '<span class="q4-desc">{{desc}}</span>' +
                        '{{{docs}}}' +
                    '</div>' +
                '{{/.}}'
            ),
            /*
             * Template for filing documents.
             * This template can be inserted into the filingListTpl
             * @type {object}
             * @default
             */
            filingDocTpl: (
                '<ul>' +
                    '{{#.}}' +
                        '{{#Url}}<li class="{{DocumentType}}"><a href="{{Url}}"></a></li>{{/Url}}' +
                    '{{/.}}' + 
                '</ul>'
            ),
            /*
             * A callback that fires right after the widget has been initiated.
             * @type {function}
             */
            beforeLoad: function(){}
        },

        _init: function() {
            var inst = this;

            if (inst.options.beforeLoad !== undefined && typeof(inst.options.beforeLoad) === 'function') {
                inst.options.beforeLoad();
            }

            inst.element.append('<div class="q4-controls"></div><div class="q4-filings">'+ inst.options.loading +'</div>');
            inst._onFilterChange();
            inst._getYears();
        },

        _onYearChange: function() {
            var inst = this;

            inst.element.find('.q4-controls').on('change', '.q4-years', function(){
                inst.element.find('.q4-filings').html(inst.options.loading);
                inst._getFilings( $(this).val(), $('.q4-type option:selected').val() );
            });
        },

        _onFilterChange: function() {
            var inst = this;

            inst.element.find('.q4-controls').on('change', '.q4-type', function(){
                inst.element.find('.q4-filings').html(inst.options.loading);
                inst._getFilings( $('.q4-years option:selected').val(), $(this).val() );
            });
        },

        _getData: function (url, params) {
            return $.ajax({
                type: 'GET',
                url: url,
                data: params,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            });
        },

        _getYears: function(ticker){
            var inst = this,
                o = this.options;

            inst._getData(o.site + '/feed/SECFiling.svc/GetEdgarFilingYearList', o.params).done(function (data) {
                inst.element.find('.q4-controls').append( Mustache.render(o.filingYearTpl, data.GetEdgarFilingYearListResult) + o.filingTypeTpl);
                inst._getFilings(data.GetEdgarFilingYearListResult[0], '');
                inst._onYearChange();
            });
        },

        _getFilings: function(selectedYear, selectedFilter){
            var inst = this,
                o = this.options,
                output;

            inst._getData(o.site + '/feed/SECFiling.svc/GetEdgarFilingList', $.extend({}, o.params, {
                year: selectedYear,
                formGroupIdList: selectedFilter
            })).done(function (data) {
                var items = [];

                    $.each(data.GetEdgarFilingListResult, function(i, filing){
                        items.push({
                            date: $.datepicker.formatDate(o.dateFormat, new Date(filing.FilingDate)),
                            type: filing.FilingTypeMnemonic,
                            desc: filing.FilingDescription,
                            docs: Mustache.render(o.filingDocTpl, filing.DocumentList)
                        })
                    });

                if (data.GetEdgarFilingListResult.length) {
                    output = Mustache.render(o.filingListTpl, items);
                } else {
                    output = o.noItemsTpl;
                }

                inst.element.find('.q4-filings').html( output );
            });
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);