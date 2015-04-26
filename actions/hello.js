exports.hello = {
	name: 'hello',
	description: 'I will make suer the user is logged in and return info needed to start up',
	
	outputExample:{
	},

	run: function(api, connection, next) {
		connection.response.success = true;
		connection.response.user = connection.user;
		next();
	}
};