// just the connection so that actionhero waits for mongoose
var mongoose = require('mongoose');
var config = require('../config');

module.exports = {

	initialize: function(api, next) {
		mongoose.createConnection(config.services.mongo.host).once('connected', function() {
			api.log('Connected to mongodb');
			next();
		});

		api.log('This initializer ran!');
	}
};
