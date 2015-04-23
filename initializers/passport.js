var app = require('../src/app');
var _ = require('underscore');
var url = require('url');
var passport = require('passport');
var mongoose = require('mongoose');

var GitHubStrategy = require('passport-github2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var GITHUB_CLIENT_ID = app.config.github.client_id;
var GITHUB_CLIENT_SECRET = app.config.github.client_secret;

var TWITTER_CONSUMER_KEY = app.config.twitter.client_id;
var TWITTER_CONSUMER_SECRET = app.config.twitter.client_secret;

var FACEBOOK_APP_ID = app.config.facebook.client_id;
var FACEBOOK_APP_SECRET = app.config.facebook.client_secret;

var scopes = {
	github: ["user:email"],
	// twitter: []
	// default is email
	// facebook: "email"
};

module.exports = {

	loadPriority:  800,
	startPriority: 800,
	stopPriority:  800,

	initialize: function(api, next) {

		var authenticationMiddleware = function(connection, actionTemplate, next) {
			connection.session = connection.rawConnection.req.session;
			connection.user = connection.rawConnection.req.user;

			if (actionTemplate.authenticated === true) {
				if (!connection.user) {
					connection.error = "No access";
				}
				next(connection, true);
			} else {
				next(connection, true);
			}
		};
	
		api.actions.addPreProcessor(authenticationMiddleware);

		passport.serializeUser(function (user, done) {
			if (user && user.uid) {
				api.log("passport.serializeUser user: "+user.uid);
			}
			api.log("passport.serializeUser user: "+user);

			if (!user) {
				done("No user passed in to serialize!");
			} else {
				done(null, user.uid || user);

			}
		});

		passport.deserializeUser(function (uid, done) {
			api.log("passport.deserializeUser user: "+(uid));

			api.models.user.model.findOne({uid: uid}, function(err, user) {
				if (user) {
					while (user.profile && user.profile.profile) {
						user = user.profile;
					}
					api.log("I found this user..." + JSON.stringify(user.profile));

					done(err, user);
				} else {
					done("Failed to find user!");
				}
			});
		});

		app.connect.use(passport.initialize());
		app.connect.use(passport.session());

		app.connect.use('/api/auth/', function(req, res, next) {
			// [ '', 'api', 'auth', 'github', 'callback' ]
			var parts = req.path.split('/'),
				isCallback = false,
				type;

			// return next();

			if (!parts[0].length) {
				parts.shift();
			}

			type = parts.pop();

			if (type === "test") {
				return next();
			}
			if (type === "callback") {
				isCallback = true;
				type = parts.pop();
			}

			if (!isCallback) {
				passport.authenticate(type, { session: true , scope: scopes[type] || 'email' })
					(req, res, next);
			} else {
				passport.authenticate(type, {
				}, function(err, user, info) {
					req.login(user, function(err) {
						if (err) {
							api.log("Got an error creating the session: " + JSON.stringify(err));
							next(err);
						} else {
							res.redirect('/api/status');
						}
					});
				})(req, res, next);
			}
		});

		api.passport = passport;
	 
		next();
	}
};
