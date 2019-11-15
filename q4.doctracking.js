;(function (window, $, undefined) {
    /**
     * Small plugin used for document tracking w/ Google Analytics
     * @class q4.doctracking
     * @version 1.0.3
    */

    // jQuery not found
    if (undefined === $) {
        return;
    }

    $(function () {
        var fileTypes,
            domainRegex,
            cdnRegex,
            httpRegex,
            baseHref,
            baseTag,
            currentPageMatches,
            currentDomain;

        // Fix for IE8
        window.hasOwnProperty = window.hasOwnProperty || Object.prototype.hasOwnProperty;

        // Check for Google Analytics
        if (!window.hasOwnProperty('ga')) {
            return;
        }

        baseHref = '';
        fileTypes = /\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|mp4|txt|rar|html|wma|mov|avi|wmv|flv|wav)(\?.*)?$/i;
        domainRegex = /^https?:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i;
        httpRegex = /^https?\:\/\//i;
        cdnRegex = /.*\.cloudfront\.net$/i;
        currentPageMatches = window.location.href.match(domainRegex);
        currentDomain = currentPageMatches.length > 0 ? currentPageMatches[1] : false;
        baseTag = $('base');

        if (baseTag.length > 0 && baseTag.attr('href') !== undefined) {
            baseHref = baseTag.attr('href');
        }

        $('body').on('click', 'a', function(event) {
            var el,
                elEv,
                href,
                domainMatches,
                linkDomain,
                isSiteDomain,
                extensionMatch;

            el = $(this);
            href = el.attr('href') || '';

            // Don't do anything with javascript links
            if (href.match(/^javascript:/i)) {
                return;
            }

            // Extract domain from link
            domainMatches = href.match(domainRegex);

            // Set link domain to the current if nothing matched (e.g. relative URL, tel/mailto)
            linkDomain = null !== domainMatches ? domainMatches[1] : currentDomain;

            // Does the domain match, or is this a CDN
            isSiteDomain = linkDomain === currentDomain || cdnRegex.test(linkDomain) || linkDomain.toLowerCase().indexOf('q4cdn') > -1;

            // Event defaults
            elEv = {
                value: 0,
                non_i: false,
                action: 'click',
                loc: href
            };

            if (href.match(/^mailto\:/i)) {
                // Email links
                elEv.category = 'email';
                elEv.label = href.replace(/^mailto\:/i, '');
            } else if (href.match() && !isSiteDomain) {
                // External downloads always have http[s]
                elEv.category = 'external';
                elEv.label = href.replace(httpRegex, '');
                elEv.non_i = true;
            } else if (null !== (extensionMatch = href.match(fileTypes))) {
                // Matches a filetype we care about (extensionMatch[1] is the type)                
                elEv.category = 'download';
                elEv.action = 'download';
                elEv.label = href.replace(/ /g,'-').replace(httpRegex, '');
                // Only add the base ref if its not a CDN link, or if the link is relative
                elEv.loc = (cdnRegex.test(linkDomain) ? '' : baseHref) + href;
            } else if (href.match(/^tel\:/i)) {
                // iOS tel:// links
                elEv.category = 'telephone';
                elEv.action = 'click';
                elEv.label = href.replace(/^tel\:/i, '');
            } else {
                return;
            }

            window.ga('send','event', elEv.category, elEv.action, elEv.label.toLowerCase(), elEv.value,{'nonInteraction': elEv.non_i});
            window.ga('Client.send','event', elEv.category, elEv.action, elEv.label.toLowerCase(), elEv.value,{'nonInteraction': elEv.non_i});
        });
    });
})(window, window.jQuery);