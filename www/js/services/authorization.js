var ngModule = angular.module('sigip');
ngModule.factory("AuthTokenFactory", function ($window) {
   const store = $window.localStorage;
   const TOKEN_KEY = "AUTH_KEY";

   function setToken(token) {
      if (token) {
         store.setItem(TOKEN_KEY, token);
      } else {
         store.removeItem(TOKEN_KEY);
      }
   }

   function getToken() {
      return store.getItem(TOKEN_KEY);
   }

   return {
      getToken: getToken,
      setToken: setToken
   };
});

ngModule.factory("AuthInterceptor", function (AuthTokenFactory) {
   function addAuthToken(config) {
      var token = AuthTokenFactory.getToken();
      if (token) {
         config.headers = config.headers || {};
         config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
   }

   return {
      request: addAuthToken
   };
});
