var GitRepo = require("./GitRepo.js");
var redis = require("redis");
var host = 'redis';
var port = 6379;
var sub = redis.createClient(port,host), pub = redis.createClient(port,host);

module.exports = {
    createRelease: function(application,release){
      var gitRepo = new GitRepo( application.repository.owner ,application.repository.name);
      gitRepo.commits(release.name, release.compare).then(function(commits){
        pub.publish("create.release", JSON.stringify(commits));
      });
    }
};

sub.on("message", function (channel, message) {
  var commits = JSON.parse(message, (key, value) => {
                  if (typeof value === 'string') {
                    return value.toUpperCase();
                  }
                  return value;
                });

  console.log("sub channel " + channel + ": " + commits[0].hash);

});

sub.subscribe("create.release");
