// before absolutely anything else!
require('pmx').init();

var app = require('./app');
var config = require('../config');

require('./plugins');

app.start(config, function() {
	console.log("Initialized!");
});
