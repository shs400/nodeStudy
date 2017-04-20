var express = require('express');
var app = express();
var hbs = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            console.log('this._sections : ',this._sections);
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
var fortune = require('./lib/fortune');

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = getWeatherData();

    next();
});
app.disable('x-powered-by');

app.get('/',function (req, res) {
    res.render('home');
});

app.get('/test',function (req, res) {
    res.render('nursery-rhyme', { layout: 'main2'});
});

app.get('/data/nursery-rhyme',function (req, res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck'
    });
});

app.get('/foo',function (req, res) {
    res.render('foo',{ layout: 'main2' });  // 기본적으로는 views의 foo를 찾고, 레이아웃을 변경하고 싶으면 { layout: '파일이름' } 을 넘겨주면된다.
});

app.get('/about',function (req, res) {
    res.render('about', {
        fortune : fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/tours/hood-river',function (req, res) {
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate',function (req, res) {
    res.render('tours/request-group-rate');
});

app.get('/headers',function (req, res) {
    res.set('Content-Type','text/plain');
    var s = '';
    for(var name in req.headers) {
        s += name + ': ' + req.headers[name] + '\n';
    }
    res.send(s);
});

// 커스텀 404 페이지
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});
app.use(function (err, req, res, next) {
    // console.error(err.stack);
    res.status(500);
    res.render('500');
});


//가짜 데이터
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/clouldy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlyclouldy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ]
    };
}


app.listen(app.get('port'),function () {
    console.log('Express started on http://localhost'+app.get('port')+'; press Ctrl - C to terminate');
});