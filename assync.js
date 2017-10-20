
var redisClient = require('./infra/message/clientRedis.js');
var clientSub = redisClient().getClient(), clientEvent = redisClient().getClient();

var eventPublish = require('./infra/message/eventPublish.js')(clientEvent);
var eventSub = require('./infra/message/eventSub.js')(clientSub);

var releaseEvent = require('./event/release.js')(eventPublish);
var releaseQueue = require('./queue/release.js')(eventSub);
var GitRepo = require("./GitRepo.js");

module.exports = {
    createRelease: function(release,application){
      var gitRepo =  new GitRepo(application.repository.owner ,application.repository.name,releaseEvent);
      releaseQueue.setGitInfo(gitRepo);
      releaseEvent.publishCreateRelease(release);
      return
    }
};
