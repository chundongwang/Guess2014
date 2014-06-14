'use strict';

WorldCupApp.getModule().factory('Miner', [function() {
  /*
   * actual and guess are of object with points of both team a and b, e.g. {a:2,
   * b:1}
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
   * bet is the bet object which has a field of the match object it associated
   * with.
   */
  function hasScores(bet) {
    return bet.match.score_a != null && bet.match.score_b != null;
  }
  /*
   * Extract teams with there winDrawLose out of the bet, e.g. { spain: {win: 1,
   * draw: 0, lose: 0}, netherland: {win:0, draw:0, lose1}}
   */
  function getBothTeams(bet) {
    function createTeam(team, result) {
      return {
        team: team,
        win: result[0],
        draw: result[1],
        lose: result[2]
      };
    }
    var r1, r2;
    if (bet.score_a > bet.score_b) {
      r1 = [1, 0, 0];
      r2 = [0, 0, 1];
    } else if (bet.score_a == bet.score_b) {
      r1 = [0, 1, 0];
      r2 = [0, 1, 0];
    } else {
      r1 = [0, 0, 1];
      r2 = [1, 0, 0];
    }
    return [createTeam(bet.match.team_a, r1), createTeam(bet.match.team_b, r2)];
  }
  /*
   * t1's result is merged into t1, assuming t1 and t2 are the same team.
   */
  function mergeTeam(t1, t2) {
    t1.win += t2.win;
    t1.draw += t2.draw;
    t1.lose += t2.lose;
    return t1;
  }

  /**
   * Merge others into teams. For those new teams that exist in teams, call
   * mergeTeam for each of them; Otherwise, expand the teams with the new ones.
   */
  function mergeTeams(teams, newTeams) {
    var merged = [];
    teams.some(function(team) {
      newTeams.some(function(t) {
        if (team.team == t.team) {
          mergeTeam(team, t);
          merged.push(t);
        }
        return team.team == t.team;
      });
      return merged.length == newTeams.length;
    });

    newTeams.filter(function(t) {
      return merged.indexOf(t) == -1;
    }).map(function(t) {
      teams.push(t);
    });

    return teams;
  }

  function injectFavRate(team) {
    team.favRate = team.win * 2 + team.draw * 1;
    return team;
  }

  function injectLeastRate(team) {
    team.leastRate = team.lose * 2 + team.draw * 1;
    return team;
  }

  /*
   * Return the compare function of favorite rate to sort array of teams. Team
   * with higher favRate will comes first. The side effect of this function is
   * that it calls injectFavRate to inject 'favRate' field to t1 and t2.
   */
  function getComparitorByFavRate(t1, t2) {
    return injectFavRate(t2).favRate - injectFavRate(t1).favRate;
  }
  function getComparitorByLeastRate(t1, t2) {
    return injectLeastRate(t2).leastRate - injectLeastRate(t1).leastRate;
  }
  function rateResult(bet) {
    if (hasScores(bet)) {
      var guess = {a:bet.score_a, b:bet.score_b};
      var actual = {a:bet.match.score_a, b:bet.match.score_b}
      if (rightAboutScore(actual, guess)) {
        return 2;
      } else if (rightAboutWinner(actual, guess)) {
        return 1;
      } else {
        return 0;
      }
    }
    return -1;
  }

  return {
    rightAboutWinner: rightAboutWinner,
    rightAboutScore: rightAboutScore,
    hasScores: hasScores,
    getBothTeams: getBothTeams,
    mergeTeam: mergeTeam,
    mergeTeams: mergeTeams,
    injectFavRate: injectFavRate,
    getComparitorByFavRate: getComparitorByFavRate,
    getComparitorByLeastRate: getComparitorByLeastRate,
    rateResult: rateResult
  };
}]);