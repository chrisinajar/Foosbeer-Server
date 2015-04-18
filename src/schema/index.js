// require schema files here!
var app = require('../app');
var fs = require('fs');

fs.readdir(__dirname, function(err, files) {
	files.forEach(function(file) {
		if (file === 'index.js') {
			return;
		}
		var data = require('./' + file);
	});
});
