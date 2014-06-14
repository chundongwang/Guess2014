'use strict';

WorldCupApp.getModule().directive('gwChartbetmatchdist', ['Miner', function(Miner) {
  var colors = WorldCupApp.getColors();
  var team_name = {team_a:'team_a',team_b:'team_b'};
  var options = {
    animation: true,
    segmentStrokeWidth: 1
  };
  function categroize(betscores) {
    var data = betscores.reduce(function(prev, betscore) {
      var rightAboutWin = betscore[1].rightAboutWin;
      if (!prev[rightAboutWin]) {
        prev[rightAboutWin] = 1;
      } else {
        prev[rightAboutWin]++;
      }
      return prev;
    }, []);

    return data;
  }
  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  function convert(betscores) {
    var legends = [];
    var data = [];
    for (var i = 0 ; i < betscores.length ; i++) {
      if(!!betscores[i]) {
        var c = getRandomColor();
        legends.push({color:c,text:'猜中'+i+'场'});
        data.push({color:c,value:betscores[i]});
      }
    }
    if (legends.length == 0) {
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
      betscores: '=gwBetscores'
    },
    templateUrl: 'js/directive/chartbetmatchdist.tpl.html',
    link: function(scope, elem, attrs) {
      scope.$watch('betscores', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        var ctx = document.getElementById("gwChartBetMatchDist").getContext("2d");
        var dataset = convert(categroize(newVal));
        var chart = new Chart(ctx).Doughnut(dataset.data, options);

        scope.legends = dataset.legends;
      });
    }
  };
}]);
