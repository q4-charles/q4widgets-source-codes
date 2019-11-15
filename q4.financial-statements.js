(function($) {
    /**
     * Institutional Data from Zacks.
     * 
     * For the Institutions widget, the option "showNegatives" will toggle how negative numbers appear. 
     *      When true, negative numbers will be rendered with a minus symbol. 
     *      When false, negative numbers will be rendered inside parenthesis.
     *
     * @class q4.financialStatements
     * @version 1.0.3
     * @requires [Mustache.js](lib/mustache.min.js)
     * @example
     * <div class="institution"></div>
     * <script type="text/javascript">
     * $('.institution').institution({
     *     symbol: 'FCE',
     *     key: 'q4:761b75ad18e68a1aaca4aaaff85d7887',
     *     showNegatives: false
     * });
     * </script>
     *
     * <div class="ratios"></div>
     * <script type="text/javascript">
     * $('.ratios').ratios({
     *     symbol: 'FCE',
     *     key: 'q4:761b75ad18e68a1aaca4aaaff85d7887',
     *     industryNameIndex: 0, // In the zacks feed, this is the index number of the object inside the "IND" array that contains this name. Usually 0 or 1.
     *     sectorNameIndex: 0 // In the zacks feed, this is the index number of the object inside the "SEC" array that contains this name. Usually 0 or 1.
     * });
     * </script>
     *
     * <div class="income-statements"></div>
     * <script type="text/javascript">
     * $('.income-statements').incomeStatements({
     *     symbol: 'FCE',
     *     key: 'q4:761b75ad18e68a1aaca4aaaff85d7887'
     * });
     * </script>
     *
     * <div class="cashflow"></div>
     * <script type="text/javascript">
     * $('.cashflow').cashflow({
     *     symbol: 'FCE',
     *     key: 'q4:761b75ad18e68a1aaca4aaaff85d7887'
     * });
     * </script>
     */
    $.widget("q4.financialStatements", /** @lends q4.financialStatements */ {
        options: {
            dollar: '',
            toFixed: 2,
            load: {
                type: ['incomeStatements', 'balanceSheet', 'cashflow', 'ratios'],
                cls: ['.tab1', '.tab2', '.tab3', '.tab4']
            },
            symbol: '',
            key: ''
        },

        _create: function() {
            this.loadFeeds();
        },

        loadFeeds: function(){
            var _ = this;

            $.each(this.options.load.type, function(i, functionName){
                $(_.options.load.cls[i])[functionName]({
                    dollar: _.options.dollar,
                    toFixed: _.options.toFixed,
                    symbol: _.options.symbol,
                    key: _.options.key
                });
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

(function($) {
    $.widget("q4.institution", {
        options: {
            cls: 'q4Table',
            proxy: 'https://q4modules.herokuapp.com/proxy?url=',
            symbol: '',
            dollar: '$',
            toFixed: 2,
            showNegatives: false,
            institution: '.institution',
            mutual: '.mutual',
            key: '',
            title: function(data, symbol){
                var title = 
                '<div id="pagetitle">Ratios and Statistics for '+data.CMP[symbol].name+' - '+symbol+' <span>Industry: '+data.IND[1].name+'</span></div>' +
                '<span class="date">Data updated through fiscal quarter reported '+data.CMP[symbol].sec_report_date.substring(0,2)+'/'+data.CMP[symbol].sec_report_date.substring(2,6)+'</span>';

                return title;
            },
            header: function(type){
                var row =
                '<tr class="heading">' +
                    '<th></th>' +
                    '<th>Shares Held</th>' +
                    '<th>% O/S</th>' +
                    '<th>Share Change</th>' +
                    '<th>Filing Date</th>' +
                '</tr>';

                return row;
            },
            row: function(type){
                var row = 
                '{{#'+ type +'}}' +
                    '<tr {{#alt}}{{/alt}}>' +
                        '<td>{{inst_name}}</td>' +
                        '<td>{{#toFixed}}{{q0_shares}}{{/toFixed}}</td>' +
                        '<td>{{ownership_pct}}%</td>' +
                        '<td>{{chg_shares}}</td>' +
                        '<td>{{q0_yymmdd}}</td>' +
                    '</tr>' +
                '{{/'+ type +'}}';

                return row;
            }
        },

        _create: function() {
            this.getRatios();
        },

        getRatios: function(){
            var _ = this;
            
            $.getJSON( _.options.proxy + 'http://1.widget3.zacks.com/data/institution/json/'+ _.options.symbol +'/'+ _.options.key + '?callback=?', function(data) {
                _.buildTable(data[_.options.symbol].detail);
            });
        },

        num: 0,

        buildTable: function(data){
            var _ = this, o = _.options;


            data.toFixed = function() {
                return function (text, render) {
                    var string = render(text);

                    var addCommas = function(nStr) {
                        nStr += '';
                        x = nStr.split('.');
                        x1 = x[0];
                        x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return x1 + x2;
                    };

                    if (string.length){
                        var num = parseFloat(render(text));
                        if (o.showNegatives) {
                            return num >= 0.00 ? addCommas(num) : '<span class="negative-num">-'+ addCommas(-num) +'</span>';
                        } else return num >= 0.00 ? addCommas(num) : '<span class="negative-num">('+ addCommas(-num) +')</span>';
                    } else {
                        return 'n/a'; 
                    }
                }
            };

            data.wrapNegatives = function() {
                 return function (text, render) {
                    var string = render(text);

                    if (string.length){
                        var num = parseFloat(string);
                        return num >= 0.00 ? num : '<span class="negative-num">'+ num +'</span>';
                    }
                }
            };

            data.alt = function() {
                return function (text, render) {
                    _.num++
                    return _.num%2 ? 'class=even' : 'class=odd';
                }
            };

            var instiTpl = '<table class="'+ o.cls +'">'+ o.header() + o.row('Institution') +'</table',
                mutualTpl = '<table class="'+ o.cls +'">'+ o.header() + o.row('Mutual Fund') +'</table';

            this.element.find(o.mutual).html(Mustache.render(instiTpl, data));
            this.element.find(o.institution).html(Mustache.render(mutualTpl, data));

        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);


(function($) {
    $.widget("q4.ratios", {
        options: {
            cls: 'q4Table',
            proxy: 'https://q4modules.herokuapp.com/proxy?url=',
            symbol: '',
            dollar: '$',
            toFixed: 2,
            key: '',
            industryNameIndex: 0,
            sectorNameIndex: 0,
            title: function(data, symbol, industryNameIndex, sectorNameIndex){
                var title = (
                    '<div id="pagetitle">Ratios and Statistics for '+
                        data.CMP[symbol].name +' - '+symbol+' <span>Industry: '+data.IND[industryNameIndex].name+'</span>' + ' <span>Sector: '+data.SEC[sectorNameIndex].name+'</span>' +
                    '</div>' +
                    '<span class="date">' +
                        'Data updated through fiscal quarter reported '+data.CMP[symbol].sec_report_date.substring(0,2)+'/'+data.CMP[symbol].sec_report_date.substring(2,6)+
                    '</span>'
                )

                return title;
            },
            header: function(type){
                var row =
                '<tr class="heading">' +
                    '<th width="40%">'+ type +'</th>' +
                    '<th width="15%">Company</th>' +
                    '<th width="15%">Industry</th>' +
                    '<th width="15%">Sector</th>' +
                    '<th width="15%">S&amp;P 500</th>' +
                '</tr>';

                return row;
            },
            row: function(type, name, item, cls, symbol, industryNameIndex, sectorNameIndex){
                var row = 
                '<tr class="'+item+' '+cls+'">' +
                    '<td>'+name+'</td>' +
                    '<td>{{#CMP}}{{#'+symbol+'}}{{#'+type+'}}{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/'+type+'}}{{/'+symbol+'}}{{/CMP}}</td>' +
                    '<td>{{#IND.'+industryNameIndex+'}}{{#'+type+'}}{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/'+type+'}}{{/IND.'+industryNameIndex+'}}</td>' +
                    '<td>{{#SEC.'+sectorNameIndex+'}}{{#'+type+'}}{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/'+type+'}}{{/SEC.'+sectorNameIndex+'}}</td>' +
                    '<td>{{#CMP}}{{#SPAL}}{{#'+type+'}}{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/'+type+'}}{{/SPAL}}{{/CMP}}</td>' +
                '</tr>';

                return row;
            }
        },

        _create: function() {
            this.getRatios();
        },

        getRatios: function(){
            var _ = this;

            $.getJSON( _.options.proxy + 'http://1.widget3.zacks.com/data/ratio/json/'+ _.options.symbol +'/'+ _.options.key + '?callback=?', function(data) {
                _.buildTable(data);
            });
        },

        buildTable: function(data){
            var o = this.options;

            data.toFixed = function() {
                return function (text, render) {
                    var string = render(text);

                    var addCommas = function(nStr) {
                        nStr += '';
                        x = nStr.split('.');
                        x1 = x[0];
                        x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return x1 + x2;
                    };

                    if (string.length){
                        var num = parseFloat(render(text)).toFixed(o.toFixed);
                        return num >= 0.00 ? addCommas(num) : '('+ addCommas(-num) +')';
                    } else {
                        return 'n/a'; 
                    }
                }
            };

            var symbol = o.symbol,
                table = 
                o.title(data, symbol, o.industryNameIndex, o.sectorNameIndex) +
                '<table class="'+o.cls+'" width="100%" border="0" cellspacing="0" cellpadding="4">' +
                    '<tbody>' +
                        o.header('Valuation Ratios') +
                        o.row('valuation', 'P/E Ratio', 'pe_ratio', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', 'P/E High - Last 5 Years', 'f5yr_hi_pe', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', 'P/E Low - Last 5 Years', 'f5yr_lo_pe', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', 'Beta', 'beta', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', 'Price to Sales', 'price_to_sales', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', 'Price to Book', 'price_to_book', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', 'Price to Cash Flow', 'price_to_cash', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', 'Price to Free Cash Flow', 'pr_free_c_f', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('valuation', '% Owned Institutions', 'perc_institut', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.header('Dividends') +
                        o.row('dividends', 'Dividend Yield', 'div_yield', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('dividends', 'Dividend Yield - 5 Year Avg.', 'div_yield_avg_5y', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('dividends', 'Dividend Yield Year Growth Rate', 'trend_divg', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('dividends', 'Payout Ratio', 'payout_ratio', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.header('Growth Rates (%)') +
                        o.row('growth', 'Sales (MRQ) vs Qtr 1 Yr Ago', 'sls_gr_q0_q1', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('growth', 'Sales (TTM) vs TTM 1 Yr Ago', 'sls_gr_12m_curr_last', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('growth', 'Sales - 5 Yr. Growth Rate', 'trend_sale', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('growth', 'EPS (MRQ) vs Qtr. 1 Yr. Ago', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('growth', 'EPS (TTM) vs TTM 1 Yr. Ago', 'eps_q0_neg4', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('growth', 'EPS - 5 Yr. Growth Rate', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('growth', 'Capital Spending - 5 Yr. Growth Rate', 'cs_5y_gr_rt', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.header('Financial Strength') +
                        o.row('strength', 'Quick Ratio (MRQ)', 'quick_ratio', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('strength', 'Current Ratio (MRQ)', 'current_ratio', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('strength', 'LT Debt to Equity (MRQ)', 'lt_deb_eqt', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('strength', 'Total Debt to Equity (MRQ)', 'debt_to_equity', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('strength', 'Interest Coverage (TTM)', 'interest_coverage', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.header('Profitability Ratios') +
                        o.row('profitability', 'Gross Margin (TTM)', 'gross_marg', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Gross Margin - 5 Yr. Avg.', 'gr_mar_5y_av', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'EBITD Margin (TTM)', 'ebitd_mar', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'EBITD Margin - 5 Yr. Avg.', 'ebitd_5y_av', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Operating Margin (TTM)', 'oper_mrgn_12m', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Operating Margin - 5 Yr. Avg.', 'op_mar_5y_av', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Pre-Tax Margin (TTM)', 'pretax_mrgn_12m', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Pre-Tax Margin - 5 Yr. Avg.', 'pretax_mrgn_5y', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Net Profit Margin (TTM)', 'net_mrgn_12m', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Net Profit Margin - 5 Yr. Avg.', 'f5yr_avg_net_mrgn', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Effective Tax Rate(TTM)', 'eff_tax_rt', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('profitability', 'Effective Tax Rate - 5 Yr. Avg.', 'eff_tax_r_5y_av', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.header('Management Effectiveness (%)') +
                        o.row('effectiveness', 'Return on Assets (TTM)', 'f5yr_avg_roa', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('effectiveness', 'Return on Assets - 5 Yr. Avg.', 'roi', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('effectiveness', 'Return on Investment (TTM)', 'f5yr_avg_roi', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('effectiveness', 'Return on Investment - 5 Yr. Avg.', 'roe', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('effectiveness', 'Return on Equity (TTM)', 'f5yr_avg_roe', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('effectiveness', 'Return on Equity - 5 Yr. Avg.', 'f5yr_avg_roe', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.header('Efficiency') +
                        o.row('efficiency', 'Revenue/Employee (TTM)', 'rev_emp', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('efficiency', 'Net Income/Employee (TTM)', 'net_inc_emp', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('efficiency', 'Receivable Turnover (TTM)', 'rec_turnover', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('efficiency', 'Inventory Turnover (TTM)', 'inv_turnover', 'odd', symbol, o.industryNameIndex, o.sectorNameIndex) +
                        o.row('efficiency', 'Asset Turnover (TTM)', 'asset_utilization', 'even', symbol, o.industryNameIndex, o.sectorNameIndex) +
                    '</tbody>' +
                '</table>';

            this.element.html(Mustache.render(table, data));
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);

(function($) {
    $.widget("q4.incomeStatements", {
        options: {
            cls: 'q4Table',
            proxy: 'https://q4modules.herokuapp.com/proxy?url=',
            symbol: '',
            key: '',
            dollar: '$',
            toFixed: 2,
            /*title: function(data){
                var title = 
                '<div id="pagetitle">Ratios and Statistics for '+data.CMP[symbol].name+' - '+symbol+' <span>Industry: '+data.IND[1].name+'</span></div>' +
                '<span class="date">Data updated through fiscal quarter reported '+data.CMP[symbol].sec_report_date.substring(0,2)+'/'+data.CMP[symbol].sec_report_date.substring(2,6)+'</span>';

                return title;
            },*/
            header: function(type, cls){
                var row =
                '<tr class="header '+cls+'">' +
                    '<th>'+type+'</td>' +
                    '<th>{{#'+this.symbol+'}}{{#ais.1}}{{ais_fy}}{{/ais.1}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#ais.2}}{{ais_fy}}{{/ais.2}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#ais.3}}{{ais_fy}}{{/ais.3}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#ais.4}}{{ais_fy}}{{/ais.4}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#ais.5}}{{ais_fy}}{{/ais.5}}{{/'+this.symbol+'}}</th>' +
                '</tr>';

                return row;
            },
            row: function(name, item, cls, sym, calc){
                var price;

                if (calc) {
                    item = item.split(',');
                    price = '{{#subtract}}{{'+item[0]+'}},{{'+item[1]+'}}{{/subtract}}';
                } else {
                    price = '{{'+item+'}}';
                }

                var row = 
                '<tr class="'+item+' '+cls+'">' +
                    '<td>'+name+'</td>' +
                    '<td>{{#'+this.symbol+'}}{{#ais.1}}'+ sym +'{{#toFixed}}'+price+'{{/toFixed}}{{/ais.1}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#ais.2}}'+ sym +'{{#toFixed}}'+price+'{{/toFixed}}{{/ais.2}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#ais.3}}'+ sym +'{{#toFixed}}'+price+'{{/toFixed}}{{/ais.3}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#ais.4}}'+ sym +'{{#toFixed}}'+price+'{{/toFixed}}{{/ais.4}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#ais.5}}'+ sym +'{{#toFixed}}'+price+'{{/toFixed}}{{/ais.5}}{{/'+this.symbol+'}}</td>' +
                '</tr>';

                return row;
            }
        },

        _create: function() {
            this.getIncomeAPI();
        },

        getIncomeAPI: function(){
            var _ = this;

            $.getJSON( _.options.proxy + 'http://1.widget3.zacks.com/data/core/json/'+ _.options.symbol +'/AIS/'+ _.options.key + '?callback=?', function(data) {
                _.buildTable(data);
            });
        },

        buildTable: function(data){
            var o = this.options;

            data.toFixed = function() {
                return function (text, render) {
                    var string = render(text);

                    var addCommas = function(nStr) {
                        nStr += '';
                        x = nStr.split('.');
                        x1 = x[0];
                        x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return x1 + x2;
                    };

                    if (string.length){
                        var num = parseFloat(render(text)).toFixed(o.toFixed);
                        return num >= 0.00 ? addCommas(num) : '('+ addCommas(-num) +')';
                    } else {
                        return 'n/a'; 
                    }
                }
            };

            data.subtract = function() {
                return function (text, render) {
                    var num = render(text).split(',');
                    return num[0] - num[1];
                }
            };

            var symbol = o.symbol,
                table = 
                //o.title(data) +
                '<table class="'+o.cls+'" width="100%" border="0" cellspacing="0" cellpadding="4">' +
                    '<tbody>' +
                        o.header('Period Ending', '') +
                        o.row('Sales', 'ais_net_sales', '', '$') +
                        o.row('Cost Of Goods', 'ais_cost_of_goods', 'border-bottom', o.dollar) +
                        o.row('Gross Profit', 'ais_gross_profit', 'bold padding-bottom', '$') +
                        o.row('SG&A, R&D, and Dept/Amort Expenses', 'ais_sell_amort_exp', 'border-bottom', o.dollar) +
                        o.row('Income After SG&A, R&D, Dept/Amort Expenses', 'ais_income_after_depr', 'bold padding-bottom', '$') +
                        o.row('Non-Operating Income', 'ais_non_op_income', '', o.dollar) +
                        o.row('Interest Expense', 'ais_interest_expense', 'border-bottom', o.dollar) +
                        o.row('Pretax Income', 'ais_pretax_income', 'bold padding-bottom', '$') +
                        o.row('Income Taxes', 'ais_inc_tax_prov', '', o.dollar) +
                        o.row('Minority Interest', 'ais_minority_interest', '', o.dollar) +
                        o.row('Investment Gains/Losses', 'ais_gains_losses', '', o.dollar) +
                        o.row('Other Income/Charges', 'ais_other_income_charges', 'border-bottom', o.dollar) +
                        o.row('Income From Cont. Operations', 'ais_inc_before_operations', 'bold padding-bottom', '$') +
                        o.row('Extras & Discontinued Operations', 'ais_discontinued_operations', 'double-border-bottom', o.dollar) +
                        o.row('Net Income', 'ais_net_income', 'bold padding-bottom', '$') +
                        '<tr class="header black"><th colspan="6">Depreciation Footnote</th></tr>' +
                        o.row('Income Before Depreciation & Amortization', 'ais_income_before_depr', '', o.dollar) +
                        o.row('Depreciation & Amortization (Cash Flow)', 'ais_cash_flow', 'double-border-bottom', o.dollar) +
                        o.row('Income After Depreciation & Amortization', 'ais_income_before_depr,ais_cash_flow', 'bold padding-bottom', '$', true) +
                        o.row('Average Shares', 'ais_avg_shares', 'highlight', o.dollar) +
                        o.row('Diluted EPS Before Non-Recurring Items', 'ais_diluted_gross_eps', 'highlight', '$') +
                        o.row('Diluted Net EPS', 'ais_diluted_net_eps', 'highlight', '$') +
                    '</tbody>' +
                '</table>';

            this.element.html(Mustache.render(table, data));
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);

(function($) {
    $.widget("q4.balanceSheet", {
        options: {
            cls: 'q4Table',
            proxy: 'https://q4modules.herokuapp.com/proxy?url=',
            symbol: '',
            dollar: '$',
            toFixed: 2,
            key: '',
            header: function(type, cls){
                var row =
                '<tr class="header '+cls+'">' +
                    '<th>'+type+'</td>' +
                    '<th>{{#'+this.symbol+'}}{{#abs.1}}{{abs_fy}}{{/abs.1}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#abs.2}}{{abs_fy}}{{/abs.2}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#abs.3}}{{abs_fy}}{{/abs.3}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#abs.4}}{{abs_fy}}{{/abs.4}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#abs.5}}{{abs_fy}}{{/abs.5}}{{/'+this.symbol+'}}</th>' +
                '</tr>';

                return row;
            },
            row: function(name, item, cls, sym){
                var row = 
                '<tr class="'+item+' '+cls+'">' +
                    '<td>'+name+'</td>' +
                    '<td>{{#'+this.symbol+'}}{{#abs.1}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/abs.1}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#abs.2}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/abs.2}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#abs.3}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/abs.3}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#abs.4}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/abs.4}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#abs.5}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/abs.5}}{{/'+this.symbol+'}}</td>' +
                '</tr>';

                return row;
            }
        },

        _create: function() {
            this.getBalanceAPI();
        },

        getBalanceAPI: function(){
            var _ = this;

            $.getJSON( _.options.proxy + 'http://1.widget3.zacks.com/data/core/json/'+ _.options.symbol +'/ABS/'+ _.options.key + '?callback=?', function(data) {
                _.buildTable(data);
            });
        },

        buildTable: function(data){
            var o = this.options;

            data.toFixed = function() {
                return function (text, render) {
                    var string = render(text);

                    var addCommas = function(nStr) {
                        nStr += '';
                        x = nStr.split('.');
                        x1 = x[0];
                        x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return x1 + x2;
                    };

                    if (string.length){
                        var num = parseFloat(render(text)).toFixed(o.toFixed);
                        return num >= 0.00 ? addCommas(num) : '('+ addCommas(-num) +')';
                    } else {
                        return 'n/a'; 
                    }
                }
            };

            var symbol = o.symbol,
                table = 
                '<table class="'+o.cls+'" width="100%" border="0" cellspacing="0" cellpadding="4">' +
                    '<tbody>' +
                        o.header('Period Ending', '') +
                        '<tr class="header black"><th colspan="6">Assets</th></tr>' +
                        o.row('Cash & Equivalents', 'abs_cash_equiv', '', '$') +
                        o.row('Receivables', 'abs_receivables', '', o.dollar) +
                        o.row('Notes Receivable', 'abs_notes_receivable', '', o.dollar) +
                        o.row('Inventories', 'abs_inventories', '', o.dollar) +
                        o.row('Other Current Assets', 'abs_oth_cur_assets', 'border-bottom', o.dollar) +
                        o.row('Total Current Assets', 'abs_total_cur_assets', 'bold padding-bottom', '$') +
                        o.row('Net Property & Equipment', 'abs_net_ppe', '', o.dollar) +
                        o.row('Investments & Advances', 'abs_investments', '', o.dollar) +
                        o.row('Other Non-Current Assets', 'abs_oth_non_cur_assets', '', o.dollar) +
                        o.row('Deferred Charges', 'abs_deferred_charges', '', o.dollar) +
                        o.row('Intangibles', 'abs_intagibles', '', o.dollar) +
                        o.row('Deposits & Other Assets', 'abs_deposits', 'double-border-bottom', o.dollar) +
                        o.row('Total Assets', 'abs_total_assets', 'bold padding-bottom', '$') +
                        '<tr class="header black"><th colspan="6">Liabilities & Shareholder\'s Equity</th></tr>' +
                        o.row('Notes Payable', 'abs_notes_payable', '', o.dollar) +
                        o.row('Accounts Payable', 'abs_accounts_payable', '', o.dollar) +
                        o.row('Current Portion Long-Term Debt', 'abs_curr_long_term_debt', '', o.dollar) +
                        o.row('Current Portion Capital Leases', 'abs_curr_cap_leases', '', o.dollar) +
                        o.row('Accrued Expenses', 'abs_accrued_expenses', '', o.dollar) +
                        o.row('Income Taxes Payable', 'abs_inc_taxes_payable', '', o.dollar) +
                        o.row('Other Current Liabilities', 'abs_oth_cur_liab', 'border-bottom', o.dollar) +
                        o.row('Total Current Liabilities', 'abs_total_cur_liab', 'bold padding-bottom', '$') +
                        '<tr class="header black"><th colspan="6">Shareholder\'s Equity</th></tr>' +
                        o.row('Preferred Stock', 'abs_preferred_stock', '', o.dollar) +
                        o.row('Common Stock (Par)', 'abs_common_stock', '', o.dollar) +
                        o.row('Capital Surplus', 'abs_captial_surplus', '', o.dollar) +
                        o.row('Retained Earnings', 'abs_retained_earnings', '', o.dollar) +
                        o.row('Other Equity', 'abs_other_equity', '', o.dollar) +
                        o.row('Treasury Stock', 'abs_treasury_stock', 'double-border-bottom', o.dollar) +
                        o.row('Total Shareholder\'s Equity', 'abs_tot_shareholder_equity', 'bold padding-bottom', '$') +
                        o.row('Total Liabilities & Shareholders Equity', 'abs_tot_liab_sh_equity', 'bold padding-bottom border-top', '$') +
                        o.row('Total Common Equity', 'abs_total_common_equity', 'highlight', '$') +
                        o.row('Shares Outstanding', 'abs_shares_outstanding', 'highlight', o.dollar) +
                        o.row('Book Value Per Share', 'abs_book_value_per_share', 'highlight', '$') +
                    '</tbody>' +
                '</table>';

            this.element.html(Mustache.render(table, data));
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);

(function($) {
    $.widget("q4.cashflow", {
        options: {
            cls: 'q4Table',
            proxy: 'https://q4modules.herokuapp.com/proxy?url=',
            symbol: '',
            dollar: '$',
            toFixed: 2,
            key: '',
            header: function(type, cls){
                var row =
                '<tr class="header '+cls+'">' +
                    '<th>'+type+'</td>' +
                    '<th>{{#'+this.symbol+'}}{{#acf.1}}{{acf_fy}}{{/acf.1}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#acf.2}}{{acf_fy}}{{/acf.2}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#acf.3}}{{acf_fy}}{{/acf.3}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#acf.4}}{{acf_fy}}{{/acf.4}}{{/'+this.symbol+'}}</th>' +
                    '<th>{{#'+this.symbol+'}}{{#acf.5}}{{acf_fy}}{{/acf.5}}{{/'+this.symbol+'}}</th>' +
                '</tr>';

                return row;
            },
            row: function(name, item, cls, sym){
                var row = 
                '<tr class="'+item+' '+cls+'">' +
                    '<td>'+name+'</td>' +
                    '<td>{{#'+this.symbol+'}}{{#acf.1}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/acf.1}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#acf.2}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/acf.2}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#acf.3}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/acf.3}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#acf.4}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/acf.4}}{{/'+this.symbol+'}}</td>' +
                    '<td>{{#'+this.symbol+'}}{{#acf.5}}'+ sym +'{{#toFixed}}{{'+item+'}}{{/toFixed}}{{/acf.5}}{{/'+this.symbol+'}}</td>' +
                '</tr>';

                return row;
            }
        },

        _create: function() {
            this.getCashflowAPI();
        },

        getCashflowAPI: function(){
            var _ = this;

            $.getJSON( _.options.proxy + 'http://1.widget3.zacks.com/data/core/json/'+ _.options.symbol +'/ACF/'+ _.options.key + '?callback=?', function(data) {
                _.buildTable(data);
            });
        },

        buildTable: function(data){
            var o = this.options;

            data.toFixed = function() {
                return function (text, render) {
                    var string = render(text);

                    var addCommas = function(nStr) {
                        nStr += '';
                        x = nStr.split('.');
                        x1 = x[0];
                        x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return x1 + x2;
                    };

                    if (string.length){
                        var num = parseFloat(render(text)).toFixed(o.toFixed);
                        return num >= 0.00 ? addCommas(num) : '('+ addCommas(-num) +')';
                    } else {
                        return 'n/a'; 
                    }
                }
            };

            var symbol = o.symbol,
                table = 
                '<table class="'+o.cls+'" width="100%" border="0" cellspacing="0" cellpadding="4">' +
                    '<tbody>' +
                        o.header('Period Ending', '') +
                        '<tr class="header black"><th colspan="6">Cash Flow From Op. Inv. & Fin. Activities</th></tr>' +
                        o.row('Net Income (Loss)', 'acf_net_income', '', '$') +
                        o.row('Depreciation/Amortization & Depletion', 'acf_dda_cf', '', o.dollar) +
                        o.row('Net Change from Assets/Liabilities', 'acf_nidial', '', o.dollar) +
                        o.row('Net Cash from Discontinued Operations', 'acf_cash_from_dops', '', o.dollar) +
                        o.row('Other Operating Activities', 'acf_oth_adj_net', 'border-bottom', o.dollar) +
                        o.row('Net Cash From Operating Activities', 'acf_net_cfrom_act', 'bold padding-bottom', '$') +
                        o.row('Property & Equipment', 'acf_dif_in_ppe', '', o.dollar) +
                        o.row('Acquisition/Disposition of Subsidiaries', 'acf_oth_bus', '', o.dollar) +
                        o.row('Investments', 'acf_inves_dif', '', o.dollar) +
                        o.row('Other Investing Activities', 'acf_oth_cash_inv_act', 'border-bottom', o.dollar) +
                        o.row('Net Cash from Investing Activities', 'acf_net_cash_inv_act', 'bold padding-bottom', '$') +
                        '<tr class="header black"><th colspan="6">Uses of Funds</th></tr>' +
                        o.row('Issuance (Repurchase) of Capital Stock', 'acf_equit_shares_iss', '', o.dollar) +
                        o.row('Issuance (Repayment) of Debt', 'acf_dif_in_borr', '', o.dollar) +
                        o.row('Increase (Decrease) Short-Term Debt', 'acf_oth_cash_distr', '', o.dollar) +
                        o.row('Payment of Dividends & Other Distributions', 'acf_oth_cash_distr', '', o.dollar) +
                        o.row('Other Financing Activities', 'acf_oth_cash_fin_act', '', o.dollar) +
                        o.row('Net Cash from Financing Activities', 'acf_net_cash_fin_act', '', o.dollar) +
                        o.row('Effect of Exchange Rate Changes', 'acf_eff_exch', 'border-bottom', o.dollar) +
                        o.row('Net Cash from Investing Activities', 'acf_net_change_cash', 'bold padding-bottom', '$') +
                        '<tr class="header black"><th colspan="6">Cash and Equivalents</th></tr>' +
                        o.row('Cash at Beginning of Period', 'acf_cash_beg_year', '', o.dollar) +
                        o.row('Cash at End of Period', 'acf_cash_end_year', '', o.dollar) +
                        o.row('Diluted Net EPS', 'acf_eps_dilut', '', o.dollar) +
                    '</tbody>' +
                '</table>';

            this.element.html(Mustache.render(table, data));
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);