'use strict';

WorldCupApp.getModule().directive('gwChartleast', ['Miner', function(Miner) {
  var colors = WorldCupApp.getColors();
  var options = {
    animation: false,
    scaleShowGridLines: false
  };

  var top = 3;

  function getFavTeams(bets) {
    var teams = bets.reduce(function(prev, bet) {
      var both = Miner.getBothTeams(bet);
      return Miner.mergeTeams(prev, both);
    }, []);

    return teams.sort(Miner.getComparitorByLeastRate).slice(0, top);
  }

  function convert(teams) {
    var data = teams.map(function(t) {
      return t.leastRate;
    });
    var labels = teams.map(function(t) {
      return t.team.substr(0, 3).toUpperCase();
    });
    return {
      labels: labels,
      datasets: [{
        fillColor: colors.wrong,
        strokeColor: colors.white,
        data: data
      }]
    };
  }
  return {
    restrict: 'E',
    scope: {
      bets: '=gwBets'
    },
    templateUrl: 'js/directive/chartleast.tpl.html',
    link: function(scope, elem, attrs) {
      scope.$watch('bets', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        var ctx = document.getElementById("gwChartLeast").getContext("2d");
        var data = convert(getFavTeams(newVal));
        var chart = new Chart(ctx).Bar(data, options);
      });
    }
  };
}]);
