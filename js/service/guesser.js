'use strict';

WorldCupApp.getModule().factory('Guesser', ['$http', '$cookies', function($http, $cookies) {
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
  
  function bestbet(successCallback, errorCallback) {
    getListHelper('/bestbet', successCallback, errorCallback);
  }
  
  function listDonate(successCallback, errorCallback) {
    getListHelper('/donate_list', successCallback, errorCallback);
  }
  
  function listDonateEmailOnly(successCallback, errorCallback) {
    getListHelper('/donate_list?email', successCallback, errorCallback);
  }

  function getListHelper(path, successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + path, method:'GET'}).success(successCallback).error(errorCallback);
  }
  
  function bet(matchid, scores, successCallback, errorCallback) {
    var params = {
        sa: scores.score_a,
        sb: scores.score_b
    };
    if (!angular.isUndefined(scores.extra_a) && !angular.isUndefined(scores.extra_b)) {
      params.ea = scores.extra_a;
      params.eb = scores.extra_b;
    }
    $http({url: WorldCupApp.getRoot() + '/bet/' + matchid + '?' + $.param(params), method:'GET'}).success(successCallback).error(errorCallback);
  }
  
  function acceptEula(successCallback, errorCallback) {
    if (!!WorldCupApp.user_nickname) {
      $http({url: WorldCupApp.getRoot() + '/eula', method:'GET'}).success(successCallback).error(errorCallback);
    }
    $cookies.gwEulaStatus = 'true';
  }

  function hasAcceptedEula() {
    if (!!WorldCupApp.user_nickname) {
      if (angular.equals($cookies.gwEulaStatus, 'true') && !angular.equals(WorldCupApp.eula_accepted, 'true')) {
        acceptEula();
      } else if (!angular.equals($cookies.gwEulaStatus, 'true') && angular.equals(WorldCupApp.eula_accepted, 'true')) {
        acceptEula();
      }
    }
    return angular.equals($cookies.gwEulaStatus, 'true') || angular.equals(WorldCupApp.eula_accepted, 'true')
  }

  function bettable(match) {
    var date = moment.unix(match.date/1000);
    var now = moment().utc();
    return now.isBefore(date.subtract('minutes', 10));
  }

  function listDonate(successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + '/donate_list', method:'GET'}).success(successCallback).error(errorCallback);
  }

  function donate(donate_param, successCallback, errorCallback) {
    $http({url: WorldCupApp.getRoot() + '/donate' + '?' + $.param(donate_param), method:'GET'}).success(successCallback).error(errorCallback);
  }
  

  return {
    listAll: listAll,
    listAllByDate: listAllByDate,
    listA: listA,
    mybets: mybets,
    bet: bet,
    report: report,
    popularity: popularity,
    bettable: bettable,
    bestbet: bestbet,
    acceptEula: acceptEula,
    hasAcceptedEula: hasAcceptedEula,
    listDonate:listDonate,
    listDonateEmailOnly:listDonateEmailOnly,
    donate:donate
  };
}]);