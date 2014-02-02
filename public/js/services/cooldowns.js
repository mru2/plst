
angular.module('app').factory('cooldowns', function($socket){

  function Cooldown(opts){
    this.iconCode = opts.iconCode;
    this.action = opts.action;
    this.duration = opts.duration;
    this.color = opts.color;
    this.lastClick = opts.lastClick;
    this.track = opts.track;
  }

  Cooldown.prototype.use = function(track){

    track = track || this.track;
    console.log('using cooldown', this, 'on track', track);

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

  return {
    upvote: function(track){
      return new Cooldown({ action: "vote", iconCode: 0xf005, duration: 1000, color: '#0ff', lastClick: lastClick, track: track })
    },
    multiply: new Cooldown({ action: "dot",  iconCode: 0xf110, duration: 3000, color: '#ff0', lastClick: lastClick }),
    spotlight: new Cooldown({ action: "bomb", iconCode: 0xf135, duration: 8000, color: '#f0f', lastClick: lastClick })
  };

});