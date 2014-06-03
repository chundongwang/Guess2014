'use strict';

WorldCupApp.getModule().directive('gwNavbar', function() {
  return {
    restrict: 'E',
    scope: {
      loginInfo: '=gwLogin'
    },
    templateUrl: 'js/directive/navbar.tpl.html',
    link: function(scope, elem, attr) {
      //do nothing
    }
  };
});