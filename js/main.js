var WorldCupApp = (function() {
  var name = 'WorldCupApp';
  var module = angular.module(name, ['ngRoute', 'ngAnimate', 'ngCookies']);
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
  }).when('/my', {
    templateUrl: 'js/view/my.tpl.html',
    controller: 'MyCtrl'
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
/*
http://guessworldcup2014.appspot.com/ => 769411229766097
http://localhost:8080/ => 769462413094312
*/
window.fbAsyncInit = function() {
  FB.init({
    appId      : '769411229766097',
    xfbml      : true,
    version    : 'v2.0'
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));