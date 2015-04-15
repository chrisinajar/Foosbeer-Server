var Maki = require('maki');
var app = new Maki(require('../config'));
var pmx = require('pmx');

pmx.action('npm:install', function(reply) {
	require('child_process').exec('npm install', function (error, stdout, stderr) {
		if (error !== null) {
			reply("Error: " + stderr);
		} else {
			reply("Done: " + stdout);
		}
	});
});

app.start();

console.log("It worked!");
