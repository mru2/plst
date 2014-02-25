// ==============
// Socket service
// https://gist.github.com/nicksheffield/7423095
// ==============

angular.module('app').factory('$socket', function($rootScope){

  // TODO better, handle development and production configuration
  var socket;
  log('Connecting socket');
  if ( location.hostname === 'localhost' ) {
    socket = io.connect('http://localhost:3457');
  }
  else {
    socket = io.connect('http://' + location.hostname + ':3456');
  }
  log('Socket connected');


  return {
    on: function (eventName, callback) {
      log('Binding socket to ' + eventName);
      socket.on(eventName, function () {  
        var args = arguments;
        console.log('[SOCKET] received ' + eventName + ' with', args);
        log('Socket received message ' + eventName);
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },

    emit: function (eventName, data, callback) {
      console.log('[SOCKET] emitting ' + eventName + ' with', data);
      log('Socket emitting message ' + eventName);
      socket.emit(eventName, data, function () {
        var args = arguments;
        log('Socket emitted message ' + eventName);
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };

});