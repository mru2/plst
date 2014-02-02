
angular.module('app').factory('tracks', function($socket, $timeout, cooldowns){

  // Track model
  function Track(opts) {
    this.id = opts.id;
    this.score = opts.score;
    this.artist = opts.artist;
    this.title = opts.title;
    this.cooldown = cooldowns.upvote(this);
  }

  Track.prototype.bump = function(score) {
    var track = this;

    var bumpOne = function(){
      track.score += 1;
      score -= 1;
      if(score > 0){
        $timeout(bumpOne, 30);        
      }
    }

    bumpOne();
  }


  // Current tracks, indexed by id
  var _tracks = {}

  return {

    bootstrap: function(data){
      _.each(data, function(trackOpts){
        _tracks[trackOpts.id] = new Track(trackOpts);
      });
    },

    get: function(trackId){
      return _tracks[trackId]
    },

    all: function(){
      return _.values(_tracks);
    }

  }

});

