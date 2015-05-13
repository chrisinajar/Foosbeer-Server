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
	run: function(api, data, next) {
		var query = api.models.user.model.find();
		if (data.params.delete) {
			query.remove();
		}
		query.exec(function(err, users) {
			data.response.users = users;
			next();
		});
	}
};
