// DB adapter logic.
// Namespaced under a room id.

// Dependencies
var redis  = require('redis'),
    Q      = require('q'),
    _      = require('lodash'),
    client = redis.createClient();


var Adapter = {};


// Redis keys
var baseKey = 'plst';

var roomKey = function(roomId){ 
  return baseKey + ':rooms:' + roomId;
};

var userKey = function(roomId, userId){ 
  return roomKey(roomId) + ':users:' + userId;
};

var playlistKey = function(roomId){
  return roomKey(roomId) + ':playlist';
};

var trackKey = function(trackId){
  return baseKey + ':tracks:' + trackId;
};


// Helpers
var getTrack = function(trackId){
  return Q.ninvoke(client, 'hgetall', trackKey(trackId));
};


// Get user details
// - votes
Adapter.getUser = function(roomId, userId){
  return Q.ninvoke(client, 'get', userKey(roomId, userId)).then(function(res){
    return {votes: (res || 0)};
  });
};


// Get the playlist
// - id
// - score
// - artist
// - title
Adapter.getPlaylist = function(roomId){
  return Q.ninvoke(client, 'zrevrangebyscore', playlistKey(roomId), '+inf', 0, 'withscores')
  .then(function(res){
    // The result is in the form [id, score, id, score, ...]. Format it in the form [{id: id, score: score}, ...]
    var formattedRes = [];

    for (var i = 0 ; i < (res.length/2) ; i++) {
      formattedRes.push({
        id: res[2*i],
        score: parseInt(res[2*i + 1])
      });
    }

    return formattedRes;
  })
  .then(function(tracksWithScore){
    var fullTracks = _.map(tracksWithScore, function(trackWithScore){
      return getTrack(trackWithScore.id).then(function(trackDetails){
        return {
          id: trackWithScore.id,
          score: trackWithScore.score,
          artist: trackDetails.artist,
          title: trackDetails.title
        };
      });
    });
    return Q.all(fullTracks);
  });
};



module.exports = Adapter;