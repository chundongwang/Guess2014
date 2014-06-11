'use strict';

WorldCupApp.getModule().controller('HomeCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  
  $scope.known = angular.equals($cookies.gwKnown, 'true');
  $scope.mode = $location.search().mode || 'default';
  $scope.loaded = false;

  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };
  $scope.loggedIn = !!$scope.loginInfo.nickName;
  
  $scope.showBetModal = function(match) {
    // If loggedIn, display the modal
    if ($scope.loggedIn) {
      if (!match.bet || match.bet.result<0) {
        $scope.theBet = match.bet ? {
          score_a: match.bet.score_a,
          score_b: match.bet.score_b
        } : {};
        $scope.theMatchRef = match;

        $('#betModal').modal();
      }
    }
    // Otherwise, redirect to signin
    else {
      window.location.href = $scope.loginInfo.loginUrl;
    }
  }

  $scope.getBetClass = function(bet) {
    var classes = ['list-group-item', 'match'];
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
          classes.push('editable-row');
          break;
      }
    } else {
      classes.push('editable-row');
    }
    return classes;
  }
  
  $scope.setKnown = function() {
    $scope.known = true;
    $cookies.gwKnown = 'true';
  }

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
    var listfunc = $scope.mode == 'bydate' ? Guesser.listAllByDate : Guesser.listAll;
    listfunc(function(groups) {
      $scope.loaded = true;
      $scope.groups = groups;
      $scope.showEulaModal();
      
      // Retrieve bets if the user is logged in
      if ($scope.loggedIn) {
        Guesser.mybets(function(bets) {
          bets.forEach(function(b) {
            groups.some(function(g) {
              return g.some(function(m){
                if (m.matchid == b.bet_match_id) {
                  m.bet = b;
                  m.bet.result = rateResult(b);
                }
                return m.matchid == b.bet_match_id;
              });
            });
          });
        });
      }
    });
  }
  
  //function showEulaModal() {
  $scope.showEulaModal = function() {
    // If alread accepted, no need to show Eula again
    if (!angular.equals($cookies.gwEulaStatus, 'true')) {
      if (angular.equals($cookies.gwEulaStatus, 'deny')) {
        location.replace("http://apps.leg.wa.gov/rcw/default.aspx?cite=9.46.240");
      } else {
        $('#eulaModal').modal();
      }
    }
  }

  updateAll();
}]);  