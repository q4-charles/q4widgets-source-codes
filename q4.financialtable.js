(function ($) {
    /**
     * A table of different types of financial documents sorted by year.
     * Each year can have links to documents for each quarter.
     * @class q4.financialTable
     * @version 1.2.2
     * @example
     * $("#financials").financialTable({
     *     firstYear: 2014,
     *     reportTypes: ['Annual Report', 'Supplemental Report']
     * });
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget('q4.financialTable', /** @lends q4.financialTable */ {
        options: {
            /**
             * The base URL to use for API calls.
             * By default, calls go to the current domain, so this option is usually unnecessary.
             * @type {string}
             */
            url: '',
            /**
             * Use Public API
             * @default
             */
            usePublic: false,
            /**
             * Api Key for use with the public api
             * @default
             */
            apiKey: '',
            /**
             * A number representing which language to pull data from.
             * By default it auto detects language.
             * @default
             */
            languageId: null,
            /**
             * A list of tags to filter by.
             * @type {Array<string>}
             */
            tags: [],
            /**
             * A list of report subtypes to display, or an empty list to display all.
             * Valid values are:
             *
             * - `Annual Report`
             * - `Supplemental Report`
             * - `First Quarter`
             * - `Second Quarter`
             * - `Third Quarter`
             * - `Fourth Quarter`
             * @type {Array<string>}
             * @default
             */
            reportTypes: [],
            /**
             * The number of year columns to display.
             * Set to zero to show all columns (default).
             * @type {number}
             */
            columns: 0,
            /**
             * The earliest year to display; previous years will be ignored.
             * Set to zero to show all years (default).
             * @type {(number|string)}
             */
            firstYear: 0,
            /**
             * Use SEC API
             * @default
             */
            useSEC: false,
            /**
             * The stock symbol to look up SEC filings. Only applicable if useSEC is true
             * If you are looking up the company by CIK, enter the CIK number here.
             * @type {string}
             */
            symbol: '',
             /**
             * The exchange of the stock symbol to look up. Only applicable if useSEC is true
             * If you are looking up the company by CIK, enter `CIK`.
             * @type {string}
             * @default
             */
            exchange:  'CIK',
            /**
             * Map the available SEC filing types to a category in the categories template option.
             * Key - Should match the value of the FilingTypeMnemonic field in the SEC API.
             * Value (Object) - 'category', used to identify through the SCHEMA. 'preferredDocs', array of string; identify preferred filetypes to show.
             * @type {object}
             * @example
             * '10-Q' : {
                    category: 'SEC10-Q',
                    preferredDocs: ['CONVPDF', 'XBRL_HTML', 'HTML', 'RTF', 'XLS', 'XBRL']
                },
             * @default
             */
            secFilingTypes: {
                '10-Q' : {
                    category: 'SEC10-Q',
                    preferredDocs: ['CONVPDF', 'XBRL_HTML', 'HTML', 'RTF', 'XLS', 'XBRL']
                },
                '10-K' : {
                    category: 'SEC10-K',
                    preferredDocs: ['CONVPDF', 'XBRL_HTML', 'HTML', 'RTF', 'XLS', 'XBRL']
                }
            },
            /**
             * Filing groups to use when making the SEC API call (instead of grabbing all filing types).
             * 'Group numbers should be included in a string, separated by a comma(s).
             * The default groups of '1,2,4' will typically only include 10-Q and 10-K filings.
             * @type {string}
             * @default
             */
            secGroup: '1,2,4',
             /**
             * Define the range of months for quarterly filings excluding Fourth Quarter.
             * Numbers are indicated as index of months start from '0'. ie. '1' is February and '4' is May
             * @type {object}
             * @default
             */
            secQuarterlyRange : {
                'Q1' : {
                    monthStart : 1,
                    monthEnd : 4
                },
                'Q2' : {
                    monthStart : 5,
                    monthEnd : 7
                },
                'Q3' : {
                    monthStart : 8,
                    monthEnd : 10
                }
            },
             /**
             * Define if 10-K should be in the same year as date reported
             * @type {object}
             * @default
             */
            secAnnualSameYear : false,
            /**
             * An array of document categories that will appear as rows
             * in the table.
             * @type {Array<Object>}
             * @prop {string}        title      The title to display for that row.
             * @prop {Array<string>} reportType A filter list of financial report subtypes (optional).
             * @prop {Array<string>} category   A filter list of document categories (optional).
             * @prop {Array<string>} tags       A filter list of tags (optional).
             * @prop {string}        text       A template to use for the link (default blank).
             *   See `template` documentation for available tags.
             * @example
             * [
             *     {
             *          title: 'Quarterly Reports',
             *          reportType: ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
             *          category: ['Financials'],
             *          text: '{{shortType}}'
             *     },
             *     {
             *          title: 'Annual Reports',
             *          reportType: ['Annual Report'],
             *          text: 'Annual ({{fileType}})'
             *     }
             * ]
             */
            categories : [{
                title : 'Press Release',
                category : ['news'],
                reportType : ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--news module-financial-table_item--quarterly'
            },{
                title : 'Financial Statement',
                category : ['file'],
                reportType : ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--10q module-financial-table_item--quarterly'
            },{
                title : 'Earnings Webcast',
                category : ['webcast'],
                reportType : ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--webcast module-financial-table_item--quarterly'
            },{
                title : 'Earnings Presentation',
                category : ['presentation'],
                reportType : ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--presentation module-financial-table_item--quarterly'
            },{
                title : 'Earnings Transcript',
                category : ['transcript'],
                reportType : ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--transcript module-financial-table_item--quarterly'
            },{
                title : 'Annual Report',
                category : ['file'],
                reportType : ['Annual Report'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--annual'
            },{
                title : 'Supplementary Report',
                category : ['file'],
                reportType : ['Supplemental Report'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--supplemental'
             },{
                title : 'SEC 10-K',
                category : ['SEC10-K'],
                reportType : ['Fourth Quarter'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--annual'
             },{
                title : 'SEC 10-Q',
                category : ['SEC10-Q'],
                reportType : ['Supplemental Report'],
                text : '{{shortType}}',
                cssClass: 'module-financial-table_item module-financial-table_item--quarterly'
            }],
            /**
             * A map of short names for each report subtype.
             * @type {Object}
             */
            shortTypes : {
                'First Quarter' : 'Q1',
                'Second Quarter' : 'Q2',
                'Third Quarter' : 'Q3',
                'Fourth Quarter' : 'Q4',
                'Annual Report' : 'AR',
                'Supplemental Report' : 'SR'
            },
            /**
             * A mustache.js template for the financial report list.
             * Use {{#years}} to loop through document years.
             * Use {{#categories}} to loop through document categories.
             * Categories have these tags: {{catTitle}}, {{catClass}}
             * Within a category, use {{#catYears}} to loop through years.
             * Within a year, use {{#docs}} to loop through documents.
             * Documents can have these tags:
             *
             * - `{{text}}`      The value of the category's "text" option
             *     (which might contain any of the below tags).
             * - `{{fileType}}`  The document file type.
             * - `{{shortType}}` The short name of the report subtype,
             *     as defined in options.shortTypes (e.g. Q1, Q2, Annual).
             * - `{{size}}`      The size of the document file.
             * - `{{title}}`     The title of the document.
             * - `{{url}}`       The URL of the document file.
             * - `{{thumb}}`     The thumbnail of the document file.
             * - `{{cover}}`     he cover image of the report quarter/year.
             * - `{{year}}`      The fiscal year of the report.
             * @type {string}
             * @example
             * '<ul class="ftHeader">' +
             *     '<li>Document</li>' +
             *     '{{#years}}<li>{{year}}</li>{{/years}}' +
             * '</ul>' +
             * '{{#categories}}' +
             * '<ul class="ftRow {{catClass}}">' +
             *     '<li>{{catTitle}}</li>' +
             *     '{{#catYears}}' +
             *     '<li>' +
             *         '{{#docs}}<a href="{{url}}" class="docLink {{fileType}}">{{{text}}}</a>{{/docs}}' +
             *     '</li>' +
             *     '{{/catYears}}' +
             * '</ul>' +
             * '{{/categories}}'
             */
            template: (
                '<div class="module-financial-table_header">' +
                    '<div class="module-financial-table_header-category grid_col grid_col--1-of-4 grid_col--sm-2-of-4"></div>' +
                    '<div class="module-financial-table_header-year-container grid_col grid_col--3-of-4 grid_col--sm-2-of-4">' +
                        '{{#years}}' +
                            '<div class="module-financial-table_header-year {{year}}">{{year}}</div>' +
                        '{{/years}}' + 
                    '</div>' +
                '</div>' +
                '<div class="module-financial-table_body">' +
                    '{{#categories}}' +
                        '<div class="module-financial-table_body-row">' +
                            '<div class="module-financial-table_body-category grid_col grid_col--1-of-4 grid_col--sm-2-of-4">{{{catTitle}}}</div>' +
                            '<div class="module-financial-table_body-year-container grid_col grid_col--3-of-4 grid_col--sm-2-of-4">' +
                                '{{#catYears}}'+
                                    '<div class="module-financial-table_body-year">' +
                                        '{{#docs}}' +
                                            '<span class="{{catClass}}">' +
                                                '{{#url}}' +
                                                    '<a class="module-financial-table_link" href="{{url}}"{{#blank}} target="_blank"{{/blank}}>{{shortType}} <span class="sr-only">(opens in new window)</span></a>' +
                                                '{{/url}}' +
                                                '{{^url}}' +
                                                    '{{shortType}}' +
                                                '{{/url}}' +
                                            '</span>' +
                                        '{{/docs}}' +
                                    '</div>' +
                                '{{/catYears}}'+
                            '</div>' +
                        '</div>' +
                    '{{/categories}}' +
                '</div>'
            ),
            /**
             * A CSS class to add to the widget while data is loading. This can be used to show and hide elements within the widget.
             * @type {string}
             */
            loadingClass: '',
            /**
             * A message or HTML string to display while first loading the widget.
             * @type {string}
             */
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading items...</span></p>',
            /**
            * Show years in ascending order
            * @type {boolean}
            */
            sortAscending: false,
            /**
            * A callback fired when rendering is completed.
            * @type {function}
            * @param {Event} [event] The event object.
            */
            complete: function (e) {},
            /**
             * A callback that fires before the full widget is rendered.
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] The complete template data.
             */
            beforeRender: function (e, tplData) {}
        },
        
        _create: function() {
            this.element.addClass(this.options.loadingClass).html(this.options.loadingMessage);
            this._fetchFinancials();
        },

        _fetchFinancials: function() {
            var _ = this,
                o = this.options,
                params = o.usePublic ? {
                    apiKey: o.apiKey,
                    includeTags: true,
                    tagList : o.tags.join('|'),
                    year: -1,
                    reportSubTypeList: o.reportTypes,
                    LanguageId: o.languageId ? o.languageId : GetLanguageId()
                } : {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: o.languageId ? o.languageId : GetLanguageId(),
                        Signature: GetSignature(),
                        IncludeTags: true,
                        TagList: o.tags
                    },
                    year: -1,
                    reportSubTypeList: o.reportTypes
                }

            if (o.usePublic) {
                $.ajax({
                    type: 'GET',
                    url: o.url + '/feed/FinancialReport.svc/GetFinancialReportList',
                    data: params,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    success: function(data) {
                        o.useSEC ? _._drawFinancialSECTable(data) : _._drawFinancialTable(data);
                    }
                });
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/Services/FinancialReportService.svc/GetFinancialReportList',
                    data: JSON.stringify(params),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    success: function(data) {
                        o.useSEC ? _._drawFinancialSECTable(data) : _._drawFinancialTable(data);
                    }
                });
            }
        },
        _fetchSECFilings: function() {
            var _ = this,
                o = this.options,
                secParams = o.usePublic ? {
                    exchange: o.exchange,
                    symbol: o.symbol,
                    apiKey: o.apiKey,
                    year: -1,
                    formGroupIdList : o.secGroup,
                    excludeNoDocuments: true,
                } : {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        Signature: GetSignature(),
                    },
                    symbol: o.symbol,
                    exchange: o.exchange,
                    formGroupIdList : o.secGroup,
                    year: -1,    
                    excludeNoDocuments: true
                };

            if (o.usePublic) {
                return $.ajax({
                    type: 'GET',
                    url: o.url + '/feed/SECFiling.svc/GetEdgarFilingList',
                    data: secParams,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                });
            } else {
                return $.ajax({
                    type: 'POST',
                    url: '/Services/SECFilingService.svc/GetEdgarFilingList',
                    data: JSON.stringify(secParams),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                });
            }
        },
        _parseSECFilings: function(data) {
            var o = this.options;
            var secFiles = [];

            $.each(data, function(i, arr){
                $.each(arr, function(j, item) {
                    $.each(Object.keys(o.secFilingTypes), function(k, filingType) {

                        // Filter SEC items to declared filing types
                        if (item.FilingTypeMnemonic === filingType) {

                            // Normalize item to match Financial item properties
                            var secItem = {
                                FilingYear: new Date(item.FilingDate).getFullYear(),
                                FilingDate: item.FilingDate,
                                FilingType: item.FilingTypeMnemonic
                            };

                            if (item.FilingDescription === 'Annual Report') {
                                secItem.FilingYear = o.secAnnualSameYear ? secItem.FilingYear : secItem.FilingYear - 1;
                                secItem.ReportSubType = 'Fourth Quarter';
                            } else {
                                var filingMonth = new Date(item.FilingDate).getMonth();

                                if (filingMonth >= o.secQuarterlyRange['Q1'].monthStart && filingMonth <= o.secQuarterlyRange['Q1'].monthEnd) {
                                    secItem.ReportSubType = 'First Quarter';
                                } else if (filingMonth >= o.secQuarterlyRange['Q2'].monthStart && filingMonth <= o.secQuarterlyRange['Q2'].monthEnd) {
                                    secItem.ReportSubType = 'Second Quarter';
                                } else if (filingMonth >= o.secQuarterlyRange['Q3'].monthStart && filingMonth <= o.secQuarterlyRange['Q3'].monthEnd) {
                                    secItem.ReportSubType = 'Third Quarter';
                                }
                            }
                            for (var x = 0; x < o.secFilingTypes[filingType].preferredDocs.length; x++) {
                                var found = false;
                                $.each(item.DocumentList, function(j, secDoc) {
                                    if (o.secFilingTypes[filingType].preferredDocs[x] === secDoc.DocumentType) {
                                        secItem.doc = {
                                            DocumentCategory: o.secFilingTypes[filingType].category,
                                            DocumentFileType: secDoc.DocumentType,
                                            DocumentPath: secDoc.Url,
                                            DocumentId: secDoc.FilingDocumentId,
                                            DocumentTitle: item.FilingTypeMnemonic,
                                            DocumentType: 'File',
                                            IconPath: null,
                                            ThumbnailPath: null,
                                            DocFileSize: null,
                                        }
                                        found = true;
                                    }
                                });
                                if (found) break;
                            }
                            secFiles.push(secItem);
                        }
                    });
                });
            });
            return secFiles;
        },
        _drawFinancialTable: function(data) {
            var o = this.options,
                years = [],
                documents = {},
                tplData = {
                    years: [],
                    categories: []
                };

            // Create a list of years.
            $.each(data.GetFinancialReportListResult, function(i, report) {
                if ($.inArray(report.ReportYear, years) == -1 && (o.firstYear == 0 || report.ReportYear >= o.firstYear)) {
                    years.push(report.ReportYear);
                }
            });

            // Sort in descending order.
            years.sort(function(a, b) { return b - a });

            // Clip years to the number of columns specified.
            if (o.columns > 0) {
                years = years.slice(0, o.columns);
            }

            // Create a document object indexed by category and year.
            $.each(o.categories, function(i, cat) {
                // Add this category to the document object.
                documents[cat.title] = {};
                $.each(years, function(i, year) {
                    documents[cat.title][year] = [];
                });

                // Also, normalize category filters to arrays.
                if (!$.isArray(cat.category)) cat.category = cat.category ? [cat.category] : [];
                if (!$.isArray(cat.reportType)) cat.reportType = cat.reportType ? [cat.reportType] : [];
                if (!$.isArray(cat.tags)) cat.tags = cat.tags ? [cat.tags] : [];
            });

            // Loop through all documents for the selected years, and add them to the data object.
            $.each(data.GetFinancialReportListResult, function(i, report) {
                if ($.inArray(report.ReportYear, years) == -1) return true;

                $.each(report.Documents, function(i, doc) {
                    $.each(o.categories, function(i, cat) {
                        // Skip document if category/tag filters don't match.
                        if (cat.category.length && $.inArray(doc.DocumentCategory, cat.category) == -1) return true;
                        if (cat.reportType.length && $.inArray(report.ReportSubType, cat.reportType) == -1) return true;
                        if (cat.tags.length && !$(report.TagsList).filter(cat.tags).length) return true;

                        // Format data and render text template.
                        var docData = {
                            fileType: doc.DocumentFileType,
                            shortType: o.shortTypes[report.ReportSubType],
                            size: doc.DocumentFileSize,
                            title: doc.DocumentTitle,
                            url: doc.DocumentPath,
                            year: report.ReportYear,
                            category: doc.DocumentCategory,
                            thumb: doc.ThumbnailPath,
                            cover: report.CoverImagePath
                        };
                        docData.text = 'text' in cat ? Mustache.render(cat.text, docData) : '';

                        // Add the document to the data object in the correct category and year.
                        documents[cat.title][report.ReportYear].push(docData);
                    });
                });
            });

            // Reverse the years
            if (o.sortAscending){
                years = years.reverse();
            }

            // Restructure the data for Mustache.
            $.each(years, function(i, year) {
                tplData.years.push({year: year});
            });

            $.each(o.categories, function(i, cat) {
                var tplCat = {
                    catTitle: cat.title,
                    catClass: 'cssClass' in cat ? cat.cssClass : '',
                    catYears: []
                };
                $.each(years, function(i, year) {
                    if (year in documents[cat.title]) {
                        // Push the documents in reverse (i.e. ascending) order.
                        documents[cat.title][year].reverse();
                        tplCat.catYears.push({'docs': documents[cat.title][year]});
                    } else {
                        tplCat.catYears.push({'docs': []});
                    }
                });
                tplData.categories.push(tplCat);
            });

            this._trigger('beforeRender', null, tplData);

            // Render the template and redraw the element.
            this.element.html(Mustache.render(o.template, tplData)).removeClass(o.loadingClass);

            // Fire the complete callback.
            this._trigger('complete');
        },
        _drawFinancialSECTable: function(data) {
            var _ = this,
                o = this.options,
                years = [],
                documents = {},
                tplData = {
                    years: [],
                    categories: []
                };

            _._fetchSECFilings().done(function(secData) {
                data.SecListResult = _._parseSECFilings(secData);

                // Inject SEC files within Financial Report list
                $.each(data.GetFinancialReportListResult, function(i, financial){
                    $.each(data.SecListResult, function(j, sec) {
                        if (sec.FilingYear === financial.ReportYear && sec.ReportSubType === financial.ReportSubType) {
                            financial.Documents.push(sec.doc);
                        }
                    });
                });

                // Create a list of years.
                $.each(data.GetFinancialReportListResult, function(i, report) {
                    if ($.inArray(report.ReportYear, years) == -1 && (o.firstYear == 0 || report.ReportYear >= o.firstYear)) {
                        years.push(report.ReportYear);
                    }
                });

                // Sort in descending order.
                years.sort(function(a, b) { return b - a });

                // Clip years to the number of columns specified.
                if (o.columns > 0) {
                    years = years.slice(0, o.columns);
                }         

                // Create a document object indexed by category and year.
                $.each(o.categories, function(i, cat) {

                    // Add this category to the document object.
                    documents[cat.title] = {};
                    $.each(years, function(i, year) {
                        documents[cat.title][year] = [];
                    });

                    // Also, normalize category filters to arrays.
                    if (!$.isArray(cat.category)) cat.category = cat.category ? [cat.category] : [];
                    if (!$.isArray(cat.reportType)) cat.reportType = cat.reportType ? [cat.reportType] : [];
                    if (!$.isArray(cat.tags)) cat.tags = cat.tags ? [cat.tags] : [];
                });


                // Loop through all documents for the selected years, and add them to the data object.
                $.each(data.GetFinancialReportListResult, function(i, report) {

                    if ($.inArray(report.ReportYear, years) == -1) return true;

                    $.each(report.Documents, function(i, doc) {
                        $.each(o.categories, function(i, cat) {

                            // Skip document if category/tag filters don't match.
                            if (cat.category.length && $.inArray(doc.DocumentCategory, cat.category) == -1) return true;
                            if (cat.reportType.length && $.inArray(report.ReportSubType, cat.reportType) == -1) return true;
                            if (cat.tags.length && !$(report.TagsList).filter(cat.tags).length) return true;

                            // Format data and render text template.
                            var docData = {
                                fileType: doc.DocumentFileType,
                                shortType: o.shortTypes[report.ReportSubType],
                                size: doc.DocumentFileSize,
                                title: doc.DocumentTitle,
                                url: doc.DocumentPath,
                                year: report.ReportYear,
                                category: doc.DocumentCategory,
                                thumb: doc.ThumbnailPath,
                                cover: report.CoverImagePath

                            };
                            docData.text = 'text' in cat ? Mustache.render(cat.text, docData) : '';

                            // Add the document to the data object in the correct category and year.
                            documents[cat.title][report.ReportYear].push(docData);
                        });
                    });
                });

                // Reverse the years
                if (o.sortAscending){
                    years = years.reverse();
                }

                // Restructure the data for Mustache.
                $.each(years, function(i, year) {
                    tplData.years.push({year: year});
                });

                $.each(o.categories, function(i, cat) {
                    var tplCat = {
                        catTitle: cat.title,
                        catClass: 'cssClass' in cat ? cat.cssClass : '',
                        catYears: []
                    };
                    $.each(years, function(i, year) {
                        if (year in documents[cat.title]) {
                            // Push the documents in reverse (i.e. ascending) order.
                            documents[cat.title][year].reverse();
                            tplCat.catYears.push({'docs': documents[cat.title][year]});
                        } else {
                            tplCat.catYears.push({'docs': []});
                        }
                    });
                    tplData.categories.push(tplCat);
                });

                _._trigger('beforeRender', null, tplData);

                // Render the template and redraw the element.
                _.element.html(Mustache.render(o.template, tplData)).removeClass(o.loadingClass);

                // Fire the complete callback.
                _._trigger('complete');                
            });
        }
    });
})(jQuery);