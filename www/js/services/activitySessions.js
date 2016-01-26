(function () {
   "use strict";
   function sessionServices($sessions, COUCHDB_URL, $log) {
      function getSession(sessionId) {
         return $sessions.get(sessionId);
      }

      function syncSessions(){
         return $sessions.sync(COUCHDB_URL + "/sigip_sessions", {
            live: true,
            retry: true
         }).on('change', function (info) {
               $log.info(info);
            })
            .on('complete', function (info) {
               $log.info(info);
            }).on('error', function (err) {
               $log.error(err);
            });
      }

      return {
         syncSessions: syncSessions,
         getSession: getSession
      }
   }

   sessionServices.$inject = ['$sessions', "COUCHDB_URL", '$log'];
   angular.module('sigip').factory('sessionServices', sessionServices)
}());
