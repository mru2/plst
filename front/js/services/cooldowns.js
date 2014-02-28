
angular.module('app').factory('cooldowns', function($socket, ServerDate){

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
    if( ServerDate.now() < this.lastClick + this.duration ){
      return;
    }
    else {
      this.loading = true;
      var cooldown = this;

      // Update the track (todo in services also ...)
      $socket.emit(this.action, {trackId: track.id}, function(){
        cooldown.loading = false;
        cooldown.lastClick = ServerDate.now();
      });
    }

  }

  Cooldown.prototype.completion = function(){
    var delta = ServerDate.now() - this.lastClick;

    if (delta >= this.duration){
      return 1;
    }
    else {
      return delta / this.duration;
    }
  }


  var lastClick = ServerDate.now() - 50000;

  return {
    upvote: function(track){
      return new Cooldown({ action: "upvote", iconCode: 0xf067, duration: 3000, color: '#39CCCC', lastClick: lastClick, track: track })
    },
    multiply: new Cooldown({ action: "multiply",  iconCode: 0xf0e7, duration: 7000, color: '#FFDC00', lastClick: lastClick }),
    spotlight: new Cooldown({ action: "spotlight", iconCode: 0xf004, duration: 15000, color: '#F012BE', lastClick: lastClick })
  };

});