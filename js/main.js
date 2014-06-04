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

WorldCupApp.getModule()
.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  // Config routing
  $routeProvider.when('/home', {
    templateUrl: 'js/view/home.tpl.html',
    controller: 'HomeCtrl'
  }).when('/group', {
    templateUrl: 'js/view/group.tpl.html',
    controller: 'GroupCtrl'
  }).otherwise({
    redirectTo: '/home'
  });
  
  // Inject sign-in interceptor
  $httpProvider.interceptors.push(function(){
    return {
      'responseError': function(rejection) {
        if (rejection.status === 401) {
          window.location.href = rejection.headers().loginurl;
          return;
        }
        return rejection;
      }
    }
  });
}]);