var _ = require('underscore');

exports.matchFinish = {
	name: 'matchFinish',
	description: 'Finish the match...',

	inputs: {
		scoreOne: {required: true },
		scoreTwo: { required: true }
	},
	outputExample: {
		data: {
		}
	},
	run: function(api, data, next) {
		var connection = data.connection;
		if (!connection.user.currentMatch) {
			data.response.error = 1;
			data.response.message = "You are not currently in a match";
			return next();
		}

		// get the match real quick..
		connection.user.getMatch(function(err, match) {
			var found = false;

			if (err) {
				data.response.error = 1;
				data.response.message = "" + err;
				return next();
			} else if (!match) {
				data.response.error = 1;
				data.response.message = "No match found!";

				connection.user.currentMatch = null;
				connection.user.save();

				return next();
			}

			// todo: stuff!
			match.processScores(data.params.scoreOne, data.params.scoreTwo);
			match.save(function(err, match) {
				if (err) {
					api.log(""+err);
					api.log(err);
					data.response.error = 1;
					data.response.message = "" + err;
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
