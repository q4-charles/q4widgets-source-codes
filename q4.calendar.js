(function ($) {
    /**
     * An interactive calendar with links to events.
     * @class q4.calendar
     * @version 1.3.1
     * @example
     * $('.module-event-calendar_calendar-container').calendar({
     *      triggerEventsLoad: false
     * });
     * @requires [Underscore.js](lib/mustache.min.js)
     * @requires [Moment.js](lib/moment.2.18.1.min.js)
     * @requires [CLNDR.js](lib/clndr.1.4.7.min.js)
     */
    $.widget("q4.calendar", /** @lends q4.calendar */ {
        options: {
            /**
             * Events popup class container
             * @type {string}
             */
            popupCls: '.module-event-calendar_event-container',
            /**
             * Uses the moment.js plugin refer to http://momentjs.com/docs/#/displaying/ for formats
             * @type {string}
             * @default
             */
            dateFormat: 'MMMM D, YYYY',
             /**
             * This allows the widget to be placed on a site not hosted by Q4.
             * Allows to call the public API 
             * Requires url and apiKey to be set in the configuration.
             * @type {boolean}
             * @default
             */
            usePublic: false,
            /**
             * A number representing which language to pull data from
             * @type {interger}
             * @default
             */
            languageId: null,
            /**
             * A URL to a Q4 hosted website.
             * This is only required if `usePublic` is true.
             * @type {string}
             */
            url: '',
            /**
             * The API Key can be found under System Admin > Site List > Public Site
             * in the admin of any Q4 website.
             * This is only required if `usePublic` is true.
             * @type {string}
             */
            apiKey: '',
            /**
             * Declare what kind of events should be pulled from the Events API.
             * @param {number} eventSelection: 0 - Past events
             * @param {number} eventSelection: 1 - Future events
             * @param {number} eventSelection: 3 - All events
             * @type {number}
             * @default
             */
            eventSelection: 3,
            /**
             * If true, will load past events in the popup if there are no future or tagged events
             * @type {boolean}
             * @default
             */
            showPastOnLoad: false,
            /**
             * Include the related News
             * @type {boolean}
             * @default
             */
            news: true,
            /**
             * Include the related Presentations(s)
             * @type {boolean}
             * @default
             */
            presentations: true,
            /**
             * Include the related Financial Report.
             * @type {boolean}
             * @default
             */
            financials: true,
            /**
             * Can be set to a SlideShare username.
             * This will add SlideShare presentations as events.
             * @type {string}
             */
            slideshare: '',
            /**
             * Trigger the onEventsLoad callback
             * This will default to loading an event vs using the splash screen
             * @type {boolean}
             * @default
             */
            triggerEventsLoad: false,
            /**
             * If `triggerEventsLoad` is true and a `defaultTag` is set, the first event with the set tag will be displayed on load
             * @type {string}
             */
            defaultTag: '',
            /**
             * Templates for the indivudal sections support by event.
             * @param {object}   eventTemplates -
             * @param {string}   location - Display the event location
             * @param {string}   speakers - List each speaker
             * @param {string}   body - Display the event body
             * @param {string}   webcast - Link to webcast
             * @param {string}   news - Link to Press Release
             * @param {string}   docs - Attach related document(s)
             * @param {string}   presentations - Attach related presentation
             * @param {string}   financials - Attach financials
             * @param {string}   addToCal - Add to calendar
             * @param {function} event - generate the markup for individual events.
             * @example 
             * eventTemplates : {
             *     location: '{{#location}}<div class="module_location"><span class="module_location-text">{{location}}</span></div>{{/location}}'
             * }
             */
            eventTemplates : {
                location: (
                    '{{#location}}' +
                        '<div class="module_location">' +
                            '<span class="module_location-text">{{location}}</span>' +
                        '</div>' +
                    '{{/location}}'
                ),
                speakers: (
                    '{{#speakers.length}}'+
                        '<div class="module_speakers">' +
                            '<h4>Speaker(s):</h4>' +
                            '<ul>' +
                                '{{#speakers}}' +
                                    '<li class="module_speaker">' +
                                        '<i class="q4-icon_user-fill"></i> ' +
                                        '{{name}}, {{position}}' +
                                    '</li> ' +
                                '{{/speakers}}' +
                            '</ul>' +
                        '</div>' +
                    '{{/speakers.length}}'
                ),
                webcast: (
                    '{{#webcast}}' +
                        '<div class="module_webcast"><a href="{{webcast}}" target="_blank" class="module_link module_webcast-link">Webcast <span class="sr-only">(opens in new window)</span></a></div>' +
                    '{{/webcast}}'
                ),
                news: (
                    '{{#pressReleases}}' +
                        '<div class="module_news"><a href="{{url}}" target="_blank" class="module_link module_news-link">Press Release <span class="sr-only">(opens in new window)</span></a></div>' +
                    '{{/pressReleases}}'
                ),
                docs: (
                    '{{#docs.length}}' +
                        '<ul class="module_attachments">' +
                            '{{#docs}}' +
                                '<li class="module_attachment">' +
                                    '<a href="{{url}}" target="_blank" class="module_link module_attachment-link {{#type}}module_link-{{type}}{{/type}}">{{title}} <span class="sr-only">(opens in new window)</span></a>' +
                                '</li>' +
                            '{{/docs}}' +
                        '</ul>' +
                    '{{/docs.length}}'
                ),
                body: (
                    '{{#body}}' +
                        '<div class="module_body">' +
                            '{{{body}}}' +
                        '</div>' +  
                    '{{/body}}'
                ),
                presentations: (
                    '{{#presentations}}' +
                        '<div class="module_presentation"><a href="{{url}}" target="_blank" class="module_link module_presentation-link">Presentation <span class="sr-only">(opens in new window)</span></a></div>' +
                    '{{/presentations}}'
                ),
                financials: (
                    '{{#financialReports}}{{#docs.length}}' +
                        '<ul class="module_financials">' +
                            '{{#docs}}' +
                                '<li>' +
                                    '<a href="{{docUrl}}" target="_blank" class="module_link module_financial-link">{{docTitle}} <span class="sr-only">(opens in new window)</span></a>' +
                                '</li>' +
                            '{{/docs}}' +
                        '</ul>' +
                    '{{/docs.length}}{{/financialReports}}'
                ),
                addToCal: (
                    '<div class="module_add-to-calendar">' +
                        '<span class="module_link module_add-to-calendar-reveal">Add to Calendar</span>' +
                        '<ul class="module_add-to-calendar-list">' +
                            '<li class="module_add-to-calendar-item module_add-to-calendar-item--apple">' +
                                '{{#isPreview}}<a href="/preview/DownloadICal.aspx?id={{id}}" class="module_add-to-calendar-link">{{/isPreview}}' +
                                '{{^isPreview}}<a href="/DownloadICal.aspx?id={{id}}" class="module_add-to-calendar-link">{{/isPreview}}' +
                                    '<i class="q4-icon_apple"></i>' +
                                    '<span class="module_add-to-calendar-text sr-only">Add to Apple Calendar</span>' +
                                '</a>' +
                            '</li>' +
                            '<li class="module_add-to-calendar-item module_add-to-calendar-item--google">' +
                                '{{#isPreview}}<a href="/preview/DownloadICal.aspx?id={{id}}&amp;platform=GoogleCalendar" target="_blank" class="module_add-to-calendar-link">{{/isPreview}}' +
                                '{{^isPreview}}<a href="/DownloadICal.aspx?id={{id}}&amp;platform=GoogleCalendar" target="_blank" class="module_add-to-calendar-link">{{/isPreview}}' +
                                    '<i class="q4-icon_google"></i>' +
                                    '<span class="module_add-to-calendar-text sr-only">Add to Google Calendar</span>' +
                                '</a>' +
                             '</li>' +
                            '<li class="module_add-to-calendar-item module_add-to-calendar-item--outlook">' +
                                '{{#isPreview}}<a href="/preview/DownloadICal.aspx?id={{id}}" target="_blank" class="module_add-to-calendar-link">{{/isPreview}}' +
                                '{{^isPreview}}<a href="/DownloadICal.aspx?id={{id}}" target="_blank" class="module_add-to-calendar-link">{{/isPreview}}' +
                                    '<i class="q4-icon_microsoft"></i>' +
                                    '<span class="module_add-to-calendar-text sr-only">Add to Microsoft Outlook</span>' +
                                '</a>' +
                            '</li>' +
                            '<li class="module_add-to-calendar-item module_add-to-calendar-item--ics">' +
                                '{{#isPreview}}<a href="/preview/DownloadICal.aspx?id={{id}}" target="_blank" class="module_add-to-calendar-link">{{/isPreview}}' +
                                '{{^isPreview}}<a href="/DownloadICal.aspx?id={{id}}" target="_blank" class="module_add-to-calendar-link">{{/isPreview}}' +
                                    '<i class="q4-icon_calendar"></i>' +
                                    '<span class="module_add-to-calendar-text sr-only">Add to iCalendar</span>' +
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>'
                ),
                event: function(){
                    return (
                        '{{#items}}' +
                            '<div class="module_item list--reset" data-cls="{{clndrDateCls}}">' +
                                '<div class="module_date-time">' +
                                    '<span class="module_date-text">{{{date}}}</span>' +
                                '</div>' +
                                '<div class="module_headline"><a href="{{url}}" class="module_headline-link">{{title}}</a></div>' +
                                this.location +
                                this.speakers +
                                this.body +
                                '<div class="module_links module_q4-icon-links">' +
                                    '{{#id}}' + this.addToCal + '{{/id}}' +
                                    this.webcast +
                                    this.presentations +
                                    this.news +
                                    this.docs +
                                    this.financials +
                                '</div>' + 
                            '</div>' + 
                        '{{/items}}'
                    );
                }
            },
            /**
             * A callback fired after events are loaded.
             * @type {function}
             * @param {Object} calendar DOM element, can be used with methods such as .addEvents()
             * @param {Array} events An array containing all events
             * @example To use an event instead of a splash screen
             */
            onEventsLoad: function(calendar, eventData, o) {
                var startEvent = [];

                // check if a tag is set
                if ( o.defaultTag.length ) {
                    $.each(eventData, function(i, evnt){
                        if ( $.inArray( o.defaultTag, evnt.tag.split(' ') ) > -1 ) {
                            startEvent.push(evnt.items)
                            return
                        }
                    });
                }

                // if no tag is set, load first upcoming event
                if ( !startEvent.length ) {
                    $.each(eventData.reverse(), function(i, evnt){
                        var today = new Date( new Date().setHours(23, 59, 59, 59) ),
                            endDate =  new Date( new Date( evnt.endDate ).setHours(23, 59, 59, 59) );
                            
                        if ( endDate > today ) {
                            startEvent.push(evnt.items)
                            return
                        }
                    });
                }

                // no future/tagged events display last past event
                if ( !startEvent.length && o.showPastOnLoad) 
                    if(eventData.length) 
                       startEvent.push(eventData.reverse()[0].items); 
                
                if(startEvent.length)
                    $(o.popupCls).html( Mustache.render( o.eventTemplates.event(), {
                        items:[{
                            date: moment(startEvent[0].StartDate).format(o.dateFormat),
                            time: startEvent[0].StartDate.split(' ')[1] == '00:00:00' ? '' : moment(startEvent[0].startDate).format('h:mm A'),
                            timeZone: startEvent[0].TimeZone == "0" ? "" : startEvent[0].TimeZone,
                            docs: $.map(startEvent[0].Attachments, function(doc){
                                return {
                                    title: doc.Title,
                                    url: doc.Url,
                                    type: doc.Type.toLowerCase(),
                                    extension: doc.Extension,
                                    size: doc.Size
                                }
                            }),
                            isPreview: window.location.href.indexOf("/preview/preview.aspx") > -1 ? true : false,
                            id: new Date(startEvent[0].StartDate) > new Date() ? startEvent[0].EventId : !!0,
                            location: startEvent[0].Location,
                            pressReleases: $.map(startEvent[0].EventPressRelease, function(item){
                                return {
                                    title: item.Headline,
                                    url: item.LinkToDetailPage,
                                    docUrl: item.DocumentPath
                                }
                            }),
                            presentations: $.map(startEvent[0].EventPresentation, function (presentation) {
                                return {
                                    body: presentation.body,
                                    size: presentation.DocumentFileSize,
                                    type: presentation.DocumentFileType,
                                    url: presentation.DocumentPath,
                                    title: presentation.Title
                                }
                            }),
                            speakers: $.map(startEvent[0].EventSpeaker, function (speaker) {
                                return {
                                    name: speaker.SpeakerName,
                                    position: speaker.SpeakerPosition
                                }
                            }),
                            body: startEvent[0].Body,
                            title: startEvent[0].Title,
                            url: startEvent[0].LinkToDetailPage,
                            webcast: startEvent[0].WebCastLink,
                            financialReports: function(){
                                if (startEvent[0].EventFinancialReport[0] && startEvent[0].EventFinancialReport[0].Documents) {
                                    var docs = $.map(startEvent[0].EventFinancialReport[0].Documents, function (doc) {
                                        return {
                                            docCategory: doc.DocumentCategory,
                                            docSize: doc.DocumentFileSize,
                                            docIcon: doc.IconPath,
                                            docThumb: doc.ThumbnailPath,
                                            docTitle: doc.DocumentTitle,
                                            docType: doc.DocumentFileType,
                                            docUrl: doc.DocumentPath
                                        };
                                    });
                                    return {
                                        title: startEvent[0].EventFinancialReport[0].ReportTitle,
                                        docs: docs
                                    }
                                }
                            },
                            tags: startEvent[0].TagsList,
                            clndrDateCls: 'calendar-day-' + $.datepicker.formatDate('yy-mm-dd', new Date(startEvent[0].StartDate))
                        }]
                    }));
                var currentItem = $('.module-event-calendar_event-container .module_item');
                if (currentItem.length) {
                    $('.module-event-calendar_day').filter( '.' + currentItem.data('cls') ).addClass('module-event-calendar_day--selected')
                }

                if (q4App !== undefined && q4App.addToCalendar !== undefined) {
                    q4App.addToCalendar(o.popupCls + ' .module_add-to-calendar');
                }
            },
            /**
             * A callback fired after SlideShare has loaded.
             * @type {function}
             * @param {Object} calendar DOM element, can be used with methods such as .addEvents()
             * @param {Array} events An array containing slideshare data
             */
            onSlideShareLoad: function (calendar, events) {},
            /**
             * A callback fired after the widget and events have loaded.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function(e) {},
            /**
             * The maximum number of events to add to the calendar.
             * @type {number}
             * @default
             */
            eventSize: 25,
            /**
             * An array of tags used to filter events.
             * @type {Array<string>}
             */
            tags: [],
            /**
             * An options object to pass directly to the CLNDR.js instance.
             * See that module's documentation for details.
             * http://kylestetz.github.io/CLNDR/
             * @type {object}
             * @example
             * {
             *     adjacentDaysChangeMonth: true,
             *     daysOfTheWeek: ['Su','Mo','Tu','We','Th','Fr','Sa'],
             *     showAdjacentMonths: false,
             *     weekOffset: 1,
             *     doneRendering: function () {
             *         console.log('done rendering')
             *     },
             *     ready: function () {
             *         console.log('calendar is ready')
             *     }
             * }
             */
            calendar: {
                multiDayEvents: {
                    startDate: 'startDate',
                    endDate: 'endDate'
                },
                /**
                 * Generate the calendar markup using Mustache.JS
                 */
                render: function (data) {
                    return Mustache.render((
                        '<div class="module-event-calendar_controls">' +
                            '<div class="module-event-calendar_previous-month clndr-previous-button"><i class="q4-icon_chevron-left"></i></div>' +
                            '<div class="module-event-calendar_month">{{month}} {{year}}</div>' +
                            '<div class="module-event-calendar_next-month clndr-next-button"><i class="q4-icon_chevron-right"></i></div>' +
                        '</div>' +
                        '<div class="module-event-calendar_day-container grid--no-gutter">' +
                                '{{#daysOfTheWeek}}' +
                                    '<div class="module-event-calendar_day module-event-calendar_day--name grid_col">{{.}}</div>' +
                                '{{/daysOfTheWeek}}' +
                                '{{#days}}' +
                                    '<div class="{{classes}} grid_col">' +
                                        '<span>{{day}}</span>' +
                                    '</div>' +
                                '{{/days}}' +
                        '</div>'
                    ), data);
                },
                /**
                 * Generate the calendar markup using underscore.js, render needs to be set to null
                 */
                template: null,
                /**
                 * Start the week off on Sunday (0), Monday (1), etc. Sunday is the default.
                 */
                weekOffset: 0,
                /**
                 * An array of day abbreviation labels.
                 * The array MUST start with Sunday (use in conjunction with weekOffset to change the starting day to Monday)
                 */
                daysOfTheWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
                /**
                 * target class names
                 */
                targets: {
                    day: 'module-event-calendar_day',
                    empty: 'module-event-calendar_day--empty',
                    nextButton: 'module-event-calendar_next-month',
                    todayButton: 'module-event-calendar_today',
                    previousButton: 'module-event-calendar_previous-month',
                    nextYearButton: 'module-event-calendar_next-year',
                    previousYearButton: 'module-event-calendar_previous-year',
                },
                /**
                 * calendar item class names
                 */
                classes: {
                    past: "module-event-calendar_day--past",
                    today: "module-event-calendar_day--today",
                    event: "module-event-calendar_day--event",
                    selected: "module-event-calendar_day--selected",
                    inactive: "module-event-calendar_day--inactive",
                    lastMonth: "module-event-calendar_day--last-month",
                    nextMonth: "module-event-calendar_day--next-month",
                    adjacentMonth: "module-event-calendar_day--adjacent-month",
                },
                /**
                 * Show the dates of days in months adjacent to the current month.
                 */
                showAdjacentMonths: true,
                /**
                 * When days from adjacent months are clicked, switch the current month.
                 * fires nextMonth/previousMonth/onMonthChange click callbacks.
                 */
                adjacentDaysChangeMonth: false,
                /**
                 * this is called only once after clndr has been initialized and rendered.
                 * use this to bind custom event handlers that don't need to be re-attached
                 * every time the month changes (most event handlers fall in this category).
                 * hint: this.element refers to the parent element that holds the clndr,
                 * and is a great place to attach handlers that don't get tossed out every
                 * time the clndr is re-rendered.
                 * @default adds a selected class to selected elements only if they consist of an event
                 */
                ready: function() {
                    $('.module-event-calendar_calendar-container').on('click', '.module-event-calendar_day--event', function(){
                        $('.module-event-calendar_calendar-container').find('.module-event-calendar_day--event').removeClass("module-event-calendar_day--selected");
                        $(this).addClass('module-event-calendar_day--selected');
                    });
                },
                /**
                 * a callback when the calendar is done rendering.
                 * This is a good place to bind custom event handlers
                 * (also see the 'ready' option above).
                 */
                doneRendering: function(){ },
                /**
                 * @example
                 * $("#clndr").eventCal({
                 *     calendar: {
                 *         clickEvents: {
                 *             click: function(target){
                 *                 var events = target.events,
                 *                     length = events.length;
                 *                 if (length){
                 *                     console.log(length +' Event(s)')
                 *                 } else {
                 *                     console.log('No Events')
                 *                 }
                 *             },
                 *             onMonthChange: function(month){
                 *                 console.log(moment(month._d).format('MMMM'));
                 *             },
                 *             onYearChange: function(month) {
                 *                 console.log(moment(month._d).format('YYYY'));
                 *             },
                 *             today: function(month){
                 *                 console.log(month);
                 *             }
                 *         }
                 *     }
                 * });
                 */
                clickEvents: {
                    /**
                     * @event
                     * @param {Object} target
                     * fired whenever a calendar box is clicked.
                     * returns a 'target' object containing the DOM element, any events,
                     * and the date as a moment.js object.
                     */
                    click: function(target) {
                        var events = {
                            date: null,
                            items: []
                        }, o = $.q4.calendar._proto.options;

                        var classArr = target.element.className.split(' ');

                        if (target.events.length) {
                            $.each(target.events, function(i, e){
                                var event = e.items;
                                events.items.push({
                                    date: moment(event.StartDate).format(o.dateFormat),
                                    time: event.StartDate.split(' ')[1] == '00:00:00' ? '' : moment(event.StartDate).format('h:mm A'),
                                    timeZone: event.TimeZone == "0" ? "" : event.TimeZone,
                                    docs: $.map(event.Attachments, function(doc){
                                        return {
                                            title: doc.Title,
                                            url: doc.Url,
                                            type: doc.Type.toLowerCase(),
                                            extension: doc.Extension,
                                            size: doc.Size
                                        };
                                    }),
                                    isPreview: window.location.href.indexOf("/preview/preview.aspx") > -1 ? true : false,
                                    id: new Date(event.StartDate) > new Date() ? event.EventId : !!0,
                                    location: event.Location,
                                    pressReleases: $.map(event.EventPressRelease, function(item){
                                        return {
                                            title: item.Headline,
                                            url: item.LinkToDetailPage,
                                            docUrl: item.DocumentPath
                                        }
                                    }),
                                    presentations: $.map(event.EventPresentation, function (presentation) {
                                        return {
                                            body: presentation.body,
                                            size: presentation.DocumentFileSize,
                                            type: presentation.DocumentFileType,
                                            url: presentation.DocumentPath,
                                            title: presentation.Title
                                        };
                                    }),
                                    speakers: $.map(event.EventSpeaker, function (speaker) {
                                        return {
                                            name: speaker.SpeakerName,
                                            position: speaker.SpeakerPosition
                                        };
                                    }),
                                    body: event.Body,
                                    title: event.Title,
                                    url: event.LinkToDetailPage,
                                    webcast: event.WebCastLink,
                                    financialReports: function(){
                                        if (event.EventFinancialReport[0] && event.EventFinancialReport[0].Documents) {
                                            var docs = $.map(event.EventFinancialReport[0].Documents, function (doc) {
                                                return {
                                                    docCategory: doc.DocumentCategory,
                                                    docSize: doc.DocumentFileSize,
                                                    docIcon: doc.IconPath,
                                                    docThumb: doc.ThumbnailPath,
                                                    docTitle: doc.DocumentTitle,
                                                    docType: doc.DocumentFileType,
                                                    docUrl: doc.DocumentPath
                                                };
                                            });
                                            return {
                                                title: event.EventFinancialReport[0].ReportTitle,
                                                docs: docs
                                            }
                                        }
                                    },
                                    tags: event.TagsList,
                                    clndrDateCls: target.element.className.indexOf('--selected') > -1 ? classArr[classArr.length-4] : classArr[classArr.length-3]
                                });
                            });

                           $(o.popupCls).html( Mustache.render( o.eventTemplates.event(), events ));

                            // Add to calendar functionality
                            if (q4App !== undefined && q4App.addToCalendar !== undefined) {
                                q4App.addToCalendar(o.popupCls + ' .module_add-to-calendar');
                            }
                        }
                    },

                    /**
                     * @event
                     * @param {Object} month
                     * fired when a user goes forward a month.
                     * returns a moment.js object set to the correct month.
                     */
                    nextMonth: function(month){ },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when a user goes back a month.
                     * returns a moment.js object set to the correct month.
                     */
                    previousMonth: function(month){ },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when the next year button is clicked.
                     * returns a moment.js object set to the correct month and year.
                     */
                    nextYear: function(month) { },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when the previous year button is clicked.
                     * returns a moment.js object set to the correct month and year.
                     */
                    previousYear: function(month) { },
                    /**
                     * @event
                     * @param {Object} month
                     * fires any time the month changes as a result of a click action.
                     * returns a moment.js object set to the correct month.
                     * @default will set a selected class on the active event
                     */
                    onMonthChange: function(month) {
                        var currentItem = $('.module-event-calendar_event-container .module_item');

                        if (currentItem.length) {
                            $('.module-event-calendar_day').filter( '.' + currentItem.data('cls') ).addClass('module-event-calendar_day--selected')
                        }
                    },
                    /**
                     * @event
                     * @param {Object} month
                     * fires any time the year changes as a result of a click action.
                     * if onMonthChange is also set, it is fired BEFORE onYearChange.
                     * returns a moment.js object set to the correct month and year.
                     */
                    onYearChange: function(month) { },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when a user goes to the current month & year.
                     * returns a moment.js object set to the correct month.
                     */
                    today: function(month){ }
                },
            }
        },

        _init: function(){
            this.callClndr();
            $.extend( $.q4.calendar._proto.options, this.options); // update options
        },

        publicEventParams: function() {
            var o = this.options,
                data = {
                    apiKey : o.apiKey,
                    pageSize: o.eventSize,
                    includeTags: true,
                    eventSelection: o.eventSelection,
                    sortOperator: 1,
                    eventDateFilter: o.eventSelection,
                    includePressReleases: o.news,
                    includePresentations: o.presentations,
                    includeFinancialReports: o.financials,
                    tagList : o.tags.join('|'),
                    LanguageId: o.languageId ? o.languageId : GetLanguageId()
                };

            return data;
        },

        privateEventParams: function() {
            var o = this.options,
                data = {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        Signature: GetSignature(),
                        LanguageId: o.languageId ? o.languageId : GetLanguageId(),
                        RevisionNumber: GetRevisionNumber(),
                        TagList: o.tags,
                        StartIndex: 0,
                        ItemCount: o.eventSize,
                        IncludeTags: true
                    },
                    year: -1,
                    eventSelection: o.eventSelection,
                    sortOperator: 1,
                    includePressReleases: o.news,
                    includePresentations: o.presentations,
                    includeFinancialReports: o.financials
                };

            return data;
        },

        getPrivateEventList: function() {
            var inst = this;
                url = location.href.toLowerCase();

            $.ajax({
                type: 'POST',
                url: '/services/EventService.svc/GetEventList',
                data: JSON.stringify(inst.privateEventParams()),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(data){
                    inst.buildEventObj(data.GetEventListResult);
                },
                error: function(){
                    console.log('Events failed to load');
                }
            });
        },

        getPublicEventList: function() {
            var inst = this;

            $.ajax({
                type: 'GET',
                url: inst.options.url + '/feed/Event.svc/GetEventList',
                data: inst.publicEventParams(),
                dataType: 'json',
                success: function(data) {
                    inst.buildEventObj(data.GetEventListResult);
                },
                error: function() {
                    console.log('Events failed to load');
                }
            });
        },

        buildEventObj: function(data) {
            var inst = this,
                events = [];

            $.each(data, function(i, item) {
                var list = {},
                    eventStartDate = moment(item.StartDate).format('YYYY-MM-DD'),
                    eventEndDate = moment(item.EndDate).format('YYYY-MM-DD');

                var itemObj = {
                    startDate: eventStartDate,
                    endDate: eventEndDate,
                    tag: item.TagsList.join(' '),
                    items: item
                };

                events.push(itemObj);
            });

            // Events added to calendar after load
            inst.calendar.addEvents(events);

            if (this.options.onEventsLoad !== undefined && typeof(this.options.onEventsLoad) === 'function' && inst.options.triggerEventsLoad) {
                this.options.onEventsLoad(inst.calendar, events, inst.options);
            }

            inst._trigger('complete');
        },

        getSlideShare: function() {
            var inst = this;

            // Call SlideShare
            $.getJSON('//widgets.q4web.com/slideshare/rss/getRssByUser/' + inst.options.slideshare + '?callback=?', function(data) {
                inst.parseSlideShare(data);
            });
        },

        parseSlideShare: function(data) {
            var inst = this,
                events = [];

            $.each(data, function(i, ss){
                var date = moment(ss.published).format('YYYY-MM-DD');
                var itemObj = {
                    startDate: date,
                    endDate: date,
                    slideshare: true,
                    items: ss
                };
                events.push(itemObj);
            });

            //Add SlideShare as a calendar Event
            inst.calendar.addEvents(events);

            // Callback for slideshare
            if (this.options.onSlideShareLoad !== undefined && typeof(this.options.onSlideShareLoad) === 'function') {
                this.options.onSlideShareLoad(inst.calendar, events);
            }
        },

        callClndr: function(){
            var inst = this;

            inst.calendar = inst.element.clndr(inst.options.calendar);

            if (inst.options.usePublic) {
                inst.getPublicEventList();
            } else {
                inst.getPrivateEventList();
            }

            if (inst.options.slideshare.length){
                inst.getSlideShare();
            }
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);