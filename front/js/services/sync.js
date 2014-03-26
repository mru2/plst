// Sync engine with sockets.
angular.module('app').factory('Sync', function($rootScope, $socket){

  // Link to bound services
  var User, Room, Playlist;

  // Are the dependencies linked, to send the socket connection
  var checkLinkingStatus = function(){
    if (User && Room && Playlist) {
      console.log('SYNC - launching bootstrap');
      setupWatchers();
      $socket.emit('bootstrap', {userId: User.id, roomId: Room.id});
    }
  };

  // Is the data loaded ?
  var loadedCheck = {
    tracks: false,
    user: false
  };

  var checkLoadedStatus = function(){
    if (loadedCheck.tracks && loadedCheck.user) {
      $rootScope.appLoaded = true;
    }
  };


  // Watchers
  var setupWatchers = function(){
    $socket.on('bootstrapPlaylist', function(data){
      Playlist.bootstrap(data);
      loadedCheck.tracks = true;
      checkLoadedStatus();
    });

    $socket.on('bootstrapUser', function(data){
      User.bootstrap(data);
      loadedCheck.user = true;
      checkLoadedStatus();
    });

    $socket.on('newTrack', Playlist.addTrack);
    $socket.on('removeTrack', Playlist.removeTrack);
    $socket.on('push', Playlist.upvoteTrack);
    $socket.on('votes', User.updateVotes);    
  };


  return {

    // Dependencies manual linking
    setUser: function(userService){
      User = userService;
      checkLinkingStatus();
    },

    setRoom: function(roomService){
      Room = roomService;
      checkLinkingStatus();
    },

    setPlaylist: function(playlistService){
      Playlist = playlistService;
      checkLinkingStatus();
    },


    // Accessors to send data
    addTrack: function(track, cb){
      $socket.emit('addTrack', {id: track.id, artist: track.artist.name, title: track.title}, cb);
    },

    upvoteTrack: function(trackId, score, cb){
      $socket.emit('upvote', {trackId: trackId, score: score}, cb);
    }

  };

});