angular.module('app').directive('cooldown', function($interval){

  // var canvas = document.createElement('canvas');
  // canvas.setAttribute('width', width);
  // canvas.setAttribute('height', height);  


  // Update the canvas
  var link = function(scope, element, attrs){
    console.log('linking with', scope, ',', element, 'and', attrs)

    // Local variables
    var icon, ctx, size, center, radius, max, thickness, remaining, text, color, fontSize;

    // State machine
    var drawing = false;
    var former_ts;
    var delta;

    // Init the canvas and the values
    function init(){

      // Global variables
      icon = String.fromCharCode(parseInt(attrs.icon));
      size = attrs.size;
      color = attrs.color || "#ddd";
      center = parseInt(attrs.size)/2;
      radius = center * 0.8; // Not filling everything
      fontSize = radius * 0.8;
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

      // Draw the background
      drawBackground();

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
      ctx.font = 'bold ' + fontSize + 'px FontAwesome';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if(drawing){
        if(remaining > 1000){
          text = Math.ceil(remaining/1000);
          ctx.fillStyle = "#ddd";
        }
        else {
          text = Math.ceil(remaining/100) / 10;
          ctx.fillStyle = "#ff0000";
        }
      }
      else{
        text = icon;
        ctx.fillStyle = color;
      }


      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = fontSize * 0.3;

      // Actual text drawing
      
      globalCompositeOperation='darker';
      ctx.strokeText(text, center, center);
      globalCompositeOperation='source-over';

      ctx.fillText(text, center, center);
    }

    //Draw the background
    function drawBackground(){
      if(drawing == false){
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(center, center, parseInt(radius), 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
   }

    // Draw the progress circle
    function drawCircle(){

      var startAngle = - (Math.PI / 2);
      var endAngle = ((Math.PI * 2 ) * (1 - (remaining / max))) - (Math.PI / 2);
      var anticlockwise = false;

      // Shadow
      ctx.beginPath();
      ctx.arc(center, center, (parseInt(radius) + 0), startAngle, endAngle, anticlockwise);
      ctx.lineWidth = thickness*2.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.stroke();

      // Actual arc
      ctx.beginPath();
      ctx.arc(center, center, parseInt(radius), startAngle, endAngle, anticlockwise);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color;
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