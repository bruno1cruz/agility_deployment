
var GitRepo = require("../GitRepo.js");
var logger = require("../logger/logger.js");
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
						errorHandler(`Application ${release.application} not found`, res, 404);
						return;
					}
					app.models.Release.findOne({name:release.name , application: release.application}).limit(1).then(function(targetRelease){
						if (targetRelease) {
							logger.info(`Release ${release.name} already exist!`)
							res.status(200);
							res.json(targetRelease)
							return;
						}else{

							application.lastRelease().then(function(lastRelease){
								release.compare = lastRelease;

								var gitRepo = new GitRepo( application.repository.owner ,application.repository.name);

								gitRepo.commits(release.name, release.compare).then(commits=>gitRepo.withDiff(commits)).then(commits=>{

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

				let application = req.params.app_name;
				let release = req.params.name;

				app.models.Release.findOne({application:application, name:release},{_id:false,commits:false }, {sort:{"reference.created":1}},function(err, release){
							if (release){
								 res.json(release);
						 }else{
								 errorHandler("release não foi encontrada", res, 404);
								 return;
						 }
				  });
					return

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
		releases:{
			get: function(req,res){

				var application = req.params.app_name;
				var createdDate = req.query.created;
				var query = {application:application};

				if (createdDate) {
					var validDate = moment(createdDate, 'YYYY-MM-DD', true).isValid();
					if (validDate){
						let momentCreateDate = moment(createdDate)
						let createdDateUntil = momentCreateDate.clone().add(1,"day").format();
						let createdDateSince = momentCreateDate.format();

						query.created = {$gte: createdDateSince,$lt: createdDateUntil};

					} else {
						errorHandler("data invalida", res, 400);
						return;
					}
				}

				app.models.Release.find(query,{_id:false,commits:false }, {sort:{"reference.created":1}},function(err, releases){
									res.json(releases);
							});

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

			issues:{

				put: function(req,res){

					if (!req.body||!req.body.patterns){
						errorHandler("pattern list expected",res,400);
						return;
					}

					app.models.Application.findOne({name: req.params.app_name}).then(function(application){
						if (!application.issues) {
							application.issues={}
						}
						application.issues= {patterns : req.body.patterns};
						application.save();
						res.status(204);
						res.end();
					});


				}

			},
			post: function(req,res){

				var body = req.body;
				var application = new app.models.Application(body);

				application.save(function(err,app){
					if (err){
						errorHandler(err,res,400);
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
		commits:{
			get: function(req,res){
				var date = req.query.date;
				var app_name = req.params.app_name;
				app.models.Commit.find({application: app_name, created: date}).then(function(commits){
					res.json(commits);
				})
			},
			post: function (req,res){

				const body = req.body;

				var commit = new app.models.Commit();
				const new_hash = body.push.changes[0].new.target.hash
				const old_hash = body.push.changes[0].old.target.hash


				const repository = {name:body.repository.name,owner:body.repository.owner.username}
				var gitRepo = new GitRepo( repository.owner ,repository.name);
				gitRepo.commits(new_hash,old_hash).then(commits=>gitRepo.withDiff(commits)).then(commit=>{
					console.log(commit)
					res.status(810).json(commit)
				})
		
			}
		}
	}

}

function errorHandler(err, response, statusCode){
	logger.info(statusCode)
	statusCode = statusCode || 500;
	response.status(statusCode);
	var message = err instanceof Error ? err.message : err
	logger.error(`${message}`, { stacktrace: err, statusCode: statusCode});
	response.json({"message" : message});
}
