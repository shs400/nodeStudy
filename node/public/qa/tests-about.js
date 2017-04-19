suite('"About" page Test', function () {
test('page should contain link to contact page', function () {
    assert($('a[href="contact"]').length);
    console.log(assert($('a[href="contact"]').length))
});
});