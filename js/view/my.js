'use strict';

WorldCupApp.getModule().controller('MyCtrl', ['$scope', 'Guesser', function($scope, Guesser) {
  $scope.isediting = [];

  function updateAll() {
    Guesser.mybets(function(data) {
      $scope.bets = data;
      for (var i = data.length - 1; i >= 0; i--) {
        $scope.isediting[i]=false;
      };
    });
  }

  $scope.stopBubble = function($event) {    
    // Prevent bubbling to resetAllEditables.
    // On recent browsers, only $event.stopPropagation() is needed
    if ($event.stopPropagation) $event.stopPropagation();
    if ($event.preventDefault) $event.preventDefault();
    $event.cancelBubble = true;
    $event.returnValue = false;
  }

  $scope.resetAllEditables = function() {
    for (var i = $scope.isediting.length - 1; i >= 0; i--) {
      $scope.isediting[i]=false;
    };
  }
  
  $scope.editBet = function(iEdit, $event) {
    $scope.resetAllEditables();
    $scope.isediting[iEdit]=true;
    $scope.stopBubble($event);
  };
  
  $scope.saveBet = function(iEdit, $event) {
    $scope.disableSave = true;
    Guesser.bet($scope.bets[iEdit].bet_match_id, $scope.bets[iEdit], function(data){
      // refresh the bets in parent scope
      $scope.bets[iEdit] = data;
      $scope.resetAllEditables();
      $scope.disableSave = false;
    });
    $scope.stopBubble($event);
  };
  
  $scope.loginInfo = {
    nickName:WorldCupApp.user_nickname, 
    loginUrl:WorldCupApp.login_url
  };

  updateAll();
}]);