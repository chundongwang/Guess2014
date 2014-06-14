'use strict';

WorldCupApp.getModule().directive('gwFooter', function() {
  return {
    restrict: 'E',
    template: '<hr><footer><p class="text-muted">&copy; Guess 2014 | <a href="https://github.com/chundongwang/Guess2014">Github</a></p></footer>'
  };
});