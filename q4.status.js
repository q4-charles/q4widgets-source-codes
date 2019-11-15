(function($) {
    /**
     * A small heathcheck tool for QA
     * @class q4.status
     * @version 1.0.0
    */
    $.widget("q4.status", {
        options: {
            tpl: {
                indice: (
                    '<div class="indice">' +
                        '<h3>{{length}}</h3>' +
                        '<h4>{{title}}</h4>' +
                        '<ul>' +
                        '{{#GetLookupListResult}}' +
                            '<li><a href="{{url}}" target="_blank">{{Value}}</a></li>' +
                        '{{/GetLookupListResult}}' +
                        '</ul>' +
                    '</div>'
                )
            }
        },

        _create: function() {
            this._getStockIndices();
            this._getSECIndices();
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
            return $.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify(params),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            });
        },

        _getStockIndices: function(ticker){
            var inst = this;

            inst._getData('/Services/LookupService.svc/GetLookupList', 
                $.extend( inst._buildParams(), {
                    lookupType: 'indices'
                })
            ).done(function (data) {
                if (data.GetLookupListResult.length){
                    data.length = data.GetLookupListResult.length;
                    data.title = 'Indices';

                    $.each(data.GetLookupListResult, function(i, item){
                        item.symbol = item.Value.split(':')[1].replace('.CA', '.TO');
                        item.exchange = item.Value.split(':')[0];
                        item.url = 'https://finance.yahoo.com/q?s='+ item.symbol +'&ql=1';
                    });

                } else {
                    data = { length: 0, title: 'No Indices' };
                }

                inst.element.append(Mustache.render(inst.options.tpl.indice, data));
            });
        },

        _getSECIndices: function(ticker){
            var inst = this;

            inst._getData('/Services/LookupService.svc/GetLookupList', 
                $.extend( inst._buildParams(), {
                    lookupType: 'SECindices'
                })
            ).done(function (data) {
                if (data.GetLookupListResult.length){
                    data.length = data.GetLookupListResult.length;
                    data.title = 'SEC Indices';

                    $.each(data.GetLookupListResult, function(i, item){
                        item.url = 'http://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK='+ item.Value.split(':').pop(); +'&owner=exclude&count=40&hidefilings=0' 
                    });

                } else {
                    data = { length: 0, title: 'No SEC Indices' };
                }
                
                inst.element.append(Mustache.render(inst.options.tpl.indice, data));
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


