// ====================
// Cooldowns controller
// ====================

// TODO
// - displaying in directive via requestAnimationFrame, without constant scope watching
// - not updating remaining in scope, only storing last click date (same in DB)

angular.module('app').controller('CooldownsCtrl', function($scope) {

  // TODO : cooldowns in a service, for sharing in the app ...

  console.log('in CooldownCtrl');

  var lastClick = Date.now() - 50000;

  $scope.cooldowns = [
    { label: "-", duration: 1000,  remaining: 0, lastClick: lastClick },
    { label: "+", duration: 5000,  remaining: 0, lastClick: lastClick },
    { label: "x", duration: 30000, remaining: 0, lastClick: lastClick }
  ];

  $scope.refresh = function(cooldown){
    // console.log('refreshing', cooldown);

    // if(cooldown.remaining == 0){
      cooldown.lastClick = Date.now();
    // }
  };

});