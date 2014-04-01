angular.module('app').factory('Playlist', function($rootScope, $timeout, Sync, User){

  $rootScope.appLoaded = false;  

  // Track model
  function Track(opts) {
    this.id = opts.id;
    this.score = opts.score;
    this.artist = opts.artist;
    this.title = opts.title;
    this.upvoting = false;
    this.pendingVotes = 0;
  };

  Track.prototype.bump = function(score) {
    if (score === 0) {
      return
    }

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

  Track.prototype.startUpvote = function(){
    if (this.upvoting || User.votes() <= 0) {
      return;
    }

    console.log('upvoting');
    this.pendingVotes = this.pendingVotes || 0;
    this.pendingVotes += 1;
    User.useVote(this.id);

    if (User.votes() == 0) 
      this.upvote();
    else {
      // Start upvote 1 second later
      $timeout.cancel(this.timeout);
      this.timeout = $timeout(_.bind(this.upvote, this), 1000);
    }
  };

  Track.prototype.upvote = function(){
    this.upvoting = true;
    var score = this.pendingVotes;
    this.pendingVotes = 0;

    var self = this;

    Sync.upvoteTrack(this.id, score, function(newScore){
      User.clearVotes(self.id);
      self.upvoting = false;
      self.score += score;
    });
  };


  // Current tracks, indexed by id
  var Playlist;
  var _tracks = {};

  // Bootstraping the playlist
  var bootstrap = function(data){
    _.each(data, function(trackOpts){
      _tracks[trackOpts.id] = new Track(trackOpts);
    });
  };

  // Add a new track
  var addTrack = function(trackOpts){
    if (! _.has(_tracks, trackOpts.id)) {
      _tracks[trackOpts.id] = new Track(trackOpts);
    }
  };

  // Remove a track
  var trackPlaying = function(trackId){
    var track = _tracks[trackId];
    Playlist.playing = {
      title: track.title,
      artist: track.artist
    };
    delete _tracks[trackId];
  };

  // Receive upvotes
  var upvoteTrack = function(data){
    var track = _tracks[data.trackId];
    track.bump(data.score - track.score);    
  };

  Playlist = {
    bootstrap: bootstrap,
    addTrack: addTrack,
    trackPlaying: trackPlaying,
    upvoteTrack: upvoteTrack,
    tracks: _tracks,
    playing: {}
  };

  Sync.setPlaylist(Playlist);
  return Playlist;

});

