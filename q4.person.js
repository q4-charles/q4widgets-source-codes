(function($) {
    /**
     * Creates a list of people for a specific department. Pulls data from the Person List API.
     * @class q4.person
     * @version 1.0.8
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.person", /** @lends q4.person */ {
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
             * Set a specific department based off the DepartmentWorkflowId. 
             * @type {string}
             * @example '75a31b9d-5394-4e78-b5a7-7cd3c7bddffe'
             * @default
             */
            category: '00000000-0000-0000-0000-000000000000',
            /**
             * Filter results by tag. Pass an empty array for no filtering.
             * @type {array}
             * @default
             */
            tags: [],
            /**
             * <p>The itemTemplate template contains the content for each person in the API.</p>
             * <p><strong>Template includes</strong></p>
             * <ul>
             * <li>firstName (string) - First Name</li>
             * <li>middleName (string) - Middle name will contain a space before and after the name if it exists, otherwise a single space will be present.</li>
             * <li>lastName (string) - Last Name</li>
             * <li>bio (string) - Biography</li>
             * <li>url (string) - Person Details URL</li>
             * <li>photo (string) - Image URL</li>
             * <li>thumb (string) - Thumbnail URL</li>
             * <li>title (string) - Person Title</li>
             * <li>highlights (string) - Careers Highlights</li>
             * <li>id (string) - Workflow ID, can be used to build a custom person details page URL</li>
             * </ul>
             * <pre><code>Example: (
             * '{{#.}}' +
             * '&lt;div class="person-item">' +
             *     '&lt;div class="person-image">' +
             *         '&lt;img src="{{photo}} />' +
             *     '&lt;/div>' +
             *     '&lt;div class="person-name">' +
             *         '&lt;h4>{{firstName}}{{middleName}}{{lastName}}&lt;/h4>' +
             *     '&lt;/div>' +
             *     '&lt;div class="person-title">{{title}} - {{highlights}}&lt;/div>' +
             *     '&lt;div class="person-bio">{{{bio}}}&lt;/div>' +
             * '&lt;/div>' +
             * '{{/.}}'
             * )</code></pre>
             * @type {string}
             * @default
             * @type {string}
             */
            itemTemplate: (
                '{{#.}}' +
                    '<div class="person-item">' +
                        '<div class="person-image">' +
                            '<a href="{{photo}}" target="_blank"><img src="{{thumb}}" /></a>' +
                        '</div>' +
                        '<div class="person-name">' +
                            '<h4>{{firstName}}{{middleName}}{{lastName}}</h4>' +
                        '</div>' +
                        '<div class="person-title">{{title}} - {{highlights}}</div>' +
                        '<div class="person-bio">{{{bio}}}</div>' +
                    '</div>' +
                '{{/.}}'
            ),
            /**
             * <p>A callback that fires before the widget is rendered.</p>
             * @type {function}
             * @param personData {array} - An array of person data.
             */
            beforeRender: function(personData){},
            /**
             * <p>A callback that fires after the entire widget is rendered.</p>
             * @type {function}
             */
            complete: function(e){}
        },

        _create: function() {
            var inst = this;
            inst._getPersonList();
        },

        _buildParams: function () {
            var o = this.options,
                obj = o.usePublic ? {
                    apiKey: o.apiKey,
                    LanguageId: o.languageId ? o.languageId : GetLanguageId(),
                    StartIndex: 0,
                    IncludeTags: true,
                    TagList: this.options.tags.join('|')
                } : {
                    serviceDto: {
                        StartIndex: 0,
                        IncludeTags: true,
                        TagList: this.options.tags,
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: o.languageId ? o.languageId : GetLanguageId(),
                        Signature: GetSignature()
                    }
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

        _getPersonList: function(ticker){
            var inst = this,
                o = this.options,
                apiUrl = o.usePublic ? '/feed/People.svc/GetPeopleList' : '/Services/PeopleService.svc/GetPeopleList';

            inst._getData(apiUrl, 
                $.extend( inst._buildParams(), o.usePublic ? {
                    departmentId: inst.options.category
                } : {
                    departmentWorkflowId: inst.options.category
                })
            ).done(function ( peopleData ) {
                inst.element.html( inst._normalizeData( peopleData.GetPeopleListResult ) );
                inst._trigger('complete');
            });
        },

        _normalizeData: function( peopleData ) {
            
            var inst = this, o = inst.options;

            var peopleList = [];

            $.each(peopleData, function(i, person){
                var people = {
                    firstName: person.FirstName,
                    middleName: person.Suffix.length ? ' ' + person.Suffix + ' ' : ' ',
                    lastName: person.LastName,
                    bio: person.Description,
                    url: person.LinkToDetailPage,
                    photo: person.PhotoPath,
                    thumb: person.ThumbnailPath,
                    title: person.Title,
                    highlights: person.CareerHighlight,
                    id: person.WorkflowId,
                    tags: person.TagsList
                };
                peopleList.push( people );
            });

            if (inst.options.beforeRender !== undefined && typeof(inst.options.beforeRender) === 'function') {
                inst.options.beforeRender( peopleList );
            }

            return Mustache.render( o.itemTemplate, peopleList );
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);