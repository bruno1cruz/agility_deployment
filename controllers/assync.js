const Joi = require('joi');
var GitRepo = require("../GitRepo.js");
const schema = require("./schema/release.js");
var logger = require("../infra/logger/logger.js");
var assync = require("../assync.js")
module.exports = function(app){

	return {
		releases:{
      release:{
        post: function(req,res){
            Joi.validate(req.body, schema.create, (err, value) => {
              if (err){
                errorHandler(err,res,400)
                res.end();
                return
              }else{
                var release = value
                release.application = req.params.app_name;
                app.models.Application.findOne({name:release.application},{_id:false })
                .then(function(application){
                  if (!application) {
                    errorHandler(`Application ${release.application} not found`, res, 404);
                    return;
                  }
                  app.models.Release.findOne({name:release.name , application: release.application})
                  .limit(1)
                  .then(function(targetRelease){
                    if (targetRelease) {
                      logger.info(`Release ${release.name} already exist!`)
                      res.status(200);
                      res.json(targetRelease)
                      return;
                    }else{
                      application.lastRelease().then(function(lastRelease){
                        release.compare = lastRelease;
												var gitRepo = new GitRepo(application.repository.owner ,application.repository.name);
												assync.createRelease(release,gitRepo,app);
												console.log("passou aqui")

												res.end()
                      });
                    }
                  });//jogar error
                });//jogar error
                res.end()
              }

            });

        },
				status:{
					 get: function(req,res){

					 }
				}
      }
    }
  }
}

function errorHandler(err, response, statusCode){
	statusCode = statusCode || 500;
	response.status(statusCode);
	var message = err instanceof Error ? err.details[0].message : err
	logger.error(`${message}`, { stacktrace: err, statusCode: statusCode});
	response.json({"message" : message});
}
