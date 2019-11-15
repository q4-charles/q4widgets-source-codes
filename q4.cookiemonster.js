/*                                    .,.
                                ,nMMMMMMb.
                     .,,,.     dP""""MMMMMb
                  .nMMMMMMMn. `M     MMMMMM>
                 uMMMMMMMMMMMb Mx   uMMMMMM   . .,,.
                 MMMMMMP" '"4M.`4MMMMMMMMM' ?J$$$$ccc"=
                 MMMMMM     4M'  "4MMMMP" z$c,"?$c,""$c$h=
                 "MMMMMb,..,d' hdzc   ,cc$$$$$$$$$$L.$c "
                `4MMMMMMP" ,$$$$$$c,$$$$$$$$$$$$"?? ,c?$.
                 ,cc,.  .,zc$$$$$3?$?$P"?  " "  "    $$$$h`
              ,c$$$", c$$$$$$$$PP                   ,$$$$$c
              )$$$$$$$P"$$$$$"  "                   $c,"$c/
            ,cc$$$$$"".d$?? "                      J$$hc$=
           ,c" d$$??c="         '!!               z$$$$$??
          `??-$""? ?"             '   .          d$$$""$ccc
            =`" "        "                     ,d$$$$P $$$"-
              d$$h.        ,;!               ,d$$$$P" .$$$h.
                $$h.  !> -$$$$$P zd$$$""$. ,d$$$$P" .$$$hh.
              " "$" $c  !  `!,!'!;,,;!--!!!! `$$P .d$$$$$h $c"
                 $ d$".`!!  `'''`!!!!    !!,! $C,d$$$$$$$$.`$-
                 $."$ '  ,zcc=cc ``'``<;;!!!> $?$$$$$$$$"$$F"
                 "=" .J,??"" .$",$$$$- '!'!!  $<$$$$$$$$h ?$=.
                 ".d$""",chd$$??""""".r >  !'.$?$$$$$$$$"=,$cc,
               ,c$$",c,d$$$"' ,c$$$$$$"'!;!'.$F.$$$$$$$$. $$$."L
              d $$$c$$$$$" ,hd$$$$??" z !!`.P' `$$$$$$$?? $$$P ..
           ,cd J$$$$$$$P',$$$$$$".,c$$" `.d$h h $$$$$$P"?.?$$ ,$$""
          c$$' $$$$$$$C,$$$$$$"',$$$P"z $$$$"-$J"$$$$$ ,$$?$F.$L?$$L
         ,$",J$$$$$$$$$$$$$$"  ,$$$C,r" $$$$$$$"z$$$$$$$$$,`,$$"d$$??
        .dF $$$$$$$$$$$$$$P" $$$$$$$F.-,$$$$$$$$$$$$$$$$$$$%d$$F$$$$cc,-
       ,$( c$$$$$$$$$$$$$$h,c$$$$$$c=".d$$   """',,.. .,.`""?$$$$$$.`?c .
       d$$.$$$$$$$$$$$$$$$$$$$P""P" ,c$$$$$c,"=d$$$$$h."$$$c,"$$$$$$. $$c
      $$$$$$$$$$$$$$$$$$$$$P"",c"  ,$$$$$$$$$h. `?$$$$$$$$$$P'.""`?$$.3$cr
    z$$$$$$$$$ 3?$$$$$$$$$ccc$P   ,$$$$$$$$$$$$$h.`"$$$$$$$$$c?$c .`?$$$$c
  dd$$"J$$$$$$$P $$$$$$$$F?$$$" .d$$$$$$$$$$$$$$$$L.`""???$$$$$$$$$c  ?$C?
 c$$$$ $$3$$$$$$ `$$$$$h$$P"".. $$$$$$$$$$$$$$$??""" ,ccc3$$$$$$$$$ hL`?$C
h$$$$$>`$$$$$$$$$.$$$$$??',c$"  $$$$$P)$$$$$P" ,$$$$$$$$$$$$$$$$$$$ "$ ."$
$$$$$$h.$C$$$$$$$$$$$ccc$P"3$$ ,$$$$$ "$$$P" =""',d$$???""',$$$$$$$$ $cc "
$$$$$$$$$$$$$$$$P$$?$$$.,c??",c$$$$$L$J$P"  zchd$$$$,ccc$$$$$$$$$$$$$$$$
$$$$$$$$$$$$$$$$$$$$3$$$F" c$$$$$$$$$$  ,cc$$$$$$P"""""`"""??$$$$$$$$$$$P/
$$$$$$$$$$$$$$$??)$$$JC".d$$4?$$$$$$$$$c .,c=" .,,J$$$$$$$$hc,J$$$$$$$$$$%
$$$$$$$$$$$$"".,c$$$$CF $$$h"d$$$$$$$$$h "',cd$????$$$$$$$$$$$$$$$$$$$$$$z
$$$$$$$$$P??"3$$P??$$" ,$$$FJ?$$$$$$$$$$cc,,. ,,.  =$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$$hc$$$$$r$P"'  $$$$."-3$$$$$$$$$$$$$"$"$$$c, ""????$$$$$$$$$$$$$$$
$$$$$3$$$$$$$h.zccc$$ ,$$$$L`,$$$$$$$$$$$$$L,"- $$$$$cc -cc??)$$$$$$$$$$$$

ME WANT COOKIE!
*/
(function($) {
    /**
     * Cookie Monster - Q4 Cookie Management Tool
     * <br>This tool was created for Q4 Sites to be more compliant with GDPR and ePR
     * <br>This tool enables more control on how third-party plugins are added to the site and gives users the ability to opt-in or out from plugins
     * <br>that sets cookies to track possibly personally indentifiable information.
     * @class q4.cookieMonster
     * @version 0.1.2
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [CookieMonster.min.css](lib/q4.cookie-monster.min.css)
     * @requires [CookieMonster.css](lib/q4.cookie-monster.css)
     * @example
     * <script type="text/javascript">
     * $(window).cookieMonster({
     *   logo: '', //default
     *   triggerClass: '.cm-link',
     *   initState: 'disclaimer', // disclaimer/open/closed
     *   acceptOnClose: false, // when users click on the close button or outside the sidebar this will set the cookie and the recommended settings.
     *   googleUACode: 'UA-xxxxxxx-15',
     *   disclaimer: {
     *     layout: 'banner', //popup/banner
     *     style: 'slide-up', //slide-up/fade-in
     *     header: 'Cookies on this website.',
     *     description: 'We use cookies on q4inc.com to provide you with the best possible experience. If you wish to review the cookies we store, please select the Cookie Preferences option on this banner. After your preferences are saved, you can use the cookie icon at the left to modify your selections at any time. For more information, you can review our <a href="/privacy-policy/default.aspx">Privacy Policy</a> and <a href="/cookie-policy/default.aspx">Cookie Policy</a>.',
     *     accept: 'Accept',
     *     control: 'Cookie Preferences',
     *     closeButton: true,
     *     onAccept: function() {},
     *     onClose: function() {}
     *   },
     *   preferences: {
     *     position: 'left', //left/right
     *     header: 'Q4INC.COM Cookie Preferences',
     *     description: 'Please use the following sections to learn more about the types of cookies we use, and how you can opt out of those you do not wish to be stored. At q4inc.com, we respect your privacy and are committed to protecting your information. For more information, you can review our <a href="/privacy-policy/default.aspx">Privacy Policy</a> and <a href="/cookie-policy/default.aspx">Cookie Policy</a>.',
     *     statement: null,
     *     recommendedText: 'Accept Recommended Settings',
     *     necessaryHeader: 'Necessary Cookies',
     *     necessaryDescription: 'These cookies are necessary for the services and viewing experience of this site, and cannot be opted out of via this tool. If you still wish to remove these, you may do using your browser settings. A description of these technologies is provided in our <a href="/privacy-policy/default.aspx">Privacy Policy</a> and <a href="/cookie-policy/default.aspx">Cookie Policy</a>.',
     *     thirdPartyHeader: 'Warning: Some cookies require your attention',
     *     thirdPartyDescription: 'Consent for some third party cookies can not be automatically revoked. Please follow the link below if you want to opt out of them.',
     *   },
     *   style: {
     *     disclaimer: {
     *       headerColor: '#0f5ca3',
     *       textColor: '#939ba0',
     *       buttonTextColor: '#2a3035',
     *       acceptButtonColor: '#f1af0f',
     *       acceptButtonBorder: '2px solid #f1af0f'
     *     },
     *     preference: {
     *       bgcolor: '',
     *       headerColor: '#0f5ca3',
     *       textColor: '#939ba0',
     *       acceptButtonColor: '#f1af0f',
     *       buttonTextColor: '#2a3035',
     *       warningHeaderColor: '#333',
     *     }
     *   },
     *   optionalCookies: [{
     *       name: 'pardot',
     *       label: 'Pardot by Salesforce',
     *       description: 'We use these cookies to deliver a seamless user experience for those customers and users that have created an account with us for receiving email communications.',
     *       cookies: ['lpv*', 'pardot', 'visitor_id*'],
     *       onAccept: function() {
     *         piAId = 'xxxx';
     *         piCId = 'xxxx';
     * 
     *         function async_load() {
     *           var s = document.createElement('script');
     *           s.type = 'text/javascript';
     *           s.src = ('https:' == document.location.protocol ? 'https://pi' : 'http://cdn') +
     *             '.pardot.com/pd.js';
     *           var c = document.getElementsByTagName('script')[0];
     *           c.parentNode.insertBefore(s, c);
     *         }
     *         async_load();
     *       },
     *       onRevoke: function() {},
     *       thirdPartyCookies: {
     *         name: 'Pardot by Salesforce',
     *         optOutLink: 'https://help.salesforce.com/articleView?id=pardot_basics_cookies.htm&type=5'
     *       }
     *     },
     *     {
     *       name: 'linkedin',
     *       label: 'LinkedIn Ads',
     *       description: 'We use the LinkedIn Ads cookie to track the success of LinkedIn advertising. This cookie is an analytics tool that allows us to measure the effectiveness of advertising by understanding the actions people take on our website.',
     *       cookies: ['bcookie', 'liap', 'li_oatml'],
     *       onAccept: function() {
     *         _linkedin_data_partner_id = "xxxxx";
     *         var s = document.getElementsByTagName("script")[0];
     *         var b = document.createElement("script");
     *         b.type = "text/javascript";
     *         b.async = true;
     *         b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
     *         s.parentNode.insertBefore(b, s);
     *       },
     *       onRevoke: function() {},
     *       thirdPartyCookies: {
     *         name: 'LinkedIn Ads',
     *         optOutLink: 'https://www.linkedin.com/help/linkedin/answer/62931/manage-advertising-preferences?lang=en'
     *       }
     *     }
     *   ],
     *   complete: function(e) {}
     * });
     * </script>
     */
    $.widget('q4.cookieMonster', /** @lends q4.cookieMonster */ {
        options: {
            /**
             * Element container to prepend the tool
             * @type {string}
             * @default
             */
            container: 'body',
            /**
             * The jpg or png format url of a client logo. This enables a box on bottom left corner to show up and accesses the sidebar tool on click.
             * @type {string}
             * @default
             */
            logo: '',
            /**
             * Determines if the close buttons and overlay should accept recommended settings (turns all plugins on) when clicked.
             * @type {boolean}
             * @default
             */
            acceptOnClose: false,
            /**
             * Class of the element that opens the sidebar tool
             * @type {string}
             * @default
             */
            triggerClass: '.cm-link',
            /**
             * Initial state of the tool when no cookie is set. 'disclaimer' will show a popup banner or box. 'open' will show the sidebar tool. 'closed' will not show the tool and only accessible by the trigger element.
             * @type {string}
             * @example initState: 'disclaimer'/'open'/'closed',
             * @default
             */
            initState: 'disclaimer',
            /**
             * Google Analytics code can be added here, which the tool will automatically build the optional cookie object.
             * @type {string}
             * @default
             */
            googleUACode: '',
            /**
             * Disclaimer object, comprises of text options and style options. As well as callback functions
             * @type {object}
             * @example
             * disclaimer: {
             *     layout: 'popup', // 'popup' - will show the disclaimer as a box on the right corner. 'banner' - will show it as a banner on bottom of screen
             *     style: 'slide-up', //slide-up - slide's up on load. fade-in - fades on load
             *     header: 'Cookies on this website', // header text
             *     description: 'We use cookies to optimise site functionality and give you the best possible experience.', // description text
             *     accept: 'Accept', // accept button text
             *     control: 'Cookie Preferences', // sidebar trigger text
             *     closeButton: true, // true - shows the close button, false - no close button
             *     onAccept: function() {}, // runs when accept button is clicked.
             *     onClose: function() {} // runs when close button is clicked.
             * },
             */
            disclaimer: {
                layout: 'popup',
                style: 'slide-up',
                header: 'Cookies on this website.',
                description: 'We use cookies on company name/website to provide you with the best possible experience. If you wish to review the cookies we store, please select the Cookie Preferences option on this banner. After your preferences are saved, you can use the cookie icon at the left to modify your selections at any time. For more information, you can review our <a href="">Privacy</a> and <a href="#">Cookie policies</a>.',
                accept: 'Accept',
                control: 'Cookie Preferences',
                closeButton: true,
                onAccept: function() {},
                onClose: function() {}
            },
            /**
             * Sidebar tool object, comprises of text options, position and style options.
             * @type {object}
             * @example
             * preferences: {
             *     position: 'left', // 'left' - shows tool on the left screen. 'right' - shows tool on the right screen.
             *     header: 'This site uses cookies.',  // Main header text.
             *     description: 'Some of these cookies are essential while others improve your experience', // Tool description text.
             *     statement: { // statement object.
             *         description: 'For more information visit our', // description text.
             *         link: 'Privacy Statement', // link text.
             *         url: '/', // link url.
             *     },
             *     recommendedText: 'Accept Recommended Settings', // Recommended button text.
             *     necessaryHeader: 'Necessary Cookies', // Necessary header text.
             *     necessaryDescription: 'We use this so you see the site', // Necessary description text.
             *     thirdPartyHeader: 'Warning: Some cookies require your attention', // Third party warning header text.
             *     thirdPartyDescription: 'Consent for some third party cookies can not be automatically revoked. Please follow the link below if you want to opt out of them.', // Third party warning description text.
             * },
             */
            preferences: {
                position: 'left', //left/right
                header: 'This site uses cookies.',
                description: 'Some of these cookies are essential while others help us to improve your experience by providing insights into how the site is being used.',
                statement: {
                    description: 'For more detailed information on the cookies we use, please check our ',
                    link: 'Privacy Policy',
                    url: '/',
                },
                recommendedText: 'Accept Recommended Settings',
                necessaryHeader: 'Necessary Cookies',
                necessaryDescription: 'Necessary cookies enable core functionality. The website cannot function properly without these cookies, and can only be disabled by changing your browser preferences.',
                thirdPartyHeader: 'Warning: Some cookies require your attention',
                thirdPartyDescription: 'Consent for some third party cookies can not be automatically revoked. Please follow the link below if you want to opt out of them.',
            },
            /**
             * Color options for branding
             * @type {object}
             * @example
             * style: {
             *     disclaimer: {
             *         bgcolor: '',
             *         headerColor: '',
             *         textColor: '',
             *         acceptButtonColor: '',
             *         preferenceButtonColor: '',
             *         buttonTextColor: '',
             *         acceptButtonBorder: ''
             *         preferenceButtonBorder: ''
             *     },
             *     preference: {
             *         bgcolor: '',
             *         headerColor: '',
             *         textColor: '',
             *         acceptButtonColor:'',
             *         buttonTextColor: '',
             *         switchOnColor: '',
             *         switchOffColor: '',
             *         switchToggleColor: '',
             *         warningBG: '',
             *         warningBorderColor: '',
             *         warningHeaderColor: '',
             *         warningTextColor: ''
             *     }
             * },
             */
            style: {
                disclaimer: {
                    bgcolor: '',
                    headerColor: '',
                    textColor: '',
                    acceptButtonColor: '',
                    preferenceButtonColor: '',
                    buttonTextColor: '',
                    buttonBorder: ''
                },
                preference: {
                    bgcolor: '',
                    headerColor: '',
                    textColor: '',
                    acceptButtonColor: '',
                    buttonTextColor: '',
                    switchOnColor: '',
                    switchOffColor: '',
                    switchToggleColor: '',
                    warningBG: '',
                    warningBorderColor: '',
                    warningHeaderColor: '',
                    warningTextColor: ''
                }
            },
            /**
             * Array of objects (third-party plugins). This is where to add the third-party plugins that the tool controls
             * @type {object}
             * @example
             * name - name of plugin
             * label - category of plugin that is shown on the sidebar tool
             * description - description of the plugin
             * cookies - an array of cookies that the plugin sets. Required! This list will be deleted/try to be deleted when user revoke's the plugin
             * onByDefault - boolean whether the tool is automatically set by default (Most likely will only be applied to Google Analytics)
             * onAccept - callback function, this is where the script of the plugin should be added. See example
             * onRevoke - callback function, runs when plugin is turned off.
             * thirdPartyCookies - Object (name: third party cookie name, optOutLink: link to direct users to the opt out page of the plugin).
             * optionalCookies: [{
             *     name: 'googleAnalytics',
             *     label: 'Analytical Cookies',
             *     description: 'Analytical cookies help us to improve our website by collecting and reporting information on its usage.',
             *     cookies: ['_ga', '_gid', '_gat', '__utma', '__utmt', '__utmb', '__utmc', '__utmz', '__utmv', '_gat_Client'],
             *     onByDefault: true,
             *     onAccept: function() {
             *         window['ga-disable-UA-XXXXX-Y'] = false;
             *         (function(i, s, o, g, r, a, m) {
             *             i['GoogleAnalyticsObject'] = r;
             *             i[r] = i[r] || function() {
             *                 (i[r].q = i[r].q || []).push(arguments)
             *             }, i[r].l = 1 * new Date();
             *             a = s.createElement(o),
             *                 m = s.getElementsByTagName(o)[0];
             *             a.async = 1;
             *             a.src = g;
             *             m.parentNode.insertBefore(a, m)
             *         })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
             *         ga('create', 'UA-XXXXX-Y', 'auto');
             *         ga('send', 'pageview');
             *     },
             *     onRevoke: function() {
             *         // Disable Google Analytics
             *         window['ga-disable-UA-XXXXX-Y'] = true;
             *     }
             * },
             * {
             *     name: 'addToAny',
             *     label: 'Social Sharing Cookies (AddToAny)',
             *     description: 'We use some social sharing plugins, to allow you to share certain pages of our website on social media',
             *     cookies: ['__stid', '__unam', '__utma', '__utmz', '__uset', '__utmc', '_utmb', 'uvc', 'uuid', '_cfduid', 'page_services', '__atuvc', '__atuvs', 'di2', 'ouid', 'uid', 'vc'],
             *     onAccept: function() {
             *         var script = document.createElement("script");
             *         script.src = "//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-581b3669203a9a52";
             *         document.body.appendChild(script);
             *     },
             *     onRevoke: function() {
             *         console.log('addToAny onRevoke');
             *     },
             *     thirdPartyCookies: {
             *         name: "AddToAny",
             *         optOutLink: "https://www.addtoany.com/privacy"
             *     }
             * }],
             */
            optionalCookies: [],
            /**
             * How many days before the cookie expires when initially set.
             * @type {number}
             * @default
             */
            cookieRetention: 30,
            /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function(e) {}
        },
        _init: function() {
            var inst = this,
                o = this.options;

            inst._buildAnalyticsObj();
            inst._renderCookieMonster();
            inst._setCustomStyles();
            inst._bindListeners();
            inst._trigger('complete');
        },
        _buildAnalyticsObj: function() {
            var inst = this,
                o = this.options;

            if (o.googleUACode.length > 0) {
                var analytics = {
                    name: 'googleAnalytics',
                    label: 'Analytical Cookies',
                    description: 'Analytical cookies help us to improve our website by collecting and reporting information on its usage.',
                    cookies: ['_ga', '_gid', '_gat', '__utma', '__utmt', '__utmb', '__utmc', '__utmz', '__utmv', '_gat_Client'],
                    onByDefault: true,
                    onAccept: function() {
                        window['ga-disable-' + o.googleUACode] = false;
                        (function(i, s, o, g, r, a, m) {
                            i['GoogleAnalyticsObject'] = r;
                            i[r] = i[r] || function() {
                                (i[r].q = i[r].q || []).push(arguments)
                            }, i[r].l = 1 * new Date();
                            a = s.createElement(o),
                            m = s.getElementsByTagName(o)[0];
                            a.async = 1;
                            a.src = g;
                            m.parentNode.insertBefore(a, m)
                        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
                        ga('create', o.googleUACode, 'auto');
                        ga('send', 'pageview');
                    },
                    onRevoke: function() {
                        // Disable Google Analytics
                        window['ga-disable-' + o.googleUACode] = true;
                    }
                };
                o.optionalCookies.unshift(analytics);
                analytics.onAccept();
            };
        },
        _renderCookieMonster: function() {
            var inst = this,
                o = this.options;

            // show tool if no cookie is set and initState is set to 'open'
            var show = o.initState === 'open' && !inst._isCookiePresent() ? 'visible' : '';
            var cookiemonster = (
                '<div class="cm" aria-label="Cookie Consent Manager" aria-live="polite" role="dialog">' +
                '<div class="cm_overlay ' + show + '"></div>' +
                '</div>'
            );

            $(o.container).prepend(cookiemonster);

            var $cm = $('.cm');
            // logo box only shows if an image is declared
            if (o.logo !== '') {
                var logoTemplate = (
                    '<div class="cm_logo">' +
                    '<img src="' + o.logo + '" alt="Cookie Tool Logo" />' +
                    '</div>'
                );
                $cm.append(logoTemplate);
            }

            // show popup banner/box if no cookie is set and initState is set to 'disclaimer'
            if (o.initState === 'disclaimer' && !inst._isCookiePresent()) {
                $cm.append(inst._buildDisclaimerTpl());
                $('.cm_disclaimer').addClass('visible');
            }
            $cm.append(inst._buildPreferenceTpl(inst._getLocalStorage()));
        },
        _getLocalStorage: function() {
            var inst = this,
                o = this.options;

            var storageData = localStorage.getItem('q4-cookie-tool'),
                cookieExpiry = inst._getCookie("cookiemonster-gdpr"),
                now = new Date().getTime();

            // return local storage if exists, cookie is set and not expired.
            if (storageData !== null && cookieExpiry !== undefined && cookieExpiry >= now) {
                $.each(JSON.parse(storageData), function(key, val) {
                    $.each(o.optionalCookies, function(i, obj) {
                        if (obj.name === key) {
                            if (val.toggle === 'on') {
                                obj.onAccept();
                            } else {
                                obj.onRevoke();
                            }
                        }
                    });
                });
                return storageData;
            } else {
                localStorage.removeItem('q4-cookie-tool');
                return null;
            }
        },
        _buildPreferenceTpl: function(storageData) {
            var inst = this,
                o = this.options;

            var tpl = (
                '<div class="pref cm_sidebar cm_sidebar--{{position}} {{initialState}}">' +
                '<div class="pref_close-button cm_close-button"></div>' +
                '<div class="pref_main">' +
                '<h3 class="pref_heading">{{header}}</h3>' +
                '<div class="pref_description">{{{description}}}</div>' +
                '{{#statement}}' +
                '<div class="pref_statement">' +
                '<div class="pref_description">' +
                '{{{description}}}' +
                '{{#url}}<a href="{{url}}">{{link}}.</a>{{/url}}' +
                '</div>' +
                '</div>' +
                '{{/statement}}' +
                '<div class="pref_button">{{{recommendedText}}}</div>' +
                '</div>' +
                '<div class="pref_necessary">' +
                '<h4 class="pref_heading">{{{necessaryHeader}}}</h4>' +
                '<div class="pref_description">' +
                '{{{necessaryDescription}}}' +
                '</div>' +
                '</div>' +
                '<div class="pref_third-party optional">' +
                '{{#optional}}' +
                '<div class="optional_party optional_party--{{name}}">' +
                '<h4 class="pref_heading">{{{label}}}</h4>' +
                '<div class="optional_toggle">' +
                '<label class="optional_switch">' +
                    '<span class="sr-only">{{name}} option toggle on/off</span>' +
                    '<input aria-label="{{name}} option toggle on/off" class="optional_checkbox" {{#isToggled}}checked{{/isToggled}} type="checkbox">' +
                    '<span class="optional_slider {{#isToggled}}toggled{{/isToggled}}" data-id="{{dataID}}" data-name="{{name}}" data-toggle="{{toggle}}"></span>' +
                '</label>' +
                '</div>' +
                '<div class="pref_description">{{{description}}}</div>' +
                '{{#thirdPartyCookies}}' +
                '<div class="pref_opt-out">' +
                '<h4 class="pref_heading">{{{header}}}</h4>' +
                '<div class="pref_description">{{{description}}}</div>' +
                '<a class="pref_opt-out-link" href="{{url}}">{{{name}}}</a>' +
                '</div>' +
                '{{/thirdPartyCookies}}' +
                '</div>' +
                '{{/optional}}' +
                '</div>' +
                '</div>'
            );

            var data = o.preferences;
            data.optional = [];
            storageData = JSON.parse(storageData);
            data.initialState = o.initState === 'open' && !inst._isCookiePresent() ? 'visible' : '';

            $.each(o.optionalCookies, function(i, item) {
                if (storageData !== null) {
                    $.each(storageData, function(key, storage) {
                        if (item.name === key) {
                            item.dataID = storage.id;
                            item.toggle = storage.toggle;
                            if (storage.toggle === 'on') {
                                item.isToggled = true;
                            }
                        }
                    });
                } else {
                    item.dataID = i;
                    item.toggle = item.onByDefault ? 'on' : 'off';
                }
                if (item.thirdPartyCookies !== undefined) {
                    item.thirdPartyCookies.header = o.preferences.thirdPartyHeader;
                    item.thirdPartyCookies.description = o.preferences.thirdPartyDescription;
                }
                data.optional.push(item);
            });
            return Mustache.render(tpl, data);
        },
        _buildDisclaimerTpl: function() {
            var inst = this,
                o = this.options;

            var tpl = (
                '<div class="cm_disclaimer{{#layout}} cm_disclaimer-{{layout}}{{/layout}} {{#style}}{{style}}{{/style}}">' +
                '{{#closeButton}}<div class="cm_close-button"></div>{{/closeButton}}' +
                '<div class="cm_disclaimer-text">' +
                '<h3 class="cm_disclaimer-header">{{{header}}}</h3>' +
                '<p>{{{description}}}</p>' +
                '</div>' +
                '<div class="cm_disclaimer-buttons">' +
                '<div class="cm_button cm_button--accept">{{{accept}}}</div>' +
                '<div class="cm_button cm_button--preference">{{{control}}}</div>' +
                '</div>' +
                '</div>'
            );
            var data = {
                header: o.disclaimer.header,
                description: o.disclaimer.description,
                accept: o.disclaimer.accept,
                control: o.disclaimer.control,
                layout: o.disclaimer.layout,
                style: o.disclaimer.style
            };
            if (o.disclaimer.closeButton) data.closeButton = o.disclaimer.closeButton;
            return Mustache.render(tpl, data);
        },
        _setCustomStyles: function() {
            var styleObject = this.options.style,
                $cm = $('.cm');
            $sidebar = $('.cm_sidebar');

            $cm.find('.cm_button').css('color', styleObject.disclaimer.buttonTextColor);
            $cm.find('.cm_disclaimer-header').css('color', styleObject.disclaimer.headerColor);
            $cm.find('.cm_button--accept').css('background-color', styleObject.disclaimer.acceptButtonColor);
            $cm.find('.cm_button--preference').css('background-color', styleObject.disclaimer.preferenceButtonColor);
            $sidebar.find('.pref_heading').css('color', styleObject.preference.headerColor);
            $sidebar.find('.optional_slider').css('background-color', styleObject.preference.switchOffColor);
            $sidebar.find('.optional_slider.toggled').css('background-color', styleObject.preference.switchOnColor);
            $sidebar.find('.optional .pref_heading').css('color', styleObject.preference.warningHeaderColor);
            $sidebar.find('.optional .pref_description').css('color', styleObject.preference.warningTextColor);
            $sidebar.find('.cm_disclaimer').css({
                'background-color': styleObject.disclaimer.bgcolor,
                'color': styleObject.disclaimer.textColor
            });
            $sidebar.find('.pref_button').css({
                'color': styleObject.preference.buttonTextColor,
                'background-color': styleObject.preference.acceptButtonColor
            });
            $cm.find('.cm_button--accept').css({
                'border': styleObject.disclaimer.acceptButtonBorder
            });
            $cm.find('.cm_button--preference').css({
                'border': styleObject.disclaimer.preferenceButtonBorder
            });
            $sidebar.find('.pref_opt-out').css({
                'background-color': styleObject.preference.warningBG,
                'border': '1px solid' + styleObject.preference.warningBorderColor
            });
            $sidebar.css({
                'background-color': styleObject.preference.bgcolor,
                'color': styleObject.preference.textColor
            });
        },
        _optionFunctions: function(response, data) {
            var inst = this,
                o = this.options,
                storageData = {},
                $cm = $('.cm');

            switch (response) {
                case 'accept-all':
                    o.disclaimer.onAccept();
                    $.each(o.optionalCookies, function(i, oc) {
                        oc.onAccept();
                    });
                    $cm.find('.optional_toggle').each(function() {
                        $(this).find('.optional_checkbox').trigger('click');
                        $(this).find('.optional_slider').addClass('toggled').data('toggle', 'on');
                    });
                    break;
                case 'accept':
                    $.each(o.optionalCookies, function(i, oc) {
                        oc.name === data.name && oc.onAccept();
                    });
                    break;
                case 'decline':
                    $.each(o.optionalCookies, function(i, obj) {
                        if (obj.name === data.name) {
                            obj.onRevoke();
                            $.each(obj.cookies, function(i, cookie) {
                                inst._deleteCookie(cookie);
                            });
                        }
                    });
                    break;
                default:
                    break;
            }

            $cm.find('.optional_slider').each(function() {
                var toggleData = $(this).data();
                storageData[toggleData.name] = {
                    id: toggleData.id,
                    toggle: toggleData.toggle
                }
            });

            inst._setStorageData(storageData);
        },
        _setStorageData: function(data) {
            var inst = this;
            localStorage.setItem('q4-cookie-tool', JSON.stringify(data));
            inst._setToolCookie();
        },
        _deleteAllCookies: function() {
            var inst = this,
                cookies = document.cookie.split(";");

            for (var i = 0; i < cookies.length; i++) {
                if (!cookies[i].includes("cookiemonster-gdpr")) {
                    var cookie = cookies[i];
                    var eqPos = cookie.indexOf("=");
                    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + inst._wildCardDomain() + ';';
                    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + inst._wildCardDomain(true) + ';';
                }
            }
        },
        _deleteCookie: function(name) {
            if (name.indexOf('*') > -1) { // if cookie generates random characters
                var wildcardname = "^" + name.substr(0, name.length - 1);
                var pattern = new RegExp(wildcardname);
                $.each(Cookies.get(), function(cname) {
                    if (pattern.test(cname)) {
                        Cookies.remove(cname);
                    }
                });
            } else Cookies.remove('name');
        },
        _isCookiePresent: function() {
            var inst = this;
            return inst._getCookie("cookiemonster-gdpr") !== undefined;
        },
        _setToolCookie: function() {
            var inst = this,
                o = this.options;


            var cname = "cookiemonster-gdpr",
                cvalue = new Date().getTime() + (86400000 * o.cookieRetention),
                cdomain = window.location.hostname,
                cexpiry = o.cookieRetention;

            inst._setCookie(cname, cvalue, cdomain, cexpiry);
        },
        _setCookie: function(cname, cvalue, cdomain, cexpiry) {
            Cookies.set(cname, cvalue, {
                domain: cdomain,
                expires: cexpiry
            });
        },
        _getCookie: function(name) { //get cookie
            return Cookies.get(name);
        },
        _setTimeStamp: function() {
            var d = new Date();
            var month = d.getMonth() < 10 ? '0' + d.getMonth() : d.getMonth();
            var day = d.getDay() < 10 ? '0' + d.getDay() : d.getDay();
            var year = d.getFullYear().toString().substr(-2);

            return month + day + year;
        },
        _wildCardDomain: function(includeSubDomain) {
            if (includeSubDomain === undefined) {
                includeSubDomain = false;
            }
            var domaintouseforcookie = document.domain;

            // We cannot explicitly specify domain if it doesn't have any dots in it
            if (domaintouseforcookie.indexOf('.') < 0 || domaintouseforcookie.indexOf("127.") === 0) {
                domaintouseforcookie = "";
            } else {
                if (includeSubDomain) {
                    domaintouseforcookie = "." + domaintouseforcookie;
                } else {
                    // We are going to be setting cookie for parent domain
                    var splitDomains = domaintouseforcookie.split(".");
                    splitDomains[0] = "";
                    domaintouseforcookie = splitDomains.join(".");
                }
            }
            return domaintouseforcookie;
        },
        _bindListeners: function() {
            var inst = this,
                o = this.options,
                $cm = $('.cm');

            $cm.find('.optional_slider[data-toggle="on"]').addClass('toggled').prev().trigger('click');

            $cm.on('click', '.cm_button--accept', function() {
                $(this).closest('.cm_disclaimer').removeClass('visible');
                o.disclaimer.onAccept();
                o.disclaimer.onClose();

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'popup-accept-button');

            });

            $cm.on('click', '.cm_button--preference', function() {
                $(this).closest('.cm_disclaimer').removeClass('visible');
                $(this).closest('.cm_disclaimer').next().addClass('visible');
                $cm.find('.cm_overlay').addClass('visible');
                o.disclaimer.onClose();

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'preference-window');
            });

            $cm.on('click', '.cm_logo', function() {
                $cm.find('.cm_sidebar, .cm_overlay').toggleClass('visible');

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'cm logo');
            });

            $cm.on('click', '.pref_close-button', function() {
                $cm.find('.visible').removeClass('visible');
                !inst._isCookiePresent() && o.acceptOnClose && inst._optionFunctions('accept-all');

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'close-button');
            });

            $cm.on('click', '.cm_overlay', function() {
                $(this).hasClass('visible') && $cm.find('.visible').removeClass('visible');
                !inst._isCookiePresent() && o.acceptOnClose && inst._optionFunctions('accept-all');
            });

            $cm.on('click', '.pref_main .pref_button, .cm_button--accept', function() {
                !inst._isCookiePresent() && inst._optionFunctions('accept-all');
                $cm.find('.visible').removeClass('visible');

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'accept-recommended');
            });

            $cm.on('click', '.cm_disclaimer .cm_close-button', function() {
                $(this).parent().removeClass('visible');

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'popup-close-button');
            });

            $cm.on('click', '.optional_slider', function() {

                var $optOutContainer = $(this).closest('.optional_party').find('.pref_opt-out');
                $(this).toggleClass('toggled');

                if (!$(this).hasClass('toggled')) {
                    $(this).data('toggle', 'off');
                    $optOutContainer.addClass('visible');
                    inst._optionFunctions('decline', $(this).data());

                    inst._sendAnalytics('Q4 Cookie Tool', 'toggled', $(this).data('name') + '- off');

                } else {
                    $(this).data('toggle', 'on');
                    $optOutContainer.removeClass('visible');
                    inst._optionFunctions('accept', $(this).data());

                    inst._sendAnalytics('Q4 Cookie Tool', 'toggled', $(this).data('name') + '- on');
                }
            });

            $cm.on('click', '.pref_main a, .pref_necessary a', function() {
                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'privacy-policy-link');
            });

            $cm.on('click', '.pref_opt-out a', function() {
                var thirdPartyName = $(this).closest('.optional').find('[data-name]').data('name');

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'optout-link--' + thirdPartyName);
            });

            $(o.triggerClass).on('click', function(e) {
                e.preventDefault();
                $('.cm_overlay, .cm_sidebar').addClass('visible');

                inst._sendAnalytics('Q4 Cookie Tool', 'clicked', 'tool-link');
            });
        },
        _sendAnalytics: function(category, action, label) {

            if (typeof ga === 'undefined') {
                return;
            } else {
                ga('send', 'event', category, action, label);
            }
        }
    });
})(jQuery);

