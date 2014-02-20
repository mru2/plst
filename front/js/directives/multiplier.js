angular.module('app').directive('multiplier', function(){

  var link = function(scope, element, attrs){
    console.log('linking multiplier with', scope, element, attrs);
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