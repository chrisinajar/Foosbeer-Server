var radio = require('backbone.radio');


module.exports = {

	loadPriority:  1,
	startPriority: 1,
	stopPriority:  1,

	initialize: function(api, next) {
		api.radio = radio;
		next();
	}
};
