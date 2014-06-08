'use strict';

WorldCupApp.getModule().directive('gwMatchdiv',
  ["$location", function($location) {
  return {
    restrict: 'E',
    scope: {
      match: '=gwMatch',
      showNationName: '=gwShownationname'
    },
    templateUrl: 'js/directive/matchdiv.tpl.html',
    link: function (scope, elem, attr) {
    }
  };
}]);