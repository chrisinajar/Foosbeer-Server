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

			api.log(match.players.length);
			api.log(match.toJSON().players);

			match.players = _(match.players).chain()
				.filter(function(player) {
					return !!player;
				})
				.map(function(player) {
					if (player.player.toString() === connection.user._id.toString()) {
						found = true;
						player.position = data.params.position;
						player.team = data.params.team;
						player.winner = data.params.winner;

						player.player = connection.user._id;
						player.mmr = connection.user.mmr;
					}
					return player;
				})
				.value();

			if (!found) {
				api.log("Player not found in match array, pushing");
				api.log(connection.user._id);
				match.players.push({
					position: data.params.position,
					team: data.params.team,
					winner: data.params.winner,

					player: connection.user._id,
					mmr: connection.user.mmr
				});
			}

			api.log(match.players.length);
			api.log(match.toJSON().players);

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
