var app = require('../src/app');

app.connect.use('/api/logout', function(req, res, next) {
	req.logout();
	req.session.destroy(next);
});

exports.logout = {
	name: 'logout',
	description: 'ends the user session',
	anonymous: true,

	inputs: {
		'required' : [],
		'optional' : []
	},
	// authorisedGroups: void(0),
	blockedConnectionTypes: [],
	outputExample: {
	},
	run: function(api, connection, next){
		connection.response.message = "Your session has been destroyed.";
		next(connection, true);
	}
};
