passport = require('passport');

exports.auth_github = {
	name: 'auth_github',
	description: 'endpoint callback for GitHub authentication',
	inputs: {
		'required' : [],
		'optional' : []
	},
	// authorisedGroups: void(0),
	blockedConnectionTypes: [],
	outputExample: {
	},
	run: function(api, connection, next) {
		api.log(connection.params);
		// next(connection, true);
		passport.authorize('github', {
			failureRedirect: '/login'
		})(connection.rawConnection.req, connection.rawConnection.res, function(err) {
			api.log("This is the callback for the github authorize");
			api.log(arguments);
			if (err instanceof Error) {
				connection.error = err;
			}
			next(connection, true);
		});
		// api.session.delete(connection, next);
	}
};
