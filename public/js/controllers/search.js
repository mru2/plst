// =================
// Search controller
// =================

angular.module('app').controller('SearchCtrl', function($scope, $socket) {

  $scope.query = '';
  $scope.searching = false;
  $scope.firstView = true;

  $scope.doSearch = function(){
    if ($scope.query == '') {
      return;
    }

    $scope.firstView = false;
    $scope.searching = true;

    DZ.api('/search', 'GET', {q: $scope.query, order: 'RANKING'}, function(res){
      $scope.$apply(function(){
        $scope.searching = false;
        $scope.results = res.data;
      });
    });
  };

  $scope.addTrack = function(track){
    $socket.emit('addTrack', track);
    track.status = 'adding';
  };

  $socket.on('newTrack', function(track){

    // Marking the track as added
    var result = _.find($scope.results, function(result){
      return ( result.id === track.id );
    });

    if (result !== undefined) {
      result.status = 'added';
    }

  });

});
