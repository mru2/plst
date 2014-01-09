var angular = window.angular;
var _ = window._;
var io = window.io;

var app = angular.module('app', [
  'ngAnimate'

// ==============
// Socket service
// https://gist.github.com/nicksheffield/7423095
// ==============

]).factory('socket', function($rootScope){

  var socket = io.connect();

  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },

    emit: function (eventName, data, callback) {
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


// ===============
// Main controller
// ===============

}).controller('MainCtrl', function($scope, socket) {

  console.log('in MainCtrl');

  // To put in a service, to handle scoring, indexing, updates, ...
  // https://github.com/tomkuk/angular-collection
  var getTrack = function(trackId){
    return _.find($scope.playlist, function(track){ return (track.id === trackId); });
  }

  // Bootstraping the playlist
  socket.on('connected', function(data){
    console.log('Socket connected', data);
    $scope.playlist = data;
  });

  // Voting on a track
  $scope.vote = function(track){
    console.log('voting for', track);
    socket.emit('vote', track.id);
  };

  // Handling updates
  socket.on('push', function(trackId){
    console.log('voting for track', trackId.trackId);
    var track = getTrack(trackId.trackId);
    track.score += 1;
  });

  // socket.on('ping', function(data){
  //   console.log('Socket pinged with', data);
  //   $scope.messages.push(data);
  // });

  // $scope.ping = function(){
  //   socket.emit('ping', 'pong');
  // };

});


// console.log('test');

// var socket = io.connect('http://localhost');
// socket.on('news', function (data) {
//   console.log(data);
//   socket.emit('my other event', { my: 'data' });
// });
