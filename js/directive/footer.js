'use strict';

WorldCupApp.getModule().directive('gwFooter', function() {
  return {
    restrict: 'E',
    template: '<hr><footer><p>&copy; Guess 2014</p></footer>'
  };
});