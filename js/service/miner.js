'use strict';

WorldCupApp.getModule().factory('Miner', [function() {
  /*
   * actual and guess are of object with points of both team a and b, e.g. {a:2, b:1} 
   */
  function rightAboutWinner(actual, guess) {
    var rightAboutDraw = actual.a == actual.b && guess.a == guess.b;
    var rightOtherwise = (actual.a - actual.b) * (guess.a - guess.b) > 0;
    return rightAboutDraw || rightOtherwise;
  }
  function rightAboutScore(actual, guess) {
    return actual.a == guess.a && actual.b == guess.b;
  }
  /*
   * bet is the bet object which has a field of the match object it associated with.
   */
  function hasScores(bet) {
    return bet.match.score_a != null && bet.match.score_b != null;
  }

  return {
    rightAboutWinner: rightAboutWinner,
    rightAboutScore: rightAboutScore,
    hasScores: hasScores
  };
}]);