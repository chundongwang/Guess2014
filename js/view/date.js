'use strict';

WorldCupApp.getModule().controller('DateCtrl', ['$scope', '$location', '$anchorScroll', 'Guesser', function($scope, $location, $anchorScroll, Guesser) {
  $scope.loaded = false;

  // generate dates from 6/12 to 7/13
  $scope.dates = generateDates("2014-06-11", 32);

  function generateDates(startDate, days) {
    var dates = [];
    var current = moment(startDate);
    for (var i = 0; i < days; i++) {
      var monthDay = current.add('d', 1).format('M/D');

      dates.push({
        monthDay: monthDay,
        className: moment().format('M/D') == monthDay ? 'btn-info' : ''
      });
    }
    return dates;
  }
  
  $scope.scrollTo = function(monthDay) {
    var date = moment('2014/'+monthDay, 'YYYY/M/D').format('YYYY年M月D日');
    $('div[ng-repeat="group in groups"]').toArray().some(function(e){
      var ele = $(e);
      if ($(e).find('strong').text() == date) {
        $('body').animate({scrollTop: ele.offset().top - 60}, 800);
        return true;
      }
      return false;
    })
  };

  $scope.scrollUp = function() {
    $('body').animate({scrollTop: 0}, 500);
  };

  function updateAll() {
    Guesser.listAllByDate(function(groups) {
      $scope.loaded = true;
      $scope.showEulaModal();
      
      // Retrieve bets if the user is logged in
      if ($scope.loggedIn) {
        $scope.packMyBets(groups);
      }
      $scope.groups = groups;
    });
  }

  updateAll();
}]);  