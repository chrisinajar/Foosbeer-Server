var mongoose = require('mongoose');
var app = require('../app');
var _ = require('underscore');

app.define = function define(name, data) {
	var schema, model;

	if (typeof name === 'object') {
		data = name;
		name = data.name;
	}

	if (app.Models[name]) {
		throw new Error('Model name ' + name + ' already exists!');
	}

	schema = mongoose.Schema(data.attributes);

	model = mongoose.model(name, schema);
	_.extend(model.methods, data.methods);

	app.Models[name] = model;

	return model;
};
