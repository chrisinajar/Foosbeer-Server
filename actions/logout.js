exports.logout = {
	name: 'logout',
	description: 'ends the user session',
	inputs: {
		'required' : [],
		'optional' : []
	},
	// authorisedGroups: void(0),
	blockedConnectionTypes: [],
	outputExample: {
	},
	run: function(api, connection, next){
		api.session.delete(connection, next);
	}
};
