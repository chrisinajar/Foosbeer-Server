exports.logout = {
	name: 'matchCreate',
	description: 'Create a new match between a set of players',

	inputs: {
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
		// we're good, lets start the match!
		var myMatch = new api.models.match.model({
			players: [{
				player: connection.user,
				team: null,
				position: 'mixed',
				mmr: connection.user.mmr
			}]
		});
		myMatch.save(function(err, match) {
			if (err) {
				data.response.error = 1;
				data.response.message = ""+err;
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
