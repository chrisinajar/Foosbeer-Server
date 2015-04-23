// literally just defines the app object.
// this is so that other files can require this to get a reference to the app
var actionhero = require("actionhero").actionheroPrototype;
var http = require('http');

var app = {
	radio: require('backbone.radio'),
	start: function(config, fn) {
		// http.listen(4387);
		app.actionhero = new actionhero();
		app.actionhero.start(config, fn);
	}
};


app.Models = {};
app.config = require('../config');

module.exports = app;
