exports.logout = {
	name: 'users',
	description: 'Lists all matches in a given state, defaults to open',

	inputs: {
		state: {}
	},
	outputExample: {
		matches: [{
		}]
	},
	run: function(api, data, next) {
		var query = api.models.user.model.find();
		if (data.params.delete) {
			query.remove();
		}
		query.exec(function(err, users) {
			data.response.users = users.toJSON({
				virtuals: true
			});;
			next();
		});
	}
};
