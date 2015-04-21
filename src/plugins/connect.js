var connect = require('connect');
var http = require('http');
var app = require('../app');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redirect = require('connect-redirection');
var url = require('url');

var server;

app.connect = connect();

app.connect.use(cookieParser());
app.connect.use(bodyParser.json());
app.connect.use(bodyParser.urlencoded({extended: false}));
app.connect.use(redirect());

// app.connect.use(urlEncode);
app.connect.use(session({
	secret: 'i dont even get the point of this...',
	store: new RedisStore(),
	resave: false,
	saveUninitialized: true
}));

app.connect.use(function(req, res, next) {
	req.query = url.parse(req.url, true).query;
	req.session.cookie = req.cookies;
	next();
});


app.connect.server = http.createServer(app.connect);

http.createServer = function createServer(handler) {
	app.connect.use(handler);
	return app.connect.server;
};
