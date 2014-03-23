// Represent the current user, persisted in session
angular.module('app').factory('User', function($cookieStore, Sync){

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

  var votes = 0;
  var pendingVotes = [];
  var totalPendingVotes = 0;


  var User = {
    id: uid,

    bootstrap: function(data){
      votes = data.votes;
    },

    votes: function(){
      return votes - totalPendingVotes;
    },

    useVote: function(trackId){
      console.log('using vote on ', trackId);
      pendingVotes[trackId] = pendingVotes[trackId] || 0;
      pendingVotes[trackId] += 1;
      totalPendingVotes += 1;
    },

    clearVotes: function(trackId){
      console.log('clearing votes for ', trackId);
      var trackVotes = pendingVotes[trackId];

      totalPendingVotes -= trackVotes;
      pendingVotes[trackId] = 0;

      // Assume votes are cashed, will be corrected via the server anyway
      votes -= trackVotes;
    },

    updateVotes: function(newVotes){
      votes = newVotes;
    }
  };

  Sync.setUser(User);
  return User;

});