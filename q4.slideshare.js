(function($) {
    /**
    * Slideshare
    * @class q4.slideshare
    * @version 1.0.1
    */
    $.widget("q4.slideshare", /** @lends q4.slideshare */ {
        options: {
            username: '',
            related: 0,
            limit: 1,
            downloadText: 'Download',
            width: null,
            height: null,
            size: null,
            dateFormat: 'MM dd, yy',
            autoLoad: true,
            buildList: false,
            afterListLoads: false,
            afterSlideShowLoads: false,
            tags: [],
            loader: '//q4widgets.q4web.com/slideshare/images/loader.gif'
        },

        _create: function() {
            var inst = this,
                loader = inst.options.loader;

            if (loader.length) {
                inst.element.append('<img class="loader" src="'+loader+'" alt="loading" />');
            }

            //inst.getSlides();
            inst.getSlideRSS();
        },

        getSlideRSS: function() {
            var inst = this, o = this.options;

            $.ajax({
                type: "GET",
                url: 'https://api.q4web.com/q4proxy/v1/?alias=' + o.username + '-slideshare',
                dataType: 'xml'
            }).done(function(xml){
                if($(xml).find('channel item').length && o.autoLoad){
                    inst.buildSlideShow( $(xml).find('channel item:first link').text() );
                }
            });
        },

        getSlides: function() {
            var inst = this,
                o = inst.options,
                tags = (o.tags.length) ? '?tag='+o.tags[0]+'&callback=?' :'?callback=?';
            // fetch slideshare list
            $.getJSON('//q4modules.herokuapp.com/slideshare/rss/getRssByUser/' + o.username + tags, function(data) {
                if(data.length && o.autoLoad){
                    inst.buildSlideShow(data[0].link);
                }
                // build list
                if (data.length && o.buildList) {
                    inst.buildList(data);
                }

            });
        },

        buildList: function(list) {
            var inst = this;
            var o = inst.options;
            var listHTML = [];

            $.each(list, function(index, slide) {
                var slideDate = $.datepicker.formatDate(inst.options.dateFormat, new Date(slide.published));
                var body = slide.content;
                listHTML.push([
                    '<li><h3><a target="_blank"  href="'+slide.link+'">'+slide.title+'</a></h3>',
                    '<span class="date">'+slideDate+'</span>',
                    '<div class="body">'+body+'</div>',
                    '</li>'
                ].join(''));
            });
            
            if(o.limit){
               listHTML = listHTML.slice(0, o.limit);
            }

            $('<ul class="slideShareList" />').html(listHTML.join('')).appendTo(inst.element);
            $('.loader', inst.element).hide();

            if (typeof o.afterListLoads === 'function') {
                o.afterListLoads();
            }
        },

        buildSlideShow: function(url) {
            var inst = this;
            var o = inst.options;

            var slideUrl = '//www.slideshare.net/api/oembed/2?url=' + url;
            var $slideShow = $('<div class="slideshow"></div>').appendTo(inst.element);

            $.getJSON(slideUrl+'&format=jsonp&callback=?', function(oembed) {
                var iframe = $(oembed.html).filter('iframe'),
                    src = iframe.attr('src');

                    iframe.attr('src', src + '?rel=' + o.related);
                if (o.size !== null && o.size.hasOwnProperty('width') && o.size.hasOwnProperty('height')) {
                    iframe.attr({width: o.size.width, height: o.size.height});
                } else {
                    if (o.width !== null) {
                        iframe.attr('width', o.width);
                    }
                    if (o.height !== null) {
                        iframe.attr('height', o.height);
                    }
                }
                $slideShow.html(iframe);
                $('.loader', inst.element).hide();

                if (typeof o.afterSlideShowLoads === 'function') {
                    o.afterSlideShowLoads();
                }
            });
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
    });

})(jQuery);
