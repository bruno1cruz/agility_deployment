
function ReleaseQueue(eventSub,gitRepo) {
   this.event = eventSub;
   this.event.add("create.release");
   this.event.add("create.release.commit.error");
   this.gitRepo = gitRepo;
   this.event.getConnection().on("message", function (channel, message) {
       if(channel == "create.release"){
           this._createRelease(message)
       }else{
           this._errorRelease(message)
       }
   });
}


ReleaseQueue.prototype._createRelease = function(msg) {
  var commits = JSON.parse(message, (key, value) => {
                  if (typeof value === 'string') {
                    return value.toUpperCase();
                  }
                  return value;
                });

  this.gitRepo.withDiff(commits).then(function(commits){
      console.log("retornou")
  });
};

ReleaseQueue.prototype._errorRelease = function(msg) {
  console.log(msg)
};

module.exports = function(eventSub, gitRepo) {
  return new ReleaseQueue(eventSub,gitRepo);
};
