define([
    'text!fixtures/lockup.html',
    '$',
    'lockup'
], function(fixture, $) {
    var $element;

    var getInstanceCount = function(sel) {
        return $(sel).data('instance');
    };

    describe('lockup plugin', function() {
        beforeEach(function() {
            $element = $(fixture);
        });

        describe('binding to Zepto\'s fn', function() {
            it('defines lockup in Zepto', function() {
                var lockup = $.fn.lockup;

                assert.isDefined(lockup);
            });

            it('defines lockup as a function', function() {
                var lockup = $.fn.lockup;

                assert.isFunction(lockup);
            });
        });

        describe('invoking lockup', function() {
            it('creates lockup instance on $element', function() {
                $element.lockup({});

                assert.isDefined($element.data('lockup'));

                $element.lockup('destroy');
            });

            it('stores $element inside instance', function() {
                $element.lockup({});

                assert.isDefined($element.data('lockup').$element);

                $element.lockup('destroy');
            });
        });

        describe('invoking multiple lockups', function() {
            it('correctly tracks instance counts', function() {
                var $first = $('<div />').lockup();
                var $second = $('<div />').lockup();
                var $third = $('<div />').lockup();

                assert.equal(getInstanceCount('.lockup__container'), 3);

                $first.lockup('destroy');

                assert.equal(getInstanceCount('.lockup__container'), 2);

                $second.lockup('destroy');
                $third.lockup('destroy');

                assert.equal(getInstanceCount('.lockup__container'), 0);
            });
        });

        describe('invoking lockup methods before plugin is initialized', function() {
            it('throws when not initialized', function() {
                assert.throws(function() { $element.lockup('lock'); });
            });
        });
    });
});