/**
 * Minified by jsDelivr using UglifyJS v3.4.4.
 * Original file: /npm/js-cookie@2.2.0/src/js.cookie.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
! function(e) {
    var n = !1;
    if ("function" === typeof define && define.amd && (define(e), n = !0), "object" === typeof exports && (module.exports = e(), n = !0), !n) {
        var o = window.Cookies,
            t = window.Cookies = e();
        t.noConflict = function() {
            return window.Cookies = o, t
        }
    }
}(function() {
    function g() {
        for (var e = 0, n = {}; e < arguments.length; e++) {
            var o = arguments[e];
            for (var t in o) n[t] = o[t]
        }
        return n
    }

    return function e(l) {
        function C(e, n, o) {
            var t;
            if ("undefined" !== typeof document) {
                if (1 < arguments.length) {
                    if ("number" === typeof(o = g({
                        path: "/"
                    }, C.defaults, o)).expires) {
                        var r = new Date;
                        r.setMilliseconds(r.getMilliseconds() + 864e5 * o.expires), o.expires = r
                    }
                    o.expires = o.expires ? o.expires.toUTCString() : "";
                    try {
                        t = JSON.stringify(n), /^[\{\[]/.test(t) && (n = t)
                    } catch (e) {}
                    n = l.write ? l.write(n, e) : encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent), e = (e = (e = encodeURIComponent(String(e))).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)).replace(/[\(\)]/g, escape);
                    var i = "";
                    for (var c in o) o[c] && (i += "; " + c, !0 !== o[c] && (i += "=" + o[c]));
                    return document.cookie = e + "=" + n + i
                }
                e || (t = {});
                for (var a = document.cookie ? document.cookie.split("; ") : [], s = /(%[0-9A-Z]{2})+/g, f = 0; f < a.length; f++) {
                    var p = a[f].split("="),
                        d = p.slice(1).join("=");
                    this.json || '"' !== d.charAt(0) || (d = d.slice(1, -1));
                    try {
                        var u = p[0].replace(s, decodeURIComponent);
                        if (d = l.read ? l.read(d, u) : l(d, u) || d.replace(s, decodeURIComponent), this.json) try {
                            d = JSON.parse(d)
                        } catch (e) {}
                        if (e === u) {
                            t = d;
                            break
                        }
                        e || (t[u] = d)
                    } catch (e) {}
                }
                return t
            }
        }

        return (C.set = C).get = function(e) {
            return C.call(C, e)
        }, C.getJSON = function() {
            return C.apply({
                json: !0
            }, [].slice.call(arguments))
        }, C.defaults = {}, C.remove = function(e, n) {
            C(e, "", g(n, {
                expires: -1
            }))
        }, C.withConverter = e, C
    }(function() {})
});
//# sourceMappingURL=/sm/31d5cd1b58ce5e6231e4ea03a69b2801a53e76e98152bc29dc82a494ed0a1ee6.map