var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
var Types = mongoose.Types;

var userSchema = mongoose.Schema({
	uid: 	{ type: String , id: true, required: true },

	id: 	{ type: String , require: true },
	authType: { type: String , required: true },

	profile: { type: Object },

	name: 	{ type: String , default: 'Player Name' , required: true , max: 120 },
	email: 	{ type: String , required: true },
	mmr: 	{ type: Number , default: 500 , required: true , min: 0 }
});

userSchema.plugin(findOrCreate);

// userSchema.virtual('full_name').get(function () {
// 	return this.first_name + ' ' + this.last_name;
// });

// Create the mongoose model
var _model = mongoose.model('User', userSchema);
var _findByEmail = function(email, success, fail) {
	_model.findOne({email:email}, function(e, result) {
		if(e) {
			fail(e);
		} else {
			success(result);
		}
	});
};

module.exports = {    
	schema : userSchema,
	model : _model,
	findByEmail : _findByEmail
};