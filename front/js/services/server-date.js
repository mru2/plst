// Synchronize the clock with the server time. Cf NTP protocol

angular.module('app').factory('ServerDate', function($socket, $rootScope){

  $rootScope.synced = false;

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

    // Assume request/response times are equivalent...
    var d1 = times[1] - times[0];
    var d2 = times[2] - times[0];
    var d3 = times[3] - times[0];

    offset = (d1 + d3 - d2) / 2;

    console.log('synced. offset is', offset);
    $rootScope.synced = true;
  });


  return {
    now: function(){
      return Date.now() - offset;
    }
  };

});