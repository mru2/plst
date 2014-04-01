// Configuration
var appPort     = 14001
  , socketPort  = 3457;


// Web apps
var express       = require('express')
  , app           = express()
  , server        = require('http').createServer(app)
  , socketServer  = require('http').createServer()
  , io            = require('socket.io').listen(socketServer)
  , Rooms         = require('./back/rooms.js')

  // , db            = require('./back/db.js');


// Launch apps
// Separate port for sockets for 3G compatibility
server.listen(appPort);
console.log('App listening on port : ' + appPort);

socketServer.listen(socketPort);
console.log('Sockets listening on port : ' + socketPort);


// Static files middleware
app.use(express.static(__dirname + '/front'));




// Pop top track API endpoint
app.delete('/room/:roomId/top', function(req, res){
  var room = Rooms.get(req.params.roomId);

  room.popTopTrack().then(function(trackId){
    console.log('popped top track. response is', trackId);
    res.send(trackId);
  }).done();
});



io.sockets.on('connection', function(socket){

  // No user id nor room id for now
  var socketUserId = null;
  var socketRoomId = null;

  // Actual connection
  socket.on('bootstrap', function(data){

    console.log('APP - connecting', data.userId, 'to room', data.roomId);

    // Store the user/room matching the socket
    socketUserId = data.userId;
    socketRoomId = data.roomId;

    // Get the current room
    var room = Rooms.get(socketRoomId);

    // Bind the socket as a new user
    // Handles bootstraping, and update events
    room.connect(socketUserId, socket);

  });

  // Disconnection
  socket.on('disconnect', function(){

    // Clear the user if defined
    if(socketRoomId && socketUserId) {
      console.log('APP - disconnecting', socketUserId, 'from room', socketRoomId);
      Rooms.get(socketRoomId).disconnect(socketUserId, socket);
    }

  });

});





// // Socket handlers
// io.sockets.on('connection', function (socket) {

//   console.log('SOCKET : connected');
//   socket.emit('connected');

//   // Bootstrap data
//   socket.on('bootstrap', function(userId){

//     db.all().then(function(playlist){
//       socket.emit('bootstrap', playlist);
//     }).done();

//     db.userVotes(userId).then(function(votes){
//       socket.emit('votes', votes);
//     }).done();

//     db.setVoteUpdateCb(userId, function(votes){
//       socket.emit('votes', votes);
//     });

//   });

//   // Upvote
//   socket.on('upvote', function(data, cb){
//     console.log('SOCKET : received upvote with', data);

//     db.upvote(data.trackId, data.score).then(function(newScore){

//       setTimeout(function(){
//         io.sockets.emit('push', {trackId: data.trackId, score: newScore});
//         cb(true);
//       }, 1000);

//     }).done();
//   });

//   // Star
//   socket.on('star', function(data, cb){
//     console.log('SOCKET : received star with', data);

//     db.star(data.userId, data.trackId).then(function(updatedTracks){

//       console.log('SOCKET : sending update with', updatedTracks);

//       io.sockets.emit('update', updatedTracks)
//       cb(true);

//     }).done();
//   });

//   // Multiply
//   socket.on('multiply', function(data, cb){
//     console.log('SOCKET : received multiply with', data);

//     db.multiply(data.trackId).then(function(res){

//       console.log('SOCKET : sending multiply with', data.trackId, res);
//       io.sockets.emit('multiply', {
//         id: data.trackId,
//         strength: res.strength,
//         started_at: res.start
//       });
//       cb(true);

//     }).done();
//   });

//   // New track
//   socket.on('addTrack', function(data){
//     console.log('SOCKET : received addTrack with', data);

//     db.add({
//       id: data.id,
//       artist: data.artist.name,
//       title: data.title
//     }).then(function(track){

//       console.log('SOCKET : sending newTrack with', track);
//       io.sockets.emit('newTrack', {
//         id: track.id,
//         title: track.title,
//         artist: track.artist,
//         score: 1
//       });

//     }).done();
//   });

// });

