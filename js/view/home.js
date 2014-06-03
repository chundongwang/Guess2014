'use strict';

WorldCupApp.getModule().controller('HomeCtrl', ['$scope', 'Guesser', function($scope, Guesser) {

  function updateAll() {
    Guesser.listAll(function(data) {
      $scope.groups = data;
    });
  }

  updateAll();
}]);