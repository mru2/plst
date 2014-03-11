// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, $timeout, tracks) {

  // $scope.currentTrack = null;
  // $scope.user = User;
  $scope.tracks = tracks;

  // $scope.isStar = function(track) {
  //   return track.id === $scope.user.currentStarId;
  // };

  // $scope.doStar = function(track) {
  //   if ($scope.user.currentStarId === track.id) {
  //     // $scope.user.currentStarId = null;
  //   }
  //   else {
  //     $socket.emit('star', {userId: User.id, trackId: track.id}, function(){
  //       $scope.user.currentStarId = track.id;
  //     });
  //   }
  // };


  // $scope.openSlide = function(track) {
  //   $scope.currentTrack = track;
  // };

  // $scope.closeSlide = function() {
  //   $scope.currentTrack = null;
  // };

  // $scope.toggleSlide = function(track) {
  //   if ($scope.currentTrack === track) {
  //     $scope.closeSlide();
  //   }
  //   else {
  //     $scope.openSlide(track);
  //   }
  // };

  // Watch the playlist changes
  $scope.$watchCollection('tracks', function(){

    // Gradual entering
    var playlist = _.values(tracks).sort(function(t1, t2){
      // Bool => 0 or 1. Lowest first in list
      return 0.5 - (t1.score > t2.score || (t1.score === t2.score && t1.id > t2.id));
    });

    console.log('playlist : ', _.values(playlist));

    var newTrack;
    $scope.playlist = [];
    var gradualAppend = function(){
      newTrack = playlist.shift();
      if (!!newTrack) {
        $scope.playlist.push(newTrack);
        $timeout(gradualAppend, 100);
      }
    }

    gradualAppend();
  });

  // // Bootstrap the current star
  // $socket.on('currentStar', function(currentStarId){
  //   $scope.user.currentStarId = currentStarId;
  // });

});