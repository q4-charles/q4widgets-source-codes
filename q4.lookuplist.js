(function ($) {
    /**
     * Get lookup items from Lookup List and render as needed.
     * @class q4.lookupList
     * @version 1.0.0
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget('q4.lookupList', /** @lends q4.lookupList */ {
        options: {
            /**
             * The base URL to use for API calls.
             * By default, calls go to the current domain, so this option is usually unnecessary.
             * @type {string}
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
             * A number representing which language to pull data from.
             * By default it auto detects language.
             * @type {string}
             * @default
             */
            languageId: null,
            /**
             * When true, the API is changed to a JSONP format and can be called from an external source outside of a Q4 environment (ie. local machine, client's internal server)
             * @type {boolean}
             * @default
             */
            useJSONP: false,
            /**
             * Specify the lookup type to use from Lookup List
             * @type {string}
             */
            lookupType: '',
             /**
             * The template option determines the layout of the widget once it is rendered on the page. The mustache.js plugin is used
             * to render the template strings into full HTML, based on the data available from the API call. Using the <code>template</code>
             * option is not required, as long as the <code>yearTemplate</code> and/or <code>itemTemplate</code> are used instead. The desired structure should
             * be listed as strings containing html elements, with mustache variables to indicate where data should be used.<br>
             * <br>
             * <strong>Important Notes:</strong><br>
             * <ul>
             *   <li>HTML elements should be listed as strings and combined with plus sign at the end of each string. For example: <code>'&#60;span>Content text&#60;/span>' +</code></li>
             *   <li>The last string in the template should not include a plus sign at the end as it will return an error</li>
             *   <li>Mustache variables are shown in curly brackets, ex. <code>{{title}}</code> this content will be replaced with the value it represents in the API.</li>
             *   <li>Variables with two curly brackets are rendered as text. Variables with three curly brackets (ex. <code>{{{body}}}</code> ) are rendered as HTML.</li>
             *   <li>Arrays of data can be accessed with # and closed with <code>/</code>. For example using <code>{{#docs}}</code> in a widget template will allow you to access an
             *       array of documents inside of a single content item.</li>
             *   <li>The value of the variable is specific to the array in which it is contained. For example, <code>{{title}}</code> inside
             *       of <code>{{#docs}}</code> will refer to the document title, but if it is listed outside of the array it would refer to the title of the content item (ex. event title).</li>
             *   <li>If/Else logic can be applied using # and ^ before a variable. See the example code at the bottom of this section.
             *          <ul>
             *        <li> <code>{{#items}}</code> If items exist, access them and do something.</li>
             *        <li><code>{{^items}}</code> If items do not exist, do something else</li>
             *    </ul>
             *     </li>
             * </ul>
             * <br>
             * The following tags are available:<br>
             * <br>
             *   <ul>
             *     <li> <code>{{text}}</code> The text value of the lookup.
             *     <li> <code>{{type}}</code> The lookup type.
             *     <li><code>{{value}}</code> The value of the lookup</li>
             *  </ul>
             * <br>
             * <pre><code>Example: (
             * template: (
             *'&lt;select class="form-control security" size="1" id="keyFndg" style="display: block;"&gt;' +
             *    '{{#items}}' +
             *        '&lt;option data-type="{{type}}" value="{{value}}">{{text}}&lt;/option&gt;' +
             *    '{{/items}}' +
             *'&lt;/select&gt;'
             * )
             * </pre></code>
             * @type {string}
             */
            template: '',
                        /**
             * A callback that fires before the full widget is rendered. It is generally used to restructure/manipulate data before being passed into the <code>template</code> option.
             * <ul>
             *   <li>This function runs only once, when widget is first loaded on the page</li>
             *   <li>Can be used with any of the widget template options (<code>template</code>, <code>yearTemplate</code> and <code>itemTemplate</code>)</li>
             *   <li>This callback is <strong>not</strong> triggered by <code>yearSelect</code>/<code>yearTrigger</code> or <code>tagSelect</code>/<code>tagTrigger</code> actions.</li>
             *   <li>Can be used in conjunction with <code>itemsComplete</code> callback, but it will run after <code>itemsComplete</code> is finished.</li>
             * </ul>
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] The complete template data. Example: <code>{ items: [{...}, {...}] }</code>
             */
            beforeRender: function (e, tplData) {
            },
            /**
             * A callback that fires after the entire widget is rendered. Often used to trigger additional global scripts or plugins to run.
             * <ul>
             *   <li>This function runs only once, when widget is first loaded on the page</li>
             * </ul>
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function (e) {
            }
        },

        _init: function () {
            var inst = this;
            inst._getLookupList();
        },

        _buildParams: function () {
            var o = this.options,
                obj = o.usePublic ? {
                    apiKey: o.apiKey,
                    languageId: o.languageId ? o.languageId : GetLanguageId(),
                    lookupType: o.lookupType,
                } : {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: o.languageId ? o.languageId : GetLanguageId(),
                        Signature: GetSignature()
                    },
                    lookupType: o.lookupType,
                }

            return obj;
        },

        _getData: function (url, params) {
            var o = this.options;
            if (o.usePublic) {
                return $.ajax({
                    type: 'GET',
                    url: o.url + url,
                    data: params,
                    contentType: 'application/json; charset=utf-8',
                    dataType: o.useJSONP ? 'jsonp' : 'json'
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

        _getLookupList: function () {
            var inst = this,
                o = this.options,
                apiUrl = o.usePublic ? '/feed/Lookup.svc/GetLookupList' : '/Services/LookupService.svc/GetLookupList';

            inst._getData(apiUrl, inst._buildParams()).done(function (data) {
                inst._render(inst._normalizeData(data.GetLookupListResult));
                inst._trigger('complete');
            });
        },

        _normalizeData: function (result) {
            var inst = this, o = inst.options;

            var lookupList = [];

            $.each(result, function (index, item) {
                var lookup = {
                    sortOrder: item.SortOrder,
                    text: item.Text,
                    type: item.Type,
                    value: item.Value,
                }
                lookupList.push(lookup);
            });

            return {items: lookupList};
        },

        _render: function (tplData) {
            var inst = this, o = this.options;

            if (!!o.beforeRender && typeof (o.beforeRender) === 'function') {
                this._trigger('beforeRender', null, tplData);
            }

            inst.element.html(Mustache.render(o.template, tplData));
        },

        _destroy: function () {
            this.element.html('');
        },

        _setOption: function (option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);
