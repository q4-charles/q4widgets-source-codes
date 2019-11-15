(function($) {
    /**
     * Deprecated
     * Overwrites the default Mailing List Signup validation.
     * This plugin has been replaced by q4.captcha
     * This version is used for a quick implementation and should be ignored for all future sites
     * q4.captcha is include as part of core.js
     * @class q4.emailValidation
     * @version 1.1.1
     * @example
     * $("#clndr").calendar();
     * $('.MailingListSignupContainer').emailValidation({
     *     captchaCSS: !!0,
     *     inputCSS: !!0
     * });
     */
    $.widget("q4.emailValidation", /** @lends q4.emailValidation */ {
        options: {
            /**
             * A Mustache template containing the name of all fields which failed validation
             * @type {string}
             * @example
             *  '<ul class="error-container">' +
             *      '{{#.}}' +
             *           '<li>{{.}} is required</li>' +
             *       '{{/.}}' +
             *  '</ul>'
             */
            errorsTpl: (
                '<ul class="error-container">' +
                    '{{#.}}' +
                        '<li>{{.}} is required</li>' +
                    '{{/.}}' +
                '</ul>'
            ),
            /**
             * Text displayed for captcha
             * @type {string}
             */
            captchaText: 'Enter the code shown above.',
            /**
             * Text used if the form is submited before the captcha is complete
             * @type {string}
             */
            invalidCaptcha: 'Please provide the code.',
            /**
             * Text used inside the submit input
             * @type {string}
             */
            submitText: 'Submit',
            /**
             * The class name for the cpatcha's container
             * @type {string}
             */
            captchaCls: '.CaptchaContainer',
            /**
             * Inline CSS added to the captcha container
             * @type {object}
             */
            captchaCSS: {
                display: 'none',
                padding: '0 5px'
            },
            /**
             * Inline CSS added to captcha input
             * @type {object}
             */
            inputCSS: {
                width: '100%',
                padding: 0,
                margin: '5px 0'
            }
        },

        _init: function() {
            var _ = this, o = _.options,
                $captcha = _.element.find(_.options.captchaCls);

            if ($captcha.length){
                _.element.find('input[type="submit"]').val(o.submitText);

                if (o.captchaCSS){
                    $captcha.css(o.captchaCSS)
                }

                if (o.inputCSS){
                    $captcha.find('input[type="text"]').css(o.inputCSS);
                }

                $captcha.find('td b').text(o.captchaText);
                _._beforeSubmit();
            }
        },

        _isValidEmailAddress: function(emailAddress) {
            var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
            return pattern.test(emailAddress);
        },

        validateForm: function() {
            var _ = this, validate, errors = []

            // Loop through each required field
            _.element.find('.RequiredField').each(function(){
                var element, $el = $(this).closest('tr'),
                    field = $el.find('td:first span:not(".RequiredField")').text();

                if ( $(this).attr('id') !== undefined ) {
                    // Check if the require field is an input. 
                    // If it's an email address use regex to validate
                    // Otherwise just confirm a string has been entered
                    if ( $el.find('input[name*="txtEmail"]').length ) {
                        element = $el.find('input:first');
                        validate = element.attr('id').indexOf('Email') > -1 ? _._isValidEmailAddress( element.val() ) : element.val().length;
                    } 

                    // Check if the required field is a select 
                    // As long as an option is selected this will pass
                    else if ( $el.find('select:first').length ) {
                        element = $el.find('select:first');
                        validate = !!element.val().length;
                    }

                    // Check if the required field is mailing list selection
                    // One or more items must be selected
                    else if ( $(this).attr('id').indexOf('MailingLists') > -1 ){
                        element = $el.parent().find('input[type="checkbox"]');
                        validate = element.is(':checked');
                    } 

                    // Check if required text field contains text
                    else {
                        element = $el.find('input[type="text"]');
                        validate = element.val().length;
                    }

                    if (!validate) {
                        errors.push(field);
                    }
                }
            });

            if (errors.length) {
                var errorHTML = '';

                $.each(errors, function(i, error){
                    errorHTML += '<li>'+ error +' is required</li>';
                });

                _.element.find('.ErrorContainer').html('<ul class="error-container">' + errorHTML + '</ul>').fadeIn();
                return false;
            } else {
                return validate;
            }
        },

        _beforeSubmit: function() {
            var _ = this,
                $submit = _.element.find('.GridActions'),
                $captcha = _.element.find(_.options.captchaCls),
                $button = $submit.find('input[type="submit"]');

            $button.clone().appendTo( $captcha );
            $captcha.prepend('<div class="ErrorContainer"></div>');

            $captcha.find('input[type="text"]').on('keydown', function(e){
                if (e.keyCode == 13) {
                    $captcha.find('input[type="submit"]').trigger('click');
                }
            });

            $button.removeAttr('onclick').removeAttr('id').appendTo($submit).on('click', function(e){
                e.preventDefault();

                $captcha.find('input[type="text"]').unbind('focus, blur').val('').attr('placeholder', '');

                // Clear error container
                _.element.find('.ErrorContainer').html('');
                
                // Check that all form fields validate
                if ( _.validateForm() ) {
                    _.makeFancy(_.options.captchaCls, $captcha);
                    
                    $captcha.find('input[type="submit"]').on('click', function(e){
                        if ( !$captcha.find('input[type="text"]').val().length ){
                            $captcha.find('.ErrorContainer').html('<p>' + _.options.invalidCaptcha + '</p>');
                        }
                    });
                }
            });
        },

        makeFancy: function(container, $captcha) {
            var _ = this;

            if (typeof $.fancybox !== 'undefined' && $.isFunction( $.fancybox.open )){ // use FancyBox 2.x
                $.fancybox.open([ $captcha ], {
                    parent: "#litPageDiv form:first"
                });
            } else if (typeof $.fancybox !== 'undefined'){ // use FancyBox 1.x
                $.fancybox({
                    content: '<div class="fancy-popup"></div>',
                    onComplete: function(){
                        $('#fancybox-wrap').css({
                            width: 'auto',
                        }).appendTo('#litPageDiv form').find('.fancy-popup').append( $captcha );

                        $('#fancybox-content').css({
                            width: 250,
                            height: 175
                        }).find(container).show();

                        $(window).trigger('resize');
                    },
                    onCleanup: function(){
                         $('#fancybox-content').find(container).hide().appendTo(_.element);
                    }
                });
            } else { // Load FancyBox 2.1.5 if no version is loaded
                $('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.css">');
                $.getScript('https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js', function(){
                    $.fancybox.open([ $captcha ], {
                        parent: "#litPageDiv form:first"
                    });
                });
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

$(function(){
    $('.MailingListSignupContainer').emailValidation();
});