
angular.module('app').factory('tracks', function($rootScope, $socket, $timeout, cooldowns){

  // Track model
  function Track(opts) {
    this.id = opts.id;
    this.score = opts.score;
    this.artist = opts.artist;
    this.title = opts.title;
    this.cooldown = cooldowns.upvote(this);
    this.multiplier_strength = opts.multiplier_strength;
    this.multiplier_start = opts.multiplier_start;
  };

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
  };


  // Multiplier checking
  Track.prototype.has_multiplier = function() {
    return (Date.now() < (this.multiplier_start + 15000));
  };


  // Current tracks, indexed by id
  var _tracks = {};

  // Bootstraping the playlist
  $socket.on('bootstrap', function(data){
    _.each(data, function(trackOpts){
      _tracks[trackOpts.id] = new Track(trackOpts);
    });
  });

  // Monitor new incoming tracks
  $socket.on('newTrack', function(trackOpts){
    if (! _.has(_tracks, trackOpts.id)) {
      _tracks[trackOpts.id] = new Track(trackOpts);
    }
  });

  // Handling upvotes
  $socket.on('push', function(data){
    var track = _tracks[data.trackId];
    track.bump(data.score - track.score);
  });

  // Handling multipliers
  $socket.on('multiply', function(data){
    console.log('TRACK : received multiply with', data);
    _tracks[data.id].multiplier_strength = data.strength;
    _tracks[data.id].multiplier_start = data.started_at;
  });


  // Initialize the tracks content
  $socket.emit('bootstrap');

  return _tracks;

});

