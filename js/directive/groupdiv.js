'use strict';

WorldCupApp.getModule().directive('gwGroupdiv',
  ["$location", function($location) {
  return {
    restrict: 'E',
    scope: {
      matches: '=gwMatches'
    },
    templateUrl: 'js/directive/groupdiv.tpl.html',
    link: function (scope, elem, attr) {
      scope.jumpToBet = function (m) {
        $location.path('/group')
                 .search('stage',m.stage)
                 .search('bet',m.matchid);
      }
    }
  };
}]);