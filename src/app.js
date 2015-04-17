// literally just defines the app object.
// this is so that other files can require this to get a reference to the app
var actionhero = require("actionhero").actionheroPrototype;

var app = new actionhero();

module.exports = app;
