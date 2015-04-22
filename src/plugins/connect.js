var connect = require('connect');
var http = require('http');
var app = require('../app');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var redirect = require('connect-redirection');
var url = require('url');
var mongoose = require('mongoose');

var mongooseOptions = require('../../config/mongoose').default.mongoose();

// var connection = mongoose.createConnection(mongooseOptions.connection_string);

app.connect = connect();

app.connect.use(cookieParser());
app.connect.use(bodyParser.json());
app.connect.use(bodyParser.urlencoded({extended: false}));
app.connect.use(redirect());


// app.connect.use(urlEncode);
app.connect.use(session({
	secret: 'top secret',
	store: new MongoStore({
			db: 'foosbeer-sessions'
		}),
	resave: true,
	saveUninitialized: true
}));

app.connect.use(function(req, res, next) {
	var parsedURL = url.parse(req.url, true);

	req.originalUrl = req.url;

	req.query = parsedURL.query;
	req.path = parsedURL.pathname;
	req.protocol = parsedURL.protocol;

	next();
});

app.connect.use('/api/logout', function(req, res, next) {
	req.logout();
	req.session.destroy(next());
	// });
});


app.connect.server = http.createServer(app.connect);

http.createServer = function createServer(handler) {
	app.connect.use(handler);
	return app.connect.server;
};
