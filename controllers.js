
var GitRepo = require("./GitRepo.js");
var Promise = require("promise");

module.exports = function(app){

	return {
		release:{
			post: function(req,res){

				var body = req.body;

				var release = new app.models.Release();

				release.application = req.params.app_name;
				release.environment = body.environment;
				release.name = body.name;

				app.models.Application.findOne({name:release.application},{_id:false }).then(function(application){


					if (!application) {
						throw new Error("application " + release.application+" not found");
					}

					application.lastRelease().then(function(lastRelease){

						release.compare = lastRelease;

						new GitRepo( application.repository.owner ,application.repository.name).commits(release.name, release.compare).then(function(commits){

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
					res.location("/apps/" + app.name);
				})


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