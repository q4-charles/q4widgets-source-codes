(function ($) {
    /* Index Committee Widget */

    /**
     * Creates a responsive Committee Composition tables based of the Person List API.
     * @class q4.indexCommittee
     * @version 1.0.1
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.indexCommittee", /** @lends q4.indexCommittee */ {
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
            * Whether to render the details fancy box.
            * @type {boolean}
            * @default
            */
            showDetails: true,
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
                name: 'Audit Committee',
                tags: ['audit-chair', 'audit-member', 'audit-board'],
                icons: ['<i class="fa fa-user"><sup class="irwMemberLegend">CC</sup></i>', '<i class="fa fa-user"></i>', '<i class="fa fa-user"><sup class="irwMemberLegend">CB</sup></i>'],
                doc: {
                    title: "Charter Document",
                    url: "/charter-sample.pdf"
                }
            }, {
                name: 'Compensation Committee',
                tags: ['compensation-chair', 'compensation-member', 'compensation-board'],
                icons: ['<i class="fa fa-user"><sup class="irwMemberLegend">CC</sup></i>', '<i class="fa fa-user"></i>', '<i class="fa fa-user"><sup class="irwMemberLegend">CB</sup></i>'],
                doc: {
                    title: "Charter Document",
                    url: "/charter-sample.pdf"
                }
            }, {
                name: 'Nominating and Corporate Governance Committee',
                tags: ['nominating-chair', 'nominating-member', 'nominating-board'],
                icons: ['<i class="fa fa-user"><sup class="irwMemberLegend">CC</sup></i>', '<i class="fa fa-user"></i>', '<i class="fa fa-user"><sup class="irwMemberLegend">CB</sup></i>'],
                doc: {
                    title: "Charter Document",
                    url: "/charter-sample.pdf"
                }
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
                // @formatter:off
                /* beautify preserve:start */
                '<div class="module_container--desktop">' +
                    '<table class="table table-hover irwCommitteeTable" data-sort="false">' +
                        '<thead>' +
                            '<tr>' +
                                '{{{header}}}' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '{{{members}}}' +
                        '</tbody>' +
                    '</table>' +
                '</div>' +
                '<div class="module_container--tablet">' +
                    '{{{mobile}}}' +
                '</div>' +
                '{{{legend}}}'
                /* beautify preserve:end */
                // @formatter:on
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
                // @formatter:off
                /* beautify preserve:start */
                '<th class="Tbl-th-FirstCol" data-toggle="true"></th>' +
                '{{#types}}' +
                    '<th rel="col{{index}}" class="col{{index}} text-primary">' +
                        '<a id="charterLink{{index}}" class="irwTriggerModal text-primary module-committee_charter-link" href="#irwModalCommittee{{index}}" data-fancybox="irwModalCommittee">' +
                            '<strong>{{name}}</strong>' +
                        '</a>' +
                        '<div class="modal-dialog" id="irwModalCommittee{{index}}" style="display:none; padding: 0;">' +
                            '<div class="modal-content" style="border: none;">' +
                                '<div class="modal-body">' +
                                    '<div class="irwCommitDetail">' +
                                        '<div class="modal-header bg-primary">' +
                                            '<button type="button" class="close" data-fancybox-close aria-hidden="true">Ã—</button>' +
                                            '<h4 class="modal-title"><strong>{{name}}</strong></h4>' +
                                        '</div>' +
                                        '<div class="modalbody">' +
                                            '<div class="row">' +
                                                '<div class="col-xs-6 irwCommitImgDetailText">' +
                                                    '<div class="irwModalCommitteeMember">' +
                                                        '<h5 class="text-primary">Committee Members</h5>' +
                                                        '<table>' +
                                                          '<tbody>' +
                                                                '{{#members}}' +
                                                                    '<tr>' +
                                                                        '<td class="text-muted"> <span class="faBox"><i class="{{icon}}"></i></span></td>' +
                                                                        '<td class="text-muted">' +
                                                                            '<a data-trigger="#memberLink{{index}}" class="irwTriggerModal module-committee_fancybox-link" href="javascript:void(null);">' +
                                                                                '{{{firstName}}} {{{middleName}}} {{{lastName}}}' +
                                                                            '</a>' +
                                                                        '</td>' +
                                                                    '</tr>' +
                                                                '{{/members}}' +
                                                            '</tbody>' +
                                                        '</table>' +
                                                    '</div>' +
                                                '</div>' +
                                                '{{#doc}}' +
                                                    '<div class="col-xs-6 irwCommitImgDetailText">' +
                                                        '<div class="irwModalCommitteeDocument">' +
                                                            '<h5 class="text-primary">Charter Documents</h5>' +
                                                            '<table>' +
                                                                '<tbody>' +
                                                                    '<tr class="irwHasGA">' +
                                                                        '<td class="text-muted">' +
                                                                            '<span class="faBox"><i class="fa fa-file-pdf-o"></i></span>' +
                                                                        '</td>' +
                                                                        '<td class="text-muted">' +
                                                                            '<a href="{{url}}" class="irwEventTracking irwGaHasTitle irwGaHasFile irwGaLabel" target="_blank">{{{title}}}</a>' +
                                                                        '</td>' +
                                                                    '</tr>' +
                                                                '</tbody>' +
                                                            '</table>' +
                                                        '</div>' +
                                                    '</div>' +
                                                '{{/doc}}' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</th>' +
                '{{/types}}'
                /* beautify preserve:end */
                // @formatter:on
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
                // @formatter:off
                    /* beautify preserve:start */
                    '{{#members}}' +
                        '<tr id="memberLink{{index}}" class="module-committee_member-link irwTriggerModal text-primary {{#lastRow}}lasttd{{/lastRow}}" data-fancybox="irwModalMember" data-src="#irwModalMember{{index}}">' +
                            '<td class="irwMemberName footable-visible footable-first-column">' +
                                '{{firstName}}{{middleName}}{{lastName}}' +
                                '{{#customRoles}}<span class="module-committee_custom-role">{{{.}}}</span>{{/customRoles}}' +
                                '<div class="modal-dialog" id="irwModalMember{{index}}" style="display:none; padding: 0;">' +
                                    '<div class="modal-content" style="border: none;">' +
                                        '<div class="modal-body">' +
                                            '<div class="irwMemberDetail">' +
                                                '<div class="modal-header bg-primary">' +
                                                    '<button type="button" class="close" data-fancybox-close aria-hidden="true">Ã—</button>' +
                                                    '<h4 class="modal-title"><strong>{{firstName}}{{middleName}}{{lastName}}</strong></h4>' +
                                                '</div>' +
                                                '<div class="modalbody">' +
                                                    '<div>' +
                                                        '<div class="bio-container">' +
                                                            '<div class="irwBio">{{{bio}}}</div>' +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div class="clearfix"></div>' +
                                                    '{{#committees.0}}' +
                                                        '<div class="irwModalCommitteeMember">' +
                                                            '<h5 class="text-primary">Committee Membership</h5>' +
                                                            '<table>' +
                                                                '<tbody>' +
                                                                    '{{#committees}}' +
                                                                        '<tr>' +
                                                                            '<td class="text-muted">' +
                                                                                '{{{icon}}}' +
                                                                            '</td>' +
                                                                            '<td class="text-muted">' +
                                                                                '<a data-trigger="#charterLink{{position}}" href="javascript:void(null);" class="irwTriggerModal module-committee_fancybox-link">{{name}}</a>' +
                                                                            '</td>' +
                                                                        '</tr>' +
                                                                    '{{/committees}}' +
                                                                '</tbody>' +
                                                            '</table>' +
                                                        '</div>' +
                                                    '{{/committees.0}}' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</td>' +
                            '{{{composition}}}' +
                        '</tr>' +
                    '{{/members}}'
                    /* beautify preserve:end */
                    // @formatter:on
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
                // @formatter:off
                /* beautify preserve:start */
                '<td rel="col{{index}}" class="col{{index}} text-muted irwCommiticon {{#icon}}irwMember{{/icon}}">' +
                    '{{#icon}}<span class="faBox">{{{icon}}}</span>{{/icon}}' +
                '</td>'
                /* beautify preserve:end */
                // @formatter:on
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
                // @formatter:off
                /* beautify preserve:start */
                '<div class="irwLegends irwNote">' +
                    '<div class="text-muted irwLegend">' +
                        '<span class="faBox"><i class="fa fa-user"><sup class="irwMemberLegend">CC</sup></i></span><span class="irwNameLegend">= Chairperson</span>' +
                    '</div>' +
                    '<div class="text-muted irwLegend">' +
                        '<span class="faBox"><i class="fa fa-user"><sup class="irwMemberLegend">CB</sup></i></span><span class="irwNameLegend">= Chairman Of The Board</span>' +
                    '</div>' +
                    '<div class="text-muted irwLegend">' +
                        '<span class="faBox"><i class="fa fa-user"></i></span><span class="irwNameLegend">= Member</span>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '<div class="text-info">*To view the charter documents, click on committee name.</div>' +
                '</div>'
                /* beautify preserve:end */
                // @formatter:on
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
                '{{{cls}}}'
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
            mobileTplAlt: (
                // @formatter:off
                /* beautify preserve:start */
                '<div id="irwCommitteeMobTab" class="tabbable irwShow">' +
                    '<ul id="irwTabsEvent" class="nav nav-tabs">' +
                        '<li class="active"><a href="#ByCommittee">By Committee</a></li>' +
                        '<li><a href="#ByMember">By Member</a></li>' +
                    '</ul>' +
                '</div>' +
                '<div id="ByMember" class="Committeetab" style="display:none;">' +
                    '<table class="table footable irwMemberTable phone breakpoint" data-sort="false">' +
                        '<thead>' +
                            '<tr class="active">' +
                                '<th class="Tbl-th-FirstCol" data-toggle="true"><strong></strong></th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '{{#members}}' +
                                '<tr class="footable-detail-name">' +
                                    '<td class="text-primary irwMemberName"><span class="footable-toggle"></span>{{firstName}}{{middleName}}{{lastName}}</td>' +
                                '</tr>' +
                                '<tr class="footable-row-detail">' +
                                    '<td class="footable-row-detail-cell" colspan="1">' +
                                        '<div class="footable-row-detail-inner">' +
                                            '{{#committees}}' +
                                                '<div class="footable-row-detail-row">' +
                                                    '<div class="footable-row-detail-name">{{name}} :</div>' +
                                                    '<div class="footable-row-detail-value text-muted"><span class="faBox">{{{icon}}}</span></div>' +
                                                '</div>' +
                                            '{{/committees}}' +
                                        '</div>' +
                                    '</td>' +
                                '</tr>' +
                            '{{/members}}' +
                        '</tbody>' +
                    '</table>' +
                '</div>' +
                '<div id="ByCommittee" class="Committeetab">' +
                    '<table class="table irwMemberTable footable phone breakpoint" data-sort="false">' +
                        '<thead>' +
                            '<tr class="active">' +
                                '<th class="Tbl-th-FirstCol" data-toggle="true"><strong></strong></th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '{{#committees}}' +
                                '<tr class="footable-detail-name">' +
                                    '<td class="text-primary irwCommitteeName"><span class="footable-toggle"></span>{{name}}</td>' +
                                '</tr>' +
                                '<tr class="footable-row-detail">' +
                                    '<td class="footable-row-detail-cell" colspan="1">' +
                                        '<div class="footable-row-detail-inner">' +
                                            '{{#members}}' +
                                                '<div class="footable-row-detail-row">' +
                                                    '<div class="footable-row-detail-name"><a href="/governance/board-of-directors/default.aspx">{{firstName}}{{middleName}}{{lastName}}</a> :</div>' +
                                                    '<div class="footable-row-detail-value text-muted"><span class="faBox">{{{icon}}}</span></div>' +
                                            '</div>' +
                                            '{{/members}}' +
                                            '<div class="footable-row-detail-row">' +
                                                '<div class="footable-row-detail-name">Charter Documents :</div>' +
                                                '<div class="footable-row-detail-value text-muted">' +
                                                    '<table id="irwCharterdocs">' +
                                                        '<tbody>' +
                                                            '<tr class="irwHasGA">' +
                                                                '<td class="text-muted"><span class="faBox"><i class="fa fa-file-pdf-o"></i></span></td>' +
                                                                '<td class="text-muted"><a href="{{url}}" class="irwEventTracking irwGaHasTitle irwGaHasFile irwGaLabel" data-gafid="1500091876" data-gatitle="PDF" target="_blank">{{name}}</a></td>' +
                                                            '</tr>' +
                                                        '</tbody>' +
                                                    '</table>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</td>' +
                                '</tr>' +
                            '{{/committees}}' +
                        '</tbody>' +
                    '</table>' +
                '</div>'
                /* beautify preserve:end */
                // @formatter:on
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
            loadingMessage: '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Loading committee table...</span></p>',
            /**
             * <p>A callback that fires before the widget is rendered.</p>
             * @type {function}
             * @param personData {array} - An array of person data.
             */
            beforeRender: function (personData) {
            },
            /**
             * <p>A callback that fires before the mobile alternate template is rendered.</p>
             * @type {function}
             * @param mobileData {object} - Object of commmittees (array) and members (array) .
             */
            beforeRenderMobileAlt: function (mobileData) {
            },
            /**
             * <p>A callback that fires after the entire widget is rendered.</p>
             * @type {function}
             */
            onComplete: function () {
            }
        },

        _create: function () {
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

        _getPersonList: function (ticker) {
            var inst = this,
                o = this.options,
                apiUrl = o.usePublic ? '/feed/People.svc/GetPeopleList' : '/Services/PeopleService.svc/GetPeopleList';

            inst._getData(apiUrl,
                $.extend(inst._buildParams(), o.usePublic ? {
                    departmentId: inst.options.category
                } : {
                    departmentWorkflowId: inst.options.category
                })
            ).done(function (committeeData) {
                inst.element.html(inst._normalizeData(committeeData.GetPeopleListResult)).removeClass(o.loadingClass);

                if (o.showDetails) {
                    $(inst.element).find('.module-committee_member-link, .module-committee_charter-link').fancybox({
                        parentEl: '#irwCommitteeCharting',
                        type: 'html',
                        autoFocus: false,
                        baseClass: "modal fade in",
                        smallBtn: "",
                        afterLoad: function (instance, current) {
                            $(current.$content).find('.module-committee_fancybox-link').on('click', function (e) {
                                e.preventDefault();
                                $.fancybox.getInstance().close();
                                var target = $(this).data('trigger');
                                $(target).trigger('click');
                            })
                        }
                    });
                } else {
                    $(inst.element).find('[data-fancybox]').on('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    });
                }

                $(".irwCommitteeTable td, .irwCommitteeTable th").hover(function () {
                    irwcellClassName = $(this).attr("rel"),
                        irwMembers = $(this).filter(".irwMember"),
                        NextTRClass = $(this).closest("tr").next().attr("class"),
                    irwMembers.length == 1 && (NextTRClass == "footable-row-detail" ? $(this).closest("tr").next().next().find($("." + irwcellClassName)).addClass("hover_border") : $(this).closest("tr").next().find($("." + irwcellClassName)).addClass("hover_border")),
                        $("." + irwcellClassName).addClass("hover_class")
                }, function () {
                    irwMembers.length == 1 && (NextTRClass == "footable-row-detail" ? $(this).closest("tr").next().next().find($("." + irwcellClassName)).removeClass("hover_border") : $(this).closest("tr").next().find($("." + irwcellClassName)).removeClass("hover_border")),
                        $("." + irwcellClassName).removeClass("hover_class")
                });

                $('#irwTabsEvent').on('click', 'li > a', function () {
                    $(this).closest('li').siblings().removeClass('active');
                    $(this).closest('li').addClass('active');
                    $('.Committeetab').hide();

                    var target = $(this).attr('href');
                    $(target).show();
                });

                $('.footable-row-detail').hide();

                $('.footable-detail-name').on('click', function () {
                    $(this).hasClass('footable-detail-show') ? $(this).removeClass('footable-detail-show') : $(this).addClass('footable-detail-show');
                    $(this).next().toggle('slow');
                });

                inst._trigger('onComplete');
            });
        },

        _normalizeData: function (committeeData) {

            var inst = this, o = inst.options,
                membersByCommittee = {},
                committee = {
                    header: '',
                    members: [],
                    legend: inst.options.legendTpl
                };

            $.each(o.committeeTypes, function (i, type) {
                membersByCommittee[type.name] = [];
            });

            $.each(committeeData, function (i, person) {
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
                    committees: [],
                    lastRow: i === committeeData.length - 1
                };

                $.each(person.TagsList, function (i, committeeTags) {
                    if (o.customRoles[committeeTags] !== undefined) {
                        committeeMember.customRoles.push(o.customRoles[committeeTags]);
                    } else {
                        committeeMember[committeeTags] = true;

                        var committeeTypeIndex = o.committeeTypes.findIndex(function (x) {
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
                        }
                        ;
                    }

                    if (o.responsive) {
                        // Build a type array which will include each committee a member belongs to
                        $.each(o.committeeTypes, function (i, type) {
                            if ($.inArray(committeeTags, type.tags) > -1) {
                                membersByCommittee[type.name].push(committeeMember);
                            }
                        });
                    }
                });

                committeeMember.composition = inst._buildCommittee(committeeMember, o.committeeTypes);
                committee.members.push(committeeMember);
            });

            $.each(o.committeeTypes, function (i, type) {
                var members = [];

                type.index = i;

                $.each(membersByCommittee[type.name], function (j, member) {
                    $.each(type.tags, function (k, tag) {
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

            if (inst.options.beforeRender !== undefined && typeof (inst.options.beforeRender) === 'function') {
                inst.options.beforeRender(committee.members);
            }

            committee.header = Mustache.render(inst.options.headerTpl, {
                columns: inst.columns,
                types: inst.options.committeeTypes
            });

            committee.members = Mustache.render(inst.options.itemTpl, {
                columns: inst.columns,
                members: committee.members
            });

            return Mustache.render(o.template, committee);
        },

        _buildMobileCommittee: function (members, membersByCommittee, committeeTypes) {
            var inst = this, o = this.options,
                newObj = $.extend(true, {}, membersByCommittee),
                mobileHTML = '',
                mobileData = {
                    members: members,
                    committees: committeeTypes
                };

            if (!!o.mobileTplAlt) {
                if (o.beforeRenderMobileAlt !== undefined && typeof (o.beforeRenderMobileAlt) === 'function') {
                    o.beforeRenderMobileAlt(mobileData);
                }
                return Mustache.render(o.mobileTplAlt, mobileData);
            }

            $.each(committeeTypes, function (item, committee) {
                // Render the header for individual committees
                var itemHTML = ''

                $.each(newObj[committee.name], function (i, member) {
                    var iconTpl = '';
                    // This template is used to determine which icon to display
                    $.each(committee.tags, function (idx, tag) {
                        iconTpl += '{{#' + tag + '}}' + Mustache.render(o.iconTpl, {cls: committee.icons[idx]}) + '{{/' + tag + '}}';
                    });
                    // Render HTML for the member specific icon.
                    member.icon = Mustache.render(iconTpl, member);
                    // Render HTML for each member
                    itemHTML += Mustache.render(o.mobileItemTpl, member);
                });

                mobileHTML += Mustache.render(o.mobileWrapperTpl, {items: itemHTML, header: Mustache.render(o.mobileHeaderTpl, committee)});
            });

            return mobileHTML;
        },

        _buildCommittee: function (committeeMember, committeeTypes) {
            var inst = this, o = this.options,
                compositionHTML = '';

            $.each(committeeTypes, function (item, committee) {
                var iconTpl = '';

                $.each(committee.tags, function (idx, tag) {
                    iconTpl += '{{#' + tag + '}}' + Mustache.render(o.iconTpl, {cls: committee.icons[idx], name: committee.name}) + '{{/' + tag + '}}';
                });

                compositionHTML += Mustache.render(o.committeeTpl, {
                    columns: inst.columns,
                    index: item,
                    icon: Mustache.render(iconTpl, committeeMember)
                });
            });

            return compositionHTML;
        },

        destroy: function () {
            this.element.html('');
        },

        _setOption: function (option, value) {
            this._superApply(arguments);
        }

    });
})(jQuery);