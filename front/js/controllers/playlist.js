// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, cooldowns, tracks, User, $socket) {

  $scope.hiddenCooldowns = [cooldowns.multiply, cooldowns.spotlight];

  $scope.currentTrack = null;
  $scope.user = User;
  $scope.tracks = tracks;

  $scope.isStar = function(track) {
    return track.id === $scope.user.currentStarId;
  };

  $scope.doStar = function(track) {
    if ($scope.user.currentStarId === track.id) {
      // $scope.user.currentStarId = null;
    }
    else {
      $socket.emit('star', {userId: User.id, trackId: track.id}, function(){
        $scope.user.currentStarId = track.id;
      });
    }
  };


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

  // Watch the playlist changes
  $scope.$watchCollection('tracks', function(){
    $scope.playlist = _.values(tracks);
  });

  // Bootstrap the current star
  $socket.on('currentStar', function(currentStarId){
    $scope.user.currentStarId = currentStarId;
  });

});