'use strict';

WorldCupApp.getModule().controller('GroupCtrl', ['$scope', '$location', '$q', 'Guesser', 
                                                 function($scope, $location, $q, Guesser) {

  var stage = $location.search().stage;
  stage = stage || 'Group A';
  $scope.stage = stage;
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };
  $scope.loggedIn = !!$scope.loginInfo.nickName;

  $scope.bet = function(mid) {
    // If loggedIn, display edit box for that match
    if ($scope.loggedIn) {
      $scope.matches.forEach(function(e){if(e.matchid == mid){e.edit = true;}});
    }
    // Otherwise, redirect to signin
    else {
      window.location.href = $scope.loginInfo.loginUrl;
    }
  }

  $scope.save = function(mid, score_a, score_b) {
    console.log(mid + ' ' + score_a + ' ' + score_b);
    $scope.matches.forEach(function(e){if(e.matchid == mid){e.edit = false;}});
  }
  
  $scope.highlight = function(panel){
    console.log(panel);
  }
  
  updateAll();
  
  function asyncListA() {
    var deferred = $q.defer();
    Guesser.listA(stage, function(data){
      var matches = data[0];
      matches.forEach(function(e){e.edit = false;});
      deferred.resolve(matches);
    });
    return deferred.promise;
  }
  
  function asyncBetAll() {
    var deferred = $q.defer();
    Guesser.betAll(function(data){
      var guesses = [];
      data.forEach(function(e){guesses[e.matchid]=e;});
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  function updateAll() {
    asyncListA().then(function(matches){
      asyncBetAll().then(function(guesses){
        // After get all the data, massage the guess data to initialize the object for unguessed matches
        matches.forEach(function(m){if (!guesses[m.matchid]) {guesses[m.matchid] = {matchid:m.matchid};}});
        // Then set them to the scope
        $scope.matches = matches;
        $scope.guesses = guesses;
      });
    });
  }


}]);