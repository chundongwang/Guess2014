'use strict';

WorldCupApp.getModule().controller('GroupCtrl',
    ['$scope', '$location', '$q', 'Guesser', function($scope, $location, $q, Guesser) {

      var stage = $location.search().stage;
      stage = stage || 'Group A';
      $scope.stage = stage;

      var betMatchId = $location.search().bet;

      $scope.loginInfo = {
        nickName: WorldCupApp.user_nickname,
        loginUrl: WorldCupApp.login_url
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

      updateAll();

      function asyncListA() {
        var deferred = $q.defer();
        Guesser.listA($scope.stage, function(data) {
          deferred.resolve(data[0]);
        });
        return deferred.promise;
      }

      function asyncBetAll() {
        var deferred = $q.defer();
        Guesser.mybets(function(data) {
          deferred.resolve(data);
        });
        return deferred.promise;
      }

      function updateAll() {
        asyncListA().then(function(matches) {
          asyncBetAll().then(function(bets) {
            // After get all the data, find the betted matches and add the bet
            // object to the match
            bets.forEach(function(b) {
              var mm = null;
              if (matches.some(function(m) {
                if (m.matchid == b.bet_match_id) {
                  mm = m;
                }
                return m.matchid == b.bet_match_id;
              })) {
                mm.bet = b;
              }
            });

            $scope.matches = matches;

            // Popup bet model if redirected by
            // jumpToBet() in groupdiv.tpl.html
            if (!!betMatchId) {
              var mm = null;
              if (matches.some(function(m) {
                if (m.matchid == betMatchId) {
                  mm = m;
                }
                return m.matchid == betMatchId;
              })) {
                $scope.showBetModal(mm);
              }
            }
          });
        });
      }

    }]);