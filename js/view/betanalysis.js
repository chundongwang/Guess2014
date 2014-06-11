'use strict';

WorldCupApp.getModule().controller('BetanalysisCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
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
    var match_id = $location.search().m || 1;
    Guesser.report(match_id, function(data) {
      $scope.loaded = true;
      // Make sure user accepted Eula or navigate to home to review it.
      if (!angular.equals($cookies.gwEulaStatus, 'true')) {
        $location.path('/home');
      }
      $scope.bets = data;
      $scope.bets.forEach(function(b,i){
        b.result=rateResult(b);
      });
    });
    Guesser.popularity(match_id, function(data) {
      $scope.pops = data;
    });
  }

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