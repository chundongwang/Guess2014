'use strict';

WorldCupApp.getModule().controller('CarlNanCtrl', ['$scope', '$cookies', '$location', 'Guesser', 'Miner', function($scope, $cookies, $location, Guesser, Miner) {
  $scope.loaded = false;
  $scope.disableSave = true;

  $scope.donate = {
    c: 0,
    r: 1,
    m: ''
  };

  $scope.reasons = [
    "献爱心",
    "首富签到",
    "求爆发",
    "求新版咒语",
    "大爷就是砖多"];

  function updateAll() {
    Guesser.listDonate(function(data) {
      $scope.loaded = true;
      // Make sure user accepted Eula or navigate to home to review it.
      if (!Guesser.hasAcceptedEula()) {
        $location.path('/home');
      }
      for (var i = data.length - 1; i >= 0; i--) {
        data[i].reason = $scope.reasons[data[i].reason-1];
      };
      $scope.donates = data;
    });
  }

  $scope.donateBrick = function(match) {
    Guesser.donate($scope.donate, function(data){
      data.reason = $scope.reasons[data.reason-1];
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

  $scope.$watch('donate.c', function(newVal, oldVal){
    $scope.disableSave = (newVal == 0);
  });

  updateAll();
}]);