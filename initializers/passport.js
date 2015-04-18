var app = require('../src/app');
var _ = require('underscore');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = app.config.github.client_id;
var GITHUB_CLIENT_SECRET = app.config.github.client_secret;

var passport = require("passport");
var util = require('util');
 

module.exports = {

	initialize: function(api, next) {
	 
		var doBasicAuth = function (req, res, connection, next) {
			passport.authenticate("local", {session: true},
				function (err, user, info, extra) {
					if (err) {
						connection.error = err;
						return next(connection, false);
					}
					if (!user) {
						// api.log('Not Authenticated');
						// Unauthorized
						connection.rawConnection.responseHttpCode = 401;
						return next(connection, false);
					}
					// api.log('user: '+JSON.stringify(user))
					user.connection_id = connection.id;
					connection.rawConnection.req.logIn(user, function () {
						next(connection, true);
					});
				})(req, res);
		};
	 
		// Set up session variables
		var setupSession = function (connection, actionTemplate, next) {
			// api.log("setupSession, connection.id: "+ connection.id);
			connection.rawConnection.req.session = {passport: {user: connection.id}};
			next(connection, true);
		};
		
		// Init Passport and Passport's Session integration
		// (adds Passport methods/properties to the request and response objects)
		var usePassportMiddleware = function (connection, actionTemplate, next) {
			passport.initialize()(connection.rawConnection.req, connection.rawConnection.res, function () {
				passport.session()(connection.rawConnection.req, connection.rawConnection.res, function () {
					next(connection, true);
				});
			});
		};


		var authenticationMiddleware = function(connection, actionTemplate, next){

			if(actionTemplate.authenticated === true){
				_.extend(connection.rawConnection.req, {body:connection.params});



				return passport.authenticate('github', {session: true},
					function (err, user, info, extra) {
						if (err) {
							connection.error = err;
							return next(connection, false);
						}
						if (!user) {
							// api.log('Not Authenticated');
							// Unauthorized
							connection.rawConnection.responseHttpCode = 401;
							return next(connection, false);
						}
						// api.log('user: '+JSON.stringify(user))
						user.connection_id = connection.id;
						connection.rawConnection.req.logIn(user, function () {
							next(connection, true);
						});
					})(connection.rawConnection.req, connection.rawConnection.res);
				
			}else{
				next(connection, true);
			}
		};
	 
		api.actions.addPreProcessor(setupSession);
		api.actions.addPreProcessor(usePassportMiddleware);
		api.actions.addPreProcessor(authenticationMiddleware);
	 
	 
		passport.use(new GitHubStrategy({
				clientID: GITHUB_CLIENT_ID,
				clientSecret: GITHUB_CLIENT_SECRET,
				callbackURL: "http://foos.beer/api/auth/github"
			},
			function(accessToken, refreshToken, profile, done) {
				// asynchronous verification, for effect...
				process.nextTick(function () {
					// To keep the example simple, the user's GitHub profile is returned to
					// represent the logged-in user.  In a typical application, you would want
					// to associate the GitHub account with a user record in your database,
					// and return that user instead.
					//     User.findOrCreate({ githubId: profile.id }, function (err, user) {
					api.log(profile);
					return done(null, profile);
				});
			}
		));
	 
		passport.serializeUser(function (user, done) {
			// api.log("passport.serializeUser: "+JSON.stringify(user));
			// Faking a connection object as the first argument for
			// the session's save method. In this case it only needs
			// the connection id so it's safe to leave sparse
			api.session.save({id:user.connection_id}, user, function (err) {
				done(err, user.connection_id);
			});
		});
	 
		passport.deserializeUser(function (connection_id, done) {
			// api.log("passport.deserializeUser connection_id: "+JSON.stringify(connection_id));
			// Faking a connection object as the first argument for
			// the session's load method. In this case it only needs
			// the connection id so it's safe to leave sparse
			api.session.load({id:connection_id}, function (err, user) {
				// api.log("deserialized User: "+JSON.stringify(user));
				done(null, user);
			});
		});
	 
		api.passport = passport;
	 
		next();
	}
};
