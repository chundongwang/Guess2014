'use strict';

WorldCupApp.getModule().controller('HomeCtrl', ['$scope', 'Guesser', function($scope, Guesser) {

  function updateAll() {
    Guesser.listAll(function(data) {
      $scope.groups = data;
    });
  }
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };

  updateAll();
}]);