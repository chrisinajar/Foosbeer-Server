var config = require('../config');

var connection_string = "mongodb://";

var mongod = config.services.mongo;

if (mongod.user) {
	connection_string += mongod.user;
	if (mongod.password) {
		connection_string += ":" + mongod.password;
	}
	connection_string += '@';
}

connection_string += mongod.host || 'localhost';
connection_string += ":";
connection_string += mongod.port || 27017;
connection_string += "/";
connection_string += mongod.db || "foosbeer";

exports.default = { 
	mongoose: function(api){
		return {
			auto_start: true,
			connection_string: connection_string,
			debug: true,
			model_path: mongod.db + '/models'
		};
	}
};

// exports.test = { 
// 	mongoose: function(api){
// 		return {
// 			auto_start: false,
// 			connection_string: "mongodb://USER:PASSWORD@HOST:PORT/DATABASE",
// 			debug: false,
// 			model_path: mongod.db + '/models'
// 		}
// 	}
// };

// exports.production = { 
// 	mongoose: function(api){
// 		return {
// 			auto_start: true,
// 			connection_string: "mongodb://USER:PASSWORD@HOST:PORT/DATABASE",
// 			debug: false,
// 			model_path: mongod.db + '/models'
// 		}
// 	}
// };
