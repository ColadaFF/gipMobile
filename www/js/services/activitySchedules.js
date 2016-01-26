(function () {
   "use strict";
   function activitySchedules($activitySchedule, COUCHDB_URL, $log) {

      function findByActivity(idReference) {
         return $activitySchedule
            .find({
               selector: {
                  _id: idReference
               }
            })
      }

      function syncActivities(){
         return $activitySchedule.sync(COUCHDB_URL + "/sigip_activity_schedule", {
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
         findByActivity: findByActivity,
         syncActivities: syncActivities
      }

   }

   activitySchedules.$inject = ["$activitySchedule", "COUCHDB_URL", "$log"];

   var ngModule = angular.module('sigip');
   ngModule.factory('activitySchedules', activitySchedules);
}());
