
var GitRepo = require('./GitRepo.js');

module.exports = function(app){

	return {
		release:{
			post: function(req,res){

				var body = req.body;

				var release = new app.models.Release();

				release.application = req.params.app_name;
				release.environment = body.environment;
				release.compare = "recorrencia-6.5.0";
				release.name = body.name;

				new GitRepo().commits(release.name, release.compare).then(function(commits){

					release.commits = commits;

					release.save(function(err){

						if (err){
							console.error(err);
							res.end();
							return;
						}

						res.json(release);
					})

				})

			}
		}
	}

}