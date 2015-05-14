var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = mongoose.Types;

var matchSchema = mongoose.Schema({
	players: [{
		player: 	{ type: Schema.Types.ObjectId , required: true },
		mmr: 		{ type: Number , required: true },
		
		position: 	{ type: String , enum: [ 'defense', 'offense', 'mixed', 'standing' ] , required: true },
		team: 		{ type: Number , min: 0 , max: 1 },
		winner: 	{ type: Number , min: 0 , max: 1 }
	}],

	type: 		{ type: String , enum: [ '1v1', '2v2', 'foosbeer' ] },

	winner: 	{ type: Number , min: 0 , max: 1 },
	state: 		{ type: String , enum: [ 'done', 'open', 'active' ] , default: 'open' }
});

// matchSchema.virtual('full_name').get(function () {
// 	return this.first_name + ' ' + this.last_name;
// });

// Create the mongoose model
var _model = mongoose.model('Match', matchSchema);

module.exports = {    
	schema : matchSchema,
	model : _model
};
