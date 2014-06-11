'use strict';

WorldCupApp.getModule().controller('MyCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  $scope.loaded = false;

  function rateResult(bet) {
    if (Miner.hasScores(bet)) {
      var guess = {a:bet.score_a, b:bet.score_b};
      var actual = {a:bet.match.score_a, b:bet.match.score_b}
      if (Miner.rightAboutScore(actual, guess)) {
        return 2;
      } else if (Miner.rightAboutWinner(actual, guess)) {
        return 1;
      } else {
        return 0;
      }
    }
    return -1;
  }

  function updateAll() {
    Guesser.mybets(function(data) {
      $scope.loaded = true;
      // Make sure user accepted Eula or navigate to home to review it.
      if (!angular.equals($cookies.gwEulaStatus, 'true')) {
        $location.path('/home');
      }
      $scope.bets = data;
      $scope.bets.forEach(function(b,i){
        b.editable=false;
        b.result=rateResult(b);
      });
    });
  }

  $scope.stopBubble = function($event) {    
    // Prevent bubbling to resetAllEditables.
    // On recent browsers, only $event.stopPropagation() is needed
    if ($event.stopPropagation) $event.stopPropagation();
    if ($event.preventDefault) $event.preventDefault();
    $event.cancelBubble = true;
    $event.returnValue = false;
  }

  $scope.resetAllEditables = function() {
    for (var i = $scope.bets.length - 1; i >= 0; i--) {
      $scope.bets[i].editable=false;
    };
  }
  
  $scope.editBet = function(bet, $event) {
    if (bet.result<0) {
      $scope.resetAllEditables();
      bet.editable=true;
      $scope.stopBubble($event);
    }
  };
  
  $scope.saveBet = function(iEdit, $event) {
    if ($scope.bets[iEdit].result<0) {
      $scope.disableSave = true;
      Guesser.bet($scope.bets[iEdit].bet_match_id, $scope.bets[iEdit], function(data){
        // refresh the bets in parent scope
        $scope.bets[iEdit] = data;
        $scope.bets[iEdit].result=rateResult(data);
        $scope.resetAllEditables();
        $scope.disableSave = false;
      });
      $scope.stopBubble($event);
    }
  };

  $scope.getClass = function(bet) {
    switch(bet.result) {
      case 0:
        return ['bet-wrong']
      case 1:
        return ['bet-okay']
      case 2:
        return ['bet-success']
      default:
        return ['editable-row'];
    }
  }
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };

  updateAll();
}]);