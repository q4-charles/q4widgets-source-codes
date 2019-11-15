(function($) {
    /**
     * A basic Download Library with full control over the data / event handlers / templates.
     * There is currently no plan to support mashed content, all years or pagination. Can likely use q4.pager if required.
     * Go away now
     * @class q4.downloadLibrary
     * @version 1.0.0
     * @requires [Mustache.js](lib/mustache.min.js)
     * @example
     * $('.download-library').downloadLibrary({
     *     categoryTypes: ['Press Release', 'Presentations'],
     *     categoryTpl: (
     *         '<label for="categories">Filter :</label>' +
     *         '<select id="categories">' +
     *             '{{#.}}' +
     *                 '<option value="{{.}}">{{.}}</option>' +
     *             '{{/.}}' +
     *         '</select>'
     *     ),
     *     onCategoryUpdate: function(inst, $el) {
     *         $el.find('select').on('change', function(){
     *             $('.controls').html('');
     *             inst._getDownloads( $(this).val() );
     *         });
     *     },
     *     dataTypes { 
     *         "Press Release": {
     *            api: '/Services/PressReleaseService.svc/GetPressReleaseList',
     *            name: 'GetPressReleaseListResult',
     *            options:{
     *                pressReleaseSelection: 3,
     *                pressReleaseBodyType: 3
     *            },
     *            embedCategories: false,
     *            showFilters: true,
     *            includeYears: true,
     *            minYear: 2010,
     *            filterTpl: (
     *                '<label for="">Filter:</label>' +
     *                '<select id="data-category">' +
     *                    '<option value="">All Releases</option>' +
     *                    '{{#types}}' +
     *                        '<option value="{{tag}}">{{title}}</option>' +
     *                    '{{/types}}' +
     *                '</select>' +
     *                '<label for="">Years:</label>' +
     *                '<select id="data-year">' +
     *                    '{{#years}}' +
     *                        '<option value="{{.}}">{{.}}</option>' +
     *                    '{{/years}}' +
     *                '</select>'
     *            ),
     *            defaultTitle: 'All Press Releases',
     *            types: [
     *                { tag: 'dividend', title: 'Dividend Releases' },
     *                { tag: 'earnings', title: 'Earnings Releases' }
     *            ],
     *            afterFiltersLoad: function(inst) {
     *                var _ = this,
     *                    $select = inst.element.find('.controls select');
     *        
     *                $select.on('change', function(){
     *                    inst._getDownloads( 'Press Release', {
     *                        TagList: $select.filter('#data-category').find('option:selected').val().length ? [ $select.filter('#data-category').find('option:selected').val() ] : [],
     *                        year: $select.filter('#data-year').find('option:selected').val(),
     *                        pressReleaseSelection: 3,
     *                        pressReleaseBodyType: 3
     *                    });
     *                });
     *            },
     *            tpl: (
     *                '<ul>' +
     *                    '<li class="heading">' +
     *                        '<span>Date</span>' +
     *                        '<span>Headline</span>' +
     *                        '<span>Format</span>' +
     *                    '</li>' +
     *                    '{{#items}}' +
     *                        '<li>' +
     *                            '<span>{{date}}</span>' +
     *                            '<span>{{title}}</span>' +
     *                            '<span>' +
     *                                '<a href="{{url}}">link</a>' +
     *                                '{{#doc}}<a href="{{doc}}">pdf</a>{{/doc}}' +
     *                            '</span>' +
     *                        '</li>' +
     *                    '{{/items}}' +
     *                '</ul>'
     *            ),
     *            dataTemplate: function(data) {
     *                return {
     *                    title: data.Headline,
     *                    date: $.datepicker.formatDate( 'M d, yy', new Date( data.PressReleaseDate ) ),
     *                    url: data.LinkToDetailPage,
     *                    doc: data.DocumentPath
     *                };
     *            }
     *         },
     *         "Presentations" : {...}
     *     }
     * });
    */
    $.widget("q4.downloadLibrary", /** @lends q4.downloadLibrary */{
        options: { 
            /**
             * HTML appended during loading / trasitions
             * @type {string}
             * @example '<img src="http://q4widgets.q4web.com/ajax-loader.gif" alt="loading..." />'
             */
            loading: '<img src="http://q4widgets.q4web.com/ajax-loader.gif" alt="loading..." />',
            /**
             * A date format string to use with jQuery UI's Datepicker.
             * @type {string}
             * @example 'M d, yy'
             */
            dateformat: 'M d, yy',
            /**
             * Class name for where to append the docuemnts
             * @type {string}
             * @example '.documents'
             */
            docContainer: '.documents',
            /**
             * Class name for where to append the controls (i.e Tag selector / Year selector)
             * @type {string}
             * @example '.controls'
             */
            controlContainer: '.controls',
            /**
             * Class name for where to append the categories generated using the `categoryTpl` and `categoryTypes`
             * @type {string}
             * @example '.categories'
             */
            categoryContainer: '.categories',
            /**
             * An array of all category types for the document library
             * These names will link to an property inside the `dataTypes` object
             * These items will be passed into the `categoryTpl`
             * This is required
             * @type {array}
             * @example ['Presentations', 'Annual Reports', 'Press Release']
             */
            categoryTypes: [],
            /**
             * Template to generate diffenert category types
             * Used with @onCategoryUpdate to generate different lists of documents
             * @type {string}
             * @example 
             * categoryTypes: (
             *   '<label for="categories">Filter :</label>' +
             *   '<select id="categories">' +
             *     '{{#.}}' +
             *       '<option value="{{.}}">{{.}}</option>' +
             *     '{{/.}}' +
             *   '</select>'
             * )
             */
            categoryTpl: null,
            /**
             * An array of all category types for the document library
             * These names will link to an property inside the `dataTypes` object
             * These items will be passed into the `categoryTpl`
             * @type {function}
             * @example 
             * onCategoryUpdate: function(inst, $el) {
             *   $el.find('select').on('change', function(){
             *     $('.controls').html('');
             *     inst._getDownloads( $(this).val() );
             *   });
             * }
             */
            onCategoryUpdate: function(inst, $el) {},
            /**
             * Required configuration for the different document types. View the full example at the top.
             * @type {object}
             * @param api {string}  - url for the api
             * @param name {string} - default object string
             * @param options {object} - api options
             * @param embedCategories {boolean} - group items by tags
             * @param showFilters {boolean} - will trigger the `filterTpl`
             * @param includeYears {boolean} - Will include a year array as part of `filterTpl`
             * @param minYear {number} - defaults to last 5 years
             * @param defaultTitle {string} - includes a title which can be used inside `tpl`
             * @param types {array} - used with `embedCategories` & `filterTpl`
             * @param afterFiltersLoad {function}  - attach event handlers to any filters used 
             * @param tpl {string} - Template to render this download type
             * @param dataTemplate {function} - edit api data for use with `tpl`

             * @example api: '/Services/PressReleaseService.svc/GetPressReleaseList'
             * @example name: 'GetPressReleaseListResult'
             * @example options: { pressReleaseSelection: 3, pressReleaseBodyType: 3 }
             * @example embedCategories: true
             * @example showFilters: true
             * @example includeYears: true
             * @example minYear: 2010
             * @example defaultTitle: 'Q4 Inc Press Releases'
             * @example types: [ { tag: 'dividend', title: 'Dividend Releases' }, { tag: 'earnings', title: 'Earnings Releases' }],
             * @example afterFiltersLoad
             * @example tpl
             * @example dataTemplate
             */
            dataTypes: {}
        },

        // @ToDo - create methods for getDownloads();

        _downloads: {},

        _create: function() {
            var inst = this, o = inst.options;

            if ( o.categoryTypes.length ) {  
                inst.element.find(inst.options.docContainer).html( o.loading );
                inst._getDownloads(o.categoryTypes[0] ); // load the first cateogry
                inst._categoryList();
            } else {
                console.log( 'There are no categoryTypes set' );
            }
        },

        _categoryList: function() {
            var inst = this, o = inst.options,
                $el = inst.element.find( o.categoryContainer ).html( Mustache.render( o.categoryTpl, inst.options.categoryTypes ) );

            o.onCategoryUpdate(inst, $el);
        },

        _buildParams: function () {
            return {
                serviceDto: {
                    StartIndex: 0,
                    TagList: [],
                    IncludeTags: true,
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
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

        _getDownloads: function( selected, opts ){
            var inst = this,
                config = inst.options.dataTypes[selected], // configuration options for the select data element
                options = $.extend( inst._buildParams(), opts !== undefined ? opts : config.options );

            inst.element.find(inst.options.docContainer).html( inst.options.loading );

            if (opts !== undefined && opts.TagList !== undefined) {
                options.serviceDto.TagList = opts.TagList;
            }

            if ( config.showFilters && !inst.element.find( inst.options.controlContainer ).html().length ) {
                var filterData = {
                    types: config.types
                }

                if ( config.includeYears ) {
                    options.year = new Date().getFullYear(); // if a year list is include pull the current year of data
                    filterData.years = [];

                    var endYear = config.minYear === undefined ? new Date().getFullYear() - 5 : config.minYear;
                    for (i = new Date().getFullYear(); i >= endYear; i--) {
                        filterData.years.push( i );
                    }
                }

                inst.element.find( inst.options.controlContainer ).html( Mustache.render( config.filterTpl, filterData ) )

                if (typeof config.afterFiltersLoad == 'function') { 
                    config.afterFiltersLoad(inst); 
                }
            }

            inst._downloads[ selected ] = {
                default: {title: config.defaultTitle, items: []}
            }

            // If categories are required, set empty objects for each
            if (config.embedCategories) {
                $.each(config.types, function(idx, category){
                    inst._downloads[ selected ][category.tag] = {
                        title: category.title,
                        items: []
                    }
                });
            }

            inst._getData( config.api, options ).done( function (data) {
                // Loop through each document returned from the api
                $.each(data[ config.name ], function(i, itemData){
                    // if a tag is set, use that category
                    if ( inst._downloads[ selected ][itemData.TagsList] !== undefined && inst._downloads[ selected ][itemData.TagsList[0]] !== undefined ) {
                        inst._downloads[ selected ][itemData.TagsList[0]].items.push( config.dataTemplate(itemData) );
                    } else { // For any item without a tag, set it as a default
                        inst._downloads[ selected ].default.items.push( config.dataTemplate(itemData) );
                    }
                });
                inst._parseDownloads( config, selected )
            });
        },

        _parseDownloads: function(config, selected) {
            var inst = this,
                HTML = '';

            // Parse download items
            HTML += Mustache.render( config.tpl, inst._downloads[ selected ].default );

            // Parse embeded download item
            if (config.embedCategories) {
                $.each(config.types, function(idx, category){
                    HTML += Mustache.render( config.tpl, inst._downloads[ selected ][category.tag] );
                });
            }
            
            // Append documents to the page
            inst.element.find(inst.options.docContainer).html( HTML );
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);