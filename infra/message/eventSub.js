function EventSub(connection) {
  this.connection = connection
}

EventSub.prototype.add = function(channel) {
  this.connection.subscribe(channel);
};

EventSub.prototype.getConnection = function(channel) {
  return this.connection;
};

module.exports = function(connection) {
  return new EventSub(connection);
};
