// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, $timeout, $socket, cooldowns, tracks) {

  console.log('in PlaylistCtrl');

  $scope.upvoteCooldown = cooldowns.upvote
  $scope.hiddenCooldowns = [cooldowns.multiply, cooldowns.spotlight];

  $scope.currentTrack = null;

  $scope.openSlide = function(track) {
    $scope.currentTrack = track;
  };

  $scope.closeSlide = function() {
    $scope.currentTrack = null;
  };

  $scope.toggleSlide = function(track) {
    if ($scope.currentTrack === track) {
      $scope.closeSlide();
    }
    else {
      $scope.openSlide(track);
    }
  };

  // Bootstraping the playlist
  $socket.on('connected', function(data){
    console.log('Socket connected', data);
    tracks.bootstrap(data);
    $scope.playlist = tracks.all();
  });

  // Handling updates
  $socket.on('push', function(data){
    console.log('SOCKET : received push', data);
    var track = tracks.get(data.trackId);
    track.bump(data.score);
    // bumpTrack(track, data.score);
  });

});