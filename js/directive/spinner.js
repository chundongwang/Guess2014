'use strict';

WorldCupApp.getModule().directive('gwSpinner', function() {
  return {
  	restrict: 'E',
    scope: {
      show: '=gwShow'
    },
  	template: '<div ng-if="show" class="text-center"><i alt="" class="ico-large glyphicon glyphicon-refresh spin"></i><p>加载中</p></div>'
  };
});
