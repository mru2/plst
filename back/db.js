var redis = require('redis').createClient(),
    Q     = require('q'),
    _     = require('lodash');

var baseKey = 'plst'


// Create a Track model, and wrap redis calls in promises
var Track = function(id){
  this.id = id;
  this.key = baseKey + ':' + 'track' + ':' + id;
};

Track.playlistKey = baseKey + ':' + 'tracks';


// Get all the track attributes
Track.prototype.getAttrs = function(){
  var deferred = Q.defer();
  var self = this;
  
  redis.hgetall(this.key, function(err, res){
    if (err) {
      deferred.reject(new Error(err));  
    }
    else {
      var attributes = {
        id: self.id,
        artist: res.artist,
        title: res.title
      };
      deferred.resolve(attributes);
    }
  });

  return deferred.promise;
};


// Increment the track's score
Track.prototype.pushScore = function(score){
  var deferred = Q.defer();
  redis.zincrby(Track.playlistKey, score, this.id, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else{
      // Return the new score
      deferred.resolve(parseInt(res));
    }
  });
  return deferred.promise;  
};


// Update an attribute
Track.prototype.setAttr = function(name, value){
  var deferred = Q.defer();

  redis.hset(this.key, name, value, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else{
      deferred.resolve(true);
    }
  });

  return deferred.promise;
};

// Upvote a track (checking its active multiplier)
Track.prototype.upvote = function(score){
  var self = this;

  return this.getAttrs()
  .then(function(){
    return self.pushScore(score);
  });

};

// Delete a track
Track.prototype.remove = function(){
  console.log('deleting track', this.id);
  var deferred = Q.defer();
  var track = this;
  redis.zrem(Track.playlistKey, this.id, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else {
      redis.del(track.key, function(err, res){
        if(err){
          deferred.reject(new Error(err));
        }
        else {
          deferred.resolve(true);
        }
      });
    }
  });
  return deferred.promise;
};



// Get the top tracks
Track.getPlaylist = function(){
  var deferred = Q.defer();

  redis.zrevrangebyscore(Track.playlistKey, '+inf', 0, 'withscores', function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else{
      // The result is in the form [id, score, id, score, ...]. Format it in the form [{id: id, score: score}, ...]
      var formattedRes = [];

      for (var i = 0 ; i < (res.length/2) ; i++) {
        formattedRes.push({
          id: res[2*i],
          score: parseInt(res[2*i + 1])
        });
      }

      deferred.resolve(formattedRes);
    }
  });

  return deferred.promise;
};


// Get the top track
Track.getTop = function(){
  var deferred = Q.defer();

  redis.zrevrangebyscore(Track.playlistKey, '+inf', 0, 'limit', 0, 1, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else{
      console.log('getTop : got ', res);
      deferred.resolve(res[0]);
    }
  });

  return deferred.promise;
};

var getUserVotes = function(userId){
  // If no votes, start at 10
  var deferred = Q.defer();
  deferred.resolve(10);
  return deferred.promise;
};

// var getCurrentStar = function(userId){
//   console.log('getting current star for', userId);
//   var deferred = Q.defer();

//   redis.get((baseKey + ':' + 'currentStar' + ':' + userId), function(err, res){
//     if(err){
//       deferred.reject(new Error(err));
//     }
//     else {
//       if(!!res){
//         deferred.resolve(res);
//       }
//       else {
//         deferred.resolve(null);
//       }
//     }
//   });
  
//   return deferred.promise;
// };

// var setCurrentStar = function(userId, trackId) {
//   var deferred = Q.defer();

//   redis.set((baseKey + ':' + 'currentStar' + ':' + userId), trackId, function(err, res){
//     if(err){
//       deferred.reject(new Error(err));
//     }
//     else {
//       deferred.resolve(true);
//     }
//   });
//   return deferred.promise;
// };


var voteUpdateCbs = {};

module.exports = {

  add: function(attributes){
    var track = new Track(attributes.id);

    return track.setAttr('title', attributes.title)
    .then(function(){ track.setAttr('artist', attributes.artist); })
    .then(function(){ track.upvote(); })
    .then(function(){ return track.getAttrs(); });
  },

  upvote: function(id, score){
    var track = new Track(id);
    return track.upvote(score);
  },

  userVotes: function(userId){
    return getUserVotes(userId);
  },

  popTopTrack: function(){
    return Track.getTop()
    .then(function(trackId){
      console.log('got top track', trackId);
      var track = new Track(trackId);
      return track.remove()
      .then(function(){
        return trackId;
      });
    });
  },

  all: function(){
    return Track.getPlaylist()
    .then(function(playlist){

      var playlistWithDetails = _.map(playlist, function(trackIdAndScore){
        var track = new Track(trackIdAndScore.id);
        return track.getAttrs().then(function(trackAttrs){
          trackAttrs.score = trackIdAndScore.score;
          return trackAttrs;
        });
      });

      return Q.all(playlistWithDetails);

    });
  },

  setVoteUpdateCb: function(userId, cb){
    voteUpdateCbs[userId] = cb;
  }
};