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
var setBaseScore = function(roomId, trackId){
  console.log('setting base score',  roomId, trackId);
  return Q.ninvoke(client, 'zscore', playlistKey(roomId), trackId)
  .then(function(res){

    // Existing : return
    if (!!res) {
      console.log('track already upvoted', res);
      return false;
    }

    // Else, set to 1 and return true
    else {
      console.log('upvoting track');
      return Q.ninvoke(client, 'zadd', playlistKey(roomId), 1, trackId)
      .then(function(){ return true });
    }

  });
};

var upvoteTrack = function(roomId, trackId, score){
  return Q.ninvoke(client, 'zincrby', playlistKey(roomId), score, trackId);
};

var getTrack = function(trackId){
  return Q.ninvoke(client, 'hgetall', trackKey(trackId));
};

var addNewTrack = function(trackData){
  // Check if existing
  return getTrack(trackData.id).then(function(res){

    if (res !== null) {
      console.log('track existing', res);
      return false;
    }
    else {
      console.log('creating track');
      return Q.ninvoke(client, 'hmset', trackKey(trackData.id), {
        artist: trackData.artist,
        title: trackData.title
      });
    }

  });
};

var popTopTrack = function(roomId){
  return Q.ninvoke(client, 'zrevrangebyscore', playlistKey(roomId), '+inf', 0, 'limit', 0, 1)
  .then(function(res){
    // Get the track id
    var trackId = parseInt(res[0], 10);

    // Pop the track and return the track id
    return Q.ninvoke(client, 'zrem', playlistKey(roomId), trackId).then(function(){
      return trackId;
    });
  });
};


// Publishers
var notifyTrackAdded = function(roomId, trackData){
  console.log('publishing on redis', 'plst:pubsub:rooms:'+roomId+':newtrack', JSON.stringify(trackData));
  client.publish('plst:pubsub:rooms:'+roomId+':newtrack', JSON.stringify(trackData));
};

var notifyTrackUpvoted = function(roomId, trackId, score){
  console.log('publishing on redis', 'plst:pubsub:rooms:'+roomId+':tracks:'+trackId+':upvote', score);
  client.publish('plst:pubsub:rooms:'+roomId+':tracks:'+trackId+':upvote', score);
};

var notifyTrackPlaying = function(roomId, trackId){
  console.log('publishing on redis', 'plst:pubsub:rooms:'+roomId+':playing', trackId);
  client.publish('plst:pubsub:rooms:'+roomId+':playing', trackId);
};


// Get user details
// - votes
Adapter.getUser = function(roomId, userId){
  return Q.ninvoke(client, 'get', userKey(roomId, userId)).then(function(res){
    return {votes: (res || 10)};
  });
};


// Add a new track if not yet existing
// wants id, artist, title
// returns boolean (added or not)
Adapter.addTrack = function(roomId, trackData){

  // Create details hash (if missing)
  return addNewTrack(trackData)

  // Set base score
  // Return true or false depending on score existence
  .then(function(){ return setBaseScore(roomId, trackData.id); })

  // Notify the room if new track
  .then(function(added){ 
    if (added) {
      trackData.score = 1;
      notifyTrackAdded(roomId, trackData);
      return true;
    }
    else {
      return false;
    }
  });

};


// Upvote an existing track (if existing)
Adapter.upvoteTrack = function(roomId, trackId, score){

  console.log('upvoting track', trackId, 'by', score);

  // Check if existing before
  return getTrack(trackId)
  .then(function(res){
    if (!res) {
      return false;
    }
    else {
      return upvoteTrack(roomId, trackId, score)
      .then(function(newScore){ notifyTrackUpvoted(roomId, trackId, newScore) });
    }
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
    console.log('raw playlist : ', res);
    // The result is in the form [id, score, id, score, ...]. Format it in the form [{id: id, score: score}, ...]
    var formattedRes = [];

    for (var i = 0 ; i < (res.length/2) ; i++) {
      formattedRes.push({
        id: res[2*i],
        score: parseInt(res[2*i + 1], 10)
      });
    }

    return formattedRes;
  })
  .then(function(tracksWithScore){
    var fullTracks = _.map(tracksWithScore, function(trackWithScore){
      return getTrack(trackWithScore.id).then(function(trackDetails){

        if (trackDetails) {
          return {
            id: trackWithScore.id,
            score: trackWithScore.score,
            artist: trackDetails.artist,
            title: trackDetails.title
          };
        }

        else {
          return null;
        }

      });
    });
    return Q.all(fullTracks);
  })
  .then(function(tracksWithDetails){
    return _.compact(tracksWithDetails);
  });
};


// Pop the top track in a playlist
Adapter.popTopTrack = function(roomId){
  return popTopTrack(roomId)
  .then(function(trackId){

    // Notify the track is popped
    notifyTrackPlaying(roomId, trackId);

    return trackId;
  })
};


// Redis subbers
// TODO : cleanup on disconnects...
Adapter.onNewTrack = function(roomId, cb){
  var subber = redis.createClient();

  subber.on('message', function(channel, message){
    cb(JSON.parse(message));
  });

  subber.subscribe('plst:pubsub:rooms:'+roomId+':newtrack');
};

Adapter.onUpvoteTrack = function(roomId, cb){
  var subber = redis.createClient();

  subber.on('pmessage', function(pchannel, channel, message){
    console.log('SUBBER : got message', message, 'from channel', channel);
    var splitChannel = channel.split(':');
    var trackId = parseInt(splitChannel[splitChannel.length - 2], 10);
    var score = parseInt(message, 10);
    cb(trackId, score);
  });

  subber.psubscribe('plst:pubsub:rooms:'+roomId+':tracks:*:upvote');
};

Adapter.onTrackPlaying = function(roomId, cb){
  var subber = redis.createClient();

  subber.on('message', function(channel, message){
    cb(parseInt(message, 10));
  });

  subber.subscribe('plst:pubsub:rooms:'+roomId+':playing');
};


module.exports = Adapter;