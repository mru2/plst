// Synchronize the clock with the server time. Cf NTP protocol

angular.module('app').factory('ServerDate', function($socket){

  var offset = 0;

  var times=[];
  $socket.on('sync', function(t0){
    times[0] = t0;
    times[1] = Date.now();
    $socket.emit('pingback', times[1]);
  });

  $socket.on('pingback', function(t2){
    times[2] = t2;
    times[3] = Date.now();
    offset = ((times[1]-times[0]) + (times[2]-times[3])) / 2;
  });


  return {
    now: function(){
      return Date.now() - offset;
    }
  };

});