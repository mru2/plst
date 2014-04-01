// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, $timeout, Playlist) {

  // For watching changes...
  $scope.Playlist = Playlist;
  $scope.tracks = Playlist.tracks;

  $scope.playlist = _.values(Playlist.tracks);
  $scope.playing = Playlist.playing;

  window.playlist = Playlist;

  // Watch the playlist changes
  $scope.$watchCollection('Playlist.tracks', function(){
    console.log('updating tracks');
    $scope.playlist = _.values(Playlist.tracks);
  });

  $scope.$watch('Playlist.playing', function(){
    $scope.playing = Playlist.playing;
  });

    // console.log('got change in playlist!');

    // // Gradual entering, maybe the service should also sort them...
    // var playlist = _.values(Playlist.tracks).sort(function(t1, t2){
    //   // Bool => 0 or 1. Lowest first in list
    //   return 0.5 - (t1.score > t2.score || (t1.score === t2.score && t1.id > t2.id));
    // });

    // var newTrack;
    // $scope.playlist = [];
    // var gradualAppend = function(){
    //   newTrack = playlist.shift();
    //   if (!!newTrack) {
    //     $scope.playlist.push(newTrack);
    //     $timeout(gradualAppend, 100);
    //   }
    // }

    // gradualAppend();
  // });


  // Gradual a bit bugged... To check

});