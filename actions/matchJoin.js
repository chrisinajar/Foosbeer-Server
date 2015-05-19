exports.matchJoin = {
	name: 'matchJoin',
	description: 'Create a new match between a set of players',

	inputs: {
		id: { required: true }
	},
	outputExample: {
		data: {
		}
	},
	run: function(api, data, next) {
		var connection = data.connection;
		if (connection.user.currentMatch) {
			data.response.error = 1;
			data.response.message = "You cannot be in 2 matches at once. Cancel or complete your previous match to start a new one.";
			return next();
		}
		// we're good, lets join the match!
		api.models.match.model.findOne({
			_id: data.params.id
		}).exec(function(err, match) {
			if (err) {
				data.response.error = 1;
				data.response.message = ""+err;
				return next();
			}
			if (!match) {
				data.response.error = 1;
				data.response.message = "No match found by that name";
				return next();
			}
			connection.user.currentMatch = match;
			connection.user.save(function(err, user) {
				if (err) {
					data.response.error = 1;
					data.response.message = ""+err;
					data.response.extra = "Successfully created the match but attaching it to the user failed..";
					return next();
				}
				data.response.match = match.toJSON({
					virtuals: true
				});
				return next();
			});
		});
	}
};
