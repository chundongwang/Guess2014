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
      var results = data.results;
      $scope.slipped_award = data.slipped_award;
      if (!!results[0][1].points) {
        $scope.showpoints = true;
        
        for (var i = results.length - 1; i >= 0; i--) {
          if (results[i][1].points == 0) {
            results[i].tag = "求南总咒语";
          } else if (results[i][1].points < 50) {
            results[i].tag = "求爆发";
          } 
          if (results[i][0] == "Carl Nan") {
            results[i].tag = "南总要致富";
          }
        }
        results[0].tag = "首富";
        results[1].tag = "牛 B 证";
        results[2].tag = "牛 C 证";
      }
      $scope.betscores = results;
      Guesser.listDonateEmailOnly(function(results) {
        var betscores = $scope.betscores;
        for (var i = betscores.length - 1; i >= 0; i--) {
          var iDonate= results.length - 1;
          for (; iDonate >= 0; iDonate--) {
            if (betscores[i][0] == results[iDonate].useremail) 
              break;
          }
          if (iDonate >= 0) {
            betscores[i][1].donate = true;
          }
        }
        $scope.betscores = betscores;
      });
    });
  }
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };

  updateAll();
}]);