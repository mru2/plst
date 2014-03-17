// Configuration
var appPort     = process.env.OPENSHIFT_NODEJS_PORT || 8080
  , socketPort  = 8000;


// Web apps
var express       = require('express')
  , app           = express()
  , server        = require('http').createServer(app)
  , socketServer  = require('http').createServer()
  , io            = require('socket.io').listen(server)
  , db            = require('./back/db.js');

io.configure(function(){
    io.set("transports", ["websocket"]);
});

var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
if (typeof ipaddress === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the app locally.
    console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
    ipaddress = "127.0.0.1";
};

// Launch apps
// Separate port for sockets for 3G compatibility
server.listen(appPort, ipaddress, function() {        
    console.log('App listening on port : ' + appPort);
});

//socketServer.listen(appPort, ipaddress, function() {        
//    console.log('Sockets listening on port : ' + appPort);
//});

// Static files middleware
app.use(express.static(__dirname + '/front'));

app.get('/pop', function(req, res){
  db.popTopTrack().then(function(topTrackId){
    io.sockets.emit('removeTrack', topTrackId);
    res.send(topTrackId);
  }).done();
});


// Socket handlers
io.sockets.on('connection', function (socket) {

  console.log('SOCKET : connected');
  socket.emit('connected');

  // Bootstrap data
  socket.on('bootstrap', function(userId){
    console.log('SOCKET : boostraping');

    db.all().then(function(playlist){

      console.log('Bootstraping app with', playlist);
      socket.emit('bootstrap', playlist);

    }).done();

    db.currentStar(userId).then(function(currentStar){
      socket.emit('currentStar', currentStar);
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

  // Star
  socket.on('star', function(data, cb){
    console.log('SOCKET : received star with', data);

    db.star(data.userId, data.trackId).then(function(updatedTracks){

      console.log('SOCKET : sending update with', updatedTracks);

      io.sockets.emit('update', updatedTracks)
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

