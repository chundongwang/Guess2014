'use strict';

WorldCupApp.getModule().controller('GroupCtrl', ['$scope', '$location', 'Guesser', function($scope, $location, Guesser) {
  

  
  var stage = $location.search().stage;
  stage = stage || 'Group A';
  $scope.stage = stage;
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };
  $scope.bettable = !!$scope.loginInfo.nickName;

  $scope.bet = function(mid) {
    // If bettable, display edit box for that match
    if ($scope.bettable) {
      $scope.matches.forEach(function(e){if(e.matchid == mid){e.edit = true;}});
    }
    // Otherwise, redirect to bet
    else {
      window.location.href = $scope.loginInfo.loginUrl;
    }
  }
  
  $scope.save = function(mid, score_a, score_b) {
    console.log(mid + ' ' + score_a + ' ' + score_b);
    $scope.matches.forEach(function(e){if(e.matchid == mid){e.edit = false;}});
  }
  
  function updateAll() {
    Guesser.listA(stage, function(data){
      
      var matches = data[0];
      matches.forEach(function(e){e.edit = false;});
      $scope.matches = matches;
    });
  }
  
  updateAll();

}]);