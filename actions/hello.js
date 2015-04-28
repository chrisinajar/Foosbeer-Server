exports.hello = {
	name: 'hello',
	description: 'I will make suer the user is logged in and return info needed to start up',
	
	outputExample:{
	},

	run: function(api, data, next) {
		var connection = data.connection;
		data.response.success = true;
		data.response.user = connection.user;
		next();
	}
};
