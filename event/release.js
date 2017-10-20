var logger = require("../infra/logger/logger.js");

function ReleaseEvent(eventPub) {
  this.eventPub = eventPub;
}

ReleaseEvent.prototype.publishCreateRelease = function(msg) {
      console.log("release enviando...")
      this.eventPub.getConnection().publish("create.release", JSON.stringify(msg));
};

ReleaseEvent.prototype.publishRetryCommit = function(msg) {
};

ReleaseEvent.prototype.publishErrorCommit = function(msg){
 this.eventPub.getConnection().publish("create.release.commit.error", JSON.stringify(msg));
};

module.exports = function(eventPub) {
  return new ReleaseEvent(eventPub);
};
