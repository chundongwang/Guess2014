'use strict';

WorldCupApp.getModule().controller('DateCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  
  $scope.known = angular.equals($cookies.gwKnown, 'true');
  $scope.loaded = false;
  $scope.loggedIn = !!WorldCupApp.user_nickname;
  
  $scope.showBetModal = function(match) {
    // If loggedIn, display the modal
    if ($scope.loggedIn) {
      if (Guesser.bettable(match) && (!match.bet || match.bet.result<0)) {
        $scope.theBet = match.bet ? {
          score_a: match.bet.score_a,
          score_b: match.bet.score_b,
          extra_a: match.bet.extra_a,
          extra_b: match.bet.extra_b
        } : {};
        $scope.theMatchRef = match;

        if ((/^Group/).test(match.stage)) {
          $('#betModal').modal();
        } else {
          $('#betModalExtra').modal();
        }
      } else {
        $location.path('/betanalysis').search({m:match.matchid});
      }
    }
    // Otherwise, redirect to signin
    else {
      window.location.href = WorldCupApp.loginUrl;
    }
  }

  $scope.getBetClass = function(match) {
    var bet = match.bet;
    var classes = ['list-group-item', 'editable-row'];
    if (!!bet) {
      switch(bet.result) {
        case 0:
          classes.push('bet-wrong');
          break;
        case 1:
          classes.push('bet-okay');
          break;
        case 2:
          classes.push('bet-success');
          break;
        default:
          classes.push('bet-no-result');
          break;
      }
    }
    return classes;
  }
  
  $scope.setKnown = function() {
    $scope.known = true;
    $cookies.gwKnown = 'true';
  }

  function updateAll() {
    var listfunc = Guesser.listAllByDate;
    listfunc(function(groups) {
      $scope.loaded = true;
      $scope.groups = groups;
      
      // Retrieve bets if the user is logged in
      if ($scope.loggedIn) {
        Guesser.mybets(function(bets) {
          bets.forEach(function(b) {
            groups.some(function(g) {
              return g.some(function(m){
                if (m.matchid == b.bet_match_id) {
                  m.bet = b;
                  m.bet.result = Miner.rateResult(b);
                }
                return m.matchid == b.bet_match_id;
              });
            });
          });
        });
      }
    });
  }

  updateAll();
}]);  