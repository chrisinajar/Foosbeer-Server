// literally just defines the app object.
// this is so that other files can require this to get a reference to the app

var Maki = require('maki');
var app = new Maki(require('../config'));

module.exports = app;