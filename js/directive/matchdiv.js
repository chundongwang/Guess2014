'use strict';

WorldCupApp.getModule().directive('gwMatchdiv',
  ["$location", function($location) {
  return {
    restrict: 'E',
    scope: {
      match: '=gwMatch',
      showNationName: '=gwShownationname',
      showScore: '=gwShowscore'
    },
    templateUrl: 'js/directive/matchdiv.tpl.html',
    link: function (scope, elem, attr) {
      scope.hasScore = function() {
        // don't show score if no nation names showed as
        // there might be no available space for score digits
        if (!scope.match || !scope.showScore) return false;
        return !!$.trim(scope.match.score_a) && !!$.trim(scope.match.score_b);
      };
    }
  };
}]);