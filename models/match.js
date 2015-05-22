var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = mongoose.Types;

var matchSchema = mongoose.Schema({
	players: [{
		player: 	{ type: Schema.Types.ObjectId , required: true },
		mmr: 		{ type: Number , required: true },
		
		position: 	{ type: String , enum: [ 'defense', 'offense', 'mixed', 'standing' ] , required: true },
		team: 		{ type: Number , min: 0 , max: 1 },
		adjustedMMR:{ type: Number }
	}],

	type: 		{ type: String , enum: [ '1v1', '2v2', 'foosbeer' ] },
	state: 		{ type: String , enum: [ 'done', 'open', 'active' ] , default: 'open' }
});

// matchSchema.virtual('full_name').get(function () {
// 	return this.first_name + ' ' + this.last_name;
// });

function getKFactor(mmr) {
	if (mmr < 100) {
		return 64;
	} else if (mmr >= 100 && mmr < 500) {
		return 32;
	} else if (mmr >= 500) {
		// eaze from 500 to 1000 approaching 16
		return 32 - (16 * (mmr/500 - 1));
	} else {
		return 16; // master! mwahahaha!
	}
}

function getElo(score0, score1) {
	// still just elo
	return 1/(1+Math.pow(10, (score1 - score0)/400));
}

function calculateTeamScores(team, scoreChange, matchID) {
	scoreChange = Math.round(scoreChange * (team.length));
	team.forEach(function(player) {
		var User = require('./user'),
			averageMMRWithoutMe = (team.length > 1) 
				? team.filter(function(otherPlayer) {
						return player !== otherPlayer;
					}).reduce(function(score, otherPlayer) {
						return otherPlayer.mmr + score;
					}, 0) / (team.length - 1)
				: player.mmr*10,
			myElo = (team.length > 1) ? getElo(averageMMRWithoutMe, player.mmr) : 1;

		player.adjustedMMR = player.mmr + scoreChange * myElo;
		console.log(player.player);
		User.model.findOne({_id: player.player }, function(err, user) {
			if (err || !user) {
				return;
			}
			if (user.currentMatch && user.currentMatch.toString() !== matchID.toString()) {
				console.log("What is this match?", user.currentMatch);
				return;
			}
			// force a round at the last minute..
			user.mmr = ~~player.adjustedMMR;
			user.currentMatch = null;
			user.save();
		});
	});
}

matchSchema.methods.processScores = function(score0, score1) {
	var team0 = this.players.filter(function(player) {
			return player.team === 0;
		}),
		team1 = this.players.filter(function(player) {
			return player.team === 1;
		}),
		team0MMR = team0.reduce(function(score, player) {
			return score + player.mmr;
		}, 0),
		team1MMR = team1.reduce(function(score, player) {
			return score + player.mmr;
		}, 0),
		team0AverageMMR = team0MMR/team0.length,
		team1AverageMMR = team1MMR/team1.length,
		team0ExpectedScore = getElo(team0MMR, team1MMR),
		team1ExpectedScore = getElo(team1MMR, team0MMR),
		team0Score = score0 > score1 ? 0 : 1,
		team1Score = 1 - team0Score,
		team0K = getKFactor(team0AverageMMR),
		team1K = getKFactor(team1AverageMMR),
		team0MMRAdjustment = team0K * (team0Score - team0ExpectedScore),
		team1MMRAdjustment = team1K * (team1Score - team1ExpectedScore);


	calculateTeamScores(team0, team0MMRAdjustment, this._id);
	calculateTeamScores(team1, team1MMRAdjustment, this._id);

	this.state = 'done';
	this.save();
};

// Create the mongoose model
var _model = mongoose.model('Match', matchSchema);

module.exports = {    
	schema : matchSchema,
	model : _model
};
