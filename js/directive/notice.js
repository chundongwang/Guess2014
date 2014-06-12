'use strict';

WorldCupApp.getModule().directive('gwNotice', function() {
  return {
    restrict: 'E',
    template: '<div class="alert alert-info alert-dismissable">' +
        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
    	'<strong>温馨提示: </strong>赛前10分钟，竞猜通道关闭。' +
      '</div>'
  };
});