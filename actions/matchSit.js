var _ = require('underscore');

exports.matchSit = {
	name: 'matchSit',
	description: 'Change the position of your user in your match.',

	inputs: {
		position: 	{ type: String , enum: [ 'defense', 'offense', 'mixed' ] , required: true },
		team: 		{ type: Number , min: 0 , max: 1 },
		winner: 	{ type: Number , min: 0 , max: 1 }
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

			match.players = _(match.players).map(function(player) {
				console.log(player.player , connection.user._id);
				console.log(player.player instanceof require('mongoose').Types.ObjectId);
				console.log(connection.user._id instanceof require('mongoose').Types.ObjectId);
				if (player.player.toString() === connection.user._id.toString()) {
					player.position = data.params.position;
					player.team = data.params.team;
					player.winner = data.params.winner;
				}
			});

			match.save(function(err, match) {
				if (err) {
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
