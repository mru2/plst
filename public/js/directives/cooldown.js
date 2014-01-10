angular.module('app').directive('cooldown', function($interval){

  // var canvas = document.createElement('canvas');
  // canvas.setAttribute('width', width);
  // canvas.setAttribute('height', height);  


  // Update the canvas
  var link = function(scope, element, attrs){
    console.log('linking with', scope, ',', element, 'and', attrs)

    // Local variables
    var label, ctx, size, center, radius, max, thickness, remaining;

    // State machine
    var drawing = false;
    var former_ts;
    var delta;

    // Init the canvas and the values
    function init(){

      // Global variables
      label = attrs.label;
      size = attrs.size;
      center = parseInt(attrs.size)/2;
      radius = center * 0.9; // Not filling everything
      max = parseInt(attrs.max); // Assume max is 10s for now
      thickness = radius * 0.1;

      // Canvas initialization
      var canvas = element[0];
      canvas.setAttribute('width', size);
      canvas.setAttribute('height', size);

      // Saving the canvas 2D context
      ctx = canvas.getContext('2d');

      // Render
      startCooldown();
    }

    // Update the canvas
    function tick(ts){

      // Get the time delta
      if (former_ts == 0){
        former_ts = ts;
      }

      delta = ts - former_ts;
      former_ts = ts;

      // Update the remaining time
      remaining = remaining - delta;

      if (remaining < 0){
        // Animation end
        drawing = false;
      }

      ctx.clearRect(0, 0, (center*2), (center*2));

      // Draw the label
      drawLabel();

      // Draw the progressbar
      drawCircle();

      if( drawing ){
        requestAnimationFrame(tick);        
      }
    }

    // Draw the label
    function drawLabel(){
      ctx.fillStyle = "#ddd";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Actual text drawing
      ctx.fillText(label, center, center);
    }

    // Draw the progress circle
    function drawCircle(){

      var startAngle = - (Math.PI / 2);
      var endAngle = ((Math.PI * 2 ) * (1 - (remaining / max))) - (Math.PI / 2);
      var anticlockwise = false;

      ctx.beginPath();
      ctx.arc(center, center, parseInt(radius), startAngle, endAngle, anticlockwise);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }


    function startCooldown(){
      if(drawing == true){
        console.log('already drawing');
      }
      else{
        console.log('starting cooldown');
        drawing = true;
        former_ts = 0;
        requestAnimationFrame(tick);
      }
    }


    // Initialize the countdown
    init();

    // Setup the interval loop
    // Likely in need of an optimisation (when remaining = 0)
    // $interval(function() {
    //   remaining -= 20;
    //   if (remaining < 0){
    //     remaining = 0;
    //   }
    //   else{
    //     update();
    //   }
    // }, 20);

    // Watch the changes in the remaining attr
    // attrs.$observe('remaining', function(value){
    scope.$watch('lastClick', function(value) {
      console.log('update in last-click value', value);
      remaining = max - (Date.now() - value);
      console.log('restarting with remaining', remaining);
      startCooldown();
    });

  }

  return {

    // Check element name
    restrict: 'A',

    // Internal variables
    scope: {
      // 1-way binding
      lastClick: '=lastClick'
    },

    // HTML template
    link: link

  }

});