(function($) {
    /**
     * A custom slideshow presentation made with pdf.js. The presentations are pulled from our api.
     * <br>
     * <br>
     * <strong>Note for websites released before March 2017: download the required .zip file and upload the extracted files in the /files/js/pdf-js/ directory of the CMS.</strong>
     * <br>
     * <br>
     * <strong>viewer.html must be uploaded under /files/js/pdf-js in the CMS</strong>
     * <br>
     * (Use the Save Link As... option)
     * @class q4.slideshow
     * @version 1.1.3
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [viewer.html](lib/pdf-js/web/viewer.html)
     * @requires [pdf-js.zip_(optional)](lib/pdf-js.zip)
     * @example
     * $('.module_slideshow').slideshow({
     *     usePublic: GetViewType() != '0',
     *     apiKey: '06DE913DF4ED49BF8F349A3BC46980D2',
     *     aspectRatio: [4,3],
     *     tpl: (
     *         '<div class="module-slideshow_viewer">' +
     *             '<div class="module-slideshow_ratio">' +
     *                 '<iframe style="position: absolute; width: 100%; height: 100%;" src=\'/files/js/pdf-js/viewer.html?file={{url}}#zoom=page-fit\' allowfullscreen webkitallowfullscreen></iframe>' +
     *             '</div>' +
     *         '</div>' 
     *     ),
     * });
     */
    $.widget("q4.slideshow", /** @lends q4.slideshow */ {
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
             * an array of tags used to filter presentation results
             * @type {array<string>}
             * @example ['featured', 'latest']
             * @default []
             */
            tags: [],
            /**
             * an array of integers used to define an aspect ratio for the iframe window
             * @type {array}
             * @example [16, 9]
             * @default
             */
            aspectRatio: [4, 3],
            /**
             * A number representing which language to pull data from.
             * By default it auto detects language.
             * @default
             */
            languageId: null,
            /**
             * @type {string}
             * @description Iframe container to which the padding is applied depending on the aspect ratio.
             * @default '.module-slideshow_ratio'
             */
            slideShowContainer: '.module-slideshow_ratio',
            /**
             * A date format string, which can be used in the template as `{{date}}`.
             * Can alternately be an object of format strings,
             * which can be accessed with `{{date.key}}` (where key is the
             * object key corresponding to the string you want to use).
             * By default, dates are formatted using jQuery UI's datepicker.
             * @example 'MM d, yy'
             * @example
             * {
             *     full: 'MM d, yy',
             *     short: 'mm/dd/y',
             *     month: 'MM',
             *     day: 'd'
             * }
             * @type {string|Object}
             * @default
             */
            dateFormat: 'MM d, yy',
            /**
             * Template used to generate  the presentation iframe and a link to the presentation file.
             * @type {string}
             * @example
             * linkTpl: (
             * '<div class="module-slideshow_viewer">' +
             *     '<div class="module-slideshow_ratio">' +
             *         '<iframe src=\'/files/js/pdf-js/viewer.html?file={{url}}#zoom=page-fit\' allowfullscreen webkitallowfullscreen></iframe>' +
             *     '</div>' +
             * '</div>' +
             * '<div class="module-slideshow_link-container">' +
             *     '<a class="module-slideshow_link" href="{{url}}" target="_blank"><i class="q4-icon_pdf"></i> Download PDF <span class="sr-only">(opens in new window)</span></a>' +
             * '</div>'
             * )
             * The following mustache variables are available: 
             * <pre>
             * {{title}} - The title of the presentation
             * {{date}} - The date of the presentation
             * {{body}} - The body of the presentation
             * {{tags}} - An array of tags given to the presentation
             * {{url}} - A link to the presentation document
             * {{relativeUrl}} - A link to the presentation document relative to the viewer.html document
             * {{thumb}} - A link to the thumbnail image
             * {{size}} - The size of the presentation document
             * {{type}} - The type of file for the presentation document
             * </pre>
             * @default
             */
            tpl: (
                '<div class="module-slideshow_viewer">' +
                    '<div class="module-slideshow_ratio">' +
                        '<iframe style="position: absolute; width: 100%; height: 100%;" src=\'/files/js/pdf-js/viewer.html?file={{url}}#zoom=page-fit\' allowfullscreen webkitallowfullscreen></iframe>' +
                    '</div>' +
                '</div>' +
                '<div class="module-slideshow_title">{{{title}}}</div>' +
                '<div class="module-slideshow_link-container">' +
                    '<a class="module-slideshow_link" href="{{url}}" target="_blank"><i class="q4-icon_pdf"></i> Download PDF <span class="sr-only">(opens in new window)</span></a>' +
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
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading slideshow...</span></p>',
            /**
             * A message or HTML string to display in the container if no items are found.
             * @type {string}
             * @default
             */
            itemNotFoundMessage: '<p><i class="q4-icon_warning-line"></i> There is no presentation available.</p>',
            /**
             * A callback fired once the widget has finished running
             * @type {function}
             */
            complete: function(){}
        },
        _create: function() {
            var inst = this;

            inst.element.addClass(inst.options.loadingClass).html(inst.options.loadingMessage);
            inst._getPresentation();
        },
        _renderWidget: function(data) {
            var inst = this;
            inst.element.html(Mustache.render(inst.options.tpl, data))
                .removeClass(inst.options.loadingClass)
                .find(inst.options.slideShowContainer).css({
                    'padding-bottom': (inst.options.aspectRatio[1] / inst.options.aspectRatio[0] * 100) +'%',
                    'position' : 'relative'
                });
        },

        _getPresentation: function(){
            var inst = this,
                o = this.options,
                urlType = o.usePublic ? '/feed/Presentation.svc/GetPresentationList' : '/services/PresentationService.svc/GetPresentationList';
            inst._getData(urlType, inst._buildParams()).done(function (data) {
                if (data.GetPresentationListResult.length) {
                    inst._normalizeData(data.GetPresentationListResult[0]);
                } else {
                    inst.element.html(inst.options.itemNotFoundMessage).removeClass(inst.options.loadingClass);;
                }
            });
        },
        _getData: function (url, params) {
            var o = this.options;

            if (o.usePublic) {
                return $.ajax({
                    type: 'GET',
                    url: o.url + url,
                    data: params,
                    contentType: o.url ? 'text/plain' : 'application/json; charset=utf-8',
                    dataType: 'json'
                });
            } else {
                return $.ajax({
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(params),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json'
                });
            }
        },
        _buildParams: function () {
            var inst = this,
                o = this.options,
                obj = o.usePublic ? {
                    apiKey: o.apiKey,
                    presentationDateFilter: 3,
                    excludeSelection: 1,
                    tagList: inst.options.tags.join('|'),
                    LanguageId: inst.options.languageId ? inst.options.languageId : GetLanguageId()
                } : {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: inst.options.languageId ? inst.options.languageId : GetLanguageId(),
                        Signature: GetSignature(),
                        StartIndex: 0,
                        ItemCount: 1,
                        IncludeTags: true,
                        TagList: inst.options.tags
                    },
                    presentationSelection: 3,
                    excludeSelection: 1
                }
            return obj;
        },
        _normalizeData: function( GetPresentationListResult ) {
            var inst = this;

            var docURL = GetPresentationListResult.DocumentPath;
            if(window.location.protocol == "http:" || inst.options.url.indexOf('http:') > -1) docURL = GetPresentationListResult.DocumentPath.replace('https:', 'http:');

            var data = {
                    title: GetPresentationListResult.Title,
                    date: $.datepicker.formatDate(inst.options.dateFormat, new Date(GetPresentationListResult.PresentationDate)),
                    body: GetPresentationListResult.Body,
                    tags: GetPresentationListResult.TagList,
                    url: docURL,
                    relativeUrl: '../../../' + GetPresentationListResult.DocumentPath.split('/files/').pop(),
                    thumb: GetPresentationListResult.ThumbnailPath,
                    size: GetPresentationListResult.DocumentFileSize,
                    type: GetPresentationListResult.DocumentFileType
                };
            inst._renderWidget(data);

            inst._trigger('complete');
        },

        destroy: function() {
            this.element.html('');
        },
        _setOption: function(option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);