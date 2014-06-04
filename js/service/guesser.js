'use strict';

WorldCupApp.getModule().factory('Guesser', ['$http', function($http) {
  function listAll(successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + '/list', method: 'GET'}).success(successCallback).error(errorCallback);
  };
  
  function listA(groupName, successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + '/list/'+groupName, method: 'GET'}).success(successCallback).error(errorCallback);
  }
  
  function mybets(successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + '/mybet', method:'GET'}).success(successCallback).error(errorCallback);
  }
  
  function bet(matchid, scores, successCallback, errorCallback) {
    var parms = {
        sa: scores.score_a,
        sb: scores.score_b
    };
    $http({url: WorldCupApp.getRoot() + '/bet/' + matchid + '?' + $.param(parms), method:'GET'}).success(successCallback).error(errorCallback);
  }

  return {
    listAll: listAll,
    listA: listA,
    mybets: mybets,
    bet: bet
  };
}]);