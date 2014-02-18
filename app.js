// Configuration
var appPort     = 14001
  , socketPort  = 3457;


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

var db = (function(){

  var tracksKey = 'tracks';
  var detailsKey = function(id){return 'track_info:' + id};

  var addTrackDetails = function(track, cb){
    console.log('REDIS - adding track details', track);
    var key = detailsKey(track.id);

    redis.hset(key, 'title', track.title, function(err, res){
      redis.hset(key, 'artist', track.artist.name, cb);
    });
  };

  var incrTrack = function(id, score, cb){
    console.log('REDIS - incrementing track', id, 'by', score);
    redis.zincrby(tracksKey, score, id, cb);
  };

  var topTracks = function(cb){
    redis.zrevrangebyscore(tracksKey, '+inf', 0, 'withscores', cb);
  };

  var getTrackDetails = function(id, cb){
    redis.hgetall(detailsKey(id), cb);
  };

  return {
    add: function(track, cb){
      // TODO : only if non existing, and do the two simultanously
      addTrackDetails(track, function(){
        incrTrack(track.id, 1, cb);
      });
    },

    upvote: function(id, cb){
      incrTrack(id, 1, cb);
    },

    // NEED some promises here ...
    all: function(cb){

      topTracks(function(err, res){
        console.log('got all the tracks. err is', err, 'res is', res);

        // Got an array [id, score, id, score, ...] Format it to an object array
        var tracks = new Array();
        var missingTracks = (res.length/2);

        for (var i = 0 ; i < (res.length/2) ; i++) {
          (function(){
            var trackId = res[2*i];
            var trackScore = parseInt(res[2*i + 1]);

            getTrackDetails(trackId, function(err, res){

              console.log('got track details. err is', err, 'res is', res);

              var track = {
                id: trackId,
                score: trackScore,
                artist: res.artist,
                title: res.title
              };

              console.log('adding track', track);

              tracks.push(track);
              missingTracks -= 1;

              if (missingTracks === 0) {
                cb(tracks);
              }
            });
          })();
        };

      });

      // // TODO
      // cb([
      //   {id: 123, title: "Fade Away", artist: "Vitalic", score: 4},
      //   {id: 456, title: "I Love It", artist: "Hilltop Hoods ft. Sia", score: 9},
      //   {id: 789, title: "Knights of Cydonia (Gramatik Remix)", artist: "Muse", score: 6}
      // ]);

    }
  }
})();



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
    multiplier: 2,
    started_at: Date.now(),
    duration: 15000
  });

};



// Socket handlers
io.sockets.on('connection', function (socket) {

  // App bootstraping
  db.all(function(bootstrapData){
    console.log('SOCKET : bootstraping app with', bootstrapData);
    socket.emit('connected', bootstrapData);
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

