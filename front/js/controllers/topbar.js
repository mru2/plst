// =================
// Topbar controller
// =================

angular.module('app').controller('TopbarCtrl', function($rootScope, $scope, User, Room) {

  $scope.votes = User.votes;

  $scope.toggleSearch = function(){
    $rootScope.isSearch = !$rootScope.isSearch;
  };

});