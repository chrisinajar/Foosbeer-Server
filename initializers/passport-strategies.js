var app = require('../src/app');
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


module.exports = {

	loadPriority:  810,
	startPriority: 810,
	stopPriority:  810,

	initialize: function(api, next) {
		function findOrCreateUser(user, cb) {
			delete user._raw;

			if (user.id) {
				user.uid = (user.authType ? user.authType + ':' : '') + user.id;

				return api.models.user.model.findOne({
					uid: user.uid
				}, function(err, userModel) {
					if (userModel) {
						return cb(err, userModel);
					}
					userModel = new api.models.user.model({
						id: user.id,
						uid: user.uid,
						name: user.name,
						email: user.email,
						authType: user.authType,
						profile: user
					});
					userModel.save(function(err) {
						if (err) {
							api.log("ERROR!");
							api.log(err);
							cb(err);
						} else {
							cb(null, userModel, true);
						}
					});
				});
			}


			api.models.user.model.findOne({ uid : user }, function(err, user) {
				api.log('Hello?');
				if (!err && !user) {
					cb("User not found");
				}
				cb(err, user);
			});

		}

		passport.use('github', new GitHubStrategy({
				clientID: GITHUB_CLIENT_ID,
				clientSecret: GITHUB_CLIENT_SECRET,
				callbackURL: "http://foos.beer/api/auth/github/callback"
			},
			function(accessToken, refreshToken, profile, done) {
				profile.email = profile.emails[0].value;
				profile.name = profile.displayName;
				profile.authType = 'github';

				findOrCreateUser(profile, function(err, user, created) {
					if (created) {
						api.log(created);
						api.log("Hey, I just created a user! " + JSON.stringify(profile));
					}
					return done(err, user);
				});
			}
		));

		passport.use('facebook', new FacebookStrategy({
				clientID: FACEBOOK_APP_ID,
				clientSecret: FACEBOOK_APP_SECRET,
				callbackURL: "http://foos.beer/api/auth/facebook/callback",
				enableProof: true
			},
			function(accessToken, refreshToken, profile, done) {
				profile.authType = 'facebook';
				profile.name = profile.displayName;
				profile.email = profile.emails[0].value;

				findOrCreateUser(profile, function(err, user, created) {
					if (created) {
						api.log("Hey, I just created a user!" +  JSON.stringify(user));
					}
					return done(err, user);
				});
			}
		));
		passport.use(new TwitterStrategy({
				consumerKey: TWITTER_CONSUMER_KEY,
				consumerSecret: TWITTER_CONSUMER_SECRET,
				callbackURL: "http://foos.beer/api/auth/twitter/callback"
			},
			function(token, tokenSecret, profile, done) {
				console.log(profile);
				profile.name = profile.displayName;
				profile.authType = 'twitter';

				if (profile.emails && profile.emails.length) {
					profile.email = profile.emails[0].value;
				} else {
					profile.email = profile.username + '@twitter.com';
				}


				findOrCreateUser(profile, function (err, user, created) {
					if (created) {
						api.log("Hey, I just created a user!" +  JSON.stringify(user));
					}
					if (err) {
						api.log("There was an error trying to save this!!");
						api.log(err);
					}
					return done(err, user);
				});
			}
		));

		next();
	}
};