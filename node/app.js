var express = require('express');
var app = express();
var hbs = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            // console.log('this._sections : ',this._sections);
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
var fortune = require('./lib/fortune');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var credentials = require('./credentials');

var  VALID_EMAIL_REGEX = new RegExp(
    '^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~=]+@' + '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' + '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
);

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    resave: false,  // 요청이 바뀌지 않았어도 세션 정보를 강제로 다시 저장
    saveUninitialized: false, // true - 새로운(초기화되지 않은) 세션도 저장, false - 쿠키를 설정하기 전에 사용자의 허락을 받아야한다.
    secret: credentials.cookieSecret  // 세션 ID쿠키에 서명할때 사용하는 키
}));
app.use('/upload', function(req, res, next){
   var now = Date.now();
   jqupload.fileHandler({
       uploadDir: function () {
           return __dirname + '/public/uploads/' + now;
       },
       uploadUrl: function () {
           return '/uploads/' + now;
       },
   })(req, res, next);
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    //console.log("res.cookie('monster','nom nom') : ",res.cookie('monster','nom nom'));
    req.session.username = 'Anonymous';
    var colorScheme = req.session.colorScheme || 'dark';
    req.session.username = null;
    delete req.session.colorScheme;

    res.cookie('monster','nom nom');
    res.cookie('signed_monster','nom nom',{ signed: true, path: '/foo' });
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = getWeatherData();

    res.locals.flash = req.session.flash;
    delete req.session.flash;

    next();
});

app.use(require('body-parser').urlencoded({extended: true}));
app.get('/newsletter',function (req, res) {
    res.render('newsletter', { csrf: 'CSRF token goes here'});
});

app.post('/process',function (req, res) {
    // console.log('Form (from querystring): ', req.query.form);
    // console.log('CSRF token (from hidden form field): ', req.body._csrf);
    // console.log('Name (from visible form field): ', req.body.name);
    // console.log('Email (from visible form field): ', req.body.email);
    // console.log('req : ',req)
    if(req.xhr || req.accepts('json,html') === 'json') res.send({ success: true });
    else res.redirect(303, '/thank-you'); // 에러가있다면  에러페이지로 리다이렉트
});

app.post('/newsletter', function(req, res){
    var name = req.body.name || '',
        email = req.body.email || '';

    if(!email.match(VALID_EMAIL_REGEX)){
        console.log('aaa');
        if(req.xhr) return res.json({ error: 'Invalid name email address.'});
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid',
        };
        console.log(req.session.flash);
        return res.redirect(303, '/newsletter/archive');
    }

    // new NewsletterSignup({ name: name, email: email}).save(function (err) {
    //     console.log('b');
    //     if(err) {
    //         if(req.xhr) return res.json({error: 'Database error'});
    //         req.session.flash = {
    //             type: 'danger',
    //             intro: 'Database error!',
    //             message: 'There was a database error; please try again later.',
    //         };
    //         return res.redirect(303,'/newsletter/archive');
    //     }
    //     if(req.xhr) return res.json({ success: true});
    //     req.session.flash = {
    //         type: 'success',
    //         intro: "Thank you!",
    //         message: 'You have now been signed up for the newsletter.',
    //     };
    //     return res.redirect(303, 'newsletter/archive');
    // });
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

app.get('/contest/vacation-photo', function (req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        layout: 'main2',
        year: now.getFullYear(),
        month: now.getMonth(),
    });
});

app.post('/contest/vacation-photo/:year/:month', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(err) return res.redirect(303, '/error');
        console.log('received Fields: ', fields);
        console.log('received Files: ', files);
        res.redirect(303,'/thank-you');
    });
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
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
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