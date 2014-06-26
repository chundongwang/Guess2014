'use strict';

WorldCupApp.getModule().controller('BetanalysisCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  $scope.loaded = false;

  function updateAll() {
    var match_id = $location.search().m || 1;
    Guesser.report(match_id, function(data) {
      $scope.loaded = true;
      // Make sure user accepted Eula or navigate to home to review it.
      if (!Guesser.hasAcceptedEula()) {
        $location.path('/home');
      }
      // Make sure this page is available only after cut-off time
      if (Guesser.bettable(data[0].match)) {
        $location.path('/home');
      }
      $scope.bets = data;
      $scope.bets.forEach(function(b,i){
        b.result=Miner.rateResult(b);
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

  updateAll();
}]);