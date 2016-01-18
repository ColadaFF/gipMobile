(function () {
   "use strict";
   var ngModule = angular.module('sigip');
   ngModule.factory("locationServices", function($program_locations) {
      function getLocations() {
         return $program_locations.allDocs({
            include_docs: true
         });
      }

      function getLocationsBasicData() {
         function map(doc) {

            emit({
               _id: doc._id,
               sits: doc.sits,
               location: doc.location,
               program: doc.program,
               status: doc.status
            });
         }

         return $program_locations.query(map);
      }

      return {
         getLocations: getLocations,
         getLocationsBasicData: getLocationsBasicData
      };
   });
}());
