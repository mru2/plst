// ===================
// Playlist controller
// ===================

angular.module('app').controller('PlaylistCtrl', function($scope, $timeout, socket) {

  console.log('in PlaylistCtrl');

  // To put in a service, to handle scoring, indexing, updates, ...
  // https://github.com/tomkuk/angular-collection
  var getTrack = function(trackId){
    return _.find($scope.playlist, function(track){ return (track.id === trackId); });
  }


  // Bump a track's score, not all at once
  var bumpTrack = function(track, score){
    var remaining = score;
  
    var bumpOne = function(){
      track.score += 1;
      score -= 1;
      if(score > 0){
        $timeout(bumpOne, 30);        
      }
    }

    bumpOne();
  }



  // Bootstraping the playlist
  socket.on('connected', function(data){
    console.log('Socket connected', data);
    $scope.playlist = data;
  });

  // Voting on a track
  $scope.vote = function(track){
    console.log('voting for', track);
    socket.emit('vote', {trackId: track.id});
  };

  // Doting a track
  $scope.dot = function(track){
    console.log('doting', track);
    socket.emit('dot', {trackId: track.id});
  };

  // Bombing a track
  $scope.bomb = function(track){
    console.log('bombing', track);
    socket.emit('bomb', {trackId: track.id});
  };

  // Handling updates
  socket.on('push', function(data){
    console.log('SOCKET : received push', data);
    var track = getTrack(data.trackId);

    bumpTrack(track, data.score);
  });

});