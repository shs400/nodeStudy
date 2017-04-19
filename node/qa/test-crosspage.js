var Browser = require('zombie'),
    assert = require('chai').assert;

var browser;

suite('Cross-Page Tests',function () {
    setup(function () {
        browser = new Browser();
    });

    test('requesting a group rate form the hood river tour page should pipulate the referrer field', function (done) {
        var referrer = 'http://localhost:3000/tours/hood-river';
        browser.visit(referrer, function () {
            browser.clickLink('.requestGroupRate', function () {
                browser.assert.text('h1', 'Request Group Rate');
                done();
            });
        });
    });

    test('requesting a group rate form the hood river tour page should pipulate the referrer field', function (done) {
        var referrer = 'http://localhost:3000/tours/oregon-coast';
        browser.visit(referrer, function () {
            browser.clickLink('.requestGroupRate', function () {
                browser.assert.text('h1', 'Request Group Rate');
                done();
            });
        });
    });

    test('requesting a group rate form the hood river tour page should pipulate the referrer field', function (done) {
        var referrer = 'http://localhost:3000/tours/request-group-rate';
        browser.visit(referrer, function () {
            assert(browser.field('referrer').value === '');
            done();
        });
    });
});