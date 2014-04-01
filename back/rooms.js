// NOTE : assume multiple socket servers
// server RAM handle sockets only
// data is only persisted in redis, 
// class is just an interface to get it
// Assume the user may connect to another
// front and keep the service


// Dependencies
var _       = require('lodash'),
    Adapter = require('./adapter.js');


// Local variables
var _rooms = {}; // id => room object


// Room model
var Room = function(roomId){
  console.log('building room with id', roomId);
  this.id = roomId;
  this.sockets = {};  // Users already bound to their socket
  this.bindListeners();
};

Room.prototype.connect = function(userId, socket) {

  // TODO : Handle new user (publish)

  // Store the user socket
  if (this.sockets[userId]) {
    // Close the exising socket, and clear bindings
  }

  this.sockets[userId] = socket;

  // Bind the socket
  this.bindSocket(socket);

  // Send the bootstrap data
  Adapter.getPlaylist(this.id).then(function(playlist){
    console.log('emitting playlist', playlist);
    socket.emit('bootstrapPlaylist', playlist);
  });

  Adapter.getUser(this.id, userId).then(function(userData){
    socket.emit('bootstrapUser', userData);
  });
};

Room.prototype.disconnect = function(userId, socket) {
  // Clear the user

  // Cleanup the socket
};

Room.prototype.bindSocket = function(socket) {
  var self = this;

  // New track message
  socket.on('addTrack', function(trackData, cb){
    Adapter.addTrack(self.id, trackData).then(cb).done();
  });

  // Upvote message
  socket.on('upvote', function(trackData, cb){
    Adapter.upvoteTrack(self.id, trackData.trackId, trackData.score).then(cb).done();
  });

};

Room.prototype.bindListeners = function(){

  var self = this;

  // Watch room updates
  Adapter.onNewTrack(this.id, function(trackDetails){
    self.broadcast('newTrack', trackDetails);
  });

  Adapter.onUpvoteTrack(this.id, function(trackId, score){
    self.broadcast('upvoteTrack', {trackId: trackId, score: score});
  });

  Adapter.onTrackPlaying(this.id, function(trackId){
    self.broadcast('trackPlaying', trackId);
  });


  // Unbind : socket.removeAllListeners("...");
};


Room.prototype.broadcast = function(event, data){
  _.each(_.values(this.sockets), function(socket){
    socket.emit(event, data);
  });
};

Room.prototype.popTopTrack = function(){
  return Adapter.popTopTrack(this.id);
};

// Exported interface
var Rooms = {};

// Get the room or create it if missing
Rooms.get = function(roomId){
  if ( _.has(_rooms, roomId) ) {
    return _rooms[roomId];
  }
  else {
    var newRoom = new Room(roomId);
    _rooms[roomId] = newRoom;
    return newRoom;
  }
}

module.exports = Rooms;