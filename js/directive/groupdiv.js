'use strict';

WorldCupApp.getModule().directive('gwGroupdiv',
  ["$location", function($location) {
  return {
    restrict: 'E',
    scope: {
      matches: '=gwMatches',
      onMatchClick: '=gwOnmatchclick'
    },
    templateUrl: 'js/directive/groupdiv.tpl.html',
    link: function (scope, elem, attr) {
    }
  };
}]);