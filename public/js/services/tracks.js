
angular.module('app').factory('tracks', function($rootScope, $socket, $timeout, cooldowns){

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
  var _tracks = {};


  // Bootstraping the playlist
  $socket.on('connected', function(data){
    console.log('Socket connected', data);
    _.each(data, function(trackOpts){
      console.log('Adding track', trackOpts);
      _tracks[trackOpts.id] = new Track(trackOpts);
    });
  });

  // Handling updates
  $socket.on('push', function(data){
    console.log('SOCKET : received push', data);
    _tracks[data.trackId].bump(data.score);
    // bumpTrack(track, data.score);
  });

  // Monitor new incoming tracks
  $socket.on('newTrack', function(trackOpts){
    console.log('new track in playlist', trackOpts);
    if (! _.has(_tracks, trackOpts.id)) {
      console.log('adding it');

      // Test
      trackOpts.score = 10;

      _tracks[trackOpts.id] = new Track(trackOpts);
      $rootScope.$broadcast('newTrack');
    }
  });

  return {model: Track, all: _tracks};

});

