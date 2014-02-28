
angular.module('app').factory('cooldowns', function($socket){

  function Cooldown(opts){
    this.iconCode = opts.iconCode;
    this.action = opts.action;
    this.duration = opts.duration;
    this.color = opts.color;
    this.lastClick = opts.lastClick;
    this.track = opts.track;
    this.loading = false;
  }

  Cooldown.prototype.use = function(track){

    track = track || this.track;

    // Check if ok
    if( Date.now() < this.lastClick + this.duration ){
      return;
    }
    else {
      this.loading = true;
      var cooldown = this;

      // Update the track (todo in services also ...)
      $socket.emit(this.action, {trackId: track.id}, function(){
        cooldown.loading = false;
        cooldown.lastClick = Date.now();
      });
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
      return new Cooldown({ action: "upvote", iconCode: 0xf067, duration: 3000, color: '#39CCCC', lastClick: lastClick, track: track })
    }
  };

});