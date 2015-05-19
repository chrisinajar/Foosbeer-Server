exports.matchList = {
	name: 'matchList',
	description: 'Lists all matches in a given state, defaults to open',

	// inputs: {
	// 	state: {}
	// },
	// outputExample: {
	// 	// realtime messages at some point?
	// },
	run: function(api, data, next) {
		var query = api.models.match.model.find({
			state: 'open'
		});
		query.exec(function(err, matches) {
			if (!matches) {
				data.response.message = "No matches!?";
				return next();
			}
			// api.chatRoom.addMember(data.connection.id, 'office', function() {
			// 	// done adding member to room..
			// });
			data.response.data = matches.map(function(match) {
				return match.toJSON({
					virtuals: true
				});
			});
			next();
		});
	}
};
