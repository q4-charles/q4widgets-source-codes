(function ($) {
    /**
     * Base widget for accessing Q4 private API data.
     * @class q4.indexApi
     * @version 1.0.0
     * @description This page contains all of the global options which apply to each of our Q4 Content Widgets (see link list below).
     * These widgets are powered by our private and public CMS content API's and rendered using mustache.js through the selected template option.
     * <br><br>
     * <strong style="color:red;">Each widget will have options which are unique to that type of content, and are described in more detail with examples on their individual documentation pages (linked below).</strong>
     * <br><br>
     * @abstract
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [Moment.js_(optional)](lib/moment.min.js)
     *
     */
    $.widget('q4.indexApi', /** @lends q4.indexApi */ {
        options: {
            /**
             * The base URL to use for API calls.
             * By default, calls go to the current domain, so this option is usually unnecessary.
             * @type {string}
             */
            url: '',
            /**
             * When true, use Public API for content. This will mean that preview content is not available and an API is required.
             * Optional documentation for the public API can be found here: <a href="http://documentation.q4websystems.com/home" target="_blank">http://documentation.q4websystems.com/home</a>
             * @type {boolean}
             * @default
             */
            usePublic: false,
            /**
             * When true, the API is changed to a JSONP format and can be called from an external source outside of a Q4 environment (ie. local machine, client's internal server)
             * @type {boolean}
             * @default
             */
            useJSONP: false,
            /**
             * A number representing which language to pull data from.
             * By default the widget will attempt to auto-detect the language.
             * @type {string}
             * @example '1'
             * @default
             */
            languageId: null,
            /**
             * Api Key for use with the Q4 Public API. Found in System > Site List > Public Site > Advanced > Under Site Settings, find "Q4ApiKey".
             * @type {string}
             * @default
             */
            apiKey: '',
            /**
             * The maximum number of results to fetch from the server.
             * @type {number}
             * @default
             */
            limit: 0,
            /**
             * Requires <code>limit</code> to be set. This option will determine the sorting order from within the limited items.
             * This is most commonly used with showing a limited number of upcoming events. Ex. If you want to show the 3 most recent
             * upcoming events, use a limit of 3 and change the sort order to descending.
             * @type {number}
             * @default
             * @example 0 = Descending order, 1 = Ascending order
             */
            limitSort: 0,
            /**
             * The number of results to skip. Used for pagination.
             * @type {number}
             * @default
             */
            skip: 0,
            /**
             * If set to true, only content that does not have the 'Exclude from latest' checkbox checked in the CMS will be shown.
             * @type {boolean}
             * @default
             */
            excludeSelection: false,
            /**
             * Whether the template should collect items from all years, regardless of the current year.
             * This will mean items from all years are available for use in the <code>template</code> option and <code>beforeRender</code> callback.
             * @type {boolean}
             * @default
             */
            fetchAllYears: false,
            /**
             * If true, the widget will force <code>fetchAllYears</code> to be true and thus items from all years will be available for use in the
             * <code>template</code> and <code>beforeRender</code> callback. In addition, the widget will load content from all years by default and there will
             * be a new option for "all years" in the year template. The "all years" text in the template can be changed with the <code>allYearsText</code> option.
             * If false, the most recent year will be the default year on first load and only specific years will be available in the year template.
             * @type {boolean}
             * @default
             */
            showAllYears: false,
            /**
             * The text to use for the "all years" option.
             * @type {string}
             * @default
             */
            allYearsText: 'All',
            /**
             * The year to display when the widget first loads.
             * Default is to display items from the most recent year, unless <code>showAllYears</code> is true.
             * A useful value you might want to pass is <code>new Date().getFullYear()</code>,
             * which will display items from the current calendar year.
             * @type {number}
             * @default
             * @example 2016
             * @example new Date().getFullYear()
             */
            startYear: null,
            /**
             * Whether to start with <code>startYear</code> even if there are no documents for that year.
             * @type {boolean}
             * @default
             */
            forceStartYear: false,
            /**
             * A JSON object to convert custom time zones back to the default
             * This is needed only when using <code>isFuture</code> or <code>isPast</code> in the template.
             * If the custom timezone is not defined in this list, you may see an "invalid date" error.
             * @type {object}
             * @default {
             *     'PT': 'PST',
             *     'MT': 'MST',
             *     'CT': 'CST',
             *     'ET': 'EST',
             *     'AT': 'AST',
             *     'GT': 'GST',
             *     'GMT': 'GMT',
             *     'BST': 'GMT'
             * }
             */
            isTimeZoneKey: {
                'PT': 'PST',
                'MT': 'MST',
                'CT': 'CST',
                'ET': 'EST',
                'AT': 'AST',
                'GT': 'GST',
                'GMT': 'GMT',
                'BST': 'GMT'
            },
            /**
             * A list of tags to filter by.
             * @type {Array<string>}
             * @default
             * @example ['featured', 'earnings'],
             */
            tags: [],
            /**
             * The maximum character length of an item's title. Use Zero for no limit.
             * @type {number}
             * @default
             * @example 100
             */
            titleLength: 0,
            /**
             * The maximum character length for the body text, or zero for unlimited.
             * @type {number}
             * @default
             * @example 100
             */
            bodyLength: 0,
            /**
             * The maximum character length for the short body text, or zero for unlimited.
             * @type {number}
             * @default
             */
            shortBodyLength: 0,
            /**
             * If time is required in the widget template, change this option to <code>true</code>. This will mean the widget uses Moment.js to format dates and
             * times instead of datepicker. Note that this option will only work if the Moment.js library has been included on the page.
             * <strong>If true, the <code>dateFormat</code> option must be changed to use MomentJS date format naming rules.</strong>
             * @type {boolean}
             * @default
             */
            useMoment: false,
            /**
             * <div style="background:none;">
             *    A date format string, which can be used in the template as <code>{{date}}</code>.
             *    Can alternately be an object of format strings, which can be accessed with <code>{{date.key}}</code> (where key is the
             *    object key corresponding to the string you want to use). In a widget which requires a date and time you would want to enable the <code>useMoment</code> option
             *    and render the time as <code>{{date.time}}</code> in the template.
             *    <ul>
             *          <li>If <code>useMoment</code> is false (default value), dates are formatted using <a href="http://api.jqueryui.com/datepicker/" target="_blank">jQuery UI's datepicker rules</a>.</li>
             *          <li>If <code>useMoment</code> is true, the date will be formatted using <a href="https://momentjs.com/docs/#/displaying/" target="_blank">MomentJS rules</a>.</li>
             *    </ul>
             * </div>
             * <div style="display:inline-block; width: 49.9%; vertical-align: top; background:none;">
             *          <strong>Common Datepicker Format options:</strong>
             *          <ul>
             *            <li>d = day of month (no leading zero)</li>
             *            <li>dd = day of month (two digit)</li>
             *            <li>D = day name short</li>
             *            <li>DD = day name long</li>
             *            <li>m = month of year (no leading zero)</li>
             *            <li>mm = month of year (two digit)</li>
             *            <li>M = month name short</li>
             *            <li>MM = month name long</li>
             *            <li>y = year (two digit)</li>
             *            <li>yy = year (four digit)</li>
             *            <li>@ = Unix timestamp (milliseconds since 01/01/1970)</li>
             *          </ul>
             * </div>
             * <div style="display:inline-block; width: 45%; vertical-align: top; background:none;">
             *          <strong>Common MomentJS Format options:</strong>
             *          <ul>
             *            <li>D = day of month (no leading zero)</li>
             *            <li>DD = day of month (two digit)</li>
             *            <li>ddd = day name short</li>
             *            <li>dddd = day name long</li>
             *            <li>M = month of year (no leading zero)</li>
             *            <li>MM = month of year (two digit)</li>
             *            <li>MMM = month name short</li>
             *            <li>MMMM = month name long</li>
             *            <li>YY = year (two digit)</li>
             *            <li>YYYY = year (four digit)</li>
             *            <li>x = Unix timestamp (milliseconds since 01/01/1970)</li>
             *            <li>h = hour (12hr, no leading zero)</li>
             *            <li>hh = hour (12hr, two digit)</li>
             *            <li>mm = minute (two digit)</li>
             *            <li>A = AM/PM</li>
             *            <li>a = am/pm</li>
             *          </ul>
             * </div>
             * @example 'MM d, yy' // datepicker format
             * @example
             * {
             *     date: 'MM D, YYYY',
             *     time: 'hh:mm a'
             * }
             * @type {string|Object}
             * @default
             */
            dateFormat: 'MM d, yy',
            /**
             * Whether to sort items in ascending chronological order.
             * @type {boolean}
             * @default
             */
            sortAscending: false,
            /**
             * An array of years to filter by. If passed, no items will
             * be displayed unless they are dated to a year in this list.
             * @type {Array<number>}
             * @example [2014, 2015, 2018]
             * @default
             */
            years: [],
            /**
             * The earliest year to display items from.
             * @type {?number}
             * @example 2015
             * @default
             */
            minYear: null,
            /**
             * The latest year to display items from.
             * @type {?number}
             * @example 2018
             * @default
             */
            maxYear: null,
            /**
             * The earliest date to display items from.
             * @type {?Date}
             * @example "2018-01-24T01:20:00" // Jan 24, 2018 @ 1:20am
             * @default
             */
            minDate: null,
            /**
             * The latest date to display items from.
             * @type {?Date}
             * @example "2018-01-24T22:20:00" // Jan 24, 2018 @ 10:20pm
             * @default
             */
            maxDate: null,
            /**
             * A URL to use for a default thumbnail, in case an item has none.
             * @type {string}
             * @example '/files/images/cover-thumb.png'
             * @default
             */
            defaultThumb: '',
            /**
             * Whether to append the main template to a <code>&#60;div></code> inside the widget container,
             * or replace the container's contents entirely.
             * @type {boolean}
             * @default
             */
            append: true,
            /**
             * An optional CSS class to apply to the widget container,
             * or if <code>append</code> is true, to the <code>&#60;div></code> containing the main template.
             * @type {?string}
             */
            cssClass: null,
            /**
             * A CSS class to add to the widget while data is loading.
             * This can be used to show and hide elements within the widget.
             * @type {?string}
             */
            loadingClass: null,
            /**
             * A message or HTML string to display while first loading the widget.
             * See also <code>itemLoadingMessage</code>.
             * @type {?string}
             * @default
             */
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading ...</span></p>',
            /**
             * A selector for the year navigation container.
             * Use this if you don't want to use the <code>template</code> option to draw the widget,
             * but you still want to generate a list of years.
             * You must also pass <code>yearTemplate</code> for this to have any effect.
             * @type {?string}
             */
            yearContainer: null,
            /**
             * A Mustache.js template for a single year.
             * If this and <code>yearContainer</code> are passed, this will be used to render each option in
             * the year navigation, which will be attached to the widget at <code>yearContainer</code>.
             * See the <code>template</code> option for available tags.
             * @type {?string}
             * @example '<li>{{year}}</li>'
             * @example '<option value="{{value}}">{{year}}</option>'
             */
            yearTemplate: null,
            /**
             * A CSS selector for year trigger links.
             * If passed, any elements in the widget matching this selector will
             * become clickable links that filter the displayed items by year.
             * Usually you'll want to point this to an element in the template's <code>{{years}}</code> loop.
             *
             * Note that this doesn't automatically generate the year links;
             * you can do that in the template.
             * @example 'a.yearLink'
             * @type {?string}
             */
            yearTrigger: null,
            /**
             * A CSS selector for a year dropdown.
             * This behaves like the <code>yearTrigger</code> option, except instead of pointing to
             * individual links, it should point to a <code>&#60;select></code> or similar form element.
             *
             * Note that this doesn't automatically fill the box with <code>&#60;option></code>'s;
             * Utilize the <code>yearTemplate</code> option or specify a container in the <code>template</code> to generate the options inside the select.
             * @example '.yearsDropdown'
             * @type {?string}
             */
            yearSelect: null,
            /**
             * An HTML string to display in the year container if no years are found.
             * @type {string}
             * @example
             * '<option value="-1">N/A</option>'
             * @default
             */
            noYearsMessage: '',
            /**
             * A CSS selector for a tag dropdown or text input.
             * This should point to a <code>&#60;select></code>, <code>&#60;input></code> or similar form element.
             * When the element's value changes, the value will be used as a space or comma-separated list of tags to filter the items by.
             * @example 'select.tagDropdown'
             * @example 'input.tagList'
             * @type {?string}
             */
            tagSelect: null,
            /**
             * A CSS selector for a tag trigger links.
             * If passed, any elements in the widget matching this selector will
             * become clickable links that filter the displayed items by tag.
             *
             * Note that this doesn't automatically generate the list of tags, it only acts the functionality to filter;
             * @example 'a.tagList'
             * @type {?string}
             */
            tagTrigger: null,
            /**
             * The CSS class to add to a selected year and tag trigger.
             * @type {string}
             * @default
             */
            activeClass: 'js--selected',
            /**
             * A selector for the items container.
             * An alternative to the generic <code>template</code> option, use this if you want to redraw only the item list.
             * This will render the items using the <code>itemTemplate</code> at initialization as well as each time a year or tag is updated (instead of redrawing the entire widget).
             * @example '.module_container--content'
             * @type {?string}
             */
            itemContainer: null,
            /**
             * A Mustache.js template for a single item, which will be reused for each item in the data array.
             * For example, use this option to define a template for a single event. The widget will then re-use this template for every event that exists matching the widget criteria.
             * The result is that all events in this widget are now structured in the same way on the page.
             * If this and <code>itemContainer</code> are passed, this template will be used to render the items list inside the <code>itemContainer</code>.
             * When using <code>yearSelect</code> or <code>yearTrigger</code> and the year changes, only this part of the widget will be redrawn.
             * The same functionality applies for <code>tagSelect</code> and <code>tagTrigger</code>.
             * Read more about configuration options in the <code>template</code> option below.
             * <br><br>
             * <pre>
             * itemTemplate: (
             * &nbsp;'&#60;div class="module_item-wrap background--grey">' +
             * &nbsp;&nbsp;&nbsp;'&#60;div class="module_date-time">&#60;span class="module_date-text">{{date}}</span>&#60;/div>' +
             * &nbsp;&nbsp;&nbsp;'&#60;div class="module_headline">' +
             * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'&#60;a class="module_headline-link" href="{{url}}">{{title}}&#60;/a>' +
             * &nbsp;&nbsp;&nbsp;'&#60;/div>' +
             * &nbsp;&nbsp;&nbsp;'&#60;div class="module_links module_q4-icon-links">' +
             * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'&#60;a class="module_link" href="{{docUrl}}" target="_blank">Download PDF &#60;span class="sr-only">(opens in new window)&#60;/span>&#60;/a>' +
             * &nbsp;&nbsp;&nbsp;'&#60;/div>' +
             * &nbsp;'&#60;/div>'
             * )
             * </pre>
             * @type {string}
             */
            itemTemplate: '',
            /**
             * A CSS class to add to the widget while loading items inside the <code>itemContainer</code>.
             * This can be used to show and hide elements within the item container.
             * You must also pass <code>itemContainer</code> and <code>itemTemplate</code> for this to have any effect.
             * By default it is the same as <code>itemLoadingMessage</code>.
             * @type {?string}
             */
            itemLoadingClass: null,
            /**
             * A message or HTML string to display while loading items inside of the <code>itemContainer</code>.
             * You must also pass <code>itemContainer</code> and <code>itemTemplate</code> for this to have any effect.
             * By default it is the same as <code>loadingMessage</code>.
             * @type {?string}
             */
            itemLoadingMessage: null,
            /**
             * A message or HTML string to display in the <code>itemContainer</code> if no items are found.
             * @type {string}
             * @default
             */
            itemNotFoundMessage: '<p><i class="q4-icon_warning-line"></i> No items found.</p>',
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
             * <ul>
             *   <li><code>{{#years}}</code> An array of years for the navigation. Each year has these subtags:
             *     <ul>
             *       <li> <code>{{year}}</code> The display label of the year (e.g. <code>"2015"</code>, <code>"All Years"</code>)</li>
             *       <li> <code>{{value}}</code>  The internal value of the year (e.g. <code>2015</code>, <code>-1</code>)</li>
             *       <li><code>{{#items}}</code> An array of items for this year, with the same format as the "all items" array.</li>
             *    </ul>
             *   <li><code>{{#yearsWithItems}}</code> works similar to <code>{{years}}</code> but will only return the years that have items. This can be used to avoid showing "phantom" years that have no content.</li>
             *   <li><code>{{#items}}</code> An array of all items. Each item has a number of available subtags, which vary depending which child widget you are using.</li>
             * </ul>
             * <br>
             * For a list of variables available for templates, check the documentation for the specific child widgets:
             * <ul>
             *   <li><a href="q4.downloads.html#option-template">Downloads</a></li>
             *   <li><a href="q4.events.html#option-template">Events</a></li>
             *   <li><a href="q4.financials.html#option-template">Financials</a></li>
             *   <li><a href="q4.indexPresentations.html#option-template">Presentations</a></li>
             *   <li><a href="q4.indexNews.html#option-template">News</a></li>
             *   <li><a href="q4.indexSec.html#option-template">SEC</a></li>
             * </ul>
             * <br>
             * <pre>
             * template: (
             * &nbsp;'&#60;select class="years">' +
             * &nbsp;&nbsp;'{{#years}}' +
             * &nbsp;&nbsp;&nbsp;&nbsp;'&#60;option value="{{value}}">{{year}}&#60;/option>' +
             * &nbsp;&nbsp;'{{/years}}' +
             * &nbsp;'&#60;/select>' +
             * &nbsp;'&#60;h4>{{title}}&#60;/h4>' +
             * &nbsp;'&#60;ul class="items">' +
             * &nbsp;&nbsp;'{{#items}}' +
             * &nbsp;&nbsp;&nbsp;&nbsp;'&#60;li>&#60;a href="{{url}}">{{title}}&#60;/a>&#60;/li>' +
             * &nbsp;&nbsp;'{{/items}}' +
             * &nbsp;&nbsp;'{{^items}}No items found.{{/items}}' +
             * &nbsp;'&#60;/ul>'
             * )
             * </pre>
             * @type {string}
             */
            template: '',
            /**
             * A callback that fires when the list of years to display changes.
             * @type {function}
             * @param {Event}  [event] The triggering event object.
             * @param {Object} [data]  A data object containing the newly selected year. Example: <code>{ year: 2015 }</code>
             */
            onYearChange: function (e, data) {
            },
            /**
             * A callback that fires when the tag filtering selection changes.
             * @type {function}
             * @param {Event}  [event] The triggering event object.
             * @param {Object} [data]  A data object containing the array of tags to filter by. Example: <code>{ tags: { 0: "featured", 1: "slider" } }</code>
             */
            onTagChange: function (e, data) {
            },
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
             * @param {Object} [templateData] The complete template data. Example: <code>{ items: [{...}, {...}], years: [{...}, {...}], yearsWithItems: [{...}, {...}] }</code>
             */
            beforeRender: function (e, tplData) {
            },
            /**
             * A callback that fires before the items list is rendered. It is commonly used to manipulate specific entries in the items array, such as overwriting a URL with a document path.
             * <ul>
             *   <li>This function can run multiple times, it is triggered by user actions and methods.</li>
             *   <li>Runs only if <code>itemContainer</code> and <code>itemTemplate</code> are defined.</li>
             *   <li>This callback is automatically triggered when <code>yearSelect</code>/<code>yearTrigger</code>or <code>tagSelect</code>/<code>tagTrigger</code> are activated.</li>
             *   <li>Will always run <strong>after</strong> the <code>beforeRender </code> callback if both are used.</li>
             * </ul>
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] Template data for the items list. Example: <code>{ items: [{...}, {...}, {...}] }</code>
             */
            beforeRenderItems: function (e, tplData) {
            },
            /**
             * A callback that fires before the years are rendered.
             * <ul>
             *   <li>This function only runs once, when the widget is first loaded on the page.</li>
             *   <li>The function can be triggered to run again by using the <code>reloadYears</code> method.</li>
             *   <li>Runs only if <code>yearContainer</code> and <code>yearTemplate</code> are defined.</li>
             *   <li>Will always run <strong>before</strong> the <code>beforeRender</code>, <code>beforeRenderItems</code>, <code>itemsComplete</code> and <code>complete</code> callbacks.</li>
             * </ul>
             * @type {function}
             * @param {Event}  [event]        The event object.
             * @param {Object} [templateData] Template data for the years list. Example: <code>{ items: [2018, 2017, 2016, 2015, 2014] }</code>
             */
            beforeRenderYears: function (e, tplData) {
            },
            /**
             * A callback that fires after the item list is rendered. Often used to trigger item-specific scripts or plugins to run, such as <a href="q4.pager.html">Pager</a>.
             * <ul>
             *   <li>This function can run multiple times, it is triggered by user actions and methods.</li>
             *   <li>Runs only if <code>itemContainer</code> and <code>itemTemplate</code> are defined.</li>
             *   <li>This callback is automatically triggered when <code>yearSelect</code>/<code>yearTrigger</code>or <code>tagSelect</code>/<code>tagTrigger</code> are activated.</li>
             *   <li>Will always run <strong>before</strong> the <code>complete</code> callback if both are used.</li>
             * </ul>
             * @type {function}
             * @param {Event} [event] The event object.
             */
            itemsComplete: function (e) {
            },
            /**
             * A callback that fires after the entire widget is rendered. Often used to trigger additional global scripts or plugins to run.
             * <ul>
             *   <li>This function runs only once, when widget is first loaded on the page</li>
             *   <li>Can be used with any of the widget template options (<code>template</code>, <code>yearTemplate</code> and <code>itemTemplate</code>)</li>
             *   <li>This callback is <strong>not</strong> triggered by yearSelect or yearTrigger actions.</li>
             *   <li>Can be used in conjunction with <code>itemsComplete</code> callback, but it will run after <code>itemsComplete</code> is finished.</li>
             * </ul>
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function (e) {
            }
        },

        /**
         * A method to refresh the year list and content items after changing other widget options.
         * <ul>
         *   <li>Method will re-render all items in the <code>itemTemplate</code> <strong>and</strong> <code>yearTemplate</code>.</li>
         *   <li>This method can be triggered multiple times, but to avoid a loop it is recommended to trigger it only on a user's action (ex. click).</li>
         *   <li>Note that this method will not work in conjunction with the <code>template</code> option.</li>
         *   <li>Using this method instead of <code>reloadItems</code> will help to avoid showing unecessary years that do not have any content.</li>
         *   <li>This method is usually used when combined with changing a widget option. See example 2 below.</li>
         * </ul>
         * @type {function}
         * @example $('.events-widget').events('reloadYears');
         * @example $('.sec-widget').sec('option', 'filingTypes', [1,3,4]); <br>  $('.sec-widget').sec('reloadYears');
         */
        reloadYears: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            _._getYears().done(function (years, items) {
                var tplData = {years: []};

                if (years.length) {
                    _.years = _._filterYears(years);

                    $.each(_.years, function (i, year) {
                        tplData.years.push({
                            year: year,
                            value: year
                        });
                    });

                    _.currentYear = tplData.years[0].year;

                    $(o.yearContainer, $e).empty();
                    $.each(tplData.years, function (i, tplYear) {
                        $(o.yearContainer, $e).append(Mustache.render(o.yearTemplate, tplYear));
                    });

                    _._updateYearControls(_.currentYear);

                    _.reloadItems();

                    // re-bind events to year triggers/selectbox
                    if (o.yearTrigger) {
                        // add year data to each trigger and bind click event
                        $(o.yearTrigger, $e).each(function (i) {
                            var year = tplData.years[i].value;
                            $(this).data('year', year);

                            $(this).click(function (e) {
                                if (!$(this).hasClass(o.activeClass)) _.setYear(year, e);
                            });
                        });
                    }
                    if (o.yearSelect) {
                        // bind change event to selectbox
                        $(o.yearSelect, $e).change(function (e) {
                            _.setYear($(this).val(), e);
                        });
                    }

                } else {
                    $(o.yearContainer, $e).empty();
                    $(o.yearContainer, $e).append(o.noYearsMessage);
                    $(o.itemContainer, $e).html(o.itemNotFoundMessage || '');
                }
            });
        },

        /**
         * A method to refresh ONLY the content items after changing other widget options.
         * <ul>
         *   <li>Method will re-render all items in the <code>itemTemplate</code>.</li>
         *   <li>This method can be triggered multiple times, but to avoid a loop it is recommended to trigger it only on a user's action (ex. click).</li>
         *   <li>Note that this method will not work in conjunction with the <code>template</code> option.</li>
         *   <li>This method will be triggered automatically by <code>setYear</code>, <code>setTags</code> and <code>reloadYears</code> methods.</li>
         *   <li>This method is usually only used when combined with changing a widget option. See example 2 below.</li>
         * </ul>
         * @type {function}
         * @example $('.events-widget').events('reloadItems');
         * @example $('.sec-widget').sec('option', 'filingTypes', [1,3,4]); <br>  $('.sec-widget').sec('reloadItems');
         */
        reloadItems: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // add loading class and display loading message
            if (o.itemContainer && o.itemTemplate) {
                var $itemContainer = $(o.itemContainer, $e);
                if (o.itemLoadingClass) $itemContainer.addClass(o.itemLoadingClass);
                $itemContainer.html(o.itemLoadingMessage || '');
            } else {
                if (o.loadingClass) this.$widget.addClass(o.loadingClass);
                this.$widget.html(o.loadingMessage || '');
            }

            // fetch and display items
            this._fetchItems(this.currentYear).done(function (items) {
                if (o.itemContainer && o.itemTemplate) {
                    // rerender item section
                    _._renderItems(items);
                } else {
                    // rerender entire widget
                    _._renderWidget(items);
                }
            });
        },

        /**
         * A method to set the widget to only show content from a specific year, and trigger a reload of the content items.
         * <ul>
         *   <li>Method will re-render all items in the <code>itemTemplate</code>.</li>
         *   <li>This method can be triggered multiple times, but to avoid a loop it is recommended to trigger it only on a user's action (ex. click).</li>
         *   <li>Note that this method will not work in conjunction with the <code>template</code> option.</li>
         *   <li>This method will trigger the <code>onYearChange</code> callback.</li>
         *   <li>This method will trigger the <code>reloadItems</code> method.</li>
         * </ul>
         * @type {function}
         * @example $('.news-widget').news('setYear', 2018, e);
         * @param {number} year    The year to display, or -1 for all years.
         * @param {Event}  [event] The triggering event, such as the user 'click'.
         */
        setYear: function (year, e) {
            var o = this.options;

            // default value if year is invalid
            var currentYear = parseInt(year);
            if ($.inArray(currentYear, this.years) == -1) {
                currentYear = o.showAllYears ? -1 : this.years[0];
            }

            // fire callback, cancel event if default action is prevented
            this._trigger('onYearChange', e, {year: currentYear});
            if (e && e.isDefaultPrevented()) return;

            this.currentYear = currentYear;
            this._updateYearControls(this.currentYear);

            this.reloadItems();
        },
        /**
         * A method to set the widget to only show content from a specific year, and trigger a reload of the content items.
         * <ul>
         *   <li>Method will set a tag filter for the widget, and reload the content based on that filter.</li>
         *   <li>This method can be triggered multiple times, but to avoid a loop it is recommended to trigger it only on a user's action (ex. click).</li>
         *   <li>Note that this method will not work in conjunction with the <code>template</code> option.</li>
         *   <li>This method will either trigger the <code>reloadYears</code> or <code>reloadItems</code> methods, depending on parameters.</li>
         * </ul>
         * @type {function}
         * @example $('.events-widget').events('setTags', ['featured'], e);
         * @param {Array<string>} tags    The array of tags to filter by.
         * @param {Boolean} reloadYears    Whether or not to reload the year list along with content items when setting a tag.
         * When the <code>tagTrigger</code>/<code>tagSelect</code> options are defined, this parameter is true.
         * If the parameter is set to true (or inherited to be true), the <code>reloadYears</code> will be triggered.
         * If the parameter is set to false, the <code>reloadItems</code> will be triggered.
         * @param {Event}  [event] The triggering event, such as the user 'click'.
         */
        setTags: function (tags, reloadYears, e) {
            tags = this._convertToArray(tags);

            // fire callback, cancel event if default action is prevented
            this._trigger('onTagChange', e, {tags: tags});
            if (e && e.isDefaultPrevented()) return;

            this.currentTags = tags;
            this._updateTagControls(this.currentTags);

            if (reloadYears) this.reloadYears();
            else this.reloadItems();
        },
        /**
         * A method to set any of the widget options.
         * <ul>
         *   <li>Method will change the value of any existing options.</li>
         *   <li>This method can be triggered multiple times, but to avoid a loop it is recommended to trigger it only on a user's action (ex. click).</li>
         *   <li>Note that this method will not automatically trigger any reload in the widget.</li>
         *   <li>To reload the content, you must manually trigger the <code>reloadItems</code> or <code>reloadYears</code> methods.</li>
         * </ul>
         * @type {function}
         * @example $('.sec-widget').sec('option', 'filingTypes', [1,3,4]);
         * @param {string} option    The name of the optiuon you wish to change
         * @param {?} value    The new value for that option> Depending on the option you are changing, this could be a string, boolean, object etc.
         */

        $widget: null,

        years: null,

        currentYear: -1,
        currentTags: [],

        _setOption: function (key, value) {
            this._super(key, value);
            this._normalizeOptions();
        },

        _convertToArray: function (value) {
            // treat a string like a space-, pipe- or comma-separated list
            if (typeof value == 'string') {
                value = $.trim(value).split(/[\s,|]+/);
            }
            return $.isArray(value) ? value : [];
        },

        _convertToDate: function (value) {
            var date = new Date(value);
            return (date.toString() == 'Invalid Date') ? null : date;
        },

        _normalizeOptions: function () {
            var o = this.options;

            // strip trailing slash from domain
            o.url = o.url.replace(/\/$/, '');

            // convert strings to arrays
            o.years = this._convertToArray(o.years).sort(function (a, b) {
                return b - a;
            });
            o.tags = this._convertToArray(o.tags);

            // convert strings to ints
            if (typeof o.startYear == 'string' && o.startYear.length) {
                o.startYear = parseInt(o.startYear);
            }

            // convert dates
            o.minDate = o.minDate ? this._convertToDate(o.minDate) : null;
            o.maxDate = o.maxDate ? this._convertToDate(o.maxDate) : null;

            // if item loading class/message is unset, set to match loading class/message
            if (o.itemLoadingClass === null) o.itemLoadingClass = o.loadingClass;
            if (o.itemLoadingMessage === null) o.itemLoadingMessage = o.loadingMessage;

            // GetEventYearList doesn't accept EventSelection for some reason
            // so we need this as a workaround
            var thisYear = new Date().getFullYear();
            if (o.showPast && !o.showFuture) {
                o.maxYear = Math.min(thisYear, o.maxYear || thisYear);
            } else if (o.showFuture && !o.showPast) {
                o.minYear = Math.max(thisYear, o.minYear || thisYear);
            }
        },

        _init: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // save content type (and abort if there is none)
            if (this.widgetName == 'api') {
                throw new Error("Please use one of q4.indexApi's child widgets.");
            }
            this.contentType = this.contentTypes[this.widgetName];

            this._normalizeOptions();

            // save a reference to the widget
            this.$widget = o.append ? $('<div>').appendTo($e) : $e;

            // add classes and append the loading message
            if (o.cssClass) this.$widget.addClass(o.cssClass);
            if (o.loadingClass) this.$widget.addClass(o.loadingClass);
            this.$widget.html(o.loadingMessage || '');

            // initialize tags
            this.currentTags = o.tags;

            // get years (and possibly items at the same time)
            this._getYears().done(function (years, items) {
                // filter years and get the active year
                _.years = _._filterYears(years);
                _.currentYear = _._getCurrentYear(_.years);

                // if we got items as side-effect of getting years, skip straight to rendering
                if (items !== undefined) {
                    _._renderWidget(items);
                } else {
                    _._fetchItems(_.currentYear).done(function (items) {
                        _._renderWidget(items);
                    });
                }
            });
        },

        _getYears: function () {
            var o = this.options;

            // if we're fetching all docs for all years, skip fetching the year list
            if (o.fetchAllYears && !o.limit) {
                var gotYears = $.Deferred();

                // get items for all years
                this._fetchItems(-1).done(function (items) {
                    // get list of years from items
                    var years = [];
                    $.each(items, function (i, item) {
                        if ($.inArray(item.year, years) == -1) years.push(item.year);
                    });

                    // return years and items
                    gotYears.resolve(years, items);
                });

                return gotYears;
            } else return this._fetchYears();
        },

        _filterYears: function (years) {
            var o = this.options;

            // filter years
            years = $.grep(years, function (year) {
                return (
                    (!o.minYear || year >= o.minYear) &&
                    (!o.maxYear || year <= o.maxYear) &&
                    (!o.years.length || $.inArray(year, o.years) > -1)
                );
            });

            // force startYear onto the years array if requested
            if (o.forceStartYear && $.inArray(o.startYear, years) == -1)
                years.push(o.startYear);

            // sort the years in descending order
            years.sort(function (a, b) {
                return b - a
            });

            return years;
        },

        _getCurrentYear: function (years) {
            var o = this.options;

            if (years.length) {
                // if o.startYear is specified and it exists, use it
                if ($.inArray(o.startYear, years) > -1) return o.startYear;
                // otherwise if "all" is not enabled, use the most recent
                if (!o.showAllYears) return years[0];
                // or if "all" is enabled, use all
            }
            return -1;
        },

        _buildParams: function () {
            var o = this.options,
                obj = o.usePublic ? {
                    apiKey: o.apiKey,
                    LanguageId: o.languageId ? o.languageId : GetLanguageId()
                } : {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: o.languageId ? o.languageId : GetLanguageId(),
                        Signature: GetSignature()
                    }
                }

            return obj;
        },

        _callApi: function (url, params) {
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

        _fetchYears: function () {
            var _ = this,
                o = this.options,
                source = !o.usePublic ? 0 : 1,
                gotYears = $.Deferred(),
                currentTags = $.grep(this.currentTags || [], function (tag) {
                    return tag.length > 0;
                });

            var obj = o.usePublic ? {
                tagList: currentTags.join('|')
            } : {
                serviceDto: {
                    TagList: currentTags
                }
            };

            this._callApi(this.contentType.yearsUrl[source], $.extend(true,
                this._buildParams(),
                this.contentType.buildParams.call(this, o), obj
            )).done(function (data) {
                _._trigger('beforeRenderYears', null, {items: data[_.contentType.yearsResultField]});
                gotYears.resolve(data[_.contentType.yearsResultField]);
            });

            return gotYears;
        },

        _fetchItems: function (year) {
            var _ = this,
                o = this.options,
                source = !o.usePublic ? 0 : 1,
                gotItems = $.Deferred(),
                currentTags = $.grep(this.currentTags, function (tag) {
                    return tag.length > 0;
                });

            var obj = o.usePublic ? {
                pageSize: o.limit || -1,
                pageNumber: o.skip,
                tagList: currentTags.join('|'),
                includeTags: true,
                year: o.fetchAllYears ? -1 : year,
                excludeSelection: o.excludeSelection ? 0 : 1
            } : {
                serviceDto: {
                    ItemCount: o.limit || -1,
                    StartIndex: o.skip,
                    TagList: currentTags,
                    IncludeTags: true
                },
                excludeSelection: o.excludeSelection ? 0 : 1,
                year: o.fetchAllYears ? -1 : year
            };

            this._callApi(this.contentType.itemsUrl[source], $.extend(true,
                this._buildParams(),
                this.contentType.buildParams.call(this, o), obj
            )).done(function (data) {
                // parse, filter and sort items
                var items = $.map(data[_.contentType.itemsResultField], function (rawItem) {
                    return _.contentType.parseItem.call(_, o, rawItem);
                });
                items = $.grep(items, function (item) {
                    return (
                        (!o.minDate || item.dateObj >= o.minDate) &&
                        (!o.maxDate || item.dateObj <= o.maxDate)
                    );
                });

                items.sort(function (a, b) {
                    return (b.dateObj - a.dateObj) * (o.sortAscending ? -1 : 1);
                });

                // orders item documents based off of order array, currently only used by SEC
                if (o.docOrder !== 0 && o.docOrder !== undefined) {
                    $.each(items, function (i, item) {
                        $.each(o.docOrder, function (k, type) {
                            var checkedDoc = $.grep(item.docs, function (e) {
                                return e.docType == type;
                            });
                            if (!checkedDoc.length) {
                                item.docs.push({
                                    docType: type,
                                    docUrl: '',
                                    docEmpty: true
                                });
                            }
                        });
                        item.docs.sort(function (a, b) {
                            var compA = $.inArray(a.docType, o.docOrder);
                            var compB = $.inArray(b.docType, o.docOrder);
                            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
                        });
                    });
                }

                gotItems.resolve(items);
            });

            return gotItems;
        },

        _truncate: function (text, length) {
            if (!text) return '';
            return !length || text.length <= length ? text : text.substring(0, length) + '...';
        },

        _formatDate: function (dateString) {
            var o = this.options,
                date = new Date(dateString),
                useMoment = o.useMoment && typeof moment != 'undefined';

            if (typeof o.dateFormat == 'string') {
                // if o.dateFormat is a format string, return a formatted date string
                return useMoment ? moment(date).format(o.dateFormat) :
                    $.datepicker.formatDate(o.dateFormat, date);
            } else if (typeof o.dateFormat == 'object') {
                // if o.dateFormat is an object of names to format strings,
                // return an object of names to formatted date strings
                var dates = {};
                for (name in o.dateFormat) {
                    dates[name] = useMoment ? moment(date).format(o.dateFormat[name]) :
                        $.datepicker.formatDate(o.dateFormat[name], date);
                }
                return dates;
            }
        },

        _buildTemplateData: function (items) {
            var _ = this,
                o = this.options,
                itemsByYear = {},
                tplData = {
                    items: [],
                    years: [],
                    yearsWithItems: []
                };

            $.each(items, function (i, item) {
                // only save items that are in the years array
                if ($.inArray(item.year, _.years) == -1) return true;
                if (!(item.year in itemsByYear)) itemsByYear[item.year] = [];

                // add item to template data
                tplData.items.push(item);
                itemsByYear[item.year].push(item);
            });

            // add "all years" option, if there are years to show
            if (o.showAllYears && this.years.length) {
                tplData.years.push({
                    year: o.allYearsText,
                    value: -1,
                    items: tplData.items
                });
            }
            // build per-year data for template
            $.each(this.years, function (i, year) {
                tplData.years.push({
                    year: year,
                    value: year,
                    items: itemsByYear[year] || []
                });
                if (year in itemsByYear) {
                    tplData.yearsWithItems.push({
                        year: year,
                        value: year,
                        items: itemsByYear[year]
                    });
                }
            });

            return tplData;
        },

        _renderItems: function (items) {
            var o = this.options,
                $e = this.element,
                $itemContainer = $(o.itemContainer, $e);

            if (o.limitSort) items.reverse();

            this._trigger('indexBeforeRenderItems', null, {items: items});
            this._trigger('beforeRenderItems', null, {items: items});

            // remove loading class
            if (o.itemLoadingClass) $itemContainer.removeClass(o.itemLoadingClass);

            // clear previous contents and render items, or 'not found' message
            if (items.length) {
                $itemContainer.empty();
                $.each(items, function (i, item) {
                    $itemContainer.append(Mustache.render(o.itemTemplate, item));
                });
            } else {
                $itemContainer.html(o.itemNotFoundMessage || '');
            }

            this._trigger('indexItemsComplete');
            this._trigger('itemsComplete');
        },

        _renderWidget: function (items) {
            var _ = this,
                o = this.options,
                $e = this.element;

            if (o.limitSort) items.reverse();

            // get template data
            var tplData = this._buildTemplateData(items);

            var yearItems = [];
            $.each(tplData.years, function (i, tplYear) {
                if (tplYear.value == _.currentYear) {
                    // set the active year in the template data
                    tplYear.active = true;
                    // save this year's items for separate item rendering
                    yearItems = tplYear.items;
                }
            });

            this._trigger('indexBeforeRender', null, tplData);
            this._trigger('beforeRender', null, tplData);

            // remove loading class, clear previous contents and render entire widget
            if (o.loadingClass) this.$widget.removeClass(o.loadingClass);
            this.$widget.html(Mustache.render(o.template, tplData));

            // render items separately if applicable
            if (o.itemContainer && o.itemTemplate) {
                this._renderItems(yearItems);
            }

            // render years separately if applicable
            if (o.yearContainer && o.yearTemplate) {
                $(o.yearContainer, $e).empty();
                if (!!tplData.years.length) {
                    $.each(tplData.years, function (i, tplYear) {
                        $(o.yearContainer, $e).append(Mustache.render(o.yearTemplate, tplYear));
                    });
                } else $(o.yearContainer, $e).append(o.noYearsMessage);
            }
            // bind events to year triggers/selectbox
            if (o.yearTrigger) {
                // add year data to each trigger and bind click event
                $(o.yearTrigger, $e).each(function (i) {
                    var year = tplData.years[i].value;
                    $(this).data('year', year);

                    $(this).click(function (e) {
                        if (!$(this).hasClass(o.activeClass)) _.setYear(year, e);
                    });
                });
            }
            if (o.yearSelect) {
                // bind change event to selectbox
                $(o.yearSelect, $e).change(function (e) {
                    _.setYear($(this).val(), e);
                });
            }

            // bind events to tag selectbox/input
            if (o.tagSelect) {
                $(o.tagSelect, $e).change(function (e) {
                    _.setTags($(this).val(), true, e);
                });
            }

            // bind events to tag triggers
            if (o.tagTrigger) {
                $(o.tagTrigger, $e).each(function (e) {
                    $(this).click(function (e) {
                        if (!$(this).hasClass(o.activeClass)) _.setTags($(this).data('tag'), true, e);
                    });
                });
            }

            if (o.customSelect) {

            }

            // set triggers/selectbox to show active year
            this._updateYearControls(this.currentYear);

            // fire callback
            this._trigger('indexComplete');
            this._trigger('complete');
        },

        _updateYearControls: function (year) {
            var o = this.options,
                $e = this.element;

            if (o.yearTrigger) {
                $(o.yearTrigger, $e).each(function () {
                    $(this).toggleClass(o.activeClass, $(this).data('year') == year);
                });
            }
            if (o.yearSelect) {
                $(o.yearSelect, $e).val(year);
            }
        },

        _updateTagControls: function (tag) {
            var o = this.options,
                $e = this.element;

            if (o.tagTrigger) {
                $(o.tagTrigger, $e).each(function () {
                    $(this).toggleClass(o.activeClass, $(this).data('tag') == tag);
                });
            }
            if (o.tagSelect) {
                $(o.tagSelect, $e).val(tag);
            }
        },

        contentTypes: {
            indexFinancials: {
                itemsUrl: ['/Services/FinancialReportService.svc/GetFinancialReportList', '/feed/FinancialReport.svc/GetFinancialReportList'],
                yearsUrl: ['/Services/FinancialReportService.svc/GetFinancialReportYearList', '/feed/FinancialReport.svc/GetFinancialReportYearList'],
                itemsResultField: 'GetFinancialReportListResult',
                yearsResultField: 'GetFinancialReportYearListResult',

                buildParams: function (o) {
                    // redundant options, because List and YearList have differently named params
                    return {
                        reportTypes: o.reportTypes.join('|'),
                        reportSubType: o.reportTypes, // for YearList
                        reportSubTypeList: o.reportTypes // for List
                    };
                },

                parseItem: function (o, result) {
                    var _ = this;

                    // parse docs
                    var docs = $.map(result.Documents, function (doc) {
                        return {
                            docCategory: doc.DocumentCategory,
                            docSize: doc.DocumentFileSize,
                            docIcon: doc.IconPath,
                            docThumb: doc.ThumbnailPath,
                            docTitle: _._truncate(doc.DocumentTitle, o.titleLength),
                            docType: doc.DocumentFileType,
                            docUrl: doc.DocumentPath
                        };
                    });
                    // filter docs by category if needed
                    if ($.isArray(o.docCategories) && o.docCategories.length) {
                        docs = $.grep(docs, function (doc) {
                            return $.inArray(doc.docCategory, o.docCategories) > -1;
                        });
                    }

                    return {
                        coverUrl: result.CoverImagePath,
                        title: result.ReportTitle,
                        fiscalYear: result.ReportYear,
                        dateObj: new Date(result.ReportDate),
                        year: result.ReportYear,
                        date: this._formatDate(result.ReportDate),
                        tags: result.TagsList,
                        type: result.ReportSubType,
                        shortType: o.shortTypes != undefined ? o.shortTypes[result.ReportSubType] : result.ReportSubType,
                        docs: docs
                    };
                }
            },

            indexPresentations: {
                itemsUrl: ['/Services/PresentationService.svc/GetPresentationList', '/feed/Presentation.svc/GetPresentationList'],
                yearsUrl: ['/Services/PresentationService.svc/GetPresentationYearList', '/feed/Presentation.svc/GetPresentationYearList'],
                itemsResultField: 'GetPresentationListResult',
                yearsResultField: 'GetPresentationYearListResult',

                buildParams: function (o) {
                    var obj = {};
                    if (o.usePublic) obj.presentationDateFilter = o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3);
                    else obj.presentationSelection = o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3);

                    return obj;
                },

                parseItem: function (o, result) {
                    return {
                        title: this._truncate(result.Title, o.titleLength),
                        url: result.LinkToDetailPage,
                        dateObj: new Date(result.PresentationDate),
                        year: new Date(result.PresentationDate).getFullYear(),
                        date: this._formatDate(result.PresentationDate),
                        tags: result.TagsList,
                        body: this._truncate(result.Body, o.bodyLength),
                        docUrl: result.DocumentPath,
                        docSize: result.DocumentFileSize,
                        docType: result.DocumentFileType,
                        audioUrl: result.AudioFile,
                        audioType: result.AudioFileType,
                        audioSize: result.AudioFileSize,
                        videoUrl: result.VideoFile,
                        videoType: result.VideoFileType,
                        videoSize: result.VideoFileSize,
                        relatedUrl: result.RelatedFile,
                        relatedType: result.RelatedFileType,
                        relatedSize: result.RelatedFileSize,
                        thumb: result.ThumbnailPath
                    };
                }
            },

            indexNews: {
                itemsUrl: ['/Services/PressReleaseService.svc/GetPressReleaseList', '/feed/PressRelease.svc/GetPressReleaseList'],
                yearsUrl: ['/Services/PressReleaseService.svc/GetPressReleaseYearList', '/feed/PressRelease.svc/GetPressReleaseYearList'],
                itemsResultField: 'GetPressReleaseListResult',
                yearsResultField: 'GetPressReleaseYearListResult',

                buildParams: function (o) {
                    var bodySelection = o.loadShortBody ? (o.loadBody ? 1 : 3) : (o.loadBody ? 2 : 0);
                    var obj = {};

                    if (o.usePublic) {
                        obj.bodyType = bodySelection,
                            obj.pressReleaseDateFilter = o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3),
                            obj.categoryId = o.category;
                    } else {
                        obj.pressReleaseBodyType = bodySelection,
                            obj.pressReleaseSelection = o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3),
                            obj.pressReleaseCategoryWorkflowId = o.category;
                    }

                    return obj;
                },

                parseItem: function (o, result) {
                    return {
                        title: this._truncate(result.Headline, o.titleLength),
                        url: result.LinkToDetailPage,
                        dateObj: new Date(result.PressReleaseDate),
                        year: new Date(result.PressReleaseDate).getFullYear(),
                        date: this._formatDate(result.PressReleaseDate),
                        tags: result.TagsList,
                        category: result.Category,
                        excludeFromLatest: result.excludeFromLatest,
                        languageId: result.LanguageId,
                        linkToPage: result.LinkToPage,
                        linkTOUrl: result.LinkToUrl,
                        pressReleaseId: result.PressReleaseId,
                        shortDescription: result.ShortDescription,
                        seoName: result.SeoName,
                        body: this._truncate(result.Body, o.bodyLength),
                        shortBody: this._truncate(result.ShortBody, o.shortBodyLength),
                        docUrl: result.DocumentPath,
                        docSize: result.DocumentFileSize,
                        docType: result.DocumentFileType,
                        thumb: result.ThumbnailPath || o.defaultThumb,
                        media: $.map(result.MediaCollection, function (item) {
                            return {
                                alt: item.Alt,
                                url: item.SourceUrl,
                                type: item.Style,
                                height: item.Height,
                                width: item.Width
                            };
                        }),
                        attachments: $.map(result.Attachments, function (item) {
                            return {
                                type: item.DocumentType,
                                extension: item.Extension,
                                size: item.Size,
                                title: item.Title,
                                category: item.Type,
                                url: item.Url
                            };
                        }),
                        multimedia: $.map(result.MediaFiles, function (item) {
                            return {
                                id: item.PressReleaseMediaFileId,
                                active: item.Active,
                                thumbnail: item.ThumbnailPath,
                                type: item.FileType,
                                height: item.Height,
                                url: item.Path,
                                fileSize: item.Size,
                                title: item.Title,
                                category: item.Type,
                                width: item.Width,
                                sizes: $.map(item.Sizes, function (size) {
                                    return {
                                        url: size.Path,
                                        category: size.Type,
                                        fileSize: size.Size,
                                        height: size.Height,
                                        width: size.Width
                                    }
                                })
                            };
                        })
                    };
                }
            },

            indexSec: {
                itemsUrl: ['/Services/SECFilingService.svc/GetEdgarFilingList', '/feed/SECFiling.svc/GetEdgarFilingList'],
                yearsUrl: ['/Services/SECFilingService.svc/GetEdgarFilingYearList', '/feed/SECFiling.svc/GetEdgarFilingYearList'],
                itemsResultField: 'GetEdgarFilingListResult',
                yearsResultField: 'GetEdgarFilingYearListResult',

                buildParams: function (o) {
                    return {
                        exchange: o.exchange,
                        symbol: o.symbol,
                        formGroupIdList: o.filingTypes.join(','),
                        excludeNoDocuments: o.excludeNoDocuments,
                        includeHtmlDocument: o.includeHtmlDocument
                    };
                },

                parseItem: function (o, result) {
                    return {
                        id: result.FilingId,
                        description: this._truncate(result.FilingDescription, o.titleLength),
                        url: result.LinkToDetailPage,
                        dateObj: new Date(result.FilingDate),
                        year: new Date(result.FilingDate).getFullYear(),
                        date: this._formatDate(result.FilingDate),
                        agent: result.FilingAgentName,
                        person: result.ReportPersonName,
                        type: result.FilingTypeMnemonic,
                        docs: $.map(result.DocumentList, function (doc) {
                            return {
                                docType: doc.DocumentType,
                                docUrl: doc.Url.replace(/(\w+:)/, '')
                            };
                        })
                    };
                }
            },

            indexEvents: {
                itemsUrl: ['/Services/EventService.svc/GetEventList', '/feed/Event.svc/GetEventList'],
                yearsUrl: ['/Services/EventService.svc/GetEventYearList', '/feed/Event.svc/GetEventYearList'],
                itemsResultField: 'GetEventListResult',
                yearsResultField: 'GetEventYearListResult',

                buildParams: function (o) {
                    return {
                        eventSelection: o.showFuture && !o.showPast ? 1 : (o.showPast && !o.showFuture ? 0 : 3),
                        eventDateFilter: o.showFuture && !o.showPast ? 1 : (o.showPast && !o.showFuture ? 0 : 3),
                        includeFinancialReports: true,
                        includePresentations: true,
                        includePressReleases: true,
                        sortOperator: o.sortAscending ? 0 : 1
                    };
                },

                parseItem: function (o, result) {
                    $.each(o.isTimeZoneKey, function (key, value) {
                        o.isTimeZoneKey[value] = value;
                    });
                    var _ = this,
                        now = new Date(),
                        timeZone = result.TimeZone == "0" ? "" : o.isTimeZoneKey[result.TimeZone] ? o.isTimeZoneKey[result.TimeZone] : "",
                        startDate = new Date(result.StartDate + " " + timeZone),
                        endDate = new Date(result.EndDate + " " + timeZone);

                    return {
                        title: this._truncate(result.Title, o.titleLength),
                        url: result.LinkToDetailPage,
                        id: result.EventId,
                        dateObj: startDate,
                        year: startDate.getFullYear(),
                        date: this._formatDate(result.StartDate),
                        endDate: this._formatDate(result.EndDate),
                        timeZone: result.TimeZone == "0" ? "" : result.TimeZone,
                        isFuture: startDate > now,
                        isPast: endDate < now,
                        location: result.Location,
                        tags: result.TagsList,
                        body: this._truncate(result.Body, o.bodyLength),
                        webcast: result.WebCastLink,
                        docs: $.map(result.Attachments, function (doc) {
                            return {
                                title: doc.Title,
                                url: doc.Url,
                                type: doc.Type,
                                extension: doc.Extension,
                                size: doc.Size
                            };
                        }),
                        speakers: $.map(result.EventSpeaker, function (speaker) {
                            return {
                                name: speaker.SpeakerName,
                                position: speaker.SpeakerPosition
                            };
                        }),
                        financialReports: $.map(result.EventFinancialReport, function (fr) {
                            return _.contentTypes.indexFinancials.parseItem.call(_, o, fr);
                        }),
                        pressReleases: $.map(result.EventPressRelease, function (pr) {
                            return _.contentTypes.indexNews.parseItem.call(_, o, pr);
                        }),
                        presentations: $.map(result.EventPresentation, function (pres) {
                            return _.contentTypes.indexPresentations.parseItem.call(_, o, pres);
                        })
                    };
                }
            },
        }
    });

    /* Financial Report Widget */

    /**
     * @class q4.indexFinancials
     * @extends q4.indexApi
     * @desc
     * Fetches and displays financial reports from the Q4 private API.<br>
     * <hr>
     * Below is an example of a quarterly financials accordion widget.<br>
     * - It uses date and time, which requires the <code>yearSelect</code> and <code>yearTemplate</code> to render a dropdown list of years.<br>
     * - The year list will reload the <code>itemTemplate</code> when the selection is changed, and will then only show items from the selected year.<br>
     * - This widget uses the <code>itemsComplete</code> to call the Q4 App plugin to create an accordion out of the content, each time the widget items are loaded.<br>
     * <hr>
     * @example
     * <div class="module_options">
     *     <label class="module_options-label sr-only" for="module-financial-quarter_select">Select a year:</label>
     *     <select class="dropdown module_options-select" id="module-financial-quarter_select"></select>
     * </div>
     * <div class="module_container module_container--content"></div>
     * <script>
     * $('.module-financial-quarter .module_container--inner').financials({
     *     usePublic: GetViewType() != "0",
     *     apiKey: Q4ApiKey, // replace with API key from Q4 Website if variable doesn't exist in global modules
     *     reportTypes: ["First Quarter", "Second Quarter", "Third Quarter", "Fourth Quarter"],
     *     yearSelect: '.module_options-select',
     *     yearContainer: '.module_options-select',
     *     yearTemplate: '<option value="{{value}}">{{year}}</option>',
     *     loadingMessage: '<div class="text-center"><p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading financial reports...</span></p></div>',
     *     itemContainer: '.module_container--content',
     *     itemLoadingMessage: '<div class="text-center"><p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading financial reports for the selected year...</span></p></div>',
     *     itemTemplate: (
     *         '<div class="module_item">' +
     *             '<h3 class="module-financial_year-text">{{shortType}} Earnings</h3>' +
     *             '<div class="module_links module_q4-icon-links">' +
     *             '{{#docs}}' +
     *                 '<div><a href="{{docUrl}}" class="module_link module_link-{{docCategory}}">' +
     *                     '<span class="module_link-text">{{docTitle}}</span>' +
     *                     '{{#blank}}<span class="sr-only">(opens in new window)</span>{{/blank}}' +
     *                 '</a></div>' +
     *             '{{/docs}}' +
     *             '</div>' +
     *         '</div>'
     *     ),
     *     itemsComplete: function() {
     *         q4App.toggle( $('.module-financial-quarter .module_container--content'),'.module_item','h3','.module_links',false,false,true );
     *     }
     * });
     * </script>
     */
    $.widget('q4.indexFinancials', $.q4.indexApi, /** @lends q4.indexFinancials */ {
        options: {
            /**
             * A list of report subtypes to display, or an empty list to display all.
             * Valid values are:
             * <ul>
             *     <li>Annual Report</li>
             *     <li>Supplemental Report</li>
             *     <li>First Quarter</li>
             *     <li>Second Quarter</li>
             *     <li>Third Quarter</li>
             *     <li>Fourth Quarter</li>
             * </ul>
             * @type {Array<string>}
             * @default
             */
            reportTypes: [],
            /**
             * When an event has a related financial report, this option will allow you to define an alternative name for each report quarter.
             * This alternative name can be accessed by using <code>{{shortType}}</code> in the widget template.
             * @type {Object}
             * @default
             * {
             *     'Annual Report': 'AR',
             *     'Supplemental Report': 'SR',
             *     'First Quarter': 'Q1',
             *     'Second Quarter': 'Q2',
             *     'Third Quarter': 'Q3',
             *     'Fourth Quarter': 'Q4'
             * }
             */
            shortTypes: {
                'Annual Report': 'AR',
                'Supplemental Report': 'SR',
                'First Quarter': 'Q1',
                'Second Quarter': 'Q2',
                'Third Quarter': 'Q3',
                'Fourth Quarter': 'Q4'
            },
            /**
             * A list of document categories to display.
             * Use an empty list to display all.
             * @type {Array<string>}
             * @example ["Financial Report", "MD&A", "Earnings Press Release"]
             * @default
             */
            docCategories: [],
            /**
             * <ul>
             *   <li>All the notes documented in the <a href="q4.indexApi.html#option-template">q4.indexApi</a> parent widget are applicable here.</li>
             *   <li>This widget supports <code>template</code>, <code>itemTemplate</code> and <code>yearTemplate</code> options.</li>
             * </ul>
             *
             * The <code>template</code> or <code>itemTemplate</code> may contain the following mustache variables:
             * <ul>
             *   <li><code>{{title}}</code> - The title (i.e. report subtype and year) of the financial report.</li>
             *   <li><code>{{year}}</code> - The fiscal year of the financial report.</li>
             *   <li><code>{{date}}</code> - The filing date of the financial report.</li>
             *   <li><code>{{type}}</code> - The subtype of the report (e.g. First Quarter, Annual Report).</li>
             *   <li><code>{{shortType}}</code> - A shortened name for the financial report's subtype. These can be customized with the <code>shortTypes</code> option.</li>
             *   <li><code>{{coverUrl}}</code> - The URL of the document's thumbnail image.</li>
             *   <li><code>{{#docs}}</code> - An array of attached documents. Inner variables for each document are:
             *     <ul>
             *        <li><code>{{docTitle}}</code> - The title of the document</li>
             *        <li><code>{{docUrl}}</code> - The URL of the document</li>
             *        <li><code>{{docCategory}}</code> - The type/category of document (ex. Online, Proxy, Webcast)</li>
             *        <li><code>{{docType}}</code> - The file type for the document (ex. PDF). If online document category, value will be <code>null</code></li>
             *        <li><code>{{docSize}}</code> - The file size. If online document category, value will be <code>null</code></li>
             *        <li><code>{{docThumb}}</code> - The document thumbnail URL</li>
             *        <li><code>{{docIcon}}</code> - The document icon URL</li>
             *     </ul>
             *   </li>
             *   <li><code>{{#tags}}</code> - An array of tags for this financial report container.
             *     <ul>
             *        <li><code>{{.}}</code> -  Tag word</li>
             *     </ul>
             *   </li>
             * </ul>
             * @type {string}
             */
            template: ''
        },

        _sortItemsByType: function (items) {
            var o = this.options,
                types = [],
                itemsByType = {};

            // create an object of items sorted by type
            $.each(items, function (i, item) {
                if ($.inArray(item.type, types) == -1) {
                    // keep an array of types to preserve order
                    types.push(item.type);
                    itemsByType[item.type] = [];
                }
                $.each(item.docs, function (i, doc) {
                    itemsByType[item.type].push(doc);
                });
            });

            // return the types object
            return $.map(types, function (type, i) {
                return {
                    type: type,
                    shortType: o.shortTypes[type],
                    items: itemsByType[type]
                };
            });
        },

        _buildTemplateData: function (items) {
            var _ = this,
                tplData = this._super(items);

            // add types object to all items, and each year's items
            tplData.types = this._sortItemsByType(tplData.items);
            $.each(tplData.years, function (i, tplYear) {
                tplYear.types = _._sortItemsByType(tplYear.items);
            });

            return tplData;
        }
    });


    /* Presentation Widget */

    /**
     * @class q4.indexPresentations
     * @extends q4.indexApi
     * @desc
     * Fetches and displays presentations from the Q4 API's.<br>
     * <hr>
     * Below is an example of a presentation  widget.<br>
     * - It uses the <code>yearTrigger</code> and <code>yearTemplate</code> to render a tab-style list of years.<br>
     * - The year list will reload the <code>itemTemplate</code> when the user clicks one of the year tabs, and the widget will then only show items from the chosen year.<br>
     * <hr>
     * @example
     * <div class="presentation-widget">
     *   <div class="module_options module-presentations_year-list" tabindex="0" role="tab"></div>
     *   <div class="module_container module_container--content"></div>
     * </div>
     *
     * <script type="text/javascript">
     * $('.presentation-widget').presentations({
     *     usePublic: GetViewType() != "0",
     *     apiKey: Q4ApiKey, // replace with API key from Q4 Website if variable doesn't exist in global modules
     *     dateFormat: 'M dd yy',
     *     yearContainer: '.module-presentations_year-list',
     *     yearTemplate: '<a href="#{{value}}" data-year="{{value}}">{{year}}</a>',
     *     yearTrigger: '.module-presentations_year-list a',
     *     itemContainer: '.module_container--content',
     *     itemTemplate: (
     *       '<div class="module_item">' +
     *         '<div class="module_title">{{title}}</div>' +
     *         '<div class="module_date">{{date}}</div>' +
     *         '<a href="{{docUrl}}" target="_blank" class="module_link q4-icon--{{docType}}"> {{docType}}</a>' +
     *       '</div>'
     *     )
     * });
     * </script>
     */
    $.widget('q4.indexPresentations', $.q4.indexApi, /** @lends q4.indexPresentations */ {
        options: {
            /**
             * Toggle whether to fetch presentations dated in the future.
             * @type {boolean}
             * @default
             */
            showFuture: true,
            /**
             * Toggle whether to fetch presentations dated in the past.
             * @type {boolean}
             * @default
             */
            showPast: true,
            /**
             * <ul>
             *   <li>All the notes documented in the <a href="q4.indexApi.html#option-template">q4.indexApi</a> parent widget are applicable here.</li>
             *   <li>This widget supports <code>template</code>, <code>itemTemplate</code> and <code>yearTemplate</code> options.</li>
             *   <li>Note that this widget does not utilize a <code>{{#docs}}</code> array as there can only be 1 document per presentation item.</li>
             *   <li>Presentation 'speakers' are not currently supported by the API at this time.</li>
             * </ul>
             *
             * The <code>template</code> or <code>itemTemplate</code> may contain the following mustache variables:
             * <ul>
             *   <li><code>{{title}}</code> - The title of the presentation.</li>
             *   <li><code>{{url}}</code> - The fiscal year of the presentation.</li>
             *   <li><code>{{date}}</code> - The date object of the presentation.</li>
             *   <li><code>{{body}}</code> - The body text of the presentation item.</li>
             *   <li><code>{{thumb}}</code> - The presentation thumbnail URL</li>
             *   <li><code>{{docUrl}}</code> - The URL of the presentation file.</li>
             *   <li><code>{{docType}}</code> - The file type for the presentation file (ex. PDF).</li>
             *   <li><code>{{docSize}}</code> - The file size.</li>
             *   <li><code>{{audioUrl}}</code> - The URL of the audio presentation file.</li>
             *   <li><code>{{audioSize}}</code> - The size of the audio presentation file.</li>
             *   <li><code>{{audioType}}</code> - The file type of the audio presentation file.</li>
             *   <li><code>{{videoUrl}}</code> - The URL of the video presentation file.</li>
             *   <li><code>{{videoSize}}</code> - The size of the video presentation file.</li>
             *   <li><code>{{videoType}}</code> - The file type of the video presentation file.</li>
             *   <li><code>{{relatedUrl}}</code> - The URL of the file related to the presentation.</li>
             *   <li><code>{{relatedSize}}</code> - The size of the file related to the presentation.</li>
             *   <li><code>{{relatedType}}</code> - The file type of the file related to the presentation.</li>
             *   <li><code>{{#tags}}</code> - An array of tags for this presentation item.
             *     <ul>
             *       <li><code>{{.}}</code> -  Tag word</li>
             *     </ul>
             *   </li>
             * </ul>
             * @type {string}
             */
            template: ''
        }
    });


    /* Press Release Widget */

    /**
     * @class q4.indexNews
     * @extends q4.indexApi
     * @desc
     * Fetches and displays press releases from the Q4 private API.<br>
     * <hr>
     * Below is an example of a news widget with tag filtering.<br>
     * - It uses the <code>yearSelect</code> and <code>yearTemplate</code> to render a dropdown list of years.<br>
     * - This widget uses the <code>tagSelect</code> option to allow the user to filter the news releases based on tags. <br>
     * - Changing the tag with the dropdown will reset the year to the default, as the year list will reload to hide any years without that tag.<br>
     * <hr>
     * @example
     * <div class="module_container module_container--widget">
     *   <div class="module_options">
     *     <label class="module_options-label" for="newsYear">Select Year: </label>
     *     <select class="dropdown module_options-select module_options-year" id="newsYear"></select>
     *     <label class="module_options-label" for="newsCat">Category:</label>
     *     <select class="dropdown module_options-select news-tags" id="newsCat">
     *       <option selected="selected" value="">All Press Releases</option>
     *       <option value="earnings">Earnings</option>
     *       <option value="dividend">Dividend</option>
     *       <option value="other">Other</option>
     *     </select>
     *   </div>
     *   <div class="module_container module_container--content"></div>
     * </div>
     * <script>
     * $('.module-news-widget .module_container--widget').news({
     *   usePublic: GetViewType() != "0",
     *   apiKey: Q4ApiKey, // replace with API key from Q4 Website if variable doesn't exist in global modules
     *   tagSelect: '.news-tags',
     *   yearSelect: '.module_options-year',
     *   yearContainer: '.module_options-year',
     *   yearTemplate: '<option value="{{value}}">{{year}}</option>',
     *   itemContainer: '.module_container--content',
     *   itemTemplate: (
     *     '<div class="module_item">' +
     *       '<div class="module_item-wrap">' +
     *         '<div class="module_date-time">' +
     *           '<span class="module_date-text">{{date}}</span>' +
     *         '</div>' +
     *         '<div class="module_headline">' +
     *           '<a class="module_headline-link" href="{{url}}">{{title}}</a>' +
     *         '</div>' +
     *         '<div class="module_attachments attachments">' +
     *           '{{#attachments}}' +
     *             '<a class="attachments_item{{#type}} attachments_item--{{type}}{{/type}}" href="{{url}}">' +
     *             '<span class="attachments_title">{{category}}: {{title}}</span>' +
     *             '<span class="attachments_sizeType">{{#size}}({{size}} {{extension}}){{/size}}</span>' +
     *             '</a>' +
     *           '{{/attachments}} ' +
     *         '</div>' +
     *         '<div class="module_media-collection media-collection">' +
     *           '{{#media}}' +
     *               '<img class="media-collection_image" alt="{{alt}}" src="{{url}}" />' +
     *               '<span class="media-collection_info">{{alt}} ({{width}} x {{height}}) {{type}}</span>' +
     *           '{{/media}}' +
     *         '</div>' +
     *         '<div class="module_multimedia multimedia">' +
     *           '{{#multimedia}}' +
     *               '<img class="multimedia_image" alt="{{title}}" src="{{url}}" />' +
     *               '<span class="multimedia_info">({{width}} x {{height}}) {{type}}</span>' +
     *               '<div class="multimedia_sizes sizes">' +
     *                 '{{#sizes}}' +
     *                     '<img class="sizes_image" alt="{{title}} {{category}}" src="{{url}}" />' +
     *                     '<span class="sizes_info">({{width}} x {{height}})</span>' +
     *                 '{{/sizes}}' +
     *               '</div>' +
     *           '{{/multimedia}}' +
     *         '</div>' +
     *       '</div>' +
     *     '</div>'
     *   )
     * });
     * </script>
     */
    $.widget('q4.indexNews', $.q4.indexApi, /** @lends q4.indexNews */ {
        options: {
            /**
             * The ID of the Press releases category to fetch. Defaults to "Press Release (Default)" category. To use all categories, use: '00000000-0000-0000-0000-000000000000'.
             * To find the ID, navigate to Content > Press Release categories in the CMS. Click the edit icon next to the category, and now look at the URL of the page.
             * The press release category ID is the string of letters and numbers after the parameter "ItemID" in the URL.
             * @type {string}
             * @default
             */
            category: '1cb807d2-208f-4bc3-9133-6a9ad45ac3b0',
            /**
             * Whether to fetch the body of the press releases.
             * @type {boolean}
             * @default
             */
            loadBody: false,
            /**
             * Whether to fetch the shortened body of the press releases.
             * @type {boolean}
             * @default
             */
            loadShortBody: false,
            /**
             * <ul>
             *   <li>All the notes documented in the <a href="q4.indexApi.html#option-template">q4.indexApi</a> parent widget are applicable here.</li>
             *   <li>This widget supports <code>template</code>, <code>itemTemplate</code> and <code>yearTemplate</code> options.</li>
             * </ul>
             * The <code>template</code> or <code>itemTemplate</code> may contain the following mustache variables:
             * <ul>
             *   <li><code>{{title}}</code> - The title (i.e. report subtype and year) of the financial report.</li>
             *   <li><code>{{url}}</code> - The URL of the details page. Note that if URL override field is used in the CMS, this variable will changes to the URL override</li>
             *   <li><code>{{seoName}}</code> - The SEO name of the news item (ie. the unique part of the details URL)</li>
             *   <li><code>{{date}}</code> - The date of the news item.</li>
             *   <li><code>{{body}}</code> - The body content of the news item. Note this can be truncated with the widget option <code>bodyLength</code>. Utilizing 3 curly brackets will render the body content as HTML.</li>
             *   <li><code>{{shortBody}}</code> - The pre-defined short body content of the news item. Note this can be truncated further with the widget option <code>shortBodyLength</code></li>
             *   <li><code>{{thumb}}</code> - The thumbnail image. Will be automatically generated from a related file document. If no thumbnail exists, the widget will use the URL defined by the <code>defaultThumb</code> option.</li>
             *   <li><code>{{#docs}}</code> - The related document. Inner variables for each document are:
             *   <li><code>{{docUrl}}</code> - The URL of the document</li>
             *   <li><code>{{docType}}</code> - The file type for the document (ex. PDF). If online document category, value will be <code>null</code></li>
             *   <li><code>{{docSize}}</code> - The file size. If online document category, value will be <code>null</code></li>
             *   <li><code>{{#attachments}}</code> - An array of document attachment files.
             *     <ul>
             *       <li><code>{{type}}</code> - The upload type of the attachment item.</li>
             *       <li><code>{{extension}}</code> - The file extension of the attachment.</li>
             *       <li><code>{{size}}</code> - The file size of the attachment.</li>
             *       <li><code>{{title}}</code> - The title of the attachment.</li>
             *       <li><code>{{category}}</code> - The attachment category.</li>
             *       <li><code>{{url}}</code> - The url link of the attachment.</li>
             *     </ul>
             *   </li>
             *   <li><code>{{#tags}}</code> - An array of tags for this news item.
             *     <ul>
             *       <li><code>{{.}}</code> - Tag word</li>
             *     </ul>
             *   </li>
             *   <li><code>{{#media}}</code> - An array of media files found from within the news item body. For example, any images inside the press release content. Inner variables are:
             *     <ul>
             *       <li><code>{{url}}</code> - The URL of the media item.</li>
             *       <li><code>{{alt}}</code> - The alt text of the media item, if available.</li>
             *       <li><code>{{type}}</code> - The file type for the media item.</li>
             *       <li><code>{{height}}</code> - The height of the media item.</li>
             *       <li><code>{{width}}</code> - The width of the media item.</li>
             *     </ul>
             *   </li>
             *   <li><code>{{#multimedia}}</code> - An array of multimedia files populated automatically from Businesswire press releases or manually. Includes an array of different sizes (original, thumbnail, square, lowres)
             *     <ul>
             *       <li><code>{{active}}</code> - Flag if multimedia is active/inactive in the CMS.</li>
             *       <li><code>{{category}}</code> - The type of multimedia (i.e. image|video|external).</li>
             *       <li><code>{{fileSize}}</code> - The file size of the item in bytes.</li>
             *       <li><code>{{height}}</code> - The height of the item in pixels.</li>
             *       <li><code>{{id}}</code> - The ID of the item.</li>
             *       <li><code>{{#sizes}}</code> - The array of sizes of the item
             *         <ul>
             *           <li><code>{{category}}</code> - The type of multimedia size (i.e original|thumbnail|lowres|square).</li>
             *           <li><code>{{fileSize}}</code> - The file size of the item in bytes.</li>
             *           <li><code>{{height}}</code> - The height of the item in pixels.</li>
             *           <li><code>{{url}}</code> - The URL of the item.</li>
             *           <li><code>{{width}}</code> - The width of the item in pixels.</li>
             *         </ul>
             *       </li>
             *       <li><code>{{thumbnail}}</code> - The URL of the thumbnail.</li>
             *       <li><code>{{title}}</code> - The title of the item.</li>
             *       <li><code>{{type}}</code> - The file type of the item.</li>
             *       <li><code>{{url}}</code> - The URL of the item.</li>
             *       <li><code>{{width}}</code> - The width of the item in pixels.</li>
             *     </ul>
             * </ul>
             * @type {string}
             */
            template: ''
        }
    });


    /* SEC Filing Widget */

    /**
     * @class q4.indexSec
     * @extends q4.indexApi
     * @desc
     * Fetches and displays SEC filings from the Q4 private API.<br>
     * <hr>
     * Below is an example of an SEC widget with form type filtering.<br>
     * - It uses the <code>yearSelect</code> and <code>yearTemplate</code> to render a dropdown list of years.<br>
     * - This widget uses the <code>beforeRenderItems</code> callback to allow the user to redefine custom docTypes based on the filing docType. This is used to simplify icon styling.<br>
     * - This widget also uses the <code>complete</code> callback to trigger additional widget filtering options.<br>
     * - One can set a widget option, such as filtering by <code>filingTypes</code>, by defining the new option when the user changes the dropdown.<br>
     * - After setting new options, calling the <code>reloadItems</code> method will reload the content inside <code>itemContainer</code> based on the new widget options.<br>
     * <hr>
     * @example
     * <div class="module_options">
     *     <label class="module_options-label" for="SecYearSelect">Select year:</label>
     *     <select class="dropdown module_options-select module-sec_year-select" id="SecYearSelect"></select>
     *     <label class="module_options-label" for="SecFilingType">Filter filing type:</label>
     *     <select class="dropdown module_options-select module-sec_type-select" id="SecFilingType">
     *         <option selected="selected" value="">All Form Types</option>
     *         <option value="1,4">Annual Filings</option>
     *         <option value="2">Quarterly Filings</option>
     *         <option value="9,40">Current Reports</option>
     *         <option value="11,17">Proxy Filings</option>
     *         <option value="41">Registration Statements</option>
     *         <option value="13">Section 16 Filings</option>
     *         <option value="3,20,21,30,33,34,35,36,37,42">Other</option>
     *     </select>
     * </div>
     * <div class="module_header grid--no-gutter">
     *     <span class="module_header-text module-sec_date grid_col grid_col--2-of-12 grid_col--md-1-of-1">Date</span>
     *     <span class="module_header-text module-sec_filing grid_col grid_col--2-of-12 grid_col--md-1-of-1">Filing Type</span>
     *     <span class="module_header-text module-sec_description grid_col grid_col--5-of-12 grid_col--md-1-of-1">Filing Description</span>
     *     <span class="module_header-text module-sec_download-item grid_col grid_col--3-of-12 grid_col--md-1-of-1">Download / View</span>
     * </div>
     * <div class="module_container module_container--content grid--no-gutter grid--no-space"></div>
     *
     * <script>
     * $('.module-sec--widget .module_container--inner').sec({
     *     usePublic: GetViewType() != "0",
     *     apiKey: Q4ApiKey, // replace with API key from Q4 Website if variable doesn't exist in global modules
     *     exchange: 'CIK',
     *     symbol: '000000000', // replace with client's CIK number
     *     excludeNoDocuments: true,
     *     dateFormat: 'MM dd, yy',
     *     itemLoadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading items...</span></p>',
     *     itemNotFoundMessage: '<p><i class="q4-icon_warning-line"></i> There are no items matching your query.</p>',
     *     yearSelect: '.module-sec_year-select',
     *     yearContainer: '.module-sec_year-select',
     *     yearTemplate: '<option value="{{value}}">{{year}}</option>',
     *     itemContainer: '.module_container--content',
     *     itemTemplate: (
     *         '<div class="module_item">' +
     *             '<div class="module-sec_date grid_col grid_col--2-of-12 grid_col--md-1-of-1">' +
     *                 '<span class="module-sec_date-text">{{date}}</span>' +
     *             '</div>' +
     *             '<div class="module-sec_filing grid_col grid_col--2-of-12 grid_col--md-1-of-1">' +
     *                 '<span class="sr-only">Form</span>' +
     *                 '<a class="module-sec_filing-link" href="{{url}}">{{type}}</a>' +
     *             '</div>' +
     *             '<div class="module-sec_description grid_col grid_col--5-of-12 grid_col--md-1-of-1">' +
     *                 '<span class="module-sec_description-text">{{description}}</span>' +
     *             '</div>' +
     *             '<ul class="module-sec_download-list module_q4-icon-links grid_col grid_col--3-of-12 grid_col--md-1-of-1">' +
     *                 '{{#docs}}' +
     *                     '{{#docUrl}}<li class="module-sec_download-list-item module-sec_{{docType}}">' +
     *                         '<a class="module_link module_link-sec" href="{{docUrl}}" target="_blank">' +
     *                             '<span class="sr-only">{{docType}} Format Download (opens in new window)</span>' +
     *                         '</a>' +
     *                     '</li>{{/docUrl}}' +
     *                 '{{/docs}}' +
     *             '</ul>' +
     *         '</div>'
     *     ),
     *     itemLoadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading items...</span></p>',
     *     beforeRenderItems: function(event, data) {
     *         $.each(data.items, function(i, item) {
     *             $.each(item.docs, function(idx, doc) {
     *                 switch (doc.docType) {
     *                     case 'CONVPDF':
     *                         doc.docType = 'pdf'
     *                         break;
     *                     case 'RTF':
     *                     case 'CONVTEXT':
     *                         doc.docType = 'word'
     *                         break;
     *                     case 'XLS':
     *                         doc.docType = 'excel'
     *                         break;
     *                     case 'HTML':
     *                     case 'XBRL_HTML':
     *                         doc.docType = 'html'
     *                         break;
     *                     case 'XBRL':
     *                         doc.docType = 'zip'
     *                 }
     *             });
     *         });
     *     },
     *     complete: function(e) {
     *         var $widget = $(this);
     *         $widget.find('.module-sec_type-select').on('change', function() {
     *             var types = $(this).val().split(',');
     *             $widget.sec('option', 'filingTypes', types);
     *             $widget.sec('reloadItems');
     *         });
     *     }
     *
     * });
     * </script>
     */
    $.widget('q4.indexSec', $.q4.indexApi, /** @lends q4.indexSec */ {
        options: {
            /**
             * The exchange of the stock symbol to look up.
             * If you are looking up the company by CIK, enter 'CIK'.
             * @type {string}
             */
            exchange: '',
            /**
             * The stock symbol to look up.
             * If you are looking up the company by CIK, enter the CIK number here.
             * @type {string}
             */
            symbol: '',
            /**
             * An array of numeric filing types to filter by, or an empty list to skip filtering.
             * @type {Array<number>}
             */
            filingTypes: [],
            /**
             * An array of document types to sort their order.
             * @type {Array<string>}
             * @default
             */
            docOrder: ['CONVPDF', 'RTF', 'XLS', 'XBRL', 'XBRL_HTML', 'HTML', 'CONVTEXT', 'ORIG'],
            /**
             * Whether to exclude filings that have no associated documents.
             * @type {boolean}
             * @default
             */
            excludeNoDocuments: false,
            /**
             * Toggle whether to include html versions of files (if available from Edgar Online).
             * @type {boolean}
             * @default
             */
            includeHtmlDocument: false,
            /**
             * <ul>
             *   <li>All the notes documented in the <a href="q4.indexApi.html#option-template">q4.indexApi</a> parent widget are applicable here.</li>
             *   <li>This widget supports <code>template</code>, <code>itemTemplate</code> and <code>yearTemplate</code> options.</li>
             * </ul>
             *
             * The <code>template</code> or <code>itemTemplate</code> may contain the following mustache variables:
             * <ul>
             *   <li><code>{{description}}</code> - The title/filing description. This text can be truncated with the <code>titleLength</code> option.</li>
             *   <li><code>{{url}}</code> - The URL of the SEC filing details page.</li>
             *   <li><code>{{id}}</code> - The filing ID for the SEC filing</li>
             *   <li><code>{{date}}</code> - The date of the SEC filing item.</li>
             *   <li><code>{{year}}</code> - The year of the filing item (pulled from filing date).</li>
             *   <li><code>{{agent}}</code> - The name of the filing agent.</li>
             *   <li><code>{{person}}</code> - The name of the reporting agent.</li>
             *   <li><code>{{type}}</code> - The form type of the filing (Mnemonic)</li>
             *   <li><code>{{#docs}}</code> - An array of documents for the filing. Inner variables for each document are:
             *     <ul>
             *        <li><code>{{docUrl}}</code> - The URL of the document</li>
             *        <li><code>{{docType}}</code> - The file type for the document (ex. PDF). If online document category, value will be <code>null</code></li>
             *     </ul>
             *   </li>
             * </ul>
             * @type {string}
             */
            template: ''
        }
    });


    /* Index Event Widget */

    $.widget('q4.indexEvents', $.q4.indexApi, /** @lends q4.indexEvents */ {
        options: {
            showFuture: true,
            showPast: true,
            template: '',
            limit: 10,
            dateFormat: {
                date: 'dddd, MMMM D, YYYY',
                time: 'hh:mm A'
            },
            useMoment: true,
            itemContainer: '.timeline',
            itemTemplate: (
                // @formatter:off
                '{{{timeline}}}' +
                '<li class="treeline event_item event_item--{{year}} {{cls}}">' +
                    '<div class="timeline-item">' +
                        '<div class="irwBoxHeader irwEventBoxTrigger irwEventTrigger bg-default">' +
                            '<div class="row">' +
                                '<div class="col-xs-9">' +
                                    '<div class="text-muted irwDateEvent">' +
                                        '<span class="irwEnventDate">' +
                                            '<span class="irwStartDate">{{date.date}}</span>' +
                                            '<span>&nbsp;</span>{{date.time}} {{timeZone}}</span>' +
                                        '</span>' +
                                    '</div>' +
                                    '<div class="text-primary irwBoxLabel">' +
                                        '<h4>{{title}}</h4>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="pull-right col-xs-1 irwBoxTools">' +
                                    '<a href="javascript:;" class="showHistoric"><span class="fa fa-plus"></span></a>' +
                                '</div>' +
                            '</div>' +
                            '<div class="clearfix"></div>' +
                        '</div>' +
                        '<div class="irwBoxBody irwEventBody hidden">' +
                            '<div class="text-primary irwlblDetails">' +
                                '<h4>Event Details:</h4>' +
                            '</div>' +
                            '{{#multi}}' +
                                '<div class="irwEventDetails">' +
                                    '<div class="irwDetailTitle"><span></span>Period End:</div>' +
                                    '<div class="irwDetail">' +
                                        '{{endDate.date}}<span>&nbsp;</span>{{endDate.time}}<span>&nbsp;</span>{{timeZone}}' +
                                    '</div>' +
                                '</div>' +
                            '{{/multi}}' +
                            '{{^multi}}' +
                                '<div class="irwEventDetails">' +
                                    '<div class="irwDetailTitle">Conference Call Date:</div>' +
                                    '<div class="irwDetail">{{date.date}} {{date.time}} {{timeZone}}</div>' +
                                '</div>' +
                            '{{/multi}}' +
                            '{{#webcast}}' +
                                '<div class="irwEventDetails">' +
                                    '<div class="irwDetailTitle"><span class="fa fa-globe"></span>Webcast URL:</div>' +
                                    '<div class="irwDetail"><a target="_blank" href="{{webcast}}">{{webcast}}</a></div>' +
                                '</div>' +
                            '{{/webcast}}' +
                            '{{#location}}' +
                                '<div class="irwEventDetails">' +
                                    '<div class="irwDetailTitle"><span class="fa fa-location-arrow"></span>Location:</div>' +
                                    '<div class="irwDetail">' +
                                        '{{{location}}}' +
                                    '</div>' +
                                '</div>' +
                            '{{/location}}' +
                            '{{#body}}' +
                                '<div class="irwEventDetails">' +
                                    '<div class="irwDetailTitle"><span class="fa fa-location-arrow"></span>Additional Details:</div>' +
                                    '<div class="irwDetail">' +
                                        '{{{body}}}' +
                                    '</div>' +
                                '</div>' +
                            '{{/body}}' +
                            '<div class="clearfix"></div>' +
                        '</div>' +
                    '</div>' +
                '</li>'
                // @formatter:on
            ),
            indexBeforeRenderItems: function (e, tpl) {
                var inst = this;

                $.each(tpl.items, function (i, item) {
                    if (!i) {
                        inst.eventYear = item.year;
                    }

                    if (inst.eventYear !== item.year) {
                        inst.eventYear = item.year;
                        item.timeline = (
                            '<li class="treeround" data-items=".event_item--' + item.year + '">' +
                            '<i class="fa fa-dot-circle-o"></i>' +
                            '<span class="tree-primary" data-event="Past_' + item.year + '">' + item.year + '</span>' +
                            '</li>'
                        );
                    }

                    item.multi = item.date.date === item.endDate.date ? false : true;
                    item.cls = new Date().getFullYear() === item.year ? 'show' : 'hide';

                    $.each(item.financialReports, function (j, report) {
                        $.each(report.docs, function (k, doc) {
                            if (doc.docCategory == 'webcast' && doc.docUrl == item.webcast) {
                                doc.duplicateWebcast = true;
                            }
                        });
                    });
                });
            },
            indexItemsComplete: function (e) {
                $(e.target).find('.irwEventBoxTrigger').on('click', function () {
                    var $event = $(this).closest('.timeline-item');
                    $event.find('.irwEventBody').toggleClass('hidden').toggleClass('show');
                    $event.find('.irwBoxTools span').toggleClass('fa-minus fa-plus');
                });
            },
            indexBeforeRender: function (e, tpl) {
            },
            indexComplete: function (e) {
                $(e.target).find('.treeround').on('click', function (e) {
                    var items = $(this).data('items');
                    $(items).toggleClass('hide').toggleClass('show');
                });
            }
        }
    });
})(jQuery);