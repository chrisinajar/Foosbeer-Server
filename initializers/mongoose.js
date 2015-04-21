// // just the connection so that actionhero waits for mongoose
var mongoose = require('mongoose');
var config = require('../config');

var fs = require('fs');


module.exports = {

	loadPriority:  200,
	startPriority: 200,
	stopPriority:  200,

	initialize: function(api, next) {
		next();
	},

	start: function(api, next) {
		// mongoose.set('debug', true);

		api.log('Connecting to mongodb!');
		
		mongoose.connect(api.config.mongoose.connection_string);

		api.mongodb = mongoose.connection;

		api.mongodb.once('open', function() {
			api.log('Connected to mongodb');

			if (!api.models) {
				api.models = {};
			}
			fs.readdir(__dirname + '/../models', function(err, files) {
				if (err) {
					api.log(err);
					return next();
				}
				files.forEach(function(file) {
					var nameParts = file.split("/");
					var name = nameParts[(nameParts.length - 1)].split(".")[0];

					if(name.indexOf('-') > -1) {
						name = name.split("-")[1];
					}
					api.log("Loading model: " + name);

					api.models[name] = require(__dirname + '/../models/' + file);
				});
				next();
			});
		});
		api.mongodb.on('error', function() {
			api.log("MongoDB error:", arguments);
		});
	},
	stop: function(api, next){
		// disconnect from server
		api.mongodb.once('close', next);
		mongoose.disconnect();
	}
};
