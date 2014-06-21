'use strict';

WorldCupApp.getModule().controller('CarlNanCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  $scope.loaded = false;

  $scope.donate = {
    c: 0,
    r: 1,
    m: ''
  };

  function processReason(reasonCode) {
    var reason = "大爷就是砖多";
    switch(reasonCode) {
      case 1:
        reason = "献爱心";
        break;
      case 2:
        reason = "首富签到";
        break;
      case 3:
        reason = "求爆发";
        break;
      case 4:
        reason = "求新版咒语";
        break;
    }
    return reason;
  }

  function updateAll() {
    Guesser.listDonate(function(data) {
      $scope.loaded = true;
      // Make sure user accepted Eula or navigate to home to review it.
      if (!Guesser.hasAcceptedEula()) {
        $location.path('/home');
      }
      for (var i = data.length - 1; i >= 0; i--) {
        data[i].reason = processReason(data[i].reason);
      };
      $scope.donates = data;
    });
  }

  $scope.donateBrick = function(match) {
    Guesser.donate($scope.donate, function(data){
      data.reason = processReason(data.reason);
      $scope.donates.push(data);
      $scope.donate = {
        c: 0,
        r: 1,
        m: ''
      };
    })
  };

  $scope.notnow = function(match) {
    $location.path('/home');
  };
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };

  updateAll();
}]);