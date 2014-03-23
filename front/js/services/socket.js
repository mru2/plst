// ==============
// Socket service
// https://gist.github.com/nicksheffield/7423095
// ==============

angular.module('app').factory('$socket', function($rootScope){

  var socket;

  // TODO better, handle development and production configuration
  if ( location.hostname === 'localhost' ) {
    socket = io.connect('http://localhost:3457');
  }
  else {
    socket = io.connect('http://' + location.hostname + ':3456');
  }

  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        console.log('[SOCKET] received ' + eventName + ' with', args);
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },

    emit: function (eventName, data, callback) {
      console.log('[SOCKET] emitting ' + eventName + ' with', data);
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };

});