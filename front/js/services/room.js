// Represent the current room
angular.module('app').factory('Room', function(Sync){

  var uid = 'myroom';

  var Room = {
    id: uid
  };

  Sync.setRoom(Room);
  return Room;

});

