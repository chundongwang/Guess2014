var WorldCupApp = (function() {
  var name = 'WorldCupApp';
  var module = angular.module(name, [ 'ngRoute', 'ngResource' ]);
  return {
    getModule : function() {
      return module;
    }
  };
})();

WorldCupApp.getModule().config([ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl : 'js/view/home.tpl.html',
    controller : 'HomeCtrl'
  }).when('/groups', {
    templateUrl : 'js/view/groups.tpl.html',
    controller : 'GroupCtrl'
  }).otherwise({
    redirectTo : '/home'
  });
} ]);