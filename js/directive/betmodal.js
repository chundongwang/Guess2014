'use strict';

WorldCupApp.getModule().directive('gwBetmodal', ['$location', 'Guesser', function($location, Guesser) {
  return {
    restrict: 'E',
    scope: {
      matchref: '=gwMatchref',
      bet: '=gwBet'
    },
    templateUrl: 'js/directive/betmodal.tpl.html',
    link: function(scope, elem, attrs) {
      scope.$watchCollection('bet', function(newVal, oldVal) {
        if (angular.isUndefined(newVal)) return;
        scope.disableSave = !$.trim(newVal.score_a) || !$.trim(newVal.score_b);
      });
      scope.save = function(share_func) {
        scope.disableSave = true;
        Guesser.bet(scope.matchref.matchid, scope.bet, function(data){
          // refresh the bets in parent scope
          scope.matchref.bet = data;
          // Enable the button - we will use the modal next time
          scope.disableSave = false;
          $('#betModal').modal('hide');
        });
        if (!!share_func) share_func();
      };
      scope.share = function() {
        scope.save(function() {
          FB.ui(
            {
             method: 'feed',
             name: 'My Prediction of ' + 
                scope.matchref.team_a + ' vs ' + scope.matchref.team_b +
                " is " + scope.bet.score_a + ' : ' + scope.bet.score_b + '!',
             caption: 'Guess The WorldCup 2014',
             description: (
                'Guess the score always make it fun. Now with WorldCup ' + 
                '2014 coming, why not join me and put down your predition ' + 
                'of a match ahead of time? '
             ),
             link: $location.absUrl(),
             /*picture: 'http://guessworldcup2014.appspot.com/img/2014-world-cup-background.jpg'*/             
             picture:  $location.protocol() + "://" + $location.host() + 
                ($location.port() && ":" + $location.port()) +
                '/img/2014-world-cup-background.jpg'

            },
            function(response) {
             /*
              if (response && response.post_id) {
                alert('Post was published.');
              } else {
                alert('Post was not published.');
              }
                */
            }
          )}
        );
      };
    }
  };
}]);