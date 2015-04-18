// before absolutely anything else!
require('pmx').init();

var app = require('./app');
var config = require('../config');

require('./plugins');
require('./schema');

app.start(config, function() {
	console.log("Initialized!");
});
