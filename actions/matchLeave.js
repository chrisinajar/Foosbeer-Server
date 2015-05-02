var _ = require('underscore');

exports.logout = {
	name: 'matchLeave',
	description: 'Leave the match you\'re currently a part of',

	inputs: {
	},
	outputExample: {
		data: {
		}
	},
	run: function(api, data, next) {
		var connection = data.connection,
			userSaveError = false,
			matchSaveError = false;
		if (connection.user.match_state === 'inactive') {
			data.response.error = 1;
			data.response.message = "You are not currently in a match.";
			return next();
		}

		function checkFinish() {
			console.log("Checking finished", userSaveError, matchSaveError);
			if (userSaveError || matchSaveError) {
				data.response.error = 1;
				data.response.message = ""+(userSaveError || matchSaveError);
				return next();
			}
			if (userSaveError === null && matchSaveError === null) {
				data.response.success = true;
				return next();
			}
		}

		connection.user.currentMatch = null;
		connection.user.save(function(err, user) {
			userSaveError = err;
			checkFinish();
		});

		connection.user.getMatch(function(err, match) {
			if (err) {
				data.response.error = 1;
				data.response.message = ""+err;
				return next();
			}
			if (match == null) {
				return next();
			}

			if (match.players.length === 1) {
				return match.remove(function(err, match) {
					matchSaveError = err;
					checkFinish();
				});
			}
			match.players = _(match.players).filter(function(player) {
				return player.player._id !== connection.user._id;
			});
			match.save(function(err, user) {
				matchSaveError = err;
				checkFinish();
			});
		});

	}
};
