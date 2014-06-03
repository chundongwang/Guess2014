'use strict';

WorldCupApp.getModule().factory("Guesser", [ '$resource', function($resouce) {
  var Guesser = $resource('/list', {}, {
    listAll : {
      method : 'GET',
      intercepter : {
        responseError : function(err) {
          // do nothing for now
        }
      }
    }
  });
  
  var listAll = function(callback) {
    var data = Guesser.$listAll({}, function() {
      callback(data);
    });
  };
  
  return {
    listAll: listAll
  };
} ]);