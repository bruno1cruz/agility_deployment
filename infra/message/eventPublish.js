function EventPublish(connection) {
  this.connection = connection
}

EventPublish.prototype.getConnection = function() {
  return this.connection;
};

module.exports = function(connection) {
  return new EventPublish(connection);
};
