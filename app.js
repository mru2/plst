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

// // Dot : +1 every second for x seconds
// var dot = function(trackId, duration){

//   var remaining = duration;

//   var doDot = function(){
//     upvote(trackId);
//     remaining -= 1;
//     if(remaining > 0){
//       setTimeout(doDot, 1000);
//     }
//   };

//   setTimeout(doDot, 1000);

// };


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

  // Bomb : +10
  // socket.on('bomb', function(data){
  //   console.log('SOCKET : received bomb with', data);
  //   upvote(data.trackId, 10);
  // });

  // Dot : +5 then +1 every second for 10 seconds
  // socket.on('dot', function(data){
  //   console.log('SOCKET : received dot with', data);

  //   upvote(data.trackId, 5);
  //   dot(data.trackId, 10);
  // });

  // socket.on('ping', function (data) {
  //   console.log('Socket pinged with msg : ', data);

  //   // Dispatching the message, because why not
  //   socket.emit('ping', data);
  // });
});