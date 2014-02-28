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




// Socket handlers
io.sockets.on('connection', function (socket) {

  console.log('SOCKET : connected');
  socket.emit('connected');

  // Bootstrap data
  socket.on('bootstrap', function(){
    console.log('SOCKET : boostraping');

    db.all().then(function(playlist){

      console.log('Bootstraping app with', playlist);
      socket.emit('bootstrap', playlist);

    }).done();
  });

  // Upvote
  socket.on('upvote', function(data, cb){
    console.log('SOCKET : received upvote with', data);

    db.upvote(data.trackId).then(function(newScore){

      io.sockets.emit('push', {trackId: data.trackId, score: newScore});
      cb(true);

    }).done();
  });

  // Multiply
  socket.on('multiply', function(data, cb){
    console.log('SOCKET : received multiply with', data);

    db.multiply(data.trackId).then(function(res){

      console.log('SOCKET : sending multiply with', data.trackId, res);
      io.sockets.emit('multiply', {
        id: data.trackId,
        strength: res.strength,
        started_at: res.start
      });
      cb(true);

    }).done();
  });

  // New track
  socket.on('addTrack', function(data){
    console.log('SOCKET : received addTrack with', data);

    db.add({
      id: data.id,
      artist: data.artist.name,
      title: data.title
    }).then(function(track){

      console.log('SOCKET : sending newTrack with', track);
      io.sockets.emit('newTrack', {
        id: track.id,
        title: track.title,
        artist: track.artist,
        score: 1
      });

    }).done();
  });

});

