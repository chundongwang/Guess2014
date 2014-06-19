'use strict';

WorldCupApp.getModule().controller('BestBetCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  $scope.loaded = false;

  function updateAll() {
    Guesser.bestbet(function(data) {
      $scope.loaded = true;
      // Make sure user accepted Eula or navigate to home to review it.
      if (!Guesser.hasAcceptedEula()) {
        $location.path('/home');
      }
      if (!!data[0][1].points) {
        $scope.showpoints = true;
        
        for (var i = data.length - 1; i >= 0; i--) {
          if (data[i][1].points == 0) {
            data[i].tag = "求南总咒语";
          } else if (data[i][1].points < 10) {
            data[i].tag = "求爆发";
          } 
          if (data[i][0] == "Carl Nan") {
            data[i].tag = "南总";
          }
        }
        data[0].tag = "牛 B 证";
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