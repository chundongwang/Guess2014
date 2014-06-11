'use strict';

WorldCupApp.getModule().directive('gwChartallbets', ['Miner', function(Miner) {
  var colors = WorldCupApp.getColors();
  var team_name = {team_a:'team_a',team_b:'team_b'};
  var options = {
    animation: true,
    segmentStrokeWidth: 1
  };
  function getABorDraw(bets) {
    var data = bets.reduce(function(prev, bet) {
      var result = {
        team_a: 0,
        team_b: 0,
        draw: 0
      };
      if (bet.score_a > bet.score_b) {
        result.team_a = 1;
      } else if (bet.score_b > bet.score_a) {
        result.team_b = 1;
      } else {
        result.draw = 1;
      }
      return {
        team_a: prev.team_a + result.team_a,
        team_b: prev.team_b + result.team_b,
        draw: prev.draw + result.draw
      };
    }, {
      team_a: 0,
      team_b: 0,
      draw: 0
    });

    return data;
  }
  function convert(ABorDraw) {
    var all = ABorDraw.team_a + ABorDraw.team_b + ABorDraw.draw;
    var data, legends;
    if (all != 0) {
      legends = [{
        color: colors.success,
        text: '猜'+team_name.team_a+'胜'
      }, {
        color: colors.wrong,
        text: '猜'+team_name.team_b+'胜'
      }, {
        color: colors.okay,
        text: '猜平局'
      }];
      data = [{
        value: ABorDraw.team_a / all * 100,
        color: legends[0].color
      }, {
        value: ABorDraw.team_b / all * 100,
        color: legends[1].color
      }, {
        value: ABorDraw.draw / all * 100,
        color: legends[2].color
      }];
    } else {
      legends = [{
        color: colors.grey,
        text: '无人预测'
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
    templateUrl: 'js/directive/chartallbets.tpl.html',
    link: function(scope, elem, attrs) {
      scope.$watch('bets', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        team_name.team_a = newVal[0].match.team_a;
        team_name.team_b = newVal[0].match.team_b;

        var ctx = document.getElementById("gwChartAllBets").getContext("2d");
        var dataset = convert(getABorDraw(newVal));
        var chart = new Chart(ctx).Pie(dataset.data, options);

        scope.legends = dataset.legends;
      });
    }
  };
}]);
