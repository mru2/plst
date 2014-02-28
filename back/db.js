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
      // Format the track
      var attributes = {
        id: self.id,
        artist: res.artist,
        title: res.title,
        stars: 3
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


// Get the current multiplier
Track.prototype.getMultiplier = function(){
  var multiplierDuration = 10000;

  return this.getAttrs()
  .then(function(attrs){
    if (!!attrs.multiplier_start && !!parseInt(attrs.multiplier_strength) && (Date.now() < ( parseInt(attrs.multiplier_start) + multiplierDuration ))) {
      return parseInt(attrs.multiplier_strength);
    }
    else {
      return 1;
    }
  });
};


// Upvote a track (checking its active multiplier)
Track.prototype.upvote = function(){
  var self = this;

  return this.getMultiplier()
  .then(function(multiplier){
    return self.pushScore(multiplier);
  });

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

  multiply: function(id){
    var track = new Track(id);

    var strength, start;

    return track.getMultiplier()
    .then(function(multiplier){
      strength = multiplier + 1;
      track.setAttr('multiplier_strength', strength);
    })
    .then(function(){
      start = Date.now();
      track.setAttr('multiplier_start', start);
    })
    .then(function(){
      return {
        strength: strength,
        start: start
      };
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