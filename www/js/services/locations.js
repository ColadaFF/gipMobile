(function () {
   "use strict";
   var ngModule = angular.module('sigip');
   ngModule.factory("locationServices", function ($program_locations, COUCHDB_URL, $log, async, $q, listServices, _) {


      function getLocations() {
         return $program_locations.allDocs({
            include_docs: true
         });
      }

      function getLocationsBasicData() {
         var deferred = $q.defer(),
            locationCollection = [];

         function map(doc) {

            emit(doc._id, {
               _id: doc._id,
               sits: doc.sits,
               location: doc.location,
               program: doc.program,
               status: doc.status
            });
         }

         $program_locations.query(map)
            .then(function (data) {
               console.log(data);
               async.each(data.rows, function (location, cb) {
                  listServices.getListValueById(_.get(location, 'value.location'))
                     .then(function (listValue) {
                        var mergedDoc = _.set(_.get(location, 'value'), 'location', listValue);
                        locationCollection.push(mergedDoc);
                        cb();
                     })
                     .catch(cb)
               }, function (err) {
                  if (err) {
                     deferred.reject(err);
                  } else {
                     deferred.resolve(locationCollection);
                  }
               });
            })
            .catch(function (reason) {
               deferred.reject(reason);
            });
         return deferred.promise;
      }

      function syncAllLocations() {
         $program_locations.sync(COUCHDB_URL + "/sigip_locations", {
            live: true,
            retry: true
         });
      }

      return {
         getLocations: getLocations,
         getLocationsBasicData: getLocationsBasicData,
         syncAllLocations: syncAllLocations
      };
   });
}());
