'use strict';

WorldCupApp.getModule().controller('GroupCtrl',
    ['$scope', '$location', '$q', 'Guesser', function($scope, $location, $q, Guesser) {

      var stage = $location.search().stage;
      stage = stage || 'Group A';
      $scope.stage = stage;

      $scope.loginInfo = {
        nickName: WorldCupApp.user_nickname,
        loginUrl: WorldCupApp.login_url
      };
      $scope.loggedIn = !!$scope.loginInfo.nickName;

      $scope.showBetModal = function(mid) {
        // If loggedIn, display the modal
        if ($scope.loggedIn) {
          var theMatch = null;
          $scope.matches.some(function(e) {
            if (e.matchid == mid) {
              theMatch = e;
            }
            return e.matchid == mid;
          });
          var theGuess = $scope.guesses[mid];

          $scope.theMatch = {
            matchid: theMatch.matchid,
            team_a: theMatch.team_a,
            team_b: theMatch.team_b
          };
          $scope.theGuess = {
            guess_a: theGuess.guess_a,
            guess_b: theGuess.guess_b
          };
          $scope.theGuessRef = theGuess;

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
        Guesser.listA(stage, function(data) {
          var matches = data[0];
          matches.forEach(function(e) {
            e.edit = false;
          });
          deferred.resolve(matches);
        });
        return deferred.promise;
      }

      function asyncBetAll() {
        var deferred = $q.defer();
        Guesser.mybets(function(data) {
          var guesses = [];
          data.forEach(function(e) {
            guesses[e.matchid] = e;
          });
          deferred.resolve(data);
        });
        return deferred.promise;
      }

      function updateAll() {
        asyncListA().then(function(matches) {
          asyncBetAll().then(function(guesses) {
            // After get all the data, massage the guess data to initialize the
            // object for unguessed matches
            matches.forEach(function(m) {
              if (!guesses[m.matchid]) {
                guesses[m.matchid] = {
                  matchid: m.matchid
                };
              }
            });
            // Then set them to the scope
            $scope.matches = matches;
            $scope.guesses = guesses;
          });
        });
      }

    }]);