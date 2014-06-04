'use strict';

WorldCupApp.getModule().directive('gwBetmodal', ['Guesser', function(Guesser) {
  return {
    restrict: 'E',
    scope: {
      matchref: '=gwMatchref',
      bet: '=gwBet'
    },
    templateUrl: 'js/directive/betmodal.tpl.html',
    link: function(scope, elem, attrs) {
      scope.$watchCollection('bet', function(newVal, oldVal){
        if (angular.isUndefined(newVal)) return;
        scope.disableSave = !$.trim(newVal.score_a) || !$.trim(newVal.score_b);
      });
      scope.save = function() {
        scope.disableSave = true;
        Guesser.bet(scope.matchref.matchid, scope.bet, function(data){
          // refresh the bets in parent scope
          scope.matchref.bet = data;
          // Enable the button - we will use the modal next time
          scope.disableSave = false;
          $('#betModal').modal('hide');
        });
        
      }
    }
  };
}]);