
var GitRepo = require("../GitRepo.js");
var Promise = require("promise");

module.exports = function(app){

	return {
		release:{
			post: function(req,res){

				var body = req.body;

				var release = new app.models.Release();

				release.application = req.params.app_name;
				release.environment = body.environment;
				release.reference = body.reference;
				release.name = body.name;

				app.models.Application.findOne({name:release.application},{_id:false }).then(function(application){


					if (!application) {
						errorHandler("application " + release.application+" not found", res, 404);
						return;
					}

					application.lastRelease().then(function(lastRelease){

						release.compare = lastRelease;

						var gitRepo = new GitRepo( application.repository.owner ,application.repository.name);

						gitRepo.commits(release.name, release.compare).then(commits=>gitRepo.withDiff(commits)).then(function(commits){

							release.commits = commits;

							release.save().then(function(release){
								res.status(201);
								res.json(release);
							}, err => errorHandler(err,res));

						}, err => errorHandler(err,res));
					},err => errorHandler(err,res));

				}).catch(err => errorHandler(err,res));

			},
			get: function(req,res){

				var application = req.params.app_name;

				app.models.Release.find({application:application},{_id:false,commits:false }, {sort:{"reference.created":1}},function(err, releases){
	                res.json(releases);
	            });

			},
		},
		refresh:{
			get: function(req,res){

				app.models.Application.findOne({name: req.params.app_name},{_id:false }).then(function(application){

					if (!application) {
						errorHandler("application " + req.params.app_name +" not found", res, 404);
						return;
					}

					app.models.Release.find({application:req.params.app_name},function(err, releases){
	                	for (var i = 0; i < releases.length; i++){
	                		releases[i].save();
	                		console.log("release " + releases[i].name + " refreshed");
	                	}
	            	});

					res.status(202);
					res.end();

				}).catch(err => errorHandler(err,res));

			}
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
					console.log("Application %s created", app.name)
					res.status(201);
					res.location("/apps/" + app.name);
					res.end();
				})


			}

		},
		team:{
			post: function(req,res){
				var team = new app.models.Team(req.body);
				team.application = req.params.app_name;				

				app.models.Application.findOne({name: team.application},{_id:false }).then(function(application){

					if (!application) {
						errorHandler("application " + req.params.app_name +" not found", res, 404);
						return;
					}

					team.save(function(err){

						if (err){
							console.error(err);
							res.status(400);
							res.end();
							return;
						}
						console.log("Application %s with %s Team members", team.application, team.amount)
						res.status(204);
						res.end();
					})


				});

			}
		}
	}

}

function errorHandler(err, response, statusCode){
	statusCode = statusCode || 500;
	console.error(err);
	response.status(statusCode);
	var message = err instanceof Error ? err.message : err
	response.json({"message" : message});
}