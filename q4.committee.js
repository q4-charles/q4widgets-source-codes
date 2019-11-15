(function($) {
    /**
     * Creates a responsive Committee Composition tables based of the Person List API.
     * @class q4.committee
     * @version 1.2.2
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.committee", /** @lends q4.committee */ {
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
             * Enable responsive mode for the table
             * @default
             */
            responsive: true,
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
            defaultTag: ['committee'],
            /**
             * Static HTML to identify a custom roles.
             * An example of this could be an independent committee member.
             * This is currently set as part inside the @itemTpl and @mobileItemTpl
             * Icons will exist as part of the `customRoles` array.
             * <pre><code>customRoles: {
             *      independent: ' <i class="q4i-icon-independant"></i>',
             *      expert: ' <i class="q4i-icon-apple"></i>'
             * }</code></pre>
             * @type {object}
             * @default
             */
            customRoles: {
                independent: '<i class=\"q4-icon_briefcase-line\"></i>',
                expert: '<i class=\"q4-icon_star-fill\"></i>'
            },
            /**
             * The data source for the composition table.
             * <pre><code>committeeTypes: [{
             *     name: 'Audit',
             *     tags: ['audit-chair', 'audit-member'],
             *     icons: ['q4i-icon-member chair', 'q4i-icon-member'],
             *     doc: {
             *         title: "Charter Document",
             *         url: "/charter-sample.pdf"
             *     }
             * }, {
             *     name: 'Compensation',
             *     tags: ['compensation-chair', 'compensation-member'],
             *     icons: ['q4i-icon-member chair', 'q4i-icon-member'],
             *     doc: {
             *         title: "Charter Document",
             *         url: "/charter-sample.pdf"
             *     }
             * },{
             *     name: 'Executive',
             *     tags: ['executive-chair', 'executive-member'],
             *     icons: ['q4i-icon-member chair', 'q4i-icon-member'],
             *     doc: {
             *         title: "Charter Document",
             *         url: "/charter-sample.pdf"
             *     }
             * }]</code></pre>
             * @param name {string} - The committee name.
             * @param tags  {array} - All tags associated with the committee.
             * @param icons {array} - Icons that correspond with the specified tag.
             * @param docs {object} - Document associated with the committee
             * @type {Array.<Object>}
             */
            committeeTypes: [{
                name: 'Audit',
                tags: ['audit-chair', 'audit-member'],
                icons: ['q4-icon_user-fill color--brand', 'q4-icon_user-fill'],
                doc: null
            }, {
                name: 'Compensation',
                tags: ['compensation-chair', 'compensation-member'],
                icons: ['q4-icon_user-fill color--brand', 'q4-icon_user-fill'],
                doc: null
            }, {
                name: 'Executive',
                tags: ['executive-chair', 'executive-member'],
                icons: ['q4-icon_user-fill color--brand', 'q4-icon_user-fill'],
                doc: null
            }],
            /**
             * <p>The "master" template to be appended onto the page.</p>
             * <p><strong>Template includes</strong></p>
             * <ul>
             * <li>header (html) - <strong>@headerTpl</strong></li>
             * <li>members (html) - <strong>@itemTpl</strong></li>
             * <li>mobile (html) - <strong>@mobileWrapperTpl</strong></li>
             * <li>legend (html) - <strong>@legendTpl</strong></li>
             * </ul>
             * <pre><code>Example: (
             *     '&lt;div class="desktop"&gt;' + 
             *         '{{{header}}}' +
             *         '{{{members}}}' +
             *     '&lt;/div&gt;' +
             *     '&lt;div class="mobile"&gt;' +
             *         '{{{mobile}}}' +
             *     '&lt;/div&gt;' +
             *     '{{{legend}}}'
             * )</code></pre>
             * @type {string}
             */
            template: (
                '<div class="module_container--desktop">' + 
                    '{{{header}}}' +
                    '{{{members}}}' +
                '</div>' +
                '<div class="module_container--tablet">' +
                    '{{{mobile}}}' +
                '</div>' +
                '{{{legend}}}'
            ),
            /**
             * <p>Template used to generate the header</p>
             * <p><strong>Template includes</strong></p>
             * <ul>
             * <li>name (string) - <strong>@committeeTypes.name</strong></li>
             * <li>members (object) - Members belonging to each committee. <strong>@itemTpl.members</strong>
             * </ul>
             * <pre><code>Example: (
             *    '&lt;div class="person-header grid-no-gutter"&gt;' +
             *        '&lt;div class="col col-1-of-{{columns}}"&gt;&lt;/div&gt;' +
             *        '{{#.}}' +
             *            '&lt;div class="col col-1-of-{{columns}}"&gt;{{name}}&lt;/div&gt;' +
             *        '{{/.}}' +
             *    '&lt;/div&gt;'
             *)</code></pre>
             * @type {string}
             */
            headerTpl: (
                '<div class="module_header grid-no-gutter">' +
                    '<div class="module_header-text grid_col grid_col--1-of-{{columns}}"></div>' +
                    '{{#types}}' +
                        '<div class="module_header-text module-committee_{{name}} grid_col grid_col--1-of-{{columns}}">{{name}}</div>' +
                    '{{/types}}' +
                '</div>'
            ),
            /**
             * <p>The itemTpl template contains data from the API plus some additional data generated from @committeeTypes</p>
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
             * <li>committees (array) - Committees the person it belongs to. <strong>@committeeTypes</strong>
             * <li>customRoles (array) <small>*Optional</small> - Allows you to include additional tags which will be linked with the corresponding icon which is set under `customRoles`.
             * </ul>
             * <pre><code>Example: (
             *     '{{#members}}' +
             *         '&lt;div class="person-item"&gt;' +
             *             '&lt;div class="grid-no-gutter"&gt;' +
             *                 '&lt;div class="col col-1-of-{{columns}}"&gt;' +
             *                     '&lt;a href="{{url}}"&gt;{{firstName}}{{middleName}}{{lastName}}&lt;/a&gt;' +
             *                     '{{#customRoles}}{{{.}}}{{/customRoles}}' +
             *                 '&lt;/div&gt;' +
             *                 '{{{composition}}}' +
             *             '&lt;/div&gt;' +
             *             '&lt;div class="person-bio"&gt;' +
             *                 '{{{bio}}}' +
             *             '&lt;/div&gt;' +
             *         '&lt;/div&gt;' +
             *     '{{/members}}'
             * )</code></pre>
             * @type {string}
             * @default
             * @type {string}
             */
            itemTpl: (
                '<div class="module_item-container">' +
                    '{{#members}}' +
                        '<div class="module_item">' +
                            '<div class="grid-no-gutter">' +
                                '<div class="grid_col grid_col--1-of-{{columns}}">' +
                                    '<a class="module-committee_link" href="{{url}}">{{firstName}}{{middleName}}{{lastName}}</a>' +
                                    '{{#customRoles}}<span class="module-committee_custom-role">{{{.}}}</span>{{/customRoles}}' +
                                '</div>' +
                                '{{{composition}}}' +
                            '</div>' +
                            '<div class="module-committee_bio">' +
                                '{{{bio}}}' +
                            '</div>' +
                        '</div>' +
                    '{{/members}}' +
                '</div>'
            ),
            /**
             * <p>A wrapper for each committee type.</p>
             * <ul>
             * <li>icon (html) - Returns the correct icon based on the <strong>@iconTpl</strong></li>
             * </ul> 
             * <pre><code>Example: (
             *     '&lt;div class="col col-1-of-{{columns}}"&gt;' +
             *       '{{{icon}}}' +
             *     '&lt;/div&gt;'
             * )</code></pre>
             * @default
             * @type {string}
             */
            committeeTpl: (
                '<div class="grid_col grid_col--1-of-{{columns}}">' +
                    '{{{icon}}}' +
                '</div>'
            ),
            /**
             * <p>Static HTML Legend. Can be used in the @template to display additional HTML.</p>
             * <ul>
             * <li>icon (string|html) contains <strong>@iconTpl</strong></li>
             * </ul>
             * <pre><code>Example: (
             *    '&lt;div class="person-legend"&gt;' +
             *        '&lt;span class="icon-legend"&gt;&lt;i class="q4i-circle-chair"&gt;&lt;/i&gt; Chair&lt;/span&gt;' +
             *        '&lt;span class="icon-legend"&gt;&lt;i class="q4i-icon-member"&gt;&lt;/i&gt; Member&lt;/span&gt;' +
             *        '&lt;span class="icon-legend"&gt;&lt;i class="q4i-icon-independant"&gt;&lt;/i&gt; Independent Director&lt;/span&gt;' +
             *    '&lt;/div&gt;'
             * )</code></pre>
            * <p><strong>Template includes</strong></p>
             * @default
             * @type {string}
             */
            legendTpl: (
                '<ul class="module-committee_legend-container">' +
                    '<li class="module-committee_legend"><i class="q4-icon_user-fill color--brand"></i> Chair</li>' +
                    '<li class="module-committee_legend"><i class="q4-icon_user-fill"></i> Member</li>' +
                    '<li class="module-committee_legend"><i class="q4-icon_star-fill"></i> Expert</li>' +
                '</ul>'
            ),
            /**
             * <p>Template used to generate icons and rendered as part of @committeeTpl & @mobileItemTpl.</p>
             * <ul>
             * <li>cls (string|html) - Retrieved from <strong>@committeeTypes.icons</strong></li>
             * </ul>
             * <pre><code>Example: (
             *    '&lt;i class="{{cls}}"&gt;&lt;/i&gt;'
             * )</code></pre>
             * @default
             * @type {string}
             */
            iconTpl: (
                '<i class="{{cls}}"></i><span class="sr-only">{{{name}}}<span>'
            ),
            /**
             * <p>Mobile wrapper.</p>
             * <p><strong>Template includes</strong></p>
             * <ul>
             * <li>header (html) - <strong>@mobileHeaderTpl</strong> </li>
             * <li>items (html) - <strong>@mobileItemTpl</strong></li>
             * </ui>
             * <pre><code>Example: (
             *    '&lt;div class="person-category"&gt;' +
             *        '{{{header}}}' +
             *        '&lt;div class="person-items"&gt;' +
             *            '{{{items}}}' +
             *        '&lt;/div&gt;' +
             *    '&lt;/div&gt;'
             * )</code></pre>
             * @default
             * @type {string}
             */
            mobileWrapperTpl: (
                '<div class="module-committee_category">' +
                    '{{{header}}}' +
                    '<div class="module_items-container">' +
                        '{{{items}}}' +
                    '</div>' +
                '</div>'
            ),
            /**
             * <p>Generates a header for each committee</p>
             * <ul>
             * <li>name (string) - Committee name as described in <strong>@committeeTypes.names</strong></li>
             * </ul>
             * <pre><code>Example: (
             *    '&lt;div class="person-header grid-no-gutter"&gt;' +
             *        '&lt;div class="col col-3-of-4 col-sm-3-of-4">{{name}}&lt;/div&gt;' +
             *        '&lt;div class="col col-1-of-4 col-sm-1-of-4">&lt;i class="q4i-rounded-downchevon">&lt;/i>&lt;/div&gt;' +
             *    '&lt;/div&gt;'
             * )</code></pre>
             * @default
             * @type {function}
             */
            mobileHeaderTpl: (
                '<div class="module_header grid-no-gutter">' +
                    '<div class="grid_col grid_col--3-of-4 grid_col--sm-3-of-4">{{name}}</div>' +
                    '<div class="grid_col grid_col--1-of-4 grid_col--sm-1-of-4"><i class="q4-icon_chevron-right"></i></div>' +
                '</div>'
            ),
            /**
             * <p>Generates the mobile template for each committee member. Refer to <strong>@itemTpl</strong> for template options.</p>
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
             * <li>customRoles (array) <small>*Optional</small> - Allows you to include additional tags which will render the corresponding html
             * </ul>
             * <pre><code>Example: (
             *    '&lt;div class="person-item"&gt;' +
             *        '&lt;div class="grid-no-gutter"&gt;' +
             *            '&lt;div class="person-name col col-3-of-4 col-sm-3-of-4"&gt;' +
             *                '&lt;a class="person-link" href="{{url}}">{{firstName}}{{middleName}}{{lastName}}&lt;/a&gt;' +
             *                '{{#customRoles}}{{{.}}}{{/customRoles}}' +
             *            '&lt;/div&gt;' +
             *            '&lt;div class="person-icon col col-1-of-4 col-sm-1-of-4">{{{icon}}}&lt;/div&gt;' +
             *        '&lt;/div&gt;' +
             *    '&lt;/div&gt;'
             * )</code></pre>
             * @default
             * @type {function}
             */
            mobileItemTpl: (
                '<div class="module_item">' +
                    '<div class="grid-no-gutter">' +
                        '<div class="module-committee_name grid_col grid_col--3-of-4 grid_col--sm-3-of-4">' +
                            '<a class="module-committee_link" href="{{url}}">{{firstName}}{{middleName}}{{lastName}}</a>' +
                            '{{#customRoles}}<span class="module-committee_custom-role">{{{.}}}</span>{{/customRoles}}' +
                        '</div>' +
                        '<div class="module-committee_icon grid_col grid_col--1-of-4 grid_col--sm-1-of-4">{{{icon}}}</div>' +
                    '</div>' +
                '</div>'
            ),
            /**
             * <p>Generates an alternate template for mobile html. When used ignores mobileWrapperTpl, mobileHeaderTpl, and mobileItemTpl</p>
             * <p><strong>Template includes</strong></p>
             * <ul>
             * <li>committees (array). List of committees including members <strong>@headerTpl.types</strong></li>
             * <li>members (array). List of people including committees it belongs to. <strong>@itemTpl.members</strong></li>
             * </ul>
             * <pre><code>Example: (
             *'&lt;div id="irwCommitteeMobTab" class="tabbable irwShow"&gt;' +
             *  '&lt;ul id="irwTabsEvent" class="nav nav-tabs"&gt;' +
             *    '&lt;li class="active"&gt;&lt;a href="#ByCommittee"&gt;By Committee&lt;/a&gt;&lt;/li&gt;' +
             *    '&lt;li&gt;&lt;a href="#ByMember"&gt;By Member&lt;/a&gt;&lt;/li&gt;' +
             *  '&lt;/ul&gt;' +
             *'&lt;/div&gt;' +
             *'&lt;div id="ByMember" class="Committeetab"&gt;' +
             *  '{{#members}}' +
             *    '&lt;div class="irwTriggerModal text-primary"&gt;' +
             *      '&lt;div class="irwMemberName footable-visible footable-last-column footable-first-column"&gt;' +
             *        '&lt;span class="footable-toggle"&gt;&lt;/span&gt;{{firstName}}{{middleName}}{{lastName}}' +
             *      '&lt;/div&gt;' +
             *      '&lt;div class="footable-row-detail" style="display:none;"&gt;' +
             *        '&lt;div class="footable-row-detail-cell"&gt;' +
             *          '&lt;div class="footable-row-detail-inner"&gt;' +
             *            '{{#committees}}' +
             *            '&lt;div class="footable-row-detail-row"&gt;' +
             *              '&lt;div class="footable-row-detail-name"&gt;{{name}} :&lt;/div&gt;' +
             *              '&lt;div class="footable-row-detail-value text-muted"&gt;&lt;span class="faBox"&gt;&lt;i class="{{icon}}"&gt;&lt;/i&gt;&lt;/span&gt;&lt;/div&gt;' +
             *            '&lt;/div&gt;' +
             *            '{{/committees}}' +
             *          '&lt;/div&gt;' +
             *        '&lt;/div&gt;' +
             *      '&lt;/div&gt;' +
             *    '&lt;/div&gt;' +
             *  '{{/members}}' +
             *'&lt;/div&gt;' +
             *'&lt;div id="ByCommittee" class="Committeetab" style="display:none;"&gt;' +
             *  '{{#committees}}' +
             *    '&lt;div class="irwTriggerModal text-primary"&gt;' +
             *      '&lt;div class="irwMemberName footable-visible footable-last-column footable-first-column"&gt;' +
             *        '&lt;span class="footable-toggle"&gt;&lt;/span&gt;{{name}}' +
             *      '&lt;/div&gt;' +
             *      '&lt;div class="footable-row-detail" style="display:none;"&gt;' +
             *        '&lt;div class="footable-row-detail-cell"&gt;' +
             *          '&lt;div class="footable-row-detail-inner"&gt;' +
             *            '{{#members}}' +
             *            '&lt;div class="footable-row-detail-row"&gt;' +
             *              '&lt;div class="footable-row-detail-name"&gt;&lt;a href="/governance/board-of-directors/default.aspx"&gt;{{firstName}}{{middleName}}{{lastName}}&lt;/a&gt; :&lt;/div&gt;' +
             *              '&lt;div class="footable-row-detail-value text-muted"&gt;&lt;span class="faBox"&gt;&lt;i class="{{icon}}"&gt;&lt;/i&gt;&lt;/span&gt;&lt;/div&gt;' +
             *            '&lt;/div&gt;' +
             *            '{{/members}}' +
             *          '&lt;/div&gt;' +
             *        '&lt;/div&gt;' +
             *      '&lt;/div&gt;' +
             *    '&lt;/div&gt;' +
             *  '{{/committees}}' +
             *'&lt;/div&gt;'
             * )</code></pre>
             * @default
             * @type {function}
             */
            mobileTplAlt: null,
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
             * <p>A callback that fires before the widget is rendered.</p>
             * @type {function}
             * @param personData {array} - An array of person data.
             */
            beforeRender: function(personData){},
            /**
             * <p>A callback that fires before the mobile alternate template is rendered.</p>
             * @type {function}
             * @param mobileData {object} - Object of commmittees (array) and members (array) .
             */
            beforeRenderMobileAlt: function(mobileData){},
            /**
             * <p>A callback that fires after the entire widget is rendered.</p>
             * @type {function}
             */
            onComplete: function(){}
        },

        _create: function() {
            var inst = this;

            inst.element.addClass(inst.options.loadingClass).html(inst.options.loadingMessage);
            inst.columns = inst.options.committeeTypes.length + 1
            inst._getPersonList();
        },

        _buildParams: function () {
            var o = this.options,
                obj = o.usePublic ? {
                    apiKey: o.apiKey,
                    StartIndex: 0,
                    IncludeTags: true,
                    TagList: this.options.defaultTag.join('|')
                } : {
                    serviceDto: {
                        StartIndex: 0,
                        IncludeTags: true,
                        TagList: this.options.defaultTag,
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
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
            ).done(function ( committeeData ) {
                inst.element.html( inst._normalizeData( committeeData.GetPeopleListResult ) ).removeClass(o.loadingClass);
                inst._trigger('onComplete');
            });
        },

        _normalizeData: function( committeeData ) {
            
            var inst = this, o = inst.options,
                membersByCommittee = {},
                committee = {
                    header: '',
                    members: [],
                    legend: inst.options.legendTpl
                };

            $.each(o.committeeTypes, function(i, type){
                membersByCommittee[type.name] = [];
            });

            $.each(committeeData, function(i, person){
                var committeeMember = {
                    index: i,
                    firstName: person.FirstName,
                    middleName: person.Suffix.length ? ' ' + person.Suffix + ' ' : ' ',
                    lastName: person.LastName,
                    bio: person.Description,
                    url: person.LinkToDetailPage,
                    photo: person.PhotoPath,
                    thumb: person.ThumbnailPath,
                    title: person.Title,
                    highlights: person.CareerHighlight,
                    customRoles: [],
                    committees: []
                };

                $.each(person.TagsList, function(i, committeeTags){
                    if ( o.customRoles[committeeTags] !== undefined ) {
                        committeeMember.customRoles.push(o.customRoles[committeeTags]);
                    } else {
                        committeeMember[committeeTags] = true;

                        var committeeTypeIndex = o.committeeTypes.findIndex(function(x) {
                            return $.inArray(committeeTags, x.tags) > -1
                        });

                        if (committeeTypeIndex > -1) {
                            var committee = o.committeeTypes[committeeTypeIndex];
                            var icon = committee.icons[$.inArray(committeeTags, committee.tags)];

                            committeeMember.committees.push({
                                name: committee.name,
                                position: committeeTypeIndex,
                                tags: committeeTags,
                                icon: icon
                            });
                        };
                    }

                    if (o.responsive) { 
                        // Build a type array which will include each committee a member belongs to
                        $.each(o.committeeTypes, function(i, type){
                            if ( $.inArray(committeeTags, type.tags) > -1 ){
                                membersByCommittee[type.name].push(committeeMember);
                            }
                        });
                    }
                });

                committeeMember.composition = inst._buildCommittee( committeeMember, o.committeeTypes );
                committee.members.push( committeeMember );
            });

            $.each(o.committeeTypes, function(i, type) {
                var members = [];

                type.index = i;

                $.each(membersByCommittee[type.name], function(j, member) {
                    $.each(type.tags, function(k, tag) {
                       if (member[tag]) {
                           var m = {
                              index: member.index,
                              firstName: member.firstName,
                              middleName: member.middleName,
                              lastName: member.lastName,
                              url: member.url,
                              photo: member.photo,
                              thumb: member.thumb,
                              title: member.title,
                              highlights: member.highlights,
                              customRoles: member.customRoles,
                              icon: type.icons[k],
                              membership: tag
                            };

                            members.push(m);
                       }
                    });
                });
                type.members = members;

            });

            if (o.responsive) {
                committee.mobile = inst._buildMobileCommittee(committee.members, membersByCommittee, o.committeeTypes);
            }

            if (inst.options.beforeRender !== undefined && typeof(inst.options.beforeRender) === 'function') {
                inst.options.beforeRender( committee.members );
            }

            committee.header = Mustache.render( inst.options.headerTpl, {
                columns: inst.columns,
                types:inst.options.committeeTypes
            });

            committee.members = Mustache.render( inst.options.itemTpl, {
                columns: inst.columns,
                members: committee.members 
            });

            return Mustache.render( o.template, committee );
        },

        _buildMobileCommittee: function(members, membersByCommittee, committeeTypes) {
            var inst = this, o = this.options,
                newObj = $.extend(true, {}, membersByCommittee),
                mobileHTML = '',
                mobileData = {
                    members: members,
                    committees: committeeTypes
                };

            if (!!o.mobileTplAlt) {
              if (o.beforeRenderMobileAlt !== undefined && typeof(o.beforeRenderMobileAlt) === 'function') {
                  o.beforeRenderMobileAlt( mobileData );
              }
              return Mustache.render(o.mobileTplAlt, mobileData);
            }

            $.each(committeeTypes, function(item, committee){
                // Render the header for individual committees
                var itemHTML = ''

                $.each( newObj[committee.name], function(i, member) {
                    var iconTpl = '';
                    // This template is used to determine which icon to display
                    $.each(committee.tags, function(idx, tag){
                        iconTpl += '{{#'+ tag +'}}' + Mustache.render( o.iconTpl, {cls: committee.icons[idx]}) + '{{/'+ tag +'}}';
                    });
                    // Render HTML for the member specific icon.
                    member.icon = Mustache.render( iconTpl, member);
                    // Render HTML for each member
                    itemHTML += Mustache.render( o.mobileItemTpl, member);
                });

                mobileHTML += Mustache.render( o.mobileWrapperTpl, {items: itemHTML, header: Mustache.render( o.mobileHeaderTpl, committee)});
            });

            return mobileHTML;
        },

        _buildCommittee: function(committeeMember, committeeTypes) {
            var inst = this, o = this.options,
                compositionHTML = '';
            
            $.each(committeeTypes, function(item, committee){
                var iconTpl = '';

                $.each(committee.tags, function(idx, tag){
                    iconTpl += '{{#'+ tag +'}}' + Mustache.render( o.iconTpl, {cls: committee.icons[idx], name: committee.name}) + '{{/'+ tag +'}}';
                });

                compositionHTML += Mustache.render( o.committeeTpl, {
                    columns: inst.columns,
                    icon: Mustache.render( iconTpl, committeeMember )
                });
            });

            return compositionHTML;
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);

// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    },
    configurable: true,
    writable: true
  });
}