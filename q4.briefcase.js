(function($) {
    /**
     * <p>The investor briefcase widget works similar to a shopping cart. The briefcase is a 'shopping cart' for various PDF files across a site.</p>
     * <h4 style="color: red;">Important Notes: </h4>
     * <ol>
     *     <li>Currently only PDF files are supported for the briefcase.</li>
     *     <li>This widget requires a MODERN BROWSER, and the download functionality does not work correctly on mobile (current solution is hiding the download container on mobile screen sizes).</li>
     *     <li>This widget uses browser session storage to collect files, any items in the briefcase (aka shopping cart) will be removed upon closing the tab or window, and will not exist in new tab/windows.</li>
     *     <li>The briefcase.js script is required on all pages that the briefcase icon is desired, as well as the briefcase page (aka checkout page).</li>
     *     <li>The JSZip, JSZip-Utils and FileSaver script are only required on the briefcase page (aka checkout page), as they are used to generate the ZIP file.</li>
     * </ol>
     * <p>&nbsp;</p>
     * <h4>Instructions:</h4>
     * <ol>
     *     <li>A class should be added to the container element of all modules/widgets which require the briefcase icon. For example, the class could be called 'add-to-briefcase' and be listed in the module properties 'CSS Class' field.</li>
     *     <li>Additional data attributes must be added to the module/widget container that is referenced via class through the 'contentClass' option. <br>
            data-briefcase-title should reference the class of the title container for that content item (used for the name of the file in the briefcase)<br>
            data-briefcase-subtitle (optional) should reference the class of a unique descriptor for that content item (used alongside title for the name of the file in the briefcase)<br>
            data-briefcase-name should reference the type of content that items in that container should be categorized as (used for grouping and folder structure).</li>
     * </ol>
     * <p>&nbsp;</p>
     * @class q4.briefcase
     * @version 1.0.5
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [JSZip.js](lib/jszip.min.js)
     * @requires [JSZip-Utils.js](lib/jszip-utils.min.js)
     * @requires [FileSaver.js](lib/file-saver.min.js)
     * @example
     * <div class="module module-news add-to-briefcase" data-briefcase-name="News" data-briefcase-title=".module_headline-link">
     *     <div class="module_container module_container--outer">
     *         <h2 class="module_title"><span class="ModuleTitle">Press Releases</span></h2>
     *         <div class="module_container module_container--inner">
     *             <div class="module_container module_container--content">
     *                 <div class="module_item">
     *                     <div class="module_date-time">
     *                         <span class="module_date-text">January 16, 2017</span>
     *                     </div>
     *                     <div class="module_headline">
     *                         <a href="http://website.com/ir/news/details/2017/Press-Release-1/default.aspx" class="module_headline-link">Press Release 1</a>
     *                     </div>
     *                     <div class="module_links">
     *                         <a href="http://website.com/files/doc_news/release1.pdf" class="module_link">
     *                             <i class="q4-icon_pdf"></i>
     *                             <span class="module_link-text">Download</span>
     *                             <span class="sr-only">PDF format download (opens in new window)</span>
     *                         </a>
     *                         <a class="module_link module-briefcase_link" href="http://website.com/files/doc_news/release1.pdf">
     *                             <i class="q4-icon_briefcase-line"></i><span class="sr-only">Add to Briefcase</span>
     *                         </a>
     *                     </div>
     *                 </div>
     *                 <div class="module_item">
     *                     <div class="module_date-time">
     *                         <span class="module_date-text">January 2, 2017</span>
     *                     </div>
     *                     <div class="module_headline">
     *                         <a href="http://website.com/ir/news/details/2017/Press-Release-2/default.aspx" class="module_headline-link">Press-Release-2</a>
     *                     </div>
     *                     <div class="module_links">
     *                         <a href="http://website.com/files/doc_news/release2.pdf" class="module_link">
     *                             <i class="q4-icon_pdf"></i>
     *                             <span class="module_link-text">Download</span>
     *                             <span class="sr-only">PDF format download (opens in new window)</span>
     *                         </a>
     *                         <a class="module_link module-briefcase_link" href="http://website.com/files/doc_news/release2.pdf">
     *                             <i class="q4-icon_briefcase-line"></i><span class="sr-only">Add to Briefcase</span>
     *                         </a>
     *                     </div>
     *                 </div>
     *             </div>
     *         </div>
     *     </div>
     * </div>
     * @example
     * <div class="module module-presentation background--grey add-to-briefcase" data-briefcase-name="Presentations" data-briefcase-title=".module_headline-text">
     *     <div class="module_container module_container--outer">
     *         <h2 class="module_title"><span class="ModuleTitle">Presentation Archive</span></h2>
     *         <div class="module_container module_container--inner">
     *             <div class="module_container module_container--content">
     *                 <div class="module_item">
     *                     <div class="module_date-time">
     *                         <span class="module_date-text">February 1, 2017</span>
     *                     </div>
     *                     <div class="module_headline">
     *                         <span class="module_headline-text">Presentation of Important Event</span>
     *                     </div>
     *                     <div class="module_links">
     *                         <a href="http://website.com/files/doc_downloads/presentation.pdf" target="_blank" class="module_link module-presentation_document">
     *                             <i class="q4-icon_pdf"></i>
     *                             <span class="module_link-text">View this Presentation</span>
     *                             <span class="sr-only">PDF Format Download (opens in new window)</span>
     *                             <span class="module_file-text">PDF 4 KB</span>
     *                         </a>
     *                         <a class="module_link module-briefcase_link" href="http://website.com/files/doc_downloads/presentation.pdf">
     *                             <i class="q4-icon_briefcase-line"></i><span class="sr-only">Add to Briefcase</span>
     *                         </a> 
     *                     </div>
     *                 </div>
     *             </div>
     *         </div>
     *     </div>
     * </div>
     */
    $.widget("q4.briefcase", /** @lends q4.briefcase */ {
        options: {
            /**
             * The class of the briefcase container element. Items added to the briefcase will be rendered inside this container using the 'briefcaseTpl' and 'emptyBriefcaseTpl'.
             * @type {string}
             * @default
             */
            briefcaseContentContainer: '.module-briefcase_container--content',
            /**
             * The class of the briefcase download container. The 'downloadTpl' will be used to render content in this container.
             * @type {string}
             * @default
             */
            briefcaseDownloadContainer: '.module-briefcase_container--download',
            /**
             * The class of the module or widget container which has the data-briefcase-name and data-briefcase-title attributes.
             * @type {string}
             * @default
             */
            contentClass: '.module',
            /**
             * The container class of the item in the module or widget which contains the file, name, icon etc..
             * @type {string}
             * @default
             */
            contentItemClass: '.module_item',
            /**
             * The selector used on each file link that should have the potential to be added to the briefcase.
             * @type {string}
             * @default
             */
            fileSelector: 'a.module_link[href$=".pdf"], a.module_link[href$=".PDF"], a.module_link[href$=".Pdf"]',
            /**
             * The class to be added to the file link identifying it as a briefcase-capable link.
             * @type {string}
             * @default
             */
            briefcaseCls: '.module-briefcase_link',
            /**
             * The class to be added to the file selector for items existing in the briefcase.
             * @type {string}
             * @default
             */
            activeCls: '.js--active',
            /**
             * The icon class to be added for items existing in the briefcase. This is used to change the appearance of the icon.
             * @type {string}
             * @default
             */
            inBriefcaseCls: '.q4-icon_briefcase-fill',
            /**
             * The icon class to be added for items that do not exist in the briefcase. This is used to change the appearance of the icon.
             * @type {string}
             * @default
             */
            notInBriefcaseCls: '.q4-icon_briefcase-line',
            /**
             * The template to be appended to each item to show the add to briefcase link/icon. 
             * @param url  {string} - the URL of the file, as defined by 'fileSelector' option
             * @param cls {string} - the class defined by 'briefcaseCls'
             * @type {string}
             * @example
             * '<a class="module_link {{cls}}" href="{{url}}">' +
             *      '<i class="q4-icon_briefcase-line"></i>' +
             *      '<span class="sr-only">Add to Briefcase</span>' +
             *  '</a>'
             */
            iconTpl: (
                '<a class="module_link {{cls}}" href="{{url}}">' +
                    '<i class="{{briefcaseIcon}}"></i>' +
                    '<span class="sr-only">Add to Briefcase</span>' +
                '</a>'
            ),
            /**
             * The template used to render the existing briefcase items on a page. Template content is rendered inside the 'briefcaseContentContainer'.
             * @param url  {string} - the URL of the file, as defined by 'fileSelector' option
             * @param title {string} - the title of the document/content item
             * @param name {string} - the name of the briefcase file group. Pulled from the container element's data tag (ex. "Press Release")
             * @type {string}
             * @example
             * '<div class="module_item briefcase_content--section">' +
             *     '<h4>{{name}}</h4>' +
             *     '<ul data-briefcase-name="{{name}}">' +
             *         '{{#items}}' +
             *             '<li>' +
             *                 '<span>{{title}}</span>' +
             *                 '<a href="{{url}}" class="module_link module-briefcase_download">' +
             *                     '<i class="q4-icon_pdf"></i>' +
             *                     '<span class="sr-only">PDF format download (opens in new window)</span>' +
             *                 '</a>' +
             *                 '<a href="#!remove" class="module_link module-briefcase_remove">' +
             *                     '<i class="q4-icon_cross"></i>' +
             *                     '<span class="sr-only">Remove from briefcase</span>' +
             *                 '</a>' +
             *             '</li>' +
             *         '{{/items}}' +
             *     '</ul>' +
             * '</div>'
             */
            briefcaseTpl: (
                '<div class="module_item briefcase_content--section">' +
                    '<h4>{{name}}</h4>' +
                    '<ul data-briefcase-name="{{name}}">' +
                        '{{#items}}' +
                            '<li>' +
                                '<span>{{#title}}{{title}}{{/title}}</span>'+ 
                                '<span>{{#subtitle}}{{subtitle}}{{/subtitle}}</span>' +
                                '<a href="{{url}}" class="module_link module-briefcase_download">' +
                                    '<i class="q4-icon_pdf"></i>' +
                                    '<span class="sr-only">PDF format download (opens in new window)</span>' +
                                '</a>' +
                                '<a href="#!remove" class="module_link module-briefcase_remove">' +
                                    '<i class="q4-icon_cross"></i>' +
                                    '<span class="sr-only">Remove from briefcase</span>' +
                                '</a>' +
                            '</li>' +
                        '{{/items}}' +
                    '</ul>' +
                '</div>'

            ),
            /**
             * The template used when there are no briefcase items. Template content is rendered inside the 'briefcaseContentContainer'.
             * @type {string}
             * @default
             */
            emptyBriefcaseTpl: '<p>There are currently no items in your briefcase.</p>',
            /**
             * The class for the briefcase name group as seen in the briefcaseTpl. The element with this class should also have a data attribute for the briefcase name.
             * @type {string}
             * @default
             */
            removeFromBriefcaseGroupCls: 'ul',
            /**
             * The class for the briefcase item inside a group, as seen in the briefcaseTpl.
             * @type {string}
             * @default
             */
            removeFromBriefcaseItmCls: 'li',
            /**
             * The name of the ZIP file that is generated after triggering the download.
             * @type {string}
             * @default
             */
            zipFileName: 'briefcase-files.zip',
            /**
             * The class of the download button, this button must be inside the 'downloadTpl'.
             * @type {string}
             * @default
             */
            downloadButton: '.button',
            /**
             * The message that appears after clicking the download button (it can take a few seconds depending on the number of files). 
             * The message will be rendered inside the 'briefcaseDownloadContainer'. Once the file save has been triggered, the container will revert 
             * back to its previous appearance and render the 'downloadTpl'. This is to prevent additional 'clicks' on the download button while the ZIP file is generating.
             * @type {string}
             * @default
             */
            downloadingMessage: (
                '<p class="module_loader"><i class="q4-icon_spinner"></i><span class="sr-only">Downloading files...</span></p>'
            ),
            downloadTpl: (
                '<button class="button">Download All</button>' +
                '<span>All briefcase files will download in a single ZIP file.</span>'
            )
        },

        _session: null,

        _create: function() {

            if( !window.sessionStorage ) {
                return
            }

            var inst = this, o = inst.options;

            inst._session = Storages.sessionStorage;
            
            if (inst._session.get('briefcase') === null) {
                inst._session.set('briefcase', {});
            }

            inst._renderBriefcase();
            inst._onDownloadClick();
            inst._onRemoveFromBriefcase();
            inst._onBriefcaseClick();
        },

        _init: function() {
            var inst = this;

            inst._addIcons();
        },

        _addIcons: function() {  // render the briefcase icons, start check for current briefcase icons, start tracking clicks
            var inst = this, o = inst.options;

            if( !inst.element.children().hasClass(o.briefcaseContentContainer.replace('.', '')) ) { // dont add the icon to items already in the briefcase container
                inst.element.each(function(){
                    var data = $(this).data();

                    $(this).find( o.fileSelector ).each( function(i, item){
                        $(item).after( 
                            Mustache.render( o.iconTpl, {
                                url: $(this).attr('href'),
                                cls: o.briefcaseCls.replace('.', ''),
                                briefcaseIcon: o.notInBriefcaseCls.replace('.', '')
                            })
                        );
                    });
                });

                inst._setStore();
            }

        },

        _setStore: function() { // add the class to any current briefcase items
            var inst = this, o = inst.options,
                sections = inst._session.get('briefcase');

            $.each(sections, function(sectionName, sectionItems){
                $.each(sectionItems, function(i, item){
                    $(item.element)
                        .find('a[href="'+ item.url +'"]')
                        .filter(o.briefcaseCls)
                        .addClass( o.activeCls.replace('.', '') )
                        .find('i')
                        .removeClass( o.notInBriefcaseCls.replace('.', '') )
                        .addClass( o.inBriefcaseCls.replace('.', '') );
                });
            });
        },

        _onBriefcaseClick: function() { 
            var inst = this, o = inst.options;

            inst.element.on('click', o.briefcaseCls, function(e){
                e.preventDefault();

                var $item = $(this),
                    data = $item.closest(o.contentClass).data(),
                    briefcase = inst.getBriefcase(data.briefcaseName);

                if ($item.hasClass( o.activeCls.replace('.', '') )) {
                    inst._removeFromStorage( $item, briefcase, data.briefcaseName );
                } else {
                    inst._addToStorage( $item, briefcase, data );
                }
            });
        },

        _addToStorage: function( $item, briefcase, data ) {
            var inst = this, o = inst.options;

            if ( !inst.existInBriefcase( briefcase, $item.attr('href') ) ) {
                $item
                    .addClass( o.activeCls.replace('.', '') )
                    .find('i')
                    .removeClass( o.notInBriefcaseCls.replace('.', '') )
                    .addClass( o.inBriefcaseCls.replace('.', '') );

                briefcase.push({
                    element: '.' + $item.closest(o.contentClass).attr('class').replace(/ /g, "."),
                    title: $item.closest(o.contentItemClass).find(data.briefcaseTitle).text().trim(),
                    subtitle: $item.parent().find(data.briefcaseSubtitle).text().trim(),
                    url: $item.attr('href'),
                    group: data.briefcaseName
                });
                inst._session.set('briefcase.' + data.briefcaseName, briefcase );
            }
        },

        _removeFromStorage: function( $item, briefcase, type ) {
            var inst = this, o = inst.options;

            $item
                .removeClass( o.activeCls.replace('.', '') )
                .find('i')
                .removeClass( o.inBriefcaseCls.replace('.', '') )
                .addClass( o.notInBriefcaseCls.replace('.', '') );

            inst._session.set('briefcase.' + type, briefcase.filter(function (item) {
                return (item.url !== $item.attr('href'));
            }));
        },

        getBriefcase: function( type ) {
            var briefcase = [];

            if ( this._session.get('briefcase.' + type ) !== undefined ) {
                briefcase = this._session.get('briefcase.' + type );
            }

            return briefcase;
        },

        existInBriefcase: function( briefcase, url ) {
            var filterBriefcase = briefcase.filter(function (item) {
                return (item.url === url);
            });

            return filterBriefcase.length;
        },

        _onRemoveFromBriefcase: function() {
            var inst = this, o = inst.options;

            inst.element.on('click', '.module-briefcase_remove', function(e){
                e.preventDefault();

                var $item = $(this),
                    $container = $item.closest(o.removeFromBriefcaseGroupCls);

                inst._removeFromStorage( 
                    $item.closest(o.removeFromBriefcaseItmCls).find('.module-briefcase_download'),
                    inst.getBriefcase( $container.data('briefcaseName') ),
                    $container.data('briefcaseName')
                );

                inst._renderBriefcase();
            });
        },

        isEmpty: function(map) {
            var count = 0;

            for(var key in map) {
                if (!map[key].length) delete map[key]; // remove any groups with no items
            }

            $.each(map, function(i, group){ // count the number of groups
                count++;
            });

            if (count == 0) return true; // if there are no groups, the briefcase must be empty
        },

        _renderBriefcase: function() {
            var inst = this, o = inst.options,
                briefcase = inst._session.get('briefcase'),
                briefcaseItems = [];

            if ( inst.isEmpty(briefcase) ) {
                $(o.briefcaseContentContainer).html( o.emptyBriefcaseTpl );
                $(o.briefcaseDownloadContainer).html('');
            } else {
                $.each(briefcase, function(sectionName, sectionItems){
                    if ( sectionItems.length ) {
                        briefcaseItems.push( Mustache.render(o.briefcaseTpl, {
                            name: sectionName,
                            items: sectionItems
                        }));
                    }
                });
                $(o.briefcaseContentContainer).html( briefcaseItems.join('') );
                $(o.briefcaseDownloadContainer).html( Mustache.render( o.downloadTpl ) );
            }
        },

        _onDownloadClick: function() {
            var inst = this, o = inst.options;

            $(o.briefcaseDownloadContainer).on('click', o.downloadButton, function(e) {
                var briefcase = inst._session.get('briefcase');
                if ( !inst.isEmpty(briefcase) ) {
                    e.preventDefault();
                    inst.triggerDownloads(briefcase)
                }
            });
        },

        triggerDownloads: function(briefcase) {
            var inst = this, o = inst.options,
                briefcaseItems = [],
                zip = new JSZip(),
                count = 0, folder;

            $(o.briefcaseDownloadContainer).html( Mustache.render( o.downloadingMessage) );


            $.each(briefcase, function(sectionName, sectionItems){
                folder = zip.folder(sectionName);
                $.each(sectionItems, function(i, items){
                    briefcaseItems.push(items)
                });
            });

            briefcaseItems.forEach(function(item){
                var filename = item.title.replace(/[^\w\s]/gi, '') + '.pdf'; // remove any punctuation and special characters for the file name

                JSZipUtils.getBinaryContent(item.url, function (err, data) {
                    if(err) throw err; // or handle the error

                    zip.file(item.group + "/" + filename, data, {binary:true}); // add the file to the folder defined in item.group

                    count++;

                    if (count == briefcaseItems.length) { // trigger the download after all files are in the zip
                        zip.generateAsync({type:'blob'}).then(function(content) {
                            saveAs(content, o.zipFileName);
                            $(o.briefcaseDownloadContainer).html( Mustache.render( o.downloadTpl) );
                        });
                    }

                });
            });

        },

        destroy: function() {
            Storages.removeAllStorages();
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);