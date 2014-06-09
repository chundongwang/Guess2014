'use strict';

WorldCupApp.getModule().controller('MyCtrl', ['$scope', 'Guesser', 'Miner', function($scope, Guesser, Miner) {
  $scope.isediting = [];
  $scope.results = [];

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
      $scope.bets = data;
      for (var i = $scope.bets.length - 1; i >= 0; i--) {
        $scope.isediting[i]=false;
        $scope.results[i]=rateResult($scope.bets[i]);
      };
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
    for (var i = $scope.isediting.length - 1; i >= 0; i--) {
      $scope.isediting[i]=false;
    };
  }
  
  $scope.editBet = function(iEdit, $event) {
    if (!$scope.hasresult[iEdit]) {
      $scope.resetAllEditables();
      $scope.isediting[iEdit]=true;
      $scope.stopBubble($event);
    }
  };
  
  $scope.saveBet = function(iEdit, $event) {
    if (!$scope.hasresult[iEdit]) {
      $scope.disableSave = true;
      Guesser.bet($scope.bets[iEdit].bet_match_id, $scope.bets[iEdit], function(data){
        // refresh the bets in parent scope
        $scope.bets[iEdit] = data;
        $scope.resetAllEditables();
        $scope.disableSave = false;
      });
      $scope.stopBubble($event);
    }
  };

  $scope.getClass = function(iEdit) {
    switch($scope.results[iEdit]) {
      case 0:
        return ['bg-danger']
      case 1:
        return ['bg-warning']
      case 2:
        return ['bg-success']
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