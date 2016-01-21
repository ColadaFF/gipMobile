(function () {
      "use strict";
      var ngModule = angular.module('sigip');
      ngModule.factory("listServices", function ($lists, COUCHDB_URL, $log) {

         function getLocations() {
            return $lists.allDocs({
               include_docs: true
            });
         }

         function getListValues(name) {
            return $lists.find({
               selector: {name: name}
            });
         }

         function getListValueById(_id) {
            return $lists.get(_id);
         }

         function syncAllLocations() {
            return $lists.sync(COUCHDB_URL + "/sigip_lists", {
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
            getLists: getLocations,
            getListValues: getListValues,
            syncAllLocations: syncAllLocations,
            getListValueById: getListValueById
         };
      });
   }());
