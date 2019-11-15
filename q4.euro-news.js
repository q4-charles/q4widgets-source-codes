(function($) {
    /**
     * A News widget which allows you to retrive data by client Exchange & Symbol.
     * @class q4.euronews
     * @version 1.0.5
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.euronews", /** @lends q4.euronews */ {
        options: {
            /**
             * The URL of the API
             * @type {string}
             * @default
             */
            url: 'https://vurosyg0xi.execute-api.us-east-1.amazonaws.com/dev/',
            /**
             * The client symbol of the company you wish to look-up
             * @default
             * @type {string}
             */
            symbol: 'AAPL',
            /**
             * The Xignite exchange code for the client
             *
             * @default
             * @type {string}
             */
            exchange: 'XNAS',
            /**
             * Client specific API Key
             * @default
             * @type {string}
             */
            apiKey: 'GfClqathzX4tZWOf2JpBZ7k2gNWzvvSD1fFJIVMi',
            /**
             * Write a list of available newswires to your console. The returned number
             * can be passed as a `newsWireId` to filter the list of items returned.
             * <pre>
             * PR Newswire   : US Press Releases XHTML     : (14)
             * PR Newswire   : Press Releases US - English : (110)
             * Business Wire : US Press Releases XHTML     : (6003)
             * Business Wire : Press Releases - English    : (25)
             * </pre>
             * @default
             * @type {string}
             */
            logProviders: true,
            /*
             * Choose which newswires to include items from. set `logProviders` to true to obtain a list of all newswires containing articles for the given client.
             * An empty string can be passed to get all available news items, however this will include duplicates.
             * @example '1,2,4,5'
             */
            providers: '1,2,4,5',
            /**
             * A CSS class to hide an element
             * @default
             * @type {string}
             */
            hiddenClass: 'js--hidden',
            /**
             * A CSS class to add to the widget while data is loading. This can be used to show and hide elements within the widget.
             * @default
             * @type {string}
             */
            loadingClass: 'js--loading',
            /**
             * A CSS class for the back button
             * @default
             * @type {string}
             */
            backClass: 'js--back',
            /**
             * TODO - Not currently supported
             * @default
             * @type {boolean}
             */
            usePagination: false,
            /**
             * Number of items to render on the page. Only used if `usePagination` is set to true
             * @default
             * @type {number}
             */
            itemsPerPage: 100,
            showYears: true,
            /**
             * TODO - Not currently supported
             * @type {string}
             * @default
             */
            paginationTpl: (
                ''
            ),
            /**
             * A date format string, which can be used in the template as `{{date}}`.
             * @example mm/dd/yy
             * @default
             * @type {string}
             */
            dateFormat: 'MM d, yy',
            /**
             * TODO - Not currently implemented inside the API
             * @type {number}
             */
            newsWireId: [],
            /**
             * A Mustache.js template for a single item for rendering the years container
             * @default
             * @type {string}
             */
            newsYearsTpl: (
                '{{#.}}<a href="#{{.}}" class="module_nav-link">{{.}}</a>{{/.}}'
            ),
            /**
             * A Mustache.js template for a single item for rendering the years container
             * @type {string}
             * @default
             */
            newsTpl: (
                '{{#.}}' +
                    '<div class="module_item">' +
                        '<div class="module_date-time">' +
                            '<span class="module_date-text">{{Date}}</span>' +
                        '</div>' +
                        '<div class="module_headline">' +
                            '<a href="#{{Id}}" data-id="{{Id}}" class="module_headline-link">' +
                                '<strong>{{Headline}}</strong>' +
                            '</a>' +
                        '</div>' +
                        '<div class="module_body">' +
                            '{{ShortBody}}' +
                        '</div>' +
                    '</div>' +
                '{{/.}}'
            ),
            /**
             * A selector for the news items, must exist within the news container.
             * @default
             * @type {string}
             */
            newsItemContainer: '.module_container--content',
            /**
             * A Mustache.js template for a single news item
             * @default
             * @type {string}
             */
            newsDetailsTpl: (
                '<a href="#" class="js--back">Go Back</a>' +
                '<div class="news-details">' + 
                    '<h3>{{Date}}</h3>' +
                    '<h2>{{Headline}}</h2>' +
                    '<p>{{{Body}}}</p>' +
                '</div>'
            ),
            /**
             * A container where news details will be added
             * @default
             * @type {string}
             */
            newsDetailsContainer: '.module_container--details',
            /**
             * A Mustache.js template which will display if there is no data for the selected ticker
             * @default
             * @type {string}
             */
            errorTpl: (
                '<p>There are no items available for {{symbol}}'
            ),
            /**
             * A selector for the years container, must exist within the news container.
             * @default
             * @type {string}
             */
            yearContainer: '.module_nav',
            /**
             * A callback that fires before the years are rendered.
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] Template data for the years list.
             */
            beforeRenderYears: function(e, tplData){},
            /**
             * A callback that fires before the items list is rendered.
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] Template data for the items list.
             */
            beforeRenderItems: function (e, tplData) {},
            /**
             * A callback that allows you to setup any require click handlers for years.
             * @default
             * @type {function}
             * @param {Event}  [event]
             * @param {Object} [options]
             */
            yearsComplete: function(e, opts) {
                // Reload items on year click
                // This could be updated to support a <select> 
                opts.$years.on('click', 'a', function(e){
                    e.preventDefault();
                    opts.$years.find('a').removeClass('selected');
                    $(this).addClass('selected');
                    
                    opts.$element.find(opts.o.newsItemContainer).addClass(opts.o.loadingClass);
                    opts.$element.news('reloadNews', $(this).text());
                }).find('a:first').addClass('selected')
            },
            /**
             * A callback that allows you to setup any require click handlers for your news items.
             * @type {function}
             * @param {Event}  [event]
             * @param {Object} [options]
             */
            itemsComplete: function(e, opts) {

            }
        },

        _create: function() {
            var inst = this, o = inst.options;

            // add loading class onto container
            inst.element.find(o.newsItemContainer).addClass(o.loadingClass);

            // check if a hashtag is set and show details
            if ( window.location.hash.length ){
                inst._showDetails( window.location.hash.replace('#', '') );
            }

            if ( o.logProviders ) {
                inst._getNewsWires();
            }

            // load news
            inst._getNewsYears();
            inst._onNewsClick();
            inst._onBack();
        },

        _getData: function (url, params) {
            var o = this.options;

            return $.ajax({
                method: "GET",
                url: url,
                headers: {
                    "x-api-key": o.apiKey
                },
                data: $.extend({}, {
                    symbol: o.symbol,
                    mic: o.exchange,
                    limit: o.itemsPerPage,
                    providerServices: o.providers
                }, params)
            })
        },

        _getNewsYears: function( ticker ) {
            var inst = this, o = inst.options;

            inst._getData(o.url + '/newsYears').done(function(newsYears){
                inst._getNews( newsYears[0] ); // Load news items for the most current year
                inst._trigger('beforeRenderYears', null, { items: newsYears });

                if (o.showYears) {
                    inst.element.find( o.yearContainer ).html( Mustache.render(o.newsYearsTpl, newsYears.Years) )
                }

                inst._trigger('yearsComplete', null, {
                    o: o,
                    $element: inst.element,
                    $years: inst.element.find( o.yearContainer )
                });
            });
        },

        _getNews: function( year ) {
            var inst = this, o = inst.options;

            inst._getData(o.url + '/news', {
                    year: year
            }).done(function(newsData, status, xhr){
                var news = newsData.News;

                console.log(newsData)

                //console.log(status)
                console.log(xhr.getAllResponseHeaders());
                //console.log(xhr.getResponseHeader("x-total-count"));

                $.each(news, function(i, item){
                    item.Date = $.datepicker.formatDate( o.dateFormat, new Date(item.Date))
                });

                inst._trigger('beforeRenderItems', null, { items: news });

                if (news.length) {
                    inst.element.find(o.newsItemContainer).html( Mustache.render(o.newsTpl, news) );
                } else {
                    inst.element.find(o.newsItemContainer).html( Mustache.render(o.errorTpl, {
                        symbol: o.symbol,
                        exchange: o.exchange
                    }));
                }

                inst._trigger('itemsComplete', null, {
                    o: o,
                    $element: inst.element,
                    $years: inst.element.find( o.yearContainer )
                });

                inst.element.find(o.newsItemContainer).removeClass(o.loadingClass);
            });
        },

        _getNewsWires: function() {
            var inst = this, o = inst.options;

            inst._getData(o.url + '/providerServices').done(function(news){
                var newsProviders = '';

                $.each(news.Providers, function(i, newswire){
                    newsProviders += (
                        newswire.ProviderName + ' : ' +
                        newswire.ServiceName + ' : ' +
                        '(' + newswire.ProviderId + ')\n'
                    );
                });

                console.log( newsProviders )
            });
        },

        _getNewsItem: function( id ) {
            var inst = this, o = inst.options;

            inst._getData(o.url + '/news/' + id).done(function(newsItem){
                inst.element.find(o.newsDetailsContainer).html( 
                    Mustache.render(o.newsDetailsTpl, newsItem.News)
                ).removeClass( o.loadingClass );
            });
        },

        _onNewsClick: function() {
            var inst = this;
            inst.element.on('click', '.module_headline-link', function(){
                inst._showDetails( $(this).data('id') )
            });
        },

        _showDetails: function( id ) {
            var inst = this, o = inst.options,
                $el = inst.element;


            // clear the details contain and add a loading class
            $el.find(o.newsDetailsContainer).html('').addClass(o.loadingClass).removeClass(o.hiddenClass);

            $el.find(o.newsItemContainer).addClass(o.hiddenClass).removeClass(o.loadingClass); // hide news list on details
            $el.find(o.yearContainer).addClass(o.hiddenClass); // hide news years on details

            // add news details to the container based off `newsDetailsTpl`
            inst._getNewsItem( id );
        },

        _onBack: function() {
            var inst = this, o = inst.options, $el = inst.element;

            $el.on('click', '.' + inst.options.backClass, function(){
                $el.find(o.newsDetailsContainer).html('').addClass(o.hiddenClass);
                $el.find(o.newsItemContainer).removeClass(o.hiddenClass);
                $el.find(o.yearContainer).removeClass(o.hiddenClass);
            });
        },

        /**
         * Reload news items. 
         * @param {number}  [year]
         */
        reloadNews: function( year ) {
            this._getNews( year );
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);