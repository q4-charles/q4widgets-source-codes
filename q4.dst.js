(function($) {
    /**
     * A simple widget for changing the time zone strings of either modules or widgets.
     * @class q4.dst
     * @version 1.0.0
     * @example
     * $('.ModuleEvent').dst({
     *     container: '.ModuleTime',
     *     timeZones: [
     *          {
     *              find: 'EST',
     *              replace: 'EDT'
     *          },
     *          {
     *              find: 'PST',
     *              replace: 'PDT'
     *          },
     *          {
     *              find: 'CST',
     *              replace: 'CDT'
     *          }
     *      ]
     * });
     */
    $.widget("q4.dst", /** @lends q4.dst */ {
        options: {
            /**
             * Class container for where the time zone text can be found
             * @type {string}
             */
            container: '.ModuleTime',
            /**
             * An array of what time zone strings to look out for and what to replace them with if found
             * @type {array}
             * @example 
             * timeZones : [
             *     { find: 'EST', replace: 'EDT' }
             * ]
             */
            timeZones: [
                {
                    find: 'EST',
                    replace: 'EDT'
                },
                {
                    find: 'PST',
                    replace: 'PDT'
                },
                {
                    find: 'CST',
                    replace: 'CDT'
                }
            ],
            /**
             * A callback fired once the widget has finished running
             * @type {function}
             */
            onComplete: function(){}
        },

        _create: function() {
            var inst = this, o = inst.options;

            inst._convertTimeZone( o.container, o.timeZones );
        },

        _convertTimeZone: function( timeContainer, timeZones ) {
            var inst = this;

            inst.element.find(timeContainer).each(function() {

                var timeObject = $(this),
                    convertedString = timeObject.text(),
                    timeZone = timeObject.text().split(" ").pop();

                $.each(timeZones, function(idx, string) {
                    if ( timeZone == string.find ) {
                        timeObject.text(convertedString.replace( string.find, string.replace ));
                    }
                });
            });

            inst._trigger('onComplete');
        },

        destroy: function() {
            this.element.html('');
        }

    });
})(jQuery);