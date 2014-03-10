
angular.module('app').factory('tracks', function($rootScope, $socket, $timeout, User){

  $rootScope.appLoaded = false;  

  // Track model
  function Track(opts) {
    this.id = opts.id;
    this.score = opts.score;
    this.artist = opts.artist;
    this.title = opts.title;
    this.upvoting = false;
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

  Track.prototype.upvote = function(){
    // To handle ...
    if (this.upvoting) {
      return;
    }

    this.upvoting = true;

    var self = this;

    User.useVote();

    $socket.emit('upvote', {trackId: this.id}, function(){
      self.upvoting = false;
    });
  }


  // Current tracks, indexed by id
  var _tracks = {};

  // Bootstraping the playlist
  $socket.on('bootstrap', function(data){
    _.each(data, function(trackOpts){
      _tracks[trackOpts.id] = new Track(trackOpts);
    });

    $rootScope.appLoaded = true;
  });

  // Monitor new incoming tracks
  $socket.on('newTrack', function(trackOpts){
    if (! _.has(_tracks, trackOpts.id)) {
      _tracks[trackOpts.id] = new Track(trackOpts);
    }
  });

  // Monitor removed tracks
  $socket.on('removeTrack', function(trackId){
    delete _tracks[trackId];
  });

  // Handling upvotes
  $socket.on('push', function(data){
    var track = _tracks[data.trackId];
    track.bump(data.score - track.score);
  });

  // Handling updates
  $socket.on('update', function(data){
    _.each(data, function(track){

      if (!!_tracks[track.id]) {
        // Only stars could change...
        _tracks[track.id].stars = track.stars;
      }

    });
  });


  // Initialize the tracks content, when synced
  $socket.on('connect', function(){
    $socket.emit('bootstrap', User.id);
  });

  return _tracks;

});

