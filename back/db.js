var redis = require('redis').createClient(process.env.OPENSHIFT_REDIS_PORT, process.env.OPENSHIFT_REDIS_HOST, {auth_pass: process.env.REDIS_PASSWORD}),
    Q     = require('q'),
    _     = require('lodash');

var baseKey = 'plst'


// Create a Track model, and wrap redis calls in promises
var Track = function(id){
  this.id = id;
  this.key = baseKey + ':' + 'track' + ':' + id;
  this.starsKey = this.key + ':stars';
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
      // Get the stars
      self.getStarsCount().then(function(starsCount){
        // Format the track
        var attributes = {
          id: self.id,
          artist: res.artist,
          title: res.title,
          stars: starsCount
        };
        deferred.resolve(attributes);
      });
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
Track.prototype.upvote = function(){
  var self = this;

  return this.getAttrs()
  .then(function(){ return self.getStarsCount(); })
  .then(function(starsCount){
    return self.pushScore(starsCount + 1);
  });

};

// Get the current stars count
Track.prototype.getStarsCount = function(){
  var deferred = Q.defer();
  redis.scard(this.starsKey, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else{
      // Return the stars count + 1
      deferred.resolve(parseInt(res));
    }
  });

  return deferred.promise;
};

// Add a star
Track.prototype.star = function(userId){
  console.log('adding', userId, 'to stars of', this.id)
  var deferred = Q.defer();
  redis.sadd(this.starsKey, userId, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else{
      deferred.resolve(res);
    }
  });

  return deferred.promise;
};


// Remove a star
Track.prototype.unstar = function(userId){
  var deferred = Q.defer();
  redis.srem(this.starsKey, userId, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else{
      deferred.resolve(res);
    }
  });

  return deferred.promise;
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
      redis.del(track.starsKey, function(err, res){
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

var getCurrentStar = function(userId){
  console.log('getting current star for', userId);
  var deferred = Q.defer();

  redis.get((baseKey + ':' + 'currentStar' + ':' + userId), function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else {
      if(!!res){
        deferred.resolve(res);
      }
      else {
        deferred.resolve(null);
      }
    }
  });
  
  return deferred.promise;
};

var setCurrentStar = function(userId, trackId) {
  var deferred = Q.defer();

  redis.set((baseKey + ':' + 'currentStar' + ':' + userId), trackId, function(err, res){
    if(err){
      deferred.reject(new Error(err));
    }
    else {
      deferred.resolve(true);
    }
  });
  return deferred.promise;
};


module.exports = {

  add: function(attributes){
    var track = new Track(attributes.id);

    return track.setAttr('title', attributes.title)
    .then(function(){ track.setAttr('artist', attributes.artist); })
    .then(function(){ track.upvote(); })
    .then(function(){ return track.getAttrs(); });
  },

  upvote: function(id){
    var track = new Track(id);
    return track.upvote();
  },

  star: function(userId, trackId){
    return getCurrentStar(userId)
    .then(function(formerStarId){
      var out = [];

      // Push the former in the updates if any
      if (!!formerStarId) {
        var formerStar = new Track(formerStarId);
        out.push(
          formerStar
          .unstar(userId)
          .then(function(){
            return formerStar.getAttrs()
          })
        );
      }

      // Anyway, push the new star
      var newStar = new Track(trackId);
      out.push(
        newStar
        .star(userId)
        .then(function(){
          return setCurrentStar(userId, trackId);
        })
        .then(function(){
          return newStar.getAttrs();
        })
      );

      return Q.all(out);
    });
  },

  currentStar: function(userId){
    return getCurrentStar(userId);
  },

  // multiply: function(id){
  //   var track = new Track(id);

  //   var strength, start;

  //   return track.getMultiplier()
  //   .then(function(multiplier){
  //     strength = multiplier + 1;
  //     track.setAttr('multiplier_strength', strength);
  //   })
  //   .then(function(){
  //     start = Date.now();
  //     track.setAttr('multiplier_start', start);
  //   })
  //   .then(function(){
  //     return {
  //       strength: strength,
  //       start: start
  //     };
  //   });
  // },

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
  }
};
