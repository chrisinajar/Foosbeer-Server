var app = require('../src/app');
var _ = require('underscore');
var url = require('url');
var passport = require('passport');
var mongoose = require('mongoose');

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

		var authenticationMiddleware = {
			name: 'passport auth',
			global: true,
			priority: 100,

			preProcessor: function(data, next) {
				// connection, actionTemplate, next) {
				// return next();
				api.log("This is the preprocessor?");
				console.log(data.connection);

				var connection = data.connection,
					actionTemplate = data.actionTemplate;

				if (connection.type === 'web') {
					connection.session = connection.rawConnection.req.session;
					connection.user = connection.rawConnection.req.user;

					if (connection.user && connection.user.connectionID !== connection.fingerprint) {
						api.log("Storing new connection id." + connection.fingerprint);
						connection.user.connectionID = connection.fingerprint;
						connection.user.save(function(err, user) {
							if (err) {
								api.log("Failed to save back connection ID!");
							}
						})
					}

					if (actionTemplate.anonymous !== true) {
						if (!connection.user) {
							connection.error = "Login required";
							return next("Login required");
						}
					}
					return next();
				} else if (connection.type === 'websocket') {
					api.log("Looking up user...");
					api.models.user.model.findOne({
						connectionID: connection.fingerprint
					}, function(err, user) {
						if (err) {
							api.log("There was an error!!" + JSON.stringify(err));
							return next(err);
						} else if (!user) {
							api.log("Didn't find any user with this fingerprint..");
							return next("Login required");
						} else {
							api.log("Logged in apparently? " + JSON.stringify(user));
							return next();
						}
					});
					return;
				}

				next("No auth?");
			}
		};
	
		api.actions.addMiddleware(authenticationMiddleware);

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
					api.log("I found this user..." + JSON.stringify(user.profile));

					done(err, user);
				} else {
					done("Failed to find user!");
				}
			});
		});

		app.connect.use(passport.initialize());
		app.connect.use(function(req, res, next) {
			console.log(req.url);
			next();
		});
		app.connect.use(passport.session());
		app.connect.use(function(err, req, res, next) {
			if (err) {
				if (typeof err === "string") {
					res.write('{error: 1, message: "' + err.replace(/"/g, '\\"') + '" }');
				} else {
					res.write(JSON.stringify(err));
				}
				res.end();
			}
		});

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
				// not a callback, this is a require! lets store the callback url...
				console.log("This is my callback url!!!", req.query.callback);
				req.session.authCallback = req.query.callback;
				req.session.save(function() {
					passport.authenticate(type, { session: true , scope: scopes[type] || 'email' })
						(req, res, next);
				});
			} else {
				passport.authenticate(type, {
				}, function(err, user, info) {
					req.login(user, function(err) {
						if (err) {
							api.log("Got an error creating the session: " + JSON.stringify(err));
							next(err);
						} else {
							res.redirect(req.session.authCallback || '/');
						}
					});
				})(req, res, next);
			}
		});

		api.passport = passport;
	 
		next();
	}
};
