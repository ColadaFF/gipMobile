angular.module('sigip').factory('loginFactory', function ($resource, API_URL, $window) {
   return {
      login: function (data) {
         return $resource(
            API_URL + '/users/auth',
            {},
            {
               authenticate: {
                  method: 'POST',
                  headers: {
                     Authorization: 'Bearer ' + $window.btoa(JSON.stringify(data))
                  }
               }
            }
         );
      },
      "getUserInfo": function (token) {
         return $resource(
            API_URL + "/users/jwt",
            {},
            {
               "info": {
                  "method": "GET",
                  "headers": {
                     Authorization: 'Bearer ' + token
                  }
               }
            }
         );
      }
   };
});
