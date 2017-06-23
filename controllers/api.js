
var GitRepo = require("../GitRepo.js");
var Promise = require("promise");
var moment = require("moment");

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
					app.models.Release.findOne({name:release.name , application: release.application}).limit(1).then(function(targetRelease){
						if (targetRelease) {
							console.log("release %s already exits", release.name)
							res.status(200);
							res.json(targetRelease)
							return;
						}else{

							application.lastRelease().then(function(lastRelease){
								release.compare = lastRelease;

								var gitRepo = new GitRepo( application.repository.owner ,application.repository.name);

								gitRepo.commits(release.name, release.compare).then(commits=>gitRepo.withDiff(commits)).then(function(commits){

									release.commits = commits;
									release._application = application;
									release.save().then(function(release){
										res.status(201);
										res.json(release);
									}, err => errorHandler(err,res));

								}, err => errorHandler(err,res));
							},err => errorHandler(err,res));
						}

					}, err => errorHandler(err,res));

				}).catch(err => errorHandler(err,res));

			},
			get: function(req,res){

				var application = req.params.app_name;
				var createdDate = req.query.created;

				if (createdDate) {
					var validDate = moment(createdDate, 'YYYY-MM-DD', true).isValid();
					if (validDate){
						let momentCreateDate = moment(createdDate)
						let createdDateUntil = momentCreateDate.clone().add(1,"day").format();
						let createdDateSince = momentCreateDate.format();

						app.models.Release.find({application:application, created:{$gte: createdDateSince,$lt: createdDateUntil} },{_id:false,commits:false }, {sort:{"reference.created":1}},function(err, releases){
									 if (releases.length > 0){
										 res.json(releases);
					 				   res.status(200);
									 }else{
										 errorHandler("release pela data " + createdDateSince +" não foi encontrada", res, 404);
										 return;
									 }
			            });

							return
					}

					errorHandler("data invalida", res, 400);
					return;
				}
				app.models.Release.find({application:application},{_id:false,commits:false }, {sort:{"reference.created":1}},function(err, releases){
	                res.json(releases);
	            });

			},
			delete: function(req,res){

				let applicationName = req.params.app_name;
				let releaseName = req.params.name;
				app.models.Application.findOne({name:applicationName},{_id:false }).then(function(application){
					if (!application) {
							errorHandler("application " + applicationName +" not found", res, 404);
							return;
					}
					app.models.Release.findOne({name:releaseName , application: applicationName}).limit(1).then(function(release){
						if (!release) {
								errorHandler("release " + releaseName +" not found", res, 404);
								return;
						}
						application.lastRelease().then(function(lastReleaseName){

							if(release.name==lastReleaseName){
								 app.models.Release.remove({name:release.name}).then(function(){
								 	res.status(204);
								 	res.end();
								 }).catch(err => errorHandler(err,res));
							}else{

								application.afterRelease(release).then(function(afterRelease){

									afterRelease.compare = release.compare

									var gitRepo = new GitRepo( application.repository.owner ,application.repository.name);

									gitRepo.commits(afterRelease.name, afterRelease.compare).then(commits=>gitRepo.withDiff(commits)).then(function(commits){

										afterRelease.commits = commits;
										afterRelease._application = application;

										afterRelease.save().then(function(releaseUpdate){
											app.models.Release.remove({name:release.name}).then(function(){
		 								 	res.status(204);
		 								 	res.end();
		 								 }).catch(err => errorHandler(err,res));
										}, err => errorHandler(err,res));

									}, err => errorHandler(err,res));

								},err => errorHandler(err,res));

							}
						},err => errorHandler(err,res));
					},err=> errorHandler(err,res));

				 }).catch(err => errorHandler(err,res));
			}
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
	                		releases[i]._application = application;
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
					res.location("/apps/" + app.name);
					res.status(201);
					res.end();
				})

			},
			get: function(req,res){

				app.models.Application.find().then(function(apps){
					res.json(apps);
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

					team.save(function(err,team){

						if (err){
							console.error(err);
							res.status(400);
							res.end();
							return;
						}
						console.log("Application %s with %s Team members", team.application, team.amount)

						app.models.Release.sync(team);

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
