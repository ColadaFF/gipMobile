(function () {
   "use strict";
   function attendanceServices($attendance, COUCHDB_URL, $log) {
      function getAttendanceBySession(sessionId) {
         return $attendance.find({
            selector: {
               session: sessionId
            },
            limit: 1
         });
      }

      function syncAttendances() {
         return $attendance.sync(COUCHDB_URL + "/sigip_attendances", {
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
         syncAttendances: syncAttendances,
         getAttendanceBySession: getAttendanceBySession
      }
   }

   attendanceServices.$inject = ['$attendance', "COUCHDB_URL", '$log'];
   angular.module('sigip').factory('attendanceServices', attendanceServices)
}());
