'use strict';

WorldCupApp.getModule().directive('gwGroupdiv', function() {
  return {
    restrict: 'E',
    scope: '=gwGid',
    templateUrl: 'js/directive/groupdiv.tpl.html',
    link: function (scope, elem, attr) {
      //do nothing
    }
  };
});