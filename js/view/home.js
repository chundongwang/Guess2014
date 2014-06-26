'use strict';

WorldCupApp.getModule().controller('HomeCtrl', ['$scope', 'Guesser', function($scope, Guesser) {
  $scope.loaded = false;

  function updateAll() {
    Guesser.listAll(function(groups) {
      $scope.loaded = true;
      $scope.showEulaModal();
      
      // Retrieve bets if the user is logged in
      if ($scope.loggedIn) {
        $scope.packMyBets(groups);
      }
      $scope.groups = groups;
    });
  }

  updateAll();
}]);  