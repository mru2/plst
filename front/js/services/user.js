// Represent the current user, persisted in session
angular.module('app').factory('User', function($cookieStore){

  var generateUid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };

  var uid = $cookieStore.get('uid')

  if (!uid) {
    uid = generateUid();
    console.log('generated uid', uid);
    $cookieStore.put('uid', uid);
  }

  return {
    id: uid,
    currentStarId: null
  };

});