angular.module('app').directive('multiplier', function(){

  var startCooldown = function(scope){
    scope.active = false;

    var render = function(){
      scope.completion = ( Date.now() - scope.start ) / 15000;

      if (scope.completion >= 1) {
        // Stop drawing
        scope.active = false;
        console.log('stop drawing!!');
      };

      // Force rendering
      scope.$apply();

      // Draw next frame if still active
      if (!!scope.active){
        requestAnimationFrame(render);
      }
    };

    // Start render loop if not active and there is time
    if (!scope.active && scope.start >= (Date.now() - 15000)) {
      console.log('start drawing');
      scope.active = true;
      requestAnimationFrame(render);
    }

  };

  var link = function(scope, element, attrs){
    console.log('linking multiplier with', scope, element, attrs);

    scope.$watch('start', function() {
      startCooldown(scope);
    });

    startCooldown(scope);

    // Watch the change in start / strenght, to rerender

  };

  return {

    // Check element name
    restrict: 'E',

    // Internal variables
    scope: {
      // 1-way binding
      strength: '=strength',
      start: '=start'
    },

    // HTML template
    templateUrl: 'js/templates/multiplier.html',

    // Internal scope
    link: link
  }

});