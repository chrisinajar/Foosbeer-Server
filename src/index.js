// before absolutely anything else!
require('pmx').init();

var Maki = require('maki');
var app = new Maki(require('../config'));

require('./schema');
require('./plugins');

app.start();

console.log("It worked!");
