'use strict';
// The base controller that all view controllers inherit from
WorldCupApp.getModule().controller('TopViewCtrl', 
    ['$scope', '$cookies', '$location', 'Guesser', 'Miner', 
    function($scope, $cookies, $location, Guesser, Miner){

  $scope.known = angular.equals($cookies.gwKnown, 'true');

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
      window.location.href = WorldCupApp.login_url;
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

  $scope.showEulaModal = function() {
    // If alread accepted, no need to show Eula again
    if (!Guesser.hasAcceptedEula()) {
      if (angular.equals($cookies.gwEulaStatus, 'deny')) {
        location.replace("http://apps.leg.wa.gov/rcw/default.aspx?cite=9.46.240");
      } else {
        $('#eulaModal').modal();
      }
    }
  }
  $scope.packMyBets = function(groups) {
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
}]);