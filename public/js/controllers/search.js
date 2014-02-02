// =================
// Search controller
// =================

angular.module('app').controller('SearchCtrl', function($scope) {

  console.log('in SearchCtrl');

  $scope.query = '';
  $scope.searching = false;

  $scope.doSearch = function(){
    console.log('searching', $scope.query);
    if ($scope.query == '') {
      return;
    }

    $scope.searching = true;

    DZ.api('/search', 'GET', {q: $scope.query, order: 'RANKING'}, function(res){
      
      $scope.$apply(function(){
        $scope.searching = false;
        $scope.results = res.data;
      });

    });

  }

});
