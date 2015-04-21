var app = require('../src/app');
var _ = require('underscore');
var url = require('url');
var passport = require('passport');
var mongoose = require('mongoose');

var GitHubStrategy = require('passport-github2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var GITHUB_CLIENT_ID = app.config.github.client_id;
var GITHUB_CLIENT_SECRET = app.config.github.client_secret;

var FACEBOOK_APP_ID = app.config.facebook.client_id;
var FACEBOOK_APP_SECRET = app.config.facebook.client_secret;

module.exports = {

	loadPriority:  800,
	startPriority: 800,
	stopPriority:  800,

	initialize: function(api, next) {

		function findOrCreateUser(user, cb) {
			if (user.id) {
				user.uid = (user.authType ? user.authType + ':' : '') + user.id;

				return api.models.user.model.findOrCreate({
					id: user.id,
					uid: user.uid,
					email: user.email,
					authType: user.authType,
					profile: user
				}, cb);
			}

			console.log("Trying to load this thing...", user);

			api.models.user.model.findOne({ uid : user }, function(err, user) {
				api.log('Hello?');
				if (!err && !user) {
					console.log("Not found!");
					cb("User not found");
				}
				console.log("This is what i got", err);
				console.log(user);
				cb(err, user);
			});

		}

		var authenticationMiddleware = function(connection, actionTemplate, next) {
			connection.session = connection.rawConnection.req.session;
			connection.user = connection.session.passport.user;

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


		passport.use('github', new GitHubStrategy({
				clientID: GITHUB_CLIENT_ID,
				clientSecret: GITHUB_CLIENT_SECRET,
				callbackURL: "http://foos.beer/api/auth/github/callback"
			},
			function(accessToken, refreshToken, profile, done) {
				profile.authType = 'github';

				findOrCreateUser(profile, function(err, user, created) {
					if (created) {
						api.log("Hey, I just created a user!", user);
					}
					return done(null, user);
				});
			}
		));

		passport.use('facebook', new FacebookStrategy({
				clientID: FACEBOOK_APP_ID,
				clientSecret: FACEBOOK_APP_SECRET,
				callbackURL: "http://foos.beer/api/auth/facebook/callback",
				enableProof: false
			},
			function(accessToken, refreshToken, profile, done) {
				profile.authType = 'facebook';
				profile.email = profile.emails[0].value;

				findOrCreateUser(profile, function(err, user, created) {
					if (created) {
						api.log("Hey, I just created a user!", user);
					}
					return done(null, user);
				});
			}
		));

		passport.serializeUser(function (user, done) {
			done(null, user);
			return;
			// Faking a connection object as the first argument for
			// the session's save method. In this case it only needs
			// the connection id so it's safe to leave sparse
			// console.session.save({id:user.connection_id}, user, function (err) {
			// 	done(err, user.connection_id);
			// });
		});

		passport.deserializeUser(function (user, done) {
			// api.log("passport.deserializeUser user: "+JSON.stringify(user));

			return findOrCreateUser(user, done);

			// Faking a connection object as the first argument for
			// the session's load method. In this case it only needs
			// the connection id so it's safe to leave sparse
			// console.session.load({id:connection_id}, function (err, user) {
			// 	api.log("deserialized User: "+JSON.stringify(user));
			// 	if (err) {
			// 		api.log("ERROR: "+err);
			// 	}
			// 	done(null, user);
			// });
		});


		app.connect.use(passport.initialize());
		app.connect.use(passport.session());

		app.connect.use('/api/auth/facebook',
			passport.authenticate('facebook', { scope: 'email' })
		);

		app.connect.use('/api/auth/facebook/callback',
			passport.authenticate('facebook')
		);

		app.connect.use('/api/auth/github',
			passport.authenticate('github', { scope: 'user:email' })
		);

		app.connect.use('/api/auth/github/callback',
			passport.authenticate('github')
		);

	 
		api.passport = passport;
	 
		next();
	}
};
