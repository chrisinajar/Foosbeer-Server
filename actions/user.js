var _ = require('underscore');

exports.logout = {
	name: 'user',
	description: 'Fetches a single user from the system',

	inputs: {
		'_id': {},
		'id': {}
	},
	outputExample: {
		user: {
			name: "Sam Bush",
			mmr: 9001
		}
	},
	run: function(api, data, next) {
		var query = api.models.user.model.findOne(
				_(data.params).omit('action', 'apiVersion')
			);

		query.exec(function(err, user) {
			data.response.user = user;
			next();
		});
	}
};
