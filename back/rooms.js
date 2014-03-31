// NOTE : assume multiple socket servers
// server RAM handle sockets only
// data is only persisted in redis, 
// class is just an interface to get it
// Assume the user may connect to another
// front and keep the service


// Dependencies
var _       = require('lodash'),
    User    = require('./user.js'),
    Track   = require('./track.js'),
    Adapter = require('./adapter.js');


// Local variables
var _rooms = {}; // id => room object


// Room model
var Room = function(roomId){
  console.log('building room with id', roomId);
  this.id = roomId;
  this.users = {};  // Users already bound to their socket
  this.tracks = {}; // Tracks with TTL handled
  this.bindListeners();
};

Room.prototype.connect = function(userId, socket) {

  // Create the user if missing (needed? Redis ~= RAM...)
  var user;
  if ( !_.has(this.users, userId) ){
    user = new User(this.id, socket);
    this.users[userId] = user;
  }
  else {
    user = this.users[userId];
  }

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

  // Listen to room-intended messages
  socket.on('addTrack', function(trackData, cb){
    Adapter.addTrack(self.id, trackData)
    .then(function(added){
      console.log('addTrack result', added);
      if (added) {
        console.log('TRACK ADDED', trackData);

        // If track added, handle its TTL, and notify everyone
        trackData.score = 1;

        self.tracks[trackData.id] = new Track(trackData);

        Adapter.notifyTrackAdded(self.id, trackData);
      }
      cb(added);
    }).done();
  });
};

Room.prototype.bindListeners = function(){

  var self = this;

  // Watch room updates
  // TOCHECK
  this.newTracksListener = Adapter.newTracksListener(this.id);
  this.newTracksListener.on('message', function(channel, message){
    console.log('newTracksListener ping : ', message);
    var trackDetails = JSON.parse(message);
    self.broadcast('newTrack', trackDetails);
    
  });


  // // Bind room-wide publishes
  // Adapter.onNewTrack(this.id, function(trackData){
  //   socket.emit('newTrack', trackData);
  // });

  // Adapter.onRemoveTrack(this.id, function(trackId){
  //   socket.emit('removeTrack', trackId);
  // });

  // Adapter.onUpdateTrack(this.id, function(trackData){
  //   socket.emit('updateTrack', trackData);
  // });


  // Unbind : socket.removeAllListeners("...");
};


Room.prototype.sockets = function(){
  // Get all connected sockets
  return _.map(this.users, function(user){
    return user.socket;
  });
};


Room.prototype.broadcast = function(event, data){
  _.each(this.sockets(), function(socket){
    socket.emit(event, data);
  });
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