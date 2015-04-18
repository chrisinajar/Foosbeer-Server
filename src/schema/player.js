var app = require('../app');

module.exports = app.define({
	name: 'Player',

	attributes: {
		/*
		    name:    { type: String , default: 'Default' , required: true , max: 80 },
		    balance: { type: Number , default: 0 , required: true },
		    host:    { type: String , default: 'localhost', required: true , max: 120 },
		    port:    { type: Number , default: 8332, required: true },
		    user:    { type: String , default: 'default', max: 40 },
		    pass:    { type: String , default: 'default', max: 40 },
		    timeout: { type: Number , default: 30000 }
		*/
		id: 	{ type: Number , id: true },

		name: 	{ type: String , default: 'Player Name' , required: true , max: 120 },
		mmr: 	{ type: Number , default: 500 , required: true , min: 0 }
	},
	methods: {
	}
});
