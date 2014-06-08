'use strict';

WorldCupApp.getModule().controller('HomeCtrl', ['$scope', '$cookies', '$location', 'Guesser', function($scope, $cookies, $location, Guesser) {
  
  $scope.known = angular.equals($cookies.gwKnown, 'true');
  $scope.mode = 'default';

  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };
  $scope.loggedIn = !!$scope.loginInfo.nickName;
  
  $scope.showBetModal = function(match) {
    // If loggedIn, display the modal
    if ($scope.loggedIn) {
      $scope.theBet = match.bet ? {
        score_a: match.bet.score_a,
        score_b: match.bet.score_b
      } : {};
      $scope.theMatchRef = match;

      $('#betModal').modal();
    }
    // Otherwise, redirect to signin
    else {
      window.location.href = $scope.loginInfo.loginUrl;
    }
  }

  
  $scope.setKnown = function() {
    $scope.known = true;
    $cookies.gwKnown = 'true';
  };

  function updateAll() {
    var listfunc = Guesser.listAll;
    if ($scope.mode == 'bydate') {
      listfunc = Guesser.listAllByDate;
    }
    listfunc(function(groups) {
      $scope.groups = groups;
      
      // Retrieve bets if the user is logged in
      if ($scope.loggedIn) {
        Guesser.mybets(function(bets) {
          bets.forEach(function(b) {
            groups.some(function(g) {
              return g.some(function(m){
                if (m.matchid == b.bet_match_id) {m.bet = b;}
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