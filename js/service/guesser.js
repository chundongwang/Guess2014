'use strict';

WorldCupApp.getModule().factory('Guesser', ['$http', function($http) {
  function listAll(successCallback, errorCallback) {
    getListHelper('/list', successCallback, errorCallback);
  }

  function listAllByDate(successCallback, errorCallback) {
    getListHelper('/list_by_date', successCallback, errorCallback);
  }
  
  function listA(groupName, successCallback, errorCallback) {
    getListHelper('/list/'+groupName, successCallback, errorCallback);
  }
  
  function mybets(successCallback, errorCallback) {
    getListHelper('/mybet', successCallback, errorCallback);
  }
  
  function report(matchid, successCallback, errorCallback) {
    getListHelper('/report/'+matchid, successCallback, errorCallback);
  }
  
  function popularity(matchid, successCallback, errorCallback) {
    getListHelper('/pop/'+matchid, successCallback, errorCallback);
  }

  function getListHelper(path, successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + path, method:'GET'}).success(successCallback).error(errorCallback);
  }
  
  function bet(matchid, scores, successCallback, errorCallback) {
    var parms = {
        sa: scores.score_a,
        sb: scores.score_b
    };
    $http({url: WorldCupApp.getRoot() + '/bet/' + matchid + '?' + $.param(parms), method:'GET'}).success(successCallback).error(errorCallback);
  }

  function bettable(match) {
    var date = moment.unix(match.date/1000);
    var now = moment().utc();
    return now.isBefore(date.subtract('minutes', 10));
  }

  return {
    listAll: listAll,
    listAllByDate: listAllByDate,
    listA: listA,
    mybets: mybets,
    bet: bet,
    report: report,
    popularity: popularity,
    bettable: bettable
  };
}]);