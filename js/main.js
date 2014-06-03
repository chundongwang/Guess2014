var WorldCupApp = (function() {
  var name = 'WorldCupApp';
  var module = angular.module(name, ['ngRoute', 'ngResource']);
  //var root = 'http://localhost:8080';
  var root = '';
  return {
    getModule: function() {
      return module;
    },
    getRoot: function() {
      return root;
    }
  };
})();

WorldCupApp.getModule().config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'js/view/home.tpl.html',
    controller: 'HomeCtrl'
  }).when('/group', {
    templateUrl: 'js/view/group.tpl.html',
    controller: 'GroupCtrl'
  }).otherwise({
    redirectTo: '/home'
  });
}]);