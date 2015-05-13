var _ = require('underscore');

exports.logout = {
	name: 'matchUpdate',
	description: 'Write a new version of this match. Used for setting players or changing match type.',

	inputs: {
		players: [{
			player: {},
			team: {},
			position: {}
		}],
		type: { type: 'string' }
	},
	outputExample: {
		data: {
		}
	},
	run: function(api, data, next) {
		var connection = data.connection;

		if (connection.user.match_state === 'inactive') {
			data.response.error = 1;
			data.response.message = "You are not currently in a match.";
			return next();
		}
		connection.user.getMatch(function(err, match) {
			var addedUsers = _(match.players).pluck('player'),
				removedUsers = _(data.params.players).pluck('player');

			removedUsers = _(removedUsers).invoke('toString');
			addedUsers = _(addedUsers).invoke('toString');

			if (err) {
				data.response.error = 1;
				data.response.message = ""+err;
				return next();
			}
			if (match == null) {
				data.response.error = 1;
				data.response.message = "Your match is missing?";
				return next();
			}

			match.players.forEach(function(player) {
				removedUsers = _.without(removedUsers, player.player.toString());
			});
			data.params.players.forEach(function(player) {
				addedUsers = _.without(addedUsers, player.player._id || player.player);
			});

			console.log(addedUsers, removedUsers);
			// do something with added and removed users.
			// YOU KNOW YOU SHOULD


			_.extend(match, data.params);
			match.save(function(err, match) {

				if (err) {
					data.response.error = 1;
					data.response.message = ""+err;
					return next();
				}
				if (match == null) {
					data.response.error = 1;
					data.response.message = "Oh god we broke the match.";
					return next();
				}
				data.response.match = match.toJSON({
					virtuals: true
				});
				next();
			})
		});

	}
};
