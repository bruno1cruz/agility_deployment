
var GitRepo = require('./GitRepo.js');

module.exports = function(app){

	return {
		release:{
			post: function(req,res){

				var release = "master";
				var last_release = "feature/property-and-offer";

				new GitRepo().commits(release, last_release).then(function(commits){
					res.json(commits)
				})

			}
		}
	}

}