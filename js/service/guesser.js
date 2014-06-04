'use strict';

WorldCupApp.getModule().factory("Guesser", ['$http', function($http) {
  function listAll(successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + '/list', method: 'GET'}).success(successCallback).error(errorCallback);
  };
  
  function listA(groupName, successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + '/list/'+groupName, method: 'GET'}).success(successCallback).error(errorCallback);
  }
  
  function betAll(successCallback, errorCallback) {
    //TODO: replace with real backend call
    successCallback([
                     {
                         "guess_a": "1",
                         "guess_b": "3",
                         "matchid": 18
                     },
                     {
                         "guess_a": "1",
                         "guess_b": "1",
                         "matchid": 4
                     },
                     {
                         "guess_a": "0",
                         "guess_b": "2",
                         "matchid": 34
                     }
                 ]);
  }

  return {
    listAll: listAll,
    listA: listA,
    betAll: betAll
  };
}]);