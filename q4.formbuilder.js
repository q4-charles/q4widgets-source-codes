(function($) {
    /**
     * A more flexible solution to Formbuilder 2
     * Please note that this uses HTML 5 validation which doesn't play to nice with our full page form. 
     * Once this is removed this should hopefully become a more viable solution, but for the time being a few hacks are required to other modules which often appear on the same pages as formbuilder
     * Module Search - Should still function as expected but has a additional click handler in place
     * Mailing List Signup - No good way to get this work, the submit button will bring you to the default signup page
     * note: `emailAlertsPage` will need to be modified for this
     * @class q4.formbuilder
     * @version 1.1.6
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget("q4.formbuilder", /** @lends q4.formbuilder */{
        options: {
            emailAlertsPage: '/contact-us/email-alerts/default.aspx',
            emailNameString: "Email Address",
            textInputTemplate: (
                '<div id="{{id}}_ItemClass" class="module-form_item module-form_item--{{class}}" name="ItemClass">' +
                    '<label for="{{id}}_SystemTextBox" id="{{id}}_Label">{{name}}' +
                        '{{#required}}<span id="{{id}}_lblRequired" class="module_required">*</span>{{/required}}' +
                    '</label>' +
                    '<input type="hidden" name="{{hiddenInputNameAttr}}" id="{{id}}_FieldName" value="{{hiddenInputValue}}">' +
                    '<input name="{{inputNameAttr}}" value="{{value}}" type="text" maxlength="256" id="{{id}}_SystemTextBox" class="module_input" placeholder="{{name}}" {{#required}}aria-required="true" required{{/required}}>' +
                '</div>'
            ),
            textAreaTemplate: (
                '<div id="{{id}}_ItemClass" class="module-form_item module-form_item--{{class}}" name="ItemClass">' +
                    '<label for="{{id}}_SystemTextArea" id="{{id}}_Label">{{name}}' +
                        '{{#required}}<span id="{{id}}_lblRequired" class="module_required">*</span>{{/required}}' +
                    '</label>' +
                    '<input type="hidden" name="{{hiddenInputNameAttr}}" id="{{id}}_FieldName" value="{{hiddenInputValue}}">' +
                    '<textarea name="{{inputNameAttr}}" maxlength="10000" id="{{id}}_SystemTextArea" class="module_input" placeholder="{{name}}" {{#required}}aria-required="true" required{{/required}}></textarea>' +
                '</div>'
            ),
            emailInputTemplate: (
                '<div id="{{id}}_ItemClass" class="module-form_item module-form_item--{{class}}" name="ItemClass">' +
                    '<label for="{{id}}_SystemTextBox" id="{{id}}_Label">{{name}}' +
                        '{{#required}}<span id="{{id}}_lblRequired" class="module_required">*</span>{{/required}}' +
                    '</label>' +
                    '<input type="hidden" name="{{hiddenInputNameAttr}}" id="{{id}}_FieldName" value="{{hiddenInputValue}}">' +
                    '<input name="{{inputNameAttr}}" value="{{value}}" pattern="^([\\w]+[\\.]{0,1})+@([\\w-]+\\.)+[\\w]{2,3}$" type="email" maxlength="256" id="{{id}}_SystemTextBox" class="module_input" placeholder="{{name}}" {{#required}}aria-required="true" required{{/required}}>' +
                '</div>'
            ),
            selectInputTemplate: (
                '<div id="{{id}}_ItemClass" class="module-form_item module-form_item--{{class}}" name="ItemClass">' +
                    '<label for="{{id}}_SystemDropdown" id="{{id}}_Label">{{name}}' +
                        '{{#required}}<span id="{{id}}_lblRequired" class="module_required">*</span>{{/required}}' +
                    '</label>' +
                    '<input type="hidden" name="{{hiddenInputNameAttr}}" id="{{id}}_FieldName" value="{{hiddenInputValue}}">' +
                    '<select name="{{inputNameAttr}}" id="{{id}}_SystemDropdown" class="module_dropdown" {{#required}}aria-required="true" required{{/required}}>' +
                        '{{#options}}<option {{#selected}}selected="selected"{{/selected}} value="{{value}}">{{value}}</option>{{/options}}' +
                    '</select>' +
                '</div>'
            ),
            fileInputTemplate: (
                '<div id="{{id}}_ItemClass" class="module-form_item module-form_item--{{class}}" name="ItemClass">' +
                    '<label for="{{id}}_SystemTextBox" id="{{id}}_Label">{{name}}' +
                        '{{#required}}<span id="{{id}}_lblRequired" class="module_required">*</span>{{/required}}' +
                    '</label>' +
                    '<input type="hidden" name="{{hiddenInputNameAttr}}" id="{{id}}_FieldName" value="{{hiddenInputValue}}">' +
                    '<input name="{{inputNameAttr}}" type="file" id="{{id}}_SystemTextBox" class="module_input" {{#required}}aria-required="true" required{{/required}}>' +
                '</div>'
            ),
            checkboxInputTemplate: (
                '<div id="{{id}}_ItemClass" class="module-form_item module-form_item--{{class}}" name="ItemClass">' +
                    '<fieldset>' +
                        '<legend id="{{id}}_Label">{{name}}</legend>' +
                        '<input type="hidden" name="{{hiddenInputNameAttr}}" id="{{id}}_FieldName" value="{{hiddenInputValue}}">' +
                        '<ul>' +
                            '{{#checkBoxes}}' +
                                '<li>' +
                                    '<input id="{{id}}" type="checkbox" name="{{name}}" value="{{value}}" {{isChecked}}>' +
                                    '<label for="{{id}}">{{value}}</label>' +
                                '</li>' +
                            '{{/checkBoxes}}' +
                        '</ul>' +
                    '</fieldset>' +
                '</div>'
            ),
            radioInputTemplate: (
                '<div id="{{id}}_ItemClass" class="module-form_item module-form_item--{{class}}" name="ItemClass">' +
                    '<fieldset>' +
                        '<legend id="{{id}}_Label">{{name}}' +
                            '{{#required}}<span id="{{id}}_lblRequired" class="module_required">*</span>{{/required}}' +
                        '</legend>' +
                        '<input type="hidden" name="{{hiddenInputNameAttr}}" id="{{id}}_FieldName" value="{{hiddenInputValue}}">' +
                        '<ul>' +
                            '{{#radioButtons}}' +
                                '<li>' +
                                    '<input id="{{id}}" type="radio" name="{{name}}" value="{{value}}" {{#isFirst}}checked{{/isFirst}} {{isChecked}}>' +
                                    '<label for="{{id}}">{{value}}</label>' +
                                '</li>' +
                            '{{/radioButtons}}' +
                        '</ul>' +
                    '</fieldset>' +
                '</div>'
            ),
            errorTemplate: (
                '<p class="module_message module_message--error">The following errors must be corrected</p>' +
                '<ul>' +
                    '{{#.}}' +
                        '<li id="{{id}}_RequiredFieldValidator1" style="visibility: {{display}};">' +
                            '<span class="module-form_error-text">{{name}} is required</span>' +
                        '</li>' +
                    '{{/.}}' +
                '</ul>'
            ),
            /**
             * A message or HTML string to display as intro text. Defaults to empty string.
             * @type {string}
             * @default
             */
            introText: '',
            /**
             * A CSS selector for introduction text element.
             * @type {string}
             * @default
             */
            introSelector: '.module_introduction',
            /**
             * A callback that fires before the widget is rendered.
             * @type {function}
             * @param formData {object} - An array of form data.
             */
            beforeRender: function(e, formData){},
            /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             */
            onComplete: function(){}
        },

        _create: function() {
            this._rebuildHTML();
            this._onSubmit();
            this._onChange();
        },

        _rebuildHTML: function() {
            var inst = this,
                formData = inst._createFormData(),
                outputString = '',
                $submit = inst.element.find('input[type="submit"]');

            inst._trigger('beforeRender', null, formData);

            // Full page forms fail with HTML5 vaildation
            // This is a hack to fix the Search and Mailing List Signup modules
            inst._formHacks();

            inst.element.find('.module_container--captcha').append( inst.element.find('.CaptchaContainer').closest('.module-form_item') );
            inst.element.find('.module_container--captcha').find('input:last').attr('required', '');
            inst.element.find('.CaptchaContainer img').attr('alt', 'Captcha');
            inst.element.find('input[type="text"]').attr('aria-label', 'Captcha Text');
            inst.element.find(inst.options.introSelector).html(inst.options.introText);

            $submit[0].outerHTML = $submit[0].outerHTML.replace(/^<input/, '<button') + '<span class="button_text">' + $submit[0].value + '</span></button>';

            $.each(formData.items, function(idx, item) {
                outputString = outputString + Mustache.render( item.template, item );
            });

            inst.element.find('.module_container--content').html(outputString).addClass('js--visible');
            inst.element.find('.module_error-container').html( Mustache.render( inst.options.errorTemplate, formData.errors ) );

            if ( (inst.element.find(".module_container--captcha .ErrorMessage").css('visibility') != 'hidden') || (inst.element.find(".module_container--captcha .ErrorMessage").css('visibility') == 'visible') && inst.element.find('.module_container--captcha .ErrorMessage').is(':visible') ) {
                if (q4App.scrollTo !== undefined) {
                    q4App.scrollTo( inst.element.find('.module_container--captcha .ErrorMessage'), 0 );
                }
            }

            inst._trigger('onComplete');
        },

        _formHacks: function() {
            var inst = this,
                $search = $('.module-search .module_container--inner');

            // This is required to fix the search and allow the HTML 5 validation to work
            $search.each(function(){
                var $this = $(this);
                $this.find('input:submit').remove();
                $this.append('<span class="module-search_button"></span>').on('click', '.module-search_button', function(){
                    var searchTerm = $this.find('input[type="text"]').val();
                    // console.log($this, $this.find('input[type="text"]'), searchTerm);
                    if (searchTerm.length) {
                        window.location = '/search-results/default.aspx?SearchTerm=' + searchTerm;
                    }
                });
                $this.find('input[type="text"]').unbind().on('keydown', function(e){
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        $this.find('.module-search_button').trigger('click');
                        return false;
                    }
                });
            });

            // This is required to make mailing list sign up appear not broken
            $('.module-subscribe input[type="text"], .module-subscribe input[type="email"]').unbind().on('click', function(){
                window.location = inst.options.emailAlertsPage;
            });
        },

        _onSubmit: function() {
            var inst = this;

            inst.element.find('[type="submit"]').removeAttr('onclick').on('click', function(e){
                if ( !!inst.element.find('.module_error-container li[style="visibility: visible;"]').length ) {
                    inst.element.find('.module_error-container').removeClass('hidden');
                } 
            });
        },

        _onChange: function() {
            var inst = this;

            inst.element.find('input, select').on('keydown', function(e){
                if ( !inst.element.find('.module_error-container li[style="visibility: visible;"]').length ) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        $(this).closest('.module-form').find('[type="submit"]').trigger('click');
                        return false;
                    }
                } 
            });

            inst.element.find('input, select').on('focus focusout', function(e){
                if ( !inst.element.find('.module_error-container li[style="visibility: visible;"]').length ) {
                    inst.element.find('.module_error-container').addClass('hidden');
                } 
            });

            // Removes spaces when input is typed or pasted after focus
            inst.element.find('input[type="email"], [class*="email"] input, [class*="Email"] input').on('change paste blur keypress', function(e) {
                if (e.which === 32) {
                    e.preventDefault();
                } else {
                    $(this).val($(this).val().replace(/\s/g,"").trim());
                }
            })
        },

        _displayType: function( $el ) {
            if (  $el.find('input[type="radio"], select').length ) {
                return 'hidden';
            } else if ( $el.find('input[type="text"], textarea').val().length ) {
                return 'hidden';
            } else {
                return 'visible';
            }
        },

        _createFormData: function() {
            var inst = this,
                formData = [],
                requiredItem = [];

            inst.element.find('.module-form_item:not([class*="Captcha"])').each(function(){
                var $formEl = $(this),
                    formElname = $formEl.find('.module-form_label span:first').text().trim(),
                    itemsData = {
                        id: $formEl.attr('id').replace('_ItemClass', ''),
                        hiddenInputValue: $formEl.find('input[type="hidden"]').val(), // 
                        hiddenInputNameAttr: $formEl.find('input[type="hidden"]').attr('name'), // Required
                        name: $formEl.find('.module-form_label span:first').text().trim(),
                        class: $formEl.find('.module-form_label span:first').text().trim().toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(/ /g, '-'),
                        required: !!$formEl.find('.module_required').length
                    }

                // Create error container
                if ( $formEl.find('.module_required').length ) { 
                    requiredItem.push({
                        id: $formEl.attr('id').replace('_ItemClass', ''),
                        name: $formEl.find('.module-form_label span:first').text().trim(),
                        display: inst._displayType( $formEl )
                    });
                }

                // Create form element data
                if ( $formEl.find('input[type="text"]').length ) {
                    if ( formElname === inst.options.emailNameString ) {
                        itemsData = $.extend(itemsData, {
                            template: inst.options.emailInputTemplate,
                            inputNameAttr: $formEl.find('input[type="text"]').attr('name'),
                            value: $formEl.find('input[type="text"]').val()
                        });
                    } else {
                        itemsData = $.extend(itemsData, {
                            template: inst.options.textInputTemplate,
                            inputNameAttr: $formEl.find('input[type="text"]').attr('name'),
                            value: $formEl.find('input[type="text"]').val()
                        });
                    }
                } else if ( $formEl.find('textarea').length ) {
                    itemsData = $.extend(itemsData, {
                        template: inst.options.textAreaTemplate,
                        inputNameAttr: $formEl.find('textarea').attr('name'),
                        value: $formEl.find('textarea').val(),
                    });
                } else if ( $formEl.find('select').length ) {
                    itemsData = $.extend(itemsData, {
                        template: inst.options.selectInputTemplate,
                        inputNameAttr: $formEl.find('select').attr('name'),
                        options: inst._buildOptionArray($formEl)
                    });
                } else if ( $formEl.find('input[type="checkbox"]').length ) {
                    itemsData = $.extend(itemsData, {
                        template: inst.options.checkboxInputTemplate,
                        checkBoxes: inst._buildCheckBoxArray($formEl)
                    });
                } else if ( $formEl.find('input[type="radio"]').length ) {
                    itemsData = $.extend(itemsData, {
                        template: inst.options.radioInputTemplate,
                        radioButtons: inst._buildRadioButtonArray($formEl)
                    });
                } else if ( $formEl.find('input[type="file"]').length ) {
                    itemsData = $.extend(itemsData, {
                        template: inst.options.fileInputTemplate,
                        inputNameAttr: $formEl.find('input[type="file"]').attr('name')
                    });
                }

                formData.push(itemsData);
            });

            return {
                items: formData,
                errors: requiredItem
            };
        },

        _buildOptionArray: function( $el ) {
            var opts = [];

            $.each($el.find('select option'), function(){
                opts.push({
                    value: $(this).val(),
                    selected: $(this).is(':selected')
                });
            });

            return opts;
        },

        _buildCheckBoxArray: function( $el ) {
            var checkBox = [];

            $.each($el.find('input[type="checkbox"]'), function(idx){
                checkBox.push( {
                    isFirst: !idx,
                    isChecked: $(this).attr('checked'),
                    id: $(this).attr('id'),
                    name: $(this).attr('name'),
                    value: $(this).attr('value')
                });
            });

            return checkBox;
        },

        _buildRadioButtonArray: function( $el ) {
            var radioButton = [];

            $.each($el.find('input[type="radio"]'), function(idx){
                radioButton.push( {
                    isFirst: !idx,
                    isChecked: $(this).is(':checked') ? 'checked' : '',
                    id: $(this).attr('id'),
                    name: $(this).attr('name'),
                    value: $(this).attr('value')
                });
            });

            return radioButton;
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
        
    });
})(jQuery);