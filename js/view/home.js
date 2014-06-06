'use strict';

WorldCupApp.getModule().controller('HomeCtrl', ['$scope', '$cookies', 'Guesser', function($scope, $cookies, Guesser) {
  
  $scope.known = angular.equals($cookies.gwKnown, 'true')

  function updateAll() {
    Guesser.listAll(function(data) {
      $scope.groups = data;
    });
  }
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };
  
  $scope.setKnown = function() {
    $scope.known = true;
    $cookies.gwKnown = 'true';
  };

  updateAll();
}]);