'use strict';

WorldCupApp.getModule().controller('GroupCtrl', ['$scope', '$location', function($scope, $location) {
  $scope.stage = $location.search().stage;

}]);