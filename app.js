// Configuration
var appPort     = 14001
  , socketPort  = 3457;


// Web apps
var express       = require('express')
  , app           = express()
  , server        = require('http').createServer(app)
  , socketServer  = require('http').createServer()
  , io            = require('socket.io').listen(socketServer)
  , db            = require('./back/db.js');


// Launch apps
// Separate port for sockets for 3G compatibility
server.listen(appPort);
console.log('App listening on port : ' + appPort);

socketServer.listen(socketPort);
console.log('Sockets listening on port : ' + socketPort);


// Static files middleware
app.use(express.static(__dirname + '/front'));


// Upvote a track : instant +x
var upvote = function(trackId, score){
  score = score || 1;

  console.log('upvoting track', trackId);

  db.upvote(trackId, function(err, res){
    console.log('upvoted track', trackId, 'err is', err, 'and res is', res);
    io.sockets.emit('push', {trackId: trackId, score: score});
  });

};


// Add a track to the playlist
var addTrack = function(track){

  // Actually add the track
  db.add(track, function(err, res){

    console.log('track added', track, 'err is', err, 'res is', res);

    io.sockets.emit('newTrack', {
      id: track.id,
      title: track.title,
      artist: track.artist.name,
      score: 1
    });

  });

};


// Add a multiply cooldown to a track
var multiply = function(trackId){

  // TODO : persist it

  io.sockets.emit('multiply', {
    id: trackId,
    strength: 2,
    started_at: Date.now()
  });

};



// Socket handlers
io.sockets.on('connection', function (socket) {

  // Bootstrap data
  socket.on('bootstrap', function(){
    console.log('SOCKET : boostraping');
    db.all(function(bootstrapData){
      console.log('Bootstraping app with', bootstrapData);
      socket.emit('bootstrap', bootstrapData);
    });
  });

  // Upvote
  socket.on('upvote', function(data){
    console.log('SOCKET : received vote with', data);
    upvote(data.trackId, 1);
  });

  // Multiply
  socket.on('multiply', function(data){
    console.log('SOCKET : received multiply with', data);
    multiply(data.trackId);
  });

  // New track
  socket.on('addTrack', function(data){
    console.log('SOCKET : received addTrack with', data);
    addTrack(data);
  });

});

