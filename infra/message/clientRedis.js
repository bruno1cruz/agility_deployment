var redis = require("redis");

function RedisClient() {
  this.host = 'redis';
  this.port = 6379;
}

RedisClient.prototype.getClient = function() {
  return redis.createClient(this.port,this.host);
};

module.exports = function() {
  return new RedisClient();
};
