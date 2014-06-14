'use strict';

WorldCupApp.getModule().directive('gwCharttopbet', ['Miner', function(Miner) {
  var colors = WorldCupApp.getColors();
  var options = {
    animation: true,
    scaleShowGridLines: false,
    scaleOverride: true,
    scaleSteps: 0,
    scaleStepWidth: 2,
    scaleStartValue: 0
  };
  var top = 5;
  var maxScore = 0;
  var use_points = false;

  function convert(betscores) {
    var labels = [];
    var data = [];
    var limit = betscores.length > top ? top : betscores.length;
    for (var i = 0 ; i < limit ; i++) {
      var n = betscores[i][0];
      var s = use_points?betscores[i][1].points:betscores[i][1].rightAboutScore;
      labels.push(n.indexOf('@')>0?n.substr(0,n.indexOf('@')):n);
      data.push(s);
      if (s>maxScore){
        maxScore = s;
      }
    }
    return {
      labels: labels,
      datasets: [{
        fillColor: colors.success,
        strokeColor: colors.white,
        data: data
      }]
    };
  }
  return {
    restrict: 'E',
    scope: {
      betscores: '=gwBetscores'
    },
    template: '<h5><strong>最佳竞猜</strong></h5><canvas id="gwChartTopBet" width="200" height="200"></canvas>',
    link: function(scope, elem, attrs) {
      scope.$watch('betscores', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        use_points = !!newVal[0][1].points;

        var ctx = document.getElementById("gwChartTopBet").getContext("2d");
        var data = convert(newVal);
        if (use_points) {
          options.scaleStepWidth = maxScore / 5;
        }
        options.scaleSteps = Math.ceil(maxScore * 1.0 / options.scaleStepWidth);
        var chart = new Chart(ctx).Bar(data, options);
      });
    }
  };
}]);
