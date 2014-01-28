
angular.module('app').factory('cooldowns', function($socket){

  function Cooldown(opts){
    this.iconCode = opts.iconCode;
    this.action = opts.action;
    this.duration = opts.duration;
    this.color = opts.color;
    this.lastClick = opts.lastClick;
  }

  Cooldown.prototype.use = function(track){

    // Check if ok
    if( Date.now() < this.lastClick + this.duration ){
      return;
    }
    else {
      // Update the track (todo in services also ...)
      console.log('using cooldown', this.action, 'on', track);
      $socket.emit(this.action, {trackId: track.id});

      // Refresh the count
      this.lastClick = Date.now();
    }

  }

  Cooldown.prototype.completion = function(){
    var delta = Date.now() - this.lastClick;

    if (delta >= this.duration){
      return 1;
    }
    else {
      return delta / this.duration;
    }
  }


  var lastClick = Date.now() - 50000;

  return [
    new Cooldown({ action: "vote", iconCode: 0xf005, duration: 1000, color: '#0ff', lastClick: lastClick }),
    new Cooldown({ action: "dot",  iconCode: 0xf110, duration: 3000, color: '#ff0', lastClick: lastClick }),
    new Cooldown({ action: "bomb", iconCode: 0xf135, duration: 8000, color: '#f0f', lastClick: lastClick })
  ];

});