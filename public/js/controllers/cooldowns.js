// ====================
// Cooldowns controller
// ====================

angular.module('app').controller('CooldownsCtrl', function($scope) {

  // TODO : cooldowns in a service, for sharing in the app ...

  console.log('in CooldownCtrl');

  $scope.cooldowns = [
    { label: "-", duration: 1000, remaining: 1000 },
    { label: "+", duration: 5000, remaining: 5000 },
    { label: "x", duration: 30000, remaining: 30000 }
  ];

  $scope.refresh = function(cooldown){
    console.log('refreshing', cooldown);

    if(cooldown.remaining == 0){
      cooldown.remaining = cooldown.duration;
    }
  };

});