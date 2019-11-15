(function($) {
    /**
     * <p>The Q4 Blog widget uses content from Press Releases and allows the user to easily filter content based on various options.</p>
     * <p>Blog Widget Features:</p>
     * <ul>
     *   <li><strong>Instant Search</strong> - Search terms found in the press release title or body will be returned (nearly) instantly - no page reload needed! Search results will only show content from the specified press release category. The search will also return partial matches.</li>
     *   <li><strong>Keywords</strong> - Also known as blog tags, the keywords feature is used for content tagging and 'buzzwords'. Typically, there are multiple keywords per blog post and new keywords are used very frequently. Keywords are added in the CMS as tags in each press release.</li>
     *   <li><strong>Categories</strong> - Similiar to keywords, categories are added in the CMS as tags in each press release. The categories feature is mainly used for overall blog organization. Unlike keywords, category tags should only be used once per blog post. Categories should be defined using the global categories array option so that the widget knows which press release tags are keywords and which are categories. Tags that are identified as categories will not appear in the keyword filter. An additional option unique to the categories feature is the "showAllCategories" option. When set to true, the widget will render all categories that are defined in the global categories option array - even if there are no press releases using that category. If set to false, the widget will only render categories that both exist as a press release tag and are listed in the global categories array option.</li>
     *   <li><strong>Archive</strong> - Archiving is a traditional blog structure. Using the archive feature will generate a list of Months (per year) which contain blog posts. For example, "January, 2017" or "March - 2017". Selecting one of these date periods will reload the widget to show blog posts from the selected month/year.</li>
     *   <li><strong>Years</strong> - The years feature will generate a list of years which contain blog posts, these can be selected to filter the content based on that year.</li>
     *   <li><strong>Pagination</strong> - The pagination feature will allow you to use pagination on first load. This option should be used in conjunction with the global option "items" to define how many items should be shown on a single page. Note that pagination is hidden after using any filtering (ex. search, keywords, categories, archive or years).</li>
     * </ul>
     * 
     * @class q4.blog
     * @version 1.0.7
     * @requires [Mustache.js](lib/mustache.min.js)
     *
     */
    $.widget("q4.blog", /** @lends q4.blog */ {
        options: {
            /**
             * The feed URL for the site. No setup is needed, simply use the client's q4web domain name after /news/.
             * @type {string}
             * @example https://q4modules.herokuapp.com/news/q4sandbox
             */
            url: '',
            /**
             * The user-friendly name of the custom press release category containing the blog posts.
             * @type {string}
             * @example pressReleaseCategoryName: 'Blog'
             * @default
             */
            pressReleaseCategoryName: 'Press%20Releases',
            /**
             * A list of tags to filter by. Use this option to load the blog with a preset tag filter.
             * @type {Array<string>}
             * @default
             */
            tag: [],
            /**
             * A list of predefined blog categories. Categories will not render in the category filter list unless they are defined here. Each category tag listed should match the format of how it is saved in the CMS.
             * @type {Array<string>}
             * @default
             * @example
             * categories: ['category-1', 'Category-2', 'category_3']
             */
            categories: [],
            /**
             * A tag used for another purpose outside of the blog widget, for example a list of featured blog posts in a slider on another page. The word used in this option will not be visible in the categories/keywords filters or within the main template.
             * @type {string}
             * @default
             * @example
             * featuredTag: 'homepage'
             */
            featuredTag: '',

            /**
             * <p>An object containing the parameters for our Press Release API.</p>
             * <p>Common options are:</p>
             * @param pressReleaseSelection {number} - Values are 0 = Future, 1 = Past, 2 = DateRange, 3 = ALL
             * @param pressReleaseBodyType {number} - Values are 0 = IncludeNoBody, 1 = IncludeShortAndFullBody, 2 = IncludeFullBody, 3 = IncludeShortBody
             * @param pressReleaseCategoryWorkflowId {number} - Specifies the workflow ID of the press release category you wish to use.
             * @param year {number} - Value of -1 will return all years.
             * @type {Object}
             * @default
             */
            params: {
                pressReleaseSelection: 3,
                pressReleaseBodyType: 0,
                pressReleaseCategoryWorkflowId: 'cb807d2-208f-4bc3-9133-6a9ad45ac3b0'
            },
            /**
             * A message to show when there are no items.
             * @type {string}
             * @default
             */
            noItems: '<p><i class="q4-icon_warning-line"></i> No blog items found.</p>',
            /**
             * A message to show when the widget is loading. This is also triggered when a new filter is selected.
             * @type {string}
             * @default
             */
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading ...</span></p>',
            /**
             * The number of blog posts per page. Used with the pagination feature.
             * @type {number}
             * @default
             */
            items: 10,
            /**
             * A CSS class to add to the widget while data is loading.
             * @type {string}
             * @default
             */
            loadingClass: null,
            /**
             * A string for first item class.
             * @type {string}
             * @default
             */
            firstPostClass: 'module_item--first',
            /**
             * Set the index to load the blog items from. This will allow you to skip a set number of blog posts before rendering the list. The start index is always 0 by default. For example, a featured post may be shown in a page header section, setting the start index to 1 would mean the list of blog posts starts at the second post - thus preventing a the first post from being duplicated (once in the header and again in the list). This index will reset if any filtering actions are taken.
             * @type {number}
             * @default
             */
            defaultStartIndex: null,
            /**
             * Set the number of characters to limit the short body.
             * @type {number}
             * @default
             */
            shortBodyLength: 500,
            /**
             * Set the number of characters to limit the body.
             * @type {number}
             * @default
             */
            bodyLength: 0,
            /**
             * A list months. This option can be used to overwrite the default month format for the Archive feature. Additionally, it can be used to overwrite the month language.
             * @type {Array<string>}
             * @default
             */
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            /**
             * Set the date format to use (datepicker)
             * @type {string}
             * @default
             */
            formatDate: 'MM d, yy',
            /**
             * Set the date region to use (datepicker). This is for multi-language support.
             * @type {string}
             * @default
             * @example dateRegion: "fr"
             */
            dateRegion: "",
            /**
             * A Mustache.js template for a single blog post.
             * <pre><code>'{{#.}}' +
             * '{{#.}}' +
             * '&lt;div class="module_item">' +
             *     '&lt;div class="module_thumbnail">' +
             *         '{{#thumb}}' +
             *             '&lt;img src="{{thumb}}" alt="{{title}}" />' +
             *         '{{/thumb}}' +
             *     '&lt;/div>' +
             *     '&lt;div class="module_item-content">' +
             *         '&lt;div class="module_headline">&lt;a class="module_headline-link" href="{{url}}">{{{title}}}&lt;/a>&lt;/div>' +
             *         '&lt;div class="module_date">{{date}}&lt;/div>' +
             *         '&lt;div class="module_body">{{shortBody}}&lt;/div>'+
             *         '&lt;div class="module_category">' +
             *             '{{#category}}'+
             *                 '&lt;span>{{modified}}&lt;/span>'+
             *             '{{/category}}' +
             *         '&lt;/div>'+
             *         '&lt;div class="keywords">' +
             *             '{{#keywords}}' +
             *                 '&lt;span>{{modified}}&lt;/span>' +
             *             '{{/keywords}}' +
             *         '&lt;/div>' +
             *     '&lt;/div>' +
             * '&lt;/div>' +
             * '{{/.}}'
             * '{{/.}}'</pre></code>
             * @type {string}
             */
            listTpl:(
                '{{#.}}' +
                '<div class="module_item">' +
                    '<div class="module_thumbnail">' +
                        '{{#thumb}}' +
                            '<img src="{{thumb}}" alt="{{title}}" />' +
                        '{{/thumb}}' +
                    '</div>' +
                    '<div class="module_item-content">' +
                        '<div class="module_headline"><a class="module_headline-link" href="{{url}}">{{{title}}}</a></div>' +
                        '<div class="module_date">{{date}}</div>' +
                        '<div class="module_body">{{shortBody}}</div>'+
                        '<div class="module_category">' +
                            '{{#category}}'+
                                '<span>{{modified}}</span>'+
                            '{{/category}}' +
                        '</div>'+
                        '<div class="keywords">' +
                            '{{#keywords}}' +
                                '<span>{{modified}}</span>' +
                            '{{/keywords}}' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '{{/.}}'
            ),
            /**
             * Options for the search feature.
             * @type {Array.<Object>}
             * @param enable {boolean} - Enable or disable the feature. Default is: true.
             * @param url  {string} - Overwrite the URL used to get search results data. Example: '?category=Blog&body=0&callback=?&search='
             * @param selector {string} - The CSS selector for the search results input container. Default is: '.blog-search'.
             * @param onSearch  {function} - A callback that fires after the full widget has loaded for the first time.
             * <pre><code>search:{
             *   enable: true,
             *   url: '',
             *   selector: '.module-blog_search',
             *   onSearch: function(inst){
             *      var o = inst.options;
             *      $(this.selector).find('span').on('click', function(e){
             *          var $search = $(this).closest(o.search.selector),
             *          text = $search.find('input:text').val();
             *          if(text.length) {
             *              inst.getSearchResults(text);
             *              $(o.pagination.selector).hide();
             *              location.hash = 'search';
             *              return false;
             *          }
             *          e.preventDefault();
             *      });
             *      
             *      $(this.selector).find('input').on('keypress', function(e){
             *          var text = $(this).val(),
             *          $search = $(this).closest(o.search.selector);
             *          if(e.which == 13) {
             *              e.preventDefault();
             *          }
             *          if(e.which == 13 && text.length) {
             *              $search.find('span').trigger('click');
             *          }
             *      });
             *   }
             * }</code></pre>
             */
            search:{
                /**
                 * Enable or disable the search feature.
                 * @type {boolean}
                 * @default
                 */
                enable: true,
                /**
                 * Overwrite the URL to use for search results data.
                 * @type {string}
                 * @default
                 * @example url: '?category=Blog&body=0&callback=?&search='
                 */
                url: '',
                /**
                 * The CSS selector for the search results input container.
                 * @type {string}
                 * @default
                 * @example
                 * <div class="module-blog_search">
                 *   <input class="module-blog_search-input" type="search" placeholder="Search" name="blogsearch" maxlength="64" autocomplete="off">
                 *   <span class="module-blog_search-button">Go</span>
                 * </div>
                 */
                selector: '.module-blog_search',
                /**
                 * A callback that fires after the full widget has loaded for the first time.
                 * @type {function}
                 * @param {Object} [inst] The widget instance.
                 */
                onSearch: function(inst){
                    var o = inst.options;
                    $(this.selector).find('span').on('click', function(e){
                        var $search = $(this).closest(o.search.selector),
                        text = $search.find('input:text').val();
                        if(text.length) {
                            inst.getSearchResults(text);
                            $(o.pagination.selector).hide();
                            location.hash = 'search';
                            return false;
                        }
                        e.preventDefault();
                    });

                    $(this.selector).find('input').on('keypress', function(e){
                        var text = $(this).val(),
                        $search = $(this).closest(o.search.selector);
                        if(e.which == 13) {
                            e.preventDefault();
                        }
                        if(e.which == 13 && text.length) {
                            $search.find('span').trigger('click');
                        }
                    });
                },
                /**
                 * A callback that fires each time the search results are loaded.
                 * @type {function}
                 * @param {Event}  [inst] The widget instance.
                 * @param {Object} [blogList] The blog post items that were rendered.
                 */
                onSearchComplete: function(inst){}
            },
            /**
             * Options for the keywords feature.
             * @type {Array.<Object>}
             * @param enable {boolean} - Enable or disable the feature. Default is: true.
             * @param url  {string} - Overwrite the URL used to get the list of tags. Example: '/tags?category=Blog'
             * @param selector {string} - The CSS selector for the container. Default is: '.blog-keywords ul'.
             * @param tpl {string} - A Mustache.js template for the keyword items. This will render inside the selector.
             * @param onItemComplete  {function} - A callback that fires after the feature has rendered for the first time.
             * <pre><code>keywordList: {
             *   enable: true,
             *   url: '',
             *   selector: '.module-blog_keywords ul',
             *   tpl:(
             *     '&lt;li data-tag="all">All&lt;/li>' +
             *     '{{#.}}' +
             *       '&lt;li data-tag="{{id}}">{{name}}&lt;/li>' +
             *     '{{/.}}'
             *   ),
             *   onItemComplete: function(inst){
             *     var o = inst.options;
             *     $(this.selector).on('click', 'li', function(){
             *       location.hash = '';
             *       inst.onPageLoad();
             *       o.defaultStartIndex = null;
             *       if ($(this).data('tag') != "all"){
             *         inst.getBlogList({
             *           year: -1,
             *           TagList: [$(this).data('tag')],
             *           ItemCount: -1
             *         });
             *         $(o.pagination.selector).hide();
             *       } else {
             *         inst.getBlogList({
             *             year: -1
             *         });
             *         $(o.pagination.selector).show();
             *       }
             *     });
             *   }
             * }</code></pre>
             */
            keywordList: {
                /**
                 * Enable or disable the keywords feature.
                 * @type {boolean}
                 * @default
                 */
                enable: true,
                /**
                 * Overwrite the URL used to generate keywords data.
                 * @type {string}
                 * @default
                 * @example url: '/tags?category=Blog'
                 */
                url: '',
                /**
                 * The CSS selector for the keywords container.
                 * @type {string}
                 * @default
                 * @example
                 * <div class="blog-keywords">
                 *   <label>Filter by Keyword</label>
                 *   <ul></ul>
                 * </div>
                 */
                selector: '.module-blog_keywords ul',
                 /**
                 * A Mustache.js template for the keywords list.
                 * This will be rendered in the keywords selector.
                 * @type {string}
                 * @example
                 *  '<li data-tag="all">All</li>' +
                 *  '{{#.}}' +
                 *    '<li data-tag="{{id}}">{{name}} ({{total}})</li>' +
                 *  '{{/.}}'
                 */
                tpl:(
                    '<li data-tag="all">All</li>' +
                    '{{#.}}' +
                      '<li data-tag="{{id}}">{{name}}</li>' +
                    '{{/.}}'
                ),
                /**
                 * A callback that fires after the keywordList has rendered for the first time.
                 * @type {function}
                 * @param {Object} [inst] The widget instance.
                 */
                onItemComplete: function(inst){
                    var o = inst.options;
                    $(this.selector).on('click', 'li', function(){
                        location.hash = '';
                        inst.onPageLoad();
                        o.defaultStartIndex = null;
                        if ($(this).data('tag') != "all"){
                            inst.getBlogList({
                                year: -1,
                                TagList: [$(this).data('tag')],
                                ItemCount: -1
                            });
                            $(o.pagination.selector).hide();
                        } else {
                            inst.getBlogList({
                                year: -1
                            });
                            $(o.pagination.selector).show();
                        }
                    });
                }
            },
            /**
             * Options for the categories feature.
             * @type {Array.<Object>}
             * @param enable {boolean} - Enable or disable the feature. Default is: true.
             * @param showAllCategories {boolean} - Force the widget to render all categories listed in the category option, even if they do not exist on any press releases. Default is: false.
             * @param url  {string} - Overwrite the URL used to get the list of tags. Example: '/tags?category=Blog'
             * @param selector {string} - The CSS selector for the container. Default is: '.blog-categories ul'.
             * @param tpl {string} - A Mustache.js template for the category items. This will render inside the selector.
             * @param onItemComplete  {function} - A callback that fires after the feature has rendered for the first time.
             * <pre><code>categoryList: {
             *   enable: false,
             *   url: '',
             *   showAllCategories: false,
             *   selector: '.module-blog_categories ul',
             *   tpl:(
             *     '&lt;li data-tag="all">All&lt;/li>' +
             *     '{{#.}}' +
             *       '&lt;li data-tag="{{id}}">{{name}}&lt;/li>' +
             *     '{{/.}}'
             *   ),
             *   onItemComplete: function(inst){
             *     var o = inst.options;
             *     $(this.selector).on('click', 'li', function(){
             *       location.hash = '';
             *       inst.onPageLoad();
             *       o.defaultStartIndex = null;
             *       if ($(this).data('tag') != "all"){
             *         inst.getBlogList({
             *           year: -1,
             *           TagList: [$(this).data('tag')],
             *           ItemCount: -1
             *         });
             *         $(o.pagination.selector).hide();
             *       } else {
             *         inst.getBlogList({
             *             year: -1
             *         });
             *         $(o.pagination.selector).show();
             *       }
             *     });
             *   }
             * }</code></pre>
             */
            categoryList: {
                /**
                 * Enable or disable the feature.
                 * @type {boolean}
                 * @default
                 */
                enable: true,
                /**
                 * Overwrite the URL used to generate categories data.
                 * @type {string}
                 * @default
                 * @example url: '/tags?category=Blog'
                 */
                url: '',
                /**
                 * Force the widget to render all categories listed in the category option, even if they do not exist on any press releases.
                 * @type {boolean}
                 * @default
                 */
                showAllCategories: false,
                /**
                 * The CSS selector for the category container.
                 * @type {string}
                 * @default
                 * @example
                 * <div class="module-blog_categories">
                 *   <label>Filter by Category</label>
                 *   <ul></ul>
                 * </div>
                 */
                selector: '.module-blog_categories ul',
                /**
                 * A Mustache.js template for the category list.
                 * This will be rendered in the category selector.
                 * @type {string}
                 * @example
                 *  '<li data-tag="all">All</li>' +
                 *  '{{#.}}' +
                 *    '<li data-tag="{{id}}">{{name}} ({{total}})</li>' +
                 *  '{{/.}}'
                 */
                tpl:(
                    '<li data-tag="all">All</li>' +
                    '{{#.}}' +
                      '<li data-tag="{{id}}">{{name}}</li>' +
                    '{{/.}}'
                ),
                /**
                 * A callback that fires after the categoryList has rendered for the first time.
                 * @type {function}
                 * @param {Object} [inst] The widget instance.
                 */
                onItemComplete: function(inst){
                    var o = inst.options;
                    $(this.selector).on('click', 'li', function(){
                        location.hash = '';
                        inst.onPageLoad();
                        o.defaultStartIndex = null;
                        if ($(this).data('tag') != "all"){
                            inst.getBlogList({
                                year: -1,
                                TagList: [$(this).data('tag')],
                                ItemCount: -1
                            });
                            $(o.pagination.selector).hide();
                        } else {
                            inst.getBlogList({
                                year: -1
                            });
                            $(o.pagination.selector).show();
                        }
                    });

                }
            },
            /**
             * Options for the archive feature.
             * @type {Array.<Object>}
             * @param enable {boolean} - Enable or disable the feature. Default is: true.
             * @param url  {string} - Overwrite the URL used to get the list of months/years. Example: '/archive?category=Blog'
             * @param selector {string} - The CSS selector for the container. Default is: '.blog-archive ul'.
             * @param tpl {string} - A Mustache.js template for the archive items. This will render inside the selector.
             * @param onItemComplete  {function} - A callback that fires after the feature has rendered for the first time.
             * <pre><code>archiveList:{
             *   enable: true,
             *   url: '',
             *   selector: '.module-blog_archive ul',
             *   tpl:(
             *       '&lt;li data-tag="all">All&lt;/li>' +
             *       '{{#.}}' +
             *         '&lt;li data-start="{{start}}" data-end="{{end}}" data-tag="{{month}}-{{year}}">' +
             *           '&lt;span>{{month}} {{year}} ({{total}})&lt;/span>' +
             *         '&lt;/li>' +
             *       '{{/.}}'
             *   ),
             *   onItemComplete: function(inst){
             *     var o = inst.options;
             *     $(this.selector).on('click', 'li', function(){
             *       location.hash = '';
             *       inst.onPageLoad();
             *       o.defaultStartIndex = null;
             *       if ($(this).data('tag') != "all"){
             *           inst.getBlogList({
             *             year: -1,
             *             pressReleaseSelection: 2,
             *             startDate: '/Date(' + $(this).data('start') + ')/',
             *             endDate: '/Date(' + $(this).data('end') + ')/',
             *             ItemCount: -1
             *           }, 0, -1);
             *           $(o.pagination.selector).hide();
             *       } else {
             *         inst.getBlogList({
             *             year: -1
             *         });
             *         $(o.pagination.selector).show();
             *       }
             *     });
             *   }
             * }</code></pre>
             */
            archiveList:{
                /**
                 * Enable or disable the feature.
                 * @type {boolean}
                 * @default
                 */
                enable: true,
                /**
                 * Overwrite the URL used to generate archive information.
                 * @type {string}
                 * @default
                 * @example url: '/archive?category=Blog'
                 */
                url: '',
                /**
                 * The CSS selector for the archive container.
                 * @type {string}
                 * @default
                 * @example
                 * <div class="module-blog_archive">
                 *   <label>Filter by Archive</label>
                 *   <ul></ul>
                 * </div>
                 */
                selector: '.module-blog_archive ul',
                /**
                 * A Mustache.js template for the archive list.
                 * This will be rendered in the archive selector.
                 * @type {string}
                 * @example
                 *  '<li data-tag="all">All</li>' +
                 *  '{{#.}}' +
                 *    '<li data-start="{{start}}" data-end="{{end}}" data-tag="{{month}}-{{year}}">' +
                 *      '<span>{{month}} {{year}} ({{total}})</span>' +
                 *    '</li>' +
                 *  '{{/.}}'
                 */
                tpl:(
                    '<li data-tag="all">All</li>' +
                    '{{#.}}' +
                      '<li data-start="{{start}}" data-end="{{end}}" data-tag="{{month}}-{{year}}">' +
                        '<span>{{month}} {{year}} ({{total}})</span>' +
                      '</li>' +
                    '{{/.}}'
                ),
                /**
                 * A callback that fires after the archiveList has rendered for the first time.
                 * @type {function}
                 * @param {Object} [inst] The widget instance.
                 */
                onItemComplete: function(inst){
                    var o = inst.options;
                    $(this.selector).on('click', 'li', function(){
                        location.hash = '';
                        inst.onPageLoad();
                        o.defaultStartIndex = null;
                        if ($(this).data('tag') != "all"){
                            inst.getBlogList({
                                year: -1,
                                pressReleaseSelection: 2,
                                startDate: '/Date(' + $(this).data('start') + ')/',
                                endDate: '/Date(' + $(this).data('end') + ')/',
                                ItemCount: -1
                            }, 0, -1);
                            $(o.pagination.selector).hide();
                        } else {
                            inst.getBlogList({
                                year: -1
                            });
                            $(o.pagination.selector).show();
                        }
                    });
                }
            },
            /**
             * Options for the year list feature.
             * @type {Array.<Object>}
             * @param enable {boolean} - Enable or disable the feature. Default is: true.
             * @param selector {string} - The CSS selector for the container. Default is: '.blog-years ul'.
             * @param tpl {string} - A Mustache.js template for the year items. This will render inside the selector.
             * @param onItemComplete  {function} - A callback that fires after the feature has rendered for the first time.
             * <pre><code>yearList:{
             *   enable: true,
             *   selector: '.module-blog_years ul',
             *   tpl:(
             *     '{{#GetPressReleaseYearListResult}}' +
             *         '&lt;li>{{.}}&lt;/li>' +
             *     '{{/GetPressReleaseYearListResult}}'
             *   ),
             *   onItemComplete: function(inst){
             *     var o = inst.options;
             *     $(this.selector).on('click', 'li', function(){
             *       inst.onPageLoad();
             *       o.defaultStartIndex = null;
             *       inst.getBlogList({
             *         pressReleaseSelection: 3,
             *         year: $(this).text()
             *       }, 0, -1);
             *       $(o.pagination.selector).hide();
             *     });
             *   }
             * }</code></pre>
             */
            yearList:{
                /**
                 * Enable or disable the feature.
                 * @type {boolean}
                 * @default
                 */
                enable: true,
                /**
                 * The CSS selector for the year list container.
                 * @type {string}
                 * @default
                 * @example
                 * <div class="module-blog_years">
                 *   <label>Filter by Year</label>
                 *   <ul></ul>
                 * </div>
                 */
                selector: '.module-blog_years ul',
                /**
                 * A Mustache.js template for the archive list.
                 * This will be rendered in the archive selector.
                 * @type {string}
                 * @example
                 *  '<li data-tag="all">All</li>' +
                 *  '{{#GetPressReleaseYearListResult}}' +
                 *    '<li>{{.}}</li>' +
                 *  '{{/GetPressReleaseYearListResult}}'
                 */
                tpl:(
                    '{{#GetPressReleaseYearListResult}}' +
                        '<li>{{.}}</li>' +
                    '{{/GetPressReleaseYearListResult}}'
                ),
                /**
                 * A callback that fires after the yearList has rendered for the first time.
                 * @type {function}
                 * @param {Object} [inst] The widget instance.
                 */
                onItemComplete: function(inst){
                    var o = inst.options;
                    $(this.selector).on('click', 'li', function(){
                        inst.onPageLoad();
                        o.defaultStartIndex = null;
                        inst.getBlogList({
                            pressReleaseSelection: 3,
                            year: $(this).text()
                        }, 0, -1);
                        $(o.pagination.selector).hide();
                    });
                }
            },
            /**
             * Options for the pagination feature.
             * @type {Array.<Object>}
             * @param enable {boolean} - Enable or disable the feature. Default is: true.
             * @param selector {string} - The CSS selector for the container. Default is: '.blog-years ul'.
             * @param tpl {string} - A Mustache.js template for the pagination. This will render inside the selector.
             * <pre><code>pagination: {
             *   enable: true,
             *   selector: '.module-blog_pagination',
             *   tpl: (
             *     '&lt;div class="showing">Showing &lt;span>{{perPer}}&lt;/span> of {{total}} Posts&lt;/div>' +
             *     '&lt;span class="prev disabled">&lt; Previous&lt;/span>' +
             *     '&lt;div class="numbers">' +
             *         '&lt;ul>' +
             *             '{{#pageArr}}&lt;li>{{.}}&lt;/li>{{/pageArr}}' +
             *         '&lt;/ul>' +
             *     '&lt;/div>' +
             *     '&lt;span class="next">Next &gt;&lt;/span>'
             *   )
             * }</code></pre>
             */
            pagination: {
                /**
                 * Enable or disable the feature.
                 * @type {boolean}
                 * @default
                 */
                enable: true,
                /**
                 * The CSS selector for the pagination container.
                 * @type {string}
                 * @default
                 * @example
                 * '<div class="module-blog_pagination"></div>'
                 */
                selector: '.module-blog_pagination',
                /**
                 * A Mustache.js template for the archive list.
                 * This will be rendered in the archive selector.
                 * @type {string}
                 * @example
                 * '<div class="module-blog_pagination module_pager">' +
                 *  '<div class="module_pager-showing">Showing <span>{{perPer}}</span> of {{total}} Posts</div>' +
                 *  '<span class="module_pager-prev disabled">&lt; Previous</span>' +
                 *  '<div class="module_pager-numbers">' +
                 *      '<ul>' +
                 *          '{{#pageArr}}<li>{{.}}</li>{{/pageArr}}' +
                 *      '</ul>' +
                 *  '</div>' +
                 *  '<span class="next">Next &gt;</span>' +
                 * '</div>'
                 */
                tpl: (
                    '<div class="module_pager-showing">Showing <span>{{perPer}}</span> of {{total}} Posts</div>' +
                    '<span class="module_pager-prev js--disabled">&lt; Previous</span>' +
                    '<div class="module_pager-numbers">' +
                        '<ul>' +
                            '{{#pageArr}}<li>{{.}}</li>{{/pageArr}}' +
                        '</ul>' +
                    '</div>' +
                    '<span class="module_pager-next">Next &gt;</span>'
                )
            },
            /**
             * A callback that fires when after the blog list has rendered for the first time.
             * @type {function}
             * @param {Event}  [inst] The widget instance.
             * @param {Object} [items] The blog post items that were rendered.
             */
            onFirstLoad: function(inst, items){},
            /**
             * A callback that fires each time the blog list is loaded.
             * @type {function}
             * @param {Event}  [inst] The widget instance.
             * @param {Object} [blogList] The blog post items that were rendered.
             */
            onListComplete: function(inst, blogList){inst.element.removeClass(inst.options.loadingClass);},
            /**
             * A callback that fires when the blog is first created, before anything has been rendered.
             * @type {function}
             * @param {Event}  [inst] The widget instance.
             */
            onBlogCreate: function(inst){}
        },

        firstLoad: true,

        _create: function() {
            var inst = this, 
                o = inst.options,
                hash = location.hash
                startTag = [],
                year = '',
                archiveStart = '',
                archiveEnd = '';

            inst.onPageLoad();

            // Parse Keywords
            if (o.keywordList.enable) {
                o.keywordList.url = o.keywordList.url == '' ? '/tags?category=' + o.pressReleaseCategoryName : o.keywordList.url;
                inst.keywordParse(o.keywordList);
                if (hash.length) {
                    if (hash.toLowerCase().indexOf("tag") >= 0){
                        o.defaultStartIndex = null;
                        startTag = [location.hash.replace('#tag=', '')];
                        o.pagination.enable = false;
                    }
                }
            }

            // Parse Categories
            if (o.categoryList.enable) {
                o.categoryList.url = o.categoryList.url == '' ? '/tags?category=' + o.pressReleaseCategoryName : o.categoryList.url;
                inst.categoryParse(o.categoryList);
                if (hash.length) {
                    if (hash.toLowerCase().indexOf("category") >= 0){
                        o.defaultStartIndex = null;
                        startTag = [location.hash.replace('#category=', '')];
                        o.pagination.enable = false;
                    }
                }
            }

            // Parse Archive
            if (o.archiveList.enable) {
                o.archiveList.url = o.archiveList.url == '' ? '/archive?category=' + o.pressReleaseCategoryName : o.archiveList.url;
                inst.archiveParse(o.archiveList);
                if (hash.length) {
                    if (hash.toLowerCase().indexOf("archive") >= 0){
                        startTag = [];
                        hash = location.hash.replace('#archive=', '');
                        archiveStart = hash.split('-')[0];
                        archiveEnd = hash.split('-')[1];
                        o.defaultStartIndex = null;
                        o.params.pressReleaseSelection = 2;
                        o.params.startDate = '/Date(' + archiveStart + ')/';
                        o.params.endDate = '/Date(' + archiveEnd + ')/';
                        o.params.ItemCount = -1;
                        o.pagination.enable = false;
                    }
                }
            }

            // Parse Year List
            if (o.yearList.enable) {
                inst.yearParse(o.yearList);
                if (hash.length) {
                    if (hash.toLowerCase().indexOf("year") >= 0){
                        startTag = [];
                        year = location.hash.replace('#year=', '');
                        o.defaultStartIndex = null;
                        o.params.pressReleaseSelection = 3;
                        o.params.year = year;
                        o.pagination.enable = false;
                    }
                }
            }

            // Search
            if (o.search.enable) {
                o.search.url = o.search.url == '' ? '?category=' + o.pressReleaseCategoryName + '&body=0&callback=?&search=' : o.search.url;
            }

            inst.options.tag = startTag;

            if (o.pagination.enable) {
                inst.getBlogCount(inst.options.tag);
                inst.onPageClick();
            } else {
                inst.getBlogList({
                    TagList: inst.options.tag
                });
                
            }

            inst.options.onBlogCreate(inst);
        },

        onPageLoad: function(){
            var inst = this, o = inst.options;
            inst.element.html(o.loadingMessage);
            inst.element.addClass(o.loadingClass);
        },

        _buildParams: function (idx, items) {
            var inst = this,
                startAtIndex = inst.options.defaultStartIndex,
                startIdx = idx === undefined ? 0 : idx * inst.options.items;
            return {
                serviceDto: {
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
                    StartIndex: startAtIndex === null ? startIdx : startAtIndex,
                    RevisionNumber: GetRevisionNumber(), 
                    LanguageId: GetLanguageId(),
                    Signature: GetSignature(),
                    ItemCount: items === undefined ? inst.options.items : items,
                    IncludeTags: true,
                    TagList: []
                }
            };
        },

        _getData: function (url, params, type) {
            return $.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify(params),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            });
        },

        _truncate: function (text, length) {
            if (!text) return '';
            return !length || text.length <= length ? text : text.substring(0, length) + '...';
        },

        getSearchResults: function(term){
            var inst = this;
            $.ajax({
                type: 'GET',
                url: inst.options.url + inst.options.search.url + encodeURI(term),
                contentType: 'application/json; charset=utf-8',
                dataType: 'jsonp',
                success: function(searchItems){
                    var blogItems = [];

                    $.datepicker.setDefaults( $.datepicker.regional[ '"'+ inst.options.dateRegion +'"' ] );
                    $.each(searchItems.items, function(i, item){
                        var d = item.Q4Dto.PressReleaseDate.split('T')[0].split('-'); 

                        blogItems.push({
                            thumb: item.Q4Dto.ThumbnailPath,
                            media: $.map(item.Q4Dto.MediaCollection, function (m) {
                                return {
                                    alt: m.Alt,
                                    url: m.SourceUrl,
                                    height: m.Height,
                                    width: m.Width
                                };
                            }),
                            keywords: inst.replaceTags(item.Q4Dto.TagsList),
                            category: inst.categoryTags(item.Q4Dto.TagsList),
                            shortBody: item.Q4Dto.ShortBody == null ? '' : inst._truncate(item.Q4Dto.ShortBody, inst.options.shortBodyLength),
                            fullBody: inst._truncate(item.Q4Dto.Body, inst.options.bodyLength),
                            date: $.datepicker.formatDate( inst.options.formatDate, new Date( Date.UTC(d[0],d[1]-1,d[2]) ) ),
                            url: item.Q4Dto.LinkToDetailPage,
                            title: item.Q4Dto.Headline,
                            seoName: item.Q4Dto.SeoName,
                            doc: item.Q4Dto.DocumentPath,
                            eurl: encodeURI(item.Q4Dto.LinkToDetailPage),
                            eTitle: encodeURI(item.Q4Dto.Headline),
                            attachments: $.map(item.Q4Dto.Attachments, function(a) {
                                return {
                                  type: a.DocumentType,
                                  extension: a.Extension,
                                  size: a.Size,
                                  title: a.Title,
                                  category: a.Type,
                                  url: encodeURI(a.Url),
                                };
                            })
                        });
                    });

                    if (blogItems.length) {
                        inst.element.html( Mustache.render( inst.options.listTpl, blogItems ) );
                    } else {
                        inst.element.html( inst.options.noItems );
                    }
                    inst.options.search.onSearchComplete(inst, blogItems);
                }
            });
        },

        keywordParse: function(item){
            var inst = this, o = inst.options;

            $.ajax({
                type: 'GET',
                url: inst.options.url + item.url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'jsonp'
            }).done(function(data){
                var $selector = $(item.selector),
                    keywords = [];

                $.each(data, function(i, item){

                    //do not include tags that are categories or the featured tag
                    if( (inst.categoryTags(item) == false) && (item._id !== o.featuredTag) ) { 
                        keywords.push({
                            id: item._id,
                            name: item._id.replace(/-/g,' ').replace(/_/g,'-'),
                            total: item.total
                        }); 
                    }
                });

                $selector.append( Mustache.render( item.tpl, keywords ) )

                if (item.onItemComplete !== undefined && typeof(item.onItemComplete) === 'function') {
                    item.onItemComplete(inst);
                }
            });
        },

        categoryParse: function(item){
            var inst = this, o = inst.options;

            $.ajax({
                type: 'GET',
                url: inst.options.url + item.url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'jsonp'
            }).done(function(data){
                var $selector = $(item.selector),
                    onlyCategories = [],
                    allCategories = [];

                $.each(data, function(i, item){
                    if(inst.categoryTags(item).length) {
                        onlyCategories.push({
                            id: item._id,
                            name: item._id.replace(/-/g,' ').replace(/_/g,'-'),
                            total: item.total
                        });
                    }
                });
                $.each(o.categories, function(i, item){
                    allCategories.push({
                        id: item,
                        name: item.replace(/-/g,' ').replace(/_/g,'-'),
                        total: item.total
                    });
                });

                if (o.categoryList.showAllCategories) {
                    $selector.append( Mustache.render( item.tpl, allCategories ) )  
                } else {
                    $selector.append( Mustache.render( item.tpl, onlyCategories ) )
                }

                if (item.onItemComplete !== undefined && typeof(item.onItemComplete) === 'function') {
                    item.onItemComplete(inst);
                }
            });
        },

        archiveParse: function(item){
            var inst = this;

            $.ajax({
                type: 'GET',
                url: inst.options.url + item.url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'jsonp'
            }).done(function(data){
                var $selector = $(item.selector),
                    archive = [];

                $.each(data, function(i, item){
                    archive.push({
                        month: inst.options.months[parseInt(item._id.month) - 1],
                        year: item._id.year,
                        start: Date.UTC(item._id.year, item._id.month-1, 1, 0, 0, 0 ),
                        end: Date.UTC(item._id.year, item._id.month-1, 31, 23, 59 ,59 ),
                        total: item.total
                    });
                });

                $selector.append( Mustache.render( item.tpl, archive ) )

                if (item.onItemComplete !== undefined && typeof(item.onItemComplete) === 'function') {
                    item.onItemComplete(inst);
                }
            });
        },

        yearParse: function(item){
            var inst = this;

            inst._getData('/Services/PressReleaseService.svc/GetPressReleaseYearList', 
                $.extend( inst._buildParams(), 
                    inst.options.params
                )
            ).done(function (years) {
                var $selector = $(item.selector);

                $selector.append( Mustache.render( item.tpl, years ) )

                if (item.onItemComplete !== undefined && typeof(item.onItemComplete) === 'function') {
                    item.onItemComplete(inst);
                }
            });
        },
        
        getBlogCount: function(tag){
            var inst = this, o = inst.options;

            tag === undefined ? [] : tag;

            inst._getData('/Services/PressReleaseService.svc/GetPressReleaseListCount', 
                $.extend( inst._buildParams(), 
                    inst.options.params
                )
            ).done(function (itemCount) {
                inst.count = itemCount.GetPressReleaseListCountResult;
                inst.buildPagination();
                inst.getBlogList({
                    TagList: tag
                });

            });
        },

        buildPagination: function(){
            var $pagination = $(this.options.pagination.selector);
            
            $pagination.html('');

            if (this.count > this.options.items){
                var pages = this.count / this.options.items,
                    pageObj = {
                        total: this.count,
                        perPer: this.options.items,
                        pageArr: []
                    }

                for ( i = 1; i < pages+1; i++ ) { 
                    pageObj.pageArr.push(i);
                }

                $pagination.html( Mustache.render( this.options.pagination.tpl, pageObj ) ).find('li:first').addClass('js--selected');
            }
        },

        onPageClick: function(){
            var inst = this,
                $pagination = $(this.options.pagination.selector);

            $pagination.on('click', 'li', function(){
                inst.onPageLoad();
                var showing = ( inst.options.items ) * ( parseInt( $(this).text() ) );
                $pagination.find('li').removeClass('js--selected');
                $pagination.find('span').removeClass('js--disabled');
                $pagination.find('.module_pager-showing > span').html(showing > inst.count ? inst.count : showing);
                $(this).addClass('js--selected');

                
                inst.getBlogList({}, parseInt($(this).text()) - 1 );

                if ( $(this).index() === 0 ) {
                    $pagination.find('.module_pager-prev').addClass('js--disabled')
                } else if ( $(this).index() + 1 == $pagination.find('li').length ){
                    $pagination.find('.module_pager-next').addClass('js--disabled');
                }

                window.scroll(0, 0);
            });

            $pagination.on('click', 'span', function(){
                var pages = $pagination.find('li');

                if (!$(this).hasClass('js--disabled')){ 
                    if ( $(this).hasClass('module_pager-prev') ) {
                        pages.filter('.js--selected').prev().trigger('click');
                    } else if ( $(this).hasClass('module_pager-next') ) {
                        pages.filter('.js--selected').next().trigger('click');
                    }
                }
            });
        },

        getBlogList: function(o, page, items){
            var inst = this;
            inst.params = $.extend( inst._buildParams(page, items), inst.options.params);

            /*if (page !== undefined){
                inst.params.serviceDto.StartIndex = page * inst.options.items;
            }*/
            if (o !== undefined) {
                if (o.TagList !== undefined) {
                    inst.params.serviceDto.TagList = o.TagList;
                    delete o.TagList;
                }
                if (o.ItemCount !== undefined) {
                    inst.params.serviceDto.ItemCount = o.ItemCount;
                    delete o.ItemCount;
                }
                inst.params = $.extend (inst.params, o);
            }

            inst._getData( '/Services/PressReleaseService.svc/GetPressReleaseList', inst.params ).done(function (blogList) {
                var blogItems = [];
                $.datepicker.setDefaults( $.datepicker.regional[ '"'+ inst.options.dateRegion +'"' ] );
                $.each(blogList.GetPressReleaseListResult, function(i, item){
                    blogItems.push({
                        thumb: item.ThumbnailPath,
                        media: $.map(item.MediaCollection, function (m) {
                            return {
                                alt: m.Alt,
                                url: m.SourceUrl,
                                height: m.Height,
                                width: m.Width
                            };
                        }),
                        keywords: inst.replaceTags(item.TagsList),
                        category: inst.categoryTags(item.TagsList),
                        shortBody: item.ShortBody == null ? '' : inst._truncate(item.ShortBody, inst.options.shortBodyLength),
                        fullBody: inst._truncate(item.Body, inst.options.bodyLength),
                        date: $.datepicker.formatDate(inst.options.formatDate, new Date(item.PressReleaseDate)),
                        url: item.LinkToDetailPage,
                        shortUrl: encodeURI(item.LinkToDetailPage),
                        title: item.Headline,
                        doc: item.DocumentPath,
                        eurl: encodeURI(item.LinkToDetailPage),
                        eTitle: encodeURI(item.Headline),
                        firstPostClass: i == 0 ? inst.options.firstPostClass : null
                    });
                });

                if (inst.firstLoad){
                    inst.firstLoad = false;
                    inst.options.onFirstLoad(inst, blogItems);
                    inst.options.search.onSearch(inst);
                }

                inst.element.html( Mustache.render( inst.options.listTpl, blogItems ) );
                inst.options.onListComplete(inst, blogItems);
                
            });
        },
        categoryTags: function(tags) {
            var inst = this,
                o = inst.options,
                category = [];

            $.each(tags, function(i, tag){
                if ($.inArray(tag, o.categories) != -1){
                    category.push({original:tag, modified:tag.replace(/-/g,' ').replace(/_/g,'-')});
                }
            });

            return category;
        },
        replaceTags: function(data) {
            var inst = this,
                o = inst.options,
                tags = [];

            $.each(data, function(i, tag){
                if ( ($.inArray(tag, o.categories) <= -1) && (tag !== o.featuredTag) ){
                    tags.push({original:tag, modified:tag.replace(/-/g,' ').replace(/_/g,'-')});
                }
            });

            return tags;
        },
        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);