
function ReleaseQueue(eventSub) {
   this.event = eventSub;
   this.event.add("create.release");
   this.event.add("create.release.commit.error");
   this.gitRepo;
   var self = this;
   this.event.getConnection().on("message", function (channel, message) {
       if(channel == "create.release"){
           self._createRelease(message)
       }else{
           self._errorRelease(message)
       }
   });
}

ReleaseQueue.prototype.setGitInfo = function(gitRepo) {
  this.gitRepo = gitRepo;
};

ReleaseQueue.prototype._createRelease = function(msg) {
  console.log("release recebida...")
  var release = JSON.parse(msg, (key, value) => {
                  if (typeof value === 'string') {
                    return value.toUpperCase();
                  }
                  return value;
                });
                
 this.gitRepo.commits(release.name, release.compare).then(function(commits){
    console.log(commits)
   });
};

ReleaseQueue.prototype._errorRelease = function(msg) {
  console.log("msg recebida")
  console.log(msg)
};

module.exports = function(eventSub, gitRepo) {
  return new ReleaseQueue(eventSub,gitRepo);
};
