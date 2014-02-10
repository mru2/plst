// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, $timeout, $socket, cooldowns, tracks) {

  console.log('in PlaylistCtrl');

  $scope.upvoteCooldown = cooldowns.upvote
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
  $scope.$watchCollection('tracks.all', function(newVal, oldVal, scope){
    console.log('tracks changed');
    $scope.playlist = _.values(tracks.all);
  });



  // Debug
  $scope.pushTrack = function(){
    console.log('DEBUG - pushing track');
    var id = (new Date).getTime() % 1000;
    var track = new tracks.model({
      id: id,
      title: 'Mix #' + id,
      artist: 'Artist',
      score: parseInt(id / 10)
    });
    $scope.playlist.push(track);
  };

  $scope.popTrack = function(){
    console.log('DEBUG - popping track');
    $scope.playlist.splice(1,1);
  };


});