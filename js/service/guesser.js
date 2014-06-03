'use strict';

WorldCupApp.getModule().factory("Guesser", ['$resource', function($resource) {
  var Guesser = $resource(WorldCupApp.getRoot() + '/list', {}, {
    listAll: {
      method: 'GET',
      isArray: true,
      intercepter: {
        responseError: function(resp) {
          errorHandler(resp);
        }
      }
    }
  });

  function errorHandler(resp) {
    console.debug(resp)
    if (resp.status === 302) {
      $location.url(resp.location)
    } else {
      // TODO: Show error message
      console.error('gw-error:' + resp);
    }
  }

  return {
    listAll: function(callback) {
      var data = Guesser.listAll({}, function() {
        callback(data);
      });
    }
  };
}]);