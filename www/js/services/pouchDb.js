(function () {
   "use strict";
   var ngModule = angular.module("sigip");
   ngModule.factory("$program_locations", function (pouchDB, COUCHDB_URL) {
      var locationDB = pouchDB('locations');
      return locationDB;
   });
   ngModule.factory("$location_participants", function (pouchDB, COUCHDB_URL) {
      var participantDB = pouchDB('participants');
      participantDB.createIndex({
         index: {
            fields: ['programLocation']
         }
      }).then(result => {
         console.log("Created index for participants", result);
      }).catch(err => {
         console.log("Error creating index for participants", err);
      });
      return participantDB;
   });
   ngModule.factory("$contacts", function (pouchDB, COUCHDB_URL) {
      return pouchDB('contacts');
   });
   ngModule.factory("$lists", function (pouchDB, async) {
      var listsDB = pouchDB('lists');
      listsDB.createIndex({
         index: {
            fields: ['name', 'key', 'value']
         }
      }).then(result => {
         console.log("Created index for lists", result);
      }).catch(err => {
         console.log("Error creating index for lists", err);
      });
      return listsDB;
   });
   ngModule.factory("$user", function (pouchDB) {
      return pouchDB('users');
   });
}());
