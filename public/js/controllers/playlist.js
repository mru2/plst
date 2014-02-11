// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, $timeout, $socket, cooldowns, tracks) {

  $scope.hiddenCooldowns = [cooldowns.multiply, cooldowns.spotlight];

  $scope.currentTrack = null;
  $scope.tracks = tracks;

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

});