
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
							res.status(400);
							res.end();
							return;
						}
						
						res.status(201);
						res.json(release);
					})

				})

			},
			get: function(req,res){

				var application = req.params.app_name;

				app.models.Release.find({application:application},{_id:false }, {sort:{_id:-1}},function(err, releases){
	                res.json(releases);
	            });

			},
		},
		application:{

			post: function(req,res){

				var body = req.body;
				var application = new app.models.Application(body);

				application.save(function(err,app){
					if (err){
							console.error(err);
							res.status(400);
							res.end();
							return;
						}
						
						res.status(201);
						res.location("/apps/" + apps.name);
				})


			}

		}
	}

}