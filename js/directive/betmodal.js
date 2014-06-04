'use strict';

WorldCupApp.getModule().directive('gwBetmodal', ['Guesser', function(Guesser) {
  return {
    restrict: 'E',
    scope: {
      match: '=gwMatch',
      bet: '=gwBet',
      betref: '=gwBetref'
    },
    templateUrl: 'js/directive/betmodal.tpl.html',
    link: function(scope, elem, attrs) {
      scope.save = function() {
        
        Guesser.bet(scope.match.matchid, scope.bet, function(data){
          //TODO change the button status
        });
        
        // refresh the bets
        scope.betref.score_a = scope.bet.score_a;
        scope.betref.score_b = scope.bet.score_b;

        $('#betModal').modal('hide');
      }
    }
  };
}]);