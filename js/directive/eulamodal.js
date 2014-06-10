'use strict';

WorldCupApp.getModule().directive('gwEulamodal', ['$location', '$cookies', 'Guesser', function($location, $cookies, Guesser) {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'js/directive/eulamodal.tpl.html',
    link: function(scope, elem, attrs) {
      scope.accept = function() {
        $cookies.gwEulaStatus = 'true';
        $('#eulaModal').modal('hide');
      };
      scope.deny = function() {
        $cookies.gwEulaStatus = 'deny';
        location.replace("http://apps.leg.wa.gov/rcw/default.aspx?cite=9.46.240");
      };
      scope.readThrough = false;
      $('#eula-content').bind('scroll', function() {
        if (!scope.readThrough) {
          if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
            scope.readThrough = true;
            scope.$digest();
          }
        }
      });
    }
  };
}]);