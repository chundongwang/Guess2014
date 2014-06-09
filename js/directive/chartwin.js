'use strict';

WorldCupApp.getModule().directive('gwChartwin', [function() {
  var colors = WorldCupApp.getColors();
  var options = {
    animation: false
  };
  function getWinHalfLoss(bets) {
    function rightAboutWinner(actual, guess) {
      var rightAboutDraw = actual.a == actual.b && guess.a == guess.b;
      var rightOtherwise = (actual.a - actual.b) * (guess.a - guess.b) > 0;
      return rightAboutDraw || rightOtherwise;
    }
    function rightAboutScore(actual, guess) {
      return actual.a == guess.a && actual.b == guess.b;
    }
    function hasScores(bet) {
      return bet.match.score_a != null && bet.match.score_b != null;
    }
    var data = bets.filter(hasScores).reduce(function(prev, bet) {
      var result = {
        win: 0,
        half: 0,
        loss: 0
      };
      var actualScores = {
        a: bet.match.score_a,
        b: bet.match.score_b
      };
      var guessScores = {
        a: bet.score_a,
        b: bet.score_b
      };
      if (rightAboutScore(actualScores, guessScores)) {
        result.win = 1;
      } else if (rightAboutWinner(actualScores, guessScores)) {
        result.half = 1;
      } else {
        result.loss = 1;
      }
      return {
        win: prev.win + result.win,
        half: prev.half + result.half,
        loss: prev.loss + result.loss
      };
    }, {
      win: 0,
      half: 0,
      loss: 0
    });

    return data;
  }
  function convert(winHalfLost) {
    var all = winHalfLost.win + winHalfLost.half + winHalfLost.loss;
    var data, legends;
    if (all != 0) {
      legends = [{
        color: colors.green,
        text: '猜对比分'
      }, {
        color: colors.orange,
        text: '猜对胜负'
      }, {
        color: colors.grey,
        text: '猜错'
      }];
      data = [{
        value: winHalfLost.win / all * 100,
        color: legends[0].color
      }, {
        value: winHalfLost.half / all * 100,
        color: legends[1].color
      }, {
        value: winHalfLost.loss / all * 100,
        color: legends[2].color
      }];
    } else {
      legends = [{
        color: colors.grey,
        text: '尚未比赛'
      }];
      data = [{
        value: 100,
        color: legends[0].color
      }];
    }
    return {
      legends: legends,
      data: data
    };
  }
  return {
    restrict: 'E',
    scope: {
      bets: '=gwBets'
    },
    templateUrl: 'js/directive/chartwin.tpl.html',
    link: function(scope, elem, attrs) {
      scope.$watch('bets', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        var ctx = document.getElementById("gwChartWin").getContext("2d");
        var dataset = convert(getWinHalfLoss(newVal));
        var chart = new Chart(ctx).Pie(dataset.data, options);

        scope.legends = dataset.legends;
      });
    }
  };
}]);
