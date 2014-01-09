// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, socket) {

  console.log('in PlaylistCtrl');

  // To put in a service, to handle scoring, indexing, updates, ...
  // https://github.com/tomkuk/angular-collection
  var getTrack = function(trackId){
    return _.find($scope.playlist, function(track){ return (track.id === trackId); });
  }

  // Bootstraping the playlist
  socket.on('connected', function(data){
    console.log('Socket connected', data);
    $scope.playlist = data;
  });

  // Voting on a track
  $scope.vote = function(track){
    console.log('voting for', track);
    socket.emit('vote', track.id);
  };

  // Handling updates
  socket.on('push', function(trackId){
    console.log('voting for track', trackId.trackId);
    var track = getTrack(trackId.trackId);
    track.score += 1;
  });

});