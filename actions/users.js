exports.logout = {
	name: 'users',
	description: 'Lists all users currently in the system',

	inputs: {
		'delete': {}
	},
	outputExample: {
		users: [{
			name: "Sam Bush",
			mmr: 9001
		}]
	},
	run: function(api, connection, next) {
		var query = api.models.user.model.find();
		if (connection.params.delete) {
			query.remove();
		}
		query.exec(function(err, users) {
			connection.response.users = users;
			next(connection, true);
		});
	}
};
