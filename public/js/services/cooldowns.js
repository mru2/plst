
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


  var lastClick = Date.now() - 50000;

  return [
    new Cooldown({ action: "vote", iconCode: 0xf005, duration: 1000, remaining: 0, color: '#0ff', lastClick: lastClick }),
    new Cooldown({ action: "dot",  iconCode: 0xf110, duration: 3000, remaining: 0, color: '#ff0', lastClick: lastClick }),
    new Cooldown({ action: "bomb", iconCode: 0xf135, duration: 8000, remaining: 0, color: '#f0f', lastClick: lastClick })
  ];

});