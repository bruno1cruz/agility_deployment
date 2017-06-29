
var GitRepo = require("../GitRepo.js");
var _ = require("lodash");
var logger = require("../logger/logger.js");
var Promise = require("promise");

module.exports = function(app){

	return {
		release:{
			post: function(req,res){
				var body = req.body;
				var releaseBody = _.pick(body,['release']);

				var release = new app.models.Release(_.get(releaseBody, 'release'));

				app.models.Application.findOne({name:req.params.app_name},{_id:false }).then(function(application){
					if (!application) {
						var appBody = _.pick(body,['application']);
						var application = new app.models.Application(_.get(appBody, 'application'));

						logger.info(`Application ${application.name} not found, creating it...`);
						application.save(function(err,application){
							if (err){
								errorHandler("Error when saving to MongoDB",err,400);
								res.status(400);
								res.end();
								return;
							}
							logger.info(`Application ${application.name} created sucessfully!`)
							res.location("/apps/" + application.name);
						});
					}
					app.models.Release.findOne({name:release.name , application: application.name}).limit(1).then(function(targetRelease){
						if (targetRelease) {
							logger.info(`Release ${release.name} already exist!`)
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

				app.models.Release.find({application:application},{_id:false,commits:false }, {sort:{"reference.created":1}},function(err, releases){
	                res.json(releases);
	            });

			},
			delete: function(req,res){

				let applicationName = req.params.app_name;
				let releaseName = req.params.name;

				app.models.Application.findOne({name:applicationName},{_id:false }).then(function(application){

					if (!application) {
							errorHandler(`Application ${applicationName} not found`, res, 404);
							return;
					}
					app.models.Release.findOne({name:releaseName , application: applicationName}).limit(1).then(function(release){
						if (!release) {
								errorHandler(`Release ${releaseName} not found`, res, 404);
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
						errorHandler(`Application ${req.params.app_name} not found`, res, 404);
						return;
					}

					app.models.Release.find({application:req.params.app_name},function(err, releases){
	                	for (var i = 0; i < releases.length; i++){
	                		releases[i]._application = application;
	                		releases[i].save();
											logger.info(`Release ${releases[i].name} refreshed`);
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
				var appBody = _.pick(body,['application']);
				var application = new app.models.Application(_.get(appBody, 'application'));

				application.save(function(err,app){
					if (err){
						errorHandler("Error when saving to MongoDB",err,400);
						res.status(400);
						res.end();
						return;
					}
					logger.info(`Application ${app.name} created`)
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
						errorHandler(`Application ${req.params.app_name} not found`, res, 404);
						return;
					}

					team.save(function(err,team){

						if (err){
							errorHandler("Error when saving to MongoDB",err,400);
							res.status(400);
							res.end();
							return;
						}
						logger.info(`Application ${team.application} with ${team.amount} Team members`)

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
	response.status(statusCode);
	var message = err instanceof Error ? err.message : err
	logger.error(`${message}`, { stacktrace: err, statusCode: statusCode});
	response.json({"message" : message});
}
