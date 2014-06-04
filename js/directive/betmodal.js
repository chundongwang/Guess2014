'use strict';

WorldCupApp.getModule().directive('gwBetmodal', function() {
  return {
    restrict: 'E',
    scope: {
      match: '=gwMatch',
      guess: '=gwGuess',
      guessref: '=gwGuessref'
    },
    templateUrl: 'js/directive/betmodal.tpl.html',
    link: function(scope, elem, attrs) {
      scope.save = function() {
        var guess_a = scope.guess.guess_a;
        var guess_b = scope.guess.guess_b;
        var mid = scope.match.matchid;
        
        // TODO: call backend to save the bet
        console.log(mid, guess_a, guess_b);
        
        // refresh the guesses
        scope.guessref.guess_a = guess_a;
        scope.guessref.guess_b = guess_b;

        $('#betModal').modal('hide');
      }
    }
  };
});