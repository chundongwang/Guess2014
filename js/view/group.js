'use strict';

WorldCupApp.getModule().controller('GroupCtrl', ['$scope', '$location', 'Guesser', function($scope, $location, Guesser) {
  
  var stage = $location.search().stage;
  stage = stage || 'Group A';
  $scope.stage = stage;
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };
  $scope.bettable = !!$scope.loginInfo.nickName;
  function updateAll() {
    Guesser.listA(stage, function(data){
      $scope.matches = data[0];
    });
  }
  
  updateAll();

}]);