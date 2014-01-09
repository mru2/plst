// ====================
// Cooldowns controller
// ====================

angular.module('app').controller('CooldownsCtrl', function($scope) {

  // TODO : cooldowns in a service, for sharing in the app ...

  console.log('in CooldownCtrl');

  $scope.cooldowns = [
    { label: "-", duration: 1000, remaining: 0 },
    { label: "+", duration: 5000, remaining: 0 },
    { label: "x", duration: 30000, remaining: 0 }
  ];

  $scope.refresh = function(cooldown){
    console.log('refreshing', cooldown);

    if(cooldown.remaining == 0){
      cooldown.remaining = cooldown.duration;
    }
  };

});