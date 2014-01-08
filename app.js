// Global variables
var express = require('express')
  , app     = express()
  , server  = require('http').createServer(app)
  , io      = require('socket.io').listen(server)
  , port    = 14001;


// Static files middleware
app.use(express.static(__dirname + '/public'));


// Launch server
server.listen(port);
console.log('Listening on port : ' + port);


// For bootstraping the app
var snapshot = function(){
  return [
    {id: 123, title: "Fade Away", artist: "Vitalic", score: 4},
    {id: 456, title: "I Love It", artist: "Hilltop Hoods ft. Sia", score: 9},
    {id: 789, title: "Knights of Cydonia (Gramatik Remix)", artist: "Muse", score: 6}
  ]
}


// Socket handlers
io.sockets.on('connection', function (socket) {

  // App bootstraping
  var bootstrapData = snapshot();
  console.log('SOCKET : bootstraping app with', bootstrapData);
  socket.emit('connected', bootstrapData);

  // Voting on a track
  socket.on('vote', function(trackId){

    console.log('SOCKET : receiving vote for', trackId);

    // Handle voting and/or adding to playlist
    io.sockets.emit('push', {trackId: trackId});

  });

  // socket.on('ping', function (data) {
  //   console.log('Socket pinged with msg : ', data);

  //   // Dispatching the message, because why not
  //   socket.emit('ping', data);
  // });
});