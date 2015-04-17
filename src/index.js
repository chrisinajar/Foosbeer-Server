// before absolutely anything else!
require('pmx').init();

var app = require('./app');

require('./schema');
require('./plugins');

app.start();

