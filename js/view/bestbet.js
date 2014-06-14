'use strict';

WorldCupApp.getModule().controller('BestBetCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  $scope.loaded = false;

  function updateAll() {
    Guesser.bestbet(function(data) {
      $scope.loaded = true;
      // Make sure user accepted Eula or navigate to home to review it.
      if (!angular.equals($cookies.gwEulaStatus, 'true')) {
        $location.path('/home');
      }
      $scope.betscores = data;
    });
  }
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };

  updateAll();
}]);