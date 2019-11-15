(function($) {
    /**
     * Small plugin used for adding events to different calendar types
     * @class q4.addToCalendar
     * @version 1.0.4
    */
    $.widget("q4.addToCalendar", {
        options: {
            listSelector: '.calendarList',
            buttonSelector: '.q4-atc-button',
            tooltip: false,
            fancybox: false,
            tpl: function(listHTML){
                return (
                    '<div class="q4-atc-wrapper">' +
                        '<a href="#!" class="q4-atc-button">Add to Calendar</a>' +
                        '<div class="q4-atc-outer" style="display: none;">' +
                            '<div class="q4-atc-inner">' +
                                '<div class="q4-atc-inner-details">' +
                                    '<div class="q4-atc-title">Select your Calendar</div>' +
                                    listHTML +
                                '</div>' +
                                '<div class="q4-atc-tooltip" style="display: none;">' +
                                    '<span class="q4-atc-tooltip-text"></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                )
            }
        },

        _init: function() {
            var inst = this, o = inst.options;

            inst._buildHTML();
            inst._onClickToAdd();

            if (!o.fancybox) {
                inst._closeAddToCalendar();
                if (o.tooltip) {
                    inst._onIconHover(inst.element);
                }
            }
            
            inst._onWindowResize(function () {
                inst._clearPopups();
            });
        },

        _closeAddToCalendar: function() {
            var inst = this;
            $(document).on('click', function (e) {
                if ($(e.target).closest('.AddToCalendar').length === 0) {
                    inst._clearPopups();
                }
            });
        },

        _buildHTML: function() {
            var inst = this;

            inst.element.find(inst.options.listSelector).each(function () {
                var $_list = $(this);

                $_list.addClass('q4-atc-links');
                $_list.find('a span').addClass('visuallyhidden');

                var listHTML = $_list[0].outerHTML,
                    pluginHTML = inst.options.tpl(listHTML);

                $_list.after(pluginHTML);
                $_list.remove();
            });
        },

        _onClickToAdd: function() {
            var inst = this;

            inst.element.on('click', inst.options.buttonSelector, function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (inst.options.fancybox) {
                    var eventCal = $('<div class="q4-atc-wrapper">' + $(this).siblings('.q4-atc-outer').html() + '</div>');
                    $.fancybox.open(eventCal);

                    if (inst.options.tooltip){
                        inst._onIconHover(eventCal);
                    }
                } else {
                    inst._togglePopup($(this).siblings('.q4-atc-outer'));
                }
            });
        },

        _onIconHover: function($el) {
            var inst = this;

            // Show ToolTip
            $el.find('.q4-atc-links a').on('mouseenter', function () {
                var $_this = $(this),
                    $_tooltip = $_this.parents('.q4-atc-inner').find('.q4-atc-tooltip'),
                    text = $_this.children('span').html();
                    
                $_tooltip.children('.q4-atc-tooltip-text').html(text);
                $_tooltip.stop(true, true).fadeIn(100);

            }).on('mouseleave', function () {
                var $_this = $(this),
                    $_tooltip = $_this.parents('.q4-atc-inner').find('.q4-atc-tooltip');

                $_tooltip.stop(true, true).fadeOut(100);
            });
        },

        _togglePopup: function ($_thisPopup) {
            if (!$_thisPopup.hasClass('is-active')) {
                $('.q4-atc-outer').stop(true, true).fadeOut(200);
                $_thisPopup
                    .addClass('is-active')
                    .stop(true, true).fadeIn(200);
            } else {
                $_thisPopup
                    .removeClass('is-active')
                    .stop(true, true).fadeOut(200);
            }
        },

        _clearPopups: function () {
            $('.q4-atc-outer')
                .removeClass('is-active')
                .stop(true, true).fadeOut(200);
        },

        _onWindowResize: function (callback) {
            var resized,
                lastWindowHeight = $(window).height(),
                lastWindowWidth = $(window).width();

            $(window).on('resize orientationChanged', function(){
                if($(window).height()!= lastWindowHeight || $(window).width()!= lastWindowWidth){

                    lastWindowHeight = $(window).height();
                    lastWindowWidth = $(window).width();

                    clearTimeout(resized);
                    resized = setTimeout(callback, 40);
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