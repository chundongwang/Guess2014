'use strict';

WorldCupApp.getModule().directive('gwChartpop', ['Miner', function(Miner) {
  var colors = WorldCupApp.getColors();
  var options = {
    animation: true,
    scaleShowGridLines: false,
    scaleOverride: true,
    scaleSteps: 0,
    scaleStepWidth: 5,
    scaleStartValue: 0
  };

  function convert(pop_result) {
    return {
      labels: [pop_result.match.team_a,pop_result.match.team_b],
      datasets: [{
        fillColor: colors.success,
        strokeColor: colors.white,
        data: [pop_result.team_a,pop_result.team_b]
      }]
    };
  }
  return {
    restrict: 'E',
    scope: {
      pops: '=gwPops'
    },
    template: '<h5><strong>人气对比</strong></h5><canvas id="gwChartPop" width="200" height="200"></canvas>',
    link: function(scope, elem, attrs) {
      scope.$watch('pops', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        var ctx = document.getElementById("gwChartPop").getContext("2d");
        var data = convert(newVal);
        options.scaleSteps = Math.ceil(Math.max(newVal.team_a, newVal.team_b) * 1.0 / options.scaleStepWidth);
        var chart = new Chart(ctx).Bar(data, options);
      });
    }
  };
}]);
