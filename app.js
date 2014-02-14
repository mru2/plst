// Configuration
var appPort     = 14001
  , socketPort  = 3456;


// Web apps
var express       = require('express')
  , app           = express()
  , server        = require('http').createServer(app)
  , socketServer  = require('http').createServer()
  , io            = require('socket.io').listen(socketServer);


// Launch apps
// Separate port for sockets for 3G compatibility
server.listen(appPort);
console.log('App listening on port : ' + appPort);

socketServer.listen(socketPort);
console.log('Sockets listening on port : ' + socketPort);


// Database
var redis = require("redis").createClient();


// Static files middleware
app.use(express.static(__dirname + '/front'));



// For bootstraping the app
var snapshot = function(){
  return [
    {id: 123, title: "Fade Away", artist: "Vitalic", score: 4},
    {id: 456, title: "I Love It", artist: "Hilltop Hoods ft. Sia", score: 9},
    {id: 789, title: "Knights of Cydonia (Gramatik Remix)", artist: "Muse", score: 6}
  ]
};


// Upvote a track : instant +x
var upvote = function(trackId, score){
  score = score || 1;

  io.sockets.emit('push', {trackId: trackId, score: score});
};


// Add a track to the playlist
var addTrack = function(track){

  // Redis : todo

  // Hack while waiting for redis integration  
  setTimeout(function(){
    io.sockets.emit('newTrack', {
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      score: 1
    });
  }, 1000);

}



// Socket handlers
io.sockets.on('connection', function (socket) {

  // App bootstraping
  var bootstrapData = snapshot();
  console.log('SOCKET : bootstraping app with', bootstrapData);
  socket.emit('connected', bootstrapData);

  // Upvote
  socket.on('vote', function(data){
    console.log('SOCKET : received vote with', data);
    upvote(data.trackId, 1);
  });

  // New track
  socket.on('addTrack', function(data){
    console.log('SOCKET : received addTrack with', data);
    addTrack(data);
  });

});