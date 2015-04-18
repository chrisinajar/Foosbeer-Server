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
		// api.log(connection);
		passport.authenticate('github', {
			failureRedirect: '/login'
		})(connection.rawConnection.req, connection.rawConnection.res, function(err) {
			if (err instanceof Error) {
				connection.error = err;
			}
			next(connection, true);
		});
		// api.session.delete(connection, next);
	}
};
