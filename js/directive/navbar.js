'use strict';

WorldCupApp.getModule().directive('gwNavbar', ['$location', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'js/directive/navbar.tpl.html',
    link: function(scope, elem, attr) {
      scope.path = $location.path();
      scope.loginInfo = {
        nickName:WorldCupApp.user_nickname, 
        loginUrl:WorldCupApp.login_url
      };
    }
  };
}]);