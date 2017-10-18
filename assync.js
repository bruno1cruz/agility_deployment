
var redisClient = require('./infra/message/clientRedis.js');
var eventPublish = require('./infra/message/eventPublish.js')(redisClient);
var eventSub = require('./infra/message/eventSub.js')(redisClient);

var releaseEvent = require('./infra/event/release.js')(eventSub);
var releaseQueue = require('./infra/queue/release.js');

module.exports = {

    createRelease: function(release,application,gitRepo){
      console.log("criar release")
      gitRepo.commits(release.name, release.compare)
      .then(commits=>gitRepo.withDiffAssync(commits,releaseEvent))
      .then(function(commits){
        release.commits = commits;
        release._application = application;
        console.log(release)
      });
      return
    }
};
