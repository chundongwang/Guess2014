'use strict';

WorldCupApp.getModule().factory("Guesser", ['$resource', '$window', function($resource, $window) {
  var Guesser = $resource(WorldCupApp.getRoot() + '/list', {}, {
    listAll: {
      method: 'GET',
      isArray: true,
      interceptor: {
        responseError: function (resp) {
          if (resp.status == 401)
            $window.location.href = resp.headers().loginurl;
        }
      }
    }
  });

  return {
    listAll: function(callback) {
      var data = Guesser.listAll({}, function() {
        callback(data);
      });
    }
  };
}]);