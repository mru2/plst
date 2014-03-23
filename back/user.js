// Handle users logic
// TODO : login/logout (clear timeouts)
//        vote counts
//        timeouts

// Dependencies
var Adapter = require('./adapter.js');

// User model
var User = function(roomId, socket) {
  this.roomId = roomId;
  this.socket = socket;

  // Create in redis if missing
  // Bind to redis pubsub

  // socket.emit('bootstrapUser', Adapter.getUser(this.id));
}



module.exports = User;
