exports.hello = {
	name: 'hello',
	description: 'I will make suer the user is logged in and return info needed to start up',
	
	outputExample:{
	},

	run: function(api, data, next) {
		var connection = data.connection;
		data.response.success = true;
		if (connection.user.currentMatch) {
			connection.user.getMatch(function(err, match) {
				if (err) {
					data.response.error = 1;
					data.response.message = "Failed to populate match for user";
					return next();
				}
				data.response.user = connection.user.toJSON({
					virtuals: true
				});
				if (match) {
					console.log(match);
					data.response.user.currentMatch = match.toJSON({
						virtuals: true
					});
				}
				next();
			});
		} else {
			data.response.user = connection.user.toJSON({
				virtuals: true
			});
			next();
		}
	}
};
