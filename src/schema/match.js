var app = require('../app');

module.exports = app.define({
	name: 'Match',

	attributes: {
		matchType: 	{ type: String , default: 'doubles' }

	}
});
