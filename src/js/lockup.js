(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            '$',
            'plugin',
            'deckard'
        ], factory);
    } else {
        var framework = window.Zepto || window.jQuery;
        factory(framework, window.Plugin);
    }
}(function($, Plugin) {
    $.extend($.fn, {
        renameAttr: function(oldName, newName) {
            return this.each(function() {
                var $el = $(this);
                $el
                    .attr(newName, $el.attr(oldName))
                    .removeAttr(oldName);
            });
        }
    });

    var classes = {
        CONTAINER: 'lockup__container'
    };

    function Lockup(element, options) {
        Lockup.__super__.call(this, element, options, Lockup.DEFAULTS);
    }

    Lockup.VERSION = '0';

    Lockup.DEFAULTS = {
        container: null
    };

    Plugin.create('lockup', Lockup, {
        _init: function(element) {
            this.$element = $(element);
            this.$html = $('html');
            this.$body = $('body');
            this.$doc = $(document);

            this.$element.appendTo(this.$container = this._buildContainer());
        },

        /**
         * The body content needs to be wrapped in a containing
         * element in order to facilitate scroll blocking. One can
         * either be supplied in the options, or we'll create one
         * automatically, and append all body content to it.
         */
        _buildContainer: function() {
            var $container = $('.' + classes.CONTAINER);

            if (this.options.container) {
                if (!$container.length) {
                    $container = $(this.options.container).addClass(classes.CONTAINER);
                }
            } else {
                if (!$container.length) {
                    $container = this._createContainer();
                }
            }

            return $container;
        },

        _createContainer: function() {
            // scripts must be disabled to avoid re-executing them
            var $scripts = this.$body.find('script')
                .renameAttr('src', 'x-src')
                .attr('type', 'text/lockup-script');

            this.$body.wrapInner($('<div />').addClass(classes.CONTAINER));

            $scripts.renameAttr('x-src', 'src').attr('type', 'text/javascript');

            return this.$body.find('.' + classes.CONTAINER);
        },

        container: function() {
            return this.$container;
        },

        /**
         * This function contains several methods for fixing scrolling issues
         * across different browsers. See each if statement for an in depth
         * explanation.
         */
        lock: function() {
            var self = this;

            var getPadding = function(position) {
                return parseInt(self.$body.css('padding-' + position));
            };

            this.scrollPosition = this.$body.scrollTop();

            this.$doc.off('touchmove', this._preventDefault);

            /**
             * On Chrome, we can get away with fixing the position of the html
             * and moving it up to the equivalent of the scroll position
             * to lock scrolling.
             */
            if ($.browser.chrome) {
                this.$html.css('position', 'fixed');
                this.$html.css('top', this.scrollPosition * -1);
            }
            /**
             * On iOS8, we lock the height of the element's body wrapping div as well
             * as do some scrolling magic to make sure forms don't jump the page
             * around when they're focused.
             */
            else if ($.os.ios && $.os.major >= 8) {
                this.$body
                    .css('margin-top', 0)
                    .css('margin-bottom', 0);

                this.$container
                    .height(window.innerHeight)
                    .css('overflow', 'hidden')
                    .scrollTop(this.scrollPosition - getPadding('top') - getPadding('bottom'));
            }
            /**
             * On iOS7 and under, the browser can't handle what we're doing
             * above so we need to do the less sexy version. Wait for the
             * focus to trigger and then jump scroll back to the initial
             * position. Looks like crap but it works.
             */
            else if ($.os.ios && $.os.major <= 7) {
                this.$element.find('input, select, textarea')
                    .on('focus', function() {
                        setTimeout(function() {
                            window.scrollTo(0, self.scrollPosition);
                        }, 0);
                    });
            }
        },

        /**
         * Undo all the things above
         */
        unlock: function() {
            this.$doc.on('touchmove', this._preventDefault);

            if ($.browser.chrome) {
                this.$html.css('position', '');
                this.$html.css('top', '');
                window.scrollTo(0, this.scrollPosition);
            } else if ($.os.ios && $.os.major >= 8) {
                this.$body
                    .css('margin', '');

                this.$container
                    .css('overflow', '')
                    .css('height', '');

                window.scrollTo(0, this.scrollPosition);
            } else if ($.os.ios && $.os.major <= 7) {
                this.$element.find('input, select, textarea').off('focus');
            }

            this.$doc.off('touchmove', this._preventDefault);
        },

        _preventDefault: function(e) {
            e.preventDefault();
        }
    });

    return $;
}));
