angular.module('app').directive('multiplier', function(ServerDate){

  var startCooldown = function(scope){
    scope.active = false;

    var render = function(){
      scope.completion = ( ServerDate.now() - scope.start ) / 10000;

      if (scope.completion >= 1) {
        // Stop drawing
        scope.active = false;
      };

      // Force rendering
      scope.$apply();

      // Draw next frame if still active
      if (!!scope.active){
        requestAnimationFrame(render);
      }
    };

    // Start render loop if not active and there is time
    if (!scope.active && scope.start >= (ServerDate.now() - 10000)) {
